<script setup>
import { ref } from "vue";
import { Search } from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "buscar"]);

const termoLocal = ref(props.modelValue);

const onInput = (e) => {
  termoLocal.value = e.target.value;
  emit("update:modelValue", termoLocal.value);
};

const onSubmit = () => {
  emit("buscar", termoLocal.value);
};
</script>

<template>
  <form class="barra-busca" @submit.prevent="onSubmit">
    <Search :size="19" class="icone-busca" />
    <input
      type="text"
      placeholder="Busque por título, autor ou ISBN..."
      :value="termoLocal"
      @input="onInput"
    />
    <button type="submit" class="btn-buscar">
      <Search :size="16" />
      Buscar
    </button>
  </form>
</template>

<style scoped>
.barra-busca {
  display: flex;
  align-items: center;
  gap: 0;
  background: #ffffff;
  border: 1px solid #e8d8c3;
  border-radius: 16px;
  padding: 6px 6px 6px 20px;
  box-shadow: 0 6px 20px rgba(107, 66, 38, 0.08);
}

.icone-busca {
  color: #9c8a7a;
  flex-shrink: 0;
}

.barra-busca input {
  flex: 1;
  border: none;
  outline: none;
  background: none;
  font-size: 15px;
  color: #2c2c2c;
  padding: 12px 14px;
}

.btn-buscar {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #6b4226;
  color: #fff;
  border: none;
  border-radius: 11px;
  padding: 12px 26px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

.btn-buscar:hover {
  background: #4a2c1a;
}
</style>