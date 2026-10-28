<script setup>
import { computed, ref, watch } from 'vue';
import { displayImageUrl, FALLBACK_CAPA, FALLBACK_AVATAR } from '@/utils/images';
const props = defineProps({
  src: String,
  avatar: Boolean,
  fallbacks: { type: Array, default: () => [] },
});
const emit = defineEmits(['error']);
const index = ref(0);
const candidates = computed(() => [...new Set([
  props.src,
  ...props.fallbacks,
  props.avatar ? FALLBACK_AVATAR : FALLBACK_CAPA,
].map(value => displayImageUrl(value, { avatar: props.avatar })).filter(Boolean))]);
watch(() => JSON.stringify(candidates.value), () => { index.value = 0; });
function onError(event) {
  if (index.value < candidates.value.length - 1) index.value++;
  emit('error', event);
}
</script>
<template>
  <img :src="candidates[index]" referrerpolicy="no-referrer" @error="onError" />
</template>
