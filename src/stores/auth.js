import { computed, ref } from "vue";
import { defineStore } from "pinia";

import auth from "../services/auth";
import api from "../services/api";

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref(localStorage.getItem("access_token"));
  const refreshToken = ref(localStorage.getItem("refresh_token"));
  const user = ref(JSON.parse(localStorage.getItem("user")));

  const error = ref(null);

  const isAuthenticated = computed(() => !!accessToken.value);
  const userFirstName = computed(() => {
    if (!user.value?.name) return "";
    return user.value.name.trim().split(" ")[0];
  });

  async function login(email, password) {
    const { data } = await auth.login(email, password);
    accessToken.value = data.access;
    refreshToken.value = data.refresh;
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);

    const response = await auth.me();
    user.value = response.data;
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  async function loginWithGoogle(accessTokenGoogle) {
    const { data } = await auth.googleLogin(accessTokenGoogle);
    accessToken.value = data.access;
    refreshToken.value = data.refresh;
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);

    const response = await auth.me();
    user.value = response.data;
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  async function logout() {
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
    user.value.show_onboarding = showOnboarding;
    localStorage.setItem("user", JSON.stringify(user.value));
  }

  async function updateProfile({ name, bio, imgAttachmentKey } = {}) {
    if (name !== undefined && !name.trim()) return;

    error.value = null;
    const payload = {};

    if (name !== undefined) payload.name = name.trim();
    if (bio !== undefined) payload.bio = bio;

    // AJUSTADO AQUI: Enviando exatamente o nome que o SlugRelatedField espera receber
    if (imgAttachmentKey != null)
      payload.foto_attachment_key = imgAttachmentKey;

    if (Object.keys(payload).length === 0) return;

    try {
      const response = await api.patch("/usuarios/me/", payload);

      // Atualiza o estado global da store e o localStorage
      user.value = response.data;
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (err) {
      error.value = "Erro ao editar perfil.";
      console.error(err);
      throw err;
    }
  }
  return {
    accessToken,
    refreshToken,
    user,
    error,
    isAuthenticated,
    userFirstName,
    login,
    loginWithGoogle,
    logout,
    updateOnboardingPreference,
    updateProfile,
  };
});
