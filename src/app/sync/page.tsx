'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { EmailAccount } from '../../types';
import { emailAccountService } from '../../services/email-account.service';
import { syncService } from '../../services/sync.service';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { ToastContainer, ToastProps } from '../../components/Toast';

interface SyncStatus {
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

export default function SyncPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [syncStatuses, setSyncStatuses] = useState<Map<string, SyncStatus>>(new Map());
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // Toast helper functions
  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast,
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchAccounts();
      
      // Auto-refresh every 5 seconds to keep UI updated
      const interval = setInterval(() => {
        fetchAccounts();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Auto-refresh sync status every 1 second when sync is running
  useEffect(() => {
    const interval = setInterval(() => {
      const hasRunningSync = Array.from(syncStatuses.values()).some(status => status.status === 'RUNNING');
      if (hasRunningSync) {
        console.log('Auto-refreshing sync status...');
        fetchAccounts();
      }
    }, 1000); // Increased frequency to 1 second

    return () => clearInterval(interval);
  }, [syncStatuses]);

  const fetchAccounts = async () => {
    try {
      const data = await emailAccountService.getEmailAccounts();
      setAccounts(data);
      
      // Fetch sync status for each account
      const statusPromises = data.map(async (account) => {
        try {
          console.log(`Fetching sync status for account: ${account._id}`);
          const status = await syncService.getSyncStatus(account._id);
          console.log(`Sync status for account ${account._id}:`, status);
          return { accountId: account._id, status };
        } catch (error) {
          console.error(`Failed to fetch sync status for account ${account._id}:`, error);
          return { accountId: account._id, status: null };
        }
      });
      
      const statuses = await Promise.all(statusPromises);
      const statusMap = new Map<string, SyncStatus>();
      
      statuses.forEach(({ accountId, status }) => {
        if (status) {
          statusMap.set(accountId, status);
          console.log(`Setting sync status for ${accountId}:`, status);
        }
      });
      
      setSyncStatuses(statusMap);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleStartSync = async (accountId: string) => {
    try {
      // Start sync in background - don't wait for completion
      syncService.startSync(accountId).catch(error => {
        console.error('Background sync error:', error);
        addToast({
          type: 'error',
          title: 'Sync Failed',
          message: `Failed to start sync: ${error.message}`,
        });
      });
      
      // Show immediate feedback
      addToast({
        type: 'success',
        title: 'Sync Started',
        message: 'Email sync has started. Check progress below.',
      });
      
      // Refresh data after a short delay
      setTimeout(() => {
        fetchAccounts();
      }, 1000);
    } catch (error) {
      console.error('Failed to start sync:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to start sync: ${errorMessage}`);
    }
  };

  const handlePauseSync = async (accountId: string) => {
    try {
      // Pause sync in background
      syncService.pauseSync(accountId).catch(error => {
        console.error('Background pause error:', error);
        addToast({
          type: 'error',
          title: 'Pause Failed',
          message: `Failed to pause sync: ${error.message}`,
        });
      });
      
      // Show immediate feedback
      addToast({
        type: 'info',
        title: 'Sync Paused',
        message: 'Email sync has been paused.',
      });
      
      // Refresh data after a short delay
      setTimeout(() => {
        fetchAccounts();
      }, 500);
    } catch (error) {
      console.error('Failed to pause sync:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to pause sync: ${errorMessage}`);
    }
  };

  const handleResumeSync = async (accountId: string) => {
    try {
      console.log('Resuming sync for account:', accountId);
      
      // Resume sync in background
      syncService.resumeSync(accountId).catch(error => {
        console.error('Background resume error:', error);
        addToast({
          type: 'error',
          title: 'Resume Failed',
          message: `Failed to resume sync: ${error.message}`,
        });
      });
      
      // Show immediate feedback
      addToast({
        type: 'success',
        title: 'Sync Resumed',
        message: 'Email sync has been resumed. Check progress below.',
      });
      
      // Refresh data after a short delay
      setTimeout(() => {
        fetchAccounts();
      }, 1000);
    } catch (error) {
      console.error('Failed to resume sync:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to resume sync: ${errorMessage}`);
    }
  };

  const handleRefresh = async () => {
    console.log('Manual refresh triggered');
    console.log('Current sync statuses:', syncStatuses);
    
    // Show immediate feedback
    addToast({
      type: 'info',
      title: 'Refreshing',
      message: 'Refreshing data...',
    });
    
    // Refresh in background
    fetchAccounts().catch(error => {
      console.error('Refresh error:', error);
      addToast({
        type: 'error',
        title: 'Refresh Failed',
        message: 'Failed to refresh data',
      });
    });
  };

  const handleTestAPI = async (accountId: string) => {
    try {
      console.log('Testing API for account:', accountId);
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');
      
      // Show loading feedback
      addToast({
        type: 'info',
        title: 'Testing API',
        message: 'Testing API connection...',
      });
      
      // Test API in background
      syncService.getSyncStatus(accountId)
        .then(data => {
          console.log('API Response:', data);
          addToast({
            type: 'success',
            title: 'API Test Success',
            message: `API Response: ${JSON.stringify(data, null, 2)}`,
          });
        })
        .catch(error => {
          console.error('API Test Error:', error);
          addToast({
            type: 'error',
            title: 'API Test Failed',
            message: `API Test Error: ${error.message}`,
          });
        });
    } catch (error) {
      console.error('API Test Error:', error);
      alert(`API Test Error: ${error}`);
    }
  };

  const handleTestConnection = async (accountId: string) => {
    try {
      console.log('Testing IMAP connection for account:', accountId);
      
      // Show loading feedback
      alert('Testing IMAP connection...');
      
      // Test connection in background
      syncService.testConnection(accountId)
        .then(data => {
          console.log('Connection Test Response:', data);
          alert(`Connection Test: ${JSON.stringify(data, null, 2)}`);
        })
        .catch(error => {
          console.error('Connection Test Error:', error);
          alert(`Connection Test Error: ${error.message}`);
        });
    } catch (error) {
      console.error('Connection Test Error:', error);
      alert(`Connection Test Error: ${error}`);
    }
  };

  const handleTestEmails = async (accountId: string) => {
    try {
      console.log('Testing email count for account:', accountId);
      
      // Show loading feedback
      alert('Testing email count...');
      
      // Test emails in background
      syncService.testEmails(accountId)
        .then(data => {
          console.log('Email Test Response:', data);
          alert(`Email Test: ${JSON.stringify(data, null, 2)}`);
        })
        .catch(error => {
          console.error('Email Test Error:', error);
          alert(`Email Test Error: ${error.message}`);
        });
    } catch (error) {
      console.error('Email Test Error:', error);
      alert(`Email Test Error: ${error}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'PAUSED':
        return <PauseIcon className="h-5 w-5 text-yellow-500" />;
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'ERROR':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (processed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((processed / total) * 100);
  };

  if (loading || loadingAccounts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div>
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">Email Synchronization</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage email synchronization for your connected accounts.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {accounts.map((account) => {
            const syncStatus = syncStatuses.get(account._id);
            const progressPercentage = syncStatus 
              ? getProgressPercentage(syncStatus.processedEmails, syncStatus.totalEmails)
              : 0;

            return (
              <div key={account._id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-500">{account.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(syncStatus?.status || 'IDLE')}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(syncStatus?.status || 'IDLE')}`}>
                      {syncStatus?.status || 'IDLE'}
                    </span>
                  </div>
                </div>

                {syncStatus && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress: {syncStatus.processedEmails} / {syncStatus.totalEmails} emails</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          syncStatus.status === 'RUNNING' ? 'bg-blue-500' :
                          syncStatus.status === 'COMPLETED' ? 'bg-green-500' :
                          syncStatus.status === 'ERROR' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    
                    {syncStatus.currentFolder && (
                      <p className="text-sm text-gray-500 mt-2">
                        Current folder: {syncStatus.currentFolder}
                      </p>
                    )}
                    
                    {syncStatus.errorMessage && (
                      <p className="text-sm text-red-600 mt-2">
                        Error: {syncStatus.errorMessage}
                      </p>
                    )}

                    {/* Debug info */}
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                      <p><strong>Debug Info:</strong></p>
                      <p>Status: {syncStatus?.status || 'Unknown'}</p>
                      <p>Total: {syncStatus?.totalEmails || 0}</p>
                      <p>Processed: {syncStatus?.processedEmails || 0}</p>
                      <p>Last Activity: {syncStatus?.lastActivity ? new Date(syncStatus.lastActivity).toLocaleTimeString() : 'Never'}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  {syncStatus?.status === 'RUNNING' ? (
                    <button
                      onClick={() => {
                        console.log('Pause sync clicked for account:', account._id);
                        handlePauseSync(account._id);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      <PauseIcon className="h-4 w-4 mr-2" />
                      Pause Sync
                    </button>
                  ) : syncStatus?.status === 'PAUSED' ? (
                    <button
                      onClick={() => {
                        console.log('Resume sync clicked for account:', account._id);
                        handleResumeSync(account._id);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Resume Sync
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        console.log('Start sync clicked for account:', account._id);
                        handleStartSync(account._id);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Start Sync
                    </button>
                  )}
                  
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Refresh
                  </button>

                  <button
                    onClick={() => handleTestAPI(account._id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Test API
                  </button>

                  <button
                    onClick={() => handleTestConnection(account._id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Test Connection
                  </button>

                  <button
                    onClick={() => handleTestEmails(account._id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Test Emails
                  </button>
                </div>
              </div>
            );
          })}

          {accounts.length === 0 && (
            <div className="text-center py-12">
              <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No email accounts</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add email accounts to start synchronizing emails.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/accounts')}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Add Email Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
