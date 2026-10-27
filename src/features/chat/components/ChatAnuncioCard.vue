<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { X } from 'lucide-vue-next'
import { ROTULO_TIPO, getCapaUrl } from '@/utils/marketplaceHelpers'

// Card do livro anunciado: aparece acima do campo de texto ("contexto" da conversa, ainda não enviado)
// e dentro da primeira mensagem enviada a partir do anúncio.
const { anuncio, dismissible = false } = defineProps({
  anuncio: { type: Object, required: true },
  dismissible: { type: Boolean, default: false },
})

const emit = defineEmits(['dismiss'])

const capa = computed(() => getCapaUrl({ capa: anuncio.capa }))
const tipo = computed(() => ROTULO_TIPO[anuncio.tipo] ?? 'Anúncio')
</script>

<template>
  <div class="card" :class="{ 'card--bar': dismissible }">
    <RouterLink class="card__link" :to="`/marketplace/${anuncio.id}`" :title="`Ver anúncio: ${anuncio.titulo}`">
      <img class="card__capa" :src="capa" alt="" loading="lazy" />
      <span class="card__text">
        <small>{{ dismissible ? 'Conversando sobre' : 'Anúncio' }} · {{ tipo }}</small>
        <strong>{{ anuncio.titulo }}</strong>
      </span>
    </RouterLink>

    <button
      v-if="dismissible"
      type="button"
      class="card__close"
      aria-label="Não anexar este livro"
      title="Não anexar este livro"
      @click="emit('dismiss')"
    >
      <X :size="16" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  border: 1px solid #e8d8c3;
  border-radius: 12px;
  background-color: #faf3e0;
}

.card--bar {
  margin: 0 24px;
  padding-right: 8px;
}

.card__link {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 8px;
  color: #2c2c2c;
}

.card__capa {
  width: 36px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 4px;
  background-color: #f5e6d3;
  object-fit: cover;
}

.card__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;
}

.card__text small {
  color: #9c8a7a;
  font-size: 12px;
}

.card__text strong {
  overflow: hidden;
  color: #654321;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.card__close {
  display: inline-flex;
  padding: 6px;
  color: #9c8a7a;
  border-radius: 50%;
  cursor: pointer;
}

.card__close:hover {
  background-color: #f5e6d3;
  color: #654321;
}

@media (max-width: 650px) {
  .card--bar {
    margin: 0 12px;
  }
}
</style>
