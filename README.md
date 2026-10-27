# ReadMore_Front

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Perfis e favoritos

O menu **Leitores** abre a busca por nome ou email. Fotos e nomes de anunciantes no marketplace levam ao perfil público (`/usuarios/:id`), com avaliação de 1 a 5 estrelas, biografia, contato, estante e anúncios. A edição pessoal continua em `/profile`.

As páginas dos livros, no desktop e no celular, salvam avaliações e favoritos no backend. O coração fica vermelho quando salvo. A seção **Livros favoritados** no perfil pessoal permite abrir livros e remover favoritos; o link **Ver meu perfil público e avaliações** mostra as avaliações recebidas. Favoritar livros Google não altera o status de leitura.

Esses recursos dependem das migrações `0021` e `0022` do backend. Validação do front: `npm run build`.

### Imagens no localhost

Configure `VITE_API_BASE_URL=http://127.0.0.1:8000/api` e, opcionalmente, `VITE_BACKEND_URL=http://127.0.0.1:8000/`. A resolução das imagens fica em `src/utils/images.js`: mídia usa a origem do backend, sem acrescentar `/api`, e previews `blob:` continuam locais. `AppImage.vue` trata falhas de carregamento sem repetir a mesma URL indefinidamente.

Capas ausentes tentam a capa pelo ISBN no Open Library antes da imagem padrão; avatares tentam a foto Google antes do avatar padrão. Essas alternativas externas precisam de internet e disponibilidade no serviço. Para restaurar exatamente os uploads antigos, os arquivos devem existir em `BackEnd/media/` ou no storage remoto usado pela instalação; copiar somente o banco não copia as imagens.

Testes de URLs e alternativas: `node tests/images.test.js`.

### Busca do Explore

A busca combina consulta geral (incluindo autores) e consulta por título, reconhece ISBNs com prefixo/hífens e não restringe o idioma sem seleção explícita. Livros sem capa permanecem nos resultados. Seleções dentro de idioma ou categoria são alternativas; os dois grupos são combinados. Categorias podem ser consultadas sem termo; para usar apenas idioma, informe também um termo. Relevância prioriza correspondências com o título; **Mais recentes** usa a data de publicação. **Carregar mais livros** consulta novas páginas do catálogo.

Requisições antigas são canceladas, resultados repetidos são removidos e consultas são mantidas em cache por 5 minutos. O Explore tem resultados próprios, sem misturar as recomendações da Home. Falhas de rede, acesso ou limite da API aparecem como erro, separados de uma pesquisa sem resultados. A disponibilidade de títulos e os metadados de filtros dependem do Google Books.

Validação: `node tests/bookSearch.test.js` e `node --experimental-loader ./tests/alias-loader.mjs tests/googleBooks.test.js`. Os testes do serviço usam respostas simuladas para verificar requisições, filtros, paginação, cache, falhas e concorrência. Parâmetros consultados na documentação oficial: https://developers.google.com/books/docs/v1/using.


As estrelas dos cards exibem exclusivamente avaliações do ReadMore, consultadas em lote por ID Google, ISBN ou ID local. Livros sem votos mostram **Sem avaliações**; falhas de consulta mostram **Notas indisponíveis**. As notas locais são revalidadas mesmo quando o catálogo externo vem do cache. A popularidade do Google é mantida separadamente e auxilia somente a ordem dos resultados de busca; ela não é apresentada como nota da comunidade. Uma nova expressão de busca volta à relevância, enquanto **Mais recentes** pode ser escolhido explicitamente para a pesquisa atual.

Testes adicionais de médias nos cards: `node tests/bookRatings.test.js`.

A pesquisa automática aguarda 650 ms após a última alteração. Digitação, Enter e botão Buscar passam pelo mesmo fluxo; Enter reaproveita a consulta idêntica em andamento e, em uma nova tentativa, ignora o cache. O estado de preparação não é mostrado como pesquisa vazia. Respostas vazias não são cacheadas e títulos sem resultados recebem uma tentativa adicional com as palavras significativas do título, preservando os filtros. Falhas parciais sem nenhum resultado são mostradas como erro. Consultar as avaliações do ReadMore acontece em segundo plano, com timeout, sem bloquear o catálogo.

Os testes da busca incluem a barra Vue real em um renderer em memória, com eventos de digitação e envio do formulário, além de cenários de resposta vazia, falha parcial e fallback para **Diário de um Banana**. Os resultados da API nesses testes são simulados.


O Explore oferece 40 filtros de categoria, com busca dentro da lista. O dicionário de categorias do Google Books contém 258 traduções sincronizadas entre `FrontEnd/src/utils/categoriasLivro.js` e `BackEnd/core/services/categorias_google.py`. A normalização preserva até 8 categorias por livro, traduz subgêneros, remove níveis genéricos e mantém nomes ainda não traduzidos. Os filtros comparam segmentos completos para distinguir, por exemplo, ciências de ficção científica e ficção de não ficção.
Teste de traduções, consistência com o backend e cobertura dos 40 filtros: `node tests/categories.test.js`.


O cadastro manual (`/manual`) valida título e autores, limites do backend, ISBN com dígito verificador, páginas inteiras positivas e datas. Capa opcional JPG/PNG de até 5 MB; prévias são liberadas ao trocar a imagem ou sair da tela. Não há nota manual. Os erros da API aparecem no formulário e o sucesso só é mostrado depois da criação do livro e vínculo com a estante. O front usa `POST /livros/cadastrar-manual/`, portanto publique também a versão correspondente do backend.

Botões, cards e páginas têm transições discretas, desativadas por `prefers-reduced-motion`. Na estante, arraste pela capa ou pelo ícone; no celular, toque e segure. O livro balança durante o arraste, a lista de destino recebe destaque e uma falha de persistência restaura o status anterior. Categorias, editoras e estante carregam todas as páginas da API.

Testes do formulário e persistência: `node tests/manualBook.test.js` e `node --experimental-loader ./tests/alias-loader.mjs tests/shelfStore.test.js`.
