import { GENERAL_RECOMMENDATIONS } from './generalRecommendations.js';

export const READING_CATEGORIES = [
  ['fantasy', 'Fantasia', '✧', 'Mundos que vão além do possível'],
  ['romance', 'Romance', '♡', 'Histórias para sentir'],
  ['science fiction', 'Ficção científica', '☄', 'Outros futuros e universos'],
  ['mystery', 'Mistério', '⌕', 'Pistas, segredos e descobertas'],
  ['thrillers', 'Suspense', '◈', 'Só mais um capítulo'],
  ['horror', 'Terror', '☾', 'Um arrepio a cada página'],
  ['classics', 'Clássicos', '❦', 'Histórias que atravessam o tempo'],
  ['action & adventure', 'Aventura', '↟', 'Jornadas inesquecíveis'],
  ['young adult fiction', 'Jovem adulto', '☆', 'Descobertas e novos começos'],
  ['poetry', 'Poesia', '〰', 'Palavras que ficam'],
  ['history', 'História', '⌛', 'Um olhar para o passado'],
  ['biography & autobiography', 'Biografias', '❞', 'Vidas que inspiram'],
  ['philosophy', 'Filosofia', '∞', 'Grandes perguntas'],
  ['science', 'Ciências', '☉', 'Curiosidade sem limites'],
  ['self-help', 'Desenvolvimento pessoal', '❀', 'Novas formas de crescer'],
  ['comics & graphic novels', 'Quadrinhos', '▧', 'Histórias em cada traço'],
  ['humor', 'Humor', '☺', 'Uma leitura para sorrir'],
  ['short stories', 'Contos', '☷', 'Pequenas grandes histórias'],
].map(([value, label, icon, description]) => ({ value, label, icon, description }));

const GENRES = {
  fantasy: [1, 3, 6, 18, 19, 49, 51, 52, 53, 69, 73, 74, 75, 76, 77, 78, 79, 80, 81, 86, 88],
  romance: [11, 17, 33, 46, 47, 54, 59, 65],
  'science fiction': [2, 8, 22, 49, 50, 51, 63, 64, 112],
  mystery: [43, 56, 57, 58],
  thrillers: [43, 56, 58, 64],
  horror: [21, 43, 44, 45],
  classics: [0, 4, 5, 7, 8, 10, 11, 12, 14, 21, 25, 26, 27, 28, 29, 30, 31, 42, 43, 44, 45, 46, 47, 66, 67],
  'action & adventure': [6, 18, 19, 52, 53, 67, 68, 116, 117, 118],
  'young adult fiction': [1, 3, 15, 19, 52, 53, 54, 55, 73, 74, 75, 76, 77, 78],
  poetry: [89, 103, 104, 105, 106],
  history: [60, 89],
  'biography & autobiography': [13, 16, 48, 94],
  philosophy: [62, 87, 110, 111],
  science: [60, 61],
  'self-help': [9, 63, 87],
  'comics & graphic novels': [72],
  humor: [30, 51, 72],
  'short stories': [30, 35, 36, 39, 84, 85, 95, 96],
};
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const identity = ([title, author]) => `${normalize(title)}|${normalize(author)}`;

export function hasReadingPreferences(user) {
  const p = user?.reading_preferences;
  return user?.reading_preferences_status === 'completed'
    && !!(p?.categories?.length || p?.authors?.length || p?.books?.length);
}

export function needsReadingPreferences(user) {
  return !!user && (!user.reading_preferences_status || user.reading_preferences_status === 'pending');
}

export function preferencesCacheKey(user) {
  const raw = JSON.stringify([user?.reading_preferences_status, user?.reading_preferences]);
  let hash = 0;
  for (const char of raw) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  return `${user?.id || 'general'}:${hash >>> 0}`;
}

export function buildRecommendationCatalog(user, discovered = []) {
  if (!hasReadingPreferences(user)) return [...GENERAL_RECOMMENDATIONS];
  const p = { categories: [], authors: [], books: [], ...user.reading_preferences };
  const authors = [...p.authors, ...p.books.flatMap(book => book.authors)].map(normalize);
  const favoriteTitles = new Set(p.books.map(book => normalize(book.title)));
  const preferredIndices = new Set(p.categories.flatMap(category => GENRES[category] || []));
  const score = ([title, author]) => (authors.some(name => name && (normalize(author).includes(name) || name.includes(normalize(author)))) ? 100 : 0)
    + (favoriteTitles.has(normalize(title)) ? 120 : 0)
    + (preferredIndices.has(GENERAL_RECOMMENDATIONS.findIndex(entry => identity(entry) === identity([title, author]))) ? 30 : 0);
  const validDiscovered = discovered.filter(entry => Array.isArray(entry) && entry.length === 2
    && entry.every(value => typeof value === 'string' && value.trim()) && entry[0].length <= 260 && entry[1].length <= 150);
  const favorites = p.books.filter(book => book.authors?.length).map(book => [book.title, book.authors[0]]);
  const unique = [...new Map([...favorites, ...validDiscovered, ...GENERAL_RECOMMENDATIONS].map(entry => [identity(entry), entry])).values()];
  const preferred = unique.filter(entry => score(entry) > 0 || validDiscovered.some(item => identity(item) === identity(entry)))
    .sort((a, b) => score(b) - score(a));
  const rest = unique.filter(entry => !preferred.includes(entry));
  const mixed = [];
  while (preferred.length || rest.length) {
    mixed.push(...preferred.splice(0, 3), ...rest.splice(0, 1));
  }
  return mixed.slice(0, 200);
}

export const AUTHOR_SUGGESTIONS = [...new Set(GENERAL_RECOMMENDATIONS.map(([, author]) => author))];
export const BOOK_SUGGESTIONS = GENERAL_RECOMMENDATIONS.slice(0, 30).map(([title, author]) => ({ title, authors: [author], source: 'google' }));
export const preferenceBookKey = book => `${normalize(book.title)}|${normalize(book.authors.join(' '))}`;
