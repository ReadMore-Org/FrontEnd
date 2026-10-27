<script setup>
import AppImage from "@/components/common/AppImage.vue";
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import { getFotoDono } from '@/utils/marketplaceHelpers';
const query = ref('');
const users = ref([]);
const loading = ref(false);
const error = ref('');
const page = ref(1);
const next = ref(false);
let generation = 0;
async function search(more = false) {
  const current = ++generation;
  loading.value = true;
  error.value = '';
  const targetPage = more ? page.value + 1 : 1;
  try {
    const { data } = await api.get('/usuarios/', { params: { search: query.value.trim(), page: targetPage } });
    if (current !== generation) return;
    users.value = more ? [...users.value, ...(data.results ?? data)] : (data.results ?? data);
    page.value = targetPage;
    next.value = data.page < data.total_pages;
  } catch { if (current === generation) error.value = 'Não foi possível buscar leitores. Tente novamente.'; }
  finally { if (current === generation) loading.value = false; }
}
onMounted(() => search());
</script>
<template>
  <AppHeader />
  <main>
    <h1>Encontre outros leitores</h1>
    <p>Conheça suas estantes e os livros disponíveis no marketplace.</p>
    <form @submit.prevent="search()">
      <input v-model="query" type="search" aria-label="Nome ou email do leitor" placeholder="Buscar por nome ou email" />
      <button type="submit">Buscar</button>
    </form>
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-if="loading" role="status">Buscando leitores...</p>
    <p v-else-if="!users.length && !error">Nenhum leitor encontrado.</p>
    <div class="grid">
      <RouterLink v-for="user in users" :key="user.id" :to="`/usuarios/${user.id}`" class="reader">
        <AppImage :src="getFotoDono(user)" avatar :fallbacks="[user.google_picture]" :alt="user.name || 'Leitor'" />
        <div><h2>{{ user.name || 'Leitor do ReadMore' }}</h2><p>{{ user.bio || 'Conheça este perfil' }}</p></div>
      </RouterLink>
    </div>
    <button v-if="next" :disabled="loading" @click="search(true)">Carregar mais</button>
  </main>
  <AppFooter />
</template>
<style scoped>
main { max-width:1100px; margin:auto; padding:40px 24px 100px; min-height:75vh; color:#5a4636; }
h1 { font-size:28px; color:#2c2c2c; margin-bottom:12px; }
form { display:flex; gap:12px; margin:28px 0; }
input { flex:1; min-width:0; border:1px solid #e8d8c3; border-radius:24px; padding:12px 18px; background:#faf7f4; }
button { border:0; border-radius:24px; padding:12px 22px; background:#6b4226; color:white; cursor:pointer; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:20px; margin:24px 0; }
.reader { display:flex; align-items:center; gap:16px; padding:20px; background:#faf3e0; border:1px solid #e8d8c3; border-radius:12px; color:inherit; text-decoration:none; }
img { width:60px; height:60px; border-radius:50%; object-fit:cover; }
h2 { font-size:17px; margin-bottom:6px; }
.reader p { font-size:14px; overflow-wrap:anywhere; }
</style>
