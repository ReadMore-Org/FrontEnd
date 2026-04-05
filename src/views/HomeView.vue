<script setup>
import mensagemBemvindo from "@/components/home/mensagemBemvindo.vue";
import cardMarketplace from "@/components/home/cardMarketplace.vue";
import BookCard from "@/components/books/bookCard.vue";
</script>

<template>
    <div class="home">
        <mensagemBemvindo />
        <cardMarketplace />
        <BookCard />
    </div>
</template>

<style scoped>
div.home {
    margin: 0 180px;
}
</style>