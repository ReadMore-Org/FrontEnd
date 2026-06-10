<script setup>
import { ref, reactive } from 'vue'

const emit = defineEmits(['salvar', 'cancelar'])

const fileInput = ref(null)
const capaPreview = ref(null)
const capaFile = ref(null)

const form = reactive({
  titulo: '',
  subtitulo: '',
  isbn: '',
  sinopse: '',
  idioma: '',
  paginas: null,
  nota: null,
  publicacao: '',
  tipo_capa: 'dura',
  faixa_etaria: 'livre',
  editora: '',
  autores: '',
  categoria: '',
  status: 'quero_ler',
})

const statusOpcoes = [
  { value: 'quero_ler', label: 'Quero ler' },
  { value: 'lendo',     label: 'Lendo'     },
  { value: 'lido',      label: 'Lido'      },
]

const faixaOpcoes = [
  { value: 'livre',  label: 'Livre para todos' },
  { value: 'adulto', label: 'Adulto'            },
]

const capaOpcoes = [
  { value: 'dura',    label: 'Capa dura'             },
  { value: 'mole',    label: 'Capa mole'             },
  { value: 'sobre',   label: 'Dura com sobrecapa'    },
  { value: 'orelhas', label: 'Mole com orelhas'      },
]

function previewCover(e) {
  const file = e.target.files[0]
  if (!file) return
  capaFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => { capaPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

function salvar() {
  if (!form.titulo) {
    alert('O título é obrigatório.')
    return
  }
  emit('salvar', { ...form, capaFile: capaFile.value })
}
</script>

<template>
    <div class="content">
      <h1 class="titulo-secao">Adicionar livro</h1>

      <div class="grid">
        <div class="card">
          <p class="card-label">Capa & status</p>

          <div
            class="cover-area"
            :style="capaPreview ? `background-image: url(${capaPreview})` : ''"
            :class="{ 'has-preview': capaPreview }"
            @click="$refs.fileInput.click()"
          >
            <template v-if="!capaPreview">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
              </svg>
              <span>Adicionar imagem da capa</span>
            </template>
          </div>
          <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="previewCover" />

          <div class="field">
            <label>Status de leitura</label>
            <div class="toggle-group">
              <button
                v-for="s in statusOpcoes"
                :key="s.value"
                :class="['toggle-btn', { active: form.status === s.value }]"
                @click="form.status = s.value"
                type="button"
              >{{ s.label }}</button>
            </div>
          </div>

          <div class="field">
            <label>Faixa etária</label>
            <div class="toggle-group">
              <button
                v-for="f in faixaOpcoes"
                :key="f.value"
                :class="['toggle-btn', { active: form.faixa_etaria === f.value }]"
                @click="form.faixa_etaria = f.value"
                type="button"
              >{{ f.label }}</button>
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
              >{{ c.label }}</button>
            </div>
          </div>
        </div>

        <!-- Card direito: Informações -->
        <div class="card">
          <p class="card-label">Informações do livro</p>

          <div class="field">
            <label>Título <span class="req">*</span></label>
            <input v-model="form.titulo" type="text" placeholder="Digite o título" />
          </div>

          <div class="field">
            <label>Subtítulo</label>
            <input v-model="form.subtitulo" type="text" placeholder="Digite o subtítulo (opcional)" />
          </div>

          <div class="field-row">
            <div class="field">
              <label>Autor(es) <span class="req">*</span></label>
              <input v-model="form.autores" type="text" placeholder="Nome do autor..." />
            </div>
            <div class="field">
              <label>Editora</label>
              <input v-model="form.editora" type="text" placeholder="Nome da editora..." />
            </div>
          </div>

          <div class="field">
            <label>Categoria</label>
            <input v-model="form.categoria" type="text" placeholder="Ex: Ficção, Romance..." />
          </div>

          <div class="field">
            <label>Sinopse</label>
            <textarea v-model="form.sinopse" rows="3" placeholder="Breve descrição do livro..." maxlength="650"></textarea>
            <span class="char-count">{{ form.sinopse.length }}/650</span>
          </div>

          <div class="field-row3">
            <div class="field">
              <label>ISBN</label>
              <input v-model="form.isbn" type="text" placeholder="0000000000000" maxlength="13" />
            </div>
            <div class="field">
              <label>Idioma</label>
              <input v-model="form.idioma" type="text" placeholder="pt" maxlength="2" />
            </div>
            <div class="field">
              <label>Publicação</label>
              <input v-model="form.publicacao" type="date" />
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label>Nº de páginas</label>
              <input v-model.number="form.paginas" type="number" placeholder="0" min="1" />
            </div>
            <div class="field">
              <label>Nota</label>
              <input v-model.number="form.nota" type="number" placeholder="0.0" min="0" max="10" step="0.1" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <button class="btn-cancel" @click="$emit('cancelar')" type="button">Cancelar</button>
      <button class="btn-save" @click="salvar" type="button">Salvar livro</button>
    </div>
</template>


<style scoped>
.titulo-secao {
    position: relative;
    display: inline-block;
    padding-bottom: 5px;
    color: #2C2C2C;
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
    background: #6B4226;
}
.content {
  padding: 28px 32px;
  flex: 1;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.card {
  background: #FDF9F4;
  border: 1px solid #e8ddd0;
  border-radius: 12px;
  padding: 20px;
}

.card-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #a07a5a;
  margin-bottom: 16px;
}

/* Cover upload */
.cover-area {
  border: 1.5px dashed #c9a882;
  border-radius: 10px;
  height: 168px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  color: #b08060;
  transition: background 0.15s;
  background-size: cover;
  background-position: center;
}

.cover-area:hover {
  background-color: #f5ede0;
}

.cover-area.has-preview {
  border-style: solid;
  border-color: #c9a882;
}

.cover-area span {
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
  color: #5a3e28;
  margin-bottom: 5px;
}

.req {
  color: #b03a2e;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  background: #fff;
  border: 1px solid #ddd0c0;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  color: #1a1008;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: #a07a5a;
  box-shadow: 0 0 0 3px rgba(160, 122, 90, 0.12);
}

.field textarea {
  resize: none;
  line-height: 1.5;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 11px;
  color: #b08060;
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
  border: 1px solid #d4b896;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: #fff;
  color: #7a5a3a;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
  font-family: inherit;
}

.toggle-btn:hover:not(.active) {
  background: #f5ede0;
}

.toggle-btn.active {
  background: #3D1F0D;
  color: #fff;
  border-color: #3D1F0D;
}

/* Capa type buttons */
.capa-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.capa-btn {
  padding: 6px 12px;
  border: 1px solid #d4b896;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  background: #fff;
  color: #7a5a3a;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.capa-btn:hover:not(.active) {
  background: #f5ede0;
}

.capa-btn.active {
  background: #f0e4d4;
  border-color: #a07a5a;
  color: #3D1F0D;
}

/* Footer */
.footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 32px;
  border-top: 1px solid #e8ddd0;
  background: #fff;
}

.btn-cancel {
  padding: 9px 20px;
  border: 1px solid #d4b896;
  border-radius: 8px;
  background: #fff;
  color: #7a5a3a;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-cancel:hover {
  background: #f5ede0;
}

.btn-save {
  padding: 9px 22px;
  background: #3D1F0D;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-save:hover {
  background: #5c3317;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .content {
    padding: 20px 16px;
  }
  .footer {
    padding: 14px 16px;
  }
}
</style>