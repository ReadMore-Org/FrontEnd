import api from "./api";

export default {
  login(email, password) {
    return api.post("/token/", {
      email,
      password,
    });
  },
  me() {
    return api.get("/usuarios/me");
  },
};
