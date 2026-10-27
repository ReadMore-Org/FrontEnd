import { ref, computed } from "vue";
import { defineStore } from "pinia";
import api from "@/services/api";
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
      const all = [];
      let page = 1;
      let total = 1;
      do {
        const response = await getLivrosUsuario(status, page);
        all.push(...(response.data.results ?? response.data));
        total = response.data.total_pages || 1;
        page++;
      } while (page <= total);
      meusLivros.value = all;
    } catch (err) {
      error.value = "Erro ao carregar meus livros.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function atualizarStatusMeuLivro(livroOuPayload, novoStatus) {
    const isShelf = typeof livroOuPayload === "object" && livroOuPayload?.livro != null;
    const livroId = typeof livroOuPayload === "object" ? livroOuPayload.id : livroOuPayload;
    const index = meusLivros.value.findIndex(item => isShelf
      ? item.id === livroOuPayload.id
      : (item.livro?.id ?? item.livro) === livroId);
    if (index >= 0) {
      const previous = meusLivros.value[index];
      meusLivros.value[index] = { ...previous, status: novoStatus };
      try {
        await updateStatusLivroUsuario(previous.id, novoStatus);
      } catch (err) {
        const currentIndex = meusLivros.value.findIndex(item => item.id === previous.id);
        if (currentIndex >= 0) meusLivros.value[currentIndex] = previous;
        throw err;
      }
    } else {
      await createLivroUsuario({ livro: livroId, status: novoStatus });
      await fetchMeusLivros();
    }
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

  async function fetchOptions(fetchPage) {
    const all = [];
    let page = 1;
    let total = 1;
    do {
      const response = await fetchPage(page);
      all.push(...(response.data.results ?? response.data));
      total = response.data.total_pages || 1;
      page++;
    } while (page <= total);
    return all;
  }
  async function fetchCategorias({ throwOnError = false } = {}) {
    try { categorias.value = await fetchOptions(getCategorias); }
    catch (err) { if (throwOnError) throw err; }
  }
  async function fetchEditoras({ throwOnError = false } = {}) {
    try { editoras.value = await fetchOptions(getEditoras); }
    catch (err) { if (throwOnError) throw err; }
  }
  async function addLivro(data) {
    error.value = null;
    try {
      const payload = { ...data };
      delete payload.capaFile;
      if (data.capaFile) {
        const upload = await uploadImagem(data.capaFile);
        payload.capa_attachment_key = upload.attachment_key;
      }
      const response = await api.post("/livros/cadastrar-manual/", payload);
      livros.value.push(response.data.livro);
      meusLivros.value.push(response.data.livro_usuario);
      return response.data.livro;
    } catch (err) {
      error.value = "Não foi possível cadastrar o livro.";
      throw err;
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
      const payload =
        typeof livroDados === "object"
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
