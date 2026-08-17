<script setup>
import { ref } from "vue";
import { SlidersHorizontal, ChevronUp, ChevronDown } from "lucide-vue-next";

const props = defineProps({
  idiomasSelecionados: {
    type: Array,
    default: () => [],
  },
  categoriasSelecionadas: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:idiomasSelecionados", "update:categoriasSelecionadas"]);

const idiomas = [
  { label: "Português", value: "pt" },
  { label: "Inglês", value: "en" },
  { label: "Espanhol", value: "es" },
];

const categorias = [
  { label: "Ficção juvenil", value: "juvenile fiction" },
  { label: "Ação e aventura", value: "action" },
  { label: "Fantasia", value: "fantasy" },
  { label: "Romance", value: "romance" },
];

const secaoCategoriaAberta = ref(true);
const secaoIdiomaAberta = ref(true);

function toggle(lista, valor, emitName) {
  const nova = lista.includes(valor)
    ? lista.filter((v) => v !== valor)
    : [...lista, valor];
  emit(emitName, nova);
}

function limparFiltros() {
  emit("update:categoriasSelecionadas", []);
  emit("update:idiomasSelecionados", []);
}
</script>

<template>
  <aside class="filtros-sidebar">
    <div class="cabecalho-filtros">
      <SlidersHorizontal :size="17" />
      <p>Filtros</p>
    </div>

    <div class="conteudo-secoes">
      <div class="f-secao">
        <button class="f-header" @click="secaoCategoriaAberta = !secaoCategoriaAberta">
          <span class="f-titulo">Categoria</span>
          <component :is="secaoCategoriaAberta ? ChevronUp : ChevronDown" :size="14" />
        </button>
        <div v-show="secaoCategoriaAberta">
          <label v-for="c in categorias" :key="c.value" class="f-linha">
            <input
              type="checkbox"
              :checked="categoriasSelecionadas.includes(c.value)"
              @change="toggle(categoriasSelecionadas, c.value, 'update:categoriasSelecionadas')"
            />
            {{ c.label }}
          </label>
        </div>
      </div>

      <div class="f-secao">
        <button class="f-header" @click="secaoIdiomaAberta = !secaoIdiomaAberta">
          <span class="f-titulo">Idioma</span>
          <component :is="secaoIdiomaAberta ? ChevronUp : ChevronDown" :size="14" />
        </button>
        <div v-show="secaoIdiomaAberta">
          <label v-for="i in idiomas" :key="i.value" class="f-linha">
            <input
              type="checkbox"
              :checked="idiomasSelecionados.includes(i.value)"
              @change="toggle(idiomasSelecionados, i.value, 'update:idiomasSelecionados')"
            />
            {{ i.label }}
          </label>
        </div>
      </div>
    </div>

    <button class="btn-limpar" @click="limparFiltros">Limpar filtros</button>
  </aside>
</template>

<style scoped>
.filtros-sidebar {
  width: 230px;
  flex-shrink: 0;
  padding: 22px 20px 26px 28px;
  box-sizing: border-box;
}

.cabecalho-filtros {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.cabecalho-filtros p {
  font-size: 14px;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
}

.cabecalho-filtros svg {
  color: #6b4226;
}

.conteudo-secoes {
  display: flex;
  flex-direction: column;
}

.f-secao {
  padding: 12px 0;
  border-bottom: 1px solid #e8d8c3;
}

.f-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  margin-bottom: 10px;
  color: #9c8a7a;
}

.f-titulo {
  font-size: 12px;
  font-weight: 600;
  color: #2c2c2c;
}

.f-linha {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #5a4636;
  margin-bottom: 9px;
  cursor: pointer;
}

.f-linha input {
  accent-color: #6b4226;
  width: 14px;
  height: 14px;
}

.btn-limpar {
  width: 100%;
  margin-top: 16px;
  background: none;
  border: 1px solid #e8d8c3;
  color: #5a4636;
  font-size: 12px;
  padding: 9px;
  border-radius: 9px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-limpar:hover {
  background: #faf3e0;
}

/* Responsividade Mobile - Filtros lado a lado */
@media (max-width: 768px) {
  .filtros-sidebar {
    width: 100%;
    padding: 12px 16px;
  }

  .conteudo-secoes {
    flex-direction: row;
    gap: 16px;
    width: 100%;
  }

  .f-secao {
    flex: 1;
    border-bottom: none;
    border-right: 1px solid #e8d8c3;
    padding: 0 12px 0 0;
  }

  .f-secao:last-child {
    border-right: none;
    padding-right: 0;
  }

  .btn-limpar {
    margin-top: 12px;
  }
}
</style>