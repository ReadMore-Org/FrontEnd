<script setup>
import { computed } from "vue";
import { useLivrosStore } from "@/stores/livros";
import { useAuthStore } from "@/stores/auth";

const livroStore = useLivrosStore();
const authStore = useAuthStore();

// 1. Obtém o total de livros lidos diretamente da store de livros
const lidos = computed(() => livroStore.totalLidos || 0);

// 2. Busca a meta do usuário da authStore ou do localStorage como fallback
const meta = computed(() => {
  const metaUsuario = authStore.user?.meta_leitura;
  if (metaUsuario) return Number(metaUsuario);

  const metaSalva = localStorage.getItem("meta_leitura_anual");
  return metaSalva ? Number(metaSalva) : 30; // 30 é o valor padrão caso nenhuma meta seja configurada
});

// 3. Calcula a porcentagem do progresso (limitada a 100%)
const porcentagem = computed(() => {
  if (!meta.value || meta.value <= 0) return 0;
  const pct = Math.round((lidos.value / meta.value) * 100);
  return Math.min(pct, 100);
});

// 4. Quantidade de livros restantes para a meta
const faltam = computed(() => {
  const restante = meta.value - lidos.value;
  return restante > 0 ? restante : 0;
});
</script>

<template>
  <div class="container">
    <div class="topo">
      <p class="titulo">{{ lidos }}/{{ meta }}</p>
      <p class="porcentagem">{{ porcentagem }}%</p>
    </div>

    <div class="barra">
      <div 
        class="progresso"
        :style="{ width: `${porcentagem}%` }"
      ></div>
    </div>

    <p class="info" v-if="faltam > 0">
      Faltam {{ faltam }} {{ faltam === 1 ? 'livro' : 'livros' }} para sua meta
    </p>
    <p class="info meta-atingida" v-else>
      🎉 Parabéns! Você atingiu sua meta de leitura!
    </p>
  </div>
</template>

<style scoped>
.container {
  border-radius: 12px;
  width: 100%;
}

.topo {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
}

.titulo {
  font-weight: 500;
  color: #2C2C2C;
}

.porcentagem {
  font-weight: bold;
  color: rgba(139, 94, 60, 0.8);
}

.barra {
  width: 100%;
  height: 12px;
  background: rgba(139, 94, 60, 0.2);
  border-radius: 10px;
  overflow: hidden;
}

.progresso {
  height: 100%;
  background: #6B4226;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.info {
  margin-top: 8px;
  font-size: 16px;
  color: #5A4636;
}

.meta-atingida {
  font-weight: 600;
  color: #2e7d32;
}
</style>