<script setup>
import { Splide, SplideSlide } from '@splidejs/vue-splide'
import '@splidejs/vue-splide/css'
import mensagemBemvindo from "@/components/home/mensagemBemvindo.vue";
import cardMarketplace from "@/components/home/cardMarketplace.vue";
import BookCard from "@/components/books/bookCard.vue";
import StatsCard from "@/components/home/statsCard.vue";
import barraProgresso from "@/components/home/barraProgresso.vue";
const livros = [
    {
        "id": "gf1",
        "title": "Gravity Falls: Journal 3",
        "author": "Alex Hirsch",
        "publishedDate": "2016-07-26",
        "year": 2016,
        "pageCount": 288,
        "category": "Ficção juvenil",
        "description": "Se você já assistiu Gravity Falls, conhece o Diário 3. Este livro reúne segredos, mistérios e criaturas estranhas da cidade.",
        "image": "http://books.google.com/books/content?id=aw9aEQAAQBAJ&printsec=frontcover&img=1&zoom=3",
        "language": "en",
        "publisher": "Disney Press",
        "isbn": "9781484746691"
    },
    {
        "id": "gf2",
        "title": "Gravity Falls: Lost Legends",
        "author": "Alex Hirsch",
        "publishedDate": "2018-07-24",
        "year": 2018,
        "pageCount": 224,
        "category": "Quadrinhos",
        "description": "Quatro histórias inéditas que expandem o universo de Gravity Falls com aventuras misteriosas e divertidas.",
        "image": "http://books.google.com/books/content?id=lost123&printsec=frontcover&img=1&zoom=3",
        "language": "en",
        "publisher": "Disney Press",
        "isbn": "9781368021425"
    },
    {
        "id": "gf3",
        "title": "Dipper's and Mabel's Guide to Mystery and Nonstop Fun!",
        "author": "Rob Renzetti",
        "publishedDate": "2016-02-02",
        "year": 2016,
        "pageCount": 144,
        "category": "Infantil",
        "description": "Um guia divertido com dicas, mistérios e atividades do universo de Gravity Falls.",
        "image": "http://books.google.com/books/content?id=guide123&printsec=frontcover&img=1&zoom=3",
        "language": "en",
        "publisher": "Disney Press",
        "isbn": "9781484710104"
    }
]
</script>

<template>
    <div class="home">
        <mensagemBemvindo />
        <cardMarketplace />
        <!-- <h1 class="titulo-secao">Lendo atualmente</h1>
        <div class="lista-livros">
            <Splide :options="{
                perPage: 3,
                gap: '100px',
                arrows: true,
                pagination: false,
                drag: 'free'
            }">
                <SplideSlide v-for="livro in livros" :key="livro.id">
                    <BookCard :livro="livro" />
                </SplideSlide>
            </Splide>
        </div>
        <div class="lista-cards">
            <StatsCard titulo="Total de livros" :valor="10" />
            <StatsCard titulo="Lendo" :valor="11" />
            <StatsCard titulo="Finalizados" :valor="12" />
            <StatsCard titulo="Quero ler" :valor="13" />
        </div>
        <h1 class="titulo-secao">Meta 2026</h1>
        <barraProgresso />
        <h1 class="titulo-secao">Recomendados para você</h1>
        <div class="lista-livros">
            <BookCard v-for="livro in livros" :key="livro.id" :livro="livro" />
        </div>-->
    </div> 
</template>

<style scoped>
div.home {
    margin: 0 100px;
}

.lista-livros {
    display: flex;
    gap: 100px;
    margin: 30px 0;
    width: 100%;
}

.lista-cards {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-top: 80px;
}

.titulo-secao {
    position: relative;
    display: inline-block;
    padding-bottom: 5px;
    color: #2C2C2C;
    font-weight: 500;
    margin-top: 40px;
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
    height: 400px;
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
}
</style>