import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  ComposedChart,
} from 'recharts'
import {
  Store,
  Users,
  DollarSign,
  Award,
  ShoppingBag,
  TrendingUp,
  UserCog,
} from 'lucide-react'
import * as adminApi from '../../api/admin'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

function formatCurrency(val: string | number) {
  const num = typeof val === 'string' ? parseFloat(val) : val
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface StatCardProps {
  title: string
  value: string
  subtext?: string
  icon: React.ReactNode
  iconBg: string
}

function StatCard({ title, value, subtext, icon, iconBg }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getStats,
  })

  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ['admin', 'stats', 'purchase-trend'],
    queryFn: () => adminApi.getPurchaseTrend(6),
  })

  const { data: topTenants, isLoading: topTenantsLoading } = useQuery({
    queryKey: ['admin', 'stats', 'top-tenants'],
    queryFn: () => adminApi.getTopTenants(10),
  })

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['admin', 'stats', 'recent-activity'],
    queryFn: adminApi.getRecentActivity,
  })

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of the entire platform</p>
      </div>

      {/* Row 1 — 4 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Shops"
          value={formatNumber(stats?.total_tenants ?? 0)}
          subtext={`${formatNumber(stats?.active_tenants ?? 0)} active`}
          icon={<Store className="h-6 w-6 text-brand-600" />}
          iconBg="bg-brand-100"
        />
        <StatCard
          title="Total Customers"
          value={formatNumber(stats?.total_customers ?? 0)}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.total_revenue ?? '0')}
          icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
          iconBg="bg-emerald-100"
        />
        <StatCard
          title="Points Outstanding"
          value={formatNumber(stats?.total_points_outstanding ?? 0)}
          icon={<Award className="h-6 w-6 text-purple-600" />}
          iconBg="bg-purple-100"
        />
      </div>

      {/* Row 2 — 4 more stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Purchases"
          value={formatNumber(stats?.total_purchases ?? 0)}
          icon={<ShoppingBag className="h-6 w-6 text-amber-600" />}
          iconBg="bg-amber-100"
        />
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(stats?.revenue_this_month ?? '0')}
          icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
          iconBg="bg-emerald-100"
        />
        <StatCard
          title="Purchases This Month"
          value={formatNumber(stats?.purchases_this_month ?? 0)}
          icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Points Issued"
          value={formatNumber(stats?.total_points_issued ?? 0)}
          icon={<UserCog className="h-6 w-6 text-brand-600" />}
          iconBg="bg-brand-100"
        />
      </div>

      {/* Row 3 — Chart + Top Shops */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Purchase Trend — 2/3 width */}
        <Card className="xl:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Purchase Trend (6 Months)</h2>
          {trendLoading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner />
            </div>
          ) : !trend || trend.length === 0 ? (
            <EmptyState title="No trend data available" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={trend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip
                  formatter={(value: number | string, name: string) => {
                    if (name === 'Revenue') return [formatCurrency(value), name]
                    return [formatNumber(Number(value)), name]
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  name="Purchases"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top Shops — 1/3 width */}
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Top Shops</h2>
          </div>
          {topTenantsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner />
            </div>
          ) : !topTenants || topTenants.length === 0 ? (
            <EmptyState title="No shops yet" />
          ) : (
            <div className="divide-y divide-gray-50">
              {topTenants.map((tenant, index) => (
                <div
                  key={tenant.id}
                  className="flex items-center gap-3 px-6 py-3"
                >
                  <span className="flex-shrink-0 w-6 text-sm font-medium text-gray-400 text-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{tenant.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(tenant.customers_count)} customers
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(tenant.purchases_sum_amount ?? '0')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Row 4 — Recent Activity */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-xs text-gray-500 mt-0.5">Last 20 purchases across all shops</p>
        </div>
        {activityLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner />
          </div>
        ) : !recentActivity || recentActivity.length === 0 ? (
          <EmptyState title="No recent activity" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shop
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points Earned
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(activity.purchased_at)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {activity.tenant.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {activity.customer.first_name || activity.customer.last_name
                        ? `${activity.customer.first_name ?? ''} ${activity.customer.last_name ?? ''}`.trim()
                        : <span className="text-gray-300">Unknown</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-600 text-right">
                      {formatCurrency(activity.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-brand-600 text-right">
                      {formatNumber(activity.points_earned)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
