<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: String,
});

const emit = defineEmits(["update:modelValue"]);

const statusOpcoes = ["quero-ler", "lendo", "lido"];

const status = ref(props.modelValue || "quero-ler");

watch(status, (novo) => {
  emit("update:modelValue", novo);
});
</script>

<template>
  <div class="secao-status">
    <p class="label-status">Status</p>

    <div class="botoes-status">
      <button
        v-for="st in statusOpcoes"
        :key="st"
        @click="status = st"
        class="btn-status"
        :class="{ ativo: status === st }"
      >
        <span v-if="status === st">✔</span>
        {{
          st === "quero-ler"
            ? "Quero ler"
            : st === "lendo"
            ? "Lendo"
            : "Lido"
        }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.secao-status {
  margin-top: 15px;
}

.label-status {
  font-size: 14px;
  margin-bottom: 6px;
  color: #2c2c2c;
}

.botoes-status {
  display: flex;
  gap: 10px;
}

.btn-status {
  padding: 8px 18px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #eee;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-status.ativo {
  background-color: #6b4226; /* marrom da imagem */
  color: white;
  border: none;
}
</style>