<script setup>
import { onMounted } from "vue";
import { RouterLink } from "vue-router";

import { useLivrosStore } from "@/stores/livros";

import { Splide, SplideSlide } from "@splidejs/vue-splide";
import "@splidejs/vue-splide/css";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import BookCard from "@/components/books/bookCard.vue";
import StatsCard from "@/components/home/statsCard.vue";
import barraProgresso from "@/components/home/barraProgresso.vue";
import ProdutoView from "@/views/ProdutoView.vue";
import ListaRecursos from "@/components/home/listaRecursos.vue";

import { LibraryBig, TicketPlusIcon, BookOpenCheck, BookOpenText } from 'lucide-vue-next'


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
    <div id="me">
        <div class="info">
        <div class="img">
        <img
          :src="userPhoto"
          alt="avatar"
          class="avatar"
          @error="($event) => $event.target.src = '/imgs/avatar.jpeg'"
          @click="menuAberto = !menuAberto"
        />
        </div>

        <div class="menu-info">
            <strong>{{ authStore.user?.name }}</strong>
            <p>{{ userEmail }}</p>
        </div>
        </div>

        <div class="stats">
            <p>
                <span><LibraryBig :size="24" />25</span> <br>
                Livros
            </p>
            <p id="center">
                <span><BookOpenCheck :size="24" />15</span> <br>
                Lidos
            </p>
            <p>
                <span><BookOpenText :size="24" />4</span> <br>
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
</template>

<style scoped>
#me {
    align-items: center;
}
.info {
    display: flex;
    gap: 12px;
}
.stats {
    display: flex;
    gap: 18px;
    align-items: center;
    text-align: center;
}
#center{
    padding: 9px;
    border-right: solid #654321 1px;
    border-left: solid #654321 1px;
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 500px;
  border: solid 2px #654321;
  cursor: pointer;
}

.imagem {
  position: relative;
  display: flex;
  align-items: center;
  gap: 13px;
}

#livros {
    padding: 50px;
}
.lista-cards {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.titulo-secao {
    position: relative;
    display: inline-block;
    padding-bottom: 5px;
    color: #2C2C2C;
    font-weight: 500;
    margin: 60px 0 30px 0;
    font-size: 25px;
}

.titulo-secao::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 50%;
    height: 4px;
    border-radius: 50px;
    background: #6B4226;
}

.splide__slide {
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.splide__slide:hover {
    transform: scale(1.05);
}
@media (max-width: 650px) {
    .splide__slide {
        transition: none;
    }

    .splide__slide:hover {
        transform: none;
    }

    .lista-cards {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
    }

    .titulo-secao {
        font-size: 20px;
        margin-top: 50px;
    }

}
</style>
