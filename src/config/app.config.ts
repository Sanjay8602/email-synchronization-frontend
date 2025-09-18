/**
 * Application configuration utility
 * Centralizes all environment variable usage with fallbacks
 */

export const appConfig = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  },

  // Application Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Lucid Growth Email Manager',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Advanced Email Management System',
  },

  // Authentication Configuration
  auth: {
    tokenKey: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'accessToken',
    refreshTokenKey: process.env.NEXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY || 'refreshToken',
    redirectUrl: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || '/login',
  },

  // UI Configuration
  ui: {
    defaultPageSize: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '20'),
    maxPageSize: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE || '100'),
    searchDebounceMs: parseInt(process.env.NEXT_PUBLIC_SEARCH_DEBOUNCE_MS || '300'),
    toastDuration: parseInt(process.env.NEXT_PUBLIC_TOAST_DURATION || '5000'),
  },

  // Email Configuration
  email: {
    previewLength: parseInt(process.env.NEXT_PUBLIC_EMAIL_PREVIEW_LENGTH || '200'),
    attachmentMaxSize: parseInt(process.env.NEXT_PUBLIC_EMAIL_ATTACHMENT_MAX_SIZE || '10485760'),
    syncInterval: parseInt(process.env.NEXT_PUBLIC_EMAIL_SYNC_INTERVAL || '300000'),
  },

  // Search Configuration
  search: {
    defaultLimit: parseInt(process.env.NEXT_PUBLIC_SEARCH_DEFAULT_LIMIT || '10'),
    maxResults: parseInt(process.env.NEXT_PUBLIC_SEARCH_MAX_RESULTS || '1000'),
    highlightLength: parseInt(process.env.NEXT_PUBLIC_SEARCH_HIGHLIGHT_LENGTH || '100'),
  },

  // Analytics Configuration
  analytics: {
    enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
    retentionDays: parseInt(process.env.NEXT_PUBLIC_ANALYTICS_RETENTION_DAYS || '365'),
  },

  // Feature Flags
  features: {
    emailSync: process.env.NEXT_PUBLIC_FEATURE_EMAIL_SYNC === 'true',
    analytics: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true',
    search: process.env.NEXT_PUBLIC_FEATURE_SEARCH === 'true',
    accountManagement: process.env.NEXT_PUBLIC_FEATURE_ACCOUNT_MANAGEMENT === 'true',
  },

  // Development Configuration
  development: {
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
  },
} as const;

export type AppConfig = typeof appConfig;
