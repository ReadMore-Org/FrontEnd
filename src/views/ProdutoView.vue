
<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useLivrosStore } from '@/stores/livros'
  
  const route = useRoute()
  const livroStore = useLivrosStore()
  const id = Number(route.params.id)
  
  const status = ref('quero-ler')
  const statusOpcoes = ['quero-ler', 'lendo', 'lido']
  
  const livro = computed(() => {
    return livroStore.livros.find(livro => livro.id === id)
  })
  onMounted(() => {
    livroStore.fetchLivros()
  })
  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }
  const voltar = () => {
    window.history.back()
  }
  </script>
  <template> 
    <div class="livro-container">
      <div class="header">
        <button @click="voltar" class="btn-voltar">
          <span class="icon">←</span>
          <span>Voltar</span>
        </button>
      </div>
      <div class="container" v-if="livro">
        <div class="conteudo-principal">
          <div class="coluna-capa">
            <div class="moldura-capa">
              <img 
                :src="livro.capa?.url || 'https://via.placeholder.com/300x450'" 
                :alt="livro.titulo"
                class="imagem-capa"
              />
            </div>
          </div>
          <div class="coluna-info">
            <div class="secao-titulo">
              <h1 class="titulo">{{ livro.titulo }}</h1>
              <p v-if="livro.subtitulo" class="subtitulo">{{ livro.subtitulo }}</p>
              <p v-if="livro.autores && livro.autores.length" class="autores">
                por <span class="autores-nome">{{ livro.autores.map(a => a.nome).join(', ') }}</span>
              </p>
            </div>
            <div class="secao-avaliacoes">
              <div class="estrelas">
                <span 
                  v-for="i in 5" 
                  :key="i"
                  class="estrela"
                  :class="{ preenchida: i <= Math.round(parseFloat(livro.nota)) }"
                >★</span>
              </div>
              <div class="nota-info">
                <p class="nota-valor">{{ livro.nota }}</p>
                <p class="nota-texto">({{ livro.avaliacoes }} avaliações)</p>
              </div>
            </div>
            <div class="categorias">
              <span class="categoria categoria-primaria">Ficção Juvenil</span>
              <span class="categoria categoria-secundaria">Ação & Aventura</span>
            </div>
  
            <div class="secao-status">
              <p class="label-status">Status</p>
              <div class="botoes-status">
                <button 
                  v-for="st in statusOpcoes" 
                  :key="st"
                  @click="status = st"
                  class="btn-status"
                  :class="{ ativo: status === st }"
                >
                  {{ st === 'quero-ler' ? 'Quero ler' : st === 'lendo' ? 'Lendo' : 'Lido' }}
                </button>
              </div>
            </div>
            <div class="secao-acoes">
              <button class="btn-acao">
                <span class="icon-acao">♡</span>
                <span>Favoritar</span>
              </button>
              <button class="btn-acao">
                <span class="icon-acao">⤴</span>
                <span>Compartilhar</span>
              </button>
              <button class="btn-acao btn-acao-config">
                <span class="icon-acao">⚙</span>
              </button>
            </div>
          </div>
        </div>

        <div class="secao-detalhes">
          <h2 class="titulo-secao">Detalhes</h2>
          <div class="grid-detalhes">
            <div class="detalhe-item">
              <p class="detalhe-label">Idioma</p>
              <p class="detalhe-valor">{{ livro.idioma === 'pt' ? 'Português' : livro.idioma }}</p>
            </div>
            <div class="detalhe-item">
              <p class="detalhe-label">Páginas</p>
              <p class="detalhe-valor">{{ livro.paginas }}</p>
            </div>
            <div class="detalhe-item">
              <p class="detalhe-label">Publicado</p>
              <p class="detalhe-valor">{{ formatarData(livro.publicacao) }}</p>
            </div>
            <div class="detalhe-item">
              <p class="detalhe-label">Faixa Etária</p>
              <p class="detalhe-valor">{{ livro.faixa_etaria }}</p>
            </div>
            <div class="detalhe-item">
              <p class="detalhe-label">ISBN</p>
              <p class="detalhe-valor isbn">{{ livro.isbn }}</p>
            </div>
          </div>
        </div>
  
        <!-- Sinopse -->
        <div class="secao-sinopse">
          <h2 class="titulo-secao">Sinopse</h2>
          <p class="texto-sinopse">{{ livro.sinopse }}</p>
        </div>
      </div>
  
      <!-- Loading -->
      <div v-else class="loading">
        <div class="spinner"></div>
        <p>Carregando detalhes do livro...</p>
      </div>
    </div>
  </template>
  
 
  
  <style scoped>

  </style>