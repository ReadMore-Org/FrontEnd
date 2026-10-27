<script setup>
import { ref } from 'vue';
import { Star } from 'lucide-vue-next';
defineProps({ modelValue: { type: Number, default: 0 }, disabled: Boolean });
defineEmits(['update:modelValue']);
const hover = ref(0);
</script>
<template>
  <div class="stars" role="group" aria-label="Avaliação de 1 a 5 estrelas" @mouseleave="hover = 0">
    <button v-for="n in 5" :key="n" type="button" :disabled="disabled" :aria-label="`${n} ${n === 1 ? 'estrela' : 'estrelas'}`" :aria-pressed="modelValue === n" @mouseenter="hover = n" @focus="hover = n" @blur="hover = 0" @click="$emit('update:modelValue', n)">
      <Star :size="24" :fill="n <= (hover || modelValue) ? '#c9a227' : 'none'" :color="n <= (hover || modelValue) ? '#c9a227' : '#9c8a7a'" />
    </button>
  </div>
</template>
<style scoped>
.stars { display:flex; gap:4px; }
.stars button { background:transparent; border:0; padding:4px; cursor:pointer; display:flex; border-radius:6px; }
.stars button:focus-visible { outline:2px solid #6b4226; }
.stars button:disabled { cursor:default; opacity:.7; }
</style>
