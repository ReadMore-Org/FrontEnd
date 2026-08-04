<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useLivrosStore } from "@/stores/livros";
import { useGoogleBooksStore } from "@/stores/googleBooks";
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
  Trash2, // <--- Adicionado para o botão de deletar
} from "lucide-vue-next";
import statusSelect from "@/components/common/statusSelect.vue";

const route = useRoute();

const googleBooksStore = useGoogleBooksStore();
const isGoogleBook = computed(() => route.path.startsWith("/livro/google"));

const id = route.params.id;
const livroStore = useLivrosStore();

const status = ref("quero_ler");
const isLoading = ref(true);
const isUpdatingStatus = ref(false);
const isDeleting = ref(false);
const isFavorito = ref(false);

const toggleFavorito = () => {
  isFavorito.value = !isFavorito.value;
};

const livro = computed(() => {
  if (isGoogleBook.value) {
    return googleBooksStore.livroSelecionado;
  }

  const numId = Number(id);

  // 1. Tenta encontrar na lista geral de livros
  const livroGeral = livroStore.livros.find((l) => l.id === numId);
  if (livroGeral) return livroGeral;

  // 2. Se não achou na lista geral, busca na lista de livros do usuário
  const meuLivroItem = livroStore.meusLivros.find(
    (item) =>
      item.livro?.id === numId ||
      item.livro === numId ||
      item.id === numId
  );

  if (meuLivroItem) {
    return typeof meuLivroItem.livro === "object"
      ? meuLivroItem.livro
      : meuLivroItem;
  }

  return null;
});

// Identifica se o livro atual está salvo na estante do usuário
const meuLivroItem = computed(() => {
  if (!livro.value) return null;
  const numId = Number(livro.value.id || id);

  return livroStore.meusLivros.find(
    (item) =>
      item.livro?.id === numId ||
      item.livro === numId ||
      item.id === numId
  );
});

const carregarStatusAtual = () => {
  if (meuLivroItem.value && meuLivroItem.value.status) {
    status.value = meuLivroItem.value.status;
  } else {
    status.value = "quero_ler";
  }
};

onMounted(async () => {
  try {
    if (isGoogleBook.value) {
      await googleBooksStore.buscarLivro(id);
    } else {
      await Promise.all([
        livroStore.fetchLivros(),
        livroStore.fetchCategorias(),
      ]);
    }
    await livroStore.fetchMeusLivros();
    carregarStatusAtual();
  } catch (error) {
    console.error("Erro ao carregar detalhes do livro:", error);
  } finally {
    isLoading.value = false;
  }
});

// Atualiza apenas quando o usuário interage diretamente com o componente
const onStatusChange = async (novoStatus) => {
  if (isUpdatingStatus.value || novoStatus === status.value) return;

  const statusAnterior = status.value;
  status.value = novoStatus; // Atualiza a UI imediatamente
  isUpdatingStatus.value = true;

  try {
    const livroPayload = isGoogleBook.value
      ? { ...livro.value, isGoogleBook: true }
      : livro.value.id;

    await livroStore.atualizarStatusMeuLivro(livroPayload, novoStatus);
  } catch (err) {
    console.error("Erro ao atualizar o status:", err);
    status.value = statusAnterior; // Reverte se der erro, sem acionar loop
  } finally {
    isUpdatingStatus.value = false;
  }
};

// Remove o livro da estante do usuário
const removerDaEstante = async () => {
  if (!meuLivroItem.value) return;

  if (confirm("Tem certeza que deseja remover este livro da sua estante?")) {
    isDeleting.value = true;
    try {
      const meuLivroId = meuLivroItem.value.id;
      await livroStore.removerMeuLivro(meuLivroId);
      status.value = "quero_ler"; // Reseta o status local
    } catch (err) {
      console.error("Erro ao remover o livro da estante:", err);
    } finally {
      isDeleting.value = false;
    }
  }
};

const formatarData = (data) => {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR");
};

const voltar = () => {
  window.history.back();
};

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

const categoriaNome = computed(() => {
  const livroAtual = livro.value;
  const categorias = livroStore.categorias;

  if (!livroAtual || !categorias.length) return "";

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
                  livro.autores.map((a) => (typeof a === "string" ? a : a.nome)).join(", ")
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

          <!-- Container do Status + Botão de Deletar -->
          <div class="container-status-acoes">
            <statusSelect
              :modelValue="status"
              @update:modelValue="onStatusChange"
              variante="livro"
              :disabled="isUpdatingStatus || isDeleting"
            />

            <!-- Botão de remover exibe apenas se o livro estiver na estante do usuário -->
            <button
              v-if="meuLivroItem"
              class="btn-deletar-estante"
              @click="removerDaEstante"
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
          <p class="texto-sinopse" v-html="livro.sinopse || 'Sem sinopse disponível.'"></p>
        </div>

        <div class="secao-detalhes">
          <h2 class="titulo-secao">Detalhes</h2>
          <div class="grid-detalhes">
            <div class="detalhe-item">
              <Languages :size="16" class="icone-detalhe" />
              <p class="detalhe-label">Idioma</p>
              <p class="detalhe-valor">{{ livro.idioma === "pt" ? "Português" : (livro.idioma || "-") }}</p>
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
</template>

<style scoped>
.pagina-livro {
  background-color: #f5e6d3;
  min-height: 100vh;
  padding: 20px 20vw 4vw;
}

/* voltar */
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

/* loading */
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.erro-container {
  text-align: center;
  padding: 40px;
  color: #a4161a;
  font-weight: 500;
}

/* topo do livro */
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

/* nota */
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

/* categoria */
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

/* container status e acao de remocao */
.container-status-acoes {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.btn-deletar-estante {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid #a4161a;
  color: #a4161a;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-deletar-estante:hover {
  background-color: #a4161a;
  color: white;
}

.btn-deletar-estante:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* sinopse + detalhes */
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
</style>