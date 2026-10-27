<script setup>
import { computed } from 'vue';
import { Star } from 'lucide-vue-next';
import { getBookRating } from '@/services/bookRatings';
const props = defineProps({ livro: Object });
const rating = computed(() => getBookRating(props.livro));
</script>
<template>
  <div class="book-rating" :aria-label="rating.total ? `Média ReadMore: ${Number(rating.media).toFixed(1)} de 5, ${rating.total} avaliações` : 'Avaliações ReadMore'">
    <Star :size="14" :fill="rating.total ? 'currentColor' : 'none'" />
    <template v-if="rating.total"><strong>{{ Number(rating.media).toFixed(1) }}</strong><span>({{ rating.total }})</span></template>
    <span v-else>{{ rating.status === "ready" ? "Sem avaliações" : rating.status === "unavailable" ? "Notas indisponíveis" : "Carregando notas…" }}</span>
  </div>
</template>
<style scoped>
.book-rating { display:flex; align-items:center; gap:5px; margin-top:8px; font-size:12px; color:#9c8a7a; }
.book-rating svg { color:#c9a227; flex-shrink:0; }
strong { color:#6b4226; font-weight:600; }
</style>
