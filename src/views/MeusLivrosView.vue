<script setup>
import { onMounted, onBeforeUnmount, computed, ref, watch } from "vue";
import { useToast } from "vue-toastification";
import { useReducedMotion } from "@/composables/useReducedMotion";
import { GripVertical } from "lucide-vue-next";
import { useLivrosStore } from "@/stores/livros";
import { LibraryBig, BookOpenCheck, BookOpenText, Bookmark } from "lucide-vue-next";

// Troca do Splide pelo vuedraggable (npm install vuedraggable@4)
import draggable from "vuedraggable";

import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import Voltar from "@/components/common/voltar.vue";
import BookCard from "@/components/books/bookCard.vue";

const livroStore = useLivrosStore();
const toast = useToast();
const reducedMotion = useReducedMotion();
const arrastando = ref(false);
const destino = ref(null);
const livroMovido = ref(null);
let feedbackTimer;
let syncTimer;
function iniciarArraste() { arrastando.value = true; }
function terminarArraste() {
  arrastando.value = false;
  destino.value = null;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(sincronizarListasComStore, 0);
}
function aoMover(event) { destino.value = event.to?.dataset.status || null; }
onBeforeUnmount(() => { clearTimeout(feedbackTimer); clearTimeout(syncTimer); });

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
  if (atualizandoStatus.value || arrastando.value) return;
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
    livroMovido.value = item.id;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { livroMovido.value = null; }, 700);
  } catch {
    toast.error("Não foi possível mover o livro. Ele voltou à lista anterior.");
  } finally {
    atualizandoStatus.value = false;
    sincronizarListasComStore();
  }
}
</script>

<template>
  <Voltar />
  <AppHeader class="header-principal" />

  <div id="meus-livros-page" :class="{ 'arraste-ativo': arrastando }">
    <!-- Cabeçalho Principal -->
    <header class="cabecalho-pagina">
      <div class="cabecalho-conteudo">
        <div class="titulos">
          <h1>Meus Livros</h1>
          <p>Arraste pela capa ou pelo ícone para organizar sua leitura. No celular, toque e segure.</p>
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
      <div v-if="livroStore.loading && !totalLivros" class="sem-livros" role="status">Carregando sua estante...</div>
      <div v-else-if="livroStore.error && !totalLivros" class="sem-livros" role="alert"><p>{{ livroStore.error }}</p><button type="button" class="retry-shelf" @click="livroStore.fetchMeusLivros()">Tentar novamente</button></div>
      <div v-else-if="!totalLivros" class="sem-livros">
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
            :animation="reducedMotion ? 0 : 260"
            easing="cubic-bezier(0.22, 1, 0.36, 1)"
            :force-fallback="true"
            :fallback-on-body="true"
            fallback-class="livro-em-voo"
            chosen-class="livro-selecionado"
            handle=".drag-handle, .imagem"
            filter="button:not(.drag-handle), input, select, textarea"
            :prevent-on-filter="false"
            :delay="180"
            :delay-on-touch-only="true"
            :touch-start-threshold="6"
            :fallback-tolerance="5"
            :disabled="atualizandoStatus"
            :move="aoMover"
            @start="iniciarArraste"
            @end="terminarArraste"
            group="livros"
            item-key="id"
            class="lista-livros"
            ghost-class="fantasma-arraste"
            drag-class="arrastando-item"
            data-status="quero_ler"
            :class="{ 'lista-destino': destino === 'quero_ler' }"
            @change="aoMudarLista($event, 'quero_ler')"
          >
            <template #item="{ element }">
              <div class="item-livro" :class="{ 'livro-recem-movido': livroMovido === element.id }">
                <div class="cartao-arrastavel">
                <button type="button" class="drag-handle" :aria-label="`Arrastar ${getLivroObjeto(element).titulo}`" title="Arraste para outra lista"><GripVertical :size="18" /></button>
                <BookCard :livro="getLivroObjeto(element)" />
                </div>
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
            :animation="reducedMotion ? 0 : 260"
            easing="cubic-bezier(0.22, 1, 0.36, 1)"
            :force-fallback="true"
            :fallback-on-body="true"
            fallback-class="livro-em-voo"
            chosen-class="livro-selecionado"
            handle=".drag-handle, .imagem"
            filter="button:not(.drag-handle), input, select, textarea"
            :prevent-on-filter="false"
            :delay="180"
            :delay-on-touch-only="true"
            :touch-start-threshold="6"
            :fallback-tolerance="5"
            :disabled="atualizandoStatus"
            :move="aoMover"
            @start="iniciarArraste"
            @end="terminarArraste"
            group="livros"
            item-key="id"
            class="lista-livros"
            ghost-class="fantasma-arraste"
            drag-class="arrastando-item"
            data-status="lendo"
            :class="{ 'lista-destino': destino === 'lendo' }"
            @change="aoMudarLista($event, 'lendo')"
          >
            <template #item="{ element }">
              <div class="item-livro" :class="{ 'livro-recem-movido': livroMovido === element.id }">
                <div class="cartao-arrastavel">
                <button type="button" class="drag-handle" :aria-label="`Arrastar ${getLivroObjeto(element).titulo}`" title="Arraste para outra lista"><GripVertical :size="18" /></button>
                <BookCard :livro="getLivroObjeto(element)" />
                </div>
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
            :animation="reducedMotion ? 0 : 260"
            easing="cubic-bezier(0.22, 1, 0.36, 1)"
            :force-fallback="true"
            :fallback-on-body="true"
            fallback-class="livro-em-voo"
            chosen-class="livro-selecionado"
            handle=".drag-handle, .imagem"
            filter="button:not(.drag-handle), input, select, textarea"
            :prevent-on-filter="false"
            :delay="180"
            :delay-on-touch-only="true"
            :touch-start-threshold="6"
            :fallback-tolerance="5"
            :disabled="atualizandoStatus"
            :move="aoMover"
            @start="iniciarArraste"
            @end="terminarArraste"
            group="livros"
            item-key="id"
            class="lista-livros"
            ghost-class="fantasma-arraste"
            drag-class="arrastando-item"
            data-status="lido"
            :class="{ 'lista-destino': destino === 'lido' }"
            @change="aoMudarLista($event, 'lido')"
          >
            <template #item="{ element }">
              <div class="item-livro" :class="{ 'livro-recem-movido': livroMovido === element.id }">
                <div class="cartao-arrastavel">
                <button type="button" class="drag-handle" :aria-label="`Arrastar ${getLivroObjeto(element).titulo}`" title="Arraste para outra lista"><GripVertical :size="18" /></button>
                <BookCard :livro="getLivroObjeto(element)" />
                </div>
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

.retry-shelf { margin-top:16px; padding:10px 18px; border:1px solid #e8d8c3; background:#6b4226; color:white; border-radius:20px; cursor:pointer; }
.lista-livros { border:1px solid transparent; border-radius:16px; transition:background-color .2s,border-color .2s; }
.arraste-ativo .lista-livros { border-color:#dcc5a9; background:#fbf6ef; }
.lista-livros.lista-destino { background:#f3e7d7; border:1px dashed #ad8157; box-shadow:inset 0 0 0 3px #e8d8c34d; }
.cartao-arrastavel { position:relative; padding:16px 12px 12px; border-radius:14px; background:#fffdf9; border:1px solid #e8d8c3; }
.drag-handle { position:absolute; top:7px; right:7px; display:flex; padding:4px; border:0; border-radius:6px; color:#9c8a7a; background:#faf3e0; cursor:grab; touch-action:none; z-index:2; }
.drag-handle:active { cursor:grabbing; }
.item-livro :deep(.imagem) { -webkit-user-drag:none; user-select:none; cursor:grab; }
.cartao-arrastavel { transform-origin:50% 8%; }
.livro-selecionado .cartao-arrastavel { box-shadow:0 10px 30px #6b422620; }
.livro-selecionado .cartao-arrastavel { animation:livro-levantar .18s ease-out both; }
.livro-em-voo .cartao-arrastavel { opacity:.96!important; border-color:#c9a97e; box-shadow:0 18px 38px #6b42262e; }
.livro-em-voo .cartao-arrastavel { animation:livro-balanco .85s ease-in-out infinite alternate; }
.fantasma-arraste { opacity:.25; border:1px dashed #ad8157; background:#e8d8c3; }
.livro-recem-movido { animation:livro-soltar .45s cubic-bezier(.22,1,.36,1); }
@keyframes livro-levantar { from { transform:rotate(0deg) scale(1); } to { transform:rotate(-2deg) scale(1.025); } }
@keyframes livro-balanco { from { transform:rotate(-2.5deg) scale(1.025); } to { transform:rotate(2.5deg) scale(1.025); } }
@keyframes livro-soltar { 0% { transform:translateY(-8px) rotate(-1deg); box-shadow:0 10px 25px #6b422626; } 65% { transform:translateY(2px) rotate(.3deg); } 100% { transform:translateY(0) rotate(0); box-shadow:none; } }
@media(prefers-reduced-motion:reduce) { .livro-selecionado .cartao-arrastavel,.livro-em-voo .cartao-arrastavel,.livro-recem-movido { animation:none; transform:none; } }
</style>