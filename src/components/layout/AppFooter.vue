<script setup>
import { House } from 'lucide-vue-next'
import { Book } from 'lucide-vue-next'
import { Plus } from 'lucide-vue-next'
import { Store } from 'lucide-vue-next'
import { User } from 'lucide-vue-next'

import { Mail } from 'lucide-vue-next'
import { Phone } from 'lucide-vue-next'
import { MapPin } from 'lucide-vue-next'


import { ref } from 'vue'

const active = ref('home')
</script>

<template>
    <footer>
        <div id="main">
            <ul id="sobre">
                <li>
                    <h1>READMORE</h1>
                    <p>A plataforma criada para acompanhar sua jornada de leitura</p>
                    <small>© 2026 READMORE. Todos os direitos reservados</small>
                </li>
            </ul>
            <div id="outros">
                <ul id="contato">
                    <li>
                        <h1>Contato</h1>
                        <p>
                            <Mail :size="24" />readmore@yahoo.com
                        </p>
                        <p>
                            <Phone :size="24" />+55 47 4002-8922
                        </p>
                        <p>
                            <MapPin :size="24" />Joinville, Brasil
                        </p>
                    </li>
                </ul>
                <ul id="social">
                    <li>
                        <h1>Social</h1>

                        <div class="icons">
                            <a href="https://github.com">
                                <img src="/imgs/social/github.png" alt="github">
                            </a>

                            <a href="https://linkedin.com">
                                <img src="/imgs/social/linkedin.png" alt="linkedin">
                            </a>

                            <a href="https://instagram.com">
                                <img src="/imgs/social/instagram.png" alt="instagram">
                            </a>
                        </div>

                    </li>
                </ul>
                <ul id="navegacao">
                    <li>
                        <h1>Navegação</h1>
                        <p><a href="home"></a>Home</p>
                        <p><a href="estante"></a>Estante</p>
                        <p><a href="marketplace"></a>Marketplace</p>
                        <p><a href="perfil"></a>Perfil</p>
                    </li>
                </ul>
            </div>
        </div>
        <nav id="mobile">
            <ul>
                <li :class="{ active: active === 'home' }" @click="active = 'home'">
                    <House :size="25" />
                </li>

                <li :class="{ active: active === 'estante' }" @click="active = 'estante'">
                    <Book :size="25" />
                </li>


                <li>
                    <span id="Mais">
                        <Plus :size="38" />
                    </span>
                </li>


                <li :class="{ active: active === 'marketplace' }" @click="active = 'marketplace'">
                    <Store :size="25" />
                </li>


                <li :class="{ active: active === 'perfil' }" @click="active = 'perfil'">
                    <User :size="25" />
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

    background-image:
        linear-gradient(rgba(92, 51, 23, 0.85), rgba(92, 51, 23, 0.85)),
        url('/imgs/background.png');

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
        color: #9C8A7A;

        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        z-index: 1000;
    }

    /* evita o conteúdo ficar escondido atrás do footer */
    body {
        padding-bottom: 80px; /* ajusta conforme a altura do footer */
    }

    /* Esconde desktop */
    #main {
        display: none;
    }

    /* Mostra mobile */
    #mobile {
        display: block;
    }

    #mobile ul {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 47px;
        padding: 20px 0;
    }

    #mobile li {
        cursor: pointer;
    }

    #Mais {
        background-color: #6B4226;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px;
        border-radius: 50%;
        color: white;
    }
}
</style>