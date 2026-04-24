<script setup>
import BookPage from "@/components/books/bookPage.vue";
import BookPageMobile from "@/components/books/bookPageMobile.vue";

import { ref, onMounted, computed, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useLivrosStore } from "@/stores/livros";


const route = useRoute();
const livroStore = useLivrosStore();
const id = Number(route.params.id);

const livro = computed(() => {
  return livroStore.livros.find((l) => l.id === id);
});

onMounted(async () => {
  await Promise.all([
    livroStore.fetchLivros(),
    livroStore.fetchCategorias()
  ]);
});

const categoriaNome = computed(() => {
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

onMounted(() => {
  window.addEventListener("resize", checkScreen);
});

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
