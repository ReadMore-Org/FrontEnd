<script setup>
import { onMounted } from "vue";
import { RouterLink } from "vue-router";

import { useLivrosStore } from "@/stores/livros";

import { Splide, SplideSlide } from "@splidejs/vue-splide";
import "@splidejs/vue-splide/css";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import voltar from  "@/components/common/voltar.vue"
import BookCard from "@/components/books/bookCard.vue";
import StatsCard from "@/components/home/statsCard.vue";
import barraProgresso from "@/components/home/barraProgresso.vue";
import ProdutoView from "@/views/ProdutoView.vue";
import ListaRecursos from "@/components/home/listaRecursos.vue";

import { LibraryBig, TicketPlusIcon, BookOpenCheck, BookOpenText } from "lucide-vue-next";

import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";

const livroStore = useLivrosStore();

const authStore = useAuthStore();
const user = computed(() => authStore.user);
const userEmail = computed(() => user.value?.email || "");

onMounted(() => {
  livroStore.fetchLivros();
});

const userPhoto = computed(() => {
  if (authStore.user?.foto?.url) {
    return `http://127.0.0.1:8000${authStore.user.foto.url}`;
  }

  if (authStore.user?.google_picture) {
    return authStore.user.google_picture;
  }

  return "/imgs/avatar.jpeg";
});
</script>

<template>
  <voltar/>
  <AppHeader class="header-principal"/>
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
          <strong>{{ authStore.user?.name }}</strong>
          <p>{{ userEmail }}</p>
        </div>
      </div>

      <button class="btn-editar" @click="$router.push('/profile/edit')">
        Editar perfil
      </button>
    </div>

    <div class="stats">
      <p>
        <span>
          <LibraryBig :size="22" />
          25
        </span>
        Livros
      </p>

      <p id="center">
        <span>
          <BookOpenCheck :size="22" />
          15
        </span>
        Lidos
      </p>

      <p>
        <span>
          <BookOpenText :size="22" />
          4
        </span>
        Lendo
      </p>
    </div>
  </div>

  <div id="livros">
    <div class="meus">
      <h1 class="titulo-secao">Meus Livros</h1>
      <div class="lista-livros">
        <Splide
          :options="{
            perPage: 3,
            gap: '0px' /* Reduzido o gap padrão */,
            breakpoints: {
              640: {
                perPage: 1,
                gap: '30px',
              },
            },
            arrows: true,
            pagination: false,
            drag: 'free',
          }"
        >
          <SplideSlide v-for="livro in livroStore.livros" :key="livro.id">
            <RouterLink :to="`/livro/${livro.id}`">
              <BookCard :livro="livro" />
            </RouterLink>
          </SplideSlide>
        </Splide>
      </div>
    </div>
    <div>
      <div class="favoritos">
        <h1 class="titulo-secao">Meus Livros</h1>
        <div class="lista-livros">
          <Splide
            :options="{
              perPage: 3,
              gap: '0px' /* Reduzido o gap padrão */,
              breakpoints: {
                640: {
                  perPage: 1,
                  gap: '30px',
                },
              },
              arrows: true,
              pagination: false,
              drag: 'free',
            }"
          >
            <SplideSlide v-for="livro in livroStore.livros" :key="livro.id">
              <RouterLink :to="`/livro/${livro.id}`">
                <BookCard :livro="livro" />
              </RouterLink>
            </SplideSlide>
          </Splide>
        </div>
      </div>
    </div>
  </div>
    <AppFooter/>
</template>

<style scoped>
/* =====================
   PERFIL
===================== */

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

/* =====================
   ESTATÍSTICAS
===================== */

.stats {
  display: flex;
  align-items: center;
  gap: 30px;
}

.stats p {
  margin: 0;
  color: #6d6d6d;
  font-size: 1rem;
  line-height: 1.4;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 8px;

  font-size: 2rem;
  font-weight: 600;
  color: #6b4226;

  margin-bottom: 4px;
}

#center {
  padding: 0 30px;
  border-left: 1px solid #8a6a52;
  border-right: 1px solid #8a6a52;
}

/* =====================
   SEÇÕES DE LIVROS
===================== */

#livros {
  padding: 50px 60px;
}

.meus,
.favoritos {
  margin-bottom: 60px;
}

.titulo-secao {
  position: relative;
  display: inline-block;

  margin-bottom: 30px;

  font-size: 2rem;
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

/* =====================
   SPLIDE
===================== */

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

/* =====================
   RESPONSIVO
===================== */

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
    justify-content: center;
    text-align: center;
  }

  .stats span {
    font-size: 1.4rem;
  }

  #center {
    padding: 0 15px;
  }

  .titulo-secao {
    font-size: 1.6rem;
  }

  .splide__slide:hover {
    transform: none;
  }
}
</style>
