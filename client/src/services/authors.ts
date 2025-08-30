import type { Author } from '../types';
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

  // Generar colores pasteles consistentes basados en el nombre del autor
  getAuthorColors(name: string): { backgroundColor: string, textColor: string } {
    // Paleta de colores pasteles
    const pastelColors = [
      { bg: 'rgb(254, 202, 202)', text: 'rgb(185, 28, 28)' },   // Rosa pastel / Rojo fuerte
      { bg: 'rgb(191, 219, 254)', text: 'rgb(29, 78, 216)' },   // Azul pastel / Azul fuerte
      { bg: 'rgb(196, 181, 253)', text: 'rgb(109, 40, 217)' },  // Violeta pastel / Violeta fuerte
      { bg: 'rgb(167, 243, 208)', text: 'rgb(5, 150, 105)' },   // Verde pastel / Verde fuerte
      { bg: 'rgb(253, 230, 138)', text: 'rgb(180, 83, 9)' },    // Amarillo pastel / Naranja fuerte
      { bg: 'rgb(252, 231, 243)', text: 'rgb(190, 24, 93)' },   // Rosa claro / Rosa fuerte
      { bg: 'rgb(219, 234, 254)', text: 'rgb(37, 99, 235)' },   // Azul claro / Azul fuerte
      { bg: 'rgb(220, 252, 231)', text: 'rgb(16, 185, 129)' },  // Verde claro / Verde fuerte
      { bg: 'rgb(254, 215, 170)', text: 'rgb(194, 65, 12)' },   // Naranja pastel / Naranja fuerte
      { bg: 'rgb(233, 213, 255)', text: 'rgb(126, 34, 206)' },  // Lila pastel / Púrpura fuerte
      { bg: 'rgb(165, 243, 252)', text: 'rgb(8, 145, 178)' },   // Cian pastel / Cian fuerte
      { bg: 'rgb(254, 240, 138)', text: 'rgb(161, 98, 7)' }     // Amarillo claro / Amarillo fuerte
    ];

    // Generar hash simple del nombre para consistencia
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }

    // Usar valor absoluto y obtener índice dentro del rango de colores
    const colorIndex = Math.abs(hash) % pastelColors.length;
    
    return {
      backgroundColor: pastelColors[colorIndex].bg,
      textColor: pastelColors[colorIndex].text
    };
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