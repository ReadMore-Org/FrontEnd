<script setup>
import { Book, LayoutTemplate } from 'lucide-vue-next'
import { ArrowLeftRight } from 'lucide-vue-next'
import { BookOpen } from 'lucide-vue-next'
</script>

<template>
  <div class="todo">
    <ul>
        <li>
            <Book :size="20" />
            <div>
                <h1>Organizar</h1>
                <h2>Organize seus livros</h2>
            </div>
        </li>
        <li>
            <ArrowLeftRight :size="20" />
            <div>
                <h1>Troque</h1>
                <h2>Troque seus livros</h2>
            </div>
        </li>
        <li>
            <BookOpen :size="20" />
            <div>
                <h1>Empréstimo</h1>
                <h2>Gerencie fácil</h2>
            </div>
        </li>
        <li>
            <LayoutTemplate :size="20" />
            <div>
                <h1>Leitura</h1>
                <h2>Acompanhe progresso</h2>
            </div>
        </li>
    </ul>
  </div>
</template>

<style scoped>
.todo {
    
    display: flex;
    justify-content: center;
}
ul {
    background-color: #E8D8C3;
    display: flex;
    gap: 60px;
}
li {
    display: flex;
    align-items: center;
}
</style>