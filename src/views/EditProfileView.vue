<script setup>
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/auth";

import { Camera } from "lucide-vue-next";

const authStore = useAuthStore();

const form = ref({
  nome: authStore.user?.name || "",
  sobrenome: "",
  username: authStore.user?.username || "",
  bio: authStore.user?.bio || "",
  email: authStore.user?.email || "",
});

const userPhoto = computed(() => {
  if (authStore.user?.foto?.url) {
    return `http://127.0.0.1:8000${authStore.user.foto.url}`;
  }

  if (authStore.user?.google_picture) {
    return authStore.user.google_picture;
  }

  return "/imgs/avatar.jpeg";
});

const fileInput = ref(null);
const previewPhoto = ref(null);

const fotoArquivo = ref(null);

const selecionarFoto = () => {
  fileInput.value?.click();
};

const fotoSelecionada = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  fotoArquivo.value = file;
  previewPhoto.value = URL.createObjectURL(file);
};

const salvarPerfil = async () => {
  const formData = new FormData();

  formData.append("name", form.value.nome);
  formData.append("bio", form.value.bio);

  if (fotoArquivo.value) {
    formData.append("foto", fotoArquivo.value);
  }

  console.log([...formData.entries()]);
};
</script>

<template>
  <div class="perfil-page">
    <div class="perfil-container">
      <div class="perfil-header">
        <h1>Editar Perfil</h1>
        <p>Mantenha suas informações atualizadas.</p>
      </div>

      <div class="perfil-content">
        <div class="perfil-sidebar">
          <div class="avatar-container" @click="selecionarFoto">
            <img :src="userPhoto" alt="avatar" class="avatar" />

            <div class="camera-btn">
              <Camera :size="18" />
            </div>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="fotoSelecionada"
          />
        </div>

        <div class="perfil-form">
          <div class="grid-2">
            <div class="campo">
              <label>Nome</label>
              <input v-model="form.nome" type="text" />
            </div>

            <div class="campo">
              <label>Sobrenome</label>
              <input v-model="form.sobrenome" type="text" />
            </div>
          </div>

          <div class="campo">
            <label>Bio</label>
            <textarea v-model="form.bio" rows="5" maxlength="150"></textarea>

            <small> {{ form.bio.length }}/150 </small>
          </div>

          <div class="campo">
            <label>Email</label>
            <input v-model="form.email" type="email" />
          </div>

          <div class="acoes">
            <button class="btn-salvar" @click="salvarPerfil">Salvar alterações</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perfil-page {
  background: #f3e7d7;
  min-height: 100vh;
  padding: 50px;
}

.perfil-container {
  max-width: 1200px;
  margin: 0 auto;

  background: white;
  border-radius: 20px;
  padding: 40px;

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.perfil-header {
  margin-bottom: 40px;
}

.perfil-header h1 {
  color: #2d2d2d;
  margin-bottom: 8px;
}

.perfil-header p {
  color: #777;
}

.perfil-content {
  display: flex;
  gap: 50px;
}

.perfil-sidebar {
  min-width: 220px;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  position: relative;
  width: fit-content;
  cursor: pointer;
}

.avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #6b4226;
}

.camera-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;

  width: 42px;
  height: 42px;

  border: none;
  border-radius: 50%;

  background: white;
  color: #6b4226;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);

  transition: 0.2s;
}

.camera-btn:hover {
  transform: scale(1.08);
  background: #f3e7d7;
}

.btn-foto {
  margin-top: 20px;

  border: 1px solid #6b4226;
  background: white;
  color: #6b4226;

  padding: 12px 18px;
  border-radius: 12px;

  cursor: pointer;
}

.perfil-form {
  flex: 1;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 22px;
}

.campo label {
  margin-bottom: 8px;
  color: #444;
  font-weight: 500;
}

.campo input,
.campo textarea {
  border: 1px solid #ddd;
  border-radius: 12px;

  padding: 14px;

  font-size: 1rem;

  outline: none;
  transition: 0.2s;
}

.campo input:focus,
.campo textarea:focus {
  border-color: #6b4226;
}

.campo textarea {
  resize: none;
}

.campo small {
  margin-top: 6px;
  text-align: right;
  color: #888;
}

.acoes {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-salvar {
  background: #6b4226;
  color: white;

  border: none;

  padding: 14px 26px;
  border-radius: 12px;

  cursor: pointer;
  font-weight: 600;
}

.btn-salvar:hover {
  opacity: 0.9;
}

@media (max-width: 900px) {
  .perfil-page {
    padding: 20px;
  }

  .perfil-container {
    padding: 25px;
  }

  .perfil-content {
    flex-direction: column;
  }

  .grid-2 {
    grid-template-columns: 1fr;
  }

  .avatar {
    width: 140px;
    height: 140px;
  }

  .acoes {
    justify-content: stretch;
  }

  .btn-salvar {
    width: 100%;
  }
}
</style>
