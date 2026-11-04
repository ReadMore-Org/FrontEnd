import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const client = axios.create({ baseURL: API_BASE_URL, timeout: 25000 });

export async function getSavedRecommendations(entries) {
  const requests = [];
  for (let offset = 0; offset < entries.length; offset += 120) {
    const params = new URLSearchParams();
    for (const [title] of entries.slice(offset, offset + 120)) params.append('titulo', title);
    requests.push(client.get('/livros/recomendados/', { params }).then(({ data }) => {
      if (!Array.isArray(data)) throw new Error('Resposta inválida do catálogo local');
      return data;
    }));
  }
  return [...new Map((await Promise.all(requests)).flat().map(book => [book.id, book])).values()];
}

export async function searchRecommendedBooks([title, author]) {
  const { data } = await client.get("/livros/catalogo-recomendados/", {
    params: { titulo: title, autor: author },
  });
  return data;
}

export async function getRecommendedEdition(isbn) {
  const { data } = await client.get("/livros/catalogo-edicao/", { params: { isbn } });
  return data;
}
