import { API_BASE_URL } from "../services/apiConfig.js";
const DEFAULT_API_URL = 'https://readmoreback.class.fabricadesoftware.ifc.edu.br/api';
export const FALLBACK_CAPA = '/imgs/livro_sem_capa.png';
export const FALLBACK_AVATAR = '/imgs/avatar.jpeg';

export function resolveImageUrl(value, options = {}) {
  const raw = typeof value === 'string' ? value : value?.url;
  if (!raw?.trim()) return '';
  const url = raw.trim();
  if (/^(data:|blob:)/i.test(url)) return url;
  if (/^\/?(imgs|icons)\//i.test(url)) return `/${url.replace(/^\//, '')}`;
  const origin = options.origin || globalThis.location?.origin || 'http://localhost:5173';
  const apiBase = options.apiBase || import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_URL;
  const backendBase = options.backendBase || import.meta.env?.VITE_BACKEND_URL || apiBase;
  try {
    const backend = new URL(backendBase, origin);
    // /api é o prefixo dos endpoints, não dos arquivos de mídia.
    backend.pathname = backend.pathname.replace(/\/api\/?$/, '').replace(/\/+$/, '') + '/';
    let image;
    if (/^(https?:)?\/\//i.test(url)) image = new URL(url, origin);
    else image = new URL(url.replace(/^\/+/, '').replace(/^api\/media\//, 'media/'), backend);
    // Evita conteúdo misto em capas externas sem forçar HTTPS no servidor local.
    if (image.hostname === 'books.google.com' || image.hostname === 'books.googleusercontent.com') image.protocol = 'https:';
    return image.href;
  } catch { return ''; }
}

export function isbnCoverUrl(livro) {
  const isbn = String(livro?.isbn || livro?.livro?.isbn || '').replace(/[\s-]/g, '');
  return /^(\d{9}[\dXx]|\d{13})$/.test(isbn)
    ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false` : '';
}

function bookData(livro) {
  if (!livro?.livro || typeof livro.livro !== 'object') return livro || {};
  const nested = livro.livro;
  return { ...nested, ...livro,
    capa: resolveImageUrl(livro.capa) ? livro.capa : nested.capa,
    google_book_id: livro.google_book_id || nested.google_book_id,
    isbn: livro.isbn || nested.isbn,
  };
}

export function googleBookCoverUrls(livro) {
  const book = bookData(livro);
  const googleId = book.google_book_id || book.googleBookId
    || (!['local', 'openlibrary'].includes(book.origem) && typeof book.id === 'string' && !book.id.startsWith('isbn:') ? book.id : null);
  const imageLinks = book.imageLinks || book.volumeInfo?.imageLinks || {};
  const urls = [book.capa_google, book.capa_google_url, imageLinks.thumbnail, imageLinks.smallThumbnail];
  const cover = resolveImageUrl(book.capa);
  if (cover && /https:\/\/(books\.google\.com|books\.googleusercontent\.com)\//.test(cover)) urls.push(cover);
  if (googleId) urls.push(`https://books.google.com/books/content?id=${encodeURIComponent(googleId)}&printsec=frontcover&img=1&zoom=1&source=gbs_api`);
  const isbn = String(book.isbn || '').replace(/[\s-]/g, '');
  if (/^(\d{9}[\dXx]|\d{13})$/.test(isbn)) {
    urls.push(`https://books.google.com/books/content?vid=ISBN${isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`);
  }
  return [...new Set(urls.map(value => {
    const resolved = resolveImageUrl(value);
    if (!resolved) return '';
    const url = new URL(resolved);
    if (url.hostname === 'books.google.com') url.searchParams.delete('edge');
    return url.href;
  }).filter(Boolean))];
}

export function getBookCover(livro) {
  const book = bookData(livro);
  return googleBookCoverUrls(book)[0] || resolveImageUrl(book.capa) || isbnCoverUrl(book) || FALLBACK_CAPA;
}

export function bookImageFallbacks(livro) {
  const book = bookData(livro);
  return [...new Set([
    ...googleBookCoverUrls(book), resolveImageUrl(book.capa), isbnCoverUrl(book), FALLBACK_CAPA,
  ].filter(Boolean))];
}

export function getUserPhoto(user) {
  return resolveImageUrl(user?.foto_url || user?.foto) || resolveImageUrl(user?.google_picture) || FALLBACK_AVATAR;
}

export function displayImageUrl(value, { avatar = false } = {}) {
  const url = resolveImageUrl(value);
  if (avatar || !url) return url;
  try {
    const parsed = new URL(url);
    if (['books.google.com', 'books.googleusercontent.com'].includes(parsed.hostname)) {
      return `${API_BASE_URL.replace(/\/$/, '')}/livros/capa-google/?${new URLSearchParams({ url })}`;
    }
  } catch { /* Imagens locais continuam usando seu caminho original. */ }
  return url;
}
