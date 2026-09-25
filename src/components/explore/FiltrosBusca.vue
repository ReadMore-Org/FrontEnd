<script setup>
import { ref } from "vue";
import {
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Check,
  X,
} from "lucide-vue-next";

defineProps({
  aberto: {
    type: Boolean,
    default: true,
  },
  idiomasSelecionados: {
    type: Array,
    default: () => [],
  },
  categoriasSelecionadas: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "toggle",
  "update:idiomasSelecionados",
  "update:categoriasSelecionadas",
]);

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
  <aside class="filtros-sidebar" :class="{ fechado: !aberto }">
    <button
      type="button"
      class="btn-toggle"
      :class="{ 'btn-toggle-fechado': !aberto }"
      :aria-label="aberto ? 'Fechar filtros' : 'Abrir filtros'"
      :aria-expanded="aberto"
      @click="emit('toggle')"
    >
      <SlidersHorizontal :size="17" />
      <span v-if="aberto">Ocultar</span>
      <X v-else :size="15" />
    </button>

    <div v-if="aberto" class="filtros-conteudo">
      <div class="cabecalho-filtros">
        <div class="titulo-filtros">
          <SlidersHorizontal :size="17" />
          <p>Filtros</p>
        </div>
        <span class="subtitulo-filtros">Refine sua busca</span>
      </div>

      <div class="conteudo-secoes">
        <div class="f-secao">
          <button
            type="button"
            class="f-header"
            :aria-expanded="secaoCategoriaAberta"
            @click="secaoCategoriaAberta = !secaoCategoriaAberta"
          >
            <span class="f-titulo">Categoria</span>
            <component
              :is="secaoCategoriaAberta ? ChevronUp : ChevronDown"
              :size="15"
            />
          </button>

          <div v-show="secaoCategoriaAberta" class="opcoes-filtro">
            <label v-for="c in categorias" :key="c.value" class="f-linha">
              <input
                type="checkbox"
                :checked="categoriasSelecionadas.includes(c.value)"
                @change="toggle(categoriasSelecionadas, c.value, 'update:categoriasSelecionadas')"
              />
              <span class="checkbox-custom">
                <Check :size="13" stroke-width="3" />
              </span>
              <span class="label-filtro">{{ c.label }}</span>
            </label>
          </div>
        </div>

        <div class="f-secao">
          <button
            type="button"
            class="f-header"
            :aria-expanded="secaoIdiomaAberta"
            @click="secaoIdiomaAberta = !secaoIdiomaAberta"
          >
            <span class="f-titulo">Idioma</span>
            <component
              :is="secaoIdiomaAberta ? ChevronUp : ChevronDown"
              :size="15"
            />
          </button>

          <div v-show="secaoIdiomaAberta" class="opcoes-filtro">
            <label v-for="i in idiomas" :key="i.value" class="f-linha">
              <input
                type="checkbox"
                :checked="idiomasSelecionados.includes(i.value)"
                @change="toggle(idiomasSelecionados, i.value, 'update:idiomasSelecionados')"
              />
              <span class="checkbox-custom">
                <Check :size="13" stroke-width="3" />
              </span>
              <span class="label-filtro">{{ i.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="btn-limpar"
        :disabled="!categoriasSelecionadas.length && !idiomasSelecionados.length"
        @click="limparFiltros"
      >
        Limpar filtros
      </button>
    </div>
  </aside>
</template>

<style scoped>
.filtros-sidebar {
  position: relative;
  width: 248px;
  min-width: 248px;
  flex-shrink: 0;
  padding: 22px 18px 26px 24px;
  box-sizing: border-box;
  background: #f5e6d3;
  transition: width 0.25s ease, min-width 0.25s ease, padding 0.25s ease;
}

.filtros-sidebar.fechado {
  width: 58px;
  min-width: 58px;
  padding: 22px 10px;
}

.filtros-conteudo {
  animation: aparecer-filtros 0.2s ease;
}

@keyframes aparecer-filtros {
  from {
    opacity: 0;
    transform: translateX(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.btn-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  min-height: 34px;
  margin-bottom: 16px;
  padding: 7px 9px;
  border: 1px solid #e1cdb6;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.55);
  color: #6b4226;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.btn-toggle:hover {
  background: #ffffff;
  border-color: #c9aa8c;
}

.btn-toggle-fechado {
  margin-bottom: 0;
  width: 38px;
  margin-left: auto;
  margin-right: auto;
}

.btn-toggle-fechado svg:last-child {
  display: none;
}

.cabecalho-filtros {
  padding: 0 2px 16px;
  border-bottom: 1px solid #e8d8c3;
}

.titulo-filtros {
  display: flex;
  align-items: center;
  gap: 8px;
}

.titulo-filtros svg {
  color: #6b4226;
}

.titulo-filtros p {
  margin: 0;
  color: #2c2c2c;
  font-size: 15px;
  font-weight: 700;
}

.subtitulo-filtros {
  display: block;
  margin-top: 4px;
  color: #9c8a7a;
  font-size: 10.5px;
}

.conteudo-secoes {
  display: flex;
  flex-direction: column;
}

.f-secao {
  padding: 15px 2px;
  border-bottom: 1px solid #e8d8c3;
}

.f-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 0 11px;
  padding: 0;
  border: none;
  background: none;
  color: #5a4636;
  cursor: pointer;
}

.f-header:hover .f-titulo {
  color: #6b4226;
}

.f-titulo {
  font-size: 12px;
  font-weight: 700;
  color: #2c2c2c;
  transition: color 0.15s ease;
}

.f-header svg {
  color: #9c8a7a;
}

.opcoes-filtro {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.f-linha {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 30px;
  padding: 3px 6px;
  margin: 0 -6px;
  border-radius: 8px;
  color: #5a4636;
  font-size: 12.5px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.f-linha:hover {
  background: rgba(255, 255, 255, 0.55);
  color: #6b4226;
}

.f-linha input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.checkbox-custom {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  box-sizing: border-box;
  border: 1.5px solid #c9b09a;
  border-radius: 5px;
  background: #ffffff;
  color: transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.f-linha input:checked + .checkbox-custom {
  background: #6b4226;
  border-color: #6b4226;
  color: #ffffff;
}

.f-linha input:checked + .checkbox-custom svg {
  animation: check-pop 0.15s ease;
}

.f-linha:has(input:checked) {
  color: #6b4226;
  font-weight: 600;
}

.f-linha:focus-within .checkbox-custom {
  outline: 2px solid rgba(107, 66, 38, 0.2);
  outline-offset: 2px;
}

@keyframes check-pop {
  from {
    transform: scale(0.6);
  }
  to {
    transform: scale(1);
  }
}

.label-filtro {
  line-height: 1.3;
}

.btn-limpar {
  width: 100%;
  margin-top: 16px;
  padding: 9px 10px;
  border: 1px solid #e1cdb6;
  border-radius: 9px;
  background: transparent;
  color: #6b4226;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.btn-limpar:hover:not(:disabled) {
  background: #ffffff;
  border-color: #c9aa8c;
}

.btn-limpar:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .filtros-sidebar,
  .filtros-sidebar.fechado {
    width: 100%;
    min-width: 0;
    padding: 12px 16px;
    background: #f5e6d3;
  }

  .filtros-sidebar.fechado {
    display: none;
  }

  .filtros-sidebar .btn-toggle {
    display: none;
  }

  .filtros-conteudo {
    animation: none;
  }

  .cabecalho-filtros {
    display: none;
  }

  .conteudo-secoes {
    flex-direction: row;
    gap: 16px;
    width: 100%;
  }

  .f-secao {
    flex: 1;
    padding: 0 12px 0 0;
    border-bottom: none;
    border-right: 1px solid #e8d8c3;
  }

  .f-secao:last-child {
    padding-right: 0;
    border-right: none;
  }

  .btn-limpar {
    margin-top: 12px;
  }
}
</style>
