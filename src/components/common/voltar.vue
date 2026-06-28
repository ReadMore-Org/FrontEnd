<script setup>
import { ArrowLeft } from "lucide-vue-next";

const voltar = () => {
  window.history.back();
};
</script>

<template>
  <button @click="voltar" class="btn-voltar">
    <ArrowLeft />
  </button>
</template>

<style scoped>
.btn-voltar {
  border: none;
  background: white;
  border-radius: 50%;
  padding: 8px;
  margin: 12px 0 0 12px;
}

  @media (min-width: 1024px) {
    .btn-voltar {
        display: none;
    }
}
</style>