<script setup>
import { RouterLink, useRoute } from "vue-router";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import Voltar from "@/components/common/voltar.vue";

const route = useRoute();
</script>

<template>
  <Voltar />
  <AppHeader />

  <main class="cta-container">
    <div class="cta-card">
      <div class="icone-livro">📚</div>
      <h1>Gostaria de adicionar à sua estante?</h1>
      <p>Entre na sua conta ou cadastre-se agora mesmo para organizar seus livros e acompanhar suas leituras!</p>

      <div class="botoes">
        <RouterLink to="/">
          <button class="btn-entrar">Entrar</button>
        </RouterLink>

        <RouterLink to="/signup">
          <button class="btn-criar">Criar conta</button>
        </RouterLink>
      </div>
    </div>
  </main>

  <AppFooter />
</template>

<style scoped>
.cta-container {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #faf7f4;
  padding: 20px;
}

.cta-card {
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  text-align: center;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(107, 66, 38, 0.08);
  border: 1px solid #e8d8c3;
}

.icone-livro {
  font-size: 48px;
  margin-bottom: 16px;
}

.cta-card h1 {
  font-size: 22px;
  color: #654321;
  margin-bottom: 12px;
  font-weight: 600;
}

.cta-card p {
  font-size: 15px;
  color: #7a6a5c;
  line-height: 1.5;
  margin-bottom: 28px;
}

.botoes {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.botoes button {
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-entrar {
  background: white;
  border: 2px solid #e8d8c3;
  color: #6b4226;
}

.btn-entrar:hover {
  background: #f5e6d3;
}

.btn-criar {
  background: #6b4226;
  border: none;
  color: white;
}

.btn-criar:hover {
  background: #52311b;
}

@media (max-width: 480px) {
  .botoes {
    flex-direction: column;
  }

  .botoes button {
    width: 100%;
  }
}
</style>