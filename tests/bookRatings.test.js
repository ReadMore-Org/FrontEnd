import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
let response = [];
let calls = [];
axios.defaults.adapter = async config => {
  calls.push(config);
  return { data: response, status: 200, headers: {}, config };
};
const { loadBookRatings, getBookRating, setBookRating } = await import('../src/services/bookRatings.js');

test('card Google recebe a média local pelo ISBN mesmo quando o backend não tem ID Google', async () => {
  const book = { id: 'isbn-only-google', isbn: '9781234567890', nota_google: 4.8, popularidade_google: 2000 };
  response = [{ id: 321, google_book_id: null, isbn: book.isbn, media: 2, total: 2 }];
  await loadBookRatings([book]);
  assert.equal(getBookRating(book).media, 2);
  assert.equal(getBookRating(book).total, 2);
});
test('livro sem avaliações do ReadMore não usa notas externas', async () => {
  const book = { id: 'unrated', isbn: '9789999999999', nota: 5, avaliacoes: 9000 };
  response = [];
  await loadBookRatings([book]);
  assert.equal(getBookRating(book).media, null);
  assert.equal(getBookRating(book).total, 0);
});
test('salvar avaliação atualiza os cards da mesma edição imediatamente', () => {
  const book = { id: 'new-rating', isbn: '9781111111111' };
  setBookRating(book, { media: 5, total: 1 });
  assert.equal(getBookRating({ ...book }).media, 5);
  setBookRating(book, { media: 3, total: 2 });
  assert.equal(getBookRating(book).media, 3);
  assert.equal(getBookRating(book).total, 2);
});
test('resumos são revalidados em lote, sem uma consulta por card', async () => {
  calls = []; response = [];
  await loadBookRatings(Array.from({ length: 81 }, (_, i) => ({ id: `batch-${i}` })));
  assert.equal(calls.length, 2);
  assert.equal(calls[0].params.google_ids.split(',').length, 80);
});
