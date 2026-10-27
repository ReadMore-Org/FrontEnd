import { getBookCover, getUserPhoto } from "@/utils/images";
export { FALLBACK_CAPA, FALLBACK_AVATAR } from "@/utils/images";

export const ROTULO_TIPO = {
  troca: "Troca",
  emprestimo: "Empréstimo",
};

export const ROTULO_CONDICAO = {
  novo: "Novo",
  bom: "Bom estado",
  regular: "Regular",
  desgastado: "Desgastado",
};

// Mesma regra de capa que você já usa nos outros cards
export const getCapaUrl = getBookCover;

export function getAutoresTexto(livro) {
  if (!livro?.autores?.length) return "";
  return livro.autores
    .map((a) => (typeof a === "string" ? a : a.nome))
    .join(", ");
}

// O backend devolve categoria como lista de objetos { id, descricao }
export function getCategoriasLivro(livro) {
  const lista = Array.isArray(livro?.categoria) ? livro.categoria : [];
  return lista.map((c) => (typeof c === "object" ? c.descricao : String(c)));
}

export function getFotoDono(dono) {
  return getUserPhoto(dono);
}

export function getPrimeiroNome(dono) {
  const nome = dono?.name?.trim();
  return nome ? nome.split(" ")[0] : "Leitor";
}

// Minúsculas e sem acento, para busca local
export function normalizar(texto) {
  return String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// A sinopse vem do Google com tags HTML; aqui vira texto puro (seguro)
export function limparSinopse(sinopse) {
  if (!sinopse) return "";
  return String(sinopse)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function formatarData(data) {
  if (!data) return "-";
  const d = new Date(data);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("pt-BR");
}

// Extrai a primeira mensagem de erro de uma resposta do DRF
export function extrairErroApi(err, padrao = "Algo deu errado. Tente novamente.") {
  const data = err?.response?.data;
  if (!data) return padrao;
  if (typeof data === "string") return padrao;
  if (data.detail) return data.detail;

  const primeiro = Object.values(data)[0];
  if (Array.isArray(primeiro) && primeiro.length) return String(primeiro[0]);
  if (typeof primeiro === "string") return primeiro;
  return padrao;
}