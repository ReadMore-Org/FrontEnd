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
  <form class="barra-busca" role="search" @submit.prevent="onSubmit">
    <Search :size="19" class="icone-busca" />
    <input
      type="text"
      placeholder="Busque por título, autor ou ISBN..."
      autocomplete="off"
      enterkeyhint="search"
      :value="termoLocal"
      @input="onInput"
    />
    <button type="submit" class="btn-buscar" aria-label="Buscar">
      <Search :size="17" class="icone-btn" />
      <span class="txt-buscar">Buscar</span>
    </button>
  </form>
</template>

<style scoped>
.barra-busca {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e8d8c3;
  border-radius: 16px;
  padding: 6px 6px 6px 18px;
  box-shadow: 0 4px 16px rgba(107, 66, 38, 0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.barra-busca:focus-within {
  border-color: #6b4226;
  box-shadow: 0 4px 16px rgba(107, 66, 38, 0.14);
}

.icone-busca {
  flex-shrink: 0;
  color: #9c8a7a;
}

.barra-busca input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: none;
  outline: none;
  background: none;
  color: #2c2c2c;
  font-size: 15px;
}

.barra-busca input::placeholder {
  color: #9c8a7a;
}

.btn-buscar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  flex-shrink: 0;
  padding: 12px 26px;
  border: none;
  border-radius: 11px;
  background: #6b4226;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-buscar:hover {
  background: #4a2c1a;
}

.icone-btn {
  display: none;
}

@media (max-width: 480px) {
  .barra-busca {
    padding-left: 14px;
    border-radius: 14px;
  }

  .barra-busca input {
    padding: 11px 10px;
    font-size: 16px; /* evita o zoom automático do iOS */
  }

  .btn-buscar {
    padding: 11px 14px;
  }

  .icone-btn {
    display: block;
  }

  .txt-buscar {
    display: none;
  }
}
</style>