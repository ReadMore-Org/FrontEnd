export function recommendationErrorMessage(error, { more = false, partial = false } = {}) {
  const status = error?.response?.status;
  let guidance;
  if (globalThis.navigator?.onLine === false || error?.code === 'ERR_NETWORK') {
    guidance = 'Confira sua conexão com a internet e tente novamente.';
  } else if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    guidance = 'A busca demorou mais que o esperado. Tente novamente em instantes.';
  } else if (status === 429) {
    guidance = 'Recebemos muitas buscas ao mesmo tempo. Aguarde um minuto e tente novamente.';
  } else if (status === 403) {
    guidance = 'O serviço de livros não permitiu a consulta agora. Tente novamente mais tarde.';
  } else if (status >= 500) {
    guidance = 'O serviço de livros está temporariamente indisponível. Aguarde um minuto e tente novamente.';
  } else {
    guidance = 'Não conseguimos concluir a busca agora. Tente novamente em instantes.';
  }
  const introduction = partial ? 'Você pode continuar explorando os livros que já carregaram.'
    : more ? 'Não foi possível carregar mais recomendações. Os livros já exibidos continuam disponíveis.'
      : 'Não foi possível carregar as recomendações.';
  return `${introduction} ${guidance}`;
}
