import api from './api'

export function getLivros(page = 1) {
  return api.get(`/livros/?page=${page}`);
}

export const getLivro = (id) => api.get(`/livros/${id}/`)

export const createLivro = (data) => api.post('/livros/', data)

export const updateLivro = (id, data) => api.put(`/livros/${id}/`, data)

export const deleteLivro = (id) => api.delete(`/livros/${id}/`)

export const getCategorias = () => api.get('/categorias/')

export const getEditoras = () => api.get('/editoras/')