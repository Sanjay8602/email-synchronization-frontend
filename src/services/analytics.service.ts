import api from './api';
import { 
  AnalyticsOverview, 
  SenderAnalytics, 
  DomainAnalytics, 
  ESPAnalytics, 
  TimeSeriesData, 
  SecurityMetrics 
} from '../types';

export const analyticsService = {
  async getOverview(params?: {
    accountId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AnalyticsOverview> {
    const response = await api.get('/analytics/overview', { params });
    return response.data;
  },

  async getSenders(params?: {
    accountId?: string;
    limit?: number;
  }): Promise<SenderAnalytics[]> {
    const response = await api.get('/analytics/senders', { params });
    return response.data;
  },

  async getDomains(params?: {
    accountId?: string;
    limit?: number;
  }): Promise<DomainAnalytics[]> {
    const response = await api.get('/analytics/domains', { params });
    return response.data;
  },

  async getESP(params?: {
    accountId?: string;
    limit?: number;
  }): Promise<ESPAnalytics[]> {
    const response = await api.get('/analytics/esp', { params });
    return response.data;
  },

  async getTimeSeries(params?: {
    accountId?: string;
    days?: number;
  }): Promise<TimeSeriesData[]> {
    const response = await api.get('/analytics/time-series', { params });
    return response.data;
  },

  async getSecurityMetrics(params?: {
    accountId?: string;
  }): Promise<SecurityMetrics> {
    const response = await api.get('/analytics/security', { params });
    return response.data;
  },
};
