<script setup>
import { Heart, Share2, Settings, ArrowLeft, Trash2 } from "lucide-vue-next";
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import StatusSelect from "../common/statusSelect.vue";
import { useLivrosStore } from "@/stores/livros";
import { useGoogleBooksStore } from "@/stores/googleBooks";

import { useToast } from "vue-toastification";

defineProps({
  livro: Object,
  categoriaNome: String,
});

const route = useRoute();
const router = useRouter();

const googleBooksStore = useGoogleBooksStore();

const toast = useToast();

const getBookCover = (livro) => {
  if (!livro) return "/imgs/livro_sem_capa.png";

  const capa = livro.capa;
  const url = typeof capa === "string" ? capa : capa?.url;

  if (!url) return "/imgs/livro_sem_capa.png";

  if (url.startsWith("http")) {
    const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost)/i.test(url);
    return isLocal ? url : url.replace(/^http:\/\//i, "https://");
  }

  return `${import.meta.env.VITE_API_BASE_URL}${url}`;
};

const voltar = () => {
  window.history.back();
};

const livroStore = useLivrosStore();

const isGoogleBook = computed(() => route.path.startsWith("/livro/google"));

// =========================================================
// ESTADOS DA PÁGINA
// =========================================================

const status = ref(null);
const meuLivroId = ref(null);

const isLoading = ref(true);
const isUpdatingStatus = ref(false);
const isDeleting = ref(false);
const isFavorito = ref(false);

// =========================================================
// FAVORITO
// =========================================================

const toggleFavorito = () => {
  isFavorito.value = !isFavorito.value;
};

// =========================================================
// LIVRO ATUAL
// =========================================================

const livro = computed(() => {
  const currentId = route.params.id;

  if (isGoogleBook.value) {
    return googleBooksStore.livroSelecionado;
  }

  const numId = Number(currentId);

  const livroGeral = livroStore.livros.find((l) => l.id === numId);

  if (livroGeral) {
    return livroGeral;
  }

  const meuLivroItem = livroStore.meusLivros.find(
    (item) => item.livro?.id === numId || item.livro === numId || item.id === numId
  );

  if (meuLivroItem) {
    return typeof meuLivroItem.livro === "object" ? meuLivroItem.livro : meuLivroItem;
  }

  return null;
});

// =========================================================
// LIVRO DO USUÁRIO / ESTANTE
// =========================================================

const meuLivroItem = computed(() => {
  if (!livro.value) {
    return null;
  }

  const livroAtualId = livro.value.id;
  const routeId = route.params.id;

  return livroStore.meusLivros.find((item) => {
    if (item.livro?.id != null) {
      return String(item.livro.id) === String(livroAtualId);
    }

    if (item.livro != null) {
      return String(item.livro) === String(livroAtualId);
    }

    if (item.id != null) {
      return String(item.id) === String(livroAtualId);
    }

    if (routeId != null && item.livro?.google_book_id != null) {
      return String(item.livro.google_book_id) === String(routeId);
    }

    return false;
  });
});

// =========================================================
// CARREGAR STATUS ATUAL
// =========================================================

const carregarStatusAtual = () => {
  if (meuLivroItem.value) {
    meuLivroId.value = meuLivroItem.value.id;

    status.value = meuLivroItem.value.status
      ? String(meuLivroItem.value.status).toLowerCase()
      : null;
  }
};

// =========================================================
// SINCRONIZA STATUS QUANDO MEU LIVRO MUDAR
// =========================================================

watch(
  meuLivroItem,
  () => {
    carregarStatusAtual();
  },
  {
    immediate: true,
  }
);

// =========================================================
// CARREGAMENTO INICIAL
// =========================================================

const carregarDados = async () => {
  isLoading.value = true;

  const currentId = route.params.id;

  try {
    if (isGoogleBook.value) {
      await googleBooksStore.buscarLivro(currentId);
    } else {
      await Promise.all([livroStore.fetchLivros(), livroStore.fetchCategorias()]);
    }

    if (livroStore.fetchMeusLivros) {
      await livroStore.fetchMeusLivros();
    } else if (livroStore.buscarMeusLivros) {
      await livroStore.buscarMeusLivros();
    }

    carregarStatusAtual();
  } catch (error) {
    console.error("Erro ao carregar detalhes do livro:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  carregarDados();
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      carregarDados();
    }
  }
);

// =========================================================
// ALTERAÇÃO DO STATUS
// =========================================================

const onStatusChange = async (novoStatus) => {
  if (isUpdatingStatus.value || novoStatus === status.value) {
    return;
  }

  const statusAnterior = status.value;
  status.value = novoStatus;
  isUpdatingStatus.value = true;

  try {
    const idLivroParaSalvar = livro.value?.id ?? route.params.id;

    if (isGoogleBook.value || typeof idLivroParaSalvar === "string") {
      await livroStore.importarLivroDoGoogle(livro.value, novoStatus);
    } else {
      await livroStore.atualizarStatusMeuLivro(Number(idLivroParaSalvar), novoStatus);
    }

    if (livroStore.fetchMeusLivros) {
      await livroStore.fetchMeusLivros();
    } else if (livroStore.buscarMeusLivros) {
      await livroStore.buscarMeusLivros();
    }

    if (meuLivroItem.value) {
      carregarStatusAtual();
    }
  } catch (err) {
    console.error("Erro ao atualizar o status:", err);
    status.value = statusAnterior;
  } finally {
    isUpdatingStatus.value = false;
  }
};

// =========================================================
// MODAL E REMOÇÃO
// =========================================================

const mostrarModalRemocao = ref(false);

const abrirModalRemocao = () => {
  if (!meuLivroItem.value || isDeleting.value) {
    return;
  }
  mostrarModalRemocao.value = true;
};

const cancelarRemocao = () => {
  if (isDeleting.value) {
    return;
  }
  mostrarModalRemocao.value = false;
};

const removerDaEstante = async () => {
  if (!meuLivroItem.value || isDeleting.value) return;

  isDeleting.value = true;

  try {
    const idParaRemover = meuLivroItem.value.id;

    console.log("Removendo ID:", idParaRemover);

    await livroStore.removerMeuLivro(idParaRemover);

    toast.success("Livro removido com sucesso!");

    mostrarModalRemocao.value = false;

    // Aguarda 1.5 segundos para o usuário ver a notificação na tela
    setTimeout(() => {
      router.back();
    }, 300);
  } catch (err) {
    console.error("Erro ao remover da estante:", err);
    toast.error("Erro ao remover o livro da estante.");
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <AppHeader />
  <div v-if="livro" class="mobile">
    <!-- TOPO -->
    <div class="topo">
      <button @click="voltar" class="btn-voltar">
        <ArrowLeft />
      </button>

      <p>Detalhes</p>
      <div class="acoes">
        <Share2 />
        <Settings />
      </div>
    </div>

    <!-- CAPA -->
    <div class="capa">
      <img :src="getBookCover(livro)" class="imagem" />
      <div class="coracao" @click="toggleFavorito">
        <Heart :size="24" :class="{ favoritado: isFavorito }" />
      </div>
    </div>

    <div class="info">
      <h1>{{ livro.titulo }}</h1>
      <p>{{ livro.autores.map((a) => a.nome).join(", ") }}</p>
    </div>

    <!-- STATUS -->
    <statusSelect v-model="status" variante="livro" @update:modelValue="onStatusChange" />

    <!-- DETALHES RESUMIDOS -->
    <div class="detalhes">
      <div>
        <p>{{ livro.idioma === "pt" ? "Português" : livro.idioma }}</p>
        <span>Idioma</span>
      </div>

      <div class="paginas">
        <p>{{ livro.paginas }}</p>
        <span>Páginas</span>
      </div>

      <div class="ano">
        <p>{{ new Date(livro.publicacao).getFullYear() }}</p>
        <span>Ano</span>
      </div>
    </div>

    <div class="bot">
      <!-- SINOPSE -->
      <div class="sinopse">
        <h2>Sinopse</h2>
        <p>{{ livro.sinopse }}</p>
      </div>

      <button
        v-if="meuLivroItem"
        class="btn-deletar-estante"
        @click="abrirModalRemocao"
        :disabled="isDeleting"
        type="button"
        title="Remover da estante"
      >
        <Trash2 :size="18" />
        <span>Remover da estante</span>
      </button>
    </div>

    <!-- MODAL DE CONFIRMAÇÃO DE REMOÇÃO DA ESTANTE -->
    <Teleport to="body">
      <div v-if="mostrarModalRemocao" class="modal-overlay" @click.self="cancelarRemocao">
        <div class="modal-remocao">
          <button class="modal-fechar" @click="cancelarRemocao" :disabled="isDeleting">
            &times;
          </button>

          <div class="modal-icone">
            <Trash2 :size="28" color="#a4161a" />
          </div>

          <h2>Remover da estante?</h2>
          <p>
            Tem certeza que deseja remover <strong>{{ livro.titulo }}</strong> da sua
            estante?
          </p>

          <div class="modal-acoes">
            <button
              class="btn-modal-cancelar"
              @click="cancelarRemocao"
              :disabled="isDeleting"
              type="button"
            >
              Cancelar
            </button>
            <button
              class="btn-modal-remover"
              @click="removerDaEstante"
              :disabled="isDeleting"
              type="button"
            >
              {{ isDeleting ? "Removendo..." : "Remover" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
  <AppFooter />
</template>

<style scoped>
.mobile {
  padding: 20px;
}

/* topo */
.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.acoes {
  display: flex;
  gap: 15px;
}

.acoes svg {
  width: 22px;
  height: 22px;
  color: #555;
}

.capa {
  margin: 20px auto;
  position: relative;
  width: 200px;
}

.imagem {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
}

.capa .coracao {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: white;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* info */
.info h1 {
  font-size: 18px;
  margin-bottom: 5px;
  color: #2c2c2c;
}

.info p {
  font-size: 14px;
  color: #5a4636;
}

/* detalhes */
.detalhes {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
}

.detalhes .paginas {
  border-left: 2px solid #5a4636;
  border-right: 2px solid #5a4636;
  padding: 0 30px;
}

.detalhes .ano {
  text-align: right;
}

.detalhes span {
  font-size: 12px;
  color: #9c8a7a;
}

.detalhes p {
  font-weight: 600;
  color: #6b4226;
}

/* sinopse */
.sinopse h2 {
  margin-bottom: 10px;
  color: #2c2c2c;
}

.sinopse p {
  font-size: 14px;
  color: #5a4636;
}

/* botão voltar */
.btn-voltar {
  border: none;
  background: white;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
}

.bot {
  display: flex;
  flex-direction: column;
}

.btn-deletar-estante {
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 20px;
  height: 35px;
  padding: 0 12px;
  box-sizing: border-box;
  flex-shrink: 0;
  background: transparent;
  border: 1px solid #a4161a;
  border-radius: 8px;
  color: #a4161a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.btn-deletar-estante:hover {
  background-color: #a4161a;
  color: white;
}

.btn-deletar-estante:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* =========================================================
   MODAL DE CONFIRMAÇÃO DE REMOÇÃO
   ========================================================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  animation: aparecerOverlay 0.2s ease;
}

.modal-remocao {
  position: relative;
  width: min(420px, 100%);
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: aparecerModal 0.2s ease;
}

.modal-fechar {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #8a7a6a;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.modal-fechar:hover {
  background: #f3eee9;
  color: #5a4636;
}

.modal-icone {
  width: 56px;
  height: 56px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fbe9e9;
  font-size: 24px;
}

.modal-remocao h2 {
  margin: 0 0 10px;
  color: #4b3626;
  font-size: 22px;
  font-weight: 600;
}

.modal-remocao p {
  margin: 0 auto;
  max-width: 340px;
  color: #6f6257;
  font-size: 14px;
  line-height: 1.6;
}

.modal-remocao p strong {
  color: #4b3626;
}

.modal-acoes {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 26px;
}

.btn-modal-cancelar,
.btn-modal-remover {
  min-width: 110px;
  height: 40px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease,
    opacity 0.2s ease;
}

.btn-modal-cancelar {
  background: #ffffff;
  border: 1px solid #d8c9ba;
  color: #5a4636;
}

.btn-modal-cancelar:hover {
  background: #f5f0eb;
}

.btn-modal-remover {
  background: #a4161a;
  border: 1px solid #a4161a;
  color: #ffffff;
}

.btn-modal-remover:hover {
  background: #861215;
  border-color: #861215;
}

.btn-modal-cancelar:disabled,
.btn-modal-remover:disabled,
.modal-fechar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes aparecerOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes aparecerModal {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
