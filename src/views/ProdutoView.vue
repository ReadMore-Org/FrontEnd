<script setup>
import { getLivro } from "@/services/livros";
import BookPage from "@/components/books/bookPage.vue";
import BookPageMobile from "@/components/books/bookPageMobile.vue";

import { ref, onMounted, computed, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";

import { useLivrosStore } from "@/stores/livros";
import { useGoogleBooksStore } from "@/stores/googleBooks";
import { nomesCategoriasDoLivro } from "@/utils/categoriasLivro";

const route = useRoute();

const livroStore = useLivrosStore();
const googleBooksStore = useGoogleBooksStore();

const livroDireto = ref(null);
const erro = ref("");
let generation = 0;
watch(() => [route.params.id, route.name], async ([value]) => {
  const current = ++generation;
  livroDireto.value = null;
  erro.value = "";
  try {
    if (["livro-google", "livro-catalogo"].includes(route.name)) { await googleBooksStore.buscarLivro(value); return; }
    const { data } = await getLivro(value);
    if (current !== generation) return;
    livroDireto.value = data;
    const index = livroStore.livros.findIndex(item => item.id === data.id);
    if (index < 0) livroStore.livros.push(data);
    else livroStore.livros[index] = data;
  } catch { if (current === generation) erro.value = "Não foi possível carregar este livro."; }
}, { immediate: true });

// verifica se é um livro da Google Books
const isGoogleBook = computed(() => ["livro-google", "livro-catalogo"].includes(route.name));

// livro exibido na página
const livro = computed(() => {
  if (isGoogleBook.value) {
    return googleBooksStore.livroSelecionado;
  }

  return livroDireto.value;
});

onMounted(() => {
  livroStore.fetchCategorias();
  window.addEventListener("resize", checkScreen);
});

const categoriaNome = computed(() =>
  nomesCategoriasDoLivro(livro.value, livroStore.categorias).join(" · "),
);

const isMobile = ref(window.innerWidth <= 650);

const checkScreen = () => {
  isMobile.value = window.innerWidth <= 650;
};

onUnmounted(() => {
  window.removeEventListener("resize", checkScreen);
});
</script>

<template>
  <div class="book-details-page">
    <p v-if="erro" role="alert">{{ erro }}</p>
    <p v-else-if="!livro" role="status">Carregando livro...</p>
    <BookPageMobile
      v-if="!erro && livro && isMobile"
      :livro="livro"
      :categoriaNome="categoriaNome"
    />

    <BookPage
      v-else-if="!erro && livro"
      :livro="livro"
      :categoriaNome="categoriaNome"
    />
  </div>
</template>

<style scoped>
.book-details-page { max-width:1160px; margin:0 auto; padding:24px 28px 80px; }
@media (max-width:650px) { .book-details-page { padding:0 0 80px; } }
</style>