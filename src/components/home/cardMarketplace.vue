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


@media (max-width: 650px) {
  .card {
    text-align: center;
    border-radius: 20px;
    justify-content: flex-start; 
    border-radius: 10px;
  }

.esquerda {
  margin: 10px 0 0 0;
  padding: 10px;
  width: 100%;
  flex: 1;
  min-width: 0;
}

.esquerda h1 {
  font-size: 17px;
  width: 100%;
  text-align: left;
  margin: 0;
  line-height: 1.3;
}
.esquerda button {
  width: 150px;
  height: 34px;
  margin: 8px 0 0 0;
  border-radius: 30px;
  font-size: 13px;
  gap: 6px;
  padding: 0 10px;
}

  .direita {
    margin: 20px 0 0 0;
    padding: 0 10px 0 0;
  }
 .direita img {
  width: 90px;
  height: auto;
}
  .livros {
    width: 160px; /* imagem menor */
  }
}
</style>