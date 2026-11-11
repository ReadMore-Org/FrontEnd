<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Bell, X } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { formatListTime, messagePreview } from '../lib/format'
import ChatAvatar from './ChatAvatar.vue'

const chat = useChatStore()
const route = useRoute()
const open = ref(false)
const root = ref(null)
const trigger = ref(null)
const notifications = computed(() => chat.rooms.filter(room => room.unread > 0))
const count = computed(() => chat.unreadTotal > 99 ? '99+' : chat.unreadTotal)
function close() { open.value = false }
function outside(event) { if (!root.value?.contains(event.target)) close() }
function escape(event) {
  if (event.key === 'Escape' && open.value) { close(); trigger.value?.focus() }
}
watch(() => route.fullPath, close)
onMounted(() => {
  document.addEventListener('pointerdown', outside)
  document.addEventListener('keydown', escape)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', outside)
  document.removeEventListener('keydown', escape)
})
</script>

<template>
  <div ref="root" class="notifications">
    <button ref="trigger" class="bell" type="button" :aria-label="chat.unreadTotal ? `Notificações: ${chat.unreadTotal} mensagens não lidas` : 'Notificações'" :aria-expanded="open" aria-controls="chat-notifications" @click="open = !open">
      <Bell :size="22" aria-hidden="true" />
      <span v-if="chat.unreadTotal" class="badge">{{ count }}</span>
    </button>
    <section v-if="open" id="chat-notifications" class="panel" aria-label="Notificações">
      <header><strong>Notificações</strong><button type="button" aria-label="Fechar notificações" @click="close"><X :size="18" /></button></header>
      <p v-if="chat.loadingRooms && !chat.roomsLoaded" class="state" role="status">Carregando notificações...</p>
      <div v-else-if="chat.roomsError" class="state" role="alert"><p>{{ chat.roomsError }}</p><button type="button" @click="chat.loadRooms()">Tentar novamente</button></div>
      <p v-else-if="!notifications.length" class="state">Você está em dia! Nenhuma mensagem não lida.</p>
      <ul v-else>
        <li v-for="room in notifications" :key="room.id">
          <RouterLink :to="{ name: 'conversa', params: { roomId: room.id } }" @click="close">
            <ChatAvatar :name="room.name" :src="room.image" :fallback-src="room.other?.google_picture" :size="38" />
            <span class="content"><strong>{{ room.name }}</strong><span class="preview">{{ messagePreview(room.last_message) || 'Nova mensagem' }}</span><small>{{ room.unread }} {{ room.unread === 1 ? 'mensagem não lida' : 'mensagens não lidas' }}</small></span>
            <time v-if="room.last_message_at">{{ formatListTime(room.last_message_at) }}</time>
          </RouterLink>
        </li>
      </ul>
      <RouterLink class="all" to="/conversas" @click="close">Ver todas as conversas</RouterLink>
    </section>
  </div>
</template>

<style scoped>
/* Controles simples, sem o fundo e a borda cinza nativos do navegador. */
button {
  appearance: none;
  border: 0;
  background: transparent;
  color: #654321;
  font: inherit;
  cursor: pointer;
}
button:disabled { cursor: default; opacity: 0.5; }

.notifications { position: relative; }
button { display: inline-flex; align-items: center; justify-content: center; border: 0; background: transparent; color: #654321; cursor: pointer; }
.bell { position: relative; width: 40px; height: 40px; border-radius: 50%; }
.badge { position: absolute; top: -3px; right: -4px; padding: 2px 5px; border-radius: 12px; background: #654321; color: white; font-size: 10px; }
.panel { position: absolute; right: 0; top: calc(100% + 12px); z-index: 1100; width: min(360px, calc(100vw - 24px)); background: white; border: 1px solid #e8d8c3; border-radius: 16px; box-shadow: 0 8px 30px #65432126; color: #654321; overflow: hidden; }
header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #eee; }
ul { list-style: none; padding: 0; margin: 0; max-height: min(380px, 55dvh); overflow-y: auto; }
li a { display: flex; align-items: center; gap: 10px; padding: 14px; color: inherit; text-decoration: none; border-bottom: 1px solid #f3ece3; }
li a:hover, li a:focus-visible { background: #faf3e0; }
.content { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.content strong, .preview { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.preview { color: #5a4636; font-size: 13px; }
small, time { font-size: 11px; color: #7a6858; }
time { flex-shrink: 0; }
.state { padding: 20px 16px; font-size: 14px; line-height: 1.5; }
.state button { text-decoration: underline; }
.all { display: block; text-align: center; padding: 14px; color: #654321; font-size: 14px; font-weight: 600; }
@media (max-width: 650px) {
  .bell { background: white; width: 36px; height: 36px; }
  .panel { position: fixed; top: 80px; right: 12px; }
}
</style>
