<script setup>
import BookPage from "@/components/books/bookPage.vue";
import BookPageMobile from "@/components/books/bookPageMobile.vue";

import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRoute } from "vue-router";

import { useLivrosStore } from "@/stores/livros";
import { useGoogleBooksStore } from "@/stores/googleBooks";

const route = useRoute();

const livroStore = useLivrosStore();
const googleBooksStore = useGoogleBooksStore();

const id = route.params.id;

// verifica se é um livro da Google Books
const isGoogleBook = computed(() => route.name === "livro-google");

// livro exibido na página
const livro = computed(() => {
  if (isGoogleBook.value) {
    return googleBooksStore.livroSelecionado;
  }

  return livroStore.livros.find((l) => l.id === Number(id));
});

onMounted(async () => {
  if (isGoogleBook.value) {
    await googleBooksStore.buscarLivro(id);
  } else {
    await Promise.all([
      livroStore.fetchLivros(),
      livroStore.fetchCategorias(),
    ]);
  }

  window.addEventListener("resize", checkScreen);
});

const categoriaNome = computed(() => {
  if (isGoogleBook.value) {
    return "";
  }

  const livroAtual = livro.value;
  const categorias = livroStore.categorias;

  if (!livroAtual || !categorias.length) return "";

  const categoria = categorias.find(
    (c) => Number(c.id) === Number(livroAtual.categoria)
  );

  return categoria?.descricao || "Sem categoria";
});

const isMobile = ref(window.innerWidth <= 650);

const checkScreen = () => {
  isMobile.value = window.innerWidth <= 650;
};

onUnmounted(() => {
  window.removeEventListener("resize", checkScreen);
});
</script>

<template>
  <div class="margin">
    <BookPageMobile
      v-if="isMobile"
      :livro="livro"
      :categoriaNome="categoriaNome"
    />

    <BookPage
      v-else
      :livro="livro"
      :categoriaNome="categoriaNome"
    />
  </div>
</template>

<style scoped></style>