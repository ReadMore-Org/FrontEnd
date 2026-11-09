import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const client = axios.create({ baseURL: API_BASE_URL, timeout: 25000 });

// Libera a interface mesmo se o transporte não encerrar uma requisição a tempo.
function catalogGet(url, { signal, ...config } = {}, timeout = 6000) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    let timer;
    const finish = (callback, value) => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      callback(value);
    };
    const abort = () => {
      controller.abort();
      finish(reject, Object.assign(new Error('Tempo de busca esgotado'), { code: 'ECONNABORTED' }));
    };
    if (signal?.aborted) return abort();
    signal?.addEventListener('abort', abort, { once: true });
    timer = setTimeout(abort, timeout);
    client.get(url, { ...config, timeout, signal: controller.signal })
      .then(response => finish(resolve, response), error => finish(reject, error));
  });
}

export async function getSavedRecommendations(entries, { signal } = {}) {
  const requests = [];
  for (let offset = 0; offset < entries.length; offset += 120) {
    const params = new URLSearchParams();
    for (const [title] of entries.slice(offset, offset + 120)) params.append('titulo', title);
    requests.push(catalogGet('/livros/recomendados/', { params, signal }, 2000).then(({ data }) => {
      if (!Array.isArray(data)) throw new Error('Resposta inválida do catálogo local');
      return data;
    }));
  }
  const responses = await Promise.allSettled(requests);
  const available = responses.filter(response => response.status === 'fulfilled');
  if (!available.length && responses.length) throw responses[0].reason;
  return [...new Map(available.flatMap(response => response.value).map(book => [book.id, book])).values()];
}

export async function searchRecommendedBooks([title, author], { signal, retryEmpty = false } = {}) {
  const { data } = await catalogGet('/livros/catalogo-recomendados/', {
    params: { titulo: title, autor: author, ...(retryEmpty ? { retry_empty: "1" } : {}) }, signal,
  });
  return data;
}

export async function getRecommendedEdition(isbn) {
  const { data } = await client.get("/livros/catalogo-edicao/", { params: { isbn } });
  return data;
}
