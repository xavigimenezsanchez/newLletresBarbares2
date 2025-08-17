import React from 'react'
import type { Article } from '../types'

interface AuthorDisplayProps {
  article: Article
  showPrefix?: boolean
  className?: string
}

const AuthorDisplay: React.FC<AuthorDisplayProps> = ({ 
  article, 
  showPrefix = true, 
  className = "text-sm text-gray-600" 
}) => {
  // Función para obtener los autores a mostrar
  const getAuthorsToDisplay = () => {
    // Priorizar el nuevo campo authors, pero mantener compatibilidad con author
    if (article.authors && article.authors.length > 0) {
      return article.authors;
    }
    // Fallback al campo author si authors no existe
    if (article.author) {
      return [article.author];
    }
    return [];
  }

  // Función para formatear la lista de autores
  const formatAuthors = (authors: string[]) => {
    if (authors.length === 0) return 'Autor desconegut';
    if (authors.length === 1) {
      return showPrefix ? `Per ${authors[0]}` : authors[0];
    }
    if (authors.length === 2) {
      return showPrefix 
        ? `Per ${authors[0]} i ${authors[1]}`
        : `${authors[0]} i ${authors[1]}`;
    }
    
    // Para 3 o más autores: "Per Autor1, Autor2 i Autor3"
    const lastAuthor = authors[authors.length - 1];
    const otherAuthors = authors.slice(0, -1);
    const formatted = `${otherAuthors.join(', ')} i ${lastAuthor}`;
    return showPrefix ? `Per ${formatted}` : formatted;
  }

  const authors = getAuthorsToDisplay();

  return (
    <span className={className}>
      {formatAuthors(authors)}
    </span>
  );
};

export default AuthorDisplay; 