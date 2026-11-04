<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, ArrowRight, BookOpen, Check, Search, Sparkles, X } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { discoverReadingOptions } from '@/services/readingPreferences';
import { AUTHOR_SUGGESTIONS, BOOK_SUGGESTIONS, READING_CATEGORIES, preferenceBookKey } from '@/utils/readingPreferences';

const auth = useAuthStore();
const router = useRouter();
const existing = auth.user?.reading_preferences || {};
const editing = auth.user?.reading_preferences_status !== 'pending' && !!auth.user?.reading_preferences_status;
const categories = ref([...(existing.categories || [])]);
const authors = ref([...(existing.authors || [])]);
const books = ref((existing.books || []).map(book => ({ ...book, authors: [...book.authors] })));
const step = ref(0);
const query = ref('');
const foundBooks = ref([]);
const searching = ref(false);
const searchWarning = ref('');
const saving = ref(false);
const error = ref('');
const heading = ref(null);
const steps = ['Categorias', 'Autores', 'Livros'];
const titles = ['Que histórias despertam sua curiosidade?', 'Quem você gosta de ler?', 'Quais livros ficaram com você?'];
const subtitles = ['Escolha os gêneros que você mais gosta. Pode marcar vários.', 'Escolha algumas vozes favoritas ou procure outros nomes.', 'Conte quais histórias você adora para encontrarmos outras afinidades.'];
const total = computed(() => categories.value.length + authors.value.length + books.value.length);
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const authorOptions = computed(() => [...new Set([...foundBooks.value.flatMap(book => book.authors), ...AUTHOR_SUGGESTIONS])]
  .filter(name => !query.value || normalize(name).includes(normalize(query.value))).slice(0, 24));
const bookOptions = computed(() => [...new Map([...foundBooks.value, ...BOOK_SUGGESTIONS]
  .filter(book => !query.value || normalize(`${book.title} ${book.authors.join(' ')}`).includes(normalize(query.value)))
  .map(book => [preferenceBookKey(book), book])).values()].slice(0, 24));
const selectedBook = book => books.value.some(value => preferenceBookKey(value) === preferenceBookKey(book));
function toggle(list, value) {
  const index = list.indexOf(value);
  if (index >= 0) list.splice(index, 1);
  else if (list.length < 100) list.push(value);
}
function toggleBook(book) {
  const index = books.value.findIndex(value => preferenceBookKey(value) === preferenceBookKey(book));
  if (index >= 0) books.value.splice(index, 1);
  else if (books.value.length < 100) books.value.push(book);
}
async function goToStep(index) {
  if (saving.value) return;
  step.value = index;
  query.value = '';
  await nextTick();
  heading.value?.focus();
}
let timer;
let controller;
watch([query, step], () => {
  clearTimeout(timer);
  controller?.abort();
  searching.value = false;
  foundBooks.value = [];
  searchWarning.value = '';
  const term = query.value.trim();
  if (step.value === 0 || term.length < 2) return;
  const currentStep = step.value;
  controller = new AbortController();
  const signal = controller.signal;
  searching.value = true;
  timer = setTimeout(async () => {
    try {
      const result = await discoverReadingOptions(term, signal);
      if (signal.aborted || step.value !== currentStep) return;
      foundBooks.value = result.books || [];
      if (result.external_unavailable) searchWarning.value = 'A busca externa está indisponível. Você ainda pode escolher entre nossas sugestões e o catálogo do site.';
    } catch {
      if (!signal.aborted) searchWarning.value = 'Não conseguimos buscar agora. Suas escolhas estão aqui e você pode usar as sugestões abaixo.';
    } finally {
      if (!signal.aborted) searching.value = false;
    }
  }, 350);
});
onBeforeUnmount(() => { clearTimeout(timer); controller?.abort(); });
async function finish(skip = false) {
  if (saving.value) return;
  saving.value = true;
  error.value = '';
  try {
    await auth.updateReadingPreferences({ status: skip ? 'skipped' : 'completed', categories: categories.value, authors: authors.value, books: books.value });
    await router.replace('/home');
  } catch {
    error.value = 'Não foi possível salvar suas preferências. Suas escolhas foram mantidas nesta página. Tente novamente.';
  } finally { saving.value = false; }
}
</script>

<template>
  <main class="preferences-page" :aria-busy="saving">
    <div class="ambient ambient-one" aria-hidden="true"></div><div class="ambient ambient-two" aria-hidden="true"></div>
    <div class="page-shell">
      <header class="page-top"><RouterLink to="/home" class="brand" aria-label="ReadMore"><BookOpen :size="27" /> Read<span>More</span></RouterLink>
        <button v-if="editing" class="quiet-button" :disabled="saving" @click="router.push('/profile')">Cancelar</button>
        <button v-else class="quiet-button" :disabled="saving" @click="finish(true)">Agora não <X :size="16" /></button>
      </header>
      <div class="intro"><span class="eyebrow"><Sparkles :size="15" /> Uma biblioteca com a sua cara</span><p>Preferências de leitura</p></div>
      <section class="preferences-card" aria-label="Suas preferências de leitura">
        <nav class="steps" aria-label="Etapas das preferências">
          <button v-for="(label, index) in steps" :key="label" :class="{ active: step === index, done: step > index }" :aria-current="step === index ? 'step' : undefined" :disabled="saving" @click="goToStep(index)">
            <span class="step-number"><Check v-if="step > index" :size="15" /><template v-else>{{ index + 1 }}</template></span><span>{{ label }}</span>
          </button>
        </nav>
        <div class="progress-track" aria-hidden="true"><div :style="{ width: `${((step + 1) / 3) * 100}%` }"></div></div>
        <Transition name="chapter" mode="out-in">
          <div :key="step" class="chapter-content">
            <p class="chapter-label">Capítulo {{ step + 1 }} de 3</p>
            <h1 ref="heading" tabindex="-1">{{ titles[step] }}</h1><p class="subtitle">{{ subtitles[step] }}</p>
            <p class="optional-note">Tudo aqui é opcional. Você pode mudar suas escolhas depois, no perfil.</p>
            <fieldset v-if="step === 0" :disabled="saving" class="category-grid"><legend class="sr-only">Categorias favoritas</legend>
              <button v-for="category in READING_CATEGORIES" :key="category.value" type="button" class="category-option" :class="{ selected: categories.includes(category.value) }" :aria-pressed="categories.includes(category.value)" @click="toggle(categories, category.value)">
                <span class="category-symbol" aria-hidden="true">{{ category.icon }}</span><span class="category-copy"><strong>{{ category.label }}</strong><small>{{ category.description }}</small></span><Check v-if="categories.includes(category.value)" class="selected-check" :size="17" />
              </button>
            </fieldset>
            <template v-else>
              <label class="search-box"><Search :size="20" aria-hidden="true" /><span class="sr-only">{{ step === 1 ? 'Buscar autores' : 'Buscar livros' }}</span><input v-model="query" :disabled="saving" maxlength="150" type="search" :placeholder="step === 1 ? 'Busque um autor ou uma autora...' : 'Busque pelo título ou autor...'" /></label>
              <div v-if="step === 1 && authors.length" class="selected-list" aria-label="Autores selecionados"><button v-for="author in authors" :key="author" :disabled="saving" :aria-label="`Remover ${author}`" @click="toggle(authors, author)">{{ author }} <X :size="14" /></button></div>
              <div v-if="step === 2 && books.length" class="selected-list" aria-label="Livros selecionados"><button v-for="book in books" :key="preferenceBookKey(book)" :disabled="saving" :aria-label="`Remover ${book.title}`" @click="toggleBook(book)">{{ book.title }} <X :size="14" /></button></div>
              <p v-if="searching" class="search-status" role="status">Procurando novas histórias...</p><p v-if="searchWarning" class="search-status" role="status">{{ searchWarning }}</p>
              <fieldset v-if="step === 1" class="author-grid" :disabled="saving"><legend>{{ query ? 'Resultados e sugestões' : 'Alguns nomes para começar' }}</legend>
                <button v-for="author in authorOptions" :key="author" class="author-option" :class="{ selected: authors.includes(author) }" :aria-pressed="authors.includes(author)" @click="toggle(authors, author)"><span class="author-initial" aria-hidden="true">{{ author.split(' ').filter(word => word.length > 2).slice(0, 2).map(word => word[0]).join('') }}</span><span>{{ author }}</span><Check v-if="authors.includes(author)" :size="16" /></button>
              </fieldset>
              <fieldset v-else class="book-grid" :disabled="saving"><legend>{{ query ? 'Resultados e sugestões' : 'Histórias que muita gente ama' }}</legend><button v-for="book in bookOptions" :key="preferenceBookKey(book)" class="book-option" :class="{ selected: selectedBook(book) }" :aria-pressed="selectedBook(book)" @click="toggleBook(book)"><span class="book-symbol" aria-hidden="true"><BookOpen :size="23" /></span><span><strong>{{ book.title }}</strong><small>{{ book.authors.join(', ') }}</small></span><Check v-if="selectedBook(book)" :size="17" /></button></fieldset>
              <p v-if="!searching && (step === 1 ? !authorOptions.length : !bookOptions.length)" class="empty-state">Nenhum resultado por aqui. Tente outro nome ou continue com suas escolhas.</p>
            </template>
          </div>
        </Transition>
        <p v-if="error" class="save-error" role="alert">{{ error }}</p>
        <footer class="card-actions"><div><span class="selection-count">{{ total }} {{ total === 1 ? 'escolha' : 'escolhas' }}</span><button v-if="step > 0" class="back-button" :disabled="saving" @click="goToStep(step - 1)"><ArrowLeft :size="16" /> Voltar</button></div><div class="next-actions"><button class="quiet-button" :disabled="saving" @click="step < 2 ? goToStep(step + 1) : finish()">Pular etapa</button><button class="primary-button" :disabled="saving" @click="step < 2 ? goToStep(step + 1) : finish()">{{ saving ? 'Salvando...' : step < 2 ? 'Continuar' : editing ? 'Salvar preferências' : 'Encontrar minhas leituras' }}<ArrowRight v-if="!saving" :size="17" /></button></div></footer>
      </section>
      <p class="page-foot"><BookOpen :size="15" aria-hidden="true" /> Seu próximo livro favorito pode estar a uma escolha de distância.</p>
    </div>
  </main>
</template>

<style scoped>
.preferences-page{
  min-height:100vh;
  background:#f3e7d7;
  color:#4b3626;
  position:relative;
  isolation:isolate;
  padding:28px 24px 36px;
  overflow:hidden
}
.page-shell{
  max-width:1000px;
  margin:auto;
  position:relative
}
.page-top{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px
}
.brand{
  display:flex;
  align-items:center;
  font-weight:750;
  font-size:23px;
  color:#6b4226;
  gap:6px
}
.brand span{
  color:#a77842;
  margin-left:-6px
}
.intro{
  margin:42px 0 25px;
  text-align:center
}
.eyebrow{
  display:inline-flex;
  align-items:center;
  gap:8px;
  color:#8a6544;
  font-size:12px;
  letter-spacing:1.5px;
  text-transform:uppercase
}
.intro>p{
  font-family:Georgia,serif;
  font-size:27px;
  margin-top:12px
}
.preferences-card{
  background:#fffaf3;
  border:1px solid #e5d4bd;
  border-radius:24px;
  box-shadow:0 18px 65px #70421f0c;
  overflow:hidden;
  animation:page-in .5s ease both
}
.steps{
  display:flex;
  justify-content:center;
  padding:25px 30px 21px;
  gap:50px
}
.steps button{
  display:flex;
  align-items:center;
  gap:9px;
  color:#9b8875;
  border:0;
  background:none;
  font:inherit;
  font-size:14px;
  cursor:pointer
}
.step-number{
  width:29px;
  height:29px;
  border:1px solid #dbcab5;
  display:grid;
  place-items:center;
  border-radius:50%;
  font-size:12px
}
.steps .active{
  color:#6b4226;
  font-weight:650
}
.active .step-number,.done .step-number{
  color:white;
  background:#6b4226;
  border-color:#6b4226
}
.steps .done{
  color:#806548
}
.progress-track{
  height:3px;
  background:#eee0cf
}
.progress-track>div{
  height:100%;
  background:#b48a57;
  transition:width .35s ease
}
.chapter-content{
  padding:35px 42px 30px;
  min-height:440px
}
.chapter-label{
  text-transform:uppercase;
  letter-spacing:2px;
  font-size:10px;
  color:#a27b53;
  margin-bottom:12px
}
h1{
  font-family:Georgia,serif;
  font-size:31px;
  line-height:1.3;
  font-weight:400;
  max-width:650px;
  outline:none
}
.subtitle{
  margin-top:11px;
  color:#7c6651;
  font-size:14px;
  line-height:1.6
}
.optional-note{
  color:#9a8875;
  font-size:12px;
  line-height:1.6;
  margin:9px 0 25px
}
fieldset{
  border:0;
  min-width:0
}
button{
  font-family:inherit;
  cursor:pointer
}
button:disabled{
  cursor:wait;
  opacity:.6
}
button:focus-visible,a:focus-visible,input:focus-visible{
  outline:3px solid #b48a57;
  outline-offset:3px
}
.category-grid{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:11px
}
.category-option{
  border:1px solid #e8dac7;
  border-radius:13px;
  background:#fffdf8;
  min-height:88px;
  padding:16px 12px;
  display:flex;
  gap:11px;
  text-align:left;
  align-items:center;
  color:#6e533b;
  position:relative;
  transition:transform .18s,border-color .18s,background .18s
}
.category-option:hover,.author-option:hover,.book-option:hover{
  transform:translateY(-2px);
  border-color:#b48a57
}
.category-option.selected,.author-option.selected,.book-option.selected{
  background:#f3e6d3;
  border-color:#a77a49;
  box-shadow:0 0 0 1px #a77a4920
}
.category-symbol{
  font-size:29px;
  color:#a47a4e;
  width:30px;
  text-align:center;
  flex-shrink:0
}
.category-copy{
  display:grid;
  gap:5px;
  padding-right:9px
}
.category-copy strong{
  font-size:13px;
  font-weight:600
}
.category-copy small{
  font-size:10px;
  line-height:1.5;
  color:#9a856e
}
.selected-check{
  position:absolute;
  right:8px;
  top:8px
}
.search-box{
  display:flex;
  align-items:center;
  gap:10px;
  border:1px solid #decbb3;
  background:#fffdf9;
  border-radius:12px;
  padding:13px 16px;
  color:#ad8b65
}
.search-box input{
  border:0;
  background:none;
  outline:none;
  width:100%;
  font:inherit;
  font-size:14px;
  color:#5c4033
}
.search-box:focus-within{
  box-shadow:0 0 0 3px #b48a5725;
  border-color:#b48a57
}
.selected-list{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin:16px 0
}
.selected-list button{
  display:flex;
  align-items:center;
  gap:8px;
  background:#ede0cc;
  color:#6b4226;
  border:1px solid #d7bb98;
  border-radius:25px;
  padding:7px 11px;
  font-size:12px
}
.author-grid,.book-grid{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:10px;
  margin-top:22px
}
.author-grid legend,.book-grid legend{
  font-size:12px;
  color:#92775d;
  padding-bottom:14px
}
.author-option,.book-option{
  display:flex;
  align-items:center;
  gap:11px;
  padding:13px;
  border-radius:12px;
  border:1px solid #e8dac7;
  background:#fffdf8;
  color:#5f4632;
  text-align:left;
  font-size:12px;
  min-height:66px;
  transition:transform .18s,border-color .18s,background .18s
}
.author-initial{
  display:grid;
  place-items:center;
  flex-shrink:0;
  width:34px;
  height:34px;
  border-radius:50%;
  background:#eee3d3;
  color:#936c47;
  font-family:Georgia,serif;
  font-size:12px
}
.book-grid{
  grid-template-columns:repeat(2,minmax(0,1fr))
}
.book-option>span:nth-child(2){
  display:grid;
  gap:6px;
  flex:1
}
.book-option strong{
  font-size:13px;
  font-weight:600;
  line-height:1.5
}
.book-option small{
  font-size:11px;
  color:#9a8066;
  line-height:1.5
}
.book-symbol{
  display:grid;
  place-items:center;
  flex-shrink:0;
  width:42px;
  height:53px;
  color:#a98255;
  background:#f0e3cf;
  border-radius:3px 9px 9px 3px;
  border-left:3px solid #c2a17a
}
.card-actions{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  padding:23px 42px;
  border-top:1px solid #eddfcd;
  background:#fcf5eb
}
.card-actions>div{
  display:flex;
  align-items:center;
  gap:17px
}
.selection-count{
  font-size:11px;
  color:#a28c73;
  white-space:nowrap
}
.quiet-button,.back-button{
  border:0;
  background:none;
  color:#8d7155;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  font-size:12px;
  padding:10px 0
}
.primary-button{
  display:inline-flex;
  justify-content:center;
  align-items:center;
  gap:13px;
  padding:14px 21px;
  background:#6b4226;
  color:#fff8ec;
  border:0;
  border-radius:10px;
  font-size:13px;
  font-weight:600;
  box-shadow:0 4px 10px #6b42261a
}
.primary-button:hover{
  background:#54331e;
  transform:translateY(-1px)
}
.page-foot{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:9px;
  color:#9e866b;
  font-size:11px;
  text-align:center;
  line-height:1.6;
  margin:25px 10px 0
}
.search-status,.empty-state{
  font-size:12px;
  color:#927353;
  line-height:1.6;
  margin-top:15px
}
.save-error{
  color:#973e30;
  background:#f8e9de;
  margin:0 42px 20px;
  padding:13px;
  border-radius:9px;
  font-size:13px;
  line-height:1.5
}
.ambient{
  position:absolute;
  border:1px solid #d2b58d55;
  border-radius:50%;
  z-index:-1;
  pointer-events:none;
  width:550px;
  height:550px
}
.ambient-one{
  top:-260px;
  right:-240px;
  box-shadow:0 0 0 45px #d2b58d0b,0 0 0 90px #d2b58d08
}
.ambient-two{
  bottom:-300px;
  left:-290px;
  box-shadow:0 0 0 60px #d2b58d0b
}
.chapter-enter-active,.chapter-leave-active{
  transition:opacity .18s,transform .18s
}
.chapter-enter-from{
  opacity:0;
  transform:translateX(13px)
}
.chapter-leave-to{
  opacity:0;
  transform:translateX(-13px)
}
.sr-only{
  position:absolute;
  width:1px;
  height:1px;
  padding:0;
  overflow:hidden;
  clip:rect(0,0,0,0);
  white-space:nowrap;
  border:0
}
@keyframes page-in{
  from{
    opacity:0;
    transform:translateY(12px)
  }
  to{
    opacity:1;
    transform:translateY(0)
  }
}
@media(max-width:720px){
  .preferences-page{
    padding:21px 14px 28px
  }
  .intro{
    margin:30px 0 21px
  }
  .chapter-content{
    padding:27px 22px
  }
  .category-grid{
    grid-template-columns:repeat(2,minmax(0,1fr))
  }
  .author-grid{
    grid-template-columns:repeat(2,minmax(0,1fr))
  }
  .steps{
    gap:26px;
    padding:21px 15px
  }
  .card-actions{
    padding:20px 22px
  }
  .selection-count{
    display:none
  }
  h1{
    font-size:27px
  }
  .save-error{
    margin:0 22px 20px
  }
  .card-actions>div{
    gap:14px
  }
  .primary-button{
    padding:13px 15px;
    font-size:12px
  }
}
@media(max-width:430px){
  .steps{
    gap:20px
  }
  .steps button{
    font-size:12px;
    gap:6px
  }
  .step-number{
    width:25px;
    height:25px
  }
  .chapter-content{
    padding:25px 16px
  }
  .category-option{
    padding:14px 9px;
    gap:8px
  }
  .category-copy strong{
    font-size:12px
  }
  .category-copy small{
    font-size:9px
  }
  .category-symbol{
    font-size:24px;
    width:23px
  }
  .book-grid{
    grid-template-columns:1fr
  }
  .author-option{
    padding:10px;
    font-size:11px;
    gap:8px
  }
  .author-initial{
    width:27px;
    height:27px
  }
  .card-actions{
    padding:18px 16px;
    gap:9px
  }
  .next-actions{
    flex:1;
    justify-content:flex-end;
    flex-wrap:wrap
  }
  .primary-button{
    gap:7px
  }
  .eyebrow{
    font-size:9px
  }
  .optional-note{
    font-size:11px
  }
  .page-foot{
    font-size:10px
  }
}
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{
    animation:none!important;
    transition:none!important;
    transform:none!important
  }
}
</style>
