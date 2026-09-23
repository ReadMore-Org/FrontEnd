<script setup>
import { onMounted, computed, ref, watch } from "vue";
import { useLivrosStore } from "@/stores/livros";
import { LibraryBig, BookOpenCheck, BookOpenText, Bookmark } from "lucide-vue-next";

// Troca do Splide pelo vuedraggable (npm install vuedraggable@4)
import draggable from "vuedraggable";

import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import Voltar from "@/components/common/voltar.vue";
import BookCard from "@/components/books/bookCard.vue";

const livroStore = useLivrosStore();

const getLivroObjeto = (item) => {
  if (!item) return {};
  if (typeof item.livro === "object" && item.livro !== null) {
    return item.livro;
  }
  return item;
};

const totalLivros = computed(() => livroStore.totalMeusLivros);
const totalLidos = computed(() => livroStore.totalLidos);
const totalLendo = computed(() => livroStore.totalLendo);
const totalQueroLer = computed(() => livroStore.totalQueroLer);

// Três listas LOCAIS e independentes.
// É nelas (e não direto na store) que o vuedraggable mexe quando você arrasta.
const listaQueroLer = ref([]);
const listaLendo = ref([]);
const listaLidos = ref([]);

// Enquanto uma atualização de status está em andamento, não deixamos a
// sincronização automática (abaixo) "brigar" com o que já foi arrastado na tela.
const atualizandoStatus = ref(false);

function sincronizarListasComStore() {
  if (atualizandoStatus.value) return;
  listaQueroLer.value = livroStore.meusLivros.filter((i) => i.status === "quero_ler");
  listaLendo.value = livroStore.meusLivros.filter((i) => i.status === "lendo");
  listaLidos.value = livroStore.meusLivros.filter((i) => i.status === "lido");
}

onMounted(async () => {
  await livroStore.fetchMeusLivros();
  sincronizarListasComStore();
});

// Se a store mudar por qualquer outro motivo (outra tela, refresh, etc.),
// as três listas se atualizam sozinhas.
watch(() => livroStore.meusLivros, sincronizarListasComStore, { deep: true });

// Chamado pelo vuedraggable toda vez que uma lista ganha ou perde um item.
// Só nos importa o evento "added": significa que o livro entrou nessa lista
// (seja vindo de outra, seja um reordenamento dentro da mesma).
async function aoMudarLista(evento, novoStatus) {
  if (!evento.added) return;

  const item = evento.added.element;
  atualizandoStatus.value = true;

  try {
    // Essa função já existe no seu store e atualiza local + backend.
    await livroStore.atualizarStatusMeuLivro(item, novoStatus);
  } finally {
    atualizandoStatus.value = false;
  }
}
</script>

<template>
  <Voltar />
  <AppHeader class="header-principal" />

  <div id="meus-livros-page">
    <!-- Cabeçalho Principal -->
    <header class="cabecalho-pagina">
      <div class="cabecalho-conteudo">
        <div class="titulos">
          <h1>Meus Livros</h1>
          <p>Arraste os livros entre as listas para mudar o status de leitura</p>
        </div>

        <!-- Painel de Estatísticas -->
        <div class="stats-container">
          <div class="stat-card">
            <div class="icon-wrapper">
              <LibraryBig :size="24" />
            </div>
            <div class="stat-info">
              <span class="stat-numero">{{ totalLivros }}</span>
              <span class="stat-rotulo">Total na Estante</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon-wrapper">
              <BookOpenText :size="24" />
            </div>
            <div class="stat-info">
              <span class="stat-numero">{{ totalLendo }}</span>
              <span class="stat-rotulo">Lendo</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon-wrapper">
              <Bookmark :size="24" />
            </div>
            <div class="stat-info">
              <span class="stat-numero">{{ totalQueroLer }}</span>
              <span class="stat-rotulo">Quero Ler</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="icon-wrapper">
              <BookOpenCheck :size="24" />
            </div>
            <div class="stat-info">
              <span class="stat-numero">{{ totalLidos }}</span>
              <span class="stat-rotulo">Lidos</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Conteúdo Principal -->
    <main id="livros-container">
      <div v-if="!totalLivros" class="sem-livros">
        <LibraryBig :size="48" class="icone-vazio" />
        <p class="titulo-vazio">Sua estante está vazia</p>
        <p class="subtitulo-vazio">
          Adicione seus primeiros livros para acompanhar seu progresso de leitura.
        </p>
      </div>

      <template v-else>
        <!-- Seção: Quero Ler -->
        <section class="secao-livros">
          <div class="cabecalho-secao">
            <h2 class="titulo-secao">Quero Ler</h2>
            <span class="contador-badge">{{ listaQueroLer.length }}</span>
          </div>

          <draggable
            v-model="listaQueroLer"
            :animation="200"
            group="livros"
            item-key="id"
            class="lista-livros"
            ghost-class="fantasma-arraste"
            drag-class="arrastando-item"
            @change="aoMudarLista($event, 'quero_ler')"
          >
            <template #item="{ element }">
              <div class="item-livro">
                <BookCard :livro="getLivroObjeto(element)" />
              </div>
            </template>

            <template #footer>
              <p v-if="!listaQueroLer.length" class="lista-vazia">
                Arraste um livro para cá
              </p>
            </template>
          </draggable>
        </section>

        <!-- Seção: Lendo atualmente -->
        <section class="secao-livros">
          <div class="cabecalho-secao">
            <h2 class="titulo-secao">Lendo Atualmente</h2>
            <span class="contador-badge">{{ listaLendo.length }}</span>
          </div>

          <draggable
            v-model="listaLendo"
            :animation="200"
            group="livros"
            item-key="id"
            class="lista-livros"
            ghost-class="fantasma-arraste"
            drag-class="arrastando-item"
            @change="aoMudarLista($event, 'lendo')"
          >
            <template #item="{ element }">
              <div class="item-livro">
                <BookCard :livro="getLivroObjeto(element)" />
              </div>
            </template>

            <template #footer>
              <p v-if="!listaLendo.length" class="lista-vazia">
                Arraste um livro para cá
              </p>
            </template>
          </draggable>
        </section>

        <!-- Seção: Lidos -->
        <section class="secao-livros">
          <div class="cabecalho-secao">
            <h2 class="titulo-secao">Lidos</h2>
            <span class="contador-badge">{{ listaLidos.length }}</span>
          </div>

          <draggable
            v-model="listaLidos"
            :animation="200"
            group="livros"
            item-key="id"
            class="lista-livros"
            ghost-class="fantasma-arraste"
            drag-class="arrastando-item"
            @change="aoMudarLista($event, 'lido')"
          >
            <template #item="{ element }">
              <div class="item-livro">
                <BookCard :livro="getLivroObjeto(element)" />
              </div>
            </template>

            <template #footer>
              <p v-if="!listaLidos.length" class="lista-vazia">
                Arraste um livro para cá
              </p>
            </template>
          </draggable>
        </section>
      </template>
    </main>
  </div>

  <AppFooter />
</template>

<style scoped>
#meus-livros-page {
  min-height: 80vh;
  background-color: #faf7f2;
}

/* Header & Banner */
.cabecalho-pagina {
  background: linear-gradient(135deg, #f3e7d7 0%, #e8d7c3 100%);
  padding: 40px 60px;
  border-bottom: 1px solid #e2d2bd;
}

.cabecalho-conteudo {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.titulos h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2d2d2d;
  margin: 0;
  letter-spacing: -0.5px;
}

.titulos p {
  color: #6d6d6d;
  font-size: 1.05rem;
  margin-top: 6px;
  margin-bottom: 0;
}

/* Grid de Cards Estatísticos */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 12px rgba(107, 66, 38, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(107, 66, 38, 0.08);
}

.icon-wrapper {
  background: #6b4226;
  color: #ffffff;
  padding: 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-numero {
  font-size: 1.6rem;
  font-weight: 700;
  color: #2d2d2d;
  line-height: 1.2;
}

.stat-rotulo {
  font-size: 0.85rem;
  color: #6d6d6d;
  font-weight: 500;
}

/* Container de Livros */
#livros-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 60px 80px 60px;
}

.secao-livros {
  margin-bottom: 48px;
}

.cabecalho-secao {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.titulo-secao {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d2d2d;
  margin: 0;
}

.contador-badge {
  background-color: #e8d7c3;
  color: #6b4226;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
}

/* Lista horizontal (linha única, com rolagem lateral) que serve de área de soltura */
.lista-livros {
  display: flex;
  flex-direction: row;
  gap: 24px;
  overflow-x: auto;
  padding: 8px 4px 16px 4px;
  min-height: 140px;
}

.item-livro {
  flex: 0 0 auto;
  cursor: grab;
}

.item-livro:active {
  cursor: grabbing;
}

/* Enquanto o card está sendo arrastado */
.arrastando-item {
  opacity: 0.9;
}

/* "Fantasma" que mostra onde o card vai cair */
.fantasma-arraste {
  opacity: 0.4;
  background: #f3e7d7;
  border: 2px dashed #c9a97e;
  border-radius: 10px;
}

.lista-vazia {
  color: #9c8a7a;
  font-size: 0.9rem;
  padding: 20px;
  border: 1px dashed #e8d7c3;
  border-radius: 10px;
  margin: 0;
  white-space: nowrap;
}

/* Estado Vazio (sem livro nenhum na estante) */
.sem-livros {
  text-align: center;
  padding: 80px 20px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px dashed #e8d7c3;
  margin-top: 20px;
}

.icone-vazio {
  color: #8a6a52;
  margin-bottom: 16px;
  opacity: 0.7;
}

.titulo-vazio {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d2d2d;
  margin: 0 0 8px 0;
}

.subtitulo-vazio {
  color: #6d6d6d;
  font-size: 0.95rem;
  margin: 0;
}

/* Responsividade */
@media (max-width: 768px) {
  .header-principal {
    display: content !important;
  }

  .cabecalho-pagina {
    padding: 24px 20px;
  }

  .titulos h1 {
    font-size: 1.6rem;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 12px 14px;
    gap: 10px;
  }

  .stat-numero {
    font-size: 1.3rem;
  }

  #livros-container {
    padding: 24px 20px 60px 20px;
  }

  .titulo-secao {
    font-size: 1.3rem;
  }
}
</style>