<script setup>
import { useLivrosStore } from "@/stores/livros";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  // Opcional: passe o ID do livro caso deseje atualizar a store direto no componente
  livroId: {
    type: [Number, String],
    default: null,
  },
  variante: {
    type: String,
    default: 'padrao',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  esconderLabel: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);
const livroStore = useLivrosStore();

const statusOpcoes = [
  { value: "quero_ler", label: "Quero ler" },
  { value: "lendo", label: "Lendo" },
  { value: "lido", label: "Lido" },
];

const selecionarOpcao = async (valor) => {
  if (props.disabled || valor === props.modelValue) return;

  // 1. Emite a atualização do v-model para a interface atualizar instantaneamente no componente pai
  emit("update:modelValue", valor);
  emit("change", valor);

  // 2. Se o livroId foi informado, atualiza reativamente na Store da Pinia sem precisar de F5
  if (props.livroId) {
    try {
      await livroStore.atualizarStatusMeuLivro(props.livroId, valor);
    } catch (error) {
      console.error("Erro ao atualizar status na store:", error);
    }
  }
};
</script>

<template>
  <div :class="['field', `variante-${variante}`]">
    <label v-if="!esconderLabel">Status de leitura</label>

    <div class="toggle-group">
      <button
        v-for="s in statusOpcoes"
        :key="s.value"
        type="button"
        :disabled="disabled"
        @click="selecionarOpcao(s.value)"
        :class="[
          'toggle-btn',
          { active: String(modelValue).toLowerCase() === String(s.value).toLowerCase() }
        ]"
      >
        {{ s.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ==========================================================================
   ESTILOS PADRÃO
   ========================================================================== */
.field {
  margin-top: 12px;
  margin-bottom: 12px;
  position: relative;
  display: block;
}

.field label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #5a4636;
  margin-bottom: 5px;
}

.toggle-group {
  display: flex;
  flex-direction: column;
}

.toggle-btn {
  flex: 1;
  border: 1px solid #e8d8c3;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: #ffffff;
  color: #5a4636;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  display: block;
  height: 35px;
  width: 150px;
  margin-bottom: 5px;
  padding: 0px 0px 0px 8px;
}

.toggle-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-btn:hover:not(.active):not(:disabled) {
  background: #c59e7e;
  color: #ffffff;
}

.toggle-btn.active {
  background: #6b4226;
  color: #ffffff;
  border-color: #6b4226;
}

/* ==========================================================================
   ESTILOS CUSTOMIZADOS PARA A VARIANTE "LIVRO"
   ========================================================================== */
.variante-livro {
  margin: 0;
}

.variante-livro .toggle-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.variante-livro .toggle-btn {
  width: auto;
  height: 35px;
  margin: 0;
  text-align: center;
  background: #fcfbf9;
  border-color: #6b4226;
  color: #6b4226;
  padding: 0 16px;
}

.variante-livro .toggle-btn:hover:not(.active):not(:disabled) {
  background: #6b4226;
  color: #ffffff;
}

.variante-livro .toggle-btn.active {
  background: #6b4226;
  color: #ffffff;
  border-color: #6b4226;
}
</style>