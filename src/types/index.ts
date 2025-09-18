export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export enum AuthMethod {
  PLAIN = 'PLAIN',
  LOGIN = 'LOGIN',
  OAUTH2 = 'OAUTH2',
}

export interface EmailAccount {
  _id: string;
  userId: string;
  name: string;
  email: string;
  imapHost: string;
  imapPort: number;
  useSSL: boolean;
  authMethod: AuthMethod;
  username: string;
  isActive: boolean;
  isConnected: boolean;
  lastSync?: Date;
  totalEmails: number;
  syncedEmails: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailAccountData {
  name: string;
  email: string;
  imapHost: string;
  imapPort: number;
  useSSL?: boolean;
  authMethod: AuthMethod;
  username: string;
  password?: string;
  oauth2Token?: string;
}

export interface UpdateEmailAccountData {
  name?: string;
  imapHost?: string;
  imapPort?: number;
  useSSL?: boolean;
  authMethod?: AuthMethod;
  username?: string;
  password?: string;
  oauth2Token?: string;
  isActive?: boolean;
}

export enum EmailFlag {
  SEEN = '\\Seen',
  ANSWERED = '\\Answered',
  FLAGGED = '\\Flagged',
  DELETED = '\\Deleted',
  DRAFT = '\\Draft',
}

export interface Email {
  _id: string;
  accountId: string;
  messageId: string;
  subject: string;
  from: string;
  fromName: string;
  fromEmail: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  date: Date;
  receivedDate: Date;
  timeDelta: number;
  content: string;
  htmlContent?: string;
  textContent?: string;
  flags: EmailFlag[];
  folder: string;
  uid: number;
  size: number;
  sendingDomain?: string;
  espType?: string;
  espName?: string;
  isOpenRelay: boolean;
  hasValidTLS: boolean;
  tlsVersion?: string;
  certificateIssuer?: string;
  certificateSubject?: string;
  certificateValidFrom?: Date;
  certificateValidTo?: Date;
  searchableContent: string;
  createdAt: string;
  updatedAt: string;
}

export enum SyncStatusType {
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface SyncStatus {
  _id: string;
  accountId: string;
  status: SyncStatusType;
  totalEmails: number;
  processedEmails: number;
  newEmails: number;
  updatedEmails: number;
  currentFolder?: string;
  lastProcessedUid?: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  lastActivity?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  accountId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sender?: string;
  domain?: string;
  espType?: string;
  folder?: string;
  hasAttachments?: boolean;
  isRead?: boolean;
  isFlagged?: boolean;
}

export interface SearchResult {
  emails: Email[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: {
    senders: { [key: string]: number };
    domains: { [key: string]: number };
    espTypes: { [key: string]: number };
    folders: { [key: string]: number };
  };
}

export interface AnalyticsOverview {
  totalEmails: number;
  uniqueSenders: number;
  uniqueDomains: number;
  espBreakdown: { [key: string]: number };
  recentEmails: Email[];
  averageTimeDelta: number;
  securityMetrics: {
    totalEmails: number;
    openRelayCount: number;
    tlsValidCount: number;
    certificateExpiringCount: number;
    openRelayPercentage: number;
    tlsValidPercentage: number;
  };
}

export interface SenderAnalytics {
  _id: string;
  count: number;
  lastSeen: Date;
}

export interface DomainAnalytics {
  _id: string;
  count: number;
  lastSeen: Date;
}

export interface ESPAnalytics {
  _id: string;
  count: number;
  type: string;
}

export interface TimeSeriesData {
  date: string;
  count: number;
}

export interface SecurityMetrics {
  totalEmails: number;
  openRelayCount: number;
  tlsValidCount: number;
  certificateExpiringCount: number;
  openRelayPercentage: number;
  tlsValidPercentage: number;
}
