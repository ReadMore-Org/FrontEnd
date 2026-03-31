import api from './api'

export const getLivros = () => api.get('/livros/')
export const getLivro = (id) => api.get(`/livros/${id}/`)
export const createLivro = (data) => api.post('/livros/', data)
export const updateLivro = (id, data) => api.put(`/livros/${id}/`, data)
export const deleteLivro = (id) => api.delete(`/livros/${id}/`)
