import { apiService } from './api';

export interface SearchAnalyticsData {
  query: string;
  searchType?: 'live_search' | 'full_search' | 'section_filter' | 'author_filter';
  filters?: {
    section?: string;
    author?: string;
    year?: number;
  };
  results?: {
    total: number;
    returned: number;
  };
  userBehavior?: {
    clickedResult?: boolean;
    clickedResultIndex?: number;
    timeToClick?: number;
    scrolledResults?: boolean;
    searchRefined?: boolean;
    originalQuery?: string;
  };
  context?: {
    page?: string;
    referrer?: string;
  };
}

export interface AnalyticsStats {
  period: string;
  general: {
    totalSearches: number;
    uniqueQueries: number;
    avgResponseTime: number;
    totalClicks: number;
    avgResults: number;
    clickThroughRate: number;
  };
  topQueries: Array<{
    query: string;
    count: number;
    avgResults: number;
    clickThroughRate: number;
    lastSearched: string;
  }>;
  sectionStats: Array<{
    section: string;
    searches: number;
    avgResults: number;
    clickThroughRate: number;
  }>;
  deviceStats: Array<{
    deviceType: string;
    searches: number;
    avgResponseTime: number;
    clickThroughRate: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    searches: number;
    avgResults: number;
  }>;
}

class AnalyticsService {
  private baseUrl = '/api/analytics';

  // Registrar una búsqueda
  async trackSearch(data: SearchAnalyticsData): Promise<{ success: boolean; analyticsId: string; responseTime: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking search:', error);
      // No lanzar error para no interrumpir la experiencia del usuario
      return { success: false, analyticsId: '', responseTime: 0 };
    }
  }

  // Registrar click en resultado
  async trackClick(analyticsId: string, data: {
    clickedResultIndex?: number;
    timeToClick?: number;
    scrolledResults?: boolean;
  }): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/search/${analyticsId}/click`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking click:', error);
      return { success: false };
    }
  }

  // Obtener estadísticas generales
  async getStats(days: number = 30): Promise<AnalyticsStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats?days=${days}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting analytics stats:', error);
      throw error;
    }
  }

  // Obtener top queries
  async getTopQueries(days: number = 30, limit: number = 20): Promise<{
    period: string;
    queries: Array<{
      query: string;
      count: number;
      avgResults: number;
      clickThroughRate: number;
      lastSearched: string;
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/queries?days=${days}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting top queries:', error);
      throw error;
    }
  }

  // Obtener estadísticas por sección
  async getSectionStats(days: number = 30): Promise<{
    period: string;
    sections: Array<{
      section: string;
      searches: number;
      avgResults: number;
      clickThroughRate: number;
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/sections?days=${days}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting section stats:', error);
      throw error;
    }
  }

  // Obtener estadísticas por dispositivo
  async getDeviceStats(days: number = 30): Promise<{
    period: string;
    devices: Array<{
      deviceType: string;
      searches: number;
      avgResponseTime: number;
      clickThroughRate: number;
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/devices?days=${days}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting device stats:', error);
      throw error;
    }
  }

  // Obtener timeline de búsquedas
  async getTimeline(days: number = 30, groupBy: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<{
    period: string;
    groupBy: string;
    timeline: Array<{
      period: string;
      searches: number;
      uniqueUsers: number;
      avgResults: number;
      clickThroughRate: number;
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/timeline?days=${days}&groupBy=${groupBy}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting timeline:', error);
      throw error;
    }
  }

  // Exportar datos
  async exportData(startDate: string, endDate: string, format: 'json' | 'csv' = 'json'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startDate, endDate, format }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (format === 'csv') {
        return response.blob();
      }

      return await response.json();
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Limpiar datos antiguos
  async cleanupOldData(daysToKeep: number = 90): Promise<{ success: boolean; deletedCount: number; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/cleanup?daysToKeep=${daysToKeep}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      throw error;
    }
  }

  // Utilidades para tracking
  getCurrentPage(): string {
    return window.location.pathname;
  }

  getReferrer(): string {
    return document.referrer || '';
  }

  detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|android|iphone|ipod|blackberry|opera mini|windows phone/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  // Crear datos de analytics para una búsqueda
  createSearchData(
    query: string,
    searchType: SearchAnalyticsData['searchType'] = 'live_search',
    filters?: SearchAnalyticsData['filters'],
    results?: SearchAnalyticsData['results']
  ): SearchAnalyticsData {
    return {
      query,
      searchType,
      filters,
      results,
      context: {
        page: this.getCurrentPage(),
        referrer: this.getReferrer(),
      },
    };
  }
}

export const analyticsService = new AnalyticsService(); 