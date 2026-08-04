<script setup>
import { onMounted, computed } from "vue";
import { RouterLink } from "vue-router";
import { useLivrosStore } from "@/stores/livros";
import { useAuthStore } from "@/stores/auth";

import { Splide, SplideSlide } from "@splidejs/vue-splide";
import "@splidejs/vue-splide/css";

import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import voltar from "@/components/common/voltar.vue";
import BookCard from "@/components/books/bookCard.vue";

import {
  LibraryBig,
  BookOpenCheck,
  BookOpenText,
  Bookmark,
} from "lucide-vue-next";

const livroStore = useLivrosStore();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const userEmail = computed(() => user.value?.email || "");

onMounted(() => {
  livroStore.fetchMeusLivros();
});

// Helper para extrair o ID do livro com segurança
const getLivroId = (item) => {
  if (!item) return null;
  if (typeof item.livro === "object" && item.livro !== null) {
    return item.livro.id;
  }
  return item.livro || item.id;
};

// Helper para passar o objeto do livro para o BookCard
const getLivroObjeto = (item) => {
  if (!item) return {};
  if (typeof item.livro === "object" && item.livro !== null) {
    return item.livro;
  }
  return item;
};

// Estatísticas reativas diretas da store
const totalLivros = computed(() => livroStore.totalMeusLivros);
const totalLidos = computed(() => livroStore.totalLidos);
const totalLendo = computed(() => livroStore.totalLendo);
const totalQueroLer = computed(() => livroStore.totalQueroLer);

// Listas filtradas para as seções
const livrosLendo = computed(() =>
  livroStore.meusLivros.filter((i) => i.status === "lendo")
);
const livrosQueroLer = computed(() =>
  livroStore.meusLivros.filter((i) => i.status === "quero_ler")
);
const livrosLidos = computed(() =>
  livroStore.meusLivros.filter((i) => i.status === "lido")
);

const userPhoto = computed(() => {
  const url = authStore.user?.foto?.url;

  if (url) {
    return url.startsWith("http")
      ? url
      : `${import.meta.env.VITE_BACKEND_URL}${url}`;
  }

  if (authStore.user?.google_picture) {
    return authStore.user.google_picture;
  }

  return "/imgs/avatar.jpeg";
});

const splideOptions = {
  perPage: 3,
  gap: "20px",
  breakpoints: {
    1024: { perPage: 2 },
    640: { perPage: 1, gap: "15px" },
  },
  arrows: true,
  pagination: false,
  drag: "free",
};
</script>

<template>
  <voltar />
  <AppHeader class="header-principal" />

  <div id="me">
    <div class="topo-perfil">
      <div class="info">
        <div class="img">
          <img
            :src="userPhoto"
            alt="avatar"
            class="avatar"
            @error="($event) => ($event.target.src = '/imgs/avatar.jpeg')"
          />
        </div>

        <div class="menu-info">
          <strong>{{ authStore.user?.name || 'Usuário' }}</strong>
          <p>{{ userEmail }}</p>
        </div>
      </div>

      <button class="btn-editar" @click="$router.push('/profile/edit')">
        Editar perfil
      </button>
    </div>

    <div class="stats">
      <div class="stat-item">
        <span>
          <LibraryBig :size="22" />
          {{ totalLivros }}
        </span>
        <p>Total na Estante</p>
      </div>

      <div class="stat-item divisor">
        <span>
          <BookOpenCheck :size="22" />
          {{ totalLidos }}
        </span>
        <p>Lidos</p>
      </div>

      <div class="stat-item divisor">
        <span>
          <BookOpenText :size="22" />
          {{ totalLendo }}
        </span>
        <p>Lendo</p>
      </div>

      <div class="stat-item">
        <span>
          <Bookmark :size="22" />
          {{ totalQueroLer }}
        </span>
        <p>Quero Ler</p>
      </div>
    </div>
  </div>

  <div id="livros">
    <!-- Seção: Lendo atualmente -->
    <div class="secao-livros" v-if="livrosLendo.length">
      <h1 class="titulo-secao">Lendo Atualmente</h1>
      <div class="lista-livros">
        <Splide :options="splideOptions">
          <SplideSlide v-for="item in livrosLendo" :key="item.id">
            <RouterLink :to="`/livro/${getLivroId(item)}`">
              <BookCard :livro="getLivroObjeto(item)" />
            </RouterLink>
          </SplideSlide>
        </Splide>
      </div>
    </div>

    <!-- Seção: Quero Ler -->
    <div class="secao-livros" v-if="livrosQueroLer.length">
      <h1 class="titulo-secao">Quero Ler</h1>
      <div class="lista-livros">
        <Splide :options="splideOptions">
          <SplideSlide v-for="item in livrosQueroLer" :key="item.id">
            <RouterLink :to="`/livro/${getLivroId(item)}`">
              <BookCard :livro="getLivroObjeto(item)" />
            </RouterLink>
          </SplideSlide>
        </Splide>
      </div>
    </div>

    <!-- Seção: Lidos -->
    <div class="secao-livros" v-if="livrosLidos.length">
      <h1 class="titulo-secao">Lidos</h1>
      <div class="lista-livros">
        <Splide :options="splideOptions">
          <SplideSlide v-for="item in livrosLidos" :key="item.id">
            <RouterLink :to="`/livro/${getLivroId(item)}`">
              <BookCard :livro="getLivroObjeto(item)" />
            </RouterLink>
          </SplideSlide>
        </Splide>
      </div>
    </div>

    <!-- Estado Vazio -->
    <div v-if="!totalLivros" class="sem-livros">
      <p>Você ainda não adicionou nenhum livro à sua estante.</p>
    </div>
  </div>

  <AppFooter />
</template>

<style scoped>
#me {
  background: #f3e7d7;
  padding: 40px 60px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.topo-perfil {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  border: 2px solid #7b5638;
  object-fit: cover;
  cursor: pointer;
}

.menu-info {
  display: flex;
  flex-direction: column;
}

.menu-info strong {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2d2d2d;
}

.menu-info p {
  color: #666;
  margin: 4px 0 0;
}

.btn-editar {
  padding: 12px 24px;
  border: 1px solid #7b5638;
  border-radius: 12px;
  background: white;
  color: #7b5638;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-editar:hover {
  background: #faf7f4;
  transform: translateY(-1px);
}

.stats {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-item p {
  margin: 0;
  color: #6d6d6d;
  font-size: 0.95rem;
}

.stat-item span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.8rem;
  font-weight: 600;
  color: #6b4226;
  margin-bottom: 2px;
}

.divisor {
  padding: 0 25px;
  border-left: 1px solid #8a6a52;
}

#livros {
  padding: 50px 60px;
}

.secao-livros {
  margin-bottom: 50px;
}

.titulo-secao {
  position: relative;
  display: inline-block;
  margin-bottom: 25px;
  font-size: 1.8rem;
  font-weight: 500;
  color: #2d2d2d;
}

.titulo-secao::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 50%;
  height: 3px;
  background: #6b4226;
  border-radius: 999px;
}

.sem-livros {
  text-align: center;
  padding: 40px;
  color: #8a6a52;
  font-size: 1.1rem;
}

.lista-livros {
  width: 100%;
}

:deep(.splide__track) {
  padding: 10px 0;
}

:deep(.splide__arrow) {
  background: #f3e7d7;
  opacity: 1;
}

:deep(.splide__arrow svg) {
  fill: #6b4226;
}

.splide__slide {
  transition: transform 0.25s ease;
}

.splide__slide:hover {
  transform: translateY(-4px);
}

@media (max-width: 768px) {
  .header-principal {
    display: none !important;
  }
  #me {
    padding: 25px 20px;
  }

  #livros {
    padding: 30px 20px;
  }

  .topo-perfil {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .info {
    width: 100%;
    align-items: center;
  }

  .avatar {
    width: 70px;
    height: 70px;
  }

  .menu-info strong {
    font-size: 1.4rem;
  }

  .btn-editar {
    width: 100%;
  }

  .stats {
    width: 100%;
    justify-content: space-around;
  }

  .divisor {
    padding: 0 10px;
    border-left: none;
  }

  .titulo-secao {
    font-size: 1.5rem;
  }

  .splide__slide:hover {
    transform: none;
  }
}
</style>