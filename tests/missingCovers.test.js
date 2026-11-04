import test from 'node:test';
import assert from 'node:assert/strict';
import samples from '../src/utils/missingCoverSamples.json' with { type: 'json' };
import { matchesMissingCover } from '../src/utils/missingCovers.js';

test('identifica ambas as imagens enviadas pelo usuário, inclusive com compressão', () => {
  for (const reference of samples) {
    assert.equal(matchesMissingCover(reference), true);
    const compressed = reference.map((value, i) => Math.max(0, Math.min(255, value + (i % 5) - 2)));
    assert.equal(matchesMissingCover(compressed), true);
  }
});
test('não rejeita uma capa apenas por ser branca ou cinza', () => {
  for (const value of [255, 150]) {
    assert.equal(matchesMissingCover(Array(24 * 32 * 3).fill(value)), false);
  }
  // As mesmas cores dispostas de outro modo não são o placeholder.
  for (const reference of samples) assert.equal(matchesMissingCover([...reference].reverse()), false);
});
