import test from 'node:test';
import assert from 'node:assert/strict';
import { GENERAL_RECOMMENDATIONS } from '../src/utils/generalRecommendations.js';
import { buildRecommendationCatalog, needsReadingPreferences, preferencesCacheKey } from '../src/utils/readingPreferences.js';
const profile = preferences => ({ id: 1, reading_preferences_status: 'completed', reading_preferences: { categories: [], authors: [], books: [], ...preferences } });

test('somente usuários pendentes recebem a etapa inicial; pular ou salvar vazio não insiste', () => {
  assert.equal(needsReadingPreferences(null), false);
  assert.equal(needsReadingPreferences({ id: 1 }), true);
  assert.equal(needsReadingPreferences({ reading_preferences_status: 'pending' }), true);
  for (const status of ['skipped', 'completed']) assert.equal(needsReadingPreferences({ reading_preferences_status: status }), false);
});
test('sem respostas, preserva exatamente o catálogo e a ordem gerais', () => {
  for (const user of [null, profile({}), { ...profile({ authors: ['Tolkien'] }), reading_preferences_status: 'skipped' }]) {
    assert.deepEqual(buildRecommendationCatalog(user), GENERAL_RECOMMENDATIONS);
  }
});
test('autores, categorias e livros escolhidos priorizam obras relacionadas sem remover as gerais', () => {
  const author = buildRecommendationCatalog(profile({ authors: ['Tolkien'] }));
  assert.equal(author[0][1], 'Tolkien');
  const category = buildRecommendationCatalog(profile({ categories: ['fantasy'] }));
  assert.notEqual(category[0][0], GENERAL_RECOMMENDATIONS[0][0]);
  const book = buildRecommendationCatalog(profile({ books: [{ title: 'O Hobbit', authors: ['Tolkien'] }] }));
  assert.equal(book[0][0], 'O Hobbit');
  for (const entries of [author, category, book]) {
    assert.ok(entries.some(([title]) => title === 'Dom Casmurro'));
    assert.equal(new Set(entries.map(entry => entry.join('|'))).size, entries.length);
  }
});
test('novas descobertas ampliam o catálogo, e o cache separa contas e alterações', () => {
  const user = profile({ authors: ['Autora nova'] });
  const entries = buildRecommendationCatalog(user, [['Livro novo', 'Autora nova'], ['Livro novo', 'Autora nova']]);
  assert.equal(entries[0][0], 'Livro novo');
  assert.notEqual(preferencesCacheKey(user), preferencesCacheKey({ ...user, id: 2 }));
  assert.notEqual(preferencesCacheKey(user), preferencesCacheKey(profile({ authors: ['Tolkien'] })));
});
