<script setup>
import { computed, ref, watch, onBeforeUnmount } from "vue";
import {
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Check,
  X,
} from "lucide-vue-next";

const props = defineProps({
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

const totalAtivos = computed(
  () => props.categoriasSelecionadas.length + props.idiomasSelecionados.length
);

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

// no celular o painel sobe de baixo da tela: trava o scroll da página enquanto aberto
watch(
  () => props.aberto,
  (aberto) => {
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    document.body.style.overflow = aberto && mobile ? "hidden" : "";
  }
);

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});
</script>

<template>
  <div class="filtros-root" :class="{ fechado: !aberto }">
    <div v-if="aberto" class="filtros-backdrop" @click="emit('toggle')"></div>

    <aside class="filtros-sidebar" :class="{ fechado: !aberto }">
      <button
        v-if="!aberto"
        type="button"
        class="btn-abrir"
        aria-label="Abrir filtros"
        :aria-expanded="aberto"
        @click="emit('toggle')"
      >
        <SlidersHorizontal :size="18" />
        <span v-if="totalAtivos" class="badge badge-flutuante">{{ totalAtivos }}</span>
      </button>

      <div v-else class="filtros-conteudo">
        <div class="cabecalho-filtros">
          <div class="titulo-filtros">
            <SlidersHorizontal :size="17" />
            <p>Filtros</p>
            <span v-if="totalAtivos" class="badge">{{ totalAtivos }}</span>
          </div>

          <button
            type="button"
            class="btn-fechar"
            aria-label="Fechar filtros"
            :aria-expanded="aberto"
            @click="emit('toggle')"
          >
            <span class="txt-ocultar">Ocultar</span>
            <X :size="18" class="icone-x" />
          </button>
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
              <component :is="secaoCategoriaAberta ? ChevronUp : ChevronDown" :size="15" />
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
              <component :is="secaoIdiomaAberta ? ChevronUp : ChevronDown" :size="15" />
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

        <div class="rodape-filtros">
          <button
            type="button"
            class="btn-limpar"
            :disabled="!totalAtivos"
            @click="limparFiltros"
          >
            Limpar filtros
          </button>

          <button type="button" class="btn-aplicar" @click="emit('toggle')">
            Ver resultados
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
/* ---------- desktop ---------- */
.filtros-root {
  position: sticky;
  top: 16px; /* se o seu header for fixo, aumente esse valor */
  flex-shrink: 0;
  align-self: flex-start;
}

.filtros-backdrop {
  display: none;
}

.filtros-sidebar {
  position: relative;
  width: 264px;
  box-sizing: border-box;
  padding: 20px 18px 18px;
  background: #ffffff;
  border: 1px solid #e8d8c3;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(107, 66, 38, 0.08);
  transition: width 0.25s ease, padding 0.25s ease;
}

.filtros-sidebar.fechado {
  width: 52px;
  padding: 5px;
  border-radius: 14px;
}

.filtros-conteudo {
  animation: aparecer 0.2s ease;
}

.btn-abrir {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #6b4226;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-abrir:hover {
  background: #faf3e0;
}

.badge {
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

.badge-flutuante {
  position: absolute;
  top: -3px;
  right: -3px;
}

.cabecalho-filtros {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
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

.btn-fechar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 2px;
  border: none;
  background: none;
  color: #9c8a7a;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;
}

.btn-fechar:hover {
  color: #6b4226;
}

.icone-x {
  display: none;
}

.f-secao {
  padding: 14px 0;
  border-bottom: 1px solid #e8d8c3;
}

.f-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 0 10px;
  padding: 0;
  border: none;
  background: none;
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
  min-height: 32px;
  margin: 0 -6px;
  padding: 3px 6px;
  border-radius: 8px;
  color: #5a4636;
  font-size: 12.5px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.f-linha:hover {
  background: #faf3e0;
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
  flex: 0 0 17px;
  width: 17px;
  height: 17px;
  box-sizing: border-box;
  border: 1.5px solid #c9b09a;
  border-radius: 5px;
  background: #ffffff;
  color: transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
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

.label-filtro {
  line-height: 1.3;
}

.rodape-filtros {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.btn-limpar {
  flex: 1;
  padding: 9px 10px;
  border: 1px solid #e8d8c3;
  border-radius: 10px;
  background: transparent;
  color: #6b4226;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.btn-limpar:hover:not(:disabled) {
  background: #faf3e0;
  border-color: #d6bea2;
}

.btn-limpar:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-aplicar {
  display: none;
}

@keyframes aparecer {
  from {
    opacity: 0;
    transform: translateX(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes check-pop {
  from {
    transform: scale(0.6);
  }
  to {
    transform: scale(1);
  }
}

/* ---------- celular: painel que sobe de baixo ---------- */
@media (max-width: 768px) {
  .filtros-root {
    position: static;
  }

  .filtros-root.fechado {
    display: none;
  }

  .filtros-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1099;
    background: rgba(44, 44, 44, 0.45);
    animation: fade-in 0.2s ease;
  }

  .filtros-sidebar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1100;
    width: 100%;
    max-height: 86vh;
    overflow-y: auto;
    padding: 0;
    border: none;
    border-top: 1px solid #e8d8c3;
    border-radius: 20px 20px 0 0;
    box-shadow: 0 -10px 30px rgba(107, 66, 38, 0.18);
    animation: subir 0.25s ease;
  }

  .filtros-conteudo {
    animation: none;
  }

  .cabecalho-filtros {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 22px 18px 12px;
    background: #ffffff;
  }

  .cabecalho-filtros::before {
    content: "";
    position: absolute;
    top: 8px;
    left: 50%;
    width: 38px;
    height: 4px;
    border-radius: 2px;
    background: #e8d8c3;
    transform: translateX(-50%);
  }

  .txt-ocultar {
    display: none;
  }

  .icone-x {
    display: block;
  }

  .btn-fechar {
    width: 34px;
    height: 34px;
    padding: 0;
    border-radius: 50%;
    background: #faf3e0;
    color: #6b4226;
  }

  .conteudo-secoes {
    padding: 0 18px;
  }

  .f-secao:last-child {
    border-bottom: none;
  }

  .f-linha {
    min-height: 40px;
    font-size: 13.5px;
  }

  .rodape-filtros {
    position: sticky;
    bottom: 0;
    margin-top: 0;
    padding: 12px 18px calc(12px + env(safe-area-inset-bottom));
    background: #ffffff;
    border-top: 1px solid #e8d8c3;
  }

  .btn-limpar {
    padding: 12px 10px;
    font-size: 13px;
  }

  .btn-aplicar {
    display: block;
    flex: 1.4;
    padding: 12px 10px;
    border: none;
    border-radius: 10px;
    background: #6b4226;
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-aplicar:hover {
    background: #4a2c1a;
  }
}

@keyframes subir {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>