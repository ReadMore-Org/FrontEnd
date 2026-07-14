import axios from "axios";

const API_KEY = "AIzaSyBsS5MT1KT9j3XPcqnm_q7-wxx6kdQzZDU"; // Sua chave atual
const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export async function searchBooks(query, startIndex = 0, maxResults = 20) {
  const response = await axios.get(BASE_URL, {
    params: {
      q: query,
      startIndex,
      maxResults,
      langRestrict: "pt",
      orderBy: "relevance",
      key: API_KEY,
    },
  });
  return response.data;
}

export async function searchBookByISBN(isbn) {
  const response = await axios.get(BASE_URL, {
    params: {
      q: `isbn:${isbn}`,
      key: API_KEY,
    },
  });
  return response.data;
}

export async function getBookById(id) {
  const response = await axios.get(`${BASE_URL}/${id}`, {
    params: {
      key: API_KEY,
    },
  });
  return response.data;
}