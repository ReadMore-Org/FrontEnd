<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useAuthStore } from './stores/auth';
import { useChatStore } from './features/chat/stores/chat';

// O chat fica ligado enquanto o usuário está logado (contador de não lidas, avisos e presença
// funcionam em qualquer tela); ao sair, tudo é desligado e limpo.
const authStore = useAuthStore();
const chatStore = useChatStore();

// Liga quando há um usuário logado e RELIGA se a conta mudar sem passar pelo logout
// (cadastro/login de outra conta no mesmo navegador): nada da conta anterior pode sobrar na tela.
watch(
  () => (authStore.isAuthenticated ? (authStore.user?.id ?? null) : null),
  (userId) => {
    chatStore.stop();
    if (userId) chatStore.start();
  },
  { immediate: true },
);

// O login fica no localStorage, que é compartilhado entre as abas do navegador. Se outra aba entrar
// em outra conta (ou sair), esta aba recarrega para não misturar uma conta com o token de outra.
// (A renovação do token em outra aba não muda a conta, então não recarrega.)
function onStorage(event) {
  if (event.key !== null && !["access_token", "user"].includes(event.key)) return;

  let storedId = null;

  try {
    storedId = JSON.parse(localStorage.getItem("user"))?.id ?? null;
  } catch {
    storedId = null;
  }

  const hasToken = !!localStorage.getItem("access_token");
  const currentId = authStore.user?.id ?? null;

  if (storedId !== currentId || hasToken !== authStore.isAuthenticated) {
    window.location.reload();
  }
}

onMounted(() => window.addEventListener("storage", onStorage));
onBeforeUnmount(() => window.removeEventListener("storage", onStorage));
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
