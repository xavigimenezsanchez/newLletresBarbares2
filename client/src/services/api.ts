import { allMockArticles, mockArticles, mockIssue } from '../data/mockData'

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
      console.error('API request failed, falling back to mock data:', error);
      throw error;
    }
  }

  private getMockArticlesBySection(section: string, page: number = 1, limit: number = 15) {
    const sectionArticles = allMockArticles.filter(article => article.section === section)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const articles = sectionArticles.slice(startIndex, endIndex)
    
    return {
      articles,
      pagination: {
        page,
        limit,
        total: sectionArticles.length,
        pages: Math.ceil(sectionArticles.length / limit)
      }
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

  // async getRecentArticles(limit: number = 6) {
  //   return this.request(`/articles/recent?limit=${limit}`);
  // }  
  
  async getRecentArticles() {
    try {
      return await this.request(`/articles/recent`);
    } catch (error) {
      console.warn('Using mock data for recent articles');
      return mockArticles.slice(0, 6);
    }
  }

  async getFeaturedArticle() {
    try {
      return await this.request('/articles/featured');
    } catch (error) {
      console.warn('Using mock data for featured article');
      return mockArticles[0];
    }
  }

  async getArticleBySlug(slug: string) {
    return this.request(`/articles/${slug}`);
  }

  async getArticleBySectionAndUrl(section: string, url: string) {
    try {
      return await this.request(`/articles/${section}/${url}`);
    } catch (error) {
      console.warn('Using mock data for article:', section, url);
      const article = allMockArticles.find(a => a.section === section && a.url === url);
      if (article) {
        return article;
      }
      throw new Error('Article not found');
    }
  }

  async getArticlesBySection(section: string, limit: number = 10) {
    return this.request(`/articles/section/${section}?limit=${limit}`);
  }

  async getArticlesBySectionPaginated(section: string, page: number = 1, limit: number = 15) {
    try {
      return await this.request(`/articles?section=${section}&page=${page}&limit=${limit}`);
    } catch (error) {
      console.warn('Using mock data for section:', section);
      return this.getMockArticlesBySection(section, page, limit);
    }
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
    try {
      return await this.request('/issues/latest');
    } catch (error) {
      console.warn('Using mock data for latest issue');
      return mockIssue;
    }
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