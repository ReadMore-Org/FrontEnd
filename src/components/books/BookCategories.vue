<script setup>
import { computed } from 'vue';
import { Tags } from 'lucide-vue-next';
import { nomesCategoriasDoLivro } from '@/utils/categoriasLivro';
const props = defineProps({ livro: Object, categorias: { type: Array, default: () => [] } });
const names = computed(() => nomesCategoriasDoLivro(props.livro, props.categorias));
</script>
<template>
  <section v-if="names.length" class="book-categories" aria-label="Categorias do livro">
    <div class="category-label"><Tags :size="14" aria-hidden="true" /><span>Categorias</span></div>
    <ul class="category-tags">
      <li v-for="name in names" :key="name">{{ name }}</li>
    </ul>
  </section>
</template>
<style scoped>
.book-categories { margin:4px 0; }
.category-label { display:flex; align-items:center; gap:6px; color:#9c8a7a; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; margin-bottom:10px; }
.category-tags { display:flex; flex-wrap:wrap; gap:8px; margin:0; padding:0; list-style:none; }
.category-tags li { padding:6px 12px; border:1px solid #e8d8c3; border-radius:20px; background:#faf7f2; color:#6b4226; font-size:12px; line-height:1.5; overflow-wrap:anywhere; }
.category-tags li:first-child { background:#f3e7d7; border-color:#dbc4a9; font-weight:600; }
</style>
