<script setup>
import { Check } from "lucide-vue-next";
defineProps({
  livro: Object,
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
</script>

<template>
  <div class="card-livro">
    <img class="imagem" :src="getBookCover(livro)" alt="Capa do livro" />

    <div class="detalhes">
      <h1>{{ livro.titulo }}</h1>
      <p class="autor" v-if="livro.autores?.length">
        por {{ livro.autores.map((a) => a.nome).join(", ") }}
      </p>
      <div class="info">
        <div class="publicado">
          <p class="tituloInfo">publicado</p>
          <p class="detalheInfo">{{ livro.publicacao }}</p>
        </div>
        <div class="paginas">
          <p class="tituloInfo">paginas</p>
          <p class="detalheInfo">{{ livro.paginas }}</p>
        </div>
      </div>

      <button>
        <p>marcar como lido</p>
        <Check :size="20" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.card-livro {
  display: flex;
  gap: 30px;
}

.imagem {
  width: 150px;
}

.detalhes {
  margin-top: 15px;
}

h1 {
  color: #2c2c2c;
  font-size: 20px;
  max-width: 200px;
  font-weight: 500;
}

.autor {
  color: #5a4636;
  font-weight: 500;
  margin: 10px 0;
}

.info {
  display: flex;
  gap: 30px;
  margin: 0 0 10px 0;
}

.info .tituloInfo {
  color: #9c8a7a;
  font-weight: 400;
}

.info .detalheInfo {
  color: #5a4636;
  font-weight: 500;
}

.detalhes button {
  display: flex;
  align-items: center;
  background-color: #6b4226;
  color: white;
  gap: 5px;
  border: none;
  border-radius: 50px;
  width: 100%;
  height: 40px;
  justify-content: center;
}

.detalhes button p {
  font-size: 14px;
  font-weight: 500;
}

.secao-sinopse {
  padding: 0;
}

@media (max-width: 650px) {
  .card-livro {
    gap: 16px;
    width: 300px;
    align-items: center;
  }

  .imagem {
    width: 130px;
    height: auto;
    border-radius: 8px;
  }

  .detalhes {
    margin-top: 0;
    flex: 1;
  }

  h1 {
    font-size: 16px;
    max-width: 100%;
    line-height: 1.25;
    margin: 0;
  }

  .autor {
    font-size: 13px;
    margin: 8px 0;
  }

  .info {
    gap: 16px;
    margin-bottom: 10px;
  }

  .tituloInfo,
  .detalheInfo {
    font-size: 12px;
  }

  .detalhes button {
    width: 100%;
    height: 38px;
  }

  .detalhes button p {
    font-size: 13px;
  }
}
</style>
