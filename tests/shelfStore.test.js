import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { createPinia, setActivePinia } from 'pinia';
globalThis.localStorage = { getItem: () => null };
let handler;
axios.defaults.adapter = config => handler(config);
const { useLivrosStore } = await import('../src/stores/livros.js');
const ok = (config, data) => ({ config, data, status: 200, headers: {} });
function store() { setActivePinia(createPinia()); return useLivrosStore(); }
test('arrastar altera o vínculo certo mesmo quando IDs de livros e vínculos coincidem', async () => {
  let url;
  handler = async config => { url = config.url; return ok(config, {}); };
  const s = store();
  const target = { id: 20, livro: { id: 8 }, status: 'quero_ler' };
  s.meusLivros = [{ id: 8, livro: { id: 20 }, status: 'lido' }, target];
  await s.atualizarStatusMeuLivro(target, 'lendo');
  assert.equal(url, '/livros-usuario/20/');
  assert.equal(s.meusLivros[0].status, 'lido');
  assert.equal(s.meusLivros[1].status, 'lendo');
});
test('falha ao mover desfaz o status e propaga o erro para a tela', async () => {
  handler = async () => { throw new Error('offline'); };
  const s = store(); const item = { id: 4, livro: { id: 30 }, status: 'quero_ler' };
  s.meusLivros = [item];
  await assert.rejects(s.atualizarStatusMeuLivro(item, 'lendo'));
  assert.equal(s.meusLivros[0].status, 'quero_ler');
});
test('cadastro manual atualiza catálogo e estante somente após sucesso', async () => {
  handler = async config => ok(config, { livro: { id: 99, titulo: 'Novo' }, livro_usuario: { id: 100, livro: { id: 99 }, status: 'lendo' } });
  const s = store();
  const result = await s.addLivro({ titulo: 'Novo', autores_nomes: ['Autora'], status: 'lendo' });
  assert.equal(result.id, 99);
  assert.equal(s.meusLivros[0].status, 'lendo');
  handler = async () => { throw new Error('rejeitado'); };
  await assert.rejects(s.addLivro({ titulo: 'Falha' }));
  assert.equal(s.livros.length, 1);
  assert.equal(s.meusLivros.length, 1);
});
test('a estante carrega todas as páginas antes de organizar as listas', async () => {
  handler = async config => ok(config, { results: [{ id: config.params.page, livro: { id: config.params.page } }], total_pages: 2 });
  const s = store(); await s.fetchMeusLivros();
  assert.equal(s.meusLivros.length, 2);
});
