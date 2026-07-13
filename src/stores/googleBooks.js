import { ref } from "vue";
import { defineStore } from "pinia";

import { googleBookToLivro } from "@/utils/googleBooksAdapter";

import {
  searchBooks,
  searchBookByISBN,
  getBookById,
} from "@/services/googleBooks";

// Helper para pausar a execução
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// =========================
// SHUFFLE (EMBARALHAMENTO)
// =========================
function shuffle(array) {
  return array
    .map((v) => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }) => v);
}

export const useGoogleBooksStore = defineStore("googleBooks", () => {
  // ESTADOS DE DADOS SEPARADOS
  const resultados = ref([]); // Exclusivo para buscas textuais/filtros da página de pesquisa
  const recomendados = ref([]); // Exclusivo para acumular os livros na Home Page
  const livroSelecionado = ref(null);

  const loading = ref(false);
  const error = ref(null);

  // CONTROLE DE PAGINAÇÃO DOS RECOMENDADOS
  const indiceAutorAtual = ref(0);
  const paginaAtualPorAutor = ref(0);

  const autoresRecomendados = [
    "inauthor:Machado de Assis",
    "inauthor:Clarice Lispector",
    "inauthor:Jorge Amado",
    "inauthor:George Orwell",
    "inauthor:J.K. Rowling",
  ];

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
  // CARREGAR MAIS RECOMENDADOS (Com Fallback e Rotação de Fila)
  // =========================
  async function carregarMaisRecomendados() {
    if (loading.value) return;

    loading.value = true;
    error.value = null;

    async function fetchComRetry(
      queryStr,
      tentativasRestantes = 3,
      tempoEspera = 800,
    ) {
      try {
        return await searchBooks(queryStr);
      } catch (err) {
        const status = err.response?.status;
        if (
          tentativasRestantes > 0 &&
          (status === 503 || status === 429 || !status)
        ) {
          console.warn(
            `⚠️ API instável para "${queryStr}". Tentando novamente em ${tempoEspera}ms...`,
          );
          await delay(tempoEspera);
          return await fetchComRetry(
            queryStr,
            tentativasRestantes - 1,
            tempoEspera * 2,
          );
        }
        throw err;
      }
    }

    const autorOriginal = autoresRecomendados[indiceAutorAtual.value];

    try {
      const itensPorPagina = 20;
      const startIndex = paginaAtualPorAutor.value * itensPorPagina;

      console.log(
        `🔍 Buscando mais livros de: ${autorOriginal} (Index: ${startIndex})`,
      );

      let responseData;

      try {
        responseData = await fetchComRetry(
          `${autorOriginal}&startIndex=${startIndex}`,
        );
      } catch (apiErr) {
        console.warn(
          `🔄 Filtro estrito falhou para "${autorOriginal}". Tentando busca textual simples como Fallback...`,
        );
        const termoSimples = autorOriginal.replace("inauthor:", "");
        responseData = await fetchComRetry(
          `${termoSimples}&startIndex=${startIndex}`,
          2,
          400,
        );
      }

      const items = responseData?.items ?? [];

      if (items.length > 0) {
        // 1. Converte e filtra os válidos com capa do lote atual vindo da API
        const novosLivrosFiltrados = items
          .map((item) => googleBookToLivro(item))
          .filter((livro) => livro.titulo && livro.capa);

        // 2. 🔥 EMBARALHA APENAS OS NOVOS LIVROS QUE CHEGARAM AGORA
        const loteNovoMisturado = shuffle(novosLivrosFiltrados);

        // 3. Corta para pegar a quantidade padrão (ex: 12) desse lote novo misturado
        const QUANTIDADE_PADRAO = 12;
        const loteDoAutor = loteNovoMisturado.slice(0, QUANTIDADE_PADRAO);

        // 4. Cria a lista estendida mantendo os livros anteriores na EXATA mesma ordem
        const listaCombinada = [...recomendados.value, ...loteDoAutor];

        // 5. Filtra duplicatas globais (se houver IDs repetidos, mantém a primeira ocorrência detectada)
        const listaSemDuplicatas = Array.from(
          new Map(listaCombinada.map((livro) => [livro.id, livro])).values(),
        );

        console.log(
          `📊 Adicionados ${loteDoAutor.length} novos livros mantendo fixos os anteriores.`,
        );

        // 6. Atualiza o estado sem desordenar o histórico da tela
        recomendados.value = listaSemDuplicatas;
      } else {
        console.warn(
          `⚠️ Nenhuns itens retornados para o autor: ${autorOriginal}`,
        );
      }
    } catch (err) {
      console.error(
        `❌ Falha definitiva ao carregar mais recomendações de "${autorOriginal}":`,
        err,
      );
      error.value =
        "Não foi possível carregar este autor. Clique novamente para tentar o próximo.";
    } finally {
      indiceAutorAtual.value =
        (indiceAutorAtual.value + 1) % autoresRecomendados.length;

      if (indiceAutorAtual.value === 0) {
        paginaAtualPorAutor.value += 1;
      }

      loading.value = false;
    }
  }

  // =========================
  // BUSCAR RECOMENDADOS (Carregamento Inicial Robusto)
  // =========================
  async function buscarRecomendados() {
    if (recomendados.value.length > 0) return;

    console.log("🚀 Iniciando carga robusta e limpa para a Home...");

    // Traz o primeiro autor
    await carregarMaisRecomendados();

    // Aumentamos para 800ms de intervalo apenas na carga inicial.
    // Esse tempo é o suficiente para o Google limpar a cota do seu IP.
    await delay(800);

    // Traz o segundo autor de forma segura
    await carregarMaisRecomendados();
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
    recomendados.value = [];
    livroSelecionado.value = null;
    error.value = null;
    indiceAutorAtual.value = 0;
    paginaAtualPorAutor.value = 0;
  }

  return {
    resultados,
    recomendados,
    livroSelecionado,
    loading,
    error,
    termoBusca,
    idiomasSelecionados,
    categoriasSelecionadas,
    ordenacao,
    jaBuscou,
    pesquisarLivros,
    buscarRecomendados,
    carregarMaisRecomendados,
    pesquisarPorISBN,
    buscarLivro,
    limparResultados,
  };
});