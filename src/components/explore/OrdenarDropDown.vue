<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { ChevronDown, Check } from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: String,
    default: "relevance",
  },
});

const emit = defineEmits(["update:modelValue"]);

const opcoes = [
  { label: "Relevância", value: "relevance" },
  { label: "Mais recentes", value: "newest" },
];

const aberto = ref(false);
const raiz = ref(null);

const labelAtual = () =>
  opcoes.find((o) => o.value === props.modelValue)?.label ?? "Relevância";

function selecionar(valor) {
  emit("update:modelValue", valor);
  aberto.value = false;
}

function aoClicarFora(e) {
  if (raiz.value && !raiz.value.contains(e.target)) {
    aberto.value = false;
  }
}

onMounted(() => document.addEventListener("click", aoClicarFora));
onBeforeUnmount(() => document.removeEventListener("click", aoClicarFora));
</script>

<template>
  <div class="ordenar-dropdown" ref="raiz">
    <button class="ordenar-btn" @click="aberto = !aberto">
      {{ labelAtual() }}
      <ChevronDown :size="14" :class="{ girado: aberto }" />
    </button>

    <div v-if="aberto" class="ordenar-menu">
      <button
        v-for="o in opcoes"
        :key="o.value"
        class="ordenar-item"
        @click="selecionar(o.value)"
      >
        <span>{{ o.label }}</span>
        <Check v-if="o.value === modelValue" :size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.ordenar-dropdown {
  position: relative;
}

.ordenar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #5a4636;
  background: #ffffff;
  border: 1px solid #e8d8c3;
  border-radius: 8px;
  padding: 7px 12px;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.ordenar-btn:hover {
  border-color: #6b4226;
}

.ordenar-btn svg.girado {
  transform: rotate(180deg);
}

.ordenar-btn svg {
  transition: transform 0.15s ease;
}

.ordenar-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #ffffff;
  border: 1px solid #e8d8c3;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(107, 66, 38, 0.15);
  min-width: 150px;
  z-index: 10;
  overflow: hidden;
}

.ordenar-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: none;
  border: none;
  padding: 9px 14px;
  font-size: 12.5px;
  color: #5a4636;
  cursor: pointer;
  text-align: left;
}

.ordenar-item:hover {
  background: #faf3e0;
}

.ordenar-item svg {
  color: #6b4226;
}
</style>