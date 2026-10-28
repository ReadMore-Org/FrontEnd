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
