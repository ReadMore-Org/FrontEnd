<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useLivrosStore } from "@/stores/livros";
import { useGoogleBooksStore } from "@/stores/googleBooks";
import { Star, Heart, Share2, Settings, ArrowLeft } from "lucide-vue-next";
import statusSelect from "@/components/common/statusSelect.vue";

const route = useRoute();

const googleBooksStore = useGoogleBooksStore();
const isGoogleBook = computed(() => route.path.startsWith("/livro/google"));

const id = route.params.id;
const livroStore = useLivrosStore();

const status = ref("quero_ler");
const statusOpcoes = ["quero-ler", "lendo", "lido"];

// Estado para controlar a tela de loading do livro
const isLoading = ref(true);

const isFavorito = ref(false);

const toggleFavorito = () => {
  isFavorito.value = !isFavorito.value;
};

const livro = computed(() => {
  if (isGoogleBook.value) {
    return googleBooksStore.livroSelecionado;
  }

  return livroStore.livros.find((l) => l.id === Number(id));
});

onMounted(async () => {
  try {
    if (isGoogleBook.value) {
      await googleBooksStore.buscarLivro(id);
    } else {
      await Promise.all([livroStore.fetchLivros(), livroStore.fetchCategorias()]);
    }
  } catch (error) {
    console.error("Erro ao carregar detalhes do livro:", error);
  } finally {
    // Desativa o loading assim que as requisições terminarem
    isLoading.value = false;
  }
});

const formatarData = (data) => {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR");
};

const voltar = () => {
  window.history.back();
};

const getBookCover = (livro) => {
  if (!livro) return "/imgs/livro_sem_capa.png";

  const capa = typeof livro.capa === "string" ? livro.capa : livro.capa?.url;

  if (capa) {
    return capa.startsWith("http") ? capa : `${import.meta.env.VITE_API_BASE_URL}${capa}`;
  }

  return "/imgs/livro_sem_capa.png";
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
  <button @click="voltar" class="btn-voltar">
    <ArrowLeft />
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
        <h1 class="titulo">{{ livro.titulo }}</h1>
        <p v-if="livro.autores && livro.autores.length" class="autores">
          por
          <span class="autores-nome">{{
            livro.autores?.map((a) => (typeof a === "string" ? a : a.nome)).join(", ")
          }}</span>
        </p>
        <div class="nota">
          <div class="estrelas">
            <span
              v-for="i in 5"
              :key="i"
              class="estrela"
              :class="{ preenchida: i <= Math.round(parseFloat(livro.nota)) }"
              ><Star
            /></span>
          </div>
          <div class="nota-info">
            <p class="nota-valor">{{ livro.nota ?? "N/A" }}</p>
            <p class="nota-texto">({{ livro.avaliacoes ?? "0" }} avaliações)</p>
          </div>
        </div>

        <div class="categorias">
          <p>{{ categoriaNome }}</p>
        </div>
        <statusSelect v-model="status" />
      </div>

      <div>
        <ul>
          <li>
            <Heart
              :size="40"
              @click="toggleFavorito"
              :class="['icone-coracao', { favoritado: isFavorito }]"
            />
          </li>
          <li>
            <Share2 :size="40" />
          </li>
          <li>
            <Settings />
          </li>
        </ul>
      </div>
    </div>
    <div class="infoMaior">
      <div class="secao-sinopse">
        <h2 class="titulo-secao">Sinopse</h2>
        <p class="texto-sinopse" v-html="livro.sinopse"></p>
      </div>
      <div class="secao-detalhes">
        <h2 class="titulo-secao">Detalhes</h2>
        <div class="grid-detalhes">
          <div class="detalhe-item">
            <p class="detalhe-label">Idioma:</p>
            <p class="detalhe-valor">
              {{ livro.idioma === "pt" ? "Português" : livro.idioma }}
            </p>
          </div>
          <div class="detalhe-item">
            <p class="detalhe-label">Páginas:</p>
            <p class="detalhe-valor">{{ livro.paginas }}</p>
          </div>
          <div class="detalhe-item">
            <p class="detalhe-label">Publicado:</p>
            <p class="detalhe-valor">{{ formatarData(livro.publicacao) }}</p>
          </div>
          <div class="detalhe-item">
            <p class="detalhe-label">Faixa Etária:</p>
            <p class="detalhe-valor">{{ livro.faixa_etaria ?? "-" }}</p>
          </div>
          <div class="detalhe-item">
            <p class="detalhe-label">ISBN:</p>
            <p class="detalhe-valor isbn">{{ livro.isbn }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="erro-container">
    <p>Não foi possível encontrar as informações deste livro.</p>
  </div>
</template>

<style scoped>
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
  background-color: #fcfbf9;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e0d7d0;
  border-top: 4px solid #8b5e3c; 
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.loading-container p {
  color: #8b5e3c;
  font-weight: 500;
  font-size: 18px;
}

.erro-container {
  text-align: center;
  padding: 40px;
  color: #c9a227;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.livroTodo {
  padding: 4vw 20vw;
}
.livro {
  display: flex;
  gap: 30px;
}

.imagem-capa {
  width: 270px;
  height: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.titulo {
  font-size: 28px;
  font-weight: 700;
  color: #2c2c2c;
}

.autores {
  color: #2c2c2c;
  font-size: 16px;
}
.nota {
  display: flex;
  gap: 10px;
}
.estrelas {
  display: flex;
  gap: 4px;
  color: #ccc;
}

.estrela.preenchida svg {
  fill: #c9a227;
  stroke: #c9a227;
}

.nota-info {
  display: flex;
  gap: 8px;
  align-items: center;
  color: #2c2c2c;
}

.categorias {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}

.categorias p {
  background-color: #8b5e3c;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}
.livro ul {
  display: flex;
  gap: 18px;
  list-style: none;
  margin-left: 100px;
}

.livro li svg {
  width: 25px;
  height: 25px;
  color: #555;
  cursor: pointer;
}
div.infoMaior {
  display: flex;
  width: 50%;
  margin: 5vw 0;
  gap: 5vw;
}
div.secao-sinopse h2 {
  margin: 0 0 20px 0;
  color: #2c2c2c;
  font-weight: 500;
}
div.secao-sinopse p {
  color: #5a4636;
  min-width: 30vw;
}
div.secao-detalhes h2 {
  margin: 0 0 20px 0;
  color: #2c2c2c;
  font-weight: 500;
}
div.secao-detalhes div.detalhe-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.icone-coracao {
  transition: all 0.2s ease;
  color: #555; 
  fill: transparent; 
}

.icone-coracao.favoritado {
  color: #e53e3e;
  fill: #e53e3e; 
}

div.secao-detalhes p {
  color: #5a4636;
}

.btn-voltar {
  display: flex;
  align-items: center;
  margin: 20px 20px;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 100px;
  background: white;
  color: #2c2c2c;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn-voltar svg {
  width: 18px;
  height: 18px;
}
</style>
