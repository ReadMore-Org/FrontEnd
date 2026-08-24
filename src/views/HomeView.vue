<script setup>
import { onMounted, ref, computed } from "vue";

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
    // Carrega dados essenciais da sua API primeiro
    await Promise.all([livroStore.fetchLivros(), livroStore.fetchMeusLivros()]);
  } catch (error) {
    console.error("Erro ao carregar dados da estante:", error);
  } finally {
    isLoading.value = false;
  }

  // Busca os recomendados em segundo plano para não travar a tela
  googleBooksStore.buscarRecomendados();
});

// Consome exatamente as mesmas propriedades reativas da store usadas no "meusLivros"
const totalLivros = computed(() => livroStore.totalMeusLivros);
const totalLidos = computed(() => livroStore.totalLidos);
const totalLendo = computed(() => livroStore.totalLendo);
const totalQueroLer = computed(() => livroStore.totalQueroLer);
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
        <StatsCard titulo="Livros" :valor="totalLivros" />
        <StatsCard titulo="Lendo" :valor="totalLendo" />
        <StatsCard titulo="Finalizados" :valor="totalLidos" />
        <StatsCard titulo="Quero ler" :valor="totalQueroLer" />
      </div>

      <h1 class="titulo-secao">Meta 2026</h1>
      <barraProgresso />

      <h1 class="titulo-secao">Recomendados</h1>
      <!-- 1. Estado de Carregamento dos Recomendados -->
      <div v-if="googleBooksStore.loading" class="status-recomendados">
        <div class="spinner-small"></div>
        <p>Buscando livros recomendados para você...</p>
      </div>

      <!-- 2. Estado de Erro / Falha de API -->
      <div v-else-if="googleBooksStore.error" class="status-recomendados erro">
        <p>{{ googleBooksStore.error }}</p>
        <button
          @click="googleBooksStore.buscarRecomendados(true)"
          class="btn-tentar-novamente"
        >
          Tentar novamente
        </button>
      </div>

      <!-- 3. Estado de Sucesso (Lista de Livros) -->
      <GradeBook
        v-else-if="googleBooksStore.resultados.length > 0"
        titulo="testando"
        :livros="googleBooksStore.resultados"
      >
        <template #default="{ livro }">
          <OtherBookCard :livro="livro" />
        </template>
      </GradeBook>

      <!-- 4. Fallback se não retornar nenhum item -->
      <div v-else class="status-recomendados">
        <p>Nenhuma recomendação encontrada no momento.</p>
      </div>
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
  font-family: sans-serif;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e0d7d0;
  border-top: 5px solid #6b4226;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-container p {
  color: #6b4226;
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
.status-recomendados {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: none;
  border-radius: 12px;
  margin-bottom: 30px;
  text-align: center;
}

.status-recomendados.erro p {
  color: #c0392b;
  margin-bottom: 12px;
}

.btn-tentar-novamente {
  background-color: #6b4226;
  color: #ffffff;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-tentar-novamente:hover {
  background-color: #52321c;
}

.spinner-small {
  width: 28px;
  height: 28px;
  border: 3px solid #e0d7d0;
  border-top: 3px solid #6b4226;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
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
    gap: 10px;
    justify-content: center;
  }

  .titulo-secao {
    font-size: 20px;
    margin-top: 50px;
  }
}
</style>
