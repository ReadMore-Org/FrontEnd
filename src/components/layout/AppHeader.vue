<script setup>
import { BellDot } from "lucide-vue-next";
import { Plus } from "lucide-vue-next";
import { MoonStar } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const isHome = computed(() => route.path === "/home");
const isLivros = computed(() => route.path === "/meus-livros");
const isMarketplace = computed(() => route.path === "/marketplace");

const menuAberto = ref(false);

const userEmail = computed(() => user.value?.email || "");

const userPhoto = computed(() => {
  console.count("userPhoto");

  return authStore.user?.foto?.url
    ? `http://127.0.0.1:8000${authStore.user.foto.url}`
    : "/imgs/avatar.jpeg";
});

function handleLogout() {
  authStore.logout();
}

const active = ref("home");

console.log(authStore.user);
console.log(authStore.user?.google_picture);
console.log(userPhoto.value);
console.count("AppHeader");
</script>

<template>
  <header class="app-header">
    <div class="left">
      <h1 @click="router.push('/home')">ReadMore</h1>
      <nav>
        <ul>
          <li :class="{ active: isHome }">
            <RouterLink to="/home">Home</RouterLink>
          </li>

          <li :class="{ active: isLivros }">
            <RouterLink to="/meus-livros">Meus Livros</RouterLink>
          </li>

          <li :class="{ active: isMarketplace }">
            <RouterLink to="/marketplace">Marketplace</RouterLink>
          </li>
        </ul>
      </nav>
    </div>
    <div class="deslogado" v-if="!authStore.isAuthenticated">
      <div class="intro_deslogado">
        <h1>Seja bem-vindo</h1>
        <h2>Organize seus livros e acompanhe sua leitura</h2>
      </div>

      <div class="botoes">
        <RouterLink to="/">
          <button id="entrar">Entrar</button>
        </RouterLink>

        <RouterLink to="/signup">
          <button id="criar">Criar conta</button>
        </RouterLink>
      </div>
    </div>
    <div class="right" v-if="authStore.isAuthenticated">
      <div class="icones">
        <RouterLink to="/adicionar">
          <button id="Mais"><Plus :size="24" />Adicionar Livro</button>
        </RouterLink>
        <button id="Sino">
          <BellDot :size="24" />
        </button>
      </div>

      <div class="imagem">
        <img
          :src="userPhoto"
          alt="avatar"
          class="avatar"
          @click="menuAberto = !menuAberto"
          @load="console.log('imagem carregada')"
          @error="console.log('imagem falhou')"
        />

        <div v-if="menuAberto" class="menu-usuario">
          <div class="menu-header">
            <img :src="userPhoto" alt="avatar" class="menu-avatar" />

            <div class="menu-info">
              <strong>{{ authStore.user?.name }}</strong>
              <p>{{ userEmail }}</p>
            </div>
          </div>

          <button @click="handleLogout">Sair</button>
          <button @click="router.push('/profile')">Perfil</button>
        </div>
        <div class="intro_mobile">
          <p>Bem-vindo,</p>
          <h2>{{ authStore.user?.email }}</h2>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
button a {
  text-decoration: none;
  color: #654321;
}
.app-header {
  display: flex;
  justify-content: space-around;
  background-color: white;
  margin: 0;
  width: 100% !important;
  padding: 16px 0;
  align-items: center;
}

.app-header h1 {
  font-size: 30px;
  color: #654321;
  cursor: pointer;
  font-family: "inter", sans-serif;
  font-weight: 600;
}

nav ul {
  display: flex;
  gap: 56px;
  text-decoration: none;
  color: #9c8a7a;
  font-weight: 500;
  font-size: 17px;
  list-style: none;
  cursor: pointer;
}

nav ul li a {
  text-decoration: none;
  color: #9c8a7a;
}

nav ul li.active a {
  color: #654321;
}

.left {
  display: flex;
  align-items: center;
  gap: 192px;
}

.right {
  display: flex;
  align-items: center;
  gap: 45px;
}

button {
  display: flex;
  align-items: center;
  gap: 10px;
}

#Mais {
  background: #654321;
  border: none;
  color: white;
  border-radius: 65px;
  padding: 8px 17px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
}

#Lua {
  display: none;
}

#Sino {
  border: none;
  background: none;
  cursor: pointer;
  color: #6b4226;
}

.icones {
  display: flex;
  align-items: center;
  gap: 45px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 500px;
  border: solid 2px #654321;
  cursor: pointer;
}

.imagem {
  position: relative;
  display: flex;
  align-items: center;
  gap: 13px;
}

.menu-usuario {
  position: absolute;

  top: 65px;
  left: 25px;

  transform: translateX(-50%);

  background: white;

  border-radius: 15px;

  min-width: 140px;

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  z-index: 100;
}

.menu-usuario button {
  text-decoration: none;
  width: 100%;

  padding: 12px 16px;

  border: 1px solid #e8d8c3;

  background: #f5e6d3;

  cursor: pointer;

  color: #654321;
  font-size: 15px;
  font-weight: 600;

  justify-content: center;

  transition: all 0.2s ease;
}
.menu-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 5 00;

  padding: 12px 16px;

  text-decoration: none;

  background: #f5e6d3;
  color: #654321;

  border: 1px solid #e8d8c3;
}

.menu-usuario button:hover {
  background: #e8d8c3;
}

.menu-header {
  display: none;
}

.menu-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
}

.menu-info {
  display: flex;
  flex-direction: column;
}

.menu-info p {
  margin: 0;
}

.intro_mobile {
  display: none;
  flex-direction: column;
}

.intro_mobile p {
  display: none;

  max-width: 140px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.intro_mobile span {
  display: none;
}

.intro_mobile h2 {
  font-weight: 100;
  font-size: 20px;
}

.deslogado {
  display: flex;
  gap: 30px;
}

.deslogado .intro_deslogado {
  display: none;
}

.deslogado .botoes {
  display: flex;
  gap: 30px;
}

.deslogado button {
  background: none;
  border: none;
  font-size: 16px;
  padding: 10px 36px;
  font-family: "inter", sans-serif;
  cursor: pointer;
}

.deslogado #entrar {
  color: #6b4226;
  border: 2px #e8d8c3 solid;
  border-radius: 8px;
  cursor: pointer;
}

.deslogado #criar {
  color: white;
  background: #6b4226;
  border-radius: 6px;
}

@media (max-width: 650px) {
  .left {
    gap: 0;
  }

  #Mais,
  .app-header h1,
  nav ul {
    display: none;
  }

  .intro_mobile {
    display: flex;
    line-height: 18px;
    font-family: "inter", sans-serif;
    gap: 5px;
  }

  .intro_mobile p {
    display: inline;
  }

  .intro_mobile span {
    display: inline;
  }

  .intro_mobile h2 {
    display: flex;
    line-height: 18px;
    font-family: "inter", sans-serif;
    min-width: 120px;
  }

  .app-header {
    display: flex;
    background: #f5e6d3;
    border: none;
    margin: 0;
    padding: 20px 25px;
  }

  .right {
    width: 100%;
    justify-content: space-between;
    flex-direction: row-reverse;
  }

  .imagem {
    display: flex;
    align-items: center;
    text-align: left;
    gap: 16px;
  }

  div.imagem img.avatar {
    width: 50px;
    height: 50px !important;
    border-radius: 1000px;
    border: solid 2px #654321;
    cursor: pointer;
  }

  .icones {
    gap: 10px;
  }

  #Sino {
    color: #5a4636;
    background-color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    border: none;
    cursor: pointer;
  }

  .intro_mobile h2 {
    font-size: 13px;
  }

  .intro_mobile h2 span {
    color: #5a4636;
    font-size: 12px;
  }

  .deslogado {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 16px;

    padding: 0;
  }

  .deslogado .intro_deslogado {
    display: flex;
    flex-direction: column;

    flex: 1;

    gap: 4px;

    text-align: left;
  }

  .deslogado .intro_deslogado h1 {
    font-size: 15px;
    font-weight: 600;

    color: #654321;

    margin: 0;
  }

  .deslogado .intro_deslogado h2 {
    font-size: 12px;
    font-weight: 400;

    color: #7a6a5c;

    margin: 0;

    display: block;
  }

  .deslogado .botoes {
    display: flex;

    gap: 8px;

    flex-shrink: 0;
  }

  .deslogado .botoes button {
    padding: 10px 16px;

    font-size: 13px;

    border-radius: 10px;

    white-space: nowrap;
  }

  .deslogado .botoes #entrar {
    background: white;

    border: 1px solid #e8d8c3;

    color: #654321;
  }

  .deslogado .botoes #criar {
    background: #654321;

    color: white;
  }

  .menu-usuario {
    position: fixed;

    top: 85px;
    left: 50%;

    transform: translateX(-50%);

    width: calc(100vw - 32px);
    max-width: 350px;

    background: white;

    border-radius: 16px;

    padding: 16px;

    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

    z-index: 999;
  }

  .menu-header {
    display: flex;

    align-items: center;

    gap: 14px;

    padding-bottom: 14px;

    border-bottom: 1px solid #eee;
  }

  .menu-avatar {
    width: 56px;
    height: 56px;

    border-radius: 50%;

    border: 2px solid #654321;
  }

  .menu-info {
    display: flex;
    flex-direction: column;

    gap: 2px;

    min-width: 0;
  }

  .menu-info strong {
    font-size: 15px;
    color: #654321;
  }

  .menu-info p {
    margin: 0;

    font-size: 12px;

    color: #777;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .menu-usuario button {
    width: 100%;

    height: 48px;

    border: none;

    border-radius: 12px;

    background: #f5e6d3;

    color: #654321;

    font-size: 14px;
    font-weight: 600;

    display: flex;
    align-items: center;
    justify-content: center;

    cursor: pointer;

    transition: 0.2s;
  }

  .menu-usuario button:hover {
    background: #e8d8c3;
  }

  .menu-usuario button:last-child {
    background: #654321;
    color: white;
  }

  .menu-usuario button:last-child a {
    color: white;
    text-decoration: none;
  }
}
</style>
