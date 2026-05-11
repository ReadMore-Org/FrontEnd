import api from "./api";

export default {
  login(email, password) {
    return api.post("/token/", {
      email,
      password,
    });
  },
};
