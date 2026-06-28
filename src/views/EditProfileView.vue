<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth'; 
import { Camera } from 'lucide-vue-next'; 
import { useToast } from 'vue-toastification';

const toast = useToast(); 

const authStore = useAuthStore();

const nome = ref('');
const sobrenome = ref('');

const form = ref({
  username: authStore.user?.username || "",
  bio: authStore.user?.bio || "",
  email: authStore.user?.email || "",
});

onMounted(() => {
  const fullName = authStore.user?.name || '';
  const nameParts = fullName.trim().split(' ');
  
  nome.value = nameParts[0] || '';
  sobrenome.value = nameParts.slice(1).join(' ') || '';
});

const previewUrl = ref(null);
const imgAttachmentKey = ref(null);
const uploading = ref(false);

const userPhoto = computed(() => {
  if (previewUrl.value) return previewUrl.value;

  if (authStore.user?.foto) {
    if (typeof authStore.user.foto === "string") {
      return authStore.user.foto.startsWith("http")
        ? authStore.user.foto
        : `http://127.0.0.1:8000${authStore.user.foto}`;
    }
    if (authStore.user.foto.url) {
      return `http://127.0.0.1:8000${authStore.user.foto.url}`;
    }
  }

  if (authStore.user?.google_picture) return authStore.user.google_picture;

  return "/imgs/avatar.jpeg";
});

const fileInput = ref(null);

const selecionarFoto = () => {
  if (uploading.value) return;
  fileInput.value?.click();
};

const fotoSelecionada = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  previewUrl.value = URL.createObjectURL(file);
  uploading.value = true;

  try {
    const data = await uploadImagem(file, "Avatar do usuário"); // Certifique-se que essa função está importada
    imgAttachmentKey.value = data.attachment_key;
  } catch (err) {
    console.error("Erro ao fazer upload da imagem", err);
    previewUrl.value = null;
    imgAttachmentKey.value = null;
  } finally {
    uploading.value = false;
  }
};

const salvarPerfil = async () => {
  if (uploading.value) return;
  
  const nomeCompleto = `${nome.value.trim()} ${sobrenome.value.trim()}`.trim();

  try {
    await authStore.updateProfile({
      name: nomeCompleto,
      bio: form.value.bio,
      imgAttachmentKey: imgAttachmentKey.value,
    });

    // Corrigido para português aqui!
    toast.success("Perfil atualizado com sucesso!", {
      timeout: 2000
    });

    previewUrl.value = null; 
    imgAttachmentKey.value = null;
  } catch (err) {
    console.error("Erro ao salvar perfil", err);
    toast.error("Erro ao salvar o perfil. Tente novamente.");
  }
};
</script>

<template>
  <div class="perfil-page">
    <div class="perfil-container">
      <div class="perfil-header">
        <h1>Editar Perfil</h1>
        <p>Mantenha suas informações atualizadas.</p>
        <p v-if="authStore.error" class="erro-mensagem">
          {{ authStore.error }}
        </p>
      </div>

      <div class="perfil-content">
        <div class="perfil-sidebar">
          <div
            class="avatar-container"
            :class="{ disabled: uploading }"
            @click="selecionarFoto"
          >
            <img
              :src="userPhoto"
              alt="avatar"
              class="avatar"
              :style="uploading ? 'opacity: 0.5' : ''"
            />

            <div class="camera-btn">
              <span v-if="uploading" class="upload-loader">...</span>
              <Camera v-else :size="18" />
            </div>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png"
            style="display: none"
            :disabled="uploading"
            @change="fotoSelecionada"
          />
        </div>

        <div class="perfil-form">
          <div class="grid-2">
            <div class="campo">
              <label>Nome</label>
              <input v-model="nome" type="text" />
            </div>

            <div class="campo">
              <label>Sobrenome</label>
              <input v-model="sobrenome" type="text" />
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
            <button
              class="btn-salvar"
              :disabled="uploading"
              @click="salvarPerfil"
            >
              {{ uploading ? "Aguarde o upload..." : "Salvar alterações" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mantidos os seus estilos originais */
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
.erro-mensagem {
  color: #dc3545;
  font-weight: 500;
  margin-top: 5px;
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
.avatar-container.disabled {
  cursor: not-allowed;
}
.avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #6b4226;
  transition: opacity 0.2s;
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
.upload-loader {
  font-size: 12px;
  font-weight: bold;
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
.btn-salvar:disabled {
  background: #a1836f;
  cursor: not-allowed;
}
.btn-salvar:hover:not(:disabled) {
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
