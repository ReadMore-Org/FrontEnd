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

export const getCategorias = (page = 1) =>
  api.get('/categorias/', { params: { page, page_size: 100 } });

export const getEditoras = (page = 1) =>
  api.get('/editoras/', { params: { page, page_size: 100 } });

export function getLivrosUsuario(status = null, page = 1) {
  return api.get("/livros-usuario/", { params: { status: status || undefined, page, page_size: 100 } });
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

export function importarLivroGoogle(livro, status, somenteCatalogo = false) {
  const payload = {
    google_book_id: livro.google_book_id || livro.googleBookId || (typeof livro.id === "string" ? livro.id : null),
    titulo: livro.titulo,
    subtitulo: livro.subtitulo || null,
    isbn: livro.isbn || null,
    sinopse: livro.sinopse || null,
    idioma: livro.idioma || null,
    paginas: livro.paginas || null,
    nota: livro.nota ?? null,
    publicacao: livro.publicacao || null,

    editora: typeof livro.editora === 'object'
      ? livro.editora?.nome
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

  return api.post(somenteCatalogo ? '/livros/importar-interacao/' : '/livros/importar-google/', payload);
}