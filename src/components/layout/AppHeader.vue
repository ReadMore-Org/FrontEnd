<script setup>
import { BellDot} from 'lucide-vue-next'
import { Plus } from 'lucide-vue-next'
import { MoonStar } from 'lucide-vue-next'
import { ref } from 'vue'


const active = ref('home')

const logado = ref(true)
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
        <div class="deslogado" v-if="!logado">
            <div class="intro_deslogado">
                <h1>Seja bem-vindo</h1>
                <h2>Organize seus livros e acompanhe sua leitura</h2>
            </div>
            <div class="botoes">
                <button id="entrar">
                    Entrar
                </button>
                <button id="criar">
                    Criar conta
                </button>
            </div>
        </div>
        <div class="right" v-if="logado">
            <div class="icones">
                <button id="Mais">
                    <Plus :size="27" />Adicionar Livro
                </button>
                <button id="Lua">
                    <MoonStar :size="30" />
                </button>
                <button id="Sino">
                    <BellDot :size="28" />
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
    background-color: white;
    margin: 0;
    width: 100% !important;
    padding: 16px 0;
    margin-bottom: 24px;
    align-items: center;
    margin-bottom: 60px;
}

.app-header h1 {
    font-size: 30px;
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
    font-size: 20px;
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
    padding: 12px 33px;
    font-size: 18px;
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
    width: 60px;
    height: 60px;
    border-radius: 500px;
    border: solid 2px #654321;
    cursor: pointer;
}

.intro_mobile {
    display: flex;
    flex-direction: column;
    display: none;
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
    font-size: 24px;
    padding: 12px 38px;
    font-family: 'inter', sans-serif;
    cursor: pointer;
}

.deslogado #entrar {
    color: #6B4226;
    border: 2px #E8D8C3 solid;
    border-radius: 8px;
    cursor: pointer;
}

.deslogado #criar {
    color: white;
    background: #6B4226;
    border-radius: 6px;
}

@media(max-width:650px) {
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
        flex-direction: column;
        line-height: 18px;
        font-family: 'inter', sans-serif;
    }

    .app-header {
        display: flex;
        background: #F5E6D3;
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

    .avatar {
        width: 50px;
        height: 50px;
        border-radius: 500px;
        border: solid 2px #654321;
        cursor: pointer;
    }

    .icones {
        gap: 10px;
    }

    #Lua,
    #Sino {
        color: #5A4636;
        background-color: white;
        border-radius: 50%;
        width: 45px;
        height: 45px;
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
        color: #5A4636;
        font-size: 12px;
    }

    .deslogado {
        display: flex;
        flex-direction: column;
        padding: 40px;
    }

    .deslogado button {
        background: none;
        border: none;
        font-size: 12px;
        padding: 12px 38px;
        font-family: 'inter', sans-serif;
    }

    .deslogado .intro_deslogado {
        display: flex;
        flex-direction: column;
        text-align: left;
        gap: 6px;
    }

    .deslogado .intro_deslogado h1 {
        display: flex;
        font-size: 16px;
        font-weight: 500;
        cursor: auto;
    }

    .deslogado .intro_deslogado h2 {
        display: contents;
        flex-wrap: wrap;
        font-size: 16px;
        font-weight: 500;
    }

    .deslogado .botoes {
        display: flex;
        justify-content: space-between;
        margin: 0;
    }

    .deslogado .botoes #entrar {
        font-size: 16px;
        padding: 15px 40px;
        background-color: white;
        border: none;
    }

    .deslogado .botoes #criar {
        font-size: 16px;
        padding: 15px 40px;
        white-space: nowrap;
    }
}
</style>