<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { Store, ArrowLeftRight, BookMarked, Trash2 } from "lucide-vue-next";

import { useLivrosStore } from "@/stores/livros";
import { useMarketplaceStore } from "@/stores/marketplace";
import { useAuthStore } from "@/stores/auth";
import {
  ROTULO_TIPO,
  ROTULO_CONDICAO,
  extrairErroApi,
} from "@/utils/marketplaceHelpers";

// meuLivroItem = item da estante do usuário (LivroUsuario), o mesmo
// `meuLivroItem` que já existe em bookPage.vue e bookPageMobile.vue
const props = defineProps({
  meuLivroItem: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["atualizado"]);

const router = useRouter();
const toast = useToast();
const livroStore = useLivrosStore();
const marketplaceStore = useMarketplaceStore();
const authStore = useAuthStore();

// Regra de negócio: só quem tem o livro com status "lendo" ou "lido" pode anunciar
const statusAtual = computed(() =>
  String(props.meuLivroItem?.status ?? "").toLowerCase(),
);
const podeAnunciar = computed(
  () =>
    !!props.meuLivroItem?.id && ["lendo", "lido"].includes(statusAtual.value),
);
const anuncio = computed(() => props.meuLivroItem?.anuncio ?? null);

const modal = ref(null); // "publicar" | "remover" | null
const tipo = ref("troca");
const condicao = ref("bom");
const observacao = ref("");
const salvando = ref(false);
const erro = ref("");

const opcoesTipo = [
  {
    value: "troca",
    titulo: "Troca",
    descricao: "Você oferece o livro em troca de outro.",
    icone: ArrowLeftRight,
  },
  {
    value: "emprestimo",
    titulo: "Empréstimo",
    descricao: "Você empresta e o livro volta para você.",
    icone: BookMarked,
  },
];

function abrirPublicar() {
  if (!authStore.isAuthenticated) {
    router.push("/entrar");
    return;
  }
  tipo.value = "troca";
  condicao.value = "bom";
  observacao.value = "";
  erro.value = "";
  modal.value = "publicar";
}

function abrirRemover() {
  erro.value = "";
  modal.value = "remover";
}

function fechar() {
  if (salvando.value) return;
  modal.value = null;
}

async function publicar() {
  if (salvando.value) return;

  salvando.value = true;
  erro.value = "";

  try {
    await marketplaceStore.criarAnuncio({
      livro_usuario: props.meuLivroItem.id,
      tipo: tipo.value,
      condicao: condicao.value,
      observacao: observacao.value.trim(),
    });

    // Recarrega a estante para o item vir com o campo `anuncio` preenchido
    await livroStore.fetchMeusLivros();

    toast.success("Livro enviado ao marketplace!");
    modal.value = null;
    emit("atualizado");
  } catch (err) {
    erro.value = extrairErroApi(err, "Não foi possível enviar o livro.");
  } finally {
    salvando.value = false;
  }
}

async function remover() {
  if (salvando.value || !anuncio.value) return;

  salvando.value = true;
  erro.value = "";

  try {
    await marketplaceStore.removerAnuncio(anuncio.value.id);
    await livroStore.fetchMeusLivros();

    toast.success("Livro removido do marketplace.");
    modal.value = null;
    emit("atualizado");
  } catch (err) {
    erro.value = extrairErroApi(err, "Não foi possível remover o anúncio.");
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <div v-if="podeAnunciar" class="marketplace-box">
    <template v-if="anuncio">
      <span class="chip-anunciado">
        <Store :size="15" />
        No marketplace: {{ ROTULO_TIPO[anuncio.tipo] }}
      </span>

      <button
        type="button"
        class="btn-remover-mkt"
        @click="abrirRemover"
      >
        Remover do marketplace
      </button>
    </template>

    <button
      v-else
      type="button"
      class="btn-enviar-mkt"
      @click="abrirPublicar"
    >
      <Store :size="17" />
      <span>Enviar ao marketplace</span>
    </button>
  </div>

  <Teleport to="body">
    <div v-if="modal" class="modal-overlay" @click.self="fechar">
      <!-- PUBLICAR -->
      <div
        v-if="modal === 'publicar'"
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-publicar"
      >
        <button
          class="modal-fechar"
          type="button"
          :disabled="salvando"
          aria-label="Fechar"
          @click="fechar"
        >
          ×
        </button>

        <h2 id="titulo-modal-publicar">Enviar ao marketplace</h2>
        <p class="modal-sub">
          <strong>{{ meuLivroItem?.livro?.titulo }}</strong> ficará visível
          para os outros leitores.
        </p>

        <p class="campo-label">O que você quer fazer?</p>
        <div class="opcoes-tipo">
          <button
            v-for="opcao in opcoesTipo"
            :key="opcao.value"
            type="button"
            class="opcao-tipo"
            :class="{ ativa: tipo === opcao.value }"
            @click="tipo = opcao.value"
          >
            <component :is="opcao.icone" :size="20" />
            <span class="opcao-titulo">{{ opcao.titulo }}</span>
            <span class="opcao-desc">{{ opcao.descricao }}</span>
          </button>
        </div>

        <p class="campo-label">Condição do exemplar</p>
        <div class="chips">
          <button
            v-for="(rotulo, valor) in ROTULO_CONDICAO"
            :key="valor"
            type="button"
            class="chip"
            :class="{ 'chip-ativo': condicao === valor }"
            @click="condicao = valor"
          >
            {{ rotulo }}
          </button>
        </div>

        <label class="campo-label" for="obs-anuncio">
          Observação <span class="opcional">(opcional)</span>
        </label>
        <textarea
          id="obs-anuncio"
          v-model="observacao"
          class="textarea"
          rows="3"
          maxlength="255"
          placeholder="Ex.: troco por ficção científica, retiro no centro..."
        ></textarea>
        <span class="contador">{{ observacao.length }}/255</span>

        <p v-if="erro" class="msg-erro" role="alert">{{ erro }}</p>

        <div class="modal-acoes">
          <button
            type="button"
            class="btn-cancelar"
            :disabled="salvando"
            @click="fechar"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn-confirmar"
            :disabled="salvando"
            @click="publicar"
          >
            {{ salvando ? "Enviando..." : "Enviar ao marketplace" }}
          </button>
        </div>
      </div>

      <!-- REMOVER -->
      <div
        v-else
        class="modal modal-remover"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-remover"
      >
        <button
          class="modal-fechar"
          type="button"
          :disabled="salvando"
          aria-label="Fechar"
          @click="fechar"
        >
          ×
        </button>

        <div class="modal-icone">
          <Trash2 :size="28" color="#a4161a" />
        </div>

        <h2 id="titulo-modal-remover">Remover do marketplace?</h2>
        <p class="modal-sub">
          <strong>{{ meuLivroItem?.livro?.titulo }}</strong> deixa de aparecer
          para os outros leitores. Ele continua na sua estante.
        </p>

        <p v-if="erro" class="msg-erro" role="alert">{{ erro }}</p>

        <div class="modal-acoes">
          <button
            type="button"
            class="btn-cancelar"
            :disabled="salvando"
            @click="fechar"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="btn-remover-confirmar"
            :disabled="salvando"
            @click="remover"
          >
            {{ salvando ? "Removendo..." : "Remover" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ===== Botão na página do livro ===== */
.marketplace-box {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.btn-enviar-mkt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: 50px;
  background: #6b4226;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-enviar-mkt:hover {
  background: #52321c;
}

.chip-anunciado {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 35px;
  padding: 0 14px;
  border-radius: 20px;
  background: #faf3e0;
  border: 1px solid #e8d8c3;
  color: #6b4226;
  font-size: 13px;
  font-weight: 500;
}

.btn-remover-mkt {
  height: 35px;
  padding: 0 12px;
  background: transparent;
  border: 1px solid #a4161a;
  border-radius: 8px;
  color: #a4161a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.btn-remover-mkt:hover {
  background: #a4161a;
  color: #ffffff;
}

/* ===== Modal (mesmo padrão do modal de remover da estante) ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
  animation: aparecerOverlay 0.2s ease;
}

.modal {
  position: relative;
  width: min(480px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-sizing: border-box;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: aparecerModal 0.2s ease;
}

.modal-remover {
  width: min(420px, 100%);
  text-align: center;
}

.modal h2 {
  margin: 0 0 8px;
  color: #4b3626;
  font-size: 22px;
  font-weight: 600;
}

.modal-sub {
  margin: 0 0 20px;
  color: #6f6257;
  font-size: 14px;
  line-height: 1.6;
}

.modal-sub strong {
  color: #4b3626;
}

.modal-fechar {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #8a7a6a;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.modal-fechar:hover {
  background: #f3eee9;
  color: #5a4636;
}

.modal-icone {
  width: 56px;
  height: 56px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fbe9e9;
}

.campo-label {
  display: block;
  margin: 18px 0 8px;
  color: #5a4636;
  font-size: 14px;
  font-weight: 500;
}

.opcional {
  color: #9c8a7a;
  font-weight: 400;
}

/* Troca / Empréstimo */
.opcoes-tipo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.opcao-tipo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px;
  background: #ffffff;
  border: 1px solid #e8d8c3;
  border-radius: 12px;
  color: #6b4226;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.opcao-tipo:hover {
  border-color: #6b4226;
}

.opcao-tipo.ativa {
  background: #faf3e0;
  border-color: #6b4226;
  box-shadow: inset 0 0 0 1px #6b4226;
}

.opcao-titulo {
  font-size: 15px;
  font-weight: 600;
  color: #2c2c2c;
}

.opcao-desc {
  font-size: 12px;
  line-height: 1.4;
  color: #9c8a7a;
}

/* Condição */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  border: 1px solid #e5ded2;
  background: #ffffff;
  color: #2c2c2c;
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.chip:hover {
  border-color: #6b4226;
}

.chip-ativo {
  background: #6b4226;
  border-color: #6b4226;
  color: #ffffff;
}

.textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e5ded2;
  border-radius: 10px;
  background: #ffffff;
  color: #2c2c2c;
  font: inherit;
  font-size: 14px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.textarea:focus {
  border-color: #6b4226;
}

.contador {
  display: block;
  margin-top: 4px;
  text-align: right;
  color: #9c8a7a;
  font-size: 12px;
}

.msg-erro {
  margin: 14px 0 0;
  color: #a4161a;
  font-size: 13px;
  font-weight: 500;
}

.modal-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.modal-remover .modal-acoes {
  justify-content: center;
}

.btn-cancelar,
.btn-confirmar,
.btn-remover-confirmar {
  min-width: 110px;
  height: 40px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.btn-cancelar {
  background: #ffffff;
  border: 1px solid #d8c9ba;
  color: #5a4636;
}

.btn-cancelar:hover {
  background: #f5f0eb;
}

.btn-confirmar {
  background: #6b4226;
  border: 1px solid #6b4226;
  color: #ffffff;
}

.btn-confirmar:hover {
  background: #52321c;
  border-color: #52321c;
}

.btn-remover-confirmar {
  background: #a4161a;
  border: 1px solid #a4161a;
  color: #ffffff;
}

.btn-remover-confirmar:hover {
  background: #861215;
  border-color: #861215;
}

.btn-cancelar:disabled,
.btn-confirmar:disabled,
.btn-remover-confirmar:disabled,
.modal-fechar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes aparecerOverlay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes aparecerModal {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 600px) {
  .btn-enviar-mkt,
  .btn-remover-mkt {
    width: 100%;
  }

  .modal {
    padding: 28px 20px;
  }

  .opcoes-tipo {
    grid-template-columns: 1fr;
  }

  .modal-acoes {
    flex-direction: column-reverse;
  }

  .btn-cancelar,
  .btn-confirmar,
  .btn-remover-confirmar {
    width: 100%;
  }
}
</style>