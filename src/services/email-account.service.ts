import api from './api';
import { EmailAccount, CreateEmailAccountData, UpdateEmailAccountData } from '../types';

export const emailAccountService = {
  async getEmailAccounts(): Promise<EmailAccount[]> {
    const response = await api.get('/email-accounts');
    return response.data;
  },

  async createEmailAccount(data: CreateEmailAccountData): Promise<EmailAccount> {
    const response = await api.post('/email-accounts', data);
    return response.data;
  },

  async updateEmailAccount(id: string, data: UpdateEmailAccountData): Promise<EmailAccount> {
    const response = await api.put(`/email-accounts/${id}`, data);
    return response.data;
  },

  async deleteEmailAccount(id: string): Promise<void> {
    await api.delete(`/email-accounts/${id}`);
  },

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/email-accounts/${id}/test-connection`);
    return response.data;
  },
};
