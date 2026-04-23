<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useLivrosStore } from "@/stores/livros";
import { Star, Heart, Share2, Settings, ArrowLeft } from "lucide-vue-next";
import statusSelect from "@/components/common/statusSelect.vue";
const route = useRoute();
const livroStore = useLivrosStore();
const id = Number(route.params.id);

const status = ref("quero-ler");
const statusOpcoes = ["quero-ler", "lendo", "lido"];

const livro = computed(() => {
  return livroStore.livros.find((livro) => livro.id === id);
});
onMounted(async () => {
  await Promise.all([livroStore.fetchLivros(), livroStore.fetchCategorias()]);
});
const formatarData = (data) => {
  return new Date(data).toLocaleDateString("pt-BR");
};
const voltar = () => {
  window.history.back();
};
const categoriaNome = computed(() => {
  const livroAtual = livro.value;
  const categorias = livroStore.categorias;

  if (!livroAtual || !categorias.length) return "";

  const categoria = categorias.find(
    (c) => Number(c.id) === Number(livroAtual.categoria),
  );

  return categoria?.descricao || "Sem categoria";
});
</script>
<template>
  <button @click="voltar" class="btn-voltar">
    <ArrowLeft />
    <span>Voltar</span>
  </button>
  <div v-if="livro" class="livroTodo">
    <div class="livro">
      <img
        :src="livro.capa?.url || 'https://via.placeholder.com/300x450'"
        :alt="livro.titulo"
        class="imagem-capa"
      />
      <div class="info">
        <h1 class="titulo">{{ livro.titulo }}</h1>
        <p v-if="livro.autores && livro.autores.length" class="autores">
          por
          <span class="autores-nome">{{
            livro.autores.map((a) => a.nome).join(", ")
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
            <p class="nota-valor">{{ livro.nota }}</p>
            <p class="nota-texto">({{ livro.avaliacoes }} avaliações)</p>
          </div>
        </div>

        <div class="categorias">
          <p>{{ categoriaNome }}</p>
        </div>
        <statusSelect />
      </div>

      <div>
        <ul>
          <li>
            <Heart :size="40"/>
          </li>
          <li>
            <Share2 :size="40"/>
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
        <p class="texto-sinopse">{{ livro.sinopse }}</p>
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
            <p class="detalhe-valor">{{ livro.faixa_etaria }}</p>
          </div>
          <div class="detalhe-item">
            <p class="detalhe-label">ISBN:</p>
            <p class="detalhe-valor isbn">{{ livro.isbn }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.livro {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  justify-content: center;
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
    margin: 60px auto;
}
div.secao-sinopse {
}
div.secao-sinopse h2 {
    margin: 0 0 20px 0;
    color: #2C2C2C;
    font-weight: 500;
}
div.secao-sinopse p {
    width: 80%;
    color: #5A4636;
}
div.secao-detalhess {

}
div.secao-detalhes h2 {
    margin: 0 0 20px 0;
    color: #2C2C2C;
    font-weight: 500;
}
div.secao-detalhes div.detalhe-item {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}
div.secao-detalhes p {
    color: #5A4636;
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
  color: #2C2C2C;

  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}


.btn-voltar svg {
  width: 18px;
  height: 18px;
}
</style>
