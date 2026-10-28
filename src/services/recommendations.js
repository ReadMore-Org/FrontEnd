import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const client = axios.create({ baseURL: API_BASE_URL, timeout: 25000 });

export async function getSavedRecommendations(entries) {
  const params = new URLSearchParams();
  for (const [title] of entries) params.append("titulo", title);
  const { data } = await client.get("/livros/recomendados/", { params });
  if (!Array.isArray(data)) throw new Error("Resposta inválida do catálogo local");
  return data;
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
