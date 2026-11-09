<script setup>
import { computed } from 'vue'
import { initials } from '../lib/format'
import AppImage from '@/components/common/AppImage.vue'
import { resolveImageUrl } from '@/utils/images'

const {
  name = '',
  src = null,
  fallbackSrc = null,
  size = 40,
  online = null,
} = defineProps({
  name: { type: String, default: '' },
  src: { type: String, default: null },
  fallbackSrc: { type: String, default: null },
  size: { type: Number, default: 40 },
  // null = não mostra indicador; true/false = bolinha online/offline.
  online: { type: Boolean, default: null },
})

const style = computed(() => ({ '--avatar-size': `${size}px` }))
const url = computed(() => resolveImageUrl(src) || resolveImageUrl(fallbackSrc))
</script>

<template>
  <span class="avatar" :style="style">
    <AppImage v-if="url" class="avatar__image" :src="url" :fallbacks="[fallbackSrc]" avatar alt="" loading="lazy" />
    <span v-else class="avatar__initials" aria-hidden="true">{{ initials(name) }}</span>
    <span
      v-if="online !== null"
      class="avatar__dot"
      :class="{ 'avatar__dot--online': online }"
      :title="online ? 'Online' : 'Offline'"
    />
  </span>
</template>

<style scoped>
.avatar {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: var(--avatar-size);
  height: var(--avatar-size);
  border-radius: 50%;
  color: color-mix(in srgb, var(--color-primary) 75%, #000000);
  background-color: color-mix(
    in srgb,
    var(--color-primary) 18%,
    var(--chat-bg, var(--color-background))
  );
  font-size: calc(var(--avatar-size) * 0.38);
  font-weight: 600;
}

.avatar__image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar__dot {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 28%;
  height: 28%;
  min-width: 8px;
  min-height: 8px;
  border: 2px solid var(--chat-bg, var(--color-background));
  border-radius: 50%;
  background-color: #9ca3af;
}

.avatar__dot--online {
  background-color: var(--color-success);
}
</style>
