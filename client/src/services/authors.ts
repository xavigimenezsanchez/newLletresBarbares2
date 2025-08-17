import type { Author, AuthorStats } from '../types';
import { sortAuthorsByMultipleCriteria } from '../utils/sorting';

class AuthorsService {
  private baseUrl = '/api/authors';

  // Obtener todos los autores
  async getAuthors(params: {
    page?: number;
    limit?: number;
    specialty?: string;
    search?: string;
    sort?: 'name' | 'articles' | 'recent';
  } = {}) {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });

      const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Si el ordenamiento es por nombre, aplicar ordenamiento alfabético correcto
      if (params.sort === 'name' && data.authors) {
        data.authors = sortAuthorsByMultipleCriteria(data.authors, 'name');
      }

      return data;
    } catch (error) {
      console.error('Error getting authors:', error);
      throw error;
    }
  }

  // Obtener autores más publicados
  async getTopAuthors(limit: number = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/top?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting top authors:', error);
      throw error;
    }
  }

  // Obtener todas las especialidades
  async getSpecialties() {
    try {
      const response = await fetch(`${this.baseUrl}/specialties`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting specialties:', error);
      throw error;
    }
  }

  // Buscar autores
  async searchAuthors(query: string, limit: number = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching authors:', error);
      throw error;
    }
  }

  // Obtener autor específico por slug
  async getAuthor(slug: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${slug}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting author:', error);
      throw error;
    }
  }

  // Obtener artículos del autor
  async getAuthorArticles(slug: string, params: {
    page?: number;
    limit?: number;
    sort?: 'date' | 'title' | 'section';
  } = {}) {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });

      const response = await fetch(`${this.baseUrl}/${slug}/articles?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting author articles:', error);
      throw error;
    }
  }

  // Obtener estadísticas del autor
  async getAuthorStats(slug: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${slug}/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting author stats:', error);
      throw error;
    }
  }

  // Crear autor (solo admin)
  async createAuthor(authorData: Partial<Author>) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authorData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating author:', error);
      throw error;
    }
  }

  // Actualizar autor (solo admin)
  async updateAuthor(slug: string, updateData: Partial<Author>) {
    try {
      const response = await fetch(`${this.baseUrl}/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating author:', error);
      throw error;
    }
  }

  // Desactivar autor (solo admin)
  async deactivateAuthor(slug: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deactivating author:', error);
      throw error;
    }
  }

  // Utilidades
  formatAuthorName(name: string): string {
    return name.trim();
  }

  formatAuthorSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Eliminar guiones del inicio y final
  }

  getAuthorInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatYear(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.getFullYear().toString();
  }
}

export const authorsService = new AuthorsService(); 