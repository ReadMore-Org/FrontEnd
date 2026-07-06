<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Plus, Star, Check } from "lucide-vue-next";
import { importarLivroGoogle } from "@/services/livros";
import { useRouter } from "vue-router";

const props = defineProps({
  livro: Object,
});

const router = useRouter();

/* navegação só em elementos específicos */
function abrirLivro() {
  router.push(`/livro/google/${props.livro.id}`);
}

/* estado do popover */
const popoverAberto = ref(false);
const adicionando = ref(false);
const adicionado = ref(false);
const erro = ref(null);
const raizPopover = ref(null);

/* opções */
const statusOpcoes = [
  { value: "quero_ler", label: "Quero ler" },
  { value: "lendo", label: "Lendo" },
  { value: "lido", label: "Lido" },
];

/* capa */
const getBookCover = (livro) => {
  const capa = livro.capa;
  const url = typeof capa === "string" ? capa : capa?.url;

  if (url) {
    if (url.startsWith("http")) {
      const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost)/i.test(url);
      return isLocal ? url : url.replace(/^http:\/\//i, "https://");
    }
    return `${import.meta.env.VITE_API_BASE_URL}${url}`;
  }

  return "/imgs/livro_sem_capa.png";
};

/* autores */
const getAutores = (livro) => {
  if (!livro.autores || !livro.autores.length) return "";
  return livro.autores.map((a) => (typeof a === "string" ? a : a.nome)).join(", ");
};

/* clique no botão adicionar */
function abrirPopover(event) {
  event.stopPropagation();

  if (adicionado.value) return;
  popoverAberto.value = !popoverAberto.value;
}

/* escolher status */
async function escolherStatus(event, status) {
  event.stopPropagation();

  adicionando.value = true;
  popoverAberto.value = false;
  erro.value = null;

  try {
    await importarLivroGoogle(props.livro, status);
    adicionado.value = true;
  } catch (err) {
    erro.value = "Erro ao adicionar";
  } finally {
    adicionando.value = false;
  }
}

/* fechar ao clicar fora */
function aoClicarFora(e) {
  if (raizPopover.value && !raizPopover.value.contains(e.target)) {
    popoverAberto.value = false;
  }
}

onMounted(() => document.addEventListener("click", aoClicarFora));
onBeforeUnmount(() => document.removeEventListener("click", aoClicarFora));
</script>

<template>
  <div class="card-livro-grid">

    <!-- CAPA (única área clicável que navega) -->
    <div class="capa-wrapper" @click="abrirLivro">
      <img class="capa" :src="getBookCover(livro)" alt="Capa do livro" />

      <!-- BOTÃO -->
      <div class="popover-wrapper" ref="raizPopover">

        <button
          class="btn-adicionar"
          :class="{ adicionado }"
          @click="abrirPopover"
          :disabled="adicionando"
        >
          <Check v-if="adicionado" :size="14" />
          <Plus v-else :size="14" />

          <span>
            {{ adicionado ? "Adicionado" : adicionando ? "..." : "Adicionar" }}
          </span>
        </button>

        <div v-if="popoverAberto" class="popover-status">
          <button
            v-for="opcao in statusOpcoes"
            :key="opcao.value"
            class="popover-item"
            @click="escolherStatus($event, opcao.value)"
          >
            {{ opcao.label }}
          </button>
        </div>

      </div>
    </div>

    <!-- DETALHES (também clicável se quiser UX melhor) -->
    <div class="detalhes" @click="abrirLivro">
      <h2 class="titulo">{{ livro.titulo }}</h2>

      <p class="autor" v-if="getAutores(livro)">
        {{ getAutores(livro) }}
      </p>

      <div class="avaliacao" v-if="livro.nota">
        <Star :size="12" fill="currentColor" stroke="none" />
        <span>{{ Number(livro.nota).toFixed(1) }}</span>
      </div>

      <p v-if="erro" class="erro-msg">{{ erro }}</p>
    </div>

  </div>
</template>

<style scoped>
.card-livro-grid {
  width: 180px;
}

.capa-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

.capa {
  width: 180px;
  display: block;
}

.popover-wrapper {
  position: absolute;
  top: 8px;
  right: 8px;
}

.btn-adicionar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #6b4226;
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
}

.btn-adicionar.adicionado {
  background: #3a7d44;
}

.popover-status {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border: 1px solid #e8d8c3;
  border-radius: 10px;
  z-index: 10;
}

.popover-item {
  width: 100%;
  background: none;
  border: none;
  padding: 10px;
  text-align: left;
}

.detalhes {
  margin-top: 10px;
  cursor: pointer;
}

.titulo {
  font-size: 14px;
}

.autor {
  font-size: 13px;
  color: #9c8a7a;
}

.avaliacao {
  display: flex;
  gap: 4px;
}

.erro-msg {
  color: red;
  font-size: 11px;
}
</style>