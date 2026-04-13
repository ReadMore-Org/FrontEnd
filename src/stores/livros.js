import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getLivros,
  createLivro,
  updateLivro,
  deleteLivro
} from '@/services/livros'

export const useLivrosStore = defineStore('livros', () => {
  const livros = ref([])
  const loading = ref(false)
  const error = ref(null)

  const totalLivros = computed(() => livros.value.length)

  async function fetchLivros() {
    loading.value = true
    error.value = null

    try {
      const response = await getLivros()
      livros.value = response.data
    } catch (err) {
      error.value = 'Erro ao carregar livros.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function addLivro(data) {
    error.value = null

    try {
      const response = await createLivro(data)
      livros.value.push(response.data)
    } catch (err) {
      error.value = 'Erro ao adicionar livro.'
      console.error(err)
    }
  }

  async function updateLivroStore(id, data) {
    error.value = null

    try {
      const response = await updateLivro(id, data)

      const index = livros.value.findIndex(l => l.id === id)
      if (index !== -1) {
        livros.value[index] = response.data
      }
    } catch (err) {
      error.value = 'Erro ao atualizar livro.'
      console.error(err)
    }
  }

  async function removeLivro(id) {
    error.value = null

    try {
      await deleteLivro(id)
      livros.value = livros.value.filter(l => l.id !== id)
    } catch (err) {
      error.value = 'Erro ao remover livro.'
      console.error(err)
    }
  }

  return {
    livros,
    loading,
    error,
    totalLivros,
    fetchLivros,
    addLivro,
    updateLivroStore,
    removeLivro
  }
})
