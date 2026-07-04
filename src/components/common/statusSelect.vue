<script setup>
// Corrigido: Agora as props estão separadas corretamente
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  variante: {
    type: String,
    default: 'padrao', // Se não passar nada na View, ele usa 'padrao'
  },
});

const emit = defineEmits(["update:modelValue"]);

const statusOpcoes = [
  { value: "quero_ler", label: "Quero ler" },
  { value: "lendo", label: "Lendo" },
  { value: "lido", label: "Lido" },
];

const selecionarOpcao = (valor) => {
  emit("update:modelValue", valor);
};
</script>

<template>
  <div :class="['field', `variante-${variante}`]">
    <label>Status de leitura</label>

    <div class="toggle-group">
      <button
        v-for="s in statusOpcoes"
        :key="s.value"
        @click="selecionarOpcao(s.value)"
        :class="['toggle-btn', { active: modelValue === s.value }]"
      >
        {{ s.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ==========================================================================
   ESTILOS PADRÃO (O que você já tinha feito)
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
  padding: 0px 0px 0px 5px;
}


.toggle-btn:hover:not(.active) {
  background: #c59e7e;
  color: #ffffff;
}

.toggle-btn.active {
  background: #6b4226;
  color: #ffffff;
  border-color: #6b4226;
}

/* ==========================================================================
   ESTILOS CUSTOMIZADOS PARA A VARIANTE "LIVRO" (Exemplo de modificação)
   ========================================================================== */
   
/* Digamos que na tela de detalhes você queira os botões lado a lado e com cor diferente: */
.variante-livro .toggle-group {
  display: flex;
  gap: 10px;
}

.variante-livro .toggle-btn {
  width: auto; /* Deixa o tamanho fluido */
  text-align: center;
  background: #fcfbf9;
  border-color: #6b4226;
  color: #6b4226;
}

.variante-livro .toggle-btn.active {
  background: #6b4226; /* Uma cor diferente para essa tela se quiser */
  color: #ffffff;
  border-color: #6b4226;
}
.variante-livro {
  margin-top: 14px;
}
.variante-livro .toggle-btn:hover:not(.active) {
  background: #6b4226;
  color: #ffffff;
}
</style>