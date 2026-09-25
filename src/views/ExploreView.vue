<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { SlidersHorizontal } from "lucide-vue-next";
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

const filtrosAbertos = ref(true);

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

  <div class="explore-view">
    <FiltrosBusca
      :aberto="filtrosAbertos"
      v-model:idiomasSelecionados="idiomasSelecionados"
      v-model:categoriasSelecionadas="categoriasSelecionadas"
      @toggle="alternarFiltros"
      @update:idiomasSelecionados="buscar"
      @update:categoriasSelecionadas="buscar"
    />

    <main class="conteudo-busca" :class="{ 'sem-filtros': !filtrosAbertos }">
      <div class="topo-explore">
        <BarraBusca v-model="termo" @buscar="buscar" />

        <button
          type="button"
          class="btn-filtros-mobile"
          :aria-expanded="filtrosAbertos"
          aria-label="Abrir ou fechar filtros"
          @click="alternarFiltros"
        >
          <SlidersHorizontal :size="17" />
          <span>Filtros</span>
        </button>
      </div>

      <div v-if="jaBuscou" class="barra-resultados">
        <p class="contagem">
          <strong>{{ googleBooksStore.resultados.length }}</strong> livros encontrados
        </p>

        <OrdenarDropdown v-model="ordenacao" @update:modelValue="buscar" />
      </div>

      <div
        v-if="categoriasSelecionadas.length || idiomasSelecionados.length"
        class="chips-ativos"
      >
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

      <div v-if="googleBooksStore.loading" class="estado-vazio">
        <p>Buscando livros...</p>
      </div>

      <div
        v-else-if="jaBuscou && googleBooksStore.resultados.length === 0"
        class="estado-vazio"
      >
        <p>Nenhum livro encontrado para essa busca.</p>
      </div>

      <div v-else-if="!jaBuscou" class="estado-vazio">
        <p>Busque um livro para adicionar à sua biblioteca.</p>
      </div>

      <GradeLivros v-else titulo="" :livros="googleBooksStore.resultados">
        <template #default="{ livro }">
          <BookCard :livro="livro" />
        </template>
      </GradeLivros>
    </main>
  </div>

  <AppFooter />
</template>

<style scoped>
.explore-view {
  display: flex;
  background-color: #f5e6d3;
  min-height: 100vh;
  margin: 5vw;
  border-radius: 20px;
  overflow: hidden;
}

.conteudo-busca {
  flex: 1;
  min-width: 0;
  background: #ffffff;
  border-top-left-radius: 20px;
  box-shadow: -8px 0 20px -12px rgba(107, 66, 38, 0.1);
  padding: 22px 28px 26px 26px;
  box-sizing: border-box;
  transition: padding 0.25s ease;
}

.topo-explore {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topo-explore .barra-busca {
  flex: 1;
}

.btn-filtros-mobile {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 7px;
  flex-shrink: 0;
  background: #ffffff;
  border: 1px solid #e8d8c3;
  color: #6b4226;
  border-radius: 10px;
  padding: 10px 13px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.btn-filtros-mobile:hover {
  background: #faf3e0;
  border-color: #d6bea2;
}

.barra-resultados {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 0 12px;
  gap: 12px;
}

.contagem {
  font-size: 13px;
  color: #9c8a7a;
  margin: 0;
}

.contagem strong {
  color: #2c2c2c;
}

.chips-ativos {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.chip-ativo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #faf3e0;
  border: 1px solid #e8d8c3;
  color: #6b4226;
  font-size: 11px;
  padding: 5px 11px;
  border-radius: 14px;
  cursor: pointer;
  text-transform: capitalize;
  user-select: none;
  transition: background-color 0.2s, border-color 0.2s;
}

.chip-ativo:hover {
  background-color: #f0e2cd;
  border-color: #d6bea2;
}

.estado-vazio {
  text-align: center;
  padding: 60px 0;
  color: #9c8a7a;
  font-size: 14px;
}

@media (max-width: 768px) {
  .explore-view {
    flex-direction: column;
    margin: 16px 12px;
    border-radius: 16px;
    overflow: visible;
  }

  .conteudo-busca {
    border-top-left-radius: 0;
    border-radius: 0 0 16px 16px;
    padding: 16px;
    box-shadow: none;
  }

  .topo-explore {
    align-items: stretch;
  }

  .btn-filtros-mobile {
    display: flex;
  }

  .barra-resultados {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .estado-vazio {
    padding: 40px 16px;
  }
}
</style>
