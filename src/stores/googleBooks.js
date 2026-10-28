import { recommendationErrorMessage } from "@/utils/recommendationMessages";
import { getSavedRecommendations, searchRecommendedBooks } from "@/services/recommendations";
import { GENERAL_RECOMMENDATIONS, selectRecommendedEdition, matchesRecommendedWork } from "@/utils/generalRecommendations";
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
  const CACHE_KEY_RECOMENDADOS = "recomendados_google_books_v8";
  const CACHE_EXPIRATION_MS = 12 * 60 * 60 * 1000;
  let recomendadosEmAndamento = null;
  let recomendacoesPendentes = GENERAL_RECOMMENDATIONS.map((_, index) => index);
  const temMaisRecomendados = ref(true);
  const carregandoMaisRecomendados = ref(false);
  const erroMaisRecomendados = ref(null);
  const avisoRecomendados = ref(null);

  function lerCacheRecomendados() {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY_RECOMENDADOS));
      return cache && Array.isArray(cache.livros) && cache.livros.length
        && cache.livros.every(livro => livro?.id && livro?.titulo)
        && Array.isArray(cache.pendentes) && cache.pendentes.every(index => Number.isInteger(index)
          && index >= 0 && index < GENERAL_RECOMMENDATIONS.length) ? cache : null;
    } catch { return null; }
  }

  function buscarRecomendados(forceRefresh = false) {
    if (recomendadosEmAndamento) return recomendadosEmAndamento;
    recomendadosEmAndamento = carregarRecomendados(forceRefresh)
      .finally(() => { recomendadosEmAndamento = null; });
    return recomendadosEmAndamento;
  }

  async function carregarRecomendados(forceRefresh) {
    loading.value = true;
    error.value = null;
    const cache = lerCacheRecomendados();
    try {
      if (!forceRefresh && cache && Date.now() - cache.time < CACHE_EXPIRATION_MS) {
        resultados.value = cache.livros;
        recomendacoesPendentes = [...cache.pendentes];
        temMaisRecomendados.value = recomendacoesPendentes.length > 0;
        return;
      }

      recomendacoesPendentes = GENERAL_RECOMMENDATIONS.map((_, index) => index);
      const livros = await consultarProximasRecomendacoes();
      if (!livros.length) throw new Error("Nenhuma recomendação disponível");
      resultados.value = livros;
      salvarCacheRecomendados();
    } catch (err) {
      if (cache) {
        resultados.value = cache.livros;
        recomendacoesPendentes = [...cache.pendentes];
      }
      temMaisRecomendados.value = recomendacoesPendentes.length > 0;
      if (resultados.value.length) avisoRecomendados.value = recommendationErrorMessage(err, { partial: true });
      if (!resultados.value.length) {
        error.value = recommendationErrorMessage(err);
      }
    } finally {
      loading.value = false;
      // As notas ReadMore não bloqueiam a exibição das recomendações.
      const displayedBooks = [...resultados.value];
      if (displayedBooks.length) loadBookRatings(displayedBooks)
        .catch(() => markBookRatingsUnavailable(displayedBooks));
    }
  }

  function salvarCacheRecomendados() {
    try {
      localStorage.setItem(CACHE_KEY_RECOMENDADOS, JSON.stringify({
        time: Date.now(), livros: resultados.value, pendentes: recomendacoesPendentes,
      }));
    } catch { /* Armazenamento indisponível não bloqueia a busca. */ }
  }

  async function consultarProximasRecomendacoes() {
    const collected = [];
    const candidates = [...recomendacoesPendentes];
    avisoRecomendados.value = null;
    let firstError;
    let saved = [];
    try {
      saved = await getSavedRecommendations(recomendacoesPendentes.map(index => GENERAL_RECOMMENDATIONS[index]));
    } catch { /* Uma falha no servidor local não impede consultar o Google. */ }

    // Prioriza edições persistidas, que abrem e podem ser adicionadas sem o Google.
    for (const index of [...recomendacoesPendentes]) {
      if (collected.length >= 12) break;
      const book = saved.filter(book => matchesRecommendedWork(book.titulo, book.autores || [], GENERAL_RECOMMENDATIONS[index]))
        .sort((a, b) => Number(!!(b.google_book_id || b.capa_google)) - Number(!!(a.google_book_id || a.capa_google))
          || Number(!!(typeof b.capa === 'string' ? b.capa : b.capa?.url))
          - Number(!!(typeof a.capa === 'string' ? a.capa : a.capa?.url)))[0];
      if (book) {
        collected.push({ ...book, origem: "local" });
        recomendacoesPendentes = recomendacoesPendentes.filter(value => value !== index);
      }
    }
    const pending = candidates.filter(index => recomendacoesPendentes.includes(index));
    const failedIndices = [];
    // Esgota candidatos vazios e continua após falhas isoladas, até completar a página.
    for (let offset = 0; offset < pending.length && collected.length < 12;) {
      const indices = pending.slice(offset, offset + Math.min(3, 12 - collected.length));
      offset += indices.length;
      const batch = await Promise.allSettled(indices.map(async index => {
        const data = await searchRecommendedBooks(GENERAL_RECOMMENDATIONS[index]);
        return selectRecommendedEdition(data.items || [], GENERAL_RECOMMENDATIONS[index]);
      }));
      let failures = 0;
      batch.forEach((response, i) => {
        const index = indices[i];
        if (response.status === "fulfilled") {
          recomendacoesPendentes = recomendacoesPendentes.filter(value => value !== index);
          if (response.value) collected.push(googleBookToLivro(response.value));
        } else {
          firstError ||= response.reason;
          failedIndices.push(index);
          failures++;
        }
      });
      if (failures === batch.length) break;
    }
    // Uma nova tentativa busca outros títulos antes dos que falharam.
    recomendacoesPendentes = [
      ...recomendacoesPendentes.filter(index => !failedIndices.includes(index)), ...failedIndices,
    ];
    if (firstError && collected.length) avisoRecomendados.value = recommendationErrorMessage(firstError, { partial: true });
    temMaisRecomendados.value = recomendacoesPendentes.length > 0;
    if (!collected.length && firstError) throw firstError;
    return collected;
  }

  async function carregarMaisRecomendados() {
    if (loading.value || carregandoMaisRecomendados.value || !temMaisRecomendados.value) return;
    carregandoMaisRecomendados.value = true;
    erroMaisRecomendados.value = null;
    try {
      const books = await consultarProximasRecomendacoes();
      resultados.value = mergeSearchBooks([...resultados.value, ...books]);
      salvarCacheRecomendados();
      if (books.length) loadBookRatings(books).catch(() => markBookRatingsUnavailable(books));
    } catch (err) {
      avisoRecomendados.value = null;
      erroMaisRecomendados.value = recommendationErrorMessage(err, { more: true });
    } finally { carregandoMaisRecomendados.value = false; }
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
    carregarMaisRecomendados,
    temMaisRecomendados,
    carregandoMaisRecomendados,
    erroMaisRecomendados,
    avisoRecomendados,
    pesquisarPorISBN,
    buscarLivro,
    limparResultados,
  };
});
