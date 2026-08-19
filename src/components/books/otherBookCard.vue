<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Plus, Star, Check } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useLivrosStore } from "@/stores/livros";

const props = defineProps({
  livro: {
    type: Object,
    required: true,
  },
});

onMounted(async () => {
  document.addEventListener("click", aoClicarFora);

  // Sempre busca a lista atualizada do backend ao carregar o componente
  try {
    if (livroStore.fetchMeusLivros) {
      await livroStore.fetchMeusLivros();
    } else if (livroStore.buscarMeusLivros) {
      await livroStore.buscarMeusLivros();
    }
  } catch (err) {
    console.error("Erro ao sincronizar estante:", err);
  }
  console.log("Livro recebido via props:", props.livro);
  console.log("Lista na Store (meusLivros):", livroStore.meusLivros);
});

const router = useRouter();
const livroStore = useLivrosStore();

function abrirLivro() {
  if (props.livro?.id) {
    router.push(`/livro/google/${props.livro.id}`);
  }
}

const popoverAberto = ref(false);
const adicionando = ref(false);
const statusAdicionadoLocal = ref(false);
const erro = ref(null);
const raizPopover = ref(null);

const statusOpcoes = [
  { value: "quero_ler", label: "Quero ler" },
  { value: "lendo", label: "Lendo" },
  { value: "lido", label: "Lido" },
];

/* Localiza o item correspondente em meusLivros */
/* Localiza o item correspondente em meusLivros */
const itemNaEstante = computed(() => {
  if (!props.livro || !livroStore.meusLivros?.length) return null;

  // Extrai identificadores do livro recebido via Props (API Google)
  const propIdGoogle = String(props.livro.google_book_id || props.livro.id || "").trim();
  const propIsbn = String(props.livro.isbn || "").replace(/\D/g, ""); // Apenas números
  const propTitulo = props.livro.titulo?.toLowerCase().trim();

  return livroStore.meusLivros.find((item) => {
    const itemLivro = typeof item.livro === "object" ? item.livro : item;

    // 1. Tenta comparar por ID do Google (caso exista salvo no banco)
    const bancoGoogleId = String(
      item.google_book_id || itemLivro?.google_book_id || itemLivro?.id || ""
    ).trim();

    if (propIdGoogle && bancoGoogleId && propIdGoogle === bancoGoogleId) {
      return true;
    }

    // 2. Tenta comparar por ISBN (O mais confiável para livros salvos do Google)
    const bancoIsbn = String(
      item.isbn || itemLivro?.isbn || ""
    ).replace(/\D/g, "");

    if (propIsbn && bancoIsbn && propIsbn === bancoIsbn) {
      return true;
    }

    // 3. Fallback: Compara pelo Título exato
    const bancoTitulo = (item.titulo || itemLivro?.titulo || "").toLowerCase().trim();
    if (propTitulo && bancoTitulo && propTitulo === bancoTitulo) {
      return true;
    }

    return false;
  });
});

/* Indica se o livro já pertence à estante */
const jaEstaNaEstante = computed(() => !!itemNaEstante.value);

/* Status salvo para destacar na opção do popover */
const statusSalvo = computed(() => {
  return itemNaEstante.value?.status
    ? String(itemNaEstante.value.status).toLowerCase()
    : null;
});

/* Estado visual do botão */
const adicionado = computed(() => statusAdicionadoLocal.value || jaEstaNaEstante.value);

const getBookCover = (livro) => {
  if (!livro) return "/imgs/livro_sem_capa.png";

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

const getAutores = (livro) => {
  if (!livro?.autores || !livro.autores.length) return "";
  return livro.autores.map((a) => (typeof a === "string" ? a : a.nome)).join(", ");
};

function abrirPopover() {
  if (adicionando.value || adicionado.value) return;
  popoverAberto.value = !popoverAberto.value;
}

async function escolherStatus(status) {
  // Trava a execução se já estiver na estante
  if (jaEstaNaEstante.value) return;

  adicionando.value = true;
  popoverAberto.value = false;
  erro.value = null;

  try {
    await livroStore.importarLivroDoGoogle(props.livro, status);

    if (livroStore.fetchMeusLivros) {
      await livroStore.fetchMeusLivros();
    } else if (livroStore.buscarMeusLivros) {
      await livroStore.buscarMeusLivros();
    }

    statusAdicionadoLocal.value = true;
  } catch (err) {
    console.error("Erro ao importar livro:", err);
    erro.value = "Erro ao adicionar";
  } finally {
    adicionando.value = false;
  }
}

function aoClicarFora(e) {
  if (raizPopover.value && !raizPopover.value.contains(e.target)) {
    popoverAberto.value = false;
  }
}

onMounted(async () => {
  document.addEventListener("click", aoClicarFora);

  if (!livroStore.meusLivros || livroStore.meusLivros.length === 0) {
    if (livroStore.fetchMeusLivros) {
      await livroStore.fetchMeusLivros();
    } else if (livroStore.buscarMeusLivros) {
      await livroStore.buscarMeusLivros();
    }
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", aoClicarFora);
});
</script>

<template>
  <div class="card-livro-grid">
    <div class="capa-wrapper" @click="abrirLivro">
      <img
        class="capa"
        :src="getBookCover(livro)"
        :alt="livro?.titulo || 'Capa do livro'"
      />

      <div class="popover-wrapper" ref="raizPopover" @click.stop>
        <button
          type="button"
          class="btn-adicionar"
          :class="{ adicionado }"
          @click.stop="abrirPopover"
          :disabled="adicionando || adicionado"
        >
          <Check v-if="adicionado" :size="14" />
          <Plus v-else-if="!adicionando" :size="14" />

          <span>
            {{ adicionado ? "Adicionado" : adicionando ? "..." : "Adicionar" }}
          </span>
        </button>

        <div v-if="popoverAberto" class="popover-status">
          <button
            v-for="opcao in statusOpcoes"
            :key="opcao.value"
            type="button"
            class="popover-item"
            :class="{ ativo: statusSalvo === opcao.value }"
            @click.stop="escolherStatus(opcao.value)"
          >
            {{ opcao.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="detalhes" @click="abrirLivro">
      <h2 class="titulo">{{ livro?.titulo }}</h2>

      <p class="autor" v-if="getAutores(livro)">
        {{ getAutores(livro) }}
      </p>

      <div class="avaliacao" v-if="livro?.nota">
        <Star :size="12" class="estrela-icone" fill="currentColor" stroke="none" />
        <span>{{ Number(livro.nota).toFixed(1) }}</span>
      </div>

      <p v-if="erro" class="erro-msg">{{ erro }}</p>
    </div>
  </div>
</template>

<style scoped>
.card-livro-grid {
  width: 180px;
  display: flex;
  flex-direction: column;
}

.capa-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.capa-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.capa {
  width: 180px;
  height: 260px;
  object-fit: cover;
  display: block;
}

.popover-wrapper {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
}

.btn-adicionar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #6b4226;
  color: #ffffff;
  border: none;
  border-radius: 50px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.btn-adicionar:hover:not(:disabled) {
  background-color: #53331d;
  transform: scale(1.02);
}

.btn-adicionar.adicionado {
  background: #3a7d44;
}

.btn-adicionar:disabled {
  opacity: 0.9;
}

.btn-adicionar.adicionado {
  background: #3a7d44;
  cursor: default; /* Remove o ponteiro de clique */
}

.btn-adicionar.adicionado:hover {
  transform: none; /* Desativa a animação de hover */
  background-color: #3a7d44;
}

.popover-status {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #ffffff;
  border: 1px solid #e8d8c3;
  border-radius: 10px;
  z-index: 10;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-width: 110px;
}

.popover-item {
  width: 100%;
  background: none;
  border: none;
  padding: 10px 14px;
  text-align: left;
  font-size: 13px;
  color: #4b3626;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.popover-item:hover {
  background-color: #faf3e0;
  color: #6b4226;
}

.popover-item.ativo {
  font-weight: bold;
  background-color: #f3e7d7;
  color: #6b4226;
}

.detalhes {
  margin-top: 10px;
  cursor: pointer;
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

.avaliacao {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #c9a227;
  margin-top: 2px;
}

.estrela-icone {
  color: #c9a227;
}

.erro-msg {
  color: #a4161a;
  font-size: 11px;
  margin: 4px 0 0;
  font-weight: 500;
}
</style>
