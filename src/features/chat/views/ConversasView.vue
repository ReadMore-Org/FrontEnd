<script setup>
import { computed, onBeforeUnmount, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { MessagesSquare, WifiOff } from "lucide-vue-next";
import { useToast } from "vue-toastification";

import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import ChatPane from "../components/ChatPane.vue";
import RoomList from "../components/RoomList.vue";
import { STATUS } from "../lib/socketClient";
import { useChatStore } from "../stores/chat";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const chat = useChatStore();

const routeRoomId = computed(() =>
  route.params.roomId ? Number(route.params.roomId) : null,
);
const room = computed(() => chat.activeRoom);

// A conversa da URL precisa existir para este usuário; senão volta para a lista.
const roomMissing = computed(
  () =>
    routeRoomId.value !== null &&
    chat.roomsLoaded &&
    !chat.loadingRooms &&
    !chat.roomsError &&
    !room.value &&
    !chat.loadingHistory,
);

// O chat (WebSocket, conversas, avisos) é ligado no App; aqui só se abre/fecha a conversa da URL.
onBeforeUnmount(() => chat.closeRoom());

watch(routeRoomId, (id) => chat.openRoom(id), { immediate: true });

// Depois de carregar a lista, tenta abrir a conversa da URL de novo (ex.: atualização da página).
watch(
  () => chat.roomsLoaded,
  (loaded) => {
    if (loaded && routeRoomId.value !== null && !room.value) chat.openRoom(routeRoomId.value);
  },
);

watch(roomMissing, (missing) => {
  if (!missing) return;

  toast.error("Conversa não encontrada.");
  router.replace({ name: "conversas" });
});

// A conversa aberta saiu da lista (ex.: a outra pessoa teve a conta removida): volta para a lista.
watch(
  () => chat.activeRoomId,
  (id) => {
    if (id === null && routeRoomId.value !== null && chat.roomsLoaded && !roomMissing.value) {
      router.replace({ name: "conversas" });
    }
  },
);

const banner = computed(() => {
  if (chat.connection === STATUS.UNAUTHORIZED) return "unauthorized";
  if ([STATUS.RECONNECTING, STATUS.CONNECTING].includes(chat.connection) && chat.roomsLoaded) {
    return "offline";
  }

  return null;
});

function selectRoom(id) {
  router.push({ name: "conversa", params: { roomId: id } });
}
</script>

<template>
  <AppHeader />

  <main class="conversas">
    <div class="chat" :class="{ 'chat--room': routeRoomId !== null }">
      <p v-if="banner === 'offline'" class="chat__banner" role="status">
        <WifiOff :size="16" aria-hidden="true" />
        Reconectando...
        <button type="button" @click="chat.retryConnection()">Tentar agora</button>
      </p>
      <p v-else-if="banner === 'unauthorized'" class="chat__banner chat__banner--error" role="alert">
        Sua sessão expirou.
        <RouterLink to="/">Entrar novamente</RouterLink>
      </p>

      <RoomList
        class="chat__rooms"
        :rooms="chat.rooms"
        :active-id="routeRoomId"
        :loading="chat.loadingRooms"
        :error="chat.roomsError"
        @select="selectRoom"
        @retry="chat.loadRooms()"
      />

      <ChatPane v-if="room" class="chat__pane" @back="router.push({ name: 'conversas' })" />
      <section v-else class="chat__empty">
        <MessagesSquare :size="48" aria-hidden="true" />
        <p v-if="routeRoomId !== null">Abrindo conversa...</p>
        <p v-else>Escolha uma conversa ou use "Entrar em contato" em um anúncio do marketplace.</p>
        <RouterLink v-if="routeRoomId === null" class="chat__cta" to="/marketplace">
          Ir para o marketplace
        </RouterLink>
      </section>
    </div>
  </main>

  <AppFooter />
</template>

<style scoped>
.conversas {
  padding: 24px 120px 0;
}

/* Paleta do ReadMore para os componentes do chat (as variáveis são herdadas por todos eles). */
.chat {
  --color-primary: #654321;
  --color-primary-hover: #4f3319;
  --color-background: #ffffff;
  --color-surface: #faf3e0;
  --color-border: #e8d8c3;
  --color-text: #2c2c2c;
  --color-text-secondary: #7a6858;
  --color-danger: #b3261e;
  --color-success: #3d8b5a;
  --color-bg-page: #f5e6d3;
  --radius-sm: 6px;
  --radius-lg: 14px;
  --shadow-md: 0 6px 20px rgba(101, 67, 33, 0.18);
  --chat-bg: #ffffff;
  --chat-deep: #faf3e0;

  display: grid;
  grid-template-columns: minmax(16rem, 22rem) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  height: max(30rem, calc(100dvh - 150px));
  overflow: hidden;
  border: 1px solid #e8d8c3;
  border-radius: 16px;
  background-color: var(--chat-bg);
  box-shadow: 0 2px 12px rgba(101, 67, 33, 0.08);
}

.chat__banner {
  display: flex;
  grid-column: 1 / -1;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.375rem 1rem;
  color: #92400e;
  font-size: 0.875rem;
  background-color: #fef3c7;
}

.chat__banner--error {
  color: #991b1b;
  background-color: #fee2e2;
}

.chat__banner button,
.chat__banner a {
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.chat__rooms {
  grid-row: 2;
  border-right: 1px solid var(--color-border);
}

.chat__pane,
.chat__empty {
  grid-row: 2;
}

.chat__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0 24px;
  color: #9c8a7a;
  text-align: center;
  background-color: var(--chat-deep);
}

.chat__cta {
  padding: 10px 20px;
  color: #ffffff;
  font-weight: 600;
  border-radius: 999px;
  background-color: #654321;
}

.chat__cta:hover {
  background-color: #4f3319;
}

@media (max-width: 1100px) {
  .conversas {
    padding: 24px 24px 0;
  }
}

/* Celular: uma tela por vez (lista -> conversa). O menu fixo de baixo ocupa ~70px. */
@media (max-width: 650px) {
  .conversas {
    padding: 0;
  }

  .chat {
    grid-template-columns: minmax(0, 1fr);
    height: calc(100dvh - 140px);
    border: none;
    border-radius: 0;
    box-shadow: none;
  }

  .chat__rooms {
    border-right: none;
  }

  .chat--room .chat__rooms,
  .chat:not(.chat--room) .chat__pane,
  .chat:not(.chat--room) .chat__empty {
    display: none;
  }
}
</style>
