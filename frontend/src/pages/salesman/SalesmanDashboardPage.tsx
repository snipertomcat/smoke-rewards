import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart,
} from 'recharts'
import {
  Store, Users, DollarSign, Award, ShoppingBag, TrendingUp, Plus, ArrowRight,
} from 'lucide-react'
import * as salesmanApi from '../../api/salesman'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

function formatCurrency(val: string | number) {
  const num = typeof val === 'string' ? parseFloat(val) : val
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
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

export default function SalesmanDashboardPage() {
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['salesman', 'stats'],
    queryFn: salesmanApi.getStats,
  })

  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ['salesman', 'stats', 'purchase-trend'],
    queryFn: () => salesmanApi.getPurchaseTrend(6),
  })

  const { data: topShops, isLoading: topShopsLoading } = useQuery({
    queryKey: ['salesman', 'stats', 'top-shops'],
    queryFn: () => salesmanApi.getTopShops(10),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Your managed shops overview</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/salesman/shops')}>
          <Plus className="h-4 w-4" />
          New Shop
        </Button>
      </div>

      {/* Stats row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Shops"
          value={formatNumber(stats?.total_tenants ?? 0)}
          subtext={`${formatNumber(stats?.active_tenants ?? 0)} active`}
          icon={<Store className="h-6 w-6 text-orange-600" />}
          iconBg="bg-orange-100"
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

      {/* Stats row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
      </div>

      {/* Chart + Top Shops */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Purchase Trend (6 Months)</h2>
          {trendLoading ? (
            <div className="flex items-center justify-center h-48"><Spinner /></div>
          ) : !trend || trend.length === 0 ? (
            <EmptyState title="No trend data available" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={trend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip formatter={(value: number | string, name: string) => {
                  if (name === 'Revenue') return [formatCurrency(value), name]
                  return [formatNumber(Number(value)), name]
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="count" name="Purchases" fill="#ea580c" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top Shops */}
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Top Shops</h2>
            <button
              onClick={() => navigate('/salesman/shops')}
              className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {topShopsLoading ? (
            <div className="flex items-center justify-center h-48"><Spinner /></div>
          ) : !topShops || topShops.length === 0 ? (
            <EmptyState title="No shops yet" />
          ) : (
            <div className="divide-y divide-gray-50">
              {topShops.map((shop, index) => (
                <div
                  key={shop.id}
                  className="flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/salesman/shops/${shop.id}`)}
                >
                  <span className="flex-shrink-0 w-6 text-sm font-medium text-gray-400 text-center">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{shop.name}</p>
                    <p className="text-xs text-gray-500">{formatNumber(shop.customers_count)} customers</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(shop.purchases_sum_amount ?? '0')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => navigate('/salesman/shops')}>
            <Store className="h-4 w-4" />
            Manage Shops
          </Button>
          <Button variant="secondary" onClick={() => navigate('/salesman/customers')}>
            <Users className="h-4 w-4" />
            View Customers
          </Button>
        </div>
      </Card>
    </div>
  )
}
