import { computed, ref } from "vue";
import { defineStore } from "pinia";

import auth from "../services/auth";
import api from "../services/api";

export const useAuthStore = defineStore("auth", () => {

  const accessToken = ref(
    localStorage.getItem("access_token")
  );

  const refreshToken = ref(
    localStorage.getItem("refresh_token")
  );

  const user = ref(
    JSON.parse(localStorage.getItem("user"))
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
      "access_token",
      data.access
    );

    localStorage.setItem(
      "refresh_token",
      data.refresh
    );

    // busca usuário autenticado
    const response = await auth.me();

    user.value = response.data;

    localStorage.setItem(
      "user",
      JSON.stringify(response.data)
    );
  }

  async function loginWithGoogle(accessTokenGoogle) {

  const { data } = await auth.googleLogin(
    accessTokenGoogle
  );

  accessToken.value = data.access;
  refreshToken.value = data.refresh;

  localStorage.setItem(
    "access_token",
    data.access
  );

  localStorage.setItem(
    "refresh_token",
    data.refresh
  );

  // usuário vindo do backend
  user.value = data.user;

  localStorage.setItem(
    "user",
    JSON.stringify(data.user)
  );
}


  function logout() {

    accessToken.value = null;
    refreshToken.value = null;

    user.value = null;

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  async function updateOnboardingPreference(showOnboarding) {

    await api.patch("/usuarios/me/", {
      show_onboarding: showOnboarding,
    });

    user.value.show_onboarding =
      showOnboarding;

    localStorage.setItem(
      "user",
      JSON.stringify(user.value)
    );
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout,
    updateOnboardingPreference,
  };
});