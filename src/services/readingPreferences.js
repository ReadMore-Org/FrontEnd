import api from './api';

export async function saveReadingPreferences(payload) {
  return (await api.post('/usuarios/preferencias-leitura/', payload)).data;
}
export async function discoverReadingOptions(query, signal) {
  return (await api.get('/usuarios/descobrir-leituras/', { params: { q: query }, signal, timeout: 12000 })).data;
}
export async function getPersonalizedEntries() {
  return (await api.get('/usuarios/recomendacoes-preferencias/', { timeout: 12000 })).data;
}
