<script setup>
import { ref, reactive, onMounted } from "vue";
import { Image } from "lucide-vue-next";
import StatusSelect from "@/components/common/statusSelect.vue";
import { useLivrosStore } from "@/stores/livros";
import { useRouter } from "vue-router";
import { useToast } from 'vue-toastification';

import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const toast = useToast(); 

const router = useRouter();

const livrosStore = useLivrosStore();

onMounted(() => {
  livrosStore.fetchCategorias();
  livrosStore.fetchEditoras();
});

const fileInput = ref(null);
const capaPreview = ref(null);
const capaFile = ref(null);

function selecionarCapa() {
  fileInput.value?.click();
}

function previewCover(event) {
  const file = event.target.files[0];
  if (!file) return;
  capaFile.value = file;
  capaPreview.value = URL.createObjectURL(file);
}

const form = reactive({
  titulo: "",
  subtitulo: "",
  isbn: "",
  sinopse: "",
  idioma: "",
  paginas: null,
  nota: null,
  publicacao: "",
  tipo_capa: "dura",
  faixa_etaria: "livre",
  editora: null,
  autores: "",
  categoria: null,
  status: "quero_ler",
});

const faixaOpcoes = [
  { value: "livre", label: "Livre para todos" },
  { value: "adulto", label: "Adulto" },
];

const capaOpcoes = [
  { value: "dura", label: "Capa dura" },
  { value: "mole", label: "Capa mole" },
  { value: "sobre", label: "Dura com sobrecapa" },
  { value: "orelhas", label: "Mole com orelhas" },
];

async function salvar() {
  if (!form.titulo) {
    toast.error("Erro ao cadastrar livro. O campo 'título' é obrigatório.");
    return;
  }
  else if (!form.autores) {
    toast.error("Erro ao cadastrar livro. o campo 'autores' é obrigatório.");
    return;
  }

  try {
    await livrosStore.addLivro({
      ...form,
      capaFile: capaFile.value,
    });

    toast.success("Livro cadastrado com sucesso!", {
    timeout: 2000
    });
    router.push("/home");
  } catch (error) {
    console.error(error);
    toast.error("Erro ao cadastrar livro.");
  }
}
</script>

<template>
  <AppHeader/>
  <div class="todo">
    <h1 class="titulo-secao">Adicionar livro</h1>

    <div class="linha">
      <div class="card">
        <p class="card-label">Capa & status</p>
        <div
          class="adicionarCapa"
          :style="capaPreview ? `background-image: url(${capaPreview})` : ''"
          :class="{ visto: capaPreview }"
          @click="selecionarCapa"
        >
          <div v-if="!capaPreview" class="info">
            <Image :size="24" />
            <span>Adicionar imagem da capa</span>
          </div>  
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="previewCover"
        />

        <StatusSelect v-model="form.status" />

        <div class="field">
          <label>Faixa etária</label>
          <div class="toggle-group">
            <button
              v-for="f in faixaOpcoes"
              :key="f.value"
              :class="['toggle-btn', { active: form.faixa_etaria === f.value }]"
              @click="form.faixa_etaria = f.value"
              type="button"
            >
              {{ f.label }}
            </button>
          </div>
        </div>

        <div class="field">
          <label>Tipo de capa</label>
          <div class="capa-btns">
            <button
              v-for="c in capaOpcoes"
              :key="c.value"
              :class="['capa-btn', { active: form.tipo_capa === c.value }]"
              @click="form.tipo_capa = c.value"
              type="button"
            >
              {{ c.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <p class="card-label">Informações do livro</p>

        <div class="field">
          <label>Título <span class="req">*</span></label>
          <input
            v-model="form.titulo"
            type="text"
            placeholder="Digite o título"
          />
        </div>

        <div class="field">
          <label>Subtítulo</label>
          <input
            v-model="form.subtitulo"
            type="text"
            placeholder="Digite o subtítulo (opcional)"
          />
        </div>
        <div class="field">
  <label>Autor(es) <span class="req">*</span></label>
  <input v-model="form.autores" type="text" placeholder="Ex: José Saramago, Outro Autor" />
</div>    

        <div class="field">
          <label>Editora</label>
          <select v-model="form.editora">
            <option :value="null">Selecione...</option>
            <option
              v-for="ed in livrosStore.editoras"
              :key="ed.id"
              :value="ed.id"
            >
              {{ ed.nome }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Categoria</label>
          <select v-model="form.categoria">
            <option :value="null">Selecione...</option>
            <option
              v-for="cat in livrosStore.categorias"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.descricao }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Sinopse</label>
          <textarea
            v-model="form.sinopse"
            rows="3"
            placeholder="Breve descrição do livro..."
            maxlength="650"
          ></textarea>
          <span class="char-count">{{ form.sinopse.length }}/650</span>
        </div>

        <div class="field-row3">
          <div class="field">
            <label>ISBN</label>
            <input
              v-model="form.isbn"
              type="text"
              placeholder="0000000000000"
              maxlength="13"
            />
          </div>
          <div class="field">
            <label>Idioma</label>
            <input
              v-model="form.idioma"
              type="text"
              placeholder="pt"
              maxlength="2"
            />
          </div>
          <div class="field">
            <label>Publicação</label>
            <input v-model="form.publicacao" type="date" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Nº de páginas</label>
            <input
              v-model.number="form.paginas"
              type="number"
              placeholder="0"
              min="1"
            />
          </div>
          <div class="field">
            <label>Nota</label>
            <input
              v-model.number="form.nota"
              type="number"
              placeholder="0.0"
              min="0"
              max="10"
              step="0.1"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <button class="btn-cancel" @click="$emit('cancelar')" type="button">
      Cancelar
    </button>
    <button class="btn-save" @click="salvar" type="button">Salvar livro</button>
  </div>
<AppFooter/>
</template>

<style scoped>
.titulo-secao {
  position: relative;
  display: inline-block;
  padding-bottom: 5px;
  color: #2c2c2c;
  font-weight: 500;
  margin: 60px 0 30px 0;
  font-size: 25px;
}

.titulo-secao::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50%;
  height: 4px;
  border-radius: 50px;
  background: #6b4226;
}

.todo {
  padding: 28px 80px;
  flex: 1;
}

.linha {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.card {
  background: #ffffff;
  border: 1px solid #e8d8c3;
  border-radius: 12px;
  padding: 20px;
}

.card-label {
  font-size: 11px;
  font-weight: 600;
  color: #9c8a7a;
  margin-bottom: 16px;
}

.adicionarCapa {
  border: 1.5px dashed #e8d8c3;
  border-radius: 10px;
  height: 168px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  color: #9c8a7a;
  transition: background 0.15s;
  background-size: cover;
  background-position: center;
}

.adicionarCapa:hover {
  background-color: #faf3e0;
}
.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
} 
.adicionarCapa.visto {
  border-style: solid;
  border-color: #6b4226;
}

.adicionarCapa span {
  font-size: 13px;
}

/* Fields */
.field {
  margin-bottom: 12px;
  position: relative;
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #5a4636;
  margin-bottom: 5px;
}

.req {
  color: #a4161a;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e8d8c3;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  color: #2c2c2c;

  outline: none;
  transition: border-color 0.15s;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: #6b4226;
  box-shadow: 0 0 0 3px rgba(107, 66, 38, 0.12);
}

.field textarea {
  resize: none;
  line-height: 1.5;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 11px;
  color: #9c8a7a;
  margin-top: 3px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field-row .field {
  margin-bottom: 0;
}

.field-row3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.field-row3 .field {
  margin-bottom: 0;
}

/* Toggle buttons (status / faixa) */
.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1;
  padding: 7px 4px;
  border: 1px solid #e8d8c3;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: #ffffff;
  color: #5a4636;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}

.toggle-btn:hover:not(.active) {
  background: #faf3e0;
}

.toggle-btn.active {
  background: #6b4226;
  color: #ffffff;
  border-color: #6b4226;
}

/* Capa type buttons */
.capa-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.capa-btn {
  padding: 6px 12px;
  border: 1px solid #e8d8c3;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  background: #ffffff;
  color: #5a4636;
  cursor: pointer;
  transition: all 0.15s;
}

.capa-btn:hover:not(.active) {
  background: #faf3e0;
}

.capa-btn.active {
  background: #6b4226;
  border-color: #6b4226;
  color: #ffffff;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 32px;
  border-top: 1px solid #e8d8c3;
  background: #ffffff;
}

.btn-cancel {
  padding: 9px 20px;
  border: 1px solid #e8d8c3;
  border-radius: 8px;
  background: #ffffff;
  color: #5a4636;
  font-size: 14px;

  cursor: pointer;
  transition: background 0.15s;
}

.btn-cancel:hover {
  background: #faf3e0;
}

.btn-save {
  padding: 9px 22px;
  background: #6b4226;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;

  cursor: pointer;
  transition: background 0.15s;
}

.btn-save:hover {
  background: #4a2c1a;
}

@media (max-width: 768px) {
  .linha {
    grid-template-columns: 1fr;
  }

  .todo {
    padding: 20px 16px;
  }

  .footer {
    padding: 14px 16px;
  }
}
</style>
