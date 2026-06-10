<script setup>
import { ScanLine } from "lucide-vue-next";
</script>
<template>
  <div class="container">
    <div class="content">
      <h1>Adicionar livro</h1>

      <div class="line"></div>

      <p class="text">Use a câmera para identificar o livro rapidamente</p>

      <RouterLink to="/scan">
        <div class="button brown">
          <ScanLine />
          <span>Escanear código</span>
        </div>
      </RouterLink>
      <p class="text">Busque o livro pelo nome</p>

      <div class="button brown">
        Buscar pelo nome
      </div>

      <div class="divider">
        <div class="divider-line"></div>
        <span>ou</span>
        <div class="divider-line"></div>
      </div>

      <p class="text">Preencha as informações do livro</p>
      <RouterLink to="manual">
        <div class="button white">
          Cadastrar manualmente
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #f7e6db;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 40px;
  font-family: Arial, sans-serif;
}

.content {
  width: 90%;
  max-width: 320px;
}

h1 {
  font-size: 32px;
  font-weight: 400;
  margin-bottom: 10px;
  color: #111;
}

.line {
  width: 60px;
  height: 2px;
  background-color: #6B4226;
  margin-bottom: 40px;
}

.text {
  font-size: 14px;
  color: #2C2C2C;
  margin-bottom: 14px;
}

.button {
  width: 100%;
  height: 50px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 35px;
  font-size: 16px;
  cursor: pointer;
  box-sizing: border-box;
}

.brown {
  background-color: #6B4226;
  color: white;
  gap: 6px
}

.white {
  background-color: #FFFFFF;
  border: 1px solid #6B4226;
  color: #5A4636;
}

.icon {
  margin-right: 10px;
  font-size: 18px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
}

.divider span {
  margin: 0 10px;
  color: #999;
  font-size: 14px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #c7a89a;
}
</style>