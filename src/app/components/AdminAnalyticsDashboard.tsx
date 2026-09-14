import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, Users, Building2, UserPlus, TrendingUp, 
  FileText, Phone, Award, Calendar 
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalUsers: number;
    totalVillages: number;
    totalLeads: number;
    newUsers: number;
    newLeads: number;
  };
  revenue: {
    memberships: number;
    featuredListings: number;
    projectedCommissions: number;
  };
  users: {
    total: number;
    byTier: {
      free: number;
      premium: number;
      family: number;
    };
    new: number;
  };
  villages: {
    total: number;
    pending: number;
    featured: number;
  };
  leads: {
    total: number;
    new: number;
    byStatus: {
      new: number;
      contacted: number;
      qualified: number;
      converted: number;
      closed: number;
    };
  };
}

export function AdminAnalyticsDashboard({ accessToken }: { accessToken: string }) {
  const [dateRange, setDateRange] = useState('30');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [leadSourcesData, setLeadSourcesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we have a valid access token
    if (accessToken) {
      fetchAnalytics().catch((err) => {
        console.error('Analytics fetch failed:', err);
        // Error is already handled in fetchAnalytics
      });
    }
  }, [dateRange, accessToken]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-3bba8be8`;

      console.log('Fetching analytics from:', `${baseUrl}/analytics/overview?range=${dateRange}`);

      // Fetch overview data
      const overviewRes = await fetch(`${baseUrl}/analytics/overview?range=${dateRange}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log('Overview response status:', overviewRes.status);

      if (!overviewRes.ok) {
        const errorData = await overviewRes.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Overview error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch analytics data');
      }

      const overviewData = await overviewRes.json();
      console.log('Overview data received:', overviewData);
      setAnalyticsData(overviewData);

      // Fetch chart data
      const [revenueRes, userGrowthRes, leadSourcesRes] = await Promise.all([
        fetch(`${baseUrl}/analytics/revenue-chart?days=${dateRange}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${baseUrl}/analytics/user-growth?days=${dateRange}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${baseUrl}/analytics/lead-sources`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const [revenueData, userGrowthDataRes, leadSourcesDataRes] = await Promise.all([
        revenueRes.json(),
        userGrowthRes.json(),
        leadSourcesRes.json(),
      ]);

      setRevenueChartData(revenueData.data || []);
      setUserGrowthData(userGrowthDataRes.data || []);
      setLeadSourcesData(leadSourcesDataRes.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your platform performance and revenue</p>
        </div>

        {/* Date Range Selector */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setDateRange('7')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              dateRange === '7'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDateRange('30')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              dateRange === '30'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setDateRange('90')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              dateRange === '90'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            90 Days
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<DollarSign className="h-8 w-8" />}
            title="Total Revenue"
            value={`$${analyticsData.overview.totalRevenue.toLocaleString()}`}
            subtitle="Monthly estimated"
            color="green"
          />
          <StatCard
            icon={<Users className="h-8 w-8" />}
            title="Total Users"
            value={analyticsData.overview.totalUsers.toString()}
            subtitle={`+${analyticsData.overview.newUsers} this period`}
            color="blue"
          />
          <StatCard
            icon={<Building2 className="h-8 w-8" />}
            title="Villages"
            value={analyticsData.overview.totalVillages.toString()}
            subtitle={`${analyticsData.villages.pending} pending approval`}
            color="purple"
          />
          <StatCard
            icon={<Phone className="h-8 w-8" />}
            title="Agent Leads"
            value={analyticsData.overview.totalLeads.toString()}
            subtitle={`+${analyticsData.overview.newLeads} this period`}
            color="orange"
          />
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <RevenueCard
            title="Membership Revenue"
            amount={analyticsData.revenue.memberships}
            icon={<Users className="h-6 w-6" />}
            details={`${analyticsData.users.byTier.premium} Premium + ${analyticsData.users.byTier.family} Family`}
          />
          <RevenueCard
            title="Featured Listings"
            amount={analyticsData.revenue.featuredListings}
            icon={<Award className="h-6 w-6" />}
            details={`${analyticsData.villages.featured} active listings`}
          />
          <RevenueCard
            title="Projected Commissions"
            amount={analyticsData.revenue.projectedCommissions}
            icon={<TrendingUp className="h-6 w-6" />}
            details={`${analyticsData.leads.byStatus.converted} converted leads`}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Over Time */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="mb-4 text-gray-900">Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Total Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="memberships" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Memberships"
                />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Leads"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="mb-4 text-gray-900">User Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6}
                  name="Total Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Lead Status Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="mb-4 text-gray-900">Lead Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(analyticsData.leads.byStatus).map(([name, value]) => ({
                  name: name.charAt(0).toUpperCase() + name.slice(1),
                  count: value,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lead Sources */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="mb-4 text-gray-900">Lead Sources</h3>
            {leadSourcesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadSourcesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadSourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No lead source data available
              </div>
            )}
          </div>
        </div>

        {/* Membership Tier Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="mb-4 text-gray-900">Membership Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TierCard
              tier="Free"
              count={analyticsData.users.byTier.free}
              total={analyticsData.users.total}
              color="gray"
            />
            <TierCard
              tier="Premium"
              count={analyticsData.users.byTier.premium}
              total={analyticsData.users.total}
              color="blue"
            />
            <TierCard
              tier="Family"
              count={analyticsData.users.byTier.family}
              total={analyticsData.users.total}
              color="purple"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  subtitle: string;
  color: 'green' | 'blue' | 'purple' | 'orange';
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 mb-1">{title}</h3>
      <p className="text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function RevenueCard({
  title,
  amount,
  icon,
  details,
}: {
  title: string;
  amount: number;
  icon: React.ReactNode;
  details: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
          {icon}
        </div>
        <h3 className="text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-900 mb-1">${amount.toLocaleString()}</p>
      <p className="text-sm text-gray-500">{details}</p>
    </div>
  );
}

function TierCard({
  tier,
  count,
  total,
  color,
}: {
  tier: string;
  count: number;
  total: number;
  color: 'gray' | 'blue' | 'purple';
}) {
  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';

  const colorClasses = {
    gray: 'bg-gray-200',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-700">{tier}</span>
        <span className="text-gray-900">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500">{percentage}% of total users</p>
    </div>
  );
}