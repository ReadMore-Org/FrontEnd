import { normalizarCategoriasGoogle } from "@/utils/categoriasLivro";

export function googleBookToLivro(book) {
  const volumeInfo = book.volumeInfo ?? {};
  const ids = volumeInfo.industryIdentifiers ?? [];

  const isbn =
    ids.find((i) => i.type === "ISBN_13")?.identifier ||
    ids.find((i) => i.type === "ISBN_10")?.identifier ||
    null;

  // Trata o maturityRating do Google para o formato do seu sistema
  let faixaEtaria = "-";
  if (volumeInfo.maturityRating === "MATURE") {
    faixaEtaria = "Adulto (18+)";
  } else if (volumeInfo.maturityRating === "NOT_MATURE") {
    faixaEtaria = "Livre / Juvenil";
  }

  return {
    id: book.id,
    google_book_id: book.source === 'openlibrary' ? null : book.id,
    origem: book.source || 'google',
    titulo: volumeInfo.title ?? "",
    subtitulo: volumeInfo.subtitle ?? "",

    autores: (volumeInfo.authors ?? []).map((nome) => ({
      nome,
    })),

    isbn,
    nota: null,
    avaliacoes: 0,
    popularidade_google: volumeInfo.ratingsCount ?? 0,
    nota_google: volumeInfo.averageRating ?? 0,
    categorias_originais: volumeInfo.categories ?? [],

    paginas: volumeInfo.pageCount ?? null,
    idioma: volumeInfo.language ?? null,
    publicacao: volumeInfo.publishedDate ?? null,
    editora: volumeInfo.publisher ?? null,
    sinopse: volumeInfo.description ?? "",

    capa: volumeInfo.imageLinks?.thumbnail ?? volumeInfo.imageLinks?.smallThumbnail ?? null,
    capa_google: book.source === 'openlibrary' ? book.googleCover ?? null
      : volumeInfo.imageLinks?.thumbnail ?? volumeInfo.imageLinks?.smallThumbnail ?? null,
    imageLinks: volumeInfo.imageLinks ?? {},

    // Categorias do Google já em português, ex.: ["Ficção", "Romance"].
    // O importador do backend usa este campo (chave "categorias").
    categorias: normalizarCategoriasGoogle(volumeInfo.categories),

    faixa_etaria: faixaEtaria,
  };
}