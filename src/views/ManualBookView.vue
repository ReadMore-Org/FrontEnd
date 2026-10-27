<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref } from 'vue';
import { ArrowLeft, BookPlus, ImagePlus, X, LoaderCircle, Check, BookOpen } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import { useLivrosStore } from '@/stores/livros';
import { useAuthStore } from '@/stores/auth';
import { COVER_TYPES, AGE_RANGES, READING_STATUSES, prepareManualBook, validateCover, manualApiErrors } from '@/utils/manualBook';

const router = useRouter();
const toast = useToast();
const livrosStore = useLivrosStore();
const auth = useAuthStore();
const saving = ref(false);
const errors = ref({});
const serverError = ref('');
const optionsError = ref(false);
const loadingOptions = ref(false);
const savedBook = ref(null);
const fileInput = ref(null);
const capaPreview = ref('');
const capaFile = ref(null);
const categorySearch = ref('');
const formElement = ref(null);
const form = reactive({ titulo: '', subtitulo: '', autores: '', isbn: '', sinopse: '', idioma: 'pt', paginas: '', publicacao: '', tipo_capa: 'mole', faixa_etaria: 'livre', editora: null, categoria: [], status: 'quero_ler' });
const mainFields = [
  { key: 'titulo', label: 'Título', placeholder: 'Como o livro se chama?', max: 260, required: true },
  { key: 'subtitulo', label: 'Subtítulo', placeholder: 'Se houver', max: 260 },
  { key: 'autores', label: 'Autor(es)', placeholder: 'Ex.: Machado de Assis, Outro Autor', required: true },
];
const categories = computed(() => livrosStore.categorias.filter(item => item.descricao.toLocaleLowerCase('pt-BR').includes(categorySearch.value.trim().toLocaleLowerCase('pt-BR'))));
async function loadOptions() {
  loadingOptions.value = true;
  const results = await Promise.allSettled([livrosStore.fetchCategorias({ throwOnError: true }), livrosStore.fetchEditoras({ throwOnError: true })]);
  optionsError.value = results.some(result => result.status === 'rejected');
  loadingOptions.value = false;
}
onMounted(loadOptions);
function clearCover() {
  if (capaPreview.value) URL.revokeObjectURL(capaPreview.value);
  capaPreview.value = '';
  capaFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
}
function selectCover(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const error = validateCover(file);
  if (error) { errors.value.capa = error; event.target.value = ''; return; }
  clearCover();
  delete errors.value.capa;
  capaFile.value = file;
  capaPreview.value = URL.createObjectURL(file);
}
onBeforeUnmount(clearCover);
function focusError() {
  requestAnimationFrame(() => formElement.value?.querySelector('[aria-invalid="true"]')?.focus());
}
async function save() {
  if (saving.value) return;
  if (!auth.isAuthenticated) { router.push('/entrar'); return; }
  const prepared = prepareManualBook(form);
  errors.value = prepared.errors;
  for (const input of formElement.value?.querySelectorAll('input') || []) {
    if (input.id && input.validity.badInput) errors.value[input.id] = 'Confira o valor informado.';
  }
  const coverError = validateCover(capaFile.value);
  if (coverError) errors.value.capa = coverError;
  serverError.value = '';
  if (Object.keys(errors.value).length) { focusError(); return; }
  saving.value = true;
  try {
    const book = await livrosStore.addLivro({ ...prepared.payload, capaFile: capaFile.value });
    savedBook.value = book;
    toast.success('Livro cadastrado e salvo na sua estante!');
    router.push('/meus-livros');
  } catch (err) {
    errors.value = manualApiErrors(err);
    serverError.value = err.response?.data?.detail || 'Não foi possível salvar. Confira os campos e tente novamente.';
    focusError();
  } finally { saving.value = false; }
}
</script>

<template>
  <AppHeader />
  <main class="manual-page">
    <RouterLink to="/adicionar" class="back-link"><ArrowLeft :size="16" />Voltar</RouterLink>
    <header class="manual-heading"><span class="heading-icon"><BookPlus :size="26" /></span><div><h1>Cadastrar um livro</h1><p>Um novo lugar na sua estante começa aqui.</p></div></header>
    <form ref="formElement" novalidate @submit.prevent="save">
      <fieldset :disabled="saving || !!savedBook" class="manual-layout">
        <aside class="cover-panel form-card">
          <h2>Capa e leitura</h2><p class="section-help">A capa é opcional. Você pode adicionar um livro mesmo sem ela.</p>
          <button type="button" class="cover-picker" :class="{ 'has-cover': capaPreview }" :aria-invalid="!!errors.capa" aria-describedby="cover-help cover-error" aria-label="Escolher imagem da capa" @click="fileInput?.click()">
            <img v-if="capaPreview" :src="capaPreview" alt="Prévia da capa escolhida" />
            <template v-else><ImagePlus :size="32" /><strong>Adicionar capa</strong><span>Clique para escolher</span></template>
          </button>
          <input ref="fileInput" type="file" accept="image/jpeg,image/png" class="file-input" aria-label="Arquivo da capa" @change="selectCover" />
          <p id="cover-help" class="field-help">JPG ou PNG · até 5 MB</p>
          <p v-if="errors.capa" id="cover-error" class="field-error" role="alert">{{ errors.capa }}</p>
          <button v-if="capaFile" type="button" class="remove-cover" @click="clearCover"><X :size="14" />Remover capa</button>
          <div class="reading-choice"><h3>Comece por onde você está</h3><div class="choice-stack" role="group" aria-label="Status de leitura"><button v-for="item in READING_STATUSES" :key="item.value" type="button" class="choice" :class="{ selected: form.status === item.value }" :aria-pressed="form.status === item.value" @click="form.status = item.value"><BookOpen :size="16" />{{ item.label }}<Check v-if="form.status === item.value" :size="16" class="choice-check" /></button></div><p v-if="errors.status" class="field-error">{{ errors.status }}</p></div>
        </aside>
        <div class="info-panels">
          <section class="form-card"><h2>Informações principais</h2><p class="section-help">Os campos com * são obrigatórios.</p>
            <div v-for="field in mainFields" :key="field.key" class="field"><label :for="field.key">{{ field.label }} <span v-if="field.required">*</span></label><input :id="field.key" v-model="form[field.key]" type="text" :maxlength="field.max" :required="field.required" :placeholder="field.placeholder" :aria-invalid="!!errors[field.key]" :aria-describedby="`${field.key}-help`" /><p :id="`${field.key}-help`" :class="errors[field.key] ? 'field-error' : 'field-help'">{{ errors[field.key] || (field.key === 'autores' ? 'Separe os autores por vírgula; até 50 caracteres por nome.' : '') }}</p></div>
            <div class="field"><label for="sinopse">Sinopse</label><textarea id="sinopse" v-model="form.sinopse" rows="5" placeholder="Sobre o que é este livro?" :aria-invalid="!!errors.sinopse"></textarea><p v-if="errors.sinopse" class="field-error">{{ errors.sinopse }}</p></div>
          </section>
          <section class="form-card"><h2>Detalhes da edição</h2><p class="section-help">Preencha o que souber. Estes dados são opcionais.</p>
            <div class="field-grid">
              <div class="field"><label for="isbn">ISBN</label><input id="isbn" v-model="form.isbn" placeholder="10 ou 13 dígitos" maxlength="25" :aria-invalid="!!errors.isbn" aria-describedby="isbn-help" /><p id="isbn-help" :class="errors.isbn ? 'field-error' : 'field-help'">{{ errors.isbn || 'Pode incluir espaços e hífens.' }}</p></div>
              <div class="field"><label for="paginas">Páginas</label><input id="paginas" v-model="form.paginas" type="number" min="1" max="2147483647" step="1" inputmode="numeric" placeholder="Ex.: 240" :aria-invalid="!!errors.paginas" /><p v-if="errors.paginas" class="field-error">{{ errors.paginas }}</p></div>
              <div class="field"><label for="idioma">Idioma</label><input id="idioma" v-model="form.idioma" list="languages" maxlength="30" placeholder="Ex.: pt-BR" :aria-invalid="!!errors.idioma" /><datalist id="languages"><option value="pt">Português</option><option value="pt-BR">Português brasileiro</option><option value="en">Inglês</option><option value="es">Espanhol</option><option value="fr">Francês</option></datalist><p v-if="errors.idioma" class="field-error">{{ errors.idioma }}</p></div>
              <div class="field"><label for="publicacao">Publicação</label><input id="publicacao" v-model="form.publicacao" type="date" min="0001-01-01" :aria-invalid="!!errors.publicacao" /><p v-if="errors.publicacao" class="field-error">{{ errors.publicacao }}</p></div>
              <div class="field"><label for="tipo_capa">Tipo de capa</label><select id="tipo_capa" v-model="form.tipo_capa" :aria-invalid="!!errors.tipo_capa"><option v-for="item in COVER_TYPES" :key="item.value" :value="item.value">{{ item.label }}</option></select><p v-if="errors.tipo_capa" class="field-error">{{ errors.tipo_capa }}</p></div>
              <div class="field"><label for="faixa_etaria">Faixa etária</label><select id="faixa_etaria" v-model="form.faixa_etaria" :aria-invalid="!!errors.faixa_etaria"><option v-for="item in AGE_RANGES" :key="item.value" :value="item.value">{{ item.label }}</option></select><p v-if="errors.faixa_etaria" class="field-error">{{ errors.faixa_etaria }}</p></div>
            </div>
            <div class="field"><label for="editora">Editora</label><select id="editora" v-model="form.editora" :aria-invalid="!!errors.editora"><option :value="null">Não informar</option><option v-for="item in livrosStore.editoras" :key="item.id" :value="item.id">{{ item.nome }}</option></select><p v-if="errors.editora" class="field-error">{{ errors.editora }}</p></div>
          </section>
          <section class="form-card"><h2>Categorias</h2><p class="section-help">Escolha as categorias que combinam com o livro.</p><label class="sr-only" for="category-search">Filtrar categorias</label><input id="category-search" v-model="categorySearch" class="category-search" type="search" placeholder="Procurar uma categoria..." />
            <p v-if="loadingOptions" class="field-help" role="status">Carregando categorias e editoras...</p>
            <div class="category-options"><label v-for="item in categories" :key="item.id" class="category-option" :class="{ selected: form.categoria.includes(item.id) }"><input v-model="form.categoria" type="checkbox" :value="item.id" /><span>{{ item.descricao }}</span></label><p v-if="!categories.length && !loadingOptions" class="field-help">Nenhuma categoria disponível para este termo.</p></div>
            <p v-if="errors.categoria" class="field-error">{{ errors.categoria }}</p>
            <div v-if="optionsError" class="options-error" role="status">Não foi possível carregar todas as opções. <button type="button" @click="loadOptions">Tentar novamente</button></div>
          </section>
        </div>
      </fieldset>
      <div v-if="serverError" class="save-error" role="alert">{{ serverError }}</div>
      <footer class="form-actions"><p>O livro será salvo na sua estante com o status escolhido.</p><div><button type="button" class="button-secondary" :disabled="saving" @click="router.push('/adicionar')">Cancelar</button><button type="submit" class="button-primary" :disabled="saving || !!savedBook"><LoaderCircle v-if="saving" :size="18" class="saving-spinner" /><BookPlus v-else :size="18" />{{ saving ? 'Salvando...' : 'Salvar na estante' }}</button></div></footer>
    </form>
  </main>
  <AppFooter />
</template>

<style scoped>
.manual-page {
  max-width:1180px;
  margin:auto;
  padding:30px 28px 90px;
  color:#5a4636
}
.back-link {
  display:inline-flex;
  align-items:center;
  gap:7px;
  font-size:13px;
  margin-bottom:24px
}
.manual-heading {
  display:flex;
  align-items:center;
  gap:16px;
  margin-bottom:28px
}
.heading-icon {
  display:grid;
  place-items:center;
  width:56px;
  height:56px;
  border:1px solid #dfc9b0;
  border-radius:16px;
  background:#f3e7d7;
  color:#6b4226
}
.manual-heading h1 {
  font-size:30px;
  color:#2c2c2c;
  line-height:1.25;
  margin-bottom:6px
}
.manual-heading p,.section-help {
  font-size:13px;
  color:#9c8a7a;
  line-height:1.6
}
.manual-layout {
  border:0;
  display:grid;
  grid-template-columns:310px minmax(0,1fr);
  gap:24px;
  min-width:0
}
.form-card {
  background:#fffdf9;
  border:1px solid #e8d8c3;
  border-radius:18px;
  padding:26px;
  min-width:0
}
.form-card h2 {
  font-size:18px;
  color:#2c2c2c;
  margin-bottom:8px
}
.section-help {
  margin-bottom:22px
}
.cover-panel {
  align-self:start;
  position:sticky;
  top:24px
}
.cover-picker {
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:12px;
  width:100%;
  aspect-ratio:2/3;
  max-height:345px;
  border:1.5px dashed #cfb69b;
  border-radius:12px;
  background:#faf3e5;
  color:#8a6a52;
  cursor:pointer;
  overflow:hidden
}
.cover-picker strong {
  font-size:14px
}
.cover-picker span {
  font-size:12px
}
.cover-picker img {
  width:100%;
  height:100%;
  object-fit:contain
}
.cover-picker.has-cover {
  border-style:solid;
  background:#f3e7d7
}
.file-input {
  display:none
}
.field-help {
  font-size:11px;
  color:#9c8a7a;
  line-height:1.5;
  margin-top:6px
}
.field-error {
  font-size:12px;
  color:#a4161a;
  line-height:1.5;
  margin-top:6px
}
.remove-cover {
  display:flex;
  align-items:center;
  gap:5px;
  margin-top:10px;
  background:none;
  border:0;
  color:#8a6a52;
  cursor:pointer;
  font-size:12px
}
.reading-choice {
  border-top:1px solid #e8d8c3;
  margin-top:24px;
  padding-top:22px
}
.reading-choice h3 {
  font-size:13px;
  font-weight:500;
  margin-bottom:12px
}
.choice-stack {
  display:grid;
  gap:8px
}
.choice {
  display:flex;
  align-items:center;
  gap:9px;
  min-height:42px;
  padding:10px 12px;
  border:1px solid #e8d8c3;
  border-radius:10px;
  background:white;
  color:#6b4226;
  cursor:pointer;
  text-align:left
}
.choice.selected {
  background:#6b4226;
  border-color:#6b4226;
  color:white
}
.choice-check {
  margin-left:auto
}
.info-panels {
  display:grid;
  gap:20px;
  min-width:0
}
.field {
  margin-top:16px;
  min-width:0
}
.field label {
  display:block;
  font-size:13px;
  font-weight:500;
  margin-bottom:7px
}
.field label span {
  color:#a4161a
}
input:not([type=checkbox]),select,textarea {
  width:100%;
  min-width:0;
  padding:11px 12px;
  border:1px solid #e8d8c3;
  border-radius:10px;
  background:white;
  color:#2c2c2c;
  font:inherit;
  font-size:14px;
  outline:none
}
input:focus,select:focus,textarea:focus {
  border-color:#8a6a52;
  box-shadow:0 0 0 3px #6b42261a
}
[aria-invalid=true] {
  border-color:#a4161a!important
}
textarea {
  resize:vertical;
  min-height:125px;
  line-height:1.7
}
.field-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:0 16px
}
.category-options {
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  max-height:190px;
  overflow-y:auto;
  margin-top:14px;
  padding:3px;
  scrollbar-width:thin
}
.category-option {
  display:inline-flex;
  align-items:center;
  gap:7px;
  padding:8px 10px;
  border:1px solid #e8d8c3;
  border-radius:20px;
  background:white;
  font-size:12px;
  cursor:pointer
}
.category-option input {
  accent-color:#6b4226
}
.category-option.selected {
  background:#f3e7d7;
  border-color:#c9b09a
}
.options-error {
  font-size:12px;
  color:#9c8a7a;
  margin-top:12px
}
.options-error button {
  border:0;
  background:none;
  text-decoration:underline;
  color:#6b4226;
  cursor:pointer
}
.form-actions {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
  margin:24px 0;
  padding:22px 0;
  border-top:1px solid #dbc6ad
}
.form-actions p {
  font-size:12px;
  color:#9c8a7a;
  max-width:330px;
  line-height:1.5
}
.form-actions>div {
  display:flex;
  gap:10px
}
.button-secondary,.button-primary {
  display:inline-flex;
  justify-content:center;
  align-items:center;
  gap:8px;
  border-radius:24px;
  padding:12px 20px;
  min-height:46px;
  font:inherit;
  font-size:14px;
  cursor:pointer
}
.button-secondary {
  border:1px solid #d8bfa3;
  background:#fffdf9;
  color:#6b4226
}
.button-primary {
  border:1px solid #6b4226;
  background:#6b4226;
  color:white
}
button:disabled {
  opacity:.6;
  cursor:wait
}
.save-error {
  padding:16px;
  margin-top:20px;
  border:1px solid #efc7bf;
  background:#fff5f3;
  color:#a4161a;
  border-radius:12px;
  font-size:13px
}
.sr-only {
  position:absolute;
  width:1px;
  height:1px;
  padding:0;
  margin:-1px;
  overflow:hidden;
  clip:rect(0,0,0,0);
  white-space:nowrap;
  border:0
}
.saving-spinner {
  animation:manual-spin .8s linear infinite
}
@keyframes manual-spin {
  to {
    transform:rotate(360deg)
  }
}
@media(max-width:900px) {
  .manual-layout {
    grid-template-columns:250px minmax(0,1fr);
    gap:18px
  }
  .form-card {
    padding:20px
  }
}
@media(max-width:700px) {
  .manual-page {
    padding:20px 16px 80px
  }
  .manual-heading h1 {
    font-size:24px
  }
  .manual-heading {
    gap:12px
  }
  .heading-icon {
    width:48px;
    height:48px;
    flex-shrink:0
  }
  .manual-layout {
    grid-template-columns:1fr;
    gap:18px
  }
  .cover-panel {
    position:static
  }
  .cover-picker {
    max-width:200px;
    margin:auto;
    max-height:280px
  }
  .reading-choice {
    margin-top:18px;
    padding-top:18px
  }
  .choice-stack {
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:6px
  }
  .choice {
    padding:9px 6px;
    justify-content:center;
    gap:4px;
    font-size:12px
  }
  .choice>svg:first-child {
    display:none
  }
  .choice-check {
    margin-left:0;
    width:13px
  }
  .field-grid {
    gap:0 12px
  }
  .form-actions {
    flex-direction:column;
    align-items:stretch;
    padding:18px 0;
    gap:14px
  }
  .form-actions>div {
    display:grid;
    grid-template-columns:1fr 1.4fr
  }
  .form-actions p {
    max-width:none
  }
  input:not([type=checkbox]),select,textarea {
    font-size:16px
  }
  .button-primary,.button-secondary {
    padding:12px 10px
  }
  .form-card {
    padding:20px 16px
  }
}
@media(max-width:370px) {
  .field-grid {
    grid-template-columns:1fr
  }
  .manual-heading h1 {
    font-size:22px
  }
}
</style>
