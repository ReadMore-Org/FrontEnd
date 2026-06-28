import api from "./api";

export default {

  login(email, password) {
    return api.post("/token/", {
      email,
      password,
    });
  },

  googleLogin(access_token) {
    return api.post("/google-login/", {
      access_token,
    });
  },

  me() {
    return api.get("/usuarios/me");
  },

};