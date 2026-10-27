export const COVER_TYPES = [
  { value: 'dura', label: 'Capa dura' }, { value: 'mole', label: 'Capa comum' },
  { value: 'sobre', label: 'Dura com sobrecapa' }, { value: 'orelhas', label: 'Com orelhas' },
];
export const AGE_RANGES = [{ value: 'livre', label: 'Livre para todos' }, { value: 'adulto', label: 'Adulto' }];
export const READING_STATUSES = [{ value: 'quero_ler', label: 'Quero ler' }, { value: 'lendo', label: 'Lendo' }, { value: 'lido', label: 'Lido' }];
export function normalizeISBN(value) { return String(value || '').replace(/[\s-]/g, '').toUpperCase(); }
export function validISBN(value) {
  const isbn = normalizeISBN(value);
  if (!/^(\d{9}[\dX]|\d{13})$/.test(isbn)) return false;
  const digits = [...isbn].map(char => char === 'X' ? 10 : Number(char));
  return isbn.length === 10
    ? digits.reduce((sum, digit, i) => sum + digit * (10 - i), 0) % 11 === 0
    : digits.reduce((sum, digit, i) => sum + digit * (i % 2 ? 3 : 1), 0) % 10 === 0;
}
export function validateCover(file) {
  if (!file) return '';
  if (!['image/jpeg', 'image/png'].includes(file.type)) return 'Escolha uma imagem JPG ou PNG.';
  return file.size > 5 * 1024 * 1024 ? 'A capa deve ter até 5 MB.' : '';
}
export function prepareManualBook(form) {
  const errors = {};
  const text = value => String(value || '').trim();
  const titulo = text(form.titulo);
  const autores_nomes = [...new Set(text(form.autores).split(',').map(text).filter(Boolean))];
  if (!titulo || titulo.length > 260) errors.titulo = 'Informe um título de até 260 caracteres.';
  if (!autores_nomes.length || autores_nomes.some(name => name.length > 50)) errors.autores = 'Informe ao menos um autor, com até 50 caracteres por nome.';
  if (text(form.subtitulo).length > 260) errors.subtitulo = 'Use até 260 caracteres.';
  const isbn = normalizeISBN(form.isbn);
  if (isbn && !validISBN(isbn)) errors.isbn = 'ISBN inválido. Confira os 10 ou 13 dígitos (o ISBN-10 pode terminar em X).';
  const paginas = form.paginas === '' || form.paginas == null ? null : Number(form.paginas);
  if (paginas != null && (!Number.isInteger(paginas) || paginas < 1 || paginas > 2147483647)) errors.paginas = 'Informe um número inteiro de páginas maior que zero.';
  if (text(form.idioma).length > 30) errors.idioma = 'Use até 30 caracteres para o idioma.';
  const publicacao = text(form.publicacao);
  if (publicacao) {
    const date = new Date(`${publicacao}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(publicacao) || Number.isNaN(date.valueOf()) || date.getUTCFullYear() < 1 || date.toISOString().slice(0, 10) !== publicacao) errors.publicacao = 'Informe uma data válida.';
  }
  if (!READING_STATUSES.some(item => item.value === form.status)) errors.status = 'Selecione um status de leitura.';
  if (!COVER_TYPES.some(item => item.value === form.tipo_capa)) errors.tipo_capa = 'Selecione um tipo de capa válido.';
  if (!AGE_RANGES.some(item => item.value === form.faixa_etaria)) errors.faixa_etaria = 'Selecione uma faixa etária válida.';
  const categoria = Array.isArray(form.categoria) ? [...new Set(form.categoria.map(Number))] : [];
  if (categoria.some(id => !Number.isInteger(id) || id < 1)) errors.categoria = 'Selecione categorias válidas.';
  return { errors, payload: {
    titulo, autores_nomes, subtitulo: text(form.subtitulo) || null, isbn: isbn || null,
    sinopse: text(form.sinopse) || null, idioma: text(form.idioma) || null, paginas,
    publicacao: publicacao || null, tipo_capa: form.tipo_capa, faixa_etaria: form.faixa_etaria,
    editora: form.editora ? Number(form.editora) : null, categoria, status: form.status,
  } };
}
export function manualApiErrors(error) {
  const data = error.response?.data;
  if (!data || typeof data !== 'object') return {};
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key === 'autores_nomes' ? 'autores' : ['capa_attachment_key', 'file'].includes(key) ? 'capa' : key, Array.isArray(value) ? value.join(' ') : typeof value === 'string' ? value : 'Confira este campo.']));
}
