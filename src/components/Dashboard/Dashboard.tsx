'use client';

import React, { useEffect, useState } from 'react';
import { 
  EnvelopeIcon, 
  UserGroupIcon, 
  GlobeAltIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import StatsCard from './StatsCard';
import { analyticsService } from '../../services/analytics.service';
import { AnalyticsOverview } from '../../types';
import { formatNumber, formatPercentage } from '../../utils/format';

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await analyticsService.getOverview();
        setOverview(data);
      } catch (error) {
        console.error('Failed to fetch overview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">
          Connect your email accounts to see analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">
          Overview of your email analytics and security metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Emails"
          value={formatNumber(overview.totalEmails || 0)}
          icon={EnvelopeIcon}
        />
        <StatsCard
          title="Unique Senders"
          value={formatNumber(overview.uniqueSenders || 0)}
          icon={UserGroupIcon}
        />
        <StatsCard
          title="Unique Domains"
          value={formatNumber(overview.uniqueDomains || 0)}
          icon={GlobeAltIcon}
        />
        <StatsCard
          title="Avg. Time Delta"
          value={`${Math.round((overview.averageTimeDelta || 0) / 1000 / 60)}m`}
          icon={ChartBarIcon}
        />
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatsCard
          title="TLS Valid"
          value={formatPercentage(overview.securityMetrics?.tlsValidPercentage || 0)}
          change={{
            value: overview.securityMetrics?.tlsValidCount || 0,
            type: 'neutral',
          }}
          icon={ShieldCheckIcon}
          className="border-l-4 border-green-400"
        />
        <StatsCard
          title="Open Relay"
          value={formatPercentage(overview.securityMetrics?.openRelayPercentage || 0)}
          change={{
            value: overview.securityMetrics?.openRelayCount || 0,
            type: (overview.securityMetrics?.openRelayPercentage || 0) > 0 ? 'decrease' : 'neutral',
          }}
          icon={ExclamationTriangleIcon}
          className={`border-l-4 ${
            (overview.securityMetrics?.openRelayPercentage || 0) > 0 
              ? 'border-red-400' 
              : 'border-green-400'
          }`}
        />
        <StatsCard
          title="Certificates Expiring"
          value={overview.securityMetrics?.certificateExpiringCount || 0}
          icon={ExclamationTriangleIcon}
          className={`border-l-4 ${
            (overview.securityMetrics?.certificateExpiringCount || 0) > 0 
              ? 'border-yellow-400' 
              : 'border-green-400'
          }`}
        />
      </div>

      {/* ESP Breakdown */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Email Service Providers
          </h3>
          <div className="space-y-3">
            {overview.espBreakdown && Object.entries(overview.espBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([esp, count]) => (
                <div key={esp} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{esp}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${(count / overview.totalEmails) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
