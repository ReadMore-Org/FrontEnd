<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth';
import OnboardingSlide from '@/components/onboarding/OnboardingSlide.vue'
import router from '@/router'

const currentSlide = ref(0)

const authStore = useAuthStore();

const slides = [
  {
    title: 'Sua biblioteca do seu jeito',
    description:
      'Organize todos os seus livros em um só lugar — físico ou digital.',
    image: '/imgs/onboarding/biblioteca.png'
  },
  {
    title: 'Encontre um livro rápido',
    description:
      'Busque, filtre e acompanhe sua leitura sem complicação.',
    image: '/imgs/onboarding/busca.png'
  },
  {
    title: 'Crie o hábito de ler',
    description:
      'Defina metas, acompanhe seu progresso e nunca perca o ritmo.',
    image: '/imgs/onboarding/habito.png'
  }
]

function nextSlide() {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++
  } else {
    finishOnboarding()
  }
}

function previousSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

function skipOnboarding() {
  finishOnboarding()
}

async function finishOnboarding() {
  try {
    await authStore.updateOnboardingPreference(
      !dontShowAgain.value
    )

    router.push('/home')
  } catch (err) {
    console.error(err)
  }
}

const dontShowAgain = ref(false)
</script>

<template>
  <div class="onboarding-container">
    <div class="top-actions">
      <button class="skip-button" @click="skipOnboarding">
        Pular
      </button>
    </div>

    <transition name="fade" mode="out-in">
      <OnboardingSlide :key="currentSlide" :slide="slides[currentSlide]" :current="currentSlide" :total="slides.length"
        @next="nextSlide" @back="previousSlide" />
    </transition>

    <div class="preferences">
      <label class="checkbox">
        <input type="checkbox" v-model="dontShowAgain" />

        Não mostrar novamente
      </label>
    </div>
  </div>
</template>

<style scoped>
.onboarding-container {
  width: 100%;
  min-height: 100vh;

  background: #f3e7d7;

  display: flex;
  flex-direction: column;

  overflow: hidden;
}

.top-actions {
  width: 100%;

  display: flex;
  justify-content: flex-end;

  padding: 24px;
}

.skip-button {
  border: none;
  background: transparent;
  padding-right: 30px;

  font-size: 20px;
  font-weight: 700;

  color: #7a5c45;

  cursor: pointer;

  transition: opacity 0.2s;
}

.skip-button:hover {
  opacity: 0.7;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.preferences {
  display: flex;
  justify-content: center;

  padding-bottom: 24px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 15px;
  color: #5c4033;
}

@media (max-width: 480px) {
  button.skip-button {
    padding-right: 10px;
  }
}
</style>