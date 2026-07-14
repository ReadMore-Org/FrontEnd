import { ref } from "vue";
import { defineStore } from "pinia";
import { googleBookToLivro } from "@/utils/googleBooksAdapter";
import {
  searchBooks,
  searchBookByISBN,
  getBookById,
} from "@/services/googleBooks";

// ============================================================================
// HELPERS
// ============================================================================
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function shuffle(array) {
  return array
    .map((v) => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ v }) => v);
}

export const useGoogleBooksStore = defineStore("googleBooks", () => {
  // ============================================================================
  // CONSTANTES (Item 13)
  // ============================================================================
  const MAX_RESULTS = 20;
  const RECOMENDADOS_POR_LOTE = 12;
  const RETRY_DELAY = 500;

  // Lista expandida com 20 autores/termos amplos para maior variedade (Item 17)
  const autoresRecomendados = [
    "inauthor:Machado de Assis",
    "inauthor:Clarice Lispector",
    "inauthor:Jorge Amado",
    "inauthor:George Orwell",
    "inauthor:J.K. Rowling",
    "inauthor:José Saramago",
    "inauthor:Fernando Pessoa",
    "inauthor:Agatha Christie",
    "inauthor:Stephen King",
    "inauthor:J.R.R. Tolkien",
    "livros brasileiros",
  ];

  // ============================================================================
  // STATE
  // ============================================================================
  const resultados = ref([]);
  const recomendados = ref([]);
  const livroSelecionado = ref(null);

  // Loadings totalmente independentes (Item 2)
  const loadingPesquisa = ref(false);
  const loadingRecomendados = ref(false);
  const loadingMais = ref(false);
  const error = ref(null);

  // Flag anti-múltiplos cliques simultâneos (Item 3)
  const carregandoMais = ref(false);

  // Paginação inteligente por autor/termo (Item 4)
  const indiceAutorAtual = ref(0);
  const paginasAutores = ref({});
  const autoresSelecionados = ref([]);

  // Filtros de persistência da pesquisa por texto
  const termoBusca = ref("");
  const idiomasSelecionados = ref([]);
  const categoriasSelecionadas = ref([]);
  const ordenacao = ref("relevance");
  const jaBuscou = ref(false);

  // ============================================================================
  // HELPER INTERNO DE REQUISIÇÃO (Item 11 / Item 6 / Item 7 / Item 10)
  // ============================================================================
  async function buscarAutor(autor) {
    // Inicializa a página do autor se não existir
    if (!paginasAutores.value[autor]) {
      paginasAutores.value[autor] = 0;
    }

    const startIndex = paginasAutores.value[autor] * MAX_RESULTS;
    let responseData = null;

    // Função interna para controle estrito de até 2 retries (Item 6)
    async function executarChamada(
      queryStr,
      tentativa = 1,
      tempoEspera = RETRY_DELAY,
    ) {
      try {
        return await searchBooks(queryStr, startIndex, MAX_RESULTS);
      } catch (err) {
        const status = err.response?.status;
        if (tentativa < 2 && (status === 503 || status === 429 || !status)) {
          console.warn(
            `⚠️ Erro ${status || "Conexão"}. Tentativa ${tentativa} para "${queryStr}". Recuando ${tempoEspera}ms...`,
          );
          await delay(tempoEspera);
          return await executarChamada(
            queryStr,
            tentativa + 1,
            tempoEspera * 2,
          );
        }
        throw err; // Estoura o erro se falhar na segunda tentativa
      }
    }

    try {
      // Primeira tentativa: Filtro oficial
      responseData = await executarChamada(autor);
    } catch (err) {
      // Apenas uma tentativa de Fallback se for filtro estrito (Item 7 / Item 16)
      if (autor.includes("inauthor:")) {
        console.warn(
          `🔄 Falha estrita de 503/Conexão para "${autor}". Executando plano B textual único...`,
        );
        const termoSimples = autor.replace("inauthor:", "");
        try {
          responseData = await executarChamada(termoSimples, 1, RETRY_DELAY);
        } catch (fallbackErr) {
          console.error(
            `❌ Falha definitiva em ambas abordagens para: ${autor}`,
          );
          throw fallbackErr;
        }
      } else {
        throw err;
      }
    }

    const items = responseData?.items ?? [];
    if (items.length === 0) return [];

    // Processamento isolado do lote novo vindo do servidor (Item 9)
    const novosConvertidos = items
      .map((item) => googleBookToLivro(item))
      .filter((livro) => livro.titulo && livro.capa);

    // Controle de duplicatas simplificado via Set (Item 10)
    const existentes = new Set(recomendados.value.map((l) => l.id));
    const novosSemDuplicatas = novosConvertidos.filter(
      (l) => !existentes.has(l.id),
    );

    // Embaralha unicamente as novas aquisições e corta no limite estipulado
    const loteFinalSorteado = shuffle(novosSemDuplicatas);
    return loteFinalSorteado.slice(0, RECOMENDADOS_POR_LOTE);
  }

  // ============================================================================
  // BUSCAS
  // ============================================================================
  async function pesquisarLivros(query) {
    loadingPesquisa.value = true;
    error.value = null;
    try {
      const response = await searchBooks(query, 0, MAX_RESULTS);
      resultados.value = (response.items ?? [])
        .map((item) => googleBookToLivro(item))
        .filter((livro) => livro.titulo);
    } catch (err) {
      console.error(err);
      error.value = "Erro ao pesquisar livros.";
    } finally {
      loadingPesquisa.value = false;
    }
  }

  // ============================================================================
  // RECOMENDADOS
  // ============================================================================
  async function carregarMaisRecomendados() {
    if (carregandoMais.value) return;

    carregandoMais.value = true;
    loadingMais.value = true;
    error.value = null;

    try {
      const autoresDoLote = autoresSelecionados.value;

      // Faz as buscas dos 4 autores ao mesmo tempo
      const resultadosAutores = await Promise.all(
        autoresDoLote.map(async (autor) => {
          try {
            const livros = await buscarAutor(autor);

            if (livros.length > 0) {
              paginasAutores.value[autor]++;
            }

            // Pega apenas 3 livros de cada autor
            return livros.slice(0, 3);
          } catch (err) {
            console.warn(`Erro ao buscar ${autor}`, err);

            // Se um autor falhar, os outros continuam normalmente
            return [];
          }
        }),
      );

      // Junta todos os livros retornados
      let livrosNovos = resultadosAutores.flat();

      // Mistura apenas o lote novo
      livrosNovos = shuffle(livrosNovos);

      // Adiciona ao final dos recomendados
      if (livrosNovos.length > 0) {
        recomendados.value.push(...livrosNovos);
      }
    } catch (err) {
      console.error(err);

      error.value = "Não foi possível carregar novos livros recomendados.";
    } finally {
      carregandoMais.value = false;
      loadingMais.value = false;
    }
  }

  async function buscarRecomendados() {
    if (recomendados.value.length > 0) return;

    loadingRecomendados.value = true;

    try {
      // Escolhe 4 autores aleatórios apenas uma vez
      if (autoresSelecionados.value.length === 0) {
        autoresSelecionados.value = shuffle([...autoresRecomendados]).slice(
          0,
          4,
        );
      }

      await carregarMaisRecomendados();
    } finally {
      loadingRecomendados.value = false;
    }
  }

  // ============================================================================
  // ISBN
  // ============================================================================
  async function pesquisarPorISBN(isbn) {
    // Não é bloqueado por outras requisições em andamento
    try {
      const response = await searchBookByISBN(isbn);
      const item = response.items?.[0] ?? null;
      livroSelecionado.value = item ? googleBookToLivro(item) : null;
    } catch (err) {
      console.error(err);
    }
  }

  // ============================================================================
  // LIVRO
  // ============================================================================
  async function buscarLivro(id) {
    try {
      const response = await getBookById(id);
      livroSelecionado.value = googleBookToLivro(response);
    } catch (err) {
      console.error(err);
    }
  }

  // ============================================================================
  // LIMPEZA
  // ============================================================================
  function limparResultados() {
    resultados.value = [];
    recomendados.value = [];
    livroSelecionado.value = null;
    error.value = null;
    indiceAutorAtual.value = 0;
    paginasAutores.value = {};
  }

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    resultados,
    recomendados,
    livroSelecionado,
    loadingPesquisa,
    loadingRecomendados,
    loadingMais,
    carregandoMais,
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
