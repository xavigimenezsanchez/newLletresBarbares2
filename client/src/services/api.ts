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
    author?: string;
    year?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.section) searchParams.append('section', params.section);
    if (params?.author) searchParams.append('author', params.author);
    if (params?.year) searchParams.append('year', params.year.toString());

    return this.request(`/articles?${searchParams.toString()}`);
  }

  async getRecentArticles(limit: number = 6) {
    return this.request(`/articles/recent?limit=${limit}`);
  }

  async getFeaturedArticle() {
    return this.request('/articles/featured');
  }

  async getArticleBySlug(slug: string) {
    return this.request(`/articles/${slug}`);
  }

  async getArticlesBySection(section: string, limit: number = 10) {
    return this.request(`/articles/section/${section}?limit=${limit}`);
  }

  async getArticlesByAuthor(author: string, limit: number = 10) {
    return this.request(`/articles/author/${encodeURIComponent(author)}?limit=${limit}`);
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

  async getLatestIssue() {
    return this.request('/issues/latest');
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

  // Búsqueda
  async searchArticles(params: {
    q?: string;
    section?: string;
    author?: string;
    year?: number;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });

    return this.request(`/search?${searchParams.toString()}`);
  }

  async searchText(query: string, page: number = 1, limit: number = 10) {
    return this.request(`/search/text?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
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

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService(); 