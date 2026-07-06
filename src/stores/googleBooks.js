import { ref } from "vue";
import { defineStore } from "pinia";

import { googleBookToLivro } from "@/utils/googleBooksAdapter";

import {
  searchBooks,
  searchBookByISBN,
  getBookById,
} from "@/services/googleBooks";

// =========================
// SHUFFLE (CORRETO)
// =========================
function shuffle(array) {
  return array
    .map((v) => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }) => v);
}

export const useGoogleBooksStore = defineStore("googleBooks", () => {
  const resultados = ref([]);
  const livroSelecionado = ref(null);

  const loading = ref(false);
  const error = ref(null);

  // =========================
  // ESTADO DA BUSCA (persiste entre navegações)
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
        .filter((livro) => livro.titulo);
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

      // busca paralela
      const responses = await Promise.all(
        queries.map((q) => searchBooks(q))
      );

      console.log("📦 responses:", responses);

      // junta todos os livros
      const allBooks = responses.flatMap((res) => res.items ?? []);
      console.log("📚 allBooks:", allBooks.length);

      // embaralha
      const shuffled = shuffle(allBooks);
      console.log("🔀 shuffled:", shuffled.length);

      // converte + filtra
      const livros = shuffled
        .map((item) => googleBookToLivro(item))
        .filter((livro) => livro.titulo && livro.capa);

      console.log("🎯 final:", livros.length);

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

    // estado de busca
    termoBusca,
    idiomasSelecionados,
    categoriasSelecionadas,
    ordenacao,
    jaBuscou,

    pesquisarLivros,
    buscarRecomendados,
    pesquisarPorISBN,
    buscarLivro,
    limparResultados,
  };
});