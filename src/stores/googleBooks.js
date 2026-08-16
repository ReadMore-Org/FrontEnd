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

  // =========================
  // PESQUISAR LIVROS
  // =========================
  async function pesquisarLivros(query) {
    loading.value = true;
    error.value = null;

    try {
      const response = await searchBooks(query);

      resultados.value = (response.items ?? [])
        .map((item) => googleBookToLivro(item))
        .filter((livro) => livro.titulo && livro.capa);
    } catch (err) {
      console.error(err);
      error.value = "Erro ao pesquisar livros.";
    } finally {
      loading.value = false;
    }
  }

  // =========================
  // RECOMENDADOS
  // =========================
  async function buscarRecomendados() {
    loading.value = true;
    error.value = null;

    try {
      const queries = [
        "inauthor:Machado de Assis",
        "inauthor:Clarice Lispector",
        "inauthor:Jorge Amado",
        "inauthor:George Orwell",
        "inauthor:J.K. Rowling",
      ];

      // =========================
      // BUSCA TODOS OS AUTORES
      // =========================
      const responses = await Promise.all(
        queries.map((query) => searchBooks(query))
      );

      // Junta todos os resultados
      const allBooks = responses.flatMap(
        (response) => response.items ?? []
      );

      // =========================
      // REMOVE DUPLICADOS
      // =========================
      const uniqueBooks = Array.from(
        new Map(
          allBooks.map((book) => [book.id, book])
        ).values()
      );

      // =========================
      // FILTRA LIVROS VÁLIDOS
      // =========================
      const validBooks = uniqueBooks.filter((book) => {
        const info = book.volumeInfo;

        return (
          info?.title &&
          info?.imageLinks?.thumbnail
        );
      });

      // =========================
      // CALCULA POPULARIDADE
      // =========================
      const scoredBooks = validBooks.map((book) => {
        const info = book.volumeInfo;

        const ratingsCount = info.ratingsCount ?? 0;
        const averageRating = info.averageRating ?? 0;

        // Quanto mais avaliações, maior a popularidade.
        // O log evita que um livro com milhares de
        // avaliações fique absurdamente acima dos outros.
        const popularityScore =
          Math.log10(ratingsCount + 1) * 10;

        // A nota também influencia.
        const ratingScore =
          averageRating * 2;

        return {
          book,
          score: popularityScore + ratingScore,
        };
      });

      // =========================
      // ALEATORIEDADE + POPULARIDADE
      // =========================
      const shuffledBooks = shuffle(scoredBooks);

      shuffledBooks.sort((a, b) => {
        const randomA = Math.random() * 15;
        const randomB = Math.random() * 15;

        return (
          b.score +
          randomB -
          (a.score + randomA)
        );
      });

      // =========================
      // CONVERTE TODOS OS LIVROS
      // =========================
      const livros = shuffledBooks
        .map(({ book }) => googleBookToLivro(book))
        .filter(
          (livro) =>
            livro.titulo &&
            livro.capa
        );

      // Não limita aqui.
      // O GradeBook controla quantos aparecem.
      resultados.value = livros;
    } catch (err) {
      console.error(err);
      error.value = "Erro ao buscar recomendações.";
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

      livroSelecionado.value = item
        ? googleBookToLivro(item)
        : null;
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

      livroSelecionado.value =
        googleBookToLivro(response);
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