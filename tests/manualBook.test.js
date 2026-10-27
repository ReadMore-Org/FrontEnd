import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareManualBook, validISBN, validateCover, manualApiErrors } from '../src/utils/manualBook.js';
const form = () => ({ titulo: '  Meu livro  ', autores: ' Ana, Bia, Ana ', subtitulo: '', isbn: '', sinopse: '', idioma: 'pt-BR', paginas: '', publicacao: '', tipo_capa: 'mole', faixa_etaria: 'livre', editora: null, categoria: [1, 1, 2], status: 'lendo', nota: 5 });
test('payload manual usa os campos do backend e não inclui nota', () => {
  const { errors, payload } = prepareManualBook(form());
  assert.deepEqual(errors, {});
  assert.equal(payload.titulo, 'Meu livro');
  assert.deepEqual(payload.autores_nomes, ['Ana', 'Bia']);
  assert.deepEqual(payload.categoria, [1, 2]);
  assert.equal(payload.status, 'lendo');
  assert.equal(payload.isbn, null);
  assert.equal(payload.paginas, null);
  assert.equal('nota' in payload, false);
});
test('ISBN aceita hífens e verifica os dígitos de ISBN-10 e ISBN-13', () => {
  assert.equal(validISBN('978-0-306-40615-7'), true);
  assert.equal(validISBN('0-306-40615-2'), true);
  assert.equal(validISBN('0-8044-2957-X'), true);
  assert.equal(validISBN('9780306406158'), false);
  assert.equal(prepareManualBook({ ...form(), isbn: '978-0-306-40615-7' }).payload.isbn, '9780306406157');
});
test('valida campos obrigatórios, páginas, escolhas e datas reais', () => {
  const { errors } = prepareManualBook({ ...form(), titulo: ' ', autores: ', ,', paginas: 1.5, isbn: '123', publicacao: '2025-02-30', tipo_capa: 'papel', status: 'invalido', faixa_etaria: '18' });
  for (const key of ['titulo', 'autores', 'paginas', 'isbn', 'publicacao', 'tipo_capa', 'status', 'faixa_etaria']) assert.ok(errors[key], key);
  assert.ok(prepareManualBook({ ...form(), autores: 'A'.repeat(51) }).errors.autores);
});
test('capa valida apenas JPG/PNG com limite compatível com o upload', () => {
  assert.equal(validateCover({ type: 'image/png', size: 1024 }), '');
  assert.ok(validateCover({ type: 'image/webp', size: 100 }));
  assert.ok(validateCover({ type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 }));
});
test('erros de autores e upload são ligados aos respectivos campos', () => {
  assert.deepEqual(manualApiErrors({ response: { data: { autores_nomes: ['Obrigatório.'], capa_attachment_key: ['Inválida.'] } } }), { autores: 'Obrigatório.', capa: 'Inválida.' });
});
