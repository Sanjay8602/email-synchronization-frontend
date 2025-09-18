import api from './api';

export interface SyncStatus {
  accountId: string;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ERROR';
  totalEmails: number;
  processedEmails: number;
  newEmails: number;
  updatedEmails: number;
  currentFolder?: string;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  lastActivity?: Date;
}

export const syncService = {
  async startSync(accountId: string): Promise<{ message: string }> {
    const response = await api.post(`/sync/start/${accountId}`, {}, {
      timeout: 60000, // 60 seconds timeout for sync start
    });
    return response.data;
  },

  async pauseSync(accountId: string): Promise<{ message: string }> {
    const response = await api.post(`/sync/pause/${accountId}`, {}, {
      timeout: 10000, // 10 seconds timeout for pause
    });
    return response.data;
  },

  async resumeSync(accountId: string): Promise<{ message: string }> {
    const response = await api.post(`/sync/resume/${accountId}`, {}, {
      timeout: 10000, // 10 seconds timeout for resume
    });
    return response.data;
  },

  async getSyncStatus(accountId: string): Promise<SyncStatus> {
    const response = await api.get(`/sync/status/${accountId}`, {
      timeout: 15000, // 15 seconds timeout for status check
    });
    return response.data;
  },

  async testConnection(accountId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.get(`/sync/test/${accountId}`, {
      timeout: 30000, // 30 seconds timeout for connection test
    });
    return response.data;
  },

  async testEmails(accountId: string): Promise<{ success: boolean; message: string; count?: number }> {
    const response = await api.get(`/sync/test-emails/${accountId}`, {
      timeout: 30000, // 30 seconds timeout for email test
    });
    return response.data;
  },
};