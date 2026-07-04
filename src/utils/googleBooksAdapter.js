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
    titulo: volumeInfo.title ?? "",
    subtitulo: volumeInfo.subtitle ?? "",

    autores: (volumeInfo.authors ?? []).map((nome) => ({
      nome,
    })),

    isbn,

    paginas: volumeInfo.pageCount ?? null,
    idioma: volumeInfo.language ?? null,
    publicacao: volumeInfo.publishedDate ?? null,
    editora: volumeInfo.publisher ?? null,
    sinopse: volumeInfo.description ?? "",

    capa: volumeInfo.imageLinks?.thumbnail ?? null,
    
    // 👈 Adiciona o campo mapeado aqui para bater com o seu componente
    faixa_etaria: faixaEtaria, 
  };
}