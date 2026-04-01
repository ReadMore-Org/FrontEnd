// stores/livros.js
import { defineStore } from 'pinia'
import { getLivros } from '@/services/livros'

export const useLivroStore = defineStore('livros', {
  state: () => ({
    livros: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchLivros() {
      this.loading = true
      this.error = null

      try {
        const response = await getLivros()
        this.livros = response.data
      } catch (err) {
        this.error = 'Erro ao carregar livros'
        console.error(err)
      } finally {
        this.loading = false
      }
    }
  }
})
