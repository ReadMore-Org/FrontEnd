import { ref, onMounted, onBeforeUnmount } from 'vue';
export function useReducedMotion() {
  const reducedMotion = ref(false);
  let query;
  const update = () => { reducedMotion.value = query.matches; };
  onMounted(() => {
    query = window.matchMedia('(prefers-reduced-motion: reduce)');
    update();
    query.addEventListener('change', update);
  });
  onBeforeUnmount(() => query?.removeEventListener('change', update));
  return reducedMotion;
}
