import type { Article, Issue } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Artículos
  async getArticles(params?: {
    page?: number;
    limit?: number;
    section?: string;
    author?: string; // Mantener por compatibilidad
    authors?: string[]; // Nuevo parámetro para múltiples autores
    year?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.section) searchParams.append('section', params.section);
    if (params?.author) searchParams.append('author', params.author);
    if (params?.authors && params.authors.length > 0) {
      params.authors.forEach(author => searchParams.append('authors', author));
    }
    if (params?.year) searchParams.append('year', params.year.toString());

    return this.request(`/articles?${searchParams.toString()}`);
  }

  async getRecentArticles(): Promise<Article[]> {
    return await this.request(`/articles/recent`);
  }

  async getFeaturedArticle() {
    return await this.request('/articles/featured');
  }

  async getArticleBySlug(slug: string) {
    return this.request(`/articles/${slug}`);
  }

  async getArticleBySectionAndUrl(section: string, url: string) {
    return await this.request(`/articles/${section}/${url}`);
  }

  async getArticlesBySection(section: string, limit: number = 10) {
    return this.request(`/articles/section/${section}?limit=${limit}`);
  }

  async getArticlesBySectionPaginated(section: string, page: number = 1, limit: number = 15) {
    return await this.request(`/articles?section=${section}&page=${page}&limit=${limit}`);
  }

  // Actualizado para manejar múltiples autores
  async getArticlesByAuthor(author: string, limit: number = 10) {
    return this.request(`/articles/author/${encodeURIComponent(author)}?limit=${limit}`);
  }

  // Nuevo método para buscar por múltiples autores
  async getArticlesByAuthors(authors: string[], limit: number = 10) {
    const searchParams = new URLSearchParams();
    authors.forEach(author => searchParams.append('authors', author));
    if (limit) searchParams.append('limit', limit.toString());
    
    return this.request(`/articles/authors?${searchParams.toString()}`);
  }

  // Números de revista
  async getIssues(params?: {
    page?: number;
    limit?: number;
    year?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.year) searchParams.append('year', params.year.toString());

    return this.request(`/issues?${searchParams.toString()}`);
  }

  async getLatestIssue(): Promise<{issue: Issue, articles: Article[]}> {
    return await this.request('/issues/latest');
  }

  async getIssueDataByNumber(number: number): Promise<{issue: Issue, articles: Article[]}> {
    return await this.request(`/issues/numberdata/${number}`);
  }

  async getIssueByYearAndNumber(year: number, number: number) {
    return this.request(`/issues/${year}/${number}`);
  }

  async getYears() {
    return this.request('/issues/years');
  }

  async getIssuesByYear(year: number) {
    return this.request(`/issues/year/${year}`);
  }

  async getIssueByNumber(number: number) {
    return this.request(`/issues/number/${number}`);
  }

  async getArticlesByIssueNumber(number: number) {
    return this.request(`/articles?issue=${number}`);
  }

  // Búsqueda - Actualizado para múltiples autores
  async searchArticles(params: {
    q?: string;
    section?: string;
    author?: string; // Mantener por compatibilidad
    authors?: string[]; // Nuevo parámetro
    year?: number;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'authors' && Array.isArray(value)) {
          value.forEach(author => searchParams.append('authors', author));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return this.request(`/search?${searchParams.toString()}`);
  }

  async getAuthors() {
    return this.request('/search/authors');
  }

  async getSectionStats() {
    return this.request('/search/sections');
  }

  async getStats() {
    return this.request('/search/stats');
  }

  // Search methods - Actualizado para múltiples autores
  async search(params: {
    q?: string;
    section?: string;
    author?: string; // Mantener por compatibilidad
    authors?: string[]; // Nuevo parámetro
    year?: number;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params.q) searchParams.append('q', params.q);
    if (params.section) searchParams.append('section', params.section);
    if (params.author) searchParams.append('author', params.author);
    if (params.authors && params.authors.length > 0) {
      params.authors.forEach(author => searchParams.append('authors', author));
    }
    if (params.year) searchParams.append('year', params.year.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    return this.request(`/search?${searchParams.toString()}`);
  }

  async searchText(query: string, page: number = 1, limit: number = 10) {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
    });
    
    return this.request(`/search/text?${params.toString()}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService(); 