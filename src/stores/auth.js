import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import auth from '../services/auth';

export const useAuthStore = defineStore('auth', () => {

  const accessToken = ref(
    localStorage.getItem('access_token')
  );

  const refreshToken = ref(
    localStorage.getItem('refresh_token')
  );

  const isAuthenticated = computed(
    () => !!accessToken.value
  );

  async function login(email, password) {

    const { data } = await auth.login(
      email,
      password
    );

    accessToken.value = data.access;
    refreshToken.value = data.refresh;

    localStorage.setItem(
      'access_token',
      data.access
    );

    localStorage.setItem(
      'refresh_token',
      data.refresh
    );
  }

  function logout() {
    accessToken.value = null;
    refreshToken.value = null;

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  return {
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    logout
  };
});