import api from './api'

export function getLivros(page = 1) {
  return api.get(`/livros/?page=${page}`);
}

export const getLivro = (id) =>
  api.get(`/livros/${id}/`);

export const createLivro = (data) =>
  api.post('/livros/', data);

export const updateLivro = (id, data) =>
  api.put(`/livros/${id}/`, data);

export const deleteLivro = (id) =>
  api.delete(`/livros/${id}/`);

export const getCategorias = () =>
  api.get('/categorias/');

export const getEditoras = () =>
  api.get('/editoras/');

export function getLivrosUsuario(status = null) {
  const query = status ? `?status=${status}` : '';
  return api.get(`/livros-usuario/${query}`);
}

export function createLivroUsuario(data) {
  return api.post('/livros-usuario/', data);
}

export function updateStatusLivroUsuario(livroUsuarioId, status) {
  return api.patch(`/livros-usuario/${livroUsuarioId}/`, { status });
}

export async function deleteLivroUsuario(id) {
  // Substitua '/meus-livros/' pela rota correta da sua API se for diferente
  return await api.delete(`/livros-usuario/${id}/`);
}

export function importarLivroGoogle(livro, status) {
  const payload = {
    titulo: livro.titulo,
    subtitulo: livro.subtitulo || null,
    isbn: livro.isbn || null,
    sinopse: livro.sinopse || null,
    idioma: livro.idioma || null,
    paginas: livro.paginas || null,
    nota: livro.nota ?? null,
    publicacao: livro.publicacao || null,

    editora: typeof livro.editora === 'object'
      ? livro.editora.id
      : livro.editora || null,

    autores: (livro.autores || []).map((a) =>
      typeof a === 'string' ? a : a.nome
    ),

    categorias: (livro.categorias || []).map((c) =>
      typeof c === 'object' ? c.id : c
    ),

    capa: livro.capa || null,
    status,
  };

  return api.post('/livros/importar-google/', payload);
}