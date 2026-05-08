<script setup>
import { ref } from 'vue';
import { Mail, Lock, User, Eye, EyeOff, LogIn } from 'lucide-vue-next';

// Estado para mostrar/esconder senha
const showPassword = ref(false);
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Dados do formulário
const form = ref({
  nome: '',
  email: '',
  senha: ''
});

const handleSubmit = () => {
  console.log('Dados enviados:', form.value);
};
</script>

<template>
  <div class="todo">
    <div class="signup">

      <section class="lado-marca">
        <header class="info-marca">
          <h1>Crie sua <span>conta</span></h1>
          <p>Seu cantinho de leitura começa aqui.</p>
        </header>

        <form @submit.prevent="handleSubmit" class="form">
          <div class="campo">
            <User :size="20" class="input-icon" />
            <input 
              v-model="form.nome" 
              type="text" 
              placeholder="Nome completo" 
              required 
            />
          </div>

          <div class="campo">
            <Mail :size="20" class="input-icon" />
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="E-mail" 
              required 
            />
          </div>

          <div class="campo">
            <Lock :size="20" class="input-icon" />
            <input 
              v-model="form.senha" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Senha" 
              required 
            />
            <button type="button" class="eye-btn" @click="togglePassword">
              <Eye v-if="!showPassword" :size="20" />
              <EyeOff v-else :size="20" />
            </button>
          </div>

          <button type="submit" class="btn-submit">
            Cadastrar
          </button>
        </form>

        <div class="divider">
          <span>ou</span>
        </div>

        <button class="btn-google">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Cadastrar com Google
        </button>

        <footer class="form-footer">
          <p>Já tem uma conta? <a href="#">Entre aqui</a></p>
        </footer>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Variáveis de Cores baseadas na imagem */

.todo {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5e6d3; /* Fundo bege da imagem */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
}

.signup {
  display: flex;
  width: 100%;
  max-width: 600px;
  min-height: 600px;
  background: var(--white);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Lado Visual */
.brand-side {
  flex: 1;
  background-color: #63422b;
  color: #f5e6d3;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.logo-text {
  font-size: 2.5rem;
  margin-bottom: 20px;
}
.logo-text span { font-weight: 300; }

.tagline { font-size: 1.5rem; font-weight: bold; margin-bottom: 15px; }

/* Lado do Formulário */
.lado-marca {
  flex: 1.2;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-marca h1 {
  font-size: 2.2rem;
  color: #2c1a0f;
  margin-bottom: 8px;
}

.info-marca h1 span { color: #63422b; }

.info-marca p {
  color: #8a7b6f;
  margin-bottom: 32px;
}

/* Inputs */
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.campo {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #8a7b6f;
}

input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 1.5px solid #e8e1da;
  border-radius: 12px;
  font-size: 1rem;
  background-color: #faf9f7;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #63422b;
  background-color: #fff;
}

.eye-btn {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #8a7b6f;
}

/* Botões */
.btn-submit {
  margin-top: 10px;
  padding: 16px;
  background-color: #63422b;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-submit:hover {
  background-color: #4a3120;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
  color: #8a7b6f;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e8e1da;
}

.divider span { padding: 0 10px; font-size: 0.9rem; }

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: 1.5px solid #e8e1da;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-google:hover { background-color: #fcfcfc; }
.btn-google img { width: 20px; }

.form-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 0.95rem;
}

.form-footer a {
  color: #63422b;
  text-decoration: none;
  font-weight: bold;
}

/* Responsividade Básica */
@media (max-width: 768px) {
  .brand-side { display: none; }
  .auth-card { max-width: 450px; }
  .lado-marca { padding: 40px 20px; }
}
</style>