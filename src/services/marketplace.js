import api from "./api";

// A baseURL do axios já inclui /api (VITE_API_BASE_URL)

// params: { page, page_size, tipo, categoria, q }
export const getAnuncios = (params = {}) => api.get("/anuncios/", { params });

export const getAnuncio = (id) => api.get(`/anuncios/${id}/`);

// data: { livro_usuario, tipo, condicao, observacao }
export const createAnuncio = (data) => api.post("/anuncios/", data);

export const updateAnuncio = (id, data) => api.patch(`/anuncios/${id}/`, data);

export const deleteAnuncio = (id) => api.delete(`/anuncios/${id}/`);