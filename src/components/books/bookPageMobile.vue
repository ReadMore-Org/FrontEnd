<script setup>
import { Heart, Share2, Settings, ArrowLeft } from "lucide-vue-next";
import StatusSelect from "../common/statusSelect.vue";

defineProps({
  livro: Object,
  categoriaNome: String,
});

const getBookCover = (livro) => {
  const url = livro.capa?.url;

  if (url) {
    return url.startsWith("http")
      ? url
      : `http://127.0.0.1:8000${url}`;
  }

  return "/imgs/livro_sem_capa.png";
};

const voltar = () => {
  window.history.back();
};

const formatarData = (data) => {
  return new Date(data).toLocaleDateString("pt-BR");
};
</script>

<template>
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
      <img
        :src="getBookCover(livro)"
        class="imagem"
      />
      <div class="coracao">
        <Heart :size="24"/>
      </div>
    </div>

    <div class="info">
      <h1>{{ livro.titulo }}</h1>
      <p>{{ livro.autores.map((a) => a.nome).join(", ") }}</p>
    </div>

    <!-- STATUS -->
    <statusSelect />

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

      <div>
        <p>{{ new Date(livro.publicacao).getFullYear() }}</p>
        <span>Ano</span>
      </div>
    </div>

    <!-- SINOPSE -->
    <div class="sinopse">
      <h2>Sinopse</h2>
      <p>{{ livro.sinopse }}</p>
    </div>
  </div>
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
  margin: 20px auto; /* isso centraliza */
  position: relative;
  width: 200px; /* tamanho parecido com antes */
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
.capa .coracao svg {
  top: 10px;
  right: 10px;
  cursor: pointer;
}

/* info */
.info {
}

.info h1 {
  font-size: 18px;
  margin-bottom: 5px;
  color: #2C2C2C;
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
}
</style>
