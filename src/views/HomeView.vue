<script setup>
import { onMounted, ref } from "vue";

import { useLivrosStore } from "@/stores/livros";
import { useGoogleBooksStore } from "@/stores/googleBooks";

import { Splide, SplideSlide } from "@splidejs/vue-splide";
import "@splidejs/vue-splide/css";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import mensagemBemvindo from "@/components/home/mensagemBemvindo.vue";
import cardMarketplace from "@/components/home/cardMarketplace.vue";
import BookCard from "@/components/books/bookCard.vue";
import StatsCard from "@/components/home/statsCard.vue";
import barraProgresso from "@/components/home/barraProgresso.vue";
import ProdutoView from "@/views/ProdutoView.vue";
import ListaRecursos from "@/components/home/listaRecursos.vue";
import OtherBookCard from "@/components/books/otherBookCard.vue";
import GradeBook from "@/components/books/GradeBook.vue";

const googleBooksStore = useGoogleBooksStore();
const livroStore = useLivrosStore();

const isLoading = ref(true);

onMounted(async () => {
  try {
    await Promise.all([livroStore.fetchLivros(), googleBooksStore.buscarRecomendados()]);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  } finally {
    isLoading.value = false;
  }
});

console.log("LIVROS BACKEND:", livroStore.livros);
</script>

<template>
  <div v-if="isLoading" class="loading-container">
    <div class="spinner"></div>
    <p>Carregando sua estante...</p>
  </div>

  <template v-else>
    <AppHeader />
    <cardMarketplace />
    <ListaRecursos />
    <div class="margin">

      <h1 class="titulo-secao">Resumo rápido</h1>
      <div class="lista-cards">
        <StatsCard titulo="Livros" :valor="10" />
        <StatsCard titulo="Lendo" :valor="11" />
        <StatsCard titulo="Finalizados" :valor="12" />
        <StatsCard titulo="Quero ler" :valor="13" />
      </div>

      <h1 class="titulo-secao">Meta 2026</h1>
      <barraProgresso />

      <h1 class="titulo-secao">Recomendados</h1>
      <GradeBook titulo="testando" :livros="googleBooksStore.resultados">
        <template #default="{ livro }">
          <OtherBookCard :livro="livro" />
        </template>
      </GradeBook>
    </div>

    <AppFooter />
  </template>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #fcfbf9;
  /* Um fundo levemente off-white combinando com estética de livros */
  font-family: sans-serif;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #E0D7D0;
  /* Cor suave de fundo */
  border-top: 5px solid #6B4226;
  /* A cor marrom que você usou nos títulos */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-container p {
  color: #6B4226;
  font-weight: 500;
  font-size: 18px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.lista-cards {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.titulo-secao {
  position: relative;
  display: inline-block;
  padding-bottom: 5px;
  color: #2c2c2c;
  font-weight: 500;
  margin: 60px 0 30px 0;
  font-size: 25px;
}

#top1 {
  margin-top: 120px;
}

.titulo-secao::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50%;
  height: 4px;
  border-radius: 50px;
  background: #6b4226;
}

.splide__slide {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.splide__slide:hover {
  transform: scale(1.05);
}

@media (max-width: 650px) {
  .splide__slide {
    transition: none;
  }

  .splide__slide:hover {
    transform: none;
  }

  .lista-cards {
    display: flex;
    flex-wrap: wrap;
    /* Permite que os itens se quebrem em múltiplas linhas */
    gap: 10px;
    /* Espaçamento entre os cards */
    justify-content: center;
  }

  .titulo-secao {
    font-size: 20px;
    margin-top: 50px;
  }
}
</style>
