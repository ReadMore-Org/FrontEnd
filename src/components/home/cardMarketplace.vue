<script setup>
import { Store } from 'lucide-vue-next'
</script>

<template>
<div class="card">
    <div class="esquerda">
        <h1>Mais de 200.000 livros a venda no nosso mercado</h1>
        <button> <p>Ver mercado</p><Store /></button>
    </div>
    <div class="direita">
        <img src="/public/imgs/Livros.png" alt="livros" class="livros">
    
    </div>
</div>
</template>

<style scoped>
.card {
    background-color: #6B4226;
    display: flex;
    justify-content: space-between;
    border-radius: 15px;
    margin: 30px 0 0 0;
}
.esquerda {
    margin: 40px 0px 40px 50px;
}
.esquerda h1{
    color: white;
    font-weight: 500;
    font-size: 40px;
    width: 80%;
}
.esquerda button {
    display: flex;
    align-items: center;
    width: 280px;
    height: 50px;
    border-radius: 50px;
    border: none;
    margin-top: 30px;
    color: #5A4636;
    gap: 10px;
    justify-content: center;
}
.esquerda button p {
    font-size: 15px;
    font-weight: 550;
}
.esquerda button svg {
    stroke-width: 1.8px;
}
.direita {
  display: flex;
  align-items: flex-end; 
  margin-right: 100px;
}
.livros {
  width: 300px;
  height: auto;
}
</style>