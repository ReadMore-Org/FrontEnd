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

export function getBookCover(livro) {
  return resolveImageUrl(livro?.capa || livro?.livro?.capa) || isbnCoverUrl(livro) || FALLBACK_CAPA;
}

export function bookImageFallbacks(livro) {
  return [isbnCoverUrl(livro), FALLBACK_CAPA].filter(Boolean);
}

export function getUserPhoto(user) {
  return resolveImageUrl(user?.foto_url || user?.foto) || resolveImageUrl(user?.google_picture) || FALLBACK_AVATAR;
}
