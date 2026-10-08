<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import {
  ArrowLeft,
  Mail,
  Languages,
  BookOpen,
  Calendar,
  Barcode,
  Trash2,
  Star,
} from "lucide-vue-next";

import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";

import { getAnuncio } from "@/services/marketplace";
import { useMarketplaceStore } from "@/stores/marketplace";
import { useLivrosStore } from "@/stores/livros";
import { useAuthStore } from "@/stores/auth";
import {
  getCapaUrl,
  getAutoresTexto,
  getCategoriasLivro,
  getFotoDono,
  getPrimeiroNome,
  limparSinopse,
  formatarData,
  extrairErroApi,
  ROTULO_TIPO,
  ROTULO_CONDICAO,
} from "@/utils/marketplaceHelpers";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const marketplaceStore = useMarketplaceStore();
const livroStore = useLivrosStore();
const authStore = useAuthStore();

const anuncio = ref(null);
const loading = ref(true);
const erro = ref("");
const removendo = ref(false);

// =========================================================
// CARREGAMENTO
// =========================================================
async function carregar() {
  loading.value = true;
  erro.value = "";
  anuncio.value = null;

  try {
    const { data } = await getAnuncio(route.params.id);
    anuncio.value = data;
  } catch (err) {
    erro.value =
      err.response?.status === 404
        ? "Este anúncio não está mais disponível."
        : extrairErroApi(err, "Não foi possível carregar o anúncio.");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push("/entrar");
    return;
  }
  carregar();
});

watch(
  () => route.params.id,
  (novoId) => {
    if (novoId) carregar();
  },
);

// =========================================================
// DADOS DERIVADOS
// =========================================================
const livro = computed(() => anuncio.value?.livro ?? null);
const dono = computed(() => anuncio.value?.dono ?? null);

const ehMeuAnuncio = computed(
  () => !!dono.value && authStore.user?.id === dono.value.id,
);

const capa = computed(() => getCapaUrl(livro.value));
const autores = computed(() => getAutoresTexto(livro.value));
const categorias = computed(() => getCategoriasLivro(livro.value));
const sinopse = computed(() => limparSinopse(livro.value?.sinopse));
const fotoDono = computed(() => getFotoDono(dono.value));
const primeiroNomeDono = computed(() => getPrimeiroNome(dono.value));

const idiomaTexto = computed(() => {
  const idioma = livro.value?.idioma;
  if (!idioma) return "-";
  return idioma === "pt" || idioma === "pt-BR" ? "Português" : idioma;
});

const nota = computed(() => Number(livro.value?.nota) || 0);

// =========================================================
// CONTATO
// =========================================================
// Por enquanto abre o email do dono. Quando o chat existir, troque este
// computed por uma função que faz router.push(`/chat/${dono.value.id}`)
const linkContato = computed(() => {
  const email = dono.value?.email;
  if (!email || !livro.value) return "#";

  const tipo = (ROTULO_TIPO[anuncio.value.tipo] ?? "").toLowerCase();
  const assunto = `ReadMore: tenho interesse em "${livro.value.titulo}"`;
  const corpo =
    `Olá, ${primeiroNomeDono.value}! ` +
    `Vi seu anúncio de ${tipo} do livro "${livro.value.titulo}" no ReadMore ` +
    `e gostaria de conversar.`;

  return `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
});

// =========================================================
// REMOVER (somente o dono)
// =========================================================
async function removerAnuncio() {
  if (removendo.value) return;
  if (!window.confirm("Remover este livro do marketplace? Ele continua na sua estante.")) {
    return;
  }

  removendo.value = true;

  try {
    await marketplaceStore.removerAnuncio(anuncio.value.id);
    await livroStore.fetchMeusLivros();
    toast.success("Livro removido do marketplace.");
    router.push("/marketplace");
  } catch (err) {
    toast.error(extrairErroApi(err, "Não foi possível remover o anúncio."));
  } finally {
    removendo.value = false;
  }
}

function voltar() {
  window.history.length > 1 ? router.back() : router.push("/marketplace");
}
</script>

<template>
  <AppHeader />

  <main class="pagina-anuncio">
    <button type="button" class="btn-voltar" @click="voltar">
      <ArrowLeft :size="17" />
      <span>Voltar</span>
    </button>

    <div v-if="loading" class="estado">
      <div class="spinner"></div>
      <p>Carregando anúncio...</p>
    </div>

    <div v-else-if="erro" class="estado estado-erro">
      <p>{{ erro }}</p>
      <RouterLink to="/marketplace" class="btn-primario">Voltar ao marketplace</RouterLink>
    </div>

    <template v-else-if="anuncio && livro">
      <!-- TOPO: capa + info do anúncio -->
      <div class="topo">
        <img class="imagem-capa" :src="capa" :alt="`Capa de ${livro.titulo}`" />

        <div class="info">
          <span
            class="badge"
            :class="anuncio.tipo === 'troca' ? 'badge-troca' : 'badge-emprestimo'"
          >
            {{ ROTULO_TIPO[anuncio.tipo] }}
          </span>

          <h1 class="titulo">{{ livro.titulo }}</h1>

          <p v-if="autores" class="autores">
            por <span class="autores-nome">{{ autores }}</span>
          </p>

          <div v-if="nota" class="nota">
            <div class="estrelas">
              <span
                v-for="i in 5"
                :key="i"
                class="estrela"
                :class="{ preenchida: i <= Math.round(nota) }"
              >
                <Star :size="16" />
              </span>
            </div>
            <p class="nota-valor">{{ nota.toFixed(1) }}</p>
            <p class="nota-texto">({{ livro.avaliacoes ?? 0 }} avaliações)</p>
          </div>

          <div class="tags">
            <span class="tag tag-condicao">
              {{ ROTULO_CONDICAO[anuncio.condicao] ?? anuncio.condicao }}
            </span>
            <span v-for="categoria in categorias" :key="categoria" class="tag">
              {{ categoria }}
            </span>
          </div>

          <p v-if="anuncio.observacao" class="observacao">
            "{{ anuncio.observacao }}"
          </p>

          <p class="anunciado-em">Anunciado em {{ formatarData(anuncio.criado_em) }}</p>

          <RouterLink :to="`/livro/${livro.id}`" class="link-livro">
            Ver página do livro
          </RouterLink>
        </div>
      </div>

      <!-- DONO -->
      <section class="card-dono">
        <h2 class="titulo-card">{{ ehMeuAnuncio ? "Seu anúncio" : "Quem está anunciando" }}</h2>

        <div class="dono-linha">
          <img class="foto-dono" :src="fotoDono" :alt="dono.name || 'Dono do livro'" />

          <div class="dono-dados">
            <p class="dono-nome">{{ dono.name || "Leitor do ReadMore" }}</p>
            <p v-if="dono.email" class="dono-email">{{ dono.email }}</p>
            <p v-if="dono.bio" class="dono-bio">{{ dono.bio }}</p>
          </div>
        </div>

        <template v-if="ehMeuAnuncio">
          <button
            type="button"
            class="btn-remover"
            :disabled="removendo"
            @click="removerAnuncio"
          >
            <Trash2 :size="17" />
            <span>{{ removendo ? "Removendo..." : "Remover do marketplace" }}</span>
          </button>
        </template>

        <template v-else>
          <a :href="linkContato" class="btn-contato">
            <Mail :size="17" />
            <span>Entrar em contato</span>
          </a>
          <p class="aviso-chat">Em breve você poderá conversar direto pelo ReadMore.</p>
        </template>
      </section>

      <!-- SINOPSE + DETALHES -->
      <div class="info-maior">
        <section class="secao">
          <h2 class="titulo-card">Sinopse</h2>
          <p class="texto-sinopse">{{ sinopse || "Sem sinopse disponível." }}</p>
        </section>

        <section class="secao">
          <h2 class="titulo-card">Detalhes</h2>

          <div class="grid-detalhes">
            <div class="detalhe-item">
              <Languages :size="16" class="icone-detalhe" />
              <p class="detalhe-label">Idioma</p>
              <p class="detalhe-valor">{{ idiomaTexto }}</p>
            </div>
            <div class="detalhe-item">
              <BookOpen :size="16" class="icone-detalhe" />
              <p class="detalhe-label">Páginas</p>
              <p class="detalhe-valor">{{ livro.paginas || "-" }}</p>
            </div>
            <div class="detalhe-item">
              <Calendar :size="16" class="icone-detalhe" />
              <p class="detalhe-label">Publicado</p>
              <p class="detalhe-valor">{{ formatarData(livro.publicacao) }}</p>
            </div>
            <div class="detalhe-item">
              <Barcode :size="16" class="icone-detalhe" />
              <p class="detalhe-label">ISBN</p>
              <p class="detalhe-valor">{{ livro.isbn || "-" }}</p>
            </div>
          </div>
        </section>
      </div>
    </template>
  </main>

  <AppFooter />
</template>

<style scoped>
.pagina-anuncio {
  min-height: 80vh;
  padding: 20px 20vw 4vw;
}

.btn-voltar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 4px;
  margin-bottom: 20px;
  border: none;
  background: none;
  color: #5a4636;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: color 0.2s ease, transform 0.2s ease;
}

.btn-voltar:hover {
  color: #6b4226;
  transform: translateX(-2px);
}

/* Estados */
.estado {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  text-align: center;
  color: #6b4226;
  font-weight: 500;
}

.estado-erro p {
  color: #a4161a;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #e8d8c3;
  border-top: 4px solid #6b4226;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-primario {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 24px;
  border-radius: 50px;
  background: #6b4226;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-primario:hover {
  background: #52321c;
}

/* Topo */
.topo {
  display: flex;
  gap: 36px;
  margin-bottom: 28px;
}

.imagem-capa {
  width: 220px;
  height: auto;
  align-self: flex-start;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(107, 66, 38, 0.18);
  object-fit: cover;
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.badge {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

.badge-troca {
  background: #3b6ea5;
}

.badge-emprestimo {
  background: #4a8c5f;
}

.titulo {
  font-size: 26px;
  font-weight: 700;
  color: #2c2c2c;
  margin: 0;
}

.autores {
  color: #5a4636;
  font-size: 15px;
  margin: 0;
}

.autores-nome {
  font-weight: 500;
}

.nota {
  display: flex;
  align-items: center;
  gap: 10px;
}

.estrelas {
  display: flex;
  gap: 2px;
  color: #e8d8c3;
}

.estrela.preenchida {
  color: #c9a227;
}

.nota-valor {
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
}

.nota-texto {
  color: #9c8a7a;
  font-size: 13px;
  margin: 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background-color: #faf3e0;
  border: 1px solid #e8d8c3;
  color: #6b4226;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.tag-condicao {
  background-color: #ffffff;
}

.observacao {
  max-width: 520px;
  margin: 0;
  color: #5a4636;
  font-size: 14px;
  font-style: italic;
  line-height: 1.6;
}

.anunciado-em {
  margin: 0;
  color: #9c8a7a;
  font-size: 13px;
}

.link-livro {
  color: #6b4226;
  font-size: 14px;
  font-weight: 500;
  text-decoration: underline;
}

.link-livro:hover {
  color: #52321c;
}

/* Card do dono */
.card-dono {
  background: #ffffff;
  border: 1px solid #e8d8c3;
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.titulo-card {
  font-size: 15px;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
}

.dono-linha {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.foto-dono {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  background: #d8cfc0;
  flex-shrink: 0;
}

.dono-dados {
  min-width: 0;
}

.dono-nome {
  margin: 0;
  color: #2c2c2c;
  font-size: 17px;
  font-weight: 600;
}

.dono-email {
  margin: 2px 0 0;
  color: #5a4636;
  font-size: 14px;
  overflow-wrap: anywhere;
}

.dono-bio {
  margin: 6px 0 0;
  color: #9c8a7a;
  font-size: 13px;
  line-height: 1.5;
}

.btn-contato,
.btn-remover {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  padding: 0 24px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.btn-contato {
  border: none;
  background: #6b4226;
  color: #ffffff;
}

.btn-contato:hover {
  background: #52321c;
}

.btn-remover {
  background: transparent;
  border: 1px solid #a4161a;
  color: #a4161a;
}

.btn-remover:hover:not(:disabled) {
  background: #a4161a;
  color: #ffffff;
}

.btn-remover:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.aviso-chat {
  margin: -6px 0 0;
  color: #9c8a7a;
  font-size: 12px;
}

/* Sinopse + detalhes (mesmo visual da página do livro) */
.info-maior {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 24px;
}

.secao {
  background-color: #faf3e0;
  border: 1px solid #e8d8c3;
  border-radius: 12px;
  padding: 20px 22px;
  height: fit-content;
}

.secao .titulo-card {
  margin-bottom: 14px;
}

.texto-sinopse {
  font-size: 14px;
  line-height: 1.75;
  color: #5a4636;
  margin: 0;
  white-space: pre-line;
}

.grid-detalhes {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detalhe-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icone-detalhe {
  color: #6b4226;
  flex-shrink: 0;
}

.detalhe-label {
  color: #9c8a7a;
  font-size: 13px;
  margin: 0;
}

.detalhe-valor {
  color: #5a4636;
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 0 auto;
}

@media (max-width: 1000px) {
  .pagina-anuncio {
    padding: 20px 6vw 4vw;
  }
}

@media (max-width: 700px) {
  .pagina-anuncio {
    padding: 16px 20px 100px;
  }

  .topo {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .imagem-capa {
    width: 180px;
    align-self: center;
  }

  .info {
    width: 100%;
  }

  .titulo {
    font-size: 22px;
  }

  .info-maior {
    grid-template-columns: 1fr;
  }

  .btn-contato,
  .btn-remover {
    width: 100%;
  }
}
</style>