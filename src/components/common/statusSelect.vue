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
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #5a4636;
  margin-bottom: 5px;
}

.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1;
  padding: 7px 4px;
  border: 1px solid #e8d8c3;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: #ffffff;
  color: #5a4636;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}

.toggle-btn:hover:not(.active) {
  background: #faf3e0;
}

.toggle-btn.active {
  background: #6b4226; /* O marrom que você definiu vai entrar aqui */
  color: #ffffff;
  border-color: #6b4226;
}
</style>
