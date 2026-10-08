<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { SlidersHorizontal, BookOpen, SearchX } from "lucide-vue-next";
import { useGoogleBooksStore } from "@/stores/googleBooks";
import BarraBusca from "@/components/explore/BarraBusca.vue";
import FiltrosBusca from "@/components/explore/FiltrosBusca.vue";
import OrdenarDropdown from "@/components/explore/OrdenarDropDown.vue";
import GradeLivros from "@/components/books/GradeBook.vue";
import BookCard from "@/components/books/otherBookCard.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import Voltar from "@/components/common/voltar.vue";

const googleBooksStore = useGoogleBooksStore();

const {
  termoBusca: termo,
  idiomasSelecionados,
  categoriasSelecionadas,
  ordenacao,
  jaBuscou,
} = storeToRefs(googleBooksStore);

// no desktop os filtros começam abertos; no celular começam fechados
const ehDesktop =
  typeof window === "undefined" ||
  window.matchMedia("(min-width: 769px)").matches;

const filtrosAbertos = ref(ehDesktop);

const totalFiltros = computed(
  () => categoriasSelecionadas.value.length + idiomasSelecionados.value.length
);

const queryFinal = computed(() => {
  const partes = [];
  const termoLimpo = termo.value?.trim();

  if (termoLimpo) partes.push(termoLimpo);
  categoriasSelecionadas.value.forEach((c) => partes.push(`subject:${c}`));

  return partes.join(" ");
});

let timerBusca = null;

function buscar() {
  if (!queryFinal.value) return;

  clearTimeout(timerBusca);

  timerBusca = setTimeout(() => {
    jaBuscou.value = true;
    googleBooksStore.pesquisarLivros(queryFinal.value);
  }, 300);
}

function removerFiltroCategoria(valor) {
  categoriasSelecionadas.value = categoriasSelecionadas.value.filter((v) => v !== valor);
  buscar();
}

function removerFiltroIdioma(valor) {
  idiomasSelecionados.value = idiomasSelecionados.value.filter((v) => v !== valor);
  buscar();
}

function alternarFiltros() {
  filtrosAbertos.value = !filtrosAbertos.value;
}
</script>

<template>
  <Voltar />
  <AppHeader />

  <div class="explore-page">
    <div class="explore-container">
      <header class="explore-hero">
        <h1 class="titulo-pagina">Explorar livros</h1>
        <p class="subtitulo-pagina">Busque no catálogo e adicione à sua biblioteca.</p>

        <div class="topo-explore">
          <BarraBusca v-model="termo" @buscar="buscar" />

          <button
            type="button"
            class="btn-filtros-mobile"
            :aria-expanded="filtrosAbertos"
            aria-label="Abrir filtros"
            @click="alternarFiltros"
          >
            <SlidersHorizontal :size="17" />
            <span>Filtros</span>
            <span v-if="totalFiltros" class="badge-filtros">{{ totalFiltros }}</span>
          </button>
        </div>
      </header>

      <div class="explore-layout">
        <FiltrosBusca
          :aberto="filtrosAbertos"
          v-model:idiomasSelecionados="idiomasSelecionados"
          v-model:categoriasSelecionadas="categoriasSelecionadas"
          @toggle="alternarFiltros"
          @update:idiomasSelecionados="buscar"
          @update:categoriasSelecionadas="buscar"
        />

        <main class="resultados">
          <div v-if="jaBuscou" class="barra-resultados">
            <p class="contagem">
              <strong>{{ googleBooksStore.resultados.length }}</strong> livros encontrados
            </p>

            <OrdenarDropdown v-model="ordenacao" @update:modelValue="buscar" />
          </div>

          <div v-if="totalFiltros" class="chips-ativos">
            <span
              v-for="c in categoriasSelecionadas"
              :key="c"
              class="chip-ativo"
              @click="removerFiltroCategoria(c)"
            >
              {{ c }} <span aria-hidden="true">✕</span>
            </span>

            <span
              v-for="i in idiomasSelecionados"
              :key="i"
              class="chip-ativo"
              @click="removerFiltroIdioma(i)"
            >
              {{ i }} <span aria-hidden="true">✕</span>
            </span>
          </div>

          <div v-if="googleBooksStore.loading" class="estado">
            <div class="spinner"></div>
            <p>Buscando livros...</p>
          </div>

          <div
            v-else-if="jaBuscou && googleBooksStore.resultados.length === 0"
            class="estado"
          >
            <span class="estado-icone"><SearchX :size="26" /></span>
            <h2>Nenhum livro encontrado</h2>
            <p>Tente outro termo ou remova alguns filtros.</p>
          </div>

          <div v-else-if="!jaBuscou" class="estado">
            <span class="estado-icone"><BookOpen :size="26" /></span>
            <h2>Encontre seu próximo livro</h2>
            <p>Busque por título, autor ou ISBN e adicione à sua biblioteca.</p>
          </div>

          <GradeLivros v-else titulo="" :livros="googleBooksStore.resultados">
            <template #default="{ livro }">
              <BookCard :livro="livro" />
            </template>
          </GradeLivros>
        </main>
      </div>
    </div>
  </div>

  <AppFooter />
</template>

<style scoped>
.explore-page {
  background-color: #f5e6d3;
  min-height: 100vh;
}

.explore-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 32px 24px 64px;
  box-sizing: border-box;
}

/* topo */
.explore-hero {
  margin-bottom: 24px;
}

.titulo-pagina {
  margin: 0 0 4px;
  font-size: 28px;
  font-weight: 700;
  color: #2c2c2c;
}

.subtitulo-pagina {
  margin: 0 0 18px;
  font-size: 14px;
  color: #5a4636;
}

.topo-explore {
  display: flex;
  align-items: stretch;
  gap: 10px;
}

.topo-explore .barra-busca {
  flex: 1;
  min-width: 0;
}

.btn-filtros-mobile {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 7px;
  flex-shrink: 0;
  padding: 0 14px;
  background: #ffffff;
  border: 1px solid #e8d8c3;
  border-radius: 14px;
  color: #6b4226;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(107, 66, 38, 0.08);
  transition: background-color 0.2s ease;
}

.btn-filtros-mobile:hover {
  background: #faf3e0;
}

.badge-filtros {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #6b4226;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
}

/* layout principal */
.explore-layout {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.resultados {
  flex: 1;
  min-width: 0;
  min-height: 420px;
  box-sizing: border-box;
  padding: 22px 24px 26px;
  background: #ffffff;
  border: 1px solid #e8d8c3;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(107, 66, 38, 0.08);
}

.barra-resultados {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid #e8d8c3;
}

.contagem {
  margin: 0;
  font-size: 13px;
  color: #9c8a7a;
}

.contagem strong {
  color: #2c2c2c;
}

.chips-ativos {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 18px;
}

.chip-ativo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  background: #faf3e0;
  border: 1px solid #e8d8c3;
  border-radius: 14px;
  color: #6b4226;
  font-size: 11px;
  text-transform: capitalize;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s, border-color 0.2s;
}

.chip-ativo:hover {
  background-color: #f0e2cd;
  border-color: #d6bea2;
}

/* estados */
.estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 64px 16px;
  text-align: center;
}

.estado-icone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 8px;
  background: #faf3e0;
  border: 1px solid #e8d8c3;
  border-radius: 50%;
  color: #6b4226;
}

.estado h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c2c2c;
}

.estado p {
  margin: 0;
  max-width: 320px;
  font-size: 13.5px;
  color: #9c8a7a;
}

.spinner {
  width: 38px;
  height: 38px;
  margin-bottom: 8px;
  border: 4px solid #e8d8c3;
  border-top-color: #6b4226;
  border-radius: 50%;
  animation: girar 1s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

/* tablet / celular */
@media (max-width: 768px) {
  .explore-container {
    padding: 20px 14px 40px;
  }

  .titulo-pagina {
    font-size: 22px;
  }

  .subtitulo-pagina {
    margin-bottom: 14px;
    font-size: 13px;
  }

  .btn-filtros-mobile {
    display: inline-flex;
  }

  .explore-layout {
    display: block;
  }

  .resultados {
    min-height: 320px;
    padding: 16px 14px 20px;
    border-radius: 14px;
  }

  .chips-ativos {
    flex-wrap: nowrap;
    overflow-x: auto;
    margin-right: -14px;
    padding-right: 14px;
    scrollbar-width: none;
  }

  .chips-ativos::-webkit-scrollbar {
    display: none;
  }

  .chip-ativo {
    flex-shrink: 0;
    white-space: nowrap;
  }

  .estado {
    padding: 44px 8px;
  }
}

/* celular: grade de 2 colunas com cards fluidos */
@media (max-width: 650px) {
  .resultados :deep(.grade-livros) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 14px;
  }

  .resultados :deep(.card-livro-grid),
  .resultados :deep(.capa-wrapper),
  .resultados :deep(.capa) {
    width: 100%;
  }
}
</style>