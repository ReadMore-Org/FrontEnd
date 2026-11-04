import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer, h, nextTick } from 'vue';
import AppImage from '../src/components/common/AppImage.vue';
import { FALLBACK_CAPA } from '../src/utils/images.js';

function mountImage(props) {
  const node = type => ({ type, props: {}, children: [] });
  const renderer = createRenderer({
    createElement: node, createText: node, createComment: node,
    insert(child, parent) { child.parent = parent; parent.children.push(child); },
    remove() {}, setText() {}, setElementText() {},
    parentNode: el => el.parent, nextSibling: () => null,
    patchProp(el, key, old, value) { el.props[key] = value; },
  });
  const root = node('root');
  const app = renderer.createApp({ render: () => h(AppImage, props) });
  app.mount(root);
  return { image: root.children[0], unmount: () => app.unmount() };
}

test('falha ao obter capa Google mantém a substituição pela padrão', async t => {
  const ui = mountImage({ src: 'https://books.google.com/books/content?id=missing&img=1' });
  t.after(ui.unmount);
  assert.ok(ui.image.props.src.includes('/livros/capa-google/?'));
  ui.image.props.onError({ target: ui.image });
  await nextTick();
  assert.equal(ui.image.props.src, FALLBACK_CAPA);
});

test('fotos e capas locais não passam pelo verificador Google', t => {
  const avatar = mountImage({ src: 'https://books.google.com/photo.jpg', avatar: true });
  const cover = mountImage({ src: '/imgs/capa.jpg' });
  t.after(avatar.unmount); t.after(cover.unmount);
  assert.equal(avatar.image.props.src, 'https://books.google.com/photo.jpg');
  assert.equal(cover.image.props.src, '/imgs/capa.jpg');
});

test('Open Library ausente usa livro_sem_capa.png ao falhar ou retornar um pixel vazio', async t => {
  for (const event of ['onError', 'onLoad']) {
    const ui = mountImage({ src: 'https://covers.openlibrary.org/b/id/123-L.jpg?default=true' });
    t.after(ui.unmount);
    assert.equal(new URL(ui.image.props.src).searchParams.get('default'), 'false');
    ui.image.props[event]({ target: { naturalWidth: 1, naturalHeight: 1 } });
    await nextTick();
    assert.equal(ui.image.props.src, FALLBACK_CAPA);
  }
});
test('capas reais do Open Library continuam aparecendo', async t => {
  const ui = mountImage({ src: 'https://covers.openlibrary.org/b/id/123-L.jpg' });
  t.after(ui.unmount);
  ui.image.props.onLoad({ target: { naturalWidth: 128, naturalHeight: 196 } });
  await nextTick();
  assert.match(ui.image.props.src, /covers.openlibrary.org/);
});

test('as duas imagens genéricas da captura tentam outra capa antes da padrão', async t => {
  const { default: samples } = await import('../src/utils/missingCoverSamples.json', { with: { type: 'json' } });
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else delete globalThis.document;
  });
  for (const sample of samples) {
    const rgba = [];
    for (let i = 0; i < sample.length; i += 3) rgba.push(...sample.slice(i, i + 3), 255);
    Object.defineProperty(globalThis, 'document', { configurable: true, value: {
      createElement: () => ({ getContext: () => ({ drawImage() {}, getImageData: () => ({ data: rgba }) }) }),
    } });
    const ui = mountImage({ src: 'https://covers.openlibrary.org/b/id/123-L.jpg', fallbacks: ['/imgs/outra-capa.jpg'] });
    t.after(ui.unmount);
    ui.image.props.onLoad({ target: { naturalWidth: 180, naturalHeight: 260 } });
    await nextTick();
    assert.equal(ui.image.props.src, '/imgs/outra-capa.jpg');
  }
});

test('capa genérica explícita não interrompe a busca por uma capa real', async t => {
  const ui = mountImage({ src: 'https://books.google.com/googlebooks/images/no_cover.gif', fallbacks: ['/imgs/real.jpg'] });
  t.after(ui.unmount);
  assert.equal(ui.image.props.src, '/imgs/real.jpg');
  ui.image.props.onError({ target: ui.image });
  await nextTick();
  assert.equal(ui.image.props.src, FALLBACK_CAPA);
});
test('uma capa Google indisponível tenta Open Library e só usa a padrão após esgotar as fontes', async t => {
  const statuses = [];
  const ui = mountImage({ src: 'https://books.google.com/books/content?id=missing',
    fallbacks: ['https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg'],
    onCoverStatus: status => statuses.push(status),
  });
  t.after(ui.unmount);
  ui.image.props.onError({ target: ui.image });
  await nextTick();
  assert.match(ui.image.props.src, /covers.openlibrary.org/);
  ui.image.props.onLoad({ target: { naturalWidth: 128, naturalHeight: 196 } });
  assert.deepEqual(statuses, [true]);
  ui.image.props.onError({ target: ui.image });
  await nextTick();
  assert.equal(ui.image.props.src, FALLBACK_CAPA);
  ui.image.props.onLoad({ target: { naturalWidth: 1024, naturalHeight: 1536 } });
  assert.deepEqual(statuses, [true, false]);
});
