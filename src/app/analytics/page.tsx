'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { 
  AnalyticsOverview, 
  SenderAnalytics, 
  DomainAnalytics, 
  ESPAnalytics, 
  TimeSeriesData 
} from '../../types';
import { analyticsService } from '../../services/analytics.service';
import { formatNumber } from '../../utils/format';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [senders, setSenders] = useState<SenderAnalytics[]>([]);
  const [domains, setDomains] = useState<DomainAnalytics[]>([]);
  const [espData, setEspData] = useState<ESPAnalytics[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const [overviewData, sendersData, domainsData, espData, timeSeriesData] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getSenders({ limit: 10 }),
        analyticsService.getDomains({ limit: 10 }),
        analyticsService.getESP({ limit: 10 }),
        analyticsService.getTimeSeries({ days: 30 }),
      ]);

      setOverview(overviewData);
      setSenders(sendersData);
      setDomains(domainsData);
      setEspData(espData);
      setTimeSeries(timeSeriesData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
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
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Detailed insights into your email data and trends.
          </p>
        </div>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatNumber(overview.totalEmails)}
                    </div>
                    <div className="text-sm font-medium text-gray-500">Total Emails</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatNumber(overview.uniqueSenders)}
                    </div>
                    <div className="text-sm font-medium text-gray-500">Unique Senders</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatNumber(overview.uniqueDomains)}
                    </div>
                    <div className="text-sm font-medium text-gray-500">Unique Domains</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-semibold text-gray-900">
                      {Math.round(overview.averageTimeDelta / 1000 / 60)}m
                    </div>
                    <div className="text-sm font-medium text-gray-500">Avg. Time Delta</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Time Series Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Email Volume Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ESP Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Email Service Providers</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={espData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {espData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Senders and Domains */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Senders */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Top Senders
              </h3>
              <div className="space-y-3">
                {senders.map((sender) => (
                  <div key={sender._id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {sender._id}
                    </span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${(sender.count / (senders[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{sender.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Domains */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Top Domains
              </h3>
              <div className="space-y-3">
                {domains.map((domain) => (
                  <div key={domain._id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {domain._id}
                    </span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(domain.count / (domains[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">{domain.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
