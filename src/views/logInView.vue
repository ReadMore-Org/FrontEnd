<script setup>
import { ref } from 'vue';
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const errorMessage = ref('');

const showPassword = ref(false);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const form = ref({
  email: '',
  senha: ''
});

async function handleLogin() {
  loading.value = true;
  errorMessage.value = '';

  try {
    await authStore.login(
      form.value.email,
      form.value.senha
    );

    router.push('/home');
  } catch (err) {
    errorMessage.value =
      err.response?.data?.detail ||
      'Erro ao entrar. Verifique suas credenciais.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="todo">
    <div class="signup">

      <div class="lado-marca">
        <header class="info-marca">
          <h1>Bem-<span>vindo</span></h1>
          <p>Entre para acessar sua biblioteca</p>
        </header>

        <form @submit.prevent="handleLogin" class="form">

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

            <button
              type="button"
              class="eye-btn"
              @click="togglePassword"
            >
              <Eye v-if="!showPassword" :size="20" />
              <EyeOff v-else :size="20" />
            </button>
          </div>

          <button
            type="submit"
            class="btn-submit"
            :disabled="loading"
          >
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>

          <p v-if="errorMessage" class="error">
            {{ errorMessage }}
          </p>

          <p class="esqueceu">
            Esqueceu a senha?
          </p>
        </form>

        <div class="divider">
          <span>ou</span>
        </div>

        <button class="btn-google">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
          />

          Entrar com Google
        </button>

      </div>
    </div>
  </div>
</template>

<style scoped>
.todo {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5e6d3;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
}

.signup {
  display: flex;
  width: 100%;
  max-width: 550px;
  min-height: 600px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.lado-marca {
  flex: 1;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: white;
}

.info-marca h1 {
  font-size: 2.2rem;
  color: #2c1a0f;
  margin-bottom: 8px;
}

.info-marca h1 span {
  color: #63422b;
}

.info-marca p {
  color: #8a7b6f;
  margin-bottom: 32px;
}

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
  padding: 16px 48px 16px 48px;
  border: 1.5px solid #e8e1da;
  border-radius: 12px;
  font-size: 1rem;
  background-color: #faf9f7;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #63422b;
  background-color: white;
}

.eye-btn {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #8a7b6f;
  display: flex;
  align-items: center;
  justify-content: center;
}

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

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #d33;
  font-size: 0.95rem;
  text-align: center;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
  color: #8a7b6f;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e8e1da;
}

.divider span {
  padding: 0 10px;
  font-size: 0.9rem;
}

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

.btn-google:hover {
  background-color: #fcfcfc;
}

.btn-google img {
  width: 20px;
}

p.esqueceu {
  color: #4a3120;
  text-align: center;
  cursor: pointer;
}

@media (max-width: 768px) {
  .lado-marca {
    padding: 40px 20px;
  }

  .info-marca h1 {
    font-size: 1.8rem;
  }

  .info-marca p {
    font-size: 0.95rem;
  }
}
</style>