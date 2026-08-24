<script setup>
import { onMounted, computed } from "vue";
import { RouterLink } from "vue-router";
import { useLivrosStore } from "@/stores/livros";
import { LibraryBig, BookOpenCheck, BookOpenText, Bookmark } from "lucide-vue-next";

import { Splide, SplideSlide } from "@splidejs/vue-splide";
import "@splidejs/vue-splide/css";

import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import Voltar from "@/components/common/voltar.vue";
import BookCard from "@/components/books/bookCard.vue";

const livroStore = useLivrosStore();

onMounted(() => {
  livroStore.fetchMeusLivros();
});

const getLivroId = (item) => {
  if (!item) return null;
  if (typeof item.livro === "object" && item.livro !== null) {
    return item.livro.id;
  }
  return item.livro || item.id;
};

const getLivroObjeto = (item) => {
  if (!item) return {};
  if (typeof item.livro === "object" && item.livro !== null) {
    return item.livro;
  }
  return item;
};

const totalLivros = computed(() => livroStore.totalMeusLivros);
const totalLidos = computed(() => livroStore.totalLidos);
const totalLendo = computed(() => livroStore.totalLendo);
const totalQueroLer = computed(() => livroStore.totalQueroLer);

const livrosLendo = computed(() =>
  livroStore.meusLivros.filter((i) => i.status === "lendo")
);
const livrosQueroLer = computed(() =>
  livroStore.meusLivros.filter((i) => i.status === "quero_ler")
);
const livrosLidos = computed(() =>
  livroStore.meusLivros.filter((i) => i.status === "lido")
);

const splideOptions = {
  perPage: 10,
  gap: "px",
  padding: "8px",
  breakpoints: {
    1280: {
      perPage: 3,
      gap: "32px",
    },
    1024: {
      perPage: 2,
      gap: "32px",
    },
    640: {
      perPage: 1,
      gap: "20px",
      padding: "0 10px",
    },
  },
  arrows: true,
  pagination: false,
  drag: "free",
};
</script>

<template>
  <Voltar />
  <AppHeader class="header-principal" />

  <div id="meus-livros-page">
    <!-- Cabeçalho Principal -->
    <header class="cabecalho-pagina">
      <div class="cabecalho-conteudo">
        <div class="titulos">
          <h1>Meus Livros</h1>

          <p>Gerencie sua estante organizada por status de leitura</p>
        </div>

        <!-- Painel de Estatísticas -->
        <div class="stats-container">
          <div class="stat-card">
            <div class="icon-wrapper">
              <LibraryBig :size="24" />
            </div>
            <div class="stat-info">
              <span class="stat-numero">{{ totalLivros }}</span>
              <span class="stat-rotulo">Total na Estante</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon-wrapper">
              <BookOpenText :size="24" />
            </div>
            <div class="stat-info">
              <span class="stat-numero">{{ totalLendo }}</span>
              <span class="stat-rotulo">Lendo</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon-wrapper">
              <Bookmark :size="24" />
            </div>
            <div class="stat-info">
              <span class="stat-numero">{{ totalQueroLer }}</span>
              <span class="stat-rotulo">Quero Ler</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon-wrapper">
              <BookOpenCheck :size="24" />
            </div>
            <div class="stat-info">
              <span class="stat-numero">{{ totalLidos }}</span>
              <span class="stat-rotulo">Lidos</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Conteúdo Principal -->
    <main id="livros-container">
      <!-- Seção: Lendo atualmente -->
      <section class="secao-livros" v-if="livrosLendo.length">
        <div class="cabecalho-secao">
          <h2 class="titulo-secao">Lendo Atualmente</h2>
          <span class="contador-badge">{{ livrosLendo.length }}</span>
        </div>
        <div class="lista-livros">
          <Splide :options="splideOptions">
            <SplideSlide v-for="item in livrosLendo" :key="item.id">
              <BookCard :livro="getLivroObjeto(item)" />
            </SplideSlide>
          </Splide>
        </div>
      </section>

      <!-- Seção: Quero Ler -->
      <section class="secao-livros" v-if="livrosQueroLer.length">
        <div class="cabecalho-secao">
          <h2 class="titulo-secao">Quero Ler</h2>
          <span class="contador-badge">{{ livrosQueroLer.length }}</span>
        </div>
        <div class="lista-livros">
          <Splide :options="splideOptions">
            <SplideSlide v-for="item in livrosQueroLer" :key="item.id">
              <BookCard :livro="getLivroObjeto(item)" />
            </SplideSlide>
          </Splide>
        </div>
      </section>

      <!-- Seção: Lidos -->
      <section class="secao-livros" v-if="livrosLidos.length">
        <div class="cabecalho-secao">
          <h2 class="titulo-secao">Lidos</h2>
          <span class="contador-badge">{{ livrosLidos.length }}</span>
        </div>
        <div class="lista-livros">
          <Splide :options="splideOptions">
            <SplideSlide v-for="item in livrosLidos" :key="item.id">
              <BookCard :livro="getLivroObjeto(item)" />
            </SplideSlide>
          </Splide>
        </div>
      </section>

      <!-- Estado Vazio -->
      <div v-if="!totalLivros" class="sem-livros">
        <LibraryBig :size="48" class="icone-vazio" />
        <p class="titulo-vazio">Sua estante está vazia</p>
        <p class="subtitulo-vazio">
          Adicione seus primeiros livros para acompanhar seu progresso de leitura.
        </p>
      </div>
    </main>
  </div>

  <AppFooter />
</template>

<style scoped>
#meus-livros-page {
  min-height: 80vh;
  background-color: #faf7f2;
}

/* Header & Banner */
.cabecalho-pagina {
  background: linear-gradient(135deg, #f3e7d7 0%, #e8d7c3 100%);
  padding: 40px 60px;
  border-bottom: 1px solid #e2d2bd;
}

.cabecalho-conteudo {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.titulos h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2d2d2d;
  margin: 0;
  letter-spacing: -0.5px;
}

.titulos p {
  color: #6d6d6d;
  font-size: 1.05rem;
  margin-top: 6px;
  margin-bottom: 0;
}

/* Grid de Cards Estatísticos */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 12px rgba(107, 66, 38, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(107, 66, 38, 0.08);
}

.icon-wrapper {
  background: #6b4226;
  color: #ffffff;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-numero {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2d2d2d;
  line-height: 1.2;
}

.stat-rotulo {
  font-size: 0.85rem;
  color: #6d6d6d;
  font-weight: 500;
}

/* Container de Livros */
#livros-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 60px 80px 60px;
}

.secao-livros {
  margin-bottom: 48px;
}

.cabecalho-secao {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.titulo-secao {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d2d2d;
  margin: 0;
  position: relative;
}

.contador-badge {
  background-color: #e8d7c3;
  color: #6b4226;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
}

.card-link {
  text-decoration: none;
  display: block;
  height: 100%;
}

.lista-livros {
  width: 100%;
}

/* Customização das Setas e Slider */
:deep(.splide__track) {
  padding: 12px 4px;
}

:deep(.splide__arrow) {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8d7c3;
  opacity: 0.9;
  width: 40px;
  height: 40px;
  transition: opacity 0.2s, transform 0.2s;
}

:deep(.splide__arrow:hover) {
  opacity: 1;
  background: #ffffff;
}

:deep(.splide__arrow--prev) {
  left: -20px;
}

:deep(.splide__arrow--next) {
  right: -20px;
}

:deep(.splide__arrow svg) {
  fill: #6b4226;
  width: 16px;
  height: 16px;
}

:deep(.splide__slide) {
  box-sizing: border-box;
  padding: 0 20px;
  transition: transform 0.25s ease;
}

:deep(.splide__slide > .card-link) {
  display: block;
  width: 100%;
}

.splide__slide:hover {
  transform: translateY(-6px);
}

/* Estado Vazio */
.sem-livros {
  text-align: center;
  padding: 80px 20px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px dashed #e8d7c3;
  margin-top: 20px;
}

.icone-vazio {
  color: #8a6a52;
  margin-bottom: 16px;
  opacity: 0.7;
}

.titulo-vazio {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d2d2d;
  margin: 0 0 8px 0;
}

.subtitulo-vazio {
  color: #6d6d6d;
  font-size: 0.95rem;
  margin: 0;
}

/* Responsividade */
@media (max-width: 768px) {
  .header-principal {
    display: content !important;
  }

  .cabecalho-pagina {
    padding: 24px 20px;
  }

  .titulos h1 {
    font-size: 1.6rem;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 12px 14px;
    gap: 10px;
  }

  .stat-numero {
    font-size: 1.3rem;
  }

  #livros-container {
    padding: 24px 20px 60px 20px;
  }

  .titulo-secao {
    font-size: 1.3rem;
  }

  :deep(.splide__arrow) {
    display: none;
  }

  .splide__slide:hover {
    transform: none;
  }
}
</style>
