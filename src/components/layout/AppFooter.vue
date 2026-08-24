<script setup>
import { House, Book, Plus, Store, User, Mail, Phone, MapPin } from "lucide-vue-next";
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();

// Função para verificar se o item está ativo de acordo com a rota atual
const isActive = (path) => {
  if (path === '/home') {
    return route.path === '/home' || route.path === '/';
  }
  return route.path.startsWith(path);
};
</script>

<template>
  <footer>
    <div id="main">
      <ul id="sobre">
        <li>
          <h1>READMORE</h1>
          <p>A plataforma criada para acompanhar sua jornada de leitura</p>
          <small>© 2026 READMORE. Todos os direitos reservados.</small>
        </li>
      </ul>
      <div id="outros">
        <ul id="contato">
          <li>
            <h1>Contato</h1>
            <p><Mail :size="24" />readmore@yahoo.com</p>
            <p><Phone :size="24" />+55 47 4002-8922</p>
            <p><MapPin :size="24" />Joinville, Brasil</p>
          </li>
        </ul>
        <ul id="social">
          <li>
            <h1>Social</h1>

            <div class="icons">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <img src="/imgs/social/github.png" alt="github" />
              </a>

              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <img src="/imgs/social/linkedin.png" alt="linkedin" />
              </a>

              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <img src="/imgs/social/instagram.png" alt="instagram" />
              </a>
            </div>
          </li>
        </ul>
        <ul id="navegacao">
          <li>
            <h1>Navegação</h1>
            <p @click="$router.push('/home')">Home</p>
            <p @click="$router.push('/meus-livros')">Estante</p>
            <p @click="$router.push('/marketplace')">Marketplace</p>
            <p @click="$router.push('/profile')">Perfil</p>
          </li>
        </ul>
      </div>
    </div>

    <!-- MENU MOBILE -->
    <nav id="mobile">
      <ul>
        <li>
          <RouterLink to="/home" :class="{ active: isActive('/home') }">
            <House :size="25" />
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/meus-livros" :class="{ active: isActive('/meus-livros') }">
            <Book :size="25" />
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/adicionar" id="Mais">
            <Plus :size="38" />
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/marketplace" :class="{ active: isActive('/marketplace') }">
            <Store :size="25" />
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/profile" :class="{ active: isActive('/profile') }">
            <User :size="25" />
          </RouterLink>
        </li>
      </ul>
    </nav>
  </footer>
</template>

<style scoped>
footer {
  margin-top: 100px;
  bottom: 0;
  width: 100%;
  color: white;

  background-image: linear-gradient(rgba(92, 51, 23, 0.85), rgba(92, 51, 23, 0.85)),
    url("/imgs/background.png");

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

#main {
  display: flex;
  align-items: flex-start;
  padding: 55px 274px 100px 80px;
}

#outros {
  display: flex;
  margin-left: 79px;
  gap: 110px;
}

#sobre li h1 {
  font-size: 50px;
  margin: 0;
}

#sobre li p {
  font-size: 18px;
  margin-bottom: 83px;
  width: 90%;
  font-weight: 500;
}

#sobre li small {
  font-size: 13px;
  font-weight: bold;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

ul li h1 {
  margin-bottom: 25px;
}

#contato p {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  margin-bottom: 28px;
}

.icons {
  display: flex;
  gap: 15px;
}

.icons img {
  width: 20px;
}

#navegacao {
  cursor: pointer;
}

#navegacao li p {
  margin-bottom: 17px;
  font-size: 16px;
}

#mobile {
  display: none;
}

@media (max-width: 650px) {
  footer {
    background: white;
    color: #9c8a7a;

    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
  }

  #main {
    display: none;
  }

  #mobile {
    display: block;
  }

  #mobile ul {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 47px;
    padding: 15px 0;
  }

  #mobile a {
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  #mobile a.active {
    color: #6b4226;
  }

  #Mais {
    background-color: #6b4226;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 50%;
    color: white !important;
  }
}
</style>