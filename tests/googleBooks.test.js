import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { createPinia, setActivePinia } from 'pinia';
let handler;
let savedHandler = config => Promise.resolve({ data: [], status: 200, headers: {}, config });
const defaultRatingHandler = config => Promise.resolve({ data: [], status: 200, headers: {}, config });
let ratingHandler = defaultRatingHandler;
axios.defaults.adapter = config => config.url === "/livros/avaliacoes/" ? ratingHandler(config) : config.url === "/livros/recomendados/" ? savedHandler(config) : handler(config);
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

const { GENERAL_RECOMMENDATIONS, selectRecommendedEdition } = await import('../src/utils/generalRecommendations.js');
const recommendedVolume = (index, suffix = '') => ({
  id: `recommended-${index}${suffix}`,
  volumeInfo: { title: GENERAL_RECOMMENDATIONS[index][0], authors: [GENERAL_RECOMMENDATIONS[index][1]], language: 'pt' },
});
const recommendationQuery = config => config.params.q || `${config.params.titulo} ${config.params.autor}`;
const recommendationHandler = config => {
  const index = GENERAL_RECOMMENDATIONS.findIndex(([title]) => recommendationQuery(config) === `${title} ${GENERAL_RECOMMENDATIONS.find(entry => entry[0] === title)[1]}`);
  return ok(config, index < 0 ? [] : [recommendedVolume(index), recommendedVolume(index, '-edition')]);
};
test('recomendados gerais contêm apenas obras selecionadas e uma edição por obra', async () => {
  handler = async config => {
    const data = recommendationHandler(config);
    data.data.items.push(volume('unknown', 'Livro desconhecido'));
    return data;
  };
  const s = store(); await s.buscarRecomendados(true);
  assert.equal(s.resultados.length, 12);
  assert.equal(s.resultados[0].titulo, 'Dom Casmurro');
  assert.equal(s.resultados[1].titulo, 'O Pequeno Príncipe');
  assert.equal(s.temMaisRecomendados, true);
  assert.equal(s.error, null);
});
test('carregar mais faz novas consultas e continua além de dois cliques', async () => {
  const calls = [];
  handler = async config => { calls.push(recommendationQuery(config)); return recommendationHandler(config); };
  const s = store(); await s.buscarRecomendados(true);
  const initial = s.resultados.map(book => book.id);
  for (let i = 0; i < 3; i++) await s.carregarMaisRecomendados();
  assert.equal(s.resultados.length, 48);
  assert.deepEqual(s.resultados.slice(0, 12).map(book => book.id), initial);
  assert.equal(calls.length, 48);
  assert.equal(s.temMaisRecomendados, true);
  while (s.temMaisRecomendados) await s.carregarMaisRecomendados();
  assert.equal(s.resultados.length, GENERAL_RECOMMENDATIONS.length);
  assert.equal(new Set(calls).size, calls.length);
});
test('filtro rejeita resumos e títulos de outros autores', () => {
  const entry = GENERAL_RECOMMENDATIONS[0];
  const correct = recommendedVolume(0);
  const wrongAuthor = { id: 'wrong', volumeInfo: { title: entry[0], authors: ['Outro autor'] } };
  const summary = { id: 'summary', volumeInfo: { title: entry[0], authors: [entry[1]], subtitle: 'Resumo e análise' } };
  assert.equal(selectRecommendedEdition([wrongAuthor, summary, correct], entry).id, correct.id);
  assert.equal(selectRecommendedEdition([wrongAuthor, summary], entry), undefined);
});
test('falha ao carregar mais preserva livros e permite tentar novamente', async t => {
  handler = async config => recommendationHandler(config);
  const s = store(); await s.buscarRecomendados(true);
  handler = async () => { throw Object.assign(new Error('quota'), { response: { status: 429 } }); };
  await s.carregarMaisRecomendados();
  assert.equal(s.resultados.length, 12);
  assert.ok(s.erroMaisRecomendados);
  assert.equal(s.temMaisRecomendados, true);
  handler = async config => recommendationHandler(config);
  const originalNow = Date.now;
  t.mock.method(Date, 'now', () => originalNow() + 61000);
  await s.carregarMaisRecomendados();
  assert.equal(s.resultados.length, 24);
  assert.equal(s.erroMaisRecomendados, null);
});
test('falha das fontes limita a rodada sem bloquear a próxima tentativa', async () => {
  let calls = 0;
  handler = async () => {
    calls++;
    throw Object.assign(new Error('temporary'), { response: { status: 503 } });
  };
  const s = store(); await s.buscarRecomendados(true);
  assert.equal(calls, 3);
  assert.match(s.error, /temporariamente indisponível/);
  await s.buscarRecomendados(true);
  assert.equal(calls, 6);
});
test('catálogo local exibe livros e permite paginação mesmo com Google retornando 503', async t => {
  const previous = savedHandler;
  t.after(() => { savedHandler = previous; });
  savedHandler = async config => ({ data: GENERAL_RECOMMENDATIONS.slice(0, 30).map(([titulo, author], i) => ({
    id: i + 1, titulo, autores: [{ nome: author }], google_book_id: `saved-${i}`,
  })), status: 200, headers: {}, config });
  handler = async () => { throw Object.assign(new Error('temporary'), { response: { status: 503 } }); };
  const s = store(); await s.buscarRecomendados(true);
  assert.equal(s.resultados.length, 12);
  assert.equal(s.resultados[0].origem, 'local');
  assert.equal(s.error, null);
  await s.carregarMaisRecomendados();
  assert.equal(s.resultados.length, 24);
  await s.carregarMaisRecomendados();
  assert.equal(s.resultados.length, 30);
  assert.ok(s.avisoRecomendados);
  assert.equal(s.erroMaisRecomendados, null);
});
test('recomendados consultam o backend, sem expor chave ou depender de XHR direto ao Google', async () => {
  const calls = [];
  handler = async config => { calls.push(config); return recommendationHandler(config); };
  const s = store(); await s.buscarRecomendados(true);
  assert.equal(s.resultados.length, 12);
  assert.equal(calls[0].url, '/livros/catalogo-recomendados/');
  assert.equal(calls[0].params.titulo, 'Dom Casmurro');
  assert.equal(calls[0].params.autor, 'Machado de Assis');
  assert.equal(calls[0].params.key, undefined);
});
test('cache restaura a posição da paginação sem repetir consultas anteriores', async t => {
  const memory = new Map();
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
  } });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  });
  const calls = [];
  handler = async config => { calls.push(recommendationQuery(config)); return recommendationHandler(config); };
  const first = store(); await first.buscarRecomendados(true);
  await first.carregarMaisRecomendados();
  assert.equal(calls.length, 24);
  const restored = store(); await restored.buscarRecomendados();
  assert.equal(calls.length, 24);
  assert.equal(restored.resultados.length, 24);
  await restored.carregarMaisRecomendados();
  assert.equal(calls.length, 36);
  assert.equal(restored.resultados.length, 36);
  assert.equal(new Set(calls).size, 36);
});

test('edições com subtítulo ou indicação de bolso continuam elegíveis', () => {
  const book = { id: 'edition', volumeInfo: { title: 'Dona Flor e seus dois maridos (Edição de bolso)', authors: ['Jorge Amado'], language: 'pt' } };
  assert.equal(selectRecommendedEdition([book], ['Dona Flor e Seus Dois Maridos', 'Jorge Amado']).id, 'edition');
  book.volumeInfo.title = 'A revolução dos bichos: um conto de fadas';
  book.volumeInfo.authors = ['George Orwell'];
  assert.equal(selectRecommendedEdition([book], ['A Revolução dos Bichos', 'George Orwell']).id, 'edition');
});

function editionISBN(index) {
  const digits = String(978000000000 + index);
  const checksum = (10 - [...digits].reduce((sum, digit, i) => sum + Number(digit) * (i % 2 ? 3 : 1), 0) % 10) % 10;
  return digits + checksum;
}
test('20 livros locais não limitam a busca: novos cliques acrescentam edições da fonte alternativa', async t => {
  const previous = savedHandler;
  t.after(() => { savedHandler = previous; });
  savedHandler = async config => ({ data: GENERAL_RECOMMENDATIONS.slice(0, 20).map(([titulo, author], i) => ({
    id: i + 1, titulo, autores: [{ nome: author }],
  })), status: 200, headers: {}, config });
  handler = async config => {
    const index = GENERAL_RECOMMENDATIONS.findIndex(([title]) => title === config.params.titulo);
    const book = recommendedVolume(index);
    book.id = `isbn:${editionISBN(index)}`;
    book.source = 'openlibrary';
    book.volumeInfo.industryIdentifiers = [{ type: 'ISBN_13', identifier: editionISBN(index) }];
    return ok(config, [book]);
  };
  const s = store(); await s.buscarRecomendados(true);
  for (let i = 0; i < 4; i++) await s.carregarMaisRecomendados();
  assert.equal(s.resultados.length, 60);
  assert.equal(s.resultados.filter(book => book.origem === 'openlibrary').length, 40);
  assert.ok(s.resultados.filter(book => book.origem === 'openlibrary').every(book => book.google_book_id === null));
  assert.equal(new Set(s.resultados.map(book => book.id)).size, 60);
  assert.equal(s.erroMaisRecomendados, null);
});
test('busca continua além de 24 títulos vazios até encontrar uma página de livros', async () => {
  handler = async config => {
    const index = GENERAL_RECOMMENDATIONS.findIndex(([title]) => title === config.params.titulo);
    return index < 27 ? ok(config, []) : recommendationHandler(config);
  };
  const s = store(); await s.buscarRecomendados(true);
  assert.equal(s.resultados.length, 12);
  assert.equal(s.resultados[0].titulo, GENERAL_RECOMMENDATIONS[27][0]);
});
test('uma consulta com falha não impede resultados de outras obras na mesma página', async () => {
  handler = async config => {
    if (config.params.titulo === GENERAL_RECOMMENDATIONS[0][0]) throw Object.assign(new Error('503'), { response: { status: 503 } });
    return recommendationHandler(config);
  };
  const s = store(); await s.buscarRecomendados(true);
  assert.equal(s.resultados.length, 12);
  assert.equal(s.error, null);
});
test('detalhes de uma edição alternativa usam ISBN no backend, sem consulta ao Google', async () => {
  const isbn = '9780451524935';
  const book = { ...recommendedVolume(2), id: `isbn:${isbn}`, source: 'openlibrary' };
  book.volumeInfo.industryIdentifiers = [{ type: 'ISBN_13', identifier: isbn }];
  handler = async config => {
    assert.equal(config.url, '/livros/catalogo-edicao/');
    assert.equal(config.params.isbn, isbn);
    return { data: book, status: 200, headers: {}, config };
  };
  const s = store(); await s.buscarLivro(`isbn:${isbn}`);
  assert.equal(s.livroSelecionado.origem, 'openlibrary');
  assert.equal(s.livroSelecionado.google_book_id, null);
  assert.equal(s.livroSelecionado.isbn, isbn);
});

test('botão real da grade carrega novas obras após esgotar os 20 livros locais', async t => {
  const { default: GradeBook } = await import('../src/components/books/GradeBook.vue');
  const previousHandler = savedHandler;
  const previousObserver = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  t.after(() => { savedHandler = previousHandler; globalThis.ResizeObserver = previousObserver; });
  savedHandler = async config => ({ data: GENERAL_RECOMMENDATIONS.slice(0, 20).map(([titulo, author], i) => ({
    id: i + 1, titulo, autores: [{ nome: author }],
  })), status: 200, headers: {}, config });
  handler = async config => {
    const index = GENERAL_RECOMMENDATIONS.findIndex(([title]) => title === config.params.titulo);
    const book = recommendedVolume(index);
    book.source = 'openlibrary'; book.id = `isbn:${editionISBN(index)}`;
    book.volumeInfo.industryIdentifiers = [{ type: 'ISBN_13', identifier: editionISBN(index) }];
    return ok(config, [book]);
  };
  const s = store(); await s.buscarRecomendados(true);
  const node = type => ({ type, props: {}, children: [], parent: null, clientWidth: 800 });
  const renderer = createRenderer({
    createElement: node, createText: text => ({ ...node('text'), text }), createComment: node,
    insert(child, parent, anchor) {
      child.parent = parent;
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      if (index < 0) parent.children.push(child); else parent.children.splice(index, 0, child);
    },
    remove(child) { if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); },
    setText(el, text) { el.text = text; }, setElementText(el, text) { el.text = text; },
    parentNode: el => el.parent, nextSibling: () => null,
    patchProp(el, key, old, value) { el.props[key] = value; },
  });
  const root = node('root');
  const app = renderer.createApp({ setup() { return () => h(GradeBook, {
    livros: s.resultados, temMaisRemoto: s.temMaisRecomendados, carregandoMais: s.carregandoMaisRecomendados,
    onCarregarMais: () => s.carregarMaisRecomendados(),
  }, { default: ({ livro }) => h('span', livro.titulo) }); } });
  app.mount(root); t.after(() => app.unmount()); await flush();
  const find = (el, predicate) => predicate(el) ? el : el.children.map(child => find(child, predicate)).find(Boolean);
  for (let i = 0; i < 4; i++) {
    const button = find(root, el => el.type === 'button');
    assert.ok(button); assert.equal(button.props.disabled, false);
    button.props.onClick(); await flush();
  }
  const grid = find(root, el => el.props.class === 'grade-livros');
  assert.ok(s.resultados.length > 20);
  assert.equal(grid.children.filter(el => el.props?.class === 'item-livro').length, s.resultados.length);
  assert.equal(s.erroMaisRecomendados, null);
});
