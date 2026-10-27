<script setup>
import { ref } from 'vue';
import { Share2, Check } from 'lucide-vue-next';
const props = defineProps({ livro: Object });
const copied = ref(false);
const error = ref(false);
const busy = ref(false);
async function share() {
  if (busy.value) return;
  busy.value = true;
  error.value = false;
  try {
    const data = { title: props.livro?.titulo || 'Livro no ReadMore', url: window.location.href };
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(data.url);
      copied.value = true;
    }
  } catch (err) { if (err.name !== 'AbortError') error.value = true; }
  finally { busy.value = false; }
}
</script>
<template>
  <div class="share-action">
    <button type="button" class="share-button" :disabled="busy" @click="share">
      <component :is="copied ? Check : Share2" :size="18" aria-hidden="true" />
      <span>{{ copied ? 'Link copiado' : 'Compartilhar' }}</span>
    </button>
    <small v-if="error" role="status">Não foi possível compartilhar o link.</small>
  </div>
</template>
<style scoped>
.share-action { display:flex; flex-direction:column; gap:6px; }
.share-button { display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:42px; padding:10px 16px; border:1px solid #e8d8c3; border-radius:24px; background:white; color:#6b4226; font:inherit; font-size:13px; cursor:pointer; }
.share-button:hover { background:#faf3e0; border-color:#c9b09a; }
.share-button:disabled { opacity:.6; cursor:wait; }
small { color:#9c8a7a; font-size:11px; }
</style>
