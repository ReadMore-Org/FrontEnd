import { ref, computed } from "vue";
import { defineStore } from "pinia";
import api from '@/services/api';
import { uploadImagem } from "@/services/upload";
import {
  getLivros,
  getLivrosUsuario,
  createLivro,
  updateLivro,
  deleteLivro,
  getCategorias,
  getEditoras,
  createLivroUsuario,
  updateStatusLivroUsuario,
  importarLivroGoogle,
  deleteLivroUsuario,
} from "@/services/livros";

export const useLivrosStore = defineStore("livros", () => {
  const livros = ref([]);
  const meusLivros = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const categorias = ref([]);
  const editoras = ref([]);

  const totalLivros = computed(() => livros.value.length);
  const totalMeusLivros = computed(() => meusLivros.value.length);

  // Computeds para contagem por status
  const totalLidos = computed(
    () => meusLivros.value.filter((item) => item.status === "lido").length,
  );
  const totalLendo = computed(
    () => meusLivros.value.filter((item) => item.status === "lendo").length,
  );
  const totalQueroLer = computed(
    () => meusLivros.value.filter((item) => item.status === "quero_ler").length,
  );

  let alreadyLoaded = false;

  async function fetchLivros() {
    if (alreadyLoaded) return;
    alreadyLoaded = true;

    loading.value = true;
    error.value = null;

    try {
      livros.value = [];

      let page = 1;
      let totalPages = 1;

      do {
        const response = await getLivros(page);

        livros.value.push(...response.data.results);

        totalPages = response.data.total_pages;
        page++;
      } while (page <= totalPages);
    } catch (err) {
      error.value = "Erro ao carregar livros.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchMeusLivros(status = null) {
    loading.value = true;
    error.value = null;

    try {
      const response = await getLivrosUsuario(status);
      meusLivros.value = response.data.results ?? response.data;
    } catch (err) {
      error.value = "Erro ao carregar meus livros.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function atualizarStatusMeuLivro(livroOuPayload, novoStatus) {
    const livroId =
      typeof livroOuPayload === "object" ? livroOuPayload.id : livroOuPayload;

    // 1. Procura se esse livro já está salvo na estante do usuário
    const itemExistente = meusLivros.value.find(
      (item) =>
        item.livro?.id === livroId ||
        item.livro === livroId ||
        item.id === livroId,
    );

    if (itemExistente) {
      // 🟢 SE JÁ EXISTE NA ESTANTE: usa PATCH passando o ID da relação na estante (itemExistente.id)
      await updateStatusLivroUsuario(itemExistente.id, novoStatus);
    } else {
      // 🟢 SE NÃO EXISTE AINDA: usa POST para criar a relação na estante
      await createLivroUsuario({ livro: livroId, status: novoStatus });
    }

    // Recarrega os livros do usuário para sincronizar a estante na tela
    await fetchMeusLivros();
  }

  // Ação para remover livro da estante do usuário
  async function removerMeuLivro(meuLivroId) {
    error.value = null;

    try {
      await deleteLivroUsuario(meuLivroId);

      meusLivros.value = meusLivros.value.filter(
        (item) => item.id !== meuLivroId,
      );
    } catch (err) {
      error.value = "Erro ao remover livro da estante.";
      console.error("Erro ao remover meu livro:", err);
      throw err;
    }
  }

  async function fetchCategorias() {
    try {
      const res = await getCategorias();
      categorias.value = res.data.results || [];
    } catch (err) {
      console.error("Erro ao carregar categorias", err);
    }
  }

  async function fetchEditoras() {
    try {
      const res = await getEditoras();
      editoras.value = res.data.results || [];
    } catch (err) {
      console.error("Erro ao carregar editoras", err);
    }
  }

  async function addLivro(data) {
    error.value = null;

    try {
      let payload = { ...data };

      if (data.capaFile) {
        const upload = await uploadImagem(data.capaFile);
        payload.capa_attachment_key = upload.attachment_key;
      }

      delete payload.capaFile;

      if (typeof payload.autores === "string") {
        payload.autores_nomes = payload.autores
          .split(",")
          .map((nome) => nome.trim())
          .filter((nome) => nome.length > 0);
      }
      delete payload.autores;

      [
        "isbn",
        "idioma",
        "paginas",
        "nota",
        "publicacao",
        "tipo_capa",
        "faixa_etaria",
        "editora",
        "subtitulo",
        "sinopse",
      ].forEach((key) => {
        if (payload[key] === "" || payload[key] === undefined) {
          payload[key] = null;
        }
      });

      if (
        payload.categoria === null ||
        payload.categoria === "" ||
        payload.categoria === undefined
      ) {
        payload.categoria = [];
      } else {
        payload.categoria = [payload.categoria];
      }

      const response = await createLivro(payload);
      livros.value.push(response.data);
    } catch (err) {
      console.log("ERRO COMPLETO:", err.response?.data);
      error.value = "Erro ao adicionar livro.";
    }
  }

  async function updateLivroStore(id, data) {
    error.value = null;

    try {
      const response = await updateLivro(id, data);

      const index = livros.value.findIndex((l) => l.id === id);
      if (index !== -1) {
        livros.value[index] = response.data;
      }
    } catch (err) {
      error.value = "Erro ao atualizar livro.";
      console.error(err);
    }
  }

  async function removeLivro(id) {
    error.value = null;

    try {
      await deleteLivro(id);
      livros.value = livros.value.filter((l) => l.id !== id);
    } catch (err) {
      error.value = "Erro ao remover livro.";
      console.error(err);
    }
  }

async function importarLivroDoGoogle(livroDados, status = "quero_ler") {
  loading.value = true;
  error.value = null;

  try {
    // Monta o payload incluindo o status no nível raiz do objeto
    const payload = typeof livroDados === "object"
      ? { ...livroDados, status: status }
      : { googleBookId: livroDados, status: status };

    // Aponta exatamente para a rota configurada em urls.py
    const response = await api.post("/livros/importar-google/", payload);

    return response.data;
  } catch (err) {
    error.value = "Erro ao importar livro do Google.";
    console.error(err);
    throw err;
  } finally {
    loading.value = false;
  }
}

  return {
    livros,
    meusLivros,
    categorias,
    editoras,
    loading,
    error,
    totalLivros,
    totalMeusLivros,
    totalLidos,
    totalLendo,
    totalQueroLer,
    importarLivroDoGoogle, // Adicionado aqui
    importarLivroGoogle: importarLivroDoGoogle,
    atualizarStatusMeuLivro,
    removerMeuLivro,
    fetchCategorias,
    fetchEditoras,
    fetchLivros,
    fetchMeusLivros,
    addLivro,
    updateLivroStore,
    removeLivro,
  };
});
