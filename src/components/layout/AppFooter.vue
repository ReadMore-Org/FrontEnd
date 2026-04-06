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
        <ul id="contato">
            <li>
            <h1>Contato</h1> 
            <p><Mail />readmore@yahoo.com </p>
            <p><Phone />+55 47 4002-8922</p>
            <p><MapPin />Joinville, Brasil</p>
            </li>
        </ul>
        <ul id="social">
            <li>
            <h1>Social</h1>
            <p><a href="github.com"><img src="/public/imgs/social/github.png" alt="github"></a></p>
            <p><a href="linkedin.com"><img src="/public/imgs/social/linkedin.png" alt="linkedin"></a></p>
            <p><a href="instagram.com"><img src="/public/imgs/social/instagram.png" alt="instagram"></a></p>
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
        <nav id="mobile">
            <ul>
                <li :class="{ active: active === 'home' }" @click="active = 'home'">
                    <House :size="25"/>
                </li>

                <li :class="{ active: active === 'estante' }" @click="active = 'estante'">
                    <Book :size="25"/>
                </li>


                <li>
                    <span id="Mais">
                        <Plus :size="38"/>
                    </span>
                </li>


                <li :class="{ active: active === 'marketplace' }" @click="active = 'marketplace'">
                    <Store :size="25"/>
                </li>


                <li :class="{ active: active === 'perfil' }" @click="active = 'perfil'">
                    <User :size="25"/>
                </li>

            </ul>
        </nav>
    </footer>
</template>


<style scoped>
footer {
    position: fixed;
    bottom: 0;
    width: 100%;

    background-image: 
        linear-gradient(rgba(92, 51, 23, 0.85), rgba(92, 51, 23, 0.85)),
        url('/caminho-da-sua-imagem.jpg');

    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    color: white;
}

#main {
    padding: 55px 274px 226px 80px;
    display: flex;
    gap: 79px;
}

ul{
    list-style: none;
}
a {
    color: black;
}
#mobile {
    display: none;
}

@media(max-width:650px) {
footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: white;
}

ul {
    padding: 40px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 47px;
    list-style: none;
}

li {
    gap: 20px;
    cursor: pointer;
    color: #9C8A7A;
}

#Mais {
    background-color: #6B4226;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    border-radius: 50%;
    color: white;
}

}
</style>