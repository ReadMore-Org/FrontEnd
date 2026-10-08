import { ref, computed } from "vue";
import { defineStore } from "pinia";

import {
  getAnuncios,
  createAnuncio,
  deleteAnuncio,
} from "@/services/marketplace";
import { searchBooks } from "@/services/googleBooks";
import { googleBookToLivro } from "@/utils/googleBooksAdapter";
import { normalizar } from "@/utils/marketplaceHelpers";

export const useMarketplaceStore = defineStore("marketplace", () => {
  const anuncios = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Busca no Google Books (livros que talvez ninguém tenha anunciado ainda)
  const resultadosGoogle = ref([]);
  const buscandoGoogle = ref(false);
  let idUltimaBusca = 0;

  let carregado = false;

  // =========================
  // LISTAR ANÚNCIOS
  // =========================
  // Carrega todas as páginas (page_size 100) e deixa carrosséis/filtros
  // funcionarem no front. Quando o marketplace crescer, troque por filtros
  // no servidor: o backend já aceita ?tipo=, ?categoria= e ?q=.
  async function fetchAnuncios(force = false) {
    if (carregado && !force) return;

    loading.value = true;
    error.value = null;

    try {
      const todos = [];
      let page = 1;
      let totalPages = 1;

      do {
        const { data } = await getAnuncios({ page, page_size: 100 });
        todos.push(...data.results);
        totalPages = data.total_pages;
        page++;
      } while (page <= totalPages);

      anuncios.value = todos;
      carregado = true;
    } catch (err) {
      console.error("Erro ao carregar marketplace:", err);
      error.value = "Não foi possível carregar o marketplace. Tente novamente.";
    } finally {
      loading.value = false;
    }
  }

  // Marca o cache como velho (chamado depois de publicar/remover um anúncio)
  function invalidar() {
    carregado = false;
  }

  // =========================
  // CARROSSÉIS
  // =========================
  const recentes = computed(() => anuncios.value.slice(0, 12));

  const paraTroca = computed(() =>
    anuncios.value.filter((a) => a.tipo === "troca"),
  );

  const paraEmprestimo = computed(() =>
    anuncios.value.filter((a) => a.tipo === "emprestimo"),
  );

  // Só categorias que realmente têm anúncio, da mais cheia para a mais vazia
  const categorias = computed(() => {
    const mapa = new Map();

    for (const anuncio of anuncios.value) {
      for (const cat of anuncio.livro?.categoria ?? []) {
        const atual = mapa.get(cat.id) ?? {
          id: cat.id,
          descricao: cat.descricao,
          total: 0,
        };
        atual.total++;
        mapa.set(cat.id, atual);
      }
    }

    return [...mapa.values()].sort(
      (a, b) => b.total - a.total || a.descricao.localeCompare(b.descricao),
    );
  });

  function anunciosDaCategoria(categoriaId) {
    return anuncios.value.filter((a) =>
      a.livro?.categoria?.some((c) => c.id === categoriaId),
    );
  }

  // =========================
  // CRIAR / REMOVER
  // =========================
  async function criarAnuncio(payload) {
    const { data } = await createAnuncio(payload);
    invalidar();
    return data;
  }

  async function removerAnuncio(id) {
    await deleteAnuncio(id);
    anuncios.value = anuncios.value.filter((a) => a.id !== id);
    invalidar();
  }

  // =========================
  // BUSCA NO GOOGLE BOOKS
  // =========================
  // Retorna só livros que ainda NÃO têm anúncio (por ISBN ou título).
  // Não usa a googleBooksStore para não mexer nos resultados da Home/Explore.
  async function buscarGoogle(termo) {
    const texto = termo?.trim();
    const id = ++idUltimaBusca;

    if (!texto || texto.length < 2) {
      resultadosGoogle.value = [];
      buscandoGoogle.value = false;
      return;
    }

    buscandoGoogle.value = true;

    try {
      const resposta = await searchBooks(texto);

      // Chegou depois de uma busca mais nova: descarta
      if (id !== idUltimaBusca) return;

      const isbnsAnunciados = new Set(
        anuncios.value.map((a) => a.livro?.isbn).filter(Boolean),
      );
      const titulosAnunciados = new Set(
        anuncios.value.map((a) => normalizar(a.livro?.titulo)),
      );

      resultadosGoogle.value = (resposta?.items ?? [])
        .map(googleBookToLivro)
        .filter(
          (livro) =>
            livro.titulo &&
            livro.capa &&
            !(livro.isbn && isbnsAnunciados.has(livro.isbn)) &&
            !titulosAnunciados.has(normalizar(livro.titulo)),
        );
    } catch (err) {
      console.error("Erro ao buscar no Google Books:", err);
      if (id === idUltimaBusca) resultadosGoogle.value = [];
    } finally {
      if (id === idUltimaBusca) buscandoGoogle.value = false;
    }
  }

  function limparBuscaGoogle() {
    idUltimaBusca++;
    resultadosGoogle.value = [];
    buscandoGoogle.value = false;
  }

  return {
    anuncios,
    loading,
    error,
    recentes,
    paraTroca,
    paraEmprestimo,
    categorias,
    resultadosGoogle,
    buscandoGoogle,
    fetchAnuncios,
    invalidar,
    anunciosDaCategoria,
    criarAnuncio,
    removerAnuncio,
    buscarGoogle,
    limparBuscaGoogle,
  };
});