<script setup>
import OnboardingDots from './OnboardingDots.vue'
import OnboardingButtons from './OnboardingButtons.vue'

defineProps({
  slide: {
    type: Object,
    required: true
  },

  current: {
    type: Number,
    required: true
  },

  total: {
    type: Number,
    required: true
  }
})

defineEmits([
  'next',
  'back'
])
</script>

<template>
  <div class="slide-container">
    <div class="content">
      <h1 class="logo">
        ReadMore
      </h1>

      <div class="image-wrapper">
        <img :src="slide.image" :alt="slide.title" class="slide-image" />
      </div>

      <div class="text-content">
        <h2 class="title">
          {{ slide.title }}
        </h2>

        <p class="description">
          {{ slide.description }}
        </p>
      </div>

      <OnboardingDots :current="current" :total="total" />

      <OnboardingButtons :is-first-slide="current === 0" :is-last-slide="current === total - 1" @next="$emit('next')"
        @back="$emit('back')" />
    </div>
  </div>
</template>

<style scoped>
.slide-container {
  flex: 1;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 18px;
}

.content {
  width: 100%;
  max-width: 545px;

  display: flex;
  flex-direction: column;
  align-items: center;

  text-align: center;
}

.logo {
  font-size: 40px;
  font-family: 'inter', sans-serif;
  font-weight: 500;

  color: #5c4033;

  margin-bottom: 32px;
}

.image-wrapper {
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  margin-bottom: 36px;
}

.slide-image {
  width: 100%;
  max-width: 451px;

  object-fit: contain;
}

.text-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.text-content h2{
  font-size: 44px;
  font-weight: 200;
  margin-bottom: 18px;
}

.text-content p.description{
  font-size: 22px;
  color: black;
}

.title {
  font-size: 28px;
  font-weight: 700;

  color: #3f2d22;

  line-height: 1.2;
}

.description {
  font-size: 16px;
  line-height: 1.6;

  color: #6d5b4f;
}

@media (max-width: 480px) {
  .logo {
    font-size: 28px;
  }

  .title {
    font-size: 24px;
  }

  .description {
    font-size: 15px;
  }

  .slide-image {
    max-width: 230px;
  }
}
</style>