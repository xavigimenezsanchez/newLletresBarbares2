/**
 * Utilidades para ordenamiento alfabético con soporte para acentos catalanes
 */

// Función para normalizar caracteres acentuados para ordenamiento
export function normalizeForSorting(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Descomponer caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    .replace(/[àáâäãå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôöõ]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[·]/g, ''); // Eliminar punto medio catalán
}

// Función para ordenar alfabéticamente con soporte para acentos
export function sortAlphabetically<T>(items: T[], getText: (item: T) => string): T[] {
  return [...items].sort((a, b) => {
    const textA = normalizeForSorting(getText(a));
    const textB = normalizeForSorting(getText(b));
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });
}

// Función específica para ordenar autores
export function sortAuthorsAlphabetically<T extends { name: string }>(authors: T[]): T[] {
  return sortAlphabetically(authors, author => author.name);
}

// Función para ordenar por múltiples criterios
export function sortByMultipleCriteria<T>(
  items: T[],
  criteria: Array<{
    getter: (item: T) => any;
    direction: 'asc' | 'desc';
    normalize?: boolean;
  }>
): T[] {
  return [...items].sort((a, b) => {
    for (const { getter, direction, normalize } of criteria) {
      let valueA = getter(a);
      let valueB = getter(b);
      
      // Normalizar si es string y se requiere
      if (normalize && typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = normalizeForSorting(valueA);
        valueB = normalizeForSorting(valueB);
      }
      
      if (valueA < valueB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });
}

// Función para ordenar autores por múltiples criterios
export function sortAuthorsByMultipleCriteria<T extends { name: string; stats?: { totalArticles?: number } }>(
  authors: T[],
  primarySort: 'name' | 'articles' | 'recent' = 'name'
): T[] {
  switch (primarySort) {
    case 'name':
      return sortAuthorsAlphabetically(authors);
    
    case 'articles':
      return sortByMultipleCriteria(authors, [
        { getter: author => author.stats?.totalArticles || 0, direction: 'desc' },
        { getter: author => author.name, direction: 'asc', normalize: true }
      ]);
    
    case 'recent':
      // Para ordenamiento por fecha reciente, necesitarías un campo de fecha
      // Por ahora, ordenar por nombre como fallback
      return sortAuthorsAlphabetically(authors);
    
    default:
      return sortAuthorsAlphabetically(authors);
  }
} 