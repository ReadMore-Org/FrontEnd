<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

// Declarando o emit para o v-model funcionar
const emit = defineEmits(["update:modelValue"]);

const statusOpcoes = [
  { value: "quero_ler", label: "Quero ler" },
  { value: "lendo", label: "Lendo" },
  { value: "lido", label: "Lido" },
];

// Função para atualizar o valor quando o usuário clicar
const selecionarOpcao = (valor) => {
  emit("update:modelValue", valor);
};
</script>

<template>
  <div class="field">
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
.field {
  margin-bottom: 12px;
  position: relative;
  display: block;
}

.field label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #5a4636; /* Mantido o da dev */
  margin-bottom: 5px;
}

.toggle-btn {
  flex: 1;
  padding: 7px 4px;        /* Mantido o da dev */
  border: 1px solid #e8d8c3; /* Mantido o da dev */
  border-radius: 8px;       /* Mantido o da dev */
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
  background: #faf3e0;
}

.toggle-btn.active {
  background: #6b4226;
  color: #ffffff;
  border-color: #6b4226;
}
</style>