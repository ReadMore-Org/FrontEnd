<script setup>
import { onMounted } from 'vue'

import { useLivrosStore } from '@/stores/livros'

import { Splide, SplideSlide } from '@splidejs/vue-splide'
import '@splidejs/vue-splide/css'

import mensagemBemvindo from "@/components/home/mensagemBemvindo.vue";
import cardMarketplace from "@/components/home/cardMarketplace.vue";
import BookCard from "@/components/books/bookCard.vue";
import StatsCard from "@/components/home/statsCard.vue";
import barraProgresso from "@/components/home/barraProgresso.vue";
import ProdutoView from '@/views/ProdutoView.vue'
import ListaRecursos from '@/components/home/listaRecursos.vue';

const livroStore = useLivrosStore()

onMounted(() => {
    livroStore.fetchLivros()
})
</script>

<template>
<cardMarketplace />
<ListaRecursos />
    <div class="margin">
        <h1 class="titulo-secao">Lendo atualmente</h1>
        <div class="lista-livros">
            <Splide :options="{
                perPage: 3,
                gap: '0px', /* Reduzido o gap padrão */
                breakpoints: {
                    640: {
                        perPage: 1,
                        gap: '30px'
                    },
                },
                arrows: true,
                pagination: false,
                drag: 'free'
            }">
                <SplideSlide v-for="livro in livroStore.livros" :key="livro.id">
                <RouterLink :to="`/livro/${livro.id}`">
                    <BookCard :livro="livro" />
                </RouterLink>
                </SplideSlide>
            </Splide>
        </div>
        <h1 class="titulo-secao">Resumo rápido</h1>
        <div class="lista-cards">
            <StatsCard titulo="Livros" :valor="10" />
            <StatsCard titulo="Lendo" :valor="11" />
            <StatsCard titulo="Finalizados" :valor="12" />
            <StatsCard titulo="Quero ler" :valor="13" />
        </div>
        <h1 class="titulo-secao">Meta 2026</h1>
        <barraProgresso />
        <h1 class="titulo-secao">Recomendados para você</h1>
        <div class="lista-livros">

        </div>
        <div class="lista-livros">
            <Splide :options="{
                perPage: 3,
                gap: '0px',
                breakpoints: {
                    640: {
                        perPage: 1,
                        gap: '30px'
                    },
                },
                arrows: true,
                pagination: false,
                drag: 'free'
            }">
                <SplideSlide v-for="livro in livroStore.livros" :key="livro.id">
                    <BookCard :livro="livro" />
                </SplideSlide>
            </Splide>
        </div>
    </div>
</template>

<style scoped>

.lista-cards {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}
.margin {
    padding: 60px 0 0 0;
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
    div.home {
        margin: 0;
    }

    .splide__slide {
        transition: none;
    }

    .splide__slide:hover {
        transform: none;
    }

    .lista-cards {
        display: flex;
        flex-wrap: wrap;
        /* Permite que os itens se quebrem em múltiplas linhas */
        gap: 20px;
        /* Espaçamento entre os cards */
        justify-content: center;
        /* Alinha os cards ao centro */
    }

    .titulo-secao {
        font-size: 20px;
        margin-top: 0px;
    }


}
</style>
