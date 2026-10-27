import { ref, watch, onScopeDispose } from 'vue';

// Digitação e Enter usam a mesma função; os watchers síncronos não cancelam
// um envio explícito no próximo ciclo de atualização do Vue.
export function useExploreSearch(store, { delay = 650 } = {}) {
  const agendandoBusca = ref(false);
  let timer = null;
  function stopTimer() {
    clearTimeout(timer);
    timer = null;
  }
  function buscar() {
    stopTimer();
    agendandoBusca.value = false;
    return store.pesquisarLivros(store.termoBusca, { refresh: true });
  }
  watch(() => store.termoBusca, () => { store.ordenacao = 'relevance'; }, { flush: 'sync' });
  watch(() => JSON.stringify([
    store.termoBusca, store.idiomasSelecionados, store.categoriasSelecionadas, store.ordenacao,
  ]), () => {
    stopTimer();
    agendandoBusca.value = true;
    store.cancelarBusca();
    timer = setTimeout(() => {
      timer = null;
      agendandoBusca.value = false;
      store.pesquisarLivros(store.termoBusca);
    }, delay);
  }, { flush: 'sync' });
  onScopeDispose(() => {
    stopTimer();
    store.cancelarBusca();
  });
  return { buscar, agendandoBusca };
}
