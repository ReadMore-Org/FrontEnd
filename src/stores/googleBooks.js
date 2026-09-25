import { ref } from "vue";
import { defineStore } from "pinia";

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

  // Controle de cancelamento de requisições sobrepostas
  let controllerAtual = null;

  // =========================
  // PESQUISAR LIVROS (COM ORDENAÇÃO POR POPULARIDADE)
  // =========================
  async function pesquisarLivros(query) {
    const queryLimpa = query?.trim();

    if (!queryLimpa) {
      loading.value = false;
      return;
    }

    // Cancela a requisição anterior se ainda estiver rodando
    if (controllerAtual) {
      controllerAtual.abort();
    }
    controllerAtual = new AbortController();

    loading.value = true;
    error.value = null;
    jaBuscou.value = true;

    try {
      const response = await searchBooks(queryLimpa, {
        signal: controllerAtual.signal,
      });

      const itens = response?.items ?? [];

      // Mapeia os livros e calcula a pontuação para trazer os mais populares para o topo
      const livrosFormatados = itens
        .map((item) => {
          const livro = googleBookToLivro(item);
          const info = item.volumeInfo || {};

          const avaliacoes = info.ratingsCount ?? 0;
          const nota = info.averageRating ?? 0;
          const temCapa =
            livro.capa && !livro.capa.includes("no-cover") ? 30 : -100;
          const eEmPortugues = info.language === "pt" ? 20 : 0;

          const score =
            Math.log10(avaliacoes + 1) * 25 +
            nota * 10 +
            temCapa +
            eEmPortugues;

          return { livro, score };
        })
        .filter(({ livro }) => livro.titulo && livro.capa);

      // Ordena do maior score (mais popular) para o menor
      livrosFormatados.sort((a, b) => b.score - a.score);

      resultados.value = livrosFormatados.map(({ livro }) => livro);
    } catch (err) {
      // Ignora erros de cancelamento do Axios
      if (
        axios.isCancel(err) ||
        err.name === "AbortError" ||
        err.code === "ERR_CANCELED"
      ) {
        return;
      }

      console.error("Erro ao pesquisar livros:", err);
      error.value = "Não foi possível carregar os livros. Tente novamente.";
      resultados.value = [];
    } finally {
      if (controllerAtual && !controllerAtual.signal.aborted) {
        loading.value = false;
      }
    }
  }
  // =========================
  // RECOMENDADOS
  // =========================
  const CACHE_KEY_RECOMENDADOS = "recomendados_google_books";
  const CACHE_KEY_TIMESTAMP = "recomendados_google_books_time";
  const CACHE_EXPIRATION_MS = 12 * 60 * 60 * 1000; // 12 horas em milissegundos

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
        queries.map((query) => searchBooks(query)),
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

      // 3. SALVA NO CACHE SE TODOS OS AUTORES CARREGARAM
      localStorage.setItem(CACHE_KEY_RECOMENDADOS, JSON.stringify(livros));
      localStorage.setItem(CACHE_KEY_TIMESTAMP, String(Date.now()));
    } catch (err) {
      console.error("Erro completo em buscarRecomendados:", err);

      const cachedData = localStorage.getItem(CACHE_KEY_RECOMENDADOS);
      if (cachedData) {
        resultados.value = JSON.parse(cachedData);
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
