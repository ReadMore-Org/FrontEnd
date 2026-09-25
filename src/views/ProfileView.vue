<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { RouterLink } from "vue-router";
import { useLivrosStore } from "@/stores/livros";
import { useAuthStore } from "@/stores/auth";

import { Splide, SplideSlide } from "@splidejs/vue-splide";
import "@splidejs/vue-splide/css";

import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import voltar from "@/components/common/voltar.vue";
import BookCard from "@/components/books/bookCard.vue";

import { Target, Check, Edit2 } from "lucide-vue-next";

const livroStore = useLivrosStore();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const userEmail = computed(() => user.value?.email || "");
const userBio = computed(() => user.value?.bio || "");

// Estado para controle da Meta de Leitura
const editandoMeta = ref(false);
const metaInput = ref(10); // Valor padrão inicial

// Inicializa a meta buscando do usuário ou do localStorage como fallback
const carregarMeta = () => {
  if (user.value?.meta_leitura) {
    metaInput.value = user.value.meta_leitura;
  } else {
    const metaSalva = localStorage.getItem("meta_leitura_anual");
    if (metaSalva) {
      metaInput.value = parseInt(metaSalva, 10);
    }
  }
};

onMounted(() => {
  livroStore.fetchMeusLivros();
  carregarMeta();
});

// Atualiza o input se o usuário for carregado após a montagem
watch(
  () => authStore.user,
  () => carregarMeta(),
  { immediate: true }
);

const salvarMeta = async () => {
  const novaMeta = Number(metaInput.value);
  if (isNaN(novaMeta) || novaMeta < 1) return;

  // Persistência em cache local imediato
  localStorage.setItem("meta_leitura_anual", novaMeta.toString());

  // Tenta salvar via Store/Backend se o método existir
  if (authStore.updateProfile) {
    try {
      await authStore.updateProfile({ meta_leitura: novaMeta });
    } catch (error) {
      console.error("Erro ao salvar meta no backend:", error);
    }
  } else if (authStore.user) {
    // Sincroniza localmente com a store de autenticação
    authStore.user.meta_leitura = novaMeta;
  }

  editandoMeta.value = false;
};

// Helper para extrair o ID do livro com segurança
const getLivroId = (item) => {
  if (!item) return null;
  if (typeof item.livro === "object" && item.livro !== null) {
    return item.livro.id;
  }
  return item.livro || item.id;
};

// Helper para passar o objeto do livro para o BookCard
const getLivroObjeto = (item) => {
  if (!item) return {};
  if (typeof item.livro === "object" && item.livro !== null) {
    return item.livro;
  }
  return item;
};

// Estatísticas reativas diretas da store
const totalLivros = computed(() => livroStore.totalMeusLivros);

// Todos os livros do usuário
const meusLivros = computed(() => livroStore.meusLivros);

const userPhoto = computed(() => {
  const url = authStore.user?.foto?.url;

  if (url) {
    return url.startsWith("http")
      ? url
      : `${import.meta.env.VITE_BACKEND_URL}${url}`;
  }

  if (authStore.user?.google_picture) {
    return authStore.user.google_picture;
  }

  return "/imgs/avatar.jpeg";
});

const splideOptions = {
  perPage: 3,
  gap: "20px",
  breakpoints: {
    1024: { perPage: 2 },
    640: { perPage: 1, gap: "15px" },
  },
  arrows: true,
  pagination: false,
  drag: "free",
};
</script>

<template>
  <voltar />
  <AppHeader class="header-principal" />

  <div id="me">
    <div class="topo-perfil">
      <div class="info">
        <div class="img">
          <img
            :src="userPhoto"
            alt="avatar"
            class="avatar"
            @error="($event) => ($event.target.src = '/imgs/avatar.jpeg')"
          />
        </div>

        <div class="menu-info">
          <strong>{{ authStore.user?.name || 'Usuário' }}</strong>
          <p>{{ userEmail }}</p>
          <p v-if="userBio" class="user-bio">{{ userBio }}</p>
        </div>
      </div>

      <button class="btn-editar" @click="$router.push('/profile/edit')">
        Editar perfil
      </button>
    </div>

    <!-- Bloco de Gerenciamento da Meta de Leitura -->
    <div class="card-meta-perfil">
      <div class="meta-header">
        <div class="meta-titulo">
          <Target :size="20" color="#6b4226" />
          <span>Meta de Leitura do Ano</span>
        </div>

        <button 
          v-if="!editandoMeta" 
          class="btn-icon-meta" 
          @click="editandoMeta = true"
          title="Editar meta"
        >
          <Edit2 :size="16" />
        </button>
      </div>

      <div class="meta-body">
        <template v-if="!editandoMeta">
          <p class="meta-valor">
            Sua meta atual é ler <strong>{{ metaInput }}</strong> {{ metaInput === 1 ? 'livro' : 'livros' }}.
          </p>
        </template>

        <template v-else>
          <form @submit.prevent="salvarMeta" class="form-meta">
            <label for="metaInput">Defina o total de livros:</label>
            <div class="input-container">
              <input
                id="metaInput"
                type="number"
                v-model.number="metaInput"
                min="1"
                max="999"
                required
              />
              <button type="submit" class="btn-salvar-meta">
                <Check :size="16" />
                Salvar
              </button>
            </div>
          </form>
        </template>
      </div>
    </div>
  </div>

  <div id="livros">
    <!-- Seção Única: Livros Salvos -->
    <div class="secao-livros" v-if="meusLivros.length">
      <h1 class="titulo-secao">Livros Salvos</h1>
      <div class="lista-livros">
        <Splide :options="splideOptions">
          <SplideSlide v-for="item in meusLivros" :key="item.id">
            <RouterLink :to="`/livro/${getLivroId(item)}`">
              <BookCard :livro="getLivroObjeto(item)" />
            </RouterLink>
          </SplideSlide>
        </Splide>
      </div>
    </div>

    <!-- Estado Vazio -->
    <div v-else class="sem-livros">
      <p>Você ainda não adicionou nenhum livro à sua estante.</p>
    </div>
  </div>

  <AppFooter />
</template>

<style scoped>
#me {
  background: #f3e7d7;
  padding: 40px 60px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.topo-perfil {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  border: 2px solid #7b5638;
  object-fit: cover;
  cursor: pointer;
}

.menu-info {
  display: flex;
  flex-direction: column;
}

.menu-info strong {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2d2d2d;
}

.menu-info p {
  color: #666;
  margin: 4px 0 0;
}

.btn-editar {
  padding: 12px 24px;
  border: 1px solid #7b5638;
  border-radius: 12px;
  background: white;
  color: #7b5638;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-editar:hover {
  background: #faf7f4;
  transform: translateY(-1px);
}

/* Card Meta de Leitura */
.card-meta-perfil {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e8d8c3;
  max-width: 500px;
}

.meta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.meta-titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2d2d2d;
  font-size: 1.05rem;
}

.btn-icon-meta {
  background: none;
  border: none;
  color: #7b5638;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-icon-meta:hover {
  background: #f3e7d7;
}

.meta-valor {
  color: #5a4636;
  margin: 0;
  font-size: 0.95rem;
}

.meta-valor strong {
  color: #6b4226;
  font-size: 1.1rem;
}

.form-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-meta label {
  font-size: 0.85rem;
  color: #666;
}

.input-container {
  display: flex;
  gap: 10px;
}

.input-container input {
  width: 100px;
  padding: 8px 12px;
  border: 1px solid #e8d8c3;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
}

.input-container input:focus {
  border-color: #6b4226;
}

.btn-salvar-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #6b4226;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-salvar-meta:hover {
  background: #52321c;
}

#livros {
  padding: 50px 60px;
}

.secao-livros {
  margin-bottom: 50px;
}

.titulo-secao {
  position: relative;
  display: inline-block;
  margin-bottom: 25px;
  font-size: 1.8rem;
  font-weight: 500;
  color: #2d2d2d;
}

.titulo-secao::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 50%;
  height: 3px;
  background: #6b4226;
  border-radius: 999px;
}

.sem-livros {
  text-align: center;
  padding: 40px;
  color: #8a6a52;
  font-size: 1.1rem;
}

.lista-livros {
  width: 100%;
}

:deep(.splide__track) {
  padding: 10px 0;
}

:deep(.splide__arrow) {
  background: #f3e7d7;
  opacity: 1;
}

:deep(.splide__arrow svg) {
  fill: #6b4226;
}

.splide__slide {
  transition: transform 0.25s ease;
}

.splide__slide:hover {
  transform: translateY(-4px);
}

.menu-info .user-bio {
  color: #4a4a4a;
  font-size: 0.95rem;
  margin-top: 8px;
  line-height: 1.4;
  max-width: 500px;
  word-break: break-word;
}

@media (max-width: 768px) {
  .header-principal {
    display: none !important;
  }
  #me {
    padding: 25px 20px;
  }

  #livros {
    padding: 30px 20px;
  }

  .topo-perfil {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .info {
    width: 100%;
    align-items: center;
  }

  .avatar {
    width: 70px;
    height: 70px;
  }

  .menu-info strong {
    font-size: 1.4rem;
  }

  .btn-editar {
    width: 100%;
  }

  .titulo-secao {
    font-size: 1.5rem;
  }

  .splide__slide:hover {
    transform: none;
  }

  .card-meta-perfil {
    max-width: 100%;
  }
}
</style>