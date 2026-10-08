<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { Search, X } from "lucide-vue-next";

import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import GradeBook from "@/components/books/GradeBook.vue";
import OtherBookCard from "@/components/books/otherBookCard.vue";
import AnuncioCard from "@/components/marketplace/AnuncioCard.vue";
import CarrosselAnuncios from "@/components/marketplace/CarrosselAnuncios.vue";

import { useMarketplaceStore } from "@/stores/marketplace";
import { useAuthStore } from "@/stores/auth";
import { getAutoresTexto, normalizar } from "@/utils/marketplaceHelpers";

const router = useRouter();
const store = useMarketplaceStore();
const authStore = useAuthStore();

// =========================================================
// ESTADO DOS FILTROS
// =========================================================
const termo = ref("");
const tipoAtivo = ref("todos");
const categoriaAtiva = ref("todas");

const tipos = [
  { value: "todos", label: "Todos" },
  { value: "troca", label: "Troca" },
  { value: "emprestimo", label: "Empréstimo" },
];

const buscaAtiva = computed(() => termo.value.trim().length >= 2);
const filtrosAtivos = computed(
  () => tipoAtivo.value !== "todos" || categoriaAtiva.value !== "todas",
);

// Sem busca e sem filtro => carrosséis. Com busca ou filtro => grade de resultados.
const modoCarrosseis = computed(() => !buscaAtiva.value && !filtrosAtivos.value);

// =========================================================
// DADOS
// =========================================================
const anunciosFiltrados = computed(() => {
  const consulta = normalizar(termo.value.trim());

  return store.anuncios.filter((anuncio) => {
    if (tipoAtivo.value !== "todos" && anuncio.tipo !== tipoAtivo.value) {
      return false;
    }

    if (
      categoriaAtiva.value !== "todas" &&
      !anuncio.livro?.categoria?.some((c) => c.id === categoriaAtiva.value)
    ) {
      return false;
    }

    if (buscaAtiva.value) {
      const titulo = normalizar(anuncio.livro?.titulo);
      const autores = normalizar(getAutoresTexto(anuncio.livro));
      if (!titulo.includes(consulta) && !autores.includes(consulta)) {
        return false;
      }
    }

    return true;
  });
});

// Um carrossel por categoria (as 6 mais cheias)
const carrosseisCategorias = computed(() =>
  store.categorias.slice(0, 6).map((categoria) => ({
    ...categoria,
    anuncios: store.anunciosDaCategoria(categoria.id),
  })),
);

const marketplaceVazio = computed(
  () => !store.loading && !store.error && store.anuncios.length === 0,
);

// =========================================================
// BUSCA (também procura no Google Books, com debounce)
// =========================================================
let timerBusca = null;

watch(termo, (valor) => {
  clearTimeout(timerBusca);

  if (valor.trim().length < 2) {
    store.limparBuscaGoogle();
    return;
  }

  timerBusca = setTimeout(() => store.buscarGoogle(valor), 400);
});

function limparBusca() {
  termo.value = "";
}

function limparFiltros() {
  tipoAtivo.value = "todos";
  categoriaAtiva.value = "todas";
}

// =========================================================
// CICLO DE VIDA
// =========================================================
onMounted(() => {
  // O marketplace mostra dados de outros usuários (inclusive email no detalhe)
  if (!authStore.isAuthenticated) {
    router.push("/entrar");
    return;
  }

  store.fetchAnuncios(true);
});

onBeforeUnmount(() => {
  clearTimeout(timerBusca);
  store.limparBuscaGoogle();
});

// =========================================================
// ARRASTAR OS CHIPS DE CATEGORIA COM O MOUSE (desktop)
// =========================================================
const categoriaScroll = ref(null);
let arrastando = false;
let posInicialX = 0;
let scrollInicial = 0;

function iniciarArrasto(evento) {
  arrastando = true;
  posInicialX = evento.pageX - categoriaScroll.value.offsetLeft;
  scrollInicial = categoriaScroll.value.scrollLeft;
  categoriaScroll.value.classList.add("arrastando");
}

function pararArrasto() {
  arrastando = false;
  categoriaScroll.value?.classList.remove("arrastando");
}

function moverArrasto(evento) {
  if (!arrastando) return;
  evento.preventDefault();
  const posAtualX = evento.pageX - categoriaScroll.value.offsetLeft;
  categoriaScroll.value.scrollLeft = scrollInicial - (posAtualX - posInicialX);
}
</script>

<template>
  <AppHeader />

  <section class="marketplace">
    <h1 class="titulo-pagina">Trocas e empréstimos</h1>

    <!-- BUSCA -->
    <div class="busca-container">
      <Search :size="18" class="icone-busca" />
      <input
        v-model="termo"
        type="search"
        class="input-busca"
        placeholder="Busque por título ou autor"
        aria-label="Buscar livros no marketplace"
      />
      <button
        v-if="termo"
        type="button"
        class="btn-limpar-busca"
        aria-label="Limpar busca"
        @click="limparBusca"
      >
        <X :size="16" />
      </button>
    </div>

    <!-- FILTRO: TIPO -->
    <div class="filtro-bloco">
      <span class="filtro-label">Tipo</span>
      <div class="filtro-opcoes">
        <button
          v-for="tipo in tipos"
          :key="tipo.value"
          type="button"
          class="chip"
          :class="{ 'chip-ativo': tipoAtivo === tipo.value }"
          @click="tipoAtivo = tipo.value"
        >
          {{ tipo.label }}
        </button>
      </div>
    </div>

    <!-- FILTRO: CATEGORIA -->
    <div v-if="store.categorias.length" class="filtro-bloco">
      <span class="filtro-label">Categoria</span>
      <div
        ref="categoriaScroll"
        class="filtro-opcoes filtro-opcoes-scroll"
        @mousedown="iniciarArrasto"
        @mouseleave="pararArrasto"
        @mouseup="pararArrasto"
        @mousemove="moverArrasto"
      >
        <button
          type="button"
          class="chip"
          :class="{ 'chip-ativo': categoriaAtiva === 'todas' }"
          @click="categoriaAtiva = 'todas'"
        >
          Todas
        </button>
        <button
          v-for="categoria in store.categorias"
          :key="categoria.id"
          type="button"
          class="chip"
          :class="{ 'chip-ativo': categoriaAtiva === categoria.id }"
          @click="categoriaAtiva = categoria.id"
        >
          {{ categoria.descricao }}
        </button>
      </div>
    </div>

    <!-- ESTADOS GERAIS -->
    <div v-if="store.loading && !store.anuncios.length" class="estado">
      <div class="spinner-small"></div>
      <p>Carregando o marketplace...</p>
    </div>

    <div v-else-if="store.error" class="estado estado-erro">
      <p>{{ store.error }}</p>
      <button type="button" class="btn-primario" @click="store.fetchAnuncios(true)">
        Tentar novamente
      </button>
    </div>

    <div v-else-if="marketplaceVazio && !buscaAtiva" class="estado">
      <p class="estado-titulo">Ainda não há livros no marketplace</p>
      <p>
        Abra um livro da sua estante marcado como "Lendo" ou "Lido" e envie
        para troca ou empréstimo.
      </p>
      <RouterLink to="/meus-livros" class="btn-primario">Ir para Meus Livros</RouterLink>
    </div>

    <!-- MODO CARROSSÉIS (sem busca e sem filtro) -->
    <template v-else-if="modoCarrosseis">
      <CarrosselAnuncios titulo="Adicionados recentemente" :anuncios="store.recentes" />
      <CarrosselAnuncios titulo="Para troca" :anuncios="store.paraTroca" />
      <CarrosselAnuncios titulo="Para empréstimo" :anuncios="store.paraEmprestimo" />
      <CarrosselAnuncios
        v-for="categoria in carrosseisCategorias"
        :key="categoria.id"
        :titulo="categoria.descricao"
        :anuncios="categoria.anuncios"
      />
    </template>

    <!-- MODO RESULTADOS (busca e/ou filtro) -->
    <template v-else>
      <div class="barra-resultados">
        <p class="contagem">
          <strong>{{ anunciosFiltrados.length }}</strong>
          {{ anunciosFiltrados.length === 1 ? "livro encontrado" : "livros encontrados" }}
        </p>

        <button
          v-if="filtrosAtivos"
          type="button"
          class="btn-link"
          @click="limparFiltros"
        >
          Limpar filtros
        </button>
      </div>

      <GradeBook v-if="anunciosFiltrados.length" :livros="anunciosFiltrados">
        <template #default="{ livro: anuncio }">
          <AnuncioCard :anuncio="anuncio" />
        </template>
      </GradeBook>

      <p v-else class="sem-resultados">
        Nenhum livro do marketplace corresponde a essa busca.
      </p>
    </template>

    <!-- LIVROS DO GOOGLE BOOKS QUE NINGUÉM ANUNCIOU AINDA -->
    <section
      v-if="buscaAtiva && (store.buscandoGoogle || store.resultadosGoogle.length)"
      class="secao-google"
    >
      <h2 class="titulo-secao">Ninguém anunciou ainda</h2>
      <p class="subtitulo-secao">
        Esses livros existem no Google Books, mas ainda não estão no marketplace.
        Adicione à sua estante e, se tiver o exemplar, envie para troca ou
        empréstimo.
      </p>

      <div v-if="store.buscandoGoogle" class="estado">
        <div class="spinner-small"></div>
        <p>Buscando no Google Books...</p>
      </div>

      <GradeBook v-else :livros="store.resultadosGoogle">
        <template #default="{ livro }">
          <OtherBookCard :livro="livro" />
        </template>
      </GradeBook>
    </section>
  </section>

  <AppFooter />
</template>

<style scoped>
.marketplace {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px 80px;
}

.titulo-pagina {
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
  color: #2c2c2c;
  font-weight: 500;
  margin: 60px 0 40px 0;
  font-size: 32px;
}

.titulo-pagina::after,
.titulo-secao::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50%;
  height: 4px;
  border-radius: 50px;
  background: #6b4226;
}

/* Busca */
.busca-container {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #e5ded2;
  border-radius: 12px;
  padding: 14px 20px;
  margin-bottom: 30px;
  max-width: 480px;
  transition: border-color 0.2s;
}

.busca-container:focus-within {
  border-color: #6b4226;
}

.icone-busca {
  color: #b0a89a;
  flex-shrink: 0;
}

.input-busca {
  border: none;
  outline: none;
  width: 100%;
  font-size: 15px;
  background: transparent;
  color: #2c2c2c;
}

.input-busca::placeholder {
  color: #b0a89a;
}

.input-busca::-webkit-search-cancel-button {
  display: none;
}

.btn-limpar-busca {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: #f3eee9;
  color: #5a4636;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-limpar-busca:hover {
  background: #e8d8c3;
}

/* Filtros */
.filtro-bloco {
  margin-bottom: 24px;
}

.filtro-label {
  display: block;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 12px;
  font-size: 15px;
}

.filtro-opcoes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filtro-opcoes-scroll {
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
  cursor: grab;
  user-select: none;
}

.filtro-opcoes-scroll.arrastando {
  cursor: grabbing;
}

.filtro-opcoes-scroll::-webkit-scrollbar {
  display: none;
}

.chip {
  border: 1px solid #e5ded2;
  background: #ffffff;
  color: #2c2c2c;
  padding: 9px 22px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.chip:hover {
  border-color: #6b4226;
}

.chip-ativo {
  background: #6b4226;
  border-color: #6b4226;
  color: #ffffff;
}

/* Seções */
.titulo-secao {
  position: relative;
  display: inline-block;
  padding-bottom: 5px;
  color: #2c2c2c;
  font-weight: 500;
  margin: 0 0 12px 0;
  font-size: 25px;
}

.subtitulo-secao {
  max-width: 640px;
  margin: 0 0 24px;
  color: #5a4636;
  font-size: 14px;
  line-height: 1.6;
}

.secao-google {
  margin-top: 56px;
}

.barra-resultados {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 28px 0 18px;
}

.contagem {
  font-size: 14px;
  color: #9c8a7a;
  margin: 0;
}

.contagem strong {
  color: #2c2c2c;
}

.btn-link {
  border: none;
  background: none;
  color: #6b4226;
  font-size: 13px;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
}

.btn-link:hover {
  color: #52321c;
}

/* Estados */
.estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 20px;
  text-align: center;
  color: #5a4636;
  font-size: 14px;
  line-height: 1.6;
}

.estado-titulo {
  color: #2c2c2c;
  font-size: 18px;
  font-weight: 600;
}

.estado-erro p {
  color: #a4161a;
}

.sem-resultados {
  text-align: center;
  color: #9c8a7a;
  padding: 48px 0;
  font-size: 16px;
}

.btn-primario {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 12px;
  height: 40px;
  padding: 0 24px;
  border: none;
  border-radius: 50px;
  background: #6b4226;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primario:hover {
  background: #52321c;
}

.spinner-small {
  width: 28px;
  height: 28px;
  border: 3px solid #e0d7d0;
  border-top: 3px solid #6b4226;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Mobile */
@media (max-width: 650px) {
  .marketplace {
    padding: 0 20px 100px;
  }

  .titulo-pagina {
    font-size: 25px;
    margin: 20px 0 28px 0;
  }

  .busca-container {
    max-width: 100%;
    padding: 12px 16px;
    margin-bottom: 24px;
  }

  .filtro-bloco {
    margin-bottom: 20px;
  }

  .chip {
    padding: 8px 18px;
  }

  .titulo-secao {
    font-size: 20px;
  }
}
</style>