<script setup>
import ChatAvatar from './ChatAvatar.vue'

// Conteúdo da notificação de mensagem nova (renderizado dentro do vue-toastification).
defineProps({
  author: { type: String, required: true },
  avatar: { type: String, default: null },
  preview: { type: String, default: '' },
})
</script>

<template>
  <div class="chat-toast">
    <ChatAvatar :name="author" :src="avatar" :size="40" />
    <div class="chat-toast__text">
      <strong>{{ author }}</strong>
      <span>{{ preview }}</span>
    </div>
    <span class="chat-toast__open">Abrir</span>
  </div>
</template>

<style>
/* Global de propósito: o vue-toastification renderiza o cartão fora deste componente. */
.Vue-Toastification__toast.chat-toast-card {
  min-height: 0;
  padding: 10px 14px;
  color: #2c2c2c;
  font-family: inherit;
  border: 1px solid #e8d8c3;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(101, 67, 33, 0.18);
  cursor: pointer;
}

.chat-toast-card .Vue-Toastification__toast-body {
  flex: 1 1 0;
  min-width: 0;
  padding: 0;
}

.chat-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
}

.chat-toast__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;
}

.chat-toast__text strong {
  overflow: hidden;
  color: #654321;
  font-size: 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.chat-toast__text span {
  overflow: hidden;
  color: #5a4636;
  font-size: 13px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.chat-toast__open {
  flex-shrink: 0;
  padding: 6px 14px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 999px;
  background-color: #654321;
}
</style>
