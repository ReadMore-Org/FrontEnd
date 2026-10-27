<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import { watch } from 'vue';
import { useAuthStore } from './stores/auth';
import { useChatStore } from './features/chat/stores/chat';

// O chat fica ligado enquanto o usuário está logado (contador de não lidas, avisos e presença
// funcionam em qualquer tela); ao sair, tudo é desligado e limpo.
const authStore = useAuthStore();
const chatStore = useChatStore();

watch(
  () => authStore.isAuthenticated,
  (logged) => {
    if (logged) chatStore.start();
    else chatStore.stop();
  },
  { immediate: true },
);
</script>

<template>

  <RouterView />

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
