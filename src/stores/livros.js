import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { uploadImagem } from "@/services/upload";
import {
  getLivros,
  createLivro,
  updateLivro,
  deleteLivro,
  getCategorias,
  getEditoras,
} from "@/services/livros";

export const useLivrosStore = defineStore("livros", () => {
  const livros = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const categorias = ref([]);
  const editoras = ref([]);

  const totalLivros = computed(() => livros.value.length);

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

      // campos opcionais vazios -> null
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

      // categoria é ManyToMany no backend -> precisa ser lista de IDs
      if (
        payload.categoria === null ||
        payload.categoria === "" ||
        payload.categoria === undefined
      ) {
        payload.categoria = [];
      } else {
        payload.categoria = [payload.categoria];
      }

      console.log("PAYLOAD ENVIADO:", payload);

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

  return {
    livros,
    categorias,
    editoras,
    loading,
    error,
    totalLivros,
    fetchCategorias,
    fetchEditoras,
    fetchLivros,
    addLivro,
    updateLivroStore,
    removeLivro,
  };
});
