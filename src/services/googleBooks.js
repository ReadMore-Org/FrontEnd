import axios from "axios";

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

const googleBooksApi = axios.create({
  baseURL: "https://www.googleapis.com/books/v1",
});

export async function searchBooks(query) {
  const response = await googleBooksApi.get("/volumes", {
    params: {
      q: query,
      key: API_KEY,
      maxResults: 20,
      langRestrict: "pt",
      orderBy: "relevance", 
    },
  });

  return response.data;
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
  const response = await googleBooksApi.get(`/volumes/${id}`, {
    params: {
      key: API_KEY,
    },
  });

  return response.data;
} 