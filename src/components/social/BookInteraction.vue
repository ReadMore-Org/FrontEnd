<script setup>
import { ref, watch } from 'vue';
import { Heart } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import { importarLivroGoogle } from '@/services/livros';
import StarRating from './StarRating.vue';
import BookShareButton from '@/components/books/BookShareButton.vue';
import { setBookRating, loadBookRatings, getBookRating } from '@/services/bookRatings';
const props = defineProps({ livro: Object, compact: Boolean, google: Boolean, details: Boolean });
const emit = defineEmits(['changed']);
const auth = useAuthStore();
const router = useRouter();
const state = ref({ favorito: false, nota: null, media: null, total: 0 });
const busy = ref(false);
const ready = ref(false);
const error = ref('');
const backendId = ref(null);
let generation = 0;
async function loadInteraction() {
  const current = ++generation;
  state.value = { favorito: false, nota: null, media: null, total: 0 };
  ready.value = false;
  error.value = '';
  backendId.value = props.google ? null : props.livro?.id;
  if (!props.livro) return;
  try {
    if (!auth.isAuthenticated) {
      await loadBookRatings([props.livro]);
      if (current !== generation) return;
      const summary = getBookRating(props.livro);
      state.value = { ...state.value, media: summary.media, total: summary.total };
      ready.value = true;
      return;
    }
    if (props.google) {
      const googleId = props.livro.google_book_id || (props.livro.origem !== 'openlibrary' ? props.livro.id : null);
      if (googleId) {
        const { data } = await api.get('/livros/', { params: { google_book_id: googleId } });
        if (current !== generation) return;
        backendId.value = (data.results ?? data)[0]?.id ?? null;
      }
      if (!backendId.value && props.livro.isbn) {
        const response = await api.get('/livros/', { params: { isbn: props.livro.isbn } });
        if (current !== generation) return;
        backendId.value = (response.data.results ?? response.data)[0]?.id ?? null;
      }
    }
    if (backendId.value) {
      const { data } = await api.get(`/livros/${backendId.value}/interacao/`);
      if (current !== generation) return;
      state.value = data;
      setBookRating(props.livro, data);
    }
    if (!backendId.value) setBookRating(props.livro, state.value);
    ready.value = true;
  } catch { if (current === generation) error.value = 'Não foi possível carregar favoritos e avaliação.'; }
}
watch(() => [props.livro?.id, auth.user?.id, props.google], loadInteraction, { immediate: true });
async function save(payload) {
  if (!auth.isAuthenticated) { router.push('/entrar'); return; }
  if (busy.value || !ready.value) return;
  const current = generation;
  busy.value = true;
  error.value = '';
  try {
    if (!backendId.value) {
      const { data } = await importarLivroGoogle(props.livro, null, true);
      if (current !== generation) return;
      backendId.value = data.id;
    }
    const { data } = await api.patch(`/livros/${backendId.value}/interacao/`, payload);
    if (current !== generation) return;
    state.value = data;
    setBookRating(props.livro, data);
    emit('changed', data);
  } catch { if (current === generation) error.value = 'Não foi possível salvar. Tente novamente.'; }
  finally { busy.value = false; }
}
</script>
<template>
  <div class="interaction" :class="{ 'interaction--details': details, 'interaction--compact': compact }" @click.stop @keydown.enter.stop>
    <div class="interaction-actions">
    <button type="button" class="favorite" :class="{ selected: state.favorito }" :disabled="busy || (auth.isAuthenticated && !ready)" :aria-pressed="state.favorito" :aria-label="state.favorito ? 'Remover dos favoritos' : 'Favoritar livro'" @click="save({ favorito: !state.favorito })">
      <Heart :size="22" :fill="state.favorito ? 'currentColor' : 'none'" />
      <span v-if="!compact">{{ state.favorito ? 'Favoritado' : 'Favoritar' }}</span>
    </button>
      <BookShareButton v-if="details && !compact" :livro="livro" />
    </div>
    <div v-if="!compact" class="rating" aria-label="Avaliar este livro">
      <StarRating :model-value="state.nota || 0" :disabled="busy || (auth.isAuthenticated && !ready)" @update:model-value="save({ nota: $event })" />
      <div class="rating-info">
        <strong v-if="state.total">{{ Number(state.media).toFixed(1) }} <span>/ 5</span></strong>
        <small>{{ !ready ? (error ? 'Notas indisponíveis' : 'Carregando notas...') : state.total ? `${state.total} ${state.total === 1 ? 'avaliação' : 'avaliações'} no ReadMore` : 'Seja o primeiro a avaliar' }}</small>
      </div>
      <small v-if="state.nota" class="personal-rating">Sua nota: {{ state.nota }} de 5 · Toque para alterar</small>
    </div>
    <p v-if="error" role="alert" class="error">{{ error }} <button v-if="!ready" type="button" @click="loadInteraction">Tentar novamente</button></p>
  </div>
</template>
<style scoped>
.interaction { display:flex; flex-wrap:wrap; align-items:center; gap:16px; color:#6b4226; margin:12px 0; }
.interaction-actions { display:flex; align-items:flex-start; flex-wrap:wrap; gap:10px; }
.favorite { display:flex; align-items:center; gap:8px; background:#fff; color:#6b4226; border:1px solid #e8d8c3; border-radius:24px; padding:10px 16px; min-height:42px; font-size:13px; cursor:pointer; }
.favorite.selected { color:#a4161a; }
.favorite:disabled { opacity:.6; cursor:wait; }
.rating { display:flex; flex-direction:column; gap:6px; padding:12px 16px; border:1px solid #e8d8c3; background:#faf7f4; border-radius:12px; font-size:14px; }
.rating-info { display:flex; align-items:center; flex-wrap:wrap; gap:8px; }
.rating-info strong { color:#6b4226; font-size:17px; }
.rating-info strong span { color:#9c8a7a; font-size:12px; font-weight:400; }
.personal-rating { font-size:11px; }
small { color:#9c8a7a; }
.error { color:#a4161a; font-size:13px; }
</style>

<style scoped>
.interaction--details { display:flex; flex-direction:column; align-items:stretch; gap:16px; margin:0; padding:20px 0; border-top:1px solid #e8d8c3; border-bottom:1px solid #e8d8c3; }
.interaction--details .rating { order:-1; padding:0; border:0; background:transparent; border-radius:0; gap:8px; }
.interaction--details .rating-info { gap:8px; }
.interaction--details .rating-info strong { font-size:20px; }
.interaction--details .personal-rating { font-size:12px; }
.interaction--compact .favorite { min-height:36px; padding:7px 10px; }
.favorite:hover { background:#faf3e0; border-color:#c9b09a; }
.favorite.selected { background:#fff5f3; border-color:#efc7bf; }
</style>
