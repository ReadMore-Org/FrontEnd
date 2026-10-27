import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { createPinia, setActivePinia } from 'pinia';
let handler;
const defaultRatingHandler = config => Promise.resolve({ data: [], status: 200, headers: {}, config });
let ratingHandler = defaultRatingHandler;
axios.defaults.adapter = config => config.url === "/livros/avaliacoes/" ? ratingHandler(config) : handler(config);
const { useGoogleBooksStore } = await import('../src/stores/googleBooks.js');
const volume = (id, title, language = 'pt', categories = ['Fiction / Fantasy']) => ({ id, volumeInfo: { title, language, categories } });
const ok = (config, items) => ({ data: { items, totalItems: items.length }, status: 200, statusText: 'OK', headers: {}, config });
function store() { setActivePinia(createPinia()); return useGoogleBooksStore(); }
test('busca envia paginação e sinal, mantém capas ausentes e preserva a Home', async () => {
  const calls = [];
  handler = async config => { calls.push(config); return ok(config, [volume('a', 'Dom Casmurro')]); };
  const s = store(); s.resultados = [{ id: 'home' }];
  await s.pesquisarLivros('Dom Casmurro');
  assert.equal(calls.length, 2);
  assert.equal(calls[0].params.maxResults, 40);
  assert.equal(calls[0].params.langRestrict, undefined);
  assert.ok(calls[0].signal instanceof AbortSignal);
  assert.equal(s.resultadosExplore.length, 1);
  assert.equal(s.resultadosExplore[0].capa, null);
  assert.deepEqual(s.resultados, [{ id: 'home' }]);
});
test('idiomas, categorias e ordenação chegam à API e resultados são filtrados', async () => {
  const calls = [];
  handler = async config => { calls.push(config); return ok(config, [volume(config.params.langRestrict, 'Fantasia', config.params.langRestrict), volume('wrong', 'Outro', 'es')]); };
  const s = store(); s.idiomasSelecionados = ['pt', 'en']; s.categoriasSelecionadas = ['fantasy']; s.ordenacao = 'newest';
  await s.pesquisarLivros('Fantasia');
  assert.deepEqual(calls.map(call => call.params.langRestrict), ['pt', 'en']);
  assert.ok(calls.every(call => call.params.orderBy === 'newest' && call.params.q.includes('subject:"fantasy"')));
  assert.deepEqual(s.resultadosExplore.map(book => book.idioma).sort(), ['en', 'pt']);
});
test('paginação busca a próxima página e cache evita consultas repetidas', async () => {
  const calls = [];
  handler = async config => {
    calls.push(config.params.startIndex);
    return ok(config, config.params.startIndex ? [volume('next', 'Novo')] : Array.from({ length: 40 }, (_, i) => volume(String(i), `Livro ${i}`)));
  };
  const s = store(); s.ordenacao = 'newest';
  await s.pesquisarLivros('Livros'); assert.equal(s.temMaisExplore, true);
  await s.carregarMaisExplore();
  assert.equal(s.resultadosExplore.length, 41); assert.equal(s.temMaisExplore, false);
  assert.deepEqual(calls, [0, 40]);
  await s.pesquisarLivros('Livros'); assert.deepEqual(calls, [0, 40]);
});
test('resposta atrasada não substitui uma pesquisa mais recente', async () => {
  let resolveOld;
  handler = config => config.params.q === 'antiga'
    ? new Promise(resolve => { resolveOld = () => resolve(ok(config, [volume('old', 'Antigo')])); })
    : Promise.resolve(ok(config, [volume('new', 'Novo')]));
  const s = store(); s.ordenacao = 'newest';
  const old = s.pesquisarLivros('antiga'); await s.pesquisarLivros('nova'); resolveOld(); await old;
  assert.deepEqual(s.resultadosExplore.map(book => book.id), ['new']);
  assert.equal(s.buscandoExplore, false); assert.equal(s.erroExplore, null);
});
test('limite da API aparece como erro em vez de busca vazia', async () => {
  handler = async () => { throw Object.assign(new Error('quota'), { response: { status: 429 } }); };
  const s = store(); await s.pesquisarLivros('Harry Potter');
  assert.match(s.erroExplore, /limite de consultas/); assert.equal(s.buscandoExplore, false);
});
test('falha parcial mantém livros disponíveis com aviso', async () => {
  handler = async config => {
    if (config.params.q.startsWith('intitle:')) throw new Error('offline');
    return ok(config, [volume('book', 'Harry Potter')]);
  };
  const s = store(); await s.pesquisarLivros('Harry Potter');
  assert.equal(s.resultadosExplore.length, 1); assert.ok(s.avisoExplore); assert.equal(s.erroExplore, null);
});
test('limpar termo e filtros volta ao estado inicial', async () => {
  handler = async config => ok(config, [volume('a', 'Livro')]);
  const s = store(); await s.pesquisarLivros('Livro'); await s.pesquisarLivros('');
  assert.equal(s.jaBuscou, false); assert.deepEqual(s.resultadosExplore, []); assert.equal(s.temMaisExplore, false);
});

test('Diário de um Banana usa palavras do título se as consultas iniciais vierem vazias', async () => {
  const calls = [];
  handler = async config => {
    calls.push(config.params.q);
    return ok(config, config.params.q === 'intitle:diario intitle:banana' ? [volume('banana', 'Diário de um Banana')] : []);
  };
  const s = store();
  await s.pesquisarLivros('diario de um banana');
  assert.deepEqual(calls, ['diario de um banana', 'intitle:"diario de um banana"', 'intitle:diario intitle:banana']);
  assert.equal(s.resultadosExplore[0].id, 'banana');
  assert.equal(s.erroExplore, null);
});
test('uma consulta vazia e outra com falha produzem erro, nunca nenhum livro encontrado', async () => {
  handler = async config => {
    if (config.params.q.startsWith('intitle:')) throw new Error('network');
    return ok(config, []);
  };
  const s = store(); await s.pesquisarLivros('diario de um banana');
  assert.ok(s.erroExplore);
  assert.equal(s.buscandoExplore, false);
});
test('respostas vazias não são cacheadas e uma nova tentativa consulta o provedor', async () => {
  let available = false;
  handler = async config => ok(config, available ? [volume('banana', 'Diário de um Banana')] : []);
  const s = store(); await s.pesquisarLivros('diario de um banana');
  assert.equal(s.resultadosExplore.length, 0);
  available = true;
  await s.pesquisarLivros('diario de um banana');
  assert.equal(s.resultadosExplore[0].id, 'banana');
});
test('Enter durante a busca automática compartilha a requisição que já está em andamento', async () => {
  let release;
  let calls = 0;
  handler = config => { calls++; return new Promise(resolve => { release = () => resolve(ok(config, [volume('banana', 'Diário de um Banana')])); }); };
  const s = store(); s.ordenacao = 'newest';
  const first = s.pesquisarLivros('diario de um banana');
  const second = s.pesquisarLivros('diario de um banana', { refresh: true });
  assert.equal(calls, 1);
  release(); await Promise.all([first, second]);
  assert.equal(calls, 1);
  assert.equal(s.resultadosExplore[0].id, 'banana');
});
test('uma falha nas notas ReadMore não bloqueia os resultados do catálogo', async t => {
  ratingHandler = async () => { throw new Error('backend offline'); };
  t.after(() => { ratingHandler = defaultRatingHandler; });
  handler = async config => ok(config, [volume('banana', 'Diário de um Banana')]);
  const s = store(); await s.pesquisarLivros('diario de um banana');
  assert.equal(s.buscandoExplore, false);
  assert.equal(s.resultadosExplore[0].id, 'banana');
});

const { effectScope } = await import('vue');
const { useExploreSearch } = await import('../src/composables/useExploreSearch.js');
const flush = () => new Promise(resolve => setImmediate(resolve));
test('digitar dispara busca sem Enter apenas após a pausa e usa o texto mais recente', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const calls = [];
  handler = async config => { calls.push(config.params.q); return ok(config, [volume('banana', 'Diário de um Banana')]); };
  const s = store(); const scope = effectScope();
  const search = scope.run(() => useExploreSearch(s));
  t.after(() => scope.stop());
  s.termoBusca = 'diario'; t.mock.timers.tick(300);
  s.termoBusca = 'diario de um'; t.mock.timers.tick(300);
  s.termoBusca = 'diario de um banana';
  assert.equal(search.agendandoBusca.value, true);
  assert.equal(calls.length, 0);
  t.mock.timers.tick(650); await flush();
  assert.equal(search.agendandoBusca.value, false);
  assert.deepEqual(calls, ['diario de um banana', 'intitle:"diario de um banana"']);
  assert.equal(s.resultadosExplore[0].id, 'banana');
});
test('Enter na mesma atualização do input não é cancelado por watchers e não agenda busca duplicada', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const calls = [];
  handler = async config => { calls.push(config.params.q); return ok(config, [volume('banana', 'Diário de um Banana')]); };
  const s = store(); const scope = effectScope();
  const search = scope.run(() => useExploreSearch(s));
  t.after(() => scope.stop());
  s.termoBusca = 'diario de um banana';
  await search.buscar(); t.mock.timers.tick(1000); await flush();
  assert.equal(calls.length, 2);
  assert.equal(search.agendandoBusca.value, false);
  assert.equal(s.resultadosExplore[0].id, 'banana');
});
test('sair da tela cancela o timer da busca automática', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let calls = 0;
  handler = async config => { calls++; return ok(config, []); };
  const s = store(); const scope = effectScope();
  scope.run(() => useExploreSearch(s));
  s.termoBusca = 'diario de um banana'; scope.stop();
  t.mock.timers.tick(1000); await flush();
  assert.equal(calls, 0);
});

// Monta a barra Vue real com um renderer em memória; os eventos exercitam
// o mesmo v-model, debounce e submit usados pela tela, sem exigir navegador.
const { createRenderer, h, defineComponent } = await import('vue');
const { default: BarraBusca } = await import('../src/components/explore/BarraBusca.vue');
function mountSearch(s) {
  const node = type => ({ type, props: {}, children: [], parent: null });
  const renderer = createRenderer({
    createElement: node, createText: text => ({ ...node('text'), text }), createComment: node,
    insert(child, parent, anchor = null) {
      if (child.parent) { const old = child.parent.children.indexOf(child); if (old >= 0) child.parent.children.splice(old, 1); }
      child.parent = parent;
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      if (index < 0) parent.children.push(child); else parent.children.splice(index, 0, child);
    },
    remove(child) { if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); },
    setText(el, text) { el.text = text; }, setElementText(el, text) { el.text = text; },
    parentNode: el => el.parent, nextSibling: el => el.parent?.children[el.parent.children.indexOf(el) + 1],
    patchProp(el, key, old, value) { el.props[key] = value; },
  });
  const root = node('root');
  let controls;
  const app = renderer.createApp(defineComponent({ setup() {
    controls = useExploreSearch(s);
    return () => h(BarraBusca, { modelValue: s.termoBusca, 'onUpdate:modelValue': value => { s.termoBusca = value; }, onBuscar: controls.buscar });
  } }));
  app.mount(root);
  const find = (el, type) => el.type === type ? el : el.children.map(child => find(child, type)).find(Boolean);
  return { input: find(root, 'input'), form: find(root, 'form'), controls, unmount: () => app.unmount() };
}
test('barra Vue real: digitar Diário de um Banana busca automaticamente sem enviar o formulário', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const calls = [];
  handler = async config => { calls.push(config.params.q); return ok(config, [volume('banana-ui', 'Diário de um Banana')]); };
  const s = store(); const ui = mountSearch(s); t.after(ui.unmount);
  for (const value of ['diario', 'diario de', 'diario de um banana']) {
    ui.input.props.onInput({ target: { value } });
    t.mock.timers.tick(100);
  }
  assert.equal(ui.controls.agendandoBusca.value, true);
  assert.equal(calls.length, 0);
  t.mock.timers.tick(650); await flush();
  assert.equal(s.resultadosExplore[0].id, 'banana-ui');
  assert.equal(calls.length, 2);
});
test('barra Vue real: Enter imediatamente após input usa o texto atual e não duplica a busca', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const calls = [];
  handler = async config => { calls.push(config.params.q); return ok(config, [volume('banana-enter', 'Diário de um Banana')]); };
  const s = store(); const ui = mountSearch(s); t.after(ui.unmount);
  ui.input.props.onInput({ target: { value: 'diario de um banana' } });
  ui.form.props.onSubmit({ preventDefault() {} });
  await flush(); t.mock.timers.tick(1000); await flush();
  assert.equal(calls[0], 'diario de um banana');
  assert.equal(calls.length, 2);
  assert.equal(s.resultadosExplore[0].id, 'banana-enter');
});
