import test from 'node:test'
import assert from 'node:assert/strict'
import { createRenderer, computed, h, nextTick, ref } from 'vue'
import { createPinia, defineStore } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ChatNotifications from '../src/features/chat/components/ChatNotifications.vue'
import { applyEvent, createState } from '../src/features/chat/lib/chatState.js'

test('sino atualiza mensagens, abre a conversa e limpa após leitura', async () => {
  globalThis.document = { addEventListener() {}, removeEventListener() {} }
  const pinia = createPinia()
  const chat = defineStore('chatStore', () => {
    const rooms = ref([])
    return { rooms, unreadTotal: computed(() => rooms.value.reduce((sum, r) => sum + r.unread, 0)), roomsLoaded: true, loadingRooms: false, roomsError: '' }
  })(pinia)
  const node = type => ({ type, props: {}, children: [], text: '' })
  const renderer = createRenderer({
    createElement: node, createText: node, createComment: node,
    insert(child, parent) { child.parent = parent; parent.children.push(child) },
    remove(child) { child.parent.children = child.parent.children.filter(n => n !== child) },
    setText(el, text) { el.text = text }, setElementText(el, text) { el.text = text },
    parentNode: el => el.parent, nextSibling: () => null,
    patchProp(el, key, old, value) { el.props[key] = value },
  })
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }, { path: '/conversas/:roomId', name: 'conversa', component: { render: () => null } }] })
  await router.push('/home')
  const root = node('root')
  const app = renderer.createApp({ render: () => h(ChatNotifications) })
  app.use(pinia).use(router).mount(root)
  const all = (el, match) => [...(match(el) ? [el] : []), ...el.children.flatMap(child => all(child, match))]
  const text = el => el.text + el.children.map(text).join(' ')
  try {
    const bell = all(root, n => n.type === 'button')[0]
    bell.props.onClick(); await nextTick()
    assert.match(text(root), /Nenhuma mensagem não lida/)
    chat.rooms = [{ id: 7, name: 'Ana', unread: 2, last_message: { body: 'Olá, o livro está disponível?' } }]
    await nextTick()
    assert.match(bell.props['aria-label'], /2 mensagens não lidas/)
    assert.match(text(root), /Olá, o livro está disponível/)
    const link = all(root, n => n.type === 'a' && n.props.href === '/conversas/7')[0]
    assert.ok(link)
    await router.push(link.props.href); await nextTick()
    assert.equal(all(root, n => n.props.id === 'chat-notifications').length, 0)
    chat.rooms[0].unread = 0
    bell.props.onClick(); await nextTick()
    assert.match(text(root), /Nenhuma mensagem não lida/)
    assert.equal(bell.props['aria-label'], 'Notificações')
  } finally { app.unmount(); delete globalThis.document }
})

test('pop-up avisa mensagens recebidas sem interromper conversa visível', () => {
  const event = { type: 'message.new', room: 7, message: { id: 10, author: { id: 2 }, body: 'Olá' } }
  const effects = options => applyEvent(createState(), event, { meId: 1, ...options })
  assert.equal(effects({}).filter(e => e.type === 'notify').length, 1)
  assert.equal(effects({ activeRoomId: 7 }).filter(e => e.type === 'notify').length, 0)
  assert.equal(effects({ activeRoomId: 7, visible: false }).filter(e => e.type === 'notify').length, 1)
  assert.equal(effects({ meId: 2 }).filter(e => e.type === 'notify').length, 0)
})
