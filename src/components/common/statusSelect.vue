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
  display: block;
}

.field label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.toggle-btn {
  flex: 1;
  border: 1px solid #E8D8C3;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  background: #FFFFFF;
  color: #5A4636;
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
  background: #FAF3E0;
}

.toggle-btn.active {
  background: #6B4226;
  color: #FFFFFF;
  border-color: #6B4226;
}
</style>