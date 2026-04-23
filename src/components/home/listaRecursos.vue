<script setup>
import { Book, LayoutTemplate } from 'lucide-vue-next'
import { ArrowLeftRight } from 'lucide-vue-next'
import { BookOpen } from 'lucide-vue-next'
</script>

<template>
  <div class="todo">
    <ul>
        <li>
            <Book :size="30" />
            <div>
                <h1>Organizar</h1>
                <h2>Organize seus livros</h2>
            </div>
        </li>
        <li>
            <ArrowLeftRight :size="30" />
            <div>
                <h1>Troque</h1>
                <h2>Troque seus livros</h2>
            </div>
        </li>
        <li>
            <BookOpen :size="30" />
            <div>
                <h1>Empréstimo</h1>
                <h2>Gerencie fácil</h2>
            </div>
        </li>
        <li>
            <LayoutTemplate :size="30" />
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

  position: absolute;
  left: 50%;
  top: 50;
  transform: translate(-50%, -50%);
}

ul {
  background-color: #E8D8C3;
  display: flex;
  gap: 40px;
  padding: 25px 40px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 15px;
}

li {
  display: flex;
  align-items: center;
  gap: 15px;
}

svg {
  color: #2C2C2C;
  min-width: 35px;
}

h1 {
  color: #2C2C2C;
  font-size: 18px;
  margin: 0;
  font-weight: 500;
}

h2 {
  color: #5A4636;
  font-size: 14px;
  margin: 0;
  min-width: 160px;
  font-weight: 500;
}

/* 🔥 responsivo */
@media (max-width: 800px) {
    .todo {
        display: none;
    }
}
</style>