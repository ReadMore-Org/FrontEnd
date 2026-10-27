import axios from 'axios';
import { reactive } from 'vue';
import { API_BASE_URL } from './apiConfig.js';

const client = axios.create({ baseURL: API_BASE_URL, timeout: 8000 });
const ratings = reactive(new Map());
const normalizedISBN = value => String(value || '').replace(/[\s-]/g, '').toUpperCase();
function keys(book) {
  return [
    typeof book?.id === 'number' ? `id:${book.id}` : null,
    book?.google_book_id || typeof book?.id === 'string' ? `google:${book.google_book_id || book.id}` : null,
    book?.isbn ? `isbn:${normalizedISBN(book.isbn)}` : null,
  ].filter(Boolean);
}
export function getBookRating(book) {
  for (const key of keys(book)) {
    if (ratings.has(key)) return ratings.get(key);
  }
  return { media: null, total: 0, status: "pending" };
}
export function setBookRating(book, summary) {
  const value = { status: summary.status || "ready", media: summary.media == null ? null : Number(summary.media), total: Number(summary.total) || 0 };
  for (const key of keys(book)) ratings.set(key, value);
}
export async function loadBookRatings(books, { signal } = {}) {
  // Revalida em cada consulta: notas não usam o cache do Google Books.
  const summaries = [];
  for (let index = 0; index < books.length; index += 80) {
    const chunk = books.slice(index, index + 80);
    const { data } = await client.get('/livros/avaliacoes/', { signal, params: {
      ids: chunk.filter(book => typeof book.id === 'number').map(book => book.id).join(','),
      google_ids: chunk.map(book => book.google_book_id || (typeof book.id === 'string' ? book.id : null)).filter(Boolean).join(','),
      isbns: chunk.map(book => normalizedISBN(book.isbn)).filter(Boolean).join(','),
    } });
    summaries.push(...data);
  }
  if (signal?.aborted) return;
  for (const summary of summaries) setBookRating(summary, summary);
  for (const book of books) {
    const summary = summaries.find(item => (typeof book.id === 'number' && item.id === book.id)
      || (item.google_book_id && item.google_book_id === (book.google_book_id || book.id))
      || (book.isbn && normalizedISBN(item.isbn) === normalizedISBN(book.isbn)));
    setBookRating(book, summary || { media: null, total: 0 });
  }
}

export function markBookRatingsUnavailable(books) {
  for (const book of books) setBookRating(book, { media: null, total: 0, status: 'unavailable' });
}
