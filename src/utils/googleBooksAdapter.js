export function googleBookToLivro(book) {
  const volumeInfo = book.volumeInfo ?? {};

  const ids = volumeInfo.industryIdentifiers ?? [];

  const isbn =
    ids.find((i) => i.type === "ISBN_13")?.identifier ||
    ids.find((i) => i.type === "ISBN_10")?.identifier ||
    null;

  return {
    id: book.id, // 👈 ESSENCIAL
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
  };
}