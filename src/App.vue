<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
</script>

<template>

  <RouterView />
  <AppFooter/>
</template>

<style scoped>
div.corpo{
  padding: 0 120px;
}
@media (max-width: 650px) {
  div.corpo {
    padding: 0;
  }
}

</style>
