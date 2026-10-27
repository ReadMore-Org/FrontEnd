import { ref } from "vue";
import { loadBookRatings, markBookRatingsUnavailable } from "@/services/bookRatings";
import { buildSearchSources, buildTitleFallbackSources, matchesSearchFilters, mergeSearchBooks, sortSearchBooks } from "@/utils/bookSearch";
import { defineStore } from "pinia";

import axios from "axios";
import { googleBookToLivro } from "@/utils/googleBooksAdapter";

import {
  searchBooks,
  searchBookByISBN,
  getBookById,
} from "@/services/googleBooks";

// =========================
// SHUFFLE
// =========================
function shuffle(array) {
  return array
    .map((value) => ({
      value,
      sort: Math.random(),
    }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export const useGoogleBooksStore = defineStore("googleBooks", () => {
  const resultados = ref([]);
  const livroSelecionado = ref(null);

  const loading = ref(false);
  const error = ref(null);

  // =========================
  // ESTADO DA BUSCA
  // =========================
  const termoBusca = ref("");
  const idiomasSelecionados = ref([]);
  const categoriasSelecionadas = ref([]);
  const ordenacao = ref("relevance");
  const jaBuscou = ref(false);

  // O Explore não compartilha resultados/carregamento com as recomendações da Home.
  const resultadosExplore = ref([]);
  const buscandoExplore = ref(false);
  const erroExplore = ref(null);
  const avisoExplore = ref(null);
  const temMaisExplore = ref(false);
  let controllerAtual = null;
  let requestId = 0;
  let fontes = [];
  let buscaAtual = null;
  const cacheBusca = new Map();

  function cancelarBusca() {
    controllerAtual?.abort();
    requestId++;
    buscandoExplore.value = false;
  }

  let activeSearch = null;
  function pesquisarLivros(query = termoBusca.value, options = {}) {
    const key = JSON.stringify([query.trim(), idiomasSelecionados.value, categoriasSelecionadas.value, ordenacao.value, !!options.append]);
    if (activeSearch?.key === key && controllerAtual && !controllerAtual.signal.aborted) return activeSearch.promise;
    const promise = executarBusca(query, options);
    activeSearch = { key, promise };
    promise.then(() => { if (activeSearch?.promise === promise) activeSearch = null; });
    return promise;
  }

  async function executarBusca(query, { append = false, refresh = false } = {}) {
    cancelarBusca();
    const current = requestId;
    const controller = new AbortController();
    controllerAtual = controller;
    const snapshot = append ? buscaAtual : {
      term: query.trim(), languages: [...idiomasSelecionados.value], categories: [...categoriasSelecionadas.value], orderBy: ordenacao.value,
    };
    // Cada execução possui suas próprias fontes; respostas antigas não alteram paginação.
    const sources = append ? fontes.map(source => ({ ...source })) : buildSearchSources(snapshot.term, snapshot);
    if (!append) {
      resultadosExplore.value = [];
      temMaisExplore.value = false;
    }
    erroExplore.value = null;
    avisoExplore.value = null;
    if (!sources.length) {
      jaBuscou.value = false;
      return;
    }
    buscandoExplore.value = true;
    jaBuscou.value = true;
    const failures = [];
    let succeeded = 0;
    const collected = [];
    async function fetchSources(pending) {
      for (let offset = 0; offset < pending.length; offset += 3) {
        const batch = await Promise.allSettled(pending.slice(offset, offset + 3).map(async source => {
          const key = JSON.stringify([source.q, source.langRestrict, source.orderBy, source.startIndex]);
          const cached = cacheBusca.get(key);
          const data = !refresh && cached && Date.now() - cached.time < 300000
            ? cached.data : await searchBooks(source.q, { ...source, signal: controller.signal });
          if (current !== requestId) return [];
          const items = data.items ?? [];
          // Uma resposta vazia ocasional do provedor nunca bloqueia novas tentativas.
          if (items.length) {
            if (cacheBusca.size >= 40) cacheBusca.delete(cacheBusca.keys().next().value);
            cacheBusca.set(key, { data, time: Date.now() });
          }
          const books = items.filter(item => item.volumeInfo?.title).map(googleBookToLivro);
          const previousIds = new Set(resultadosExplore.value.map(book => book.id));
          source.done = items.length < 40 || (append && books.every(book => previousIds.has(book.id)));
          source.startIndex += 40;
          return books;
        }));
        if (current !== requestId) return;
        for (const result of batch) {
          if (result.status === "fulfilled") { succeeded++; collected.push(...result.value); }
          else failures.push(result.reason);
        }
        if (failures.some(err => [403, 429].includes(err.response?.status))) return;
      }
    }
    try {
      await fetchSources(sources.filter(source => !source.done));
      if (current !== requestId) return;
      if (!append && !collected.length && !failures.length) {
        // Ex.: "diario de um banana" -> intitle:diario intitle:banana.
        const fallbacks = buildTitleFallbackSources(snapshot.term, snapshot);
        if (fallbacks.length) {
          sources.push(...fallbacks);
          await fetchSources(fallbacks);
        }
      }
      if (current !== requestId) return;
      const books = mergeSearchBooks([...(append ? resultadosExplore.value : []), ...collected])
        .filter(book => matchesSearchFilters(book, snapshot.languages, snapshot.categories, { allowMissingCategories: true }));
      if (!succeeded || (!books.length && failures.length)) throw failures[0] || new Error("Busca indisponível");
      resultadosExplore.value = sortSearchBooks(books, snapshot.term, snapshot.orderBy);
      fontes = sources;
      buscaAtual = snapshot;
      temMaisExplore.value = sources.some(source => !source.done);
      if (failures.length) avisoExplore.value = "Alguns resultados não carregaram. Tente buscar novamente para completar a pesquisa.";
      // Consultar as notas locais não bloqueia nem muda o estado da busca do catálogo.
      const displayedBooks = [...resultadosExplore.value];
      loadBookRatings(displayedBooks, { signal: controller.signal }).catch(() => {
        if (current === requestId) markBookRatingsUnavailable(displayedBooks);
      });
    } catch (err) {
      if (current !== requestId || axios.isCancel(err) || err.code === "ERR_CANCELED") return;
      const status = err.response?.status;
      erroExplore.value = status === 429
        ? "O catálogo atingiu o limite de consultas. Aguarde um pouco e tente novamente."
        : status === 403
          ? "O Google Books recusou a consulta. Verifique a chave da API e as restrições de acesso."
          : "Não foi possível consultar o catálogo. Confira sua conexão e tente novamente.";
    } finally {
      if (current === requestId) buscandoExplore.value = false;
    }
  }

  async function carregarMaisExplore() {
    if (buscandoExplore.value || !temMaisExplore.value) return;
    return pesquisarLivros(buscaAtual.term, { append: true });
  }
  // =========================
  // RECOMENDADOS
  // =========================
  const CACHE_KEY_RECOMENDADOS = "recomendados_google_books_v2";
  const CACHE_KEY_TIMESTAMP = "recomendados_google_books_time_v2";
  const CACHE_EXPIRATION_MS = 12 * 60 * 60 * 1000; // 12 horas em milissegundos

  async function refreshRecommendedRatings() {
    try { await loadBookRatings(resultados.value); }
    catch { markBookRatingsUnavailable(resultados.value); }
  }

  async function buscarRecomendados(forceRefresh = false) {
    loading.value = true;
    error.value = null;

    // 1. TENTA LER DO CACHE LOCAL (se não for atualização forçada)
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(CACHE_KEY_RECOMENDADOS);
      const cachedTime = localStorage.getItem(CACHE_KEY_TIMESTAMP);

      if (cachedData && cachedTime) {
        const isExpired = Date.now() - Number(cachedTime) > CACHE_EXPIRATION_MS;

        if (!isExpired) {
          try {
            resultados.value = JSON.parse(cachedData);
            await refreshRecommendedRatings();
            loading.value = false;
            return;
          } catch (e) {
            console.warn("Erro ao ler cache:", e);
          }
        }
      }
    }

    // 2. BUSCA DA API DO GOOGLE
    try {
      const queries = [
        "inauthor:Machado de Assis",
        "inauthor:Clarice Lispector",
        "inauthor:Jorge Amado",
        "inauthor:George Orwell",
        "inauthor:J.K. Rowling",
      ];

      const responses = await Promise.all(
        queries.map((query) => searchBooks(query, { langRestrict: "pt" })),
      );

      const todosAutoresComSucesso = responses.every(
        (res) => res?.items && res.items.length > 0,
      );

      if (!todosAutoresComSucesso) {
        throw new Error("Nem todos os autores retornaram resultados.");
      }

      const allBooks = responses.flatMap((res) => res.items ?? []);

      // REMOVE DUPLICADOS
      const uniqueBooks = Array.from(
        new Map(allBooks.map((book) => [book.id, book])).values(),
      );

      // FILTRA LIVROS VÁLIDOS
      const validBooks = uniqueBooks.filter((book) => {
        const info = book.volumeInfo;
        return info?.title && info?.imageLinks?.thumbnail;
      });

      // CALCULA POPULARIDADE
      const scoredBooks = validBooks.map((book) => {
        const info = book.volumeInfo;
        const ratingsCount = info.ratingsCount ?? 0;
        const averageRating = info.averageRating ?? 0;

        const popularityScore = Math.log10(ratingsCount + 1) * 10;
        const ratingScore = averageRating * 2;

        return {
          book,
          score: popularityScore + ratingScore,
        };
      });

      const shuffledBooks = shuffle(scoredBooks);

      shuffledBooks.sort((a, b) => {
        const randomA = Math.random() * 15;
        const randomB = Math.random() * 15;
        return b.score + randomB - (a.score + randomA);
      });

      const livros = shuffledBooks
        .map(({ book }) => googleBookToLivro(book))
        .filter((livro) => livro.titulo && livro.capa);

      resultados.value = livros;
      await refreshRecommendedRatings();

      // 3. SALVA NO CACHE SE TODOS OS AUTORES CARREGARAM
      localStorage.setItem(CACHE_KEY_RECOMENDADOS, JSON.stringify(livros));
      localStorage.setItem(CACHE_KEY_TIMESTAMP, String(Date.now()));
    } catch (err) {
      console.error("Erro completo em buscarRecomendados:", err);

      const cachedData = localStorage.getItem(CACHE_KEY_RECOMENDADOS);
      if (cachedData) {
        resultados.value = JSON.parse(cachedData);
        await refreshRecommendedRatings();
      } else {
        error.value =
          "Não foi possível carregar todas as recomendações no momento.";
      }
    } finally {
      loading.value = false;
    }
  }

  // =========================
  // PESQUISAR POR ISBN
  // =========================
  async function pesquisarPorISBN(isbn) {
    loading.value = true;
    error.value = null;

    try {
      const response = await searchBookByISBN(isbn);
      const item = response.items?.[0] ?? null;

      livroSelecionado.value = item ? googleBookToLivro(item) : null;
    } catch (err) {
      console.error(err);
      error.value = "Erro ao pesquisar ISBN.";
    } finally {
      loading.value = false;
    }
  }

  // =========================
  // BUSCAR LIVRO POR ID
  // =========================
  async function buscarLivro(id) {
    loading.value = true;
    error.value = null;

    try {
      const response = await getBookById(id);
      livroSelecionado.value = googleBookToLivro(response);
    } catch (err) {
      console.error(err);
      error.value = "Erro ao carregar livro.";
    } finally {
      loading.value = false;
    }
  }

  // =========================
  // LIMPAR ESTADO
  // =========================
  function limparResultados() {
    resultados.value = [];
    livroSelecionado.value = null;
    error.value = null;
  }

  return {
    resultados,
    resultadosExplore,
    buscandoExplore,
    erroExplore,
    avisoExplore,
    temMaisExplore,
    carregarMaisExplore,
    cancelarBusca,
    livroSelecionado,
    loading,
    error,

    // Estado de busca
    termoBusca,
    idiomasSelecionados,
    categoriasSelecionadas,
    ordenacao,
    jaBuscou,

    // Funções
    pesquisarLivros,
    buscarRecomendados,
    pesquisarPorISBN,
    buscarLivro,
    limparResultados,
  };
});
