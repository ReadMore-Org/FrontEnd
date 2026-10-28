import { getRecommendedEdition } from "./recommendations";
import axios from "axios";

const API_KEY = import.meta.env?.VITE_GOOGLE_BOOKS_API_KEY;

const googleBooksApi = axios.create({
  baseURL: "https://www.googleapis.com/books/v1",
});

export async function searchBooks(query, options = {}) {
  const request = () => googleBooksApi.get("/volumes", {
    signal: options.signal,
    timeout: options.timeout ?? 15000,
    params: {
      q: query,
      key: API_KEY || undefined,
      printType: "books",
      maxResults: options.maxResults ?? 40,
      startIndex: options.startIndex ?? 0,
      langRestrict: options.langRestrict || undefined,
      orderBy: options.orderBy === "newest" ? "newest" : "relevance",
    },
  });
  for (let attempt = 0; ; attempt++) {
    try { return (await request()).data; }
    catch (error) {
      if (options.signal?.aborted || axios.isCancel(error) || attempt >= (options.retries ?? 0)
        || ![500, 502, 503, 504].includes(error.response?.status)) throw error;
      await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
}

export async function searchBookByISBN(isbn) {
  const response = await googleBooksApi.get("/volumes", {
    params: {
      q: `isbn:${isbn}`,
      key: API_KEY,
    },
  });

  return response.data;
}

export async function getBookById(id) {
  if (String(id).startsWith('isbn:')) return getRecommendedEdition(String(id).slice(5));
  const response = await googleBooksApi.get(`/volumes/${id}`, {
    params: {
      key: API_KEY,
    },
  });

  return response.data;
} 