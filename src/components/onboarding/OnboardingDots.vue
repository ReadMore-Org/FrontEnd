<script setup>
defineProps({
  current: {
    type: Number,
    required: true
  },

  total: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <div class="dots-container">
    <span
      v-for="(_, index) in total"
      :key="index"
      class="dot"
      :class="{ active: index === current }"
    />
  </div>
</template>

<style scoped>
.dots-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  margin-top: 24px;
}

.dot {
  width: 8px;
  height: 8px;

  border-radius: 999px;

  background: #c9b7a6;

  transition: all 0.25s ease;
}

.dot.active {
  width: 22px;

  background: #7a5c45;
}
</style>