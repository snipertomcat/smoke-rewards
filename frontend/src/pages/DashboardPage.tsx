import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Users,
  TrendingUp,
  Award,
  ShoppingBag,
  DollarSign,
} from 'lucide-react'
import * as statisticsApi from '../api/statistics'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useNavigate } from 'react-router-dom'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['statistics'],
    queryFn: statisticsApi.getSummary,
  })

  const { data: topCustomers, isLoading: topLoading } = useQuery({
    queryKey: ['statistics', 'top-customers'],
    queryFn: () => statisticsApi.getTopCustomers(10),
  })

  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ['statistics', 'purchase-trend'],
    queryFn: () => statisticsApi.getPurchaseTrend(6),
  })

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (statsError) {
    return (
      <EmptyState
        title="Failed to load statistics"
        description="There was an error loading the dashboard data. Please refresh."
      />
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your rewards program</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Customers"
          value={formatNumber(stats?.total_customers ?? 0)}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="Points Issued"
          value={formatNumber(stats?.total_points_issued ?? 0)}
          icon={<TrendingUp className="h-6 w-6 text-brand-600" />}
          color="bg-brand-100"
        />
        <StatCard
          title="Points Outstanding"
          value={formatNumber(stats?.total_points_outstanding ?? 0)}
          icon={<Award className="h-6 w-6 text-purple-600" />}
          color="bg-purple-100"
        />
        <StatCard
          title="Purchases This Month"
          value={formatNumber(stats?.purchases_this_month ?? 0)}
          icon={<ShoppingBag className="h-6 w-6 text-emerald-600" />}
          color="bg-emerald-100"
        />
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(stats?.revenue_this_month ?? 0)}
          icon={<DollarSign className="h-6 w-6 text-amber-600" />}
          color="bg-amber-100"
        />
      </div>

      {/* Charts + Table row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Purchase Trend Chart */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Purchase Trend (6 Months)</h2>
          {trendLoading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner />
            </div>
          ) : !trend || trend.length === 0 ? (
            <EmptyState title="No trend data available" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
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
                  formatter={(value: number, name: string) => {
                    if (name === 'Revenue') return [formatCurrency(value), name]
                    return [formatNumber(value), name]
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="purchase_count"
                  name="Purchases"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  name="Revenue"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top Customers */}
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Top 10 Customers</h2>
          </div>
          {topLoading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner />
            </div>
          ) : !topCustomers || topCustomers.length === 0 ? (
            <EmptyState title="No customers yet" />
          ) : (
            <div className="divide-y divide-gray-50">
              {topCustomers.map((customer, index) => (
                <button
                  key={customer.id}
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="flex items-center gap-3 w-full px-6 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="flex-shrink-0 w-6 text-sm font-medium text-gray-400 text-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {customer.first_name} {customer.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {customer.email ?? customer.phone ?? '—'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-brand-600">
                      {formatNumber(customer.points_balance)} pts
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
