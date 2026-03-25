<script setup>
import { BellDot } from 'lucide-vue-next'
import { Plus } from 'lucide-vue-next'
import { MoonStar } from 'lucide-vue-next'
import { ref } from 'vue'


const active = ref('home')
</script>

<template>
    <header class="app-header">
        <div class="left">
        <h1>ReadMore</h1>
        <nav>
            <ul>
                <li :class="{ active: active === 'home' }" @click="active = 'home'">Home</li>
                <!-- <router-link to="/" active-class="active">Home</router-link> -->
                <li :class="{ active: active === 'livros' }" @click="active = 'livros'">Meus Livros</li>
                <li :class="{ active: active === 'market' }" @click="active = 'market'">Marketplace</li>
            </ul>
        </nav>
        </div>
        <div class="right">
            <div class="icones">
                <button id="Mais">
                    <Plus :size="27"/>Adicionar Livro
                </button>
                <button id="Lua">
                    <MoonStar :size="30"/>
                </button>
                <button id="Sino">
                    <BellDot :size="30" />
                </button>
            </div>
            <div class="imagem">
                <img src="/public/imgs/macaco.png" alt="avatar" class="avatar">
                <div class="intro_mobile">
                <h2><span>Bem-vindo de volta</span></h2>
                <h2>Macaco</h2>
                </div>
            </div>
        </div>
    </header>
</template>

<style scoped>
.app-header {
    display: flex;
    justify-content: space-around;
    padding: 16px 0;
    border-bottom: 3px solid #654321;
    margin-bottom: 24px;
    align-items: center;
}

.app-header h1 {
    font-size: 40px;
    color: #654321;
    cursor: pointer;
    font-family: 'inter', sans-serif;
    font-weight: 600;
}

nav ul {
    display: flex;
    gap: 56px;
    text-decoration: none;
    color: #9C8A7A;
    font-weight: 500;
    font-size: 24px;
    list-style: none;
    cursor: pointer;
}

nav ul li.active {
    color: #654321;
}
.left {
    display: flex;
    align-items: center;
    gap: 192px
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
    padding: 15px 36px;
    font-size: 22px;
    cursor: pointer;
}

#Lua {
    display: none;
}

#Sino {
    border: none;
    background: none;
    cursor: pointer;
    color: #6B4226;
}

.icones {
    display: flex;
    align-items: center;
    gap: 45px;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 500px;
    border: solid 2px #654321;
    cursor: pointer;
}

.intro_mobile{
   display: flex;
   flex-direction: column;
   display: none;
}

@media(max-width:650px){
    #Mais{
        display: none;
    }
}
</style>