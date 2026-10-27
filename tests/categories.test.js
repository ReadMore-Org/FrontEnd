import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TRADUCOES, normalizarCategoriasGoogle, nomesCategoriasDoLivro } from '../src/utils/categoriasLivro.js';
import { SEARCH_CATEGORIES, buildSearchSources, matchesSearchFilters } from '../src/utils/bookSearch.js';

test('front e backend mantêm exatamente o mesmo dicionário de traduções', () => {
  const backend = readFileSync(new URL('../../BackEnd/core/services/categorias_google.py', import.meta.url), 'utf8');
  const dictionary = backend.match(/TRADUCOES = (\{[\s\S]*?\n\})/)[1];
  assert.deepEqual(TRADUCOES, JSON.parse(dictionary));
});
test('novos gêneros e subgêneros são traduzidos sem repetir categorias genéricas', () => {
  assert.deepEqual(normalizarCategoriasGoogle(['Fiction / Science Fiction / Cyberpunk', 'Fiction / Fantasy / Epic', 'General']), ['Ficção', 'Ficção Científica', 'Cyberpunk', 'Fantasia', 'Épico']);
  assert.deepEqual(normalizarCategoriasGoogle(['Computers / Programming Languages / Python', 'COMPUTERS / Artificial Intelligence']), ['Computação', 'Linguagens de Programação', 'Python', 'Inteligência Artificial']);
  assert.deepEqual(normalizarCategoriasGoogle(['Comics & Graphic Novels / Manga', 'Biography & Autobiography / Personal Memoirs']), ['Quadrinhos', 'Mangá', 'Biografia', 'Memórias Pessoais']);
});
test('mais categorias de um mesmo livro são preservadas sem exceder oito tags', () => {
  const result = normalizarCategoriasGoogle(['Fiction', 'Fantasy', 'Epic', 'Adventure', 'Friendship', 'School & Education', 'Humor', 'Coming of Age', 'Romance']);
  assert.equal(result.length, 8);
  assert.ok(result.includes('Amadurecimento'));
});
test('todas as quarenta opções de filtro possuem tradução e funcionam com metadados brutos e traduzidos', () => {
  assert.equal(SEARCH_CATEGORIES.length, 40);
  assert.equal(new Set(SEARCH_CATEGORIES.map(category => category.value)).size, 40);
  for (const category of SEARCH_CATEGORIES) {
    assert.ok(TRADUCOES[category.value], category.value);
    assert.equal(buildSearchSources('', { categories: [category.value] })[0].q, `subject:"${category.value}"`);
    assert.equal(matchesSearchFilters({ categorias_originais: [category.value] }, [], [category.value]), true, category.value);
    assert.equal(matchesSearchFilters({ categorias: normalizarCategoriasGoogle([category.value]) }, [], [category.value]), true, category.value);
  }
});
test('filtros próximos não confundem ficção, não ficção e ciências', () => {
  assert.equal(matchesSearchFilters({ categorias_originais: ['Juvenile Nonfiction'] }, [], ['fiction']), false);
  assert.equal(matchesSearchFilters({ categorias_originais: ['Science Fiction'] }, [], ['science']), false);
  assert.equal(matchesSearchFilters({ categorias_originais: ['History / Ancient'] }, [], ['history']), true);
  assert.equal(matchesSearchFilters({ categorias_originais: ['Fiction / Fantasy / Epic'] }, ['pt'], ['fantasy']), false);
});

test('detalhes mostram apenas categorias do respectivo livro nos formatos do Google e backend', () => {
  assert.deepEqual(nomesCategoriasDoLivro({ categorias: ['Fiction', 'Fantasy', 'Fantasy'] }), ['Ficção', 'Fantasia']);
  assert.deepEqual(nomesCategoriasDoLivro({ categoria: [{ id: 200, descricao: 'Science Fiction' }] }), ['Ficção Científica']);
  assert.deepEqual(nomesCategoriasDoLivro({ categoria: [200] }, [{ id: 200, descricao: 'Fantasy' }, { id: 201, descricao: 'Horror' }]), ['Fantasia']);
  assert.deepEqual(nomesCategoriasDoLivro({ categorias_originais: ['Fiction / Fantasy / Epic'] }), ['Ficção', 'Fantasia', 'Épico']);
  assert.deepEqual(nomesCategoriasDoLivro({}), []);
});
