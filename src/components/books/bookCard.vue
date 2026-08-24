<script setup>
import { ref, computed } from "vue";
import { Check } from "lucide-vue-next";
import { useLivrosStore } from "@/stores/livros";

const props = defineProps({
  livro: Object,
});

const livroStore = useLivrosStore();
const isUpdating = ref(false);

// 1. Busca o item correspondente dentro de "meusLivros" na Store
const meuLivroItem = computed(() => {
  if (!livroStore.meusLivros?.length || !props.livro) return null;

  const targetId = props.livro.id || props.livro.livro_id;
  const targetGoogleId = props.livro.google_book_id || props.livro.googleBookId;
  const targetIsbn = String(props.livro.isbn || "").replace(/\D/g, "");

  return livroStore.meusLivros.find((item) => {
    const itemLivro = typeof item.livro === "object" ? item.livro : item;
    const itemLivroId = itemLivro?.id || item.livro;

    // Comparação por ID do Banco
    if (targetId && itemLivroId && String(targetId) === String(itemLivroId)) {
      return true;
    }

    // Comparação por ID do Google Books
    const itemGoogleId = item.google_book_id || itemLivro?.google_book_id;
    if (targetGoogleId && itemGoogleId && targetGoogleId === itemGoogleId) {
      return true;
    }

    // Comparação por ISBN
    const itemIsbn = String(item.isbn || itemLivro?.isbn || "").replace(/\D/g, "");
    if (targetIsbn && itemIsbn && targetIsbn === itemIsbn) {
      return true;
    }

    return false;
  });
});

// 2. Retorna o status atual detectado na estante do usuário
const currentStatus = computed(() => {
  // Tenta pelo objeto vinculado à estante, depois direto na prop
  const statusRaw =
    meuLivroItem.value?.status || props.livro?.status || props.livro?.pivot?.status;

  return statusRaw ? String(statusRaw).toLowerCase().trim() : "";
});

// 3. Atualiza o status de "lendo" para "lido"
const marcarComoLido = async () => {
  if (isUpdating.value) return;

  isUpdating.value = true;
  try {
    // Passa o objeto completo para a store resolver os IDs corretamente
    const payload = meuLivroItem.value || props.livro;
    await livroStore.atualizarStatusMeuLivro(payload, "lido");

    if (livroStore.fetchMeusLivros) {
      await livroStore.fetchMeusLivros();
    }
  } catch (error) {
    console.error("Erro ao marcar livro como lido:", error);
  } finally {
    isUpdating.value = false;
  }
};

const getBookCover = (livro) => {
  const capa = livro?.capa || livro?.livro?.capa;
  const url = typeof capa === "string" ? capa : capa?.url;

  if (url) {
    return url.startsWith("http") ? url : `${import.meta.env.VITE_API_BASE_URL}${url}`;
  }

  return "/imgs/livro_sem_capa.png";
};
</script>

<template>
  <div class="card-livro">
    <!-- Link clicável apenas na Capa -->
    <RouterLink :to="`/livro/${livro.id || livro.livro_id}`" class="link-detalhes">
      <img class="imagem" :src="getBookCover(livro)" alt="Capa do livro" />
    </RouterLink>

    <div class="detalhes">
      <!-- Link clicável apenas no Título -->
      <RouterLink :to="`/livro/${livro.id || livro.livro_id}`" class="link-detalhes">
        <h1>{{ livro?.titulo || livro?.livro?.titulo }}</h1>
      </RouterLink>

      <p class="autor" v-if="(livro?.autores || livro?.livro?.autores)?.length">
        por
        {{
          (livro?.autores || livro?.livro?.autores)
            .map((a) => (typeof a === "string" ? a : a.nome))
            .join(", ")
        }}
      </p>
      
      <div class="info">
        <div class="publicado">
          <p class="tituloInfo">publicado</p>
          <p class="detalheInfo">{{ livro?.publicacao || livro?.livro?.publicacao }}</p>
        </div>
        <div class="paginas">
          <p class="tituloInfo">paginas</p>
          <p class="detalheInfo">{{ livro?.paginas || livro?.livro?.paginas }}</p>
        </div>
      </div>

      <!-- Botão isolado sem nenhuma tag <a> por fora -->
      <button 
        v-if="currentStatus === 'lendo'" 
        @click.stop.prevent="marcarComoLido" 
        :disabled="isUpdating"
        class="btn-marcar-lido"
      >
        <p>{{ isUpdating ? 'Atualizando...' : 'marcar como lido' }}</p>
        <Check v-if="!isUpdating" :size="20" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.link-detalhes {
  text-decoration: none;
  color: inherit;
  display: inline-block;
}

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
  font-size: 13px;
  margin: 8px 0;
  width: 130px;
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
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.detalhes button:hover {
  background-color: #52321c;
}

.detalhes button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.detalhes button p {
  font-size: 14px;
  font-weight: 500;
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
