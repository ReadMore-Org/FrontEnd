<script setup>
import { ref, computed } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';

const busca = ref('');
const tipoAtivo = ref('Troca');
const categoriaAtiva = ref('Terror');

const tipos = ['Todos', 'Troca', 'Empréstimo'];
const categorias = ['Todos', 'Drama', 'Terror', 'Ficção', 'Romance', 'Suspense'];

const livros = ref([
  { id: 1, titulo: 'Gravity Falls: Journal 3', dono: 'João', tipo: 'Troca', favorito: false, capa: null },
  { id: 2, titulo: 'Gravity Falls: Journal 3', dono: 'João', tipo: 'Empréstimo', favorito: false, capa: null },
  { id: 3, titulo: 'O Diário Perdido', dono: 'Maria', tipo: 'Troca', favorito: true, capa: null },
  { id: 4, titulo: 'O Diário Perdido', dono: 'Maria', tipo: 'Empréstimo', favorito: false, capa: null },
]);

const livrosFiltrados = computed(() => {
  return livros.value.filter((livro) => {
    const bateTipo = tipoAtivo.value === 'Todos' || livro.tipo === tipoAtivo.value;
    const bateBusca = livro.titulo.toLowerCase().includes(busca.value.toLowerCase());
    return bateTipo && bateBusca;
  });
});

function alternarFavorito(livro) {
  livro.favorito = !livro.favorito;
}

// --- Drag to scroll (para funcionar arrastando com o mouse no desktop) ---
const categoriaScroll = ref(null);
let arrastando = false;
let posInicialX = 0;
let scrollInicial = 0;

function iniciarArrasto(evento) {
  arrastando = true;
  posInicialX = evento.pageX - categoriaScroll.value.offsetLeft;
  scrollInicial = categoriaScroll.value.scrollLeft;
  categoriaScroll.value.classList.add('arrastando');
}

function pararArrasto() {
  arrastando = false;
  categoriaScroll.value?.classList.remove('arrastando');
}

function moverArrasto(evento) {
  if (!arrastando) return;
  evento.preventDefault();
  const posAtualX = evento.pageX - categoriaScroll.value.offsetLeft;
  const distancia = posAtualX - posInicialX;
  categoriaScroll.value.scrollLeft = scrollInicial - distancia;
}
</script>

<template>
  <AppHeader/>
  <section class="marketplace">
    <h1 class="titulo-secao">Trocas e empréstimos</h1>

    <div class="busca-container">
      <svg class="icone-busca" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        v-model="busca"
        type="text"
        class="input-busca"
        placeholder="Digite o nome do livro"
      />
    </div>

    <div class="filtro-bloco">
      <span class="filtro-label">Tipo</span>
      <div class="filtro-opcoes">
        <button
          v-for="tipo in tipos"
          :key="tipo"
          class="chip"
          :class="{ 'chip-ativo': tipoAtivo === tipo }"
          @click="tipoAtivo = tipo"
        >
          {{ tipo }}
        </button>
      </div>
    </div>

    <div class="filtro-bloco">
      <span class="filtro-label">Categoria</span>
      <div
        class="filtro-opcoes filtro-opcoes-scroll"
        ref="categoriaScroll"
        @mousedown="iniciarArrasto"
        @mouseleave="pararArrasto"
        @mouseup="pararArrasto"
        @mousemove="moverArrasto"
      >
        <button
          v-for="categoria in categorias"
          :key="categoria"
          class="chip"
          :class="{ 'chip-ativo': categoriaAtiva === categoria }"
          @click="categoriaAtiva = categoria"
        >
          {{ categoria }}
        </button>
      </div>
    </div>

    <div class="grid-livros">
      <div v-for="livro in livrosFiltrados" :key="livro.id + livro.tipo" class="card-livro">
        <div class="capa-livro">
          <span class="badge" :class="livro.tipo === 'Troca' ? 'badge-troca' : 'badge-emprestimo'">
            {{ livro.tipo }}
          </span>
          <button class="btn-favorito" @click="alternarFavorito(livro)">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              :fill="livro.favorito ? '#e63946' : 'none'"
              stroke="#e63946"
              stroke-width="2"
            >
              <path d="M20.8 4.6c-1.9-1.9-5-1.9-6.9 0L12 6.5l-1.9-1.9c-1.9-1.9-5-1.9-6.9 0-1.9 1.9-1.9 5 0 6.9L12 20.3l8.8-8.8c1.9-1.9 1.9-5 0-6.9z"/>
            </svg>
          </button>
          <div class="capa-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b0a89a" stroke-width="1.5">
              <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z"/>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            </svg>
          </div>
        </div>
        <p class="titulo-livro">{{ livro.titulo }}</p>
        <div class="dono-livro">
          <div class="avatar-dono"></div>
          <span>{{ livro.dono }}</span>
        </div>
      </div>
    </div>

    <p v-if="!livrosFiltrados.length" class="sem-resultados">
      Nenhum livro encontrado.
    </p>
  </section>
  <AppFooter/>
</template>

<style scoped>
/* ===== Base (desktop primeiro) ===== */
.marketplace {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.titulo-secao {
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
  color: #2c2c2c;
  font-weight: 500;
  margin: 60px 0 40px 0;
  font-size: 32px;
}

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
  max-width: 420px;
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

/* Grid de livros */
.grid-livros {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 28px;
  padding-bottom: 80px;
}

.card-livro {
  display: flex;
  flex-direction: column;
}

.capa-livro {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 12px;
  overflow: hidden;
  background: #efe7d8;
  margin-bottom: 10px;
  transition: transform 0.2s;
}

.card-livro:hover .capa-livro {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.capa-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #efe7d8;
}

.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
}

.badge-troca {
  background: #3b6ea5;
}

.badge-emprestimo {
  background: #4a8c5f;
}

.btn-favorito {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s;
}

.btn-favorito:hover {
  transform: scale(1.1);
}

.titulo-livro {
  font-size: 15px;
  font-weight: 500;
  color: #2c2c2c;
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.dono-livro {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b6b6b;
}

.avatar-dono {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #d8cfc0;
  flex-shrink: 0;
}

.sem-resultados {
  text-align: center;
  color: #b0a89a;
  padding: 60px 0;
  font-size: 16px;
}

/* ===== Mobile (telas até 640px) ===== */
@media (max-width: 640px) {
  .marketplace {
    max-width: 100%;
    padding: 0 25px;
  }

  .titulo-secao {
    font-size: 25px;
    margin: 20px 0 30px 0;
  }

  .busca-container {
    max-width: 100%;
    padding: 12px 16px;
    margin-bottom: 25px;
  }

  .filtro-bloco {
    margin-bottom: 20px;
  }

  .chip {
    padding: 8px 18px;
  }

  .grid-livros {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
    padding-bottom: 100px;
  }

  .card-livro:hover .capa-livro {
    transform: none;
    box-shadow: none;
  }

  .btn-favorito:hover {
    transform: none;
  }
}
</style>