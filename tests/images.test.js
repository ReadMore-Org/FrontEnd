import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveImageUrl, getBookCover, getUserPhoto, bookImageFallbacks } from '../src/utils/images.js';
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
test('capas ausentes usam ISBN e depois imagem padrão', () => {
  assert.equal(getBookCover({ capa: { url: null }, isbn: '978-85-123-4567-8' }), 'https://covers.openlibrary.org/b/isbn/9788512345678-L.jpg?default=false');
  assert.equal(getBookCover({}), '/imgs/livro_sem_capa.png');
  assert.deepEqual(bookImageFallbacks({ isbn: '9788512345678' }), ['https://covers.openlibrary.org/b/isbn/9788512345678-L.jpg?default=false', '/imgs/livro_sem_capa.png']);
});
test('avatar ausente usa a foto Google ou o avatar padrão', () => {
  assert.equal(getUserPhoto({ foto: { url: null }, google_picture: 'https://lh3.googleusercontent.com/photo' }), 'https://lh3.googleusercontent.com/photo');
  assert.equal(getUserPhoto({}), '/imgs/avatar.jpeg');
});
