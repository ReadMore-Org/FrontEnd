import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchSources, searchISBN, matchesSearchFilters, mergeSearchBooks, sortSearchBooks } from '../src/utils/bookSearch.js';
test('títulos famosos têm busca geral e busca por título sem restrição oculta de idioma', () => {
  for (const title of ['Harry Potter', 'O Senhor dos Anéis', 'Dom Casmurro', '1984']) {
    const sources = buildSearchSources(title);
    assert.equal(sources[0].q, title);
    assert.equal(sources[1].q, `intitle:"${title}"`);
    assert.ok(sources.every(source => !source.langRestrict));
  }
});
test('ISBN com espaços, prefixo e hífens gera consulta específica', () => {
  assert.equal(searchISBN('ISBN: 978-85-123-4567-8'), '9788512345678');
  assert.deepEqual(buildSearchSources('978-85-123-4567-8').map(item => item.q), ['isbn:9788512345678']);
});
test('categorias e idiomas somam alternativas no grupo e combinam entre grupos', () => {
  const sources = buildSearchSources('Harry Potter', { categories: ['fantasy', 'juvenile fiction'], languages: ['pt', 'en'], orderBy: 'newest' });
  assert.equal(sources.length, 4);
  assert.ok(sources.some(item => item.q === 'Harry Potter subject:"juvenile fiction"' && item.langRestrict === 'pt'));
  assert.ok(sources.every(item => item.orderBy === 'newest'));
  assert.equal(buildSearchSources('', { categories: ['fantasy'] })[0].q, 'subject:"fantasy"');
  assert.deepEqual(buildSearchSources('', { languages: ['pt'] }), []);
});
test('filtros conferem idiomas regionais e categorias em inglês ou português', () => {
  const book = { idioma: 'pt-BR', categorias_originais: ['Fiction / Fantasy / Romance'] };
  assert.equal(matchesSearchFilters(book, ['pt', 'en'], ['fantasy', 'romance']), true);
  assert.equal(matchesSearchFilters(book, ['en'], ['fantasy']), false);
  assert.equal(matchesSearchFilters(book, ['pt'], ['juvenile fiction']), false);
  assert.equal(matchesSearchFilters({ idioma: 'es', categorias: ['Ação e Aventura'] }, ['es'], ['action & adventure']), true);
});
test('livros sem capa ficam e volumes repetidos por ID ou ISBN são removidos', () => {
  const first = { id: 'a', titulo: 'Dom Casmurro', isbn: '9788512345678', capa: null };
  assert.deepEqual(mergeSearchBooks([first, first, { ...first, id: 'b' }, { id: 'c', titulo: '' }]), [first]);
});
test('título relevante vem antes da popularidade e recentes respeita datas', () => {
  const books = [
    { id: 'guide', titulo: 'Guia de leitura', avaliacoes: 10000, publicacao: '2025-01-01' },
    { id: 'exact', titulo: 'O Senhor dos Anéis', publicacao: '1954' },
    { id: 'edition', titulo: 'O Senhor dos Anéis: edição especial', publicacao: '2024-04' },
  ];
  assert.deepEqual(sortSearchBooks(books, 'o senhor dos aneis').map(item => item.id), ['exact', 'edition', 'guide']);
  assert.deepEqual(sortSearchBooks(books, '', 'newest').map(item => item.id), ['guide', 'edition', 'exact']);
});
test('edições populares de Harry Potter precedem guias e edições pouco conhecidas', () => {
  const books = [
    { id: 'guide', titulo: 'Harry Potter: guia de estudos', popularidade_google: 50000 },
    { id: 'rare', titulo: 'Harry Potter', popularidade_google: 1, nota: 5, avaliacoes: 1000 },
    { id: 'famous', titulo: 'Harry Potter e a Pedra Filosofal', popularidade_google: 3000 },
    { id: 'second', titulo: 'Harry Potter e a Câmara Secreta', popularidade_google: 1000 },
  ];
  assert.deepEqual(sortSearchBooks(books, 'Harry Potter').map(item => item.id), ['famous', 'second', 'rare', 'guide']);
});
