<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLivrosStore } from "@/stores/livros";
import { useGoogleBooksStore } from "@/stores/googleBooks";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";

import {
  Star,
  Heart,
  Share2,
  Settings,
  ArrowLeft,
  Languages,
  BookOpen,
  Calendar,
  Shield,
  Barcode,
  Trash2,
} from "lucide-vue-next";

import statusSelect from "@/components/common/statusSelect.vue";

const toast = useToast();

const route = useRoute();
const router = useRouter();

const googleBooksStore = useGoogleBooksStore();
const livroStore = useLivrosStore();
const authStore = useAuthStore();

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

  // Livro vindo do Google Books
  if (isGoogleBook.value) {
    return googleBooksStore.livroSelecionado;
  }

  const numId = Number(currentId);

  // 1. Procura na lista geral de livros
  const livroGeral = livroStore.livros.find((l) => l.id === numId);

  if (livroGeral) {
    return livroGeral;
  }

  // 2. Procura na lista de livros do usuário
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
  if (!livroStore.meusLivros?.length) {
    return null;
  }

  // Identificadores vindos da Rota e do objeto de Livro retornado
  const routeId = String(route.params.id || "").trim();
  const libroObj = livro.value;

  const targetGoogleId = String(
    libroObj?.google_book_id || libroObj?.id || routeId || ""
  ).trim();

  const targetIsbn = String(libroObj?.isbn || "").replace(/\D/g, "");
  const targetTitulo = (libroObj?.titulo || "").toLowerCase().trim();

  return livroStore.meusLivros.find((item) => {
    const itemLivro = typeof item.livro === "object" ? item.livro : item;

    // 1. Comparação por Google Book ID / ID
    const bancoGoogleId = String(
      item.google_book_id || itemLivro?.google_book_id || itemLivro?.id || item.id || ""
    ).trim();

    if (targetGoogleId && bancoGoogleId && targetGoogleId === bancoGoogleId) {
      return true;
    }

    // 2. Comparação Confiável por ISBN
    const bancoIsbn = String(item.isbn || itemLivro?.isbn || "").replace(/\D/g, "");

    if (targetIsbn && bancoIsbn && targetIsbn === bancoIsbn) {
      return true;
    }

    // 3. Fallback por Título
    const bancoTitulo = (item.titulo || itemLivro?.titulo || "").toLowerCase().trim();
    if (targetTitulo && bancoTitulo && targetTitulo === bancoTitulo) {
      return true;
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
  () => meuLivroItem.value,
  (novoItem) => {
    if (novoItem) {
      meuLivroId.value = novoItem.id;
      status.value = novoItem.status ? String(novoItem.status).toLowerCase() : null;
    } else {
      status.value = null;
      meuLivroId.value = null;
    }
  },
  { immediate: true, deep: true }
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

// =========================================================
// MOUNT
// =========================================================

onMounted(() => {
  carregarDados();
});

// =========================================================
// TROCA DE LIVRO PELA ROTA
// =========================================================

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
  if (!authStore.isAuthenticated) {
    router.push("/entrar");
    return;
  }

  if (isUpdatingStatus.value || novoStatus === status.value) {
    return;
  }

  const statusAnterior = status.value;
  status.value = novoStatus;
  isUpdatingStatus.value = true;

  try {
    // Se o livro JÁ EXISTE na estante, atualiza direto no BD usando o ID do relacionamento
    if (meuLivroItem.value?.id) {
      await livroStore.atualizarStatusMeuLivro(meuLivroItem.value.id, novoStatus);
    }
    // Se NÃO EXISTE na estante ainda (e é da Google Store), importa
    else if (isGoogleBook.value) {
      await livroStore.importarLivroDoGoogle(livro.value, novoStatus);
    }
    // Fallback para livros nativos do sistema
    else {
      const idParaSalvar = livro.value?.id ?? route.params.id;
      await livroStore.atualizarStatusMeuLivro(Number(idParaSalvar), novoStatus);
    }

    // Recarrega a lista do banco para sincronizar a store global
    if (livroStore.fetchMeusLivros) {
      await livroStore.fetchMeusLivros();
    } else if (livroStore.buscarMeusLivros) {
      await livroStore.buscarMeusLivros();
    }

    carregarStatusAtual();
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
  if (!authStore.isAuthenticated) {
    router.push("/entrar");
    return;
  }

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
  if (!authStore.isAuthenticated) {
    router.push("/entrar");
    return;
  }

  if (!meuLivroItem.value || isDeleting.value) return;

  isDeleting.value = true;

  try {
    const idParaRemover = meuLivroItem.value.id;

    await livroStore.removerMeuLivro(idParaRemover);

    toast.success("Livro removido com sucesso!");

    mostrarModalRemocao.value = false;

    setTimeout(() => {
      router.back();
    }, 500);
  } catch (err) {
    console.error("Erro ao remover da estante:", err);
    toast.error("Erro ao remover o livro da estante.");
  } finally {
    isDeleting.value = false;
  }
};

// =========================================================
// FORMATAÇÃO DE DATA
// =========================================================

const formatarData = (data) => {
  if (!data) {
    return "-";
  }

  return new Date(data).toLocaleDateString("pt-BR");
};

// =========================================================
// VOLTAR
// =========================================================

const voltar = () => {
  window.history.back();
};

// =========================================================
// CAPA DO LIVRO
// =========================================================

const getBookCover = (livro) => {
  if (!livro) {
    return "/imgs/livro_sem_capa.png";
  }

  const capa = livro.capa;
  const url = typeof capa === "string" ? capa : capa?.url;

  if (!url) {
    return "/imgs/livro_sem_capa.png";
  }

  if (url.startsWith("http")) {
    const isLocal = /^https?:\/\/(127\.0\.0\.1|localhost)/i.test(url);
    return isLocal ? url : url.replace(/^http:\/\//i, "https://");
  }

  return `${import.meta.env.VITE_API_BASE_URL}${url}`;
};

// =========================================================
// CATEGORIA
// =========================================================

const categoriaNome = computed(() => {
  const livroAtual = livro.value;
  const categorias = livroStore.categorias;

  if (!livroAtual || !categorias?.length) {
    return "";
  }

  const categoria = categorias.find((c) => Number(c.id) === Number(livroAtual.categoria));

  return categoria?.descricao || "Sem categoria";
});
</script>

<template>
  <div class="pagina-livro">
    <button @click="voltar" class="btn-voltar" type="button">
      <ArrowLeft :size="17" />
      <span>Voltar</span>
    </button>

    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Buscando detalhes do livro...</p>
    </div>

    <div v-else-if="livro" class="livroTodo">
      <div class="livro">
        <img class="imagem-capa" :src="getBookCover(livro)" alt="Capa do livro" />

        <div class="info">
          <div class="cabecalho">
            <div>
              <h1 class="titulo">{{ livro.titulo }}</h1>

              <p v-if="livro.autores && livro.autores.length" class="autores">
                por
                <span class="autores-nome">{{
                  livro.autores
                    .map((a) => (typeof a === "string" ? a : a.nome))
                    .join(", ")
                }}</span>
              </p>
            </div>

            <div class="acoes">
              <button class="icone-acao" @click="toggleFavorito" type="button">
                <Heart
                  :size="18"
                  :fill="isFavorito ? '#a4161a' : 'none'"
                  :color="isFavorito ? '#a4161a' : '#5a4636'"
                />
              </button>
              <button class="icone-acao" type="button">
                <Share2 :size="17" />
              </button>
              <button class="icone-acao" type="button">
                <Settings :size="17" />
              </button>
            </div>
          </div>

          <div class="nota">
            <div class="estrelas">
              <span
                v-for="i in 5"
                :key="i"
                class="estrela"
                :class="{ preenchida: i <= Math.round(parseFloat(livro.nota || 0)) }"
                ><Star :size="16"
              /></span>
            </div>
            <div class="nota-info">
              <p class="nota-valor">{{ livro.nota ?? "N/A" }}</p>
              <p class="nota-texto">({{ livro.avaliacoes ?? "0" }} avaliações)</p>
            </div>
          </div>

          <div class="categorias" v-if="categoriaNome">
            <p>{{ categoriaNome }}</p>
          </div>

          <div class="container-status-acoes">
            <div class="status-wrapper">
              <statusSelect
                :modelValue="status || ''"
                @update:modelValue="onStatusChange"
                variante="livro"
                esconder-label
                :disabled="isUpdatingStatus || isDeleting"
              />
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
        </div>
      </div>

      <div class="infoMaior">
        <div class="secao-sinopse">
          <h2 class="titulo-secao">Sinopse</h2>
          <p
            class="texto-sinopse"
            v-html="livro.sinopse || 'Sem sinopse disponível.'"
          ></p>
        </div>

        <div class="secao-detalhes">
          <h2 class="titulo-secao">Detalhes</h2>
          <div class="grid-detalhes">
            <div class="detalhe-item">
              <Languages :size="16" class="icone-detalhe" />
              <p class="detalhe-label">Idioma</p>
              <p class="detalhe-valor">
                {{ livro.idioma === "pt" ? "Português" : livro.idioma || "-" }}
              </p>
            </div>
            <div class="detalhe-item">
              <BookOpen :size="16" class="icone-detalhe" />
              <p class="detalhe-label">Páginas</p>
              <p class="detalhe-valor">{{ livro.paginas || "-" }}</p>
            </div>
            <div class="detalhe-item">
              <Calendar :size="16" class="icone-detalhe" />
              <p class="detalhe-label">Publicado</p>
              <p class="detalhe-valor">{{ formatarData(livro.publicacao) }}</p>
            </div>
            <div class="detalhe-item">
              <Shield :size="16" class="icone-detalhe" />
              <p class="detalhe-label">Faixa Etária</p>
              <p class="detalhe-valor">{{ livro.faixa_etaria ?? "-" }}</p>
            </div>
            <div class="detalhe-item">
              <Barcode :size="16" class="icone-detalhe" />
              <p class="detalhe-label">ISBN</p>
              <p class="detalhe-valor isbn">{{ livro.isbn || "-" }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="erro-container">
      <p>Não foi possível encontrar as informações deste livro.</p>
    </div>
  </div>

  <div v-if="mostrarModalRemocao" class="modal-overlay" @click.self="cancelarRemocao">
    <div class="modal-remocao">
      <button
        class="modal-fechar"
        type="button"
        :disabled="isDeleting"
        @click="cancelarRemocao"
        aria-label="Fechar"
      >
        ×
      </button>

      <div class="modal-icone">
        <Trash2 :size="28" color="#a4161a" />
      </div>

      <h2>Remover livro?</h2>

      <p>
        Tem certeza que deseja remover
        <strong>{{ livro?.titulo }}</strong>
        da sua estante?
      </p>

      <div class="modal-acoes">
        <button
          type="button"
          class="btn-modal-cancelar"
          :disabled="isDeleting"
          @click="cancelarRemocao"
        >
          Cancelar
        </button>

        <button
          type="button"
          class="btn-modal-remover"
          :disabled="isDeleting"
          @click="removerDaEstante"
        >
          <span v-if="!isDeleting">Remover</span>
          <span v-else>Removendo...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagina-livro {
  background-color: #f5e6d3;
  min-height: 100vh;
  padding: 20px 20vw 4vw;
}

.btn-voltar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 4px;
  margin-bottom: 20px;
  border: none;
  background: none;
  color: #5a4636;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: color 0.2s ease, transform 0.2s ease;
}

.btn-voltar:hover {
  color: #6b4226;
  transform: translateX(-2px);
}

.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
  background-color: #fff8f0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e8d8c3;
  border-top: 4px solid #6b4226;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.loading-container p {
  color: #6b4226;
  font-weight: 500;
  font-size: 18px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.erro-container {
  text-align: center;
  padding: 40px;
  color: #a4161a;
  font-weight: 500;
}

.livro {
  display: flex;
  gap: 36px;
  margin-bottom: 32px;
}

.imagem-capa {
  width: 220px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(107, 66, 38, 0.18);
  object-fit: cover;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.titulo {
  font-size: 26px;
  font-weight: 700;
  color: #2c2c2c;
  margin: 0 0 6px;
}

.autores {
  color: #5a4636;
  font-size: 15px;
  margin: 0;
}

.autores-nome {
  font-weight: 500;
}

.acoes {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.icone-acao {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #9c8a7a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.icone-acao:hover {
  background-color: #faf3e0;
  color: #6b4226;
}

.nota {
  display: flex;
  align-items: center;
  gap: 10px;
}

.estrelas {
  display: flex;
  gap: 2px;
  color: #e8d8c3;
}

.estrela.preenchida {
  color: #c9a227;
}

.nota-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nota-valor {
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
}

.nota-texto {
  color: #9c8a7a;
  font-size: 13px;
  margin: 0;
}

.categorias p {
  display: inline-block;
  background-color: #faf3e0;
  border: 1px solid #e8d8c3;
  color: #6b4226;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.container-status-acoes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  margin-top: 25px;
}

.status-wrapper {
  display: flex;
  align-items: center;
  margin: 0;
}

.btn-deletar-estante {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
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

.infoMaior {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 24px;
}

.secao-sinopse,
.secao-detalhes {
  background-color: #faf3e0;
  border: 1px solid #e8d8c3;
  border-radius: 12px;
  padding: 20px 22px;
  height: fit-content;
}

.titulo-secao {
  font-size: 15px;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 14px;
}

.texto-sinopse {
  font-size: 14px;
  line-height: 1.75;
  color: #5a4636;
  margin: 0;
}

.grid-detalhes {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detalhe-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icone-detalhe {
  color: #6b4226;
  flex-shrink: 0;
}

.detalhe-label {
  color: #9c8a7a;
  font-size: 13px;
  margin: 0;
}

.detalhe-valor {
  color: #5a4636;
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 0 auto;
}

@media (max-width: 600px) {
  .container-status-acoes {
    align-items: stretch;
    flex-direction: column;
    min-height: auto;
  }

  .status-wrapper {
    height: auto;
  }

  .btn-deletar-estante {
    width: 100%;
  }

  .modal-remocao {
    padding: 28px 20px;
  }

  .modal-acoes {
    flex-direction: column-reverse;
  }

  .btn-modal-cancelar,
  .btn-modal-remover {
    width: 100%;
  }
}
</style>