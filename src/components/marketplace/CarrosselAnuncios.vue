<script setup>
import { Splide, SplideSlide } from "@splidejs/vue-splide";
import "@splidejs/vue-splide/css";
import AnuncioCard from "@/components/marketplace/AnuncioCard.vue";

defineProps({
  titulo: {
    type: String,
    required: true,
  },
  anuncios: {
    type: Array,
    required: true,
  },
});

const opcoes = {
  perPage: 5,
  perMove: 2,
  gap: "1.25rem",
  pagination: false,
  rewind: false,
  breakpoints: {
    1200: { perPage: 4 },
    900: { perPage: 3 },
    650: { perPage: 2, perMove: 1, gap: "0.75rem", arrows: false },
  },
};
</script>

<template>
  <section v-if="anuncios.length" class="carrossel">
    <h2 class="titulo-secao">{{ titulo }}</h2>

    <Splide :options="opcoes" :aria-label="titulo">
      <SplideSlide v-for="anuncio in anuncios" :key="anuncio.id">
        <AnuncioCard :anuncio="anuncio" />
      </SplideSlide>
    </Splide>
  </section>
</template>

<style scoped>
.carrossel {
  margin-bottom: 48px;
}

.titulo-secao {
  position: relative;
  display: inline-block;
  padding-bottom: 5px;
  color: #2c2c2c;
  font-weight: 500;
  margin: 0 0 24px 0;
  font-size: 25px;
}

.titulo-secao::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50%;
  height: 4px;
  border-radius: 50px;
  background: #6b4226;
}

/* Setas no padrão marrom do site */
.carrossel :deep(.splide__arrow) {
  width: 2.2rem;
  height: 2.2rem;
  background: #ffffff;
  border: 1px solid #e8d8c3;
  box-shadow: 0 2px 8px rgba(107, 66, 38, 0.15);
  opacity: 1;
  transition: background-color 0.2s ease;
}

.carrossel :deep(.splide__arrow svg) {
  fill: #6b4226;
  width: 1rem;
  height: 1rem;
  transition: fill 0.2s ease;
}

.carrossel :deep(.splide__arrow:hover:not(:disabled)) {
  background: #6b4226;
}

.carrossel :deep(.splide__arrow:hover:not(:disabled) svg) {
  fill: #ffffff;
}

.carrossel :deep(.splide__arrow:disabled) {
  opacity: 0;
  pointer-events: none;
}

/* Espaço para a sombra/hover do card não ser cortada pelo track */
.carrossel :deep(.splide__slide) {
  padding: 6px 2px 12px;
  box-sizing: border-box;
}

@media (max-width: 650px) {
  .carrossel {
    margin-bottom: 36px;
  }

  .titulo-secao {
    font-size: 20px;
    margin-bottom: 18px;
  }
}
</style>