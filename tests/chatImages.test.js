import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, h, nextTick, reactive } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import ChatAvatar from '../src/features/chat/components/ChatAvatar.vue';
import ChatAnuncioCard from '../src/features/chat/components/ChatAnuncioCard.vue';
import { FALLBACK_AVATAR, FALLBACK_CAPA } from '../src/utils/images.js';

function mount(component, props) {
  const node = type => ({ type, props: {}, children: [] });
  const renderer = createRenderer({
    createElement: node, createText: node, createComment: node,
    insert(child, parent) { child.parent = parent; parent.children.push(child); },
    remove(child) { child.parent.children = child.parent.children.filter(value => value !== child); },
    setText() {}, setElementText() {},
    parentNode: el => el.parent, nextSibling: () => null,
    patchProp(el, key, old, value) { el.props[key] = value; },
  });
  const root = node('root');
  const app = renderer.createApp({ render: () => h(component, props) });
  app.use(createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] }));
  app.mount(root);
  const find = (el, type) => el.type === type ? el : el.children.map(child => find(child, type)).find(Boolean);
  return { image: () => find(root, 'img'), unmount: () => app.unmount() };
}

test('avatar do chat resolve mídia e usa imagem padrão se a foto falhar', async t => {
  const props = reactive({ name: 'Ana', src: '/media/images/ana.jpg' });
  const ui = mount(ChatAvatar, props); t.after(ui.unmount);
  assert.match(ui.image().props.src, /\/media\/images\/ana.jpg$/);
  assert.ok(!ui.image().props.src.includes('/api/media/'));
  ui.image().props.onError({ target: ui.image() }); await nextTick();
  assert.equal(ui.image().props.src, FALLBACK_AVATAR);
  props.src = 'https://google.example/new.jpg'; await nextTick();
  assert.equal(ui.image().props.src, props.src);
});

test('avatar ausente mantém as iniciais', t => {
  const ui = mount(ChatAvatar, { name: 'Ana Souza' }); t.after(ui.unmount);
  assert.equal(ui.image(), undefined);
});

test('capa do chat tenta mídia, Google, ISBN e a capa padrão', async t => {
  const ui = mount(ChatAnuncioCard, { anuncio: {
    id: 42, tipo: 'troca', titulo: 'Dom Casmurro', capa: '/media/images/missing.jpg',
    google_book_id: 'real-google-id', isbn: '9788535914849',
  } }); t.after(ui.unmount);
  assert.match(ui.image().props.src, /\/media\/images\/missing.jpg$/);
  ui.image().props.onError({ target: ui.image() }); await nextTick();
  assert.match(ui.image().props.src, /\/livros\/capa-google\//);
  assert.ok(decodeURIComponent(ui.image().props.src).includes('id=real-google-id'));
  for (let attempt = 0; attempt < 8; attempt++) {
    ui.image().props.onError({ target: ui.image() }); await nextTick();
  }
  assert.equal(ui.image().props.src, FALLBACK_CAPA);
  assert.equal(ui.image().props.alt, 'Capa de Dom Casmurro');
});

test('cartão antigo sem capa usa a imagem padrão sem confundir anúncio com ID Google', t => {
  const ui = mount(ChatAnuncioCard, { anuncio: { id: '42', titulo: 'Livro', tipo: 'troca', capa: null } });
  t.after(ui.unmount);
  assert.equal(ui.image().props.src, FALLBACK_CAPA);
});

test('avatar tenta a foto Google quando a URL do upload não carrega', async t => {
  const ui = mount(ChatAvatar, { name: 'Ana', src: '/media/missing.jpg', fallbackSrc: 'https://google.example/avatar.jpg' });
  t.after(ui.unmount);
  ui.image().props.onError({ target: ui.image() }); await nextTick();
  assert.equal(ui.image().props.src, 'https://google.example/avatar.jpg');
  ui.image().props.onError({ target: ui.image() }); await nextTick();
  assert.equal(ui.image().props.src, FALLBACK_AVATAR);
});
