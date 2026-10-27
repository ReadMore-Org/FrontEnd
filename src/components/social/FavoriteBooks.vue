<script setup>
import AppImage from "@/components/common/AppImage.vue";
import { bookImageFallbacks } from "@/utils/images";
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import BookInteraction from './BookInteraction.vue';
import { getCapaUrl } from '@/utils/marketplaceHelpers';
const books = ref([]);
const loading = ref(true);
const error = ref('');
async function load() {
  loading.value = true;
  error.value = '';
  try { const { data } = await api.get('/usuarios/favoritos/'); books.value = data; }
  catch { error.value = 'Não foi possível carregar seus favoritos.'; }
  finally { loading.value = false; }
}
onMounted(load);
</script>
<template>
  <section class="favorites">
    <h2>Livros favoritados</h2>
    <p v-if="loading">Carregando favoritos...</p>
    <div v-else-if="error" role="alert">{{ error }} <button @click="load">Tentar novamente</button></div>
    <p v-else-if="!books.length">Toque no coração de um livro para salvá-lo aqui.</p>
    <div v-else class="grid">
      <article v-for="item in books" :key="item.id">
        <RouterLink :to="`/livro/${item.livro.id}`">
          <AppImage :src="getCapaUrl(item.livro)" :fallbacks="bookImageFallbacks(item.livro)" :alt="item.livro.titulo" />
          <h3>{{ item.livro.titulo }}</h3>
        </RouterLink>
        <BookInteraction :livro="item.livro" compact @changed="!$event.favorito && (books = books.filter(book => book.id !== item.id))" />
      </article>
    </div>
  </section>
</template>
<style scoped>
.favorites { margin:32px 0 48px; color:#5a4636; }
h2 { color:#2c2c2c; font-size:26px; font-weight:500; margin-bottom:24px; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(145px,1fr)); gap:24px; }
article { max-width:200px; }
img { width:100%; height:210px; object-fit:cover; border-radius:8px; }
a { color:inherit; text-decoration:none; }
h3 { font-size:15px; margin-top:10px; }
button { color:#6b4226; cursor:pointer; }
</style>
