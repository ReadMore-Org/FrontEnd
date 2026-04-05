<script setup>
import mensagemBemvindo from "@/components/home/mensagemBemvindo.vue";
import cardMarketplace from "@/components/home/cardMarketplace.vue";
import BookCard from "@/components/books/bookCard.vue";

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
        <h1 class="titulo-secao">Lendo atualmente</h1>
        <div class="lista-livros">
            <BookCard v-for="livro in livros" :key="livro.id" :livro="livro" />
        </div>
    </div>
</template>

<style scoped>
div.home {
    margin: 0 180px;
}
.lista-livros {
    display: flex;
    gap: 100px;
    margin: 30px 0;
}
.titulo-secao {
  position: relative;
  display: inline-block;
  padding-bottom: 5px;
  color: #2C2C2C;
  font-weight: 500;
  margin-top: 40px;
}

.titulo-secao::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50%; /* controla o tamanho da linha */
  height: 4px;
  border-radius: 50px;
  background: #6B4226;
}
</style>