<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  livros: {
    type: Array,
    required: true,
  },
  linhasIniciais: {
    type: Number,
    default: 3,
  },
  linhasPorClique: {
    type: Number,
    default: 3,
  },
  carregandoMais: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["buscarMaisDados"]);

const ITEM_WIDTH = 180;
const GAP = 24;

const gradeEl = ref(null);
const colunas = ref(1);
const linhasVisiveis = ref(props.linhasIniciais);

let observer;

function calcularColunas(largura) {
  return Math.max(1, Math.floor((largura + GAP) / (ITEM_WIDTH + GAP)));
}

onMounted(() => {
  if (!gradeEl.value) return;
  colunas.value = calcularColunas(gradeEl.value.clientWidth);
  observer = new ResizeObserver((entries) => {
    colunas.value = calcularColunas(entries[0].contentRect.width);
  });
  observer.observe(gradeEl.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

const quantidadeVisivel = computed(() => colunas.value * linhasVisiveis.value);
const livrosVisiveis = computed(() =>
  props.livros.slice(0, quantidadeVisivel.value),
);
const temMaisNaGrade = computed(
  () => quantidadeVisivel.value < props.livros.length,
);

function carregarMais() {
  if (props.carregandoMais) return;

  if (temMaisNaGrade.value) {
    linhasVisiveis.value += props.linhasPorClique;
  } else {
    emit("buscarMaisDados");
    linhasVisiveis.value += props.linhasPorClique;
  }
}
</script>

<template>
  <section class="grade-livros-secao">
    <div class="grade-livros" ref="gradeEl">
      <div v-for="livro in livrosVisiveis" :key="livro.id" class="item-livro">
        <slot :livro="livro" />
      </div>
    </div>

    <div class="acoes-grade">
      <button
        class="btn-carregar-mais"
        @click="carregarMais"
        :disabled="carregandoMais"
      >
        {{ carregandoMais ? "Buscando mais livros..." : "Carregar mais" }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.grade-livros-secao {
  width: 100%;
}
.grade-livros {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
}
.item-livro {
  text-decoration: none;
  color: inherit;
}
.acoes-grade {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
.btn-carregar-mais {
  background-color: #fff;
  color: #6b4226;
  border: 1px solid #6b4226;
  border-radius: 50px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-carregar-mais:hover:not(:disabled) {
  background-color: #6b4226;
  color: #fff;
  transform: translateY(-2px);
}
.btn-carregar-mais:disabled {
  background-color: #e8d8c3;
  color: #9c8a7a;
  border-color: #e8d8c3;

  cursor: not-allowed;
  opacity: 0.7;

  pointer-events: none;
}
</style>
