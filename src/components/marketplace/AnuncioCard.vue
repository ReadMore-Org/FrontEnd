<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  getCapaUrl,
  getAutoresTexto,
  getFotoDono,
  getPrimeiroNome,
  ROTULO_TIPO,
} from "@/utils/marketplaceHelpers";

const props = defineProps({
  anuncio: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

const livro = computed(() => props.anuncio.livro);
const capa = computed(() => getCapaUrl(livro.value));
const autores = computed(() => getAutoresTexto(livro.value));
const foto = computed(() => getFotoDono(props.anuncio.dono));
const nomeDono = computed(() => getPrimeiroNome(props.anuncio.dono));
const rotuloTipo = computed(() => ROTULO_TIPO[props.anuncio.tipo] ?? "");

function abrir() {
  router.push(`/marketplace/${props.anuncio.id}`);
}
</script>

<template>
  <article
    class="card-anuncio"
    tabindex="0"
    role="link"
    :aria-label="`${livro?.titulo} — ${rotuloTipo}, anunciado por ${nomeDono}`"
    @click="abrir"
    @keydown.enter="abrir"
  >
    <div class="capa-wrapper">
      <img class="capa" :src="capa" :alt="livro?.titulo || 'Capa do livro'" loading="lazy" />
      <span
        class="badge"
        :class="anuncio.tipo === 'troca' ? 'badge-troca' : 'badge-emprestimo'"
      >
        {{ rotuloTipo }}
      </span>
    </div>

    <div class="detalhes">
      <h3 class="titulo">{{ livro?.titulo }}</h3>
      <p v-if="autores" class="autor">{{ autores }}</p>

      <div class="dono">
        <img class="avatar" :src="foto" :alt="nomeDono" />
        <span>{{ nomeDono }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card-anuncio {
  width: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  outline: none;
}

.capa-wrapper {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 8px;
  overflow: hidden;
  background: #efe7d8;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-anuncio:hover .capa-wrapper,
.card-anuncio:focus-visible .capa-wrapper {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.card-anuncio:focus-visible .capa-wrapper {
  outline: 2px solid #6b4226;
  outline-offset: 3px;
}

.capa {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.badge-troca {
  background: #3b6ea5;
}

.badge-emprestimo {
  background: #4a8c5f;
}

.detalhes {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.titulo {
  font-size: 14px;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.autor {
  font-size: 13px;
  color: #9c8a7a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dono {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 13px;
  color: #5a4636;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  background: #d8cfc0;
  flex-shrink: 0;
}

@media (max-width: 650px) {
  .card-anuncio:hover .capa-wrapper {
    transform: none;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
}
</style>