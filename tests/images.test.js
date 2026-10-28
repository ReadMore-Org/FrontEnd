import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveImageUrl, getBookCover, getUserPhoto, bookImageFallbacks, googleBookCoverUrls } from '../src/utils/images.js';
const local = { origin: 'http://localhost:5173', apiBase: 'http://127.0.0.1:8000/api', backendBase: 'http://127.0.0.1:8000/' };

test('URLs de mídia usam o backend, sem /api e sem barras duplicadas', () => {
  for (const value of ['/media/images/capa.jpg', 'media/images/capa.jpg', '/api/media/images/capa.jpg']) {
    assert.equal(resolveImageUrl(value, local), 'http://127.0.0.1:8000/media/images/capa.jpg');
  }
  assert.equal(resolveImageUrl('/media/foto.jpg', { ...local, backendBase: 'http://localhost:8000/api/' }), 'http://localhost:8000/media/foto.jpg');
});
test('mídia funciona quando apenas a URL da API é configurada', () => {
  assert.equal(resolveImageUrl('/media/foto.jpg', { origin: local.origin, apiBase: 'http://localhost:8000/api' }), 'http://localhost:8000/media/foto.jpg');
});
test('preserva HTTP local, HTTPS remoto, caminhos estáticos e previews', () => {
  for (const value of ['http://localhost:8000/media/foto.jpg', 'https://res.cloudinary.com/demo/image/upload/photo.jpg', '/imgs/avatar.jpeg', 'blob:http://localhost:5173/preview', 'data:image/png;base64,abc']) {
    assert.equal(resolveImageUrl(value, local), value);
  }
});
test('capas Google usam HTTPS', () => {
  assert.equal(resolveImageUrl('http://books.google.com/books/content?id=123', local), 'https://books.google.com/books/content?id=123');
});
test('capas tentam Google por ISBN antes da imagem padrão', () => {
  assert.match(getBookCover({ capa: { url: null }, isbn: '978-85-123-4567-8' }), /books.google.com.*vid=ISBN9788512345678/);
  assert.equal(getBookCover({}), '/imgs/livro_sem_capa.png');
  assert.equal(bookImageFallbacks({ isbn: '9788512345678' }).at(-1), '/imgs/livro_sem_capa.png');
});
test('cópia local ausente é recuperada pelo ID real do Google, sem usar ID numérico do banco', () => {
  assert.match(getBookCover({ id: 12, google_book_id: 'real-id', capa: { url: null } }), /books.google.com.*id=real-id/);
  assert.equal(googleBookCoverUrls({ id: 12, capa: null }).length, 0);
});
test('thumbnail original tem prioridade e edge curl é removido', () => {
  const book = { id: 'real', capa_google: 'http://books.google.com/books/content?id=real&edge=curl&zoom=1', capa: { url: '/media/capa.jpg' } };
  assert.equal(getBookCover(book), 'https://books.google.com/books/content?id=real&zoom=1');
  assert.ok(bookImageFallbacks(book).some(url => url.includes('/media/capa.jpg')));
});
test('smallThumbnail também é uma capa válida', () => {
  assert.equal(getBookCover({ volumeInfo: { imageLinks: { smallThumbnail: 'https://books.google.com/cover.jpg' } } }), 'https://books.google.com/cover.jpg');
});
test('avatar ausente usa a foto Google ou o avatar padrão', () => {
  assert.equal(getUserPhoto({ foto: { url: null }, google_picture: 'https://lh3.googleusercontent.com/photo' }), 'https://lh3.googleusercontent.com/photo');
  assert.equal(getUserPhoto({}), '/imgs/avatar.jpeg');
});
