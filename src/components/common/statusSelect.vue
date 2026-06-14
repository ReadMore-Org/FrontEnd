<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

defineEmits(['update:modelValue'])

const statusOpcoes = [
  { value: 'quero_ler', label: 'Quero ler' },
  { value: 'lendo', label: 'Lendo' },
  { value: 'lido', label: 'Lido' },
]
</script>
<template>
  <div class="field">
  <label>Status de leitura</label>

  <div class="toggle-group">
    <button
      v-for="s in statusOpcoes"
      :key="s.value"
      :class="['toggle-btn', { active: props.modelValue === s.value }]"
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
  color: #5A4636;
  margin-bottom: 5px;
}

.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1;
  padding: 7px 4px;
  border: 1px solid #E8D8C3;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: #FFFFFF;
  color: #5A4636;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}

.toggle-btn:hover:not(.active) {
  background: #FAF3E0;
}

.toggle-btn.active {
  background: #6B4226;
  color: #FFFFFF;
  border-color: #6B4226;
}
</style>