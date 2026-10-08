// Mantenha TRADUCOES igual à de BackEnd/core/services/categorias_google.py
const TRADUCOES = {
  fiction: "Ficção",
  romance: "Romance",
  "juvenile fiction": "Ficção Juvenil",
  "young adult fiction": "Ficção Jovem Adulto",
  fantasy: "Fantasia",
  "science fiction": "Ficção Científica",
  mystery: "Mistério",
  "detective and mystery stories": "Mistério",
  thrillers: "Suspense",
  suspense: "Suspense",
  horror: "Terror",
  "action & adventure": "Ação e Aventura",
  adventure: "Aventura",
  action: "Ação",
  humor: "Humor",
  comedy: "Comédia",
  drama: "Drama",
  poetry: "Poesia",
  classics: "Clássicos",
  "literary collections": "Coletâneas Literárias",
  "literary criticism": "Crítica Literária",
  "comics & graphic novels": "Quadrinhos",
  "biography & autobiography": "Biografia",
  history: "História",
  philosophy: "Filosofia",
  psychology: "Psicologia",
  religion: "Religião",
  "self-help": "Autoajuda",
  "business & economics": "Negócios e Economia",
  "social science": "Ciências Sociais",
  science: "Ciências",
  "technology & engineering": "Tecnologia",
  computers: "Computação",
  cooking: "Culinária",
  travel: "Viagem",
  art: "Arte",
  education: "Educação",
  "health & fitness": "Saúde e Bem-estar",
  "body, mind & spirit": "Corpo, Mente e Espírito",
  "family & relationships": "Família e Relacionamentos",
  "true crime": "Crimes Reais",
  "juvenile nonfiction": "Infantojuvenil",
  "political science": "Política",
  "performing arts": "Artes Cênicas",
  music: "Música",
  nature: "Natureza",
  pets: "Animais de Estimação",
  "sports & recreation": "Esportes",
  "games & activities": "Jogos",
  "language arts & disciplines": "Linguagem e Literatura",
  "foreign language study": "Idiomas",
};

const IGNORAR = new Set(["general", "geral", "other", "outros", ""]);
const MAX_POR_LIVRO = 3;

// "Fiction / Romance / General" -> ["Ficção", "Romance"]
export function normalizarCategoriasGoogle(categorias) {
  const resultado = [];

  for (let item of categorias ?? []) {
    if (item && typeof item === "object") {
      item = item.descricao ?? item.nome ?? "";
    }
    if (typeof item !== "string") continue;

    for (const parte of item.split("/")) {
      const limpa = parte.trim();
      if (IGNORAR.has(limpa.toLowerCase())) continue;

      const nome = (TRADUCOES[limpa.toLowerCase()] ?? limpa).slice(0, 50);
      if (nome && !resultado.some((r) => r.toLowerCase() === nome.toLowerCase())) {
        resultado.push(nome);
      }
    }
  }

  return resultado.slice(0, MAX_POR_LIVRO);
}

// Devolve os nomes das categorias de qualquer formato de livro do app:
// - livro do Google (adapter):          livro.categorias = ["Ficção", ...]
// - livro do backend (RetrieveSerializer): livro.categoria = [{id, descricao}]
// - livro do backend (LivroSerializer):    livro.categoria = [1, 2] -> usa listaCategorias
export function nomesCategoriasDoLivro(livro, listaCategorias = []) {
  if (!livro) return [];

  if (Array.isArray(livro.categorias) && livro.categorias.length) {
    return livro.categorias.filter((c) => typeof c === "string");
  }

  const lista = Array.isArray(livro.categoria) ? livro.categoria : [];

  return lista
    .map((c) => {
      if (c && typeof c === "object") return c.descricao;
      return listaCategorias.find((x) => Number(x.id) === Number(c))?.descricao;
    })
    .filter(Boolean);
}