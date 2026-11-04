<script setup>
import { computed, ref, watch } from 'vue';
import { displayImageUrl, FALLBACK_CAPA, FALLBACK_AVATAR } from '@/utils/images';
import { isMissingCoverImage } from '@/utils/missingCovers';
const props = defineProps({
  src: String,
  avatar: Boolean,
  fallbacks: { type: Array, default: () => [] },
});
const emit = defineEmits(['error', 'cover-status']);
const index = ref(0);
const candidates = computed(() => {
  const fallback = props.avatar ? FALLBACK_AVATAR : FALLBACK_CAPA;
  const urls = [props.src, ...props.fallbacks]
    .map(value => displayImageUrl(value, { avatar: props.avatar }))
    .filter(value => value && value !== fallback);
  return [...new Set([...urls, fallback])];
});
watch(() => JSON.stringify(candidates.value), () => { index.value = 0; });
function onError(event) {
  if (index.value < candidates.value.length - 1) index.value++;
  else if (!props.avatar) emit('cover-status', false);
  emit('error', event);
}
function onLoad(event) {
  const image = event.target;
  // Alguns provedores respondem com um pixel vazio em vez de HTTP 404.
  if (!props.avatar && isMissingCoverImage(image)) {
    onError(event);
  } else if (!props.avatar) emit('cover-status', candidates.value[index.value] !== FALLBACK_CAPA);
}
</script>
<template>
  <img :src="candidates[index]" :crossorigin="avatar ? undefined : 'anonymous'" referrerpolicy="no-referrer" @error="onError" @load="onLoad" />
</template>
