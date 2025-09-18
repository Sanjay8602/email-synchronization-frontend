import api from './api';
import { SearchResult, SearchFilters } from '../types';

export const searchService = {
  async searchEmails(
    query: string,
    filters: SearchFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<SearchResult> {
    const params = {
      q: query,
      page,
      limit,
      ...filters,
    };

    const response = await api.get('/search/emails', { params });
    return response.data;
  },

  async getSuggestions(query: string, limit: number = 10): Promise<{
    senders: string[];
    subjects: string[];
    domains: string[];
  }> {
    const response = await api.get('/search/suggestions', {
      params: { q: query, limit },
    });
    return response.data;
  },

  async getAdvancedFilters(): Promise<{
    dateRanges: { label: string; value: string }[];
    espTypes: string[];
    folders: string[];
  }> {
    const response = await api.get('/search/filters');
    return response.data;
  },

  async getSearchAnalytics(accountId?: string, timeRange?: string): Promise<{
    totalSearches: number;
    popularQueries: { query: string; count: number }[];
    searchTrends: { date: string; searches: number }[];
    averageResultsPerSearch: number;
  }> {
    const response = await api.get('/search/analytics', {
      params: { accountId, timeRange },
    });
    return response.data;
  },
};
