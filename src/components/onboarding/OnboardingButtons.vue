<script setup>
defineProps({
  isFirstSlide: {
    type: Boolean,
    default: false
  },

  isLastSlide: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'next',
  'back'
])
</script>

<template>
  <div class="buttons-container">
    <button
      v-if="!isFirstSlide"
      class="back-button"
      @click="$emit('back')"
    >
      Voltar
    </button>

    <button
      class="next-button"
      @click="$emit('next')"
    >
      {{ isLastSlide ? 'Começar' : 'Próximo' }}

      <span class="arrow">
        →
      </span>
    </button>
  </div>
</template>

<style scoped>
.buttons-container {
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;

  margin-top: 32px;
}

.back-button {
  height: 46px;

  padding: 0 22px;

  border: 2px solid #7a5c45;
  border-radius: 14px;

  background: transparent;

  color: #7a5c45;

  font-size: 15px;
  font-weight: 600;

  cursor: pointer;

  transition: all 0.2s ease;
}

.back-button:hover {
  background: rgba(122, 92, 69, 0.08);
}

.next-button {
  height: 46px;

  padding: 0 22px;

  border: none;
  border-radius: 14px;

  background: #7a5c45;

  color: white;

  font-size: 15px;
  font-weight: 600;

  display: flex;
  align-items: center;
  gap: 8px;

  cursor: pointer;

  transition: all 0.2s ease;
}

.next-button:hover {
  transform: translateY(-2px);
  opacity: 0.95;
}

.arrow {
  font-size: 18px;
  line-height: 1;
}
</style>