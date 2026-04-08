import { defineStore } from 'pinia'
import { getLivros } from '@/services/livros'

export const useLivroStore = defineStore('livros', {
  state: () => ({
    livros: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchLivros() {
      this.loading = true
      this.error = null

      try {
        const response = await getLivros()
        this.livros = response.data
      } catch (err) {
        this.error = 'Erro ao carregar livros'
        console.error(err)
      } finally {
        this.loading = false
      }
    }
  }
})

/*
import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { getLivros } from '@/services/livros'

export const useLivrosStore = defineStore('livros', () => {
  const livros = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchTasks() {
    loading.value = true;
    error.value = null;
    try {
      const response = await getLivros.getAll();
      tasks.value = response.data;
    } catch (err) {
      error.value = 'Erro ao carregar tarefas.';
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function addTask(title) {
    if (!title.trim()) return;
    error.value = null;
    try {
      const response = await tasksApi.create(title.trim());
      tasks.value.push(response.data);
    } catch (err) {
      error.value = 'Erro ao adicionar tarefa.';
      console.error(err);
    }
  }

  async function toggleTask(id) {
    const task = tasks.value.find((t) => t.id === id);
    if (!task) return;
    error.value = null;
    try {
      const response = await tasksApi.update(id, { done: !task.done });
      const index = tasks.value.findIndex((t) => t.id === id);
      if (index !== -1) tasks.value[index] = response.data;
    } catch (err) {
      error.value = 'Erro ao atualizar tarefa.';
      console.error(err);
    }
  }

  async function removeTask(id) {
    error.value = null;
    try {
      await tasksApi.remove(id);
      tasks.value = tasks.value.filter((t) => t.id !== id);
    } catch (err) {
      error.value = 'Erro ao remover tarefa.';
      console.error(err);
    }
  }

  async function updateTaskTitle(id, title) {
    if (!title.trim()) return;
    error.value = null;
    try {
      const response = await tasksApi.update(id, { title: title.trim() });
      const index = tasks.value.findIndex((t) => t.id === id);
      if (index !== -1) tasks.value[index] = response.data;
    } catch (err) {
      error.value = 'Erro ao editar tarefa.';
      console.error(err);
    }
  }

  return {
    tasks,
    loading,
    error,
    pendingTasks,
    completedTasks,
    fetchTasks,
    addTask,
    toggleTask,
    removeTask,
    updateTaskTitle,
  };
});
*/
