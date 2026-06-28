import api from "./api";

// Alterado para aceitar a descrição opcional igual ao seu código de referência
export async function uploadImagem(file, description = "") {
  const formData = new FormData();
  formData.append("file", file);

  if (description) {
    formData.append("description", description);
  }

  // Usando a instância "api" que já tem o interceptor de token configurado
  const response = await api.post("/uploads/images/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}
