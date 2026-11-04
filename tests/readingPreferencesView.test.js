import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, nextTick, h } from 'vue';
import { createPinia } from 'pinia';
import { routerKey } from 'vue-router';
const memory = new Map();
globalThis.requestAnimationFrame = callback => setTimeout(callback, 0);
globalThis.window = { getComputedStyle: () => ({ transitionDelay: '0s', transitionDuration: '0s', animationDelay: '0s', animationDuration: '0s' }) };
globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) };
const { default: View } = await import('../src/views/ReadingPreferencesView.vue');
const { default: api } = await import('../src/services/api.js');
const flush = async () => { await nextTick(); await new Promise(resolve => setTimeout(resolve, 15)); await nextTick(); };
const text = el => [el.text || '', ...el.children.map(text)].join(' ');
const find = (el, predicate) => predicate(el) ? el : el.children.map(child => find(child, predicate)).find(Boolean);
function mount(status = 'pending') {
  memory.set('access_token', 'test-token');
  memory.set('user', JSON.stringify({ id: 1, reading_preferences_status: status, reading_preferences: {} }));
  const node = type => ({ type, tagName: String(type).toUpperCase(), props: {}, children: [], value: '',
    addEventListener() {}, removeEventListener() {}, setAttribute() {}, focus() {},
    classList: { add() {}, remove() {} }, ownerDocument: { body: { offsetHeight: 0 } },
  });
  const renderer = createRenderer({
    createElement: node, createText: value => ({ ...node('text'), text: value }), createComment: node,
    insert(child, parent, anchor) { if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); child.parent = parent; const i = anchor ? parent.children.indexOf(anchor) : -1; if (i < 0) parent.children.push(child); else parent.children.splice(i, 0, child); },
    remove(child) { if (child?.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); },
    setText(el, value) { el.text = value; }, setElementText(el, value) { el.text = value; },
    parentNode: el => el.parent, nextSibling: el => el.parent?.children[el.parent.children.indexOf(el) + 1] || null,
    patchProp(el, key, old, value) { el.props[key] = value; },
  });
  const destinations = [];
  const app = renderer.createApp(View);
  app.use(createPinia());
  app.provide(routerKey, { replace: path => destinations.push(path), push: path => destinations.push(path) });
  app.component('RouterLink', { setup: (_, { slots }) => () => h('a', slots.default?.()) });
  app.component('Transition', { setup: (_, { slots }) => () => slots.default?.() });
  const root = node('root'); app.mount(root);
  const button = (label, className = '') => find(root, el => el.type === 'button' && text(el).includes(label) && (!className || String(el.props.class).includes(className)));
  return { app, root, button, destinations };
}

test('três etapas salvam escolhas; falha preserva o formulário e permite tentar novamente', async t => {
  const ui = mount(); t.after(() => ui.app.unmount());
  const requests = [];
  let fail = true;
  api.defaults.adapter = async config => {
    if (fail) throw new Error('offline');
    const payload = JSON.parse(config.data); requests.push(payload);
    return { config, status: 200, headers: {}, data: { id: 1, reading_preferences_status: payload.status, reading_preferences: payload } };
  };
  ui.button('Fantasia', 'category-option').props.onClick(); await flush();
  ui.button('Continuar').props.onClick(); await flush();
  ui.button('Tolkien', 'author-option').props.onClick(); await flush();
  ui.button('Continuar').props.onClick(); await flush();
  ui.button('O Hobbit', 'book-option').props.onClick(); await flush();
  ui.button('Encontrar minhas leituras').props.onClick(); await flush();
  assert.ok(text(ui.root).includes('Não foi possível salvar'));
  assert.equal(ui.destinations.length, 0);
  fail = false;
  ui.button('Encontrar minhas leituras').props.onClick(); await flush();
  assert.deepEqual(requests[0].categories, ['fantasy']);
  assert.deepEqual(requests[0].authors, ['Tolkien']);
  assert.equal(requests[0].books[0].title, 'O Hobbit');
  assert.equal(requests[0].status, 'completed');
  assert.deepEqual(ui.destinations, ['/home']);
});
test('agora não salva a decisão de pular e leva à home', async t => {
  const ui = mount(); t.after(() => ui.app.unmount());
  let payload;
  api.defaults.adapter = async config => {
    payload = JSON.parse(config.data);
    return { config, status: 200, headers: {}, data: { id: 1, reading_preferences_status: 'skipped', reading_preferences: {} } };
  };
  ui.button('Agora não').props.onClick(); await flush();
  assert.equal(payload.status, 'skipped');
  assert.deepEqual(ui.destinations, ['/home']);
  assert.equal(JSON.parse(memory.get('user')).reading_preferences_status, 'skipped');
});
