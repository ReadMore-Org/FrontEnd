<script setup>
import AppImage from "@/components/common/AppImage.vue";
import { bookImageFallbacks } from "@/utils/images";
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import StarRating from '@/components/social/StarRating.vue';
import AnuncioCard from '@/components/marketplace/AnuncioCard.vue';
import { getCapaUrl, getFotoDono } from '@/utils/marketplaceHelpers';
const route = useRoute();
const auth = useAuthStore();
const profile = ref(null);
const loading = ref(true);
const error = ref('');
const saving = ref(false);
const ratingError = ref('');
let generation = 0;
async function load() {
  const current = ++generation;
  loading.value = true;
  profile.value = null;
  error.value = '';
  ratingError.value = '';
  try {
    const { data } = await api.get(`/usuarios/${route.params.id}/perfil/`);
    if (current === generation) profile.value = data;
  } catch (err) {
    if (current === generation) error.value = err.response?.status === 404 ? 'Usuário não encontrado.' : 'Não foi possível carregar este perfil.';
  } finally { if (current === generation) loading.value = false; }
}
watch(() => route.params.id, load, { immediate: true });
async function rate(nota) {
  if (saving.value) return;
  const current = generation;
  saving.value = true;
  ratingError.value = '';
  try {
    const { data } = await api.post(`/usuarios/${profile.value.id}/avaliar/`, { nota });
    if (current === generation) Object.assign(profile.value, data);
  } catch { if (current === generation) ratingError.value = 'Não foi possível salvar sua avaliação. Tente novamente.'; }
  finally { saving.value = false; }
}
</script>
<template>
  <AppHeader />
  <main class="public-profile">
    <RouterLink to="/usuarios" class="back">← Encontrar leitores</RouterLink>
    <p v-if="loading" class="state">Carregando perfil...</p>
    <div v-else-if="error" class="state" role="alert">{{ error }} <button @click="load">Tentar novamente</button></div>
    <template v-else-if="profile">
      <section class="intro">
        <AppImage class="avatar" :src="getFotoDono(profile)" avatar :fallbacks="[profile.google_picture]" :alt="profile.name || 'Leitor'" />
        <div class="identity">
          <h1>{{ profile.name || 'Leitor do ReadMore' }}</h1>
          <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
          <p class="bio">{{ profile.bio || 'Este leitor ainda não adicionou uma biografia.' }}</p>
          <p>{{ profile.livros.length }} livros salvos · {{ profile.anuncios.length }} anúncios</p>
          <p>{{ profile.total ? `${Number(profile.media).toFixed(1)} de 5 · ${profile.total} avaliações` : 'Ainda sem avaliações' }}</p>
        </div>
        <RouterLink v-if="profile.id === auth.user?.id" to="/profile" class="own">Meu perfil</RouterLink>
      </section>
      <section v-if="profile.id !== auth.user?.id" class="rate">
        <h2>Avalie este leitor</h2>
        <StarRating :model-value="profile.minha_nota || 0" :disabled="saving" @update:model-value="rate" />
        <p>{{ saving ? 'Salvando...' : profile.minha_nota ? `Sua avaliação: ${profile.minha_nota} de 5. Você pode alterá-la.` : 'Selecione de 1 a 5 estrelas.' }}</p>
        <p v-if="ratingError" role="alert">{{ ratingError }}</p>
      </section>
      <section>
        <h2>Livros no marketplace</h2>
        <div v-if="profile.anuncios.length" class="grid">
          <AnuncioCard v-for="ad in profile.anuncios" :key="ad.id" :anuncio="ad" />
        </div>
        <p v-else>Nenhum livro anunciado no momento.</p>
      </section>
      <section>
        <h2>Livros salvos</h2>
        <div v-if="profile.livros.length" class="grid">
          <RouterLink v-for="item in profile.livros" :key="item.id" :to="`/livro/${item.livro.id}`" class="book">
            <AppImage :src="getCapaUrl(item.livro)" :fallbacks="bookImageFallbacks(item.livro)" :alt="item.livro.titulo" />
            <h3>{{ item.livro.titulo }}</h3>
            <p>{{ { lendo: 'Lendo', lido: 'Lido', quero_ler: 'Quero ler' }[item.status] || 'Na estante' }}</p>
          </RouterLink>
        </div>
        <p v-else>Este leitor ainda não salvou livros.</p>
      </section>
    </template>
  </main>
  <AppFooter />
</template>
<style scoped>
.public-profile { max-width:1100px; margin:auto; padding:32px 24px 100px; color:#5a4636; min-height:75vh; }
a { color:#6b4226; text-decoration:none; overflow-wrap:anywhere; }
.back { display:inline-block; margin-bottom:24px; }
.intro { display:flex; align-items:flex-start; gap:24px; padding:28px; background:#f3e7d7; border:1px solid #e8d8c3; border-radius:16px; }
.avatar { width:100px; height:100px; border-radius:50%; object-fit:cover; border:2px solid #7b5638; }
h1 { font-size:28px; color:#2c2c2c; margin-bottom:8px; }
p { margin:10px 0; line-height:1.6; }
.bio { white-space:pre-line; overflow-wrap:anywhere; }
.identity { flex:1; min-width:0; }
.own { padding:10px 16px; background:white; border:1px solid #7b5638; border-radius:20px; }
section { margin-bottom:36px; }
h2 { font-size:23px; font-weight:500; margin-bottom:20px; color:#2c2c2c; }
.rate { padding:24px; background:#faf3e0; border:1px solid #e8d8c3; border-radius:12px; }
.rate h2 { font-size:18px; margin-bottom:10px; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:24px; }
.book img { width:100%; height:230px; object-fit:cover; border-radius:8px; }
h3 { font-size:16px; margin-top:8px; }
.state { padding:60px 0; }
@media(max-width:650px) { .intro { flex-wrap:wrap; padding:20px; gap:16px; } .avatar { width:72px; height:72px; } h1 { font-size:22px; } .grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; } }
</style>
