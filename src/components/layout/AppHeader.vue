<script setup>
</script>

<template>
    <header class="app-header">
        <h1>ReadMore</h1>
        <nav>
            <u>
                <li>Home</li>
                <li>Meus Livros</li>
                <li>Marketplace</li>
            </u>
        </nav>
        <div class="right">
            <button>
                <span>+</span>Adicionar livro
            </button>
            <span class="mdi mdi-bell-badge-outline" id="sino"></span>
            <img src="/public/icons/icon-192x192.png" alt="avatar" class="avatar">
        </div>
    </header>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 3px solid #642db8;
  margin-bottom: 24px;
}

.app-header h1 {
  font-size: 1.4rem;
  color: #654321;
}

nav u {
  display: flex;
  gap: 16px;
  text-decoration: none;
  color: #666;
  font-weight: 500;
  font-size: 1rem;
  list-style: none;
}
.right #sino{
    color: black;
}
</style>