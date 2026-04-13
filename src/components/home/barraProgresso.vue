<script setup>
</script>

<template>
  <div class="container">

    <div class="topo">
      <p class="titulo">15/30</p>
      <p class="porcentagem">50%</p>
    </div>

    <div class="barra">
      <div 
        class="progresso"
        style="width: 50%; background: #6B4226;"
      ></div>
    </div>

    <p class="info">Faltam 15 livros para sua meta</p>
  </div>
</template>

<style scoped>
.container {
  border-radius: 12px;
  width: 100%;
}

.topo {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
}

.titulo {
  font-weight: 500;
  color: #2C2C2C;
}

.porcentagem {
  font-weight: bold;
  color: rgba(139, 94, 60, 0.8);
}

.barra {
  width: 100%;
  height: 12px;
  background: rgba(139, 94, 60, 0.7);
  border-radius: 10px;
  overflow: hidden;
}

.progresso {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.info {
  margin-top: 8px;
  font-size: 16px;
  color: #5A4636;
}
</style>