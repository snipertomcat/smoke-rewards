import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, DollarSign, TrendingUp, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'
import * as billingApi from '../../api/billing'
import type { Subscription, BillingTransaction } from '../../types'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'

function formatCurrency(val: string | number) {
  const num = typeof val === 'string' ? parseFloat(val) : val
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(str: string | null) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatNumber(val: number) {
  return new Intl.NumberFormat('en-US').format(val)
}

function statusBadge(status: Subscription['status']) {
  const map: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
    active: 'green',
    past_due: 'yellow',
    canceled: 'gray',
    incomplete: 'yellow',
    trialing: 'green',
    unpaid: 'red',
  }
  return <Badge variant={map[status] ?? 'gray'}>{status.replace('_', ' ')}</Badge>
}

function txStatusBadge(status: BillingTransaction['status']) {
  const map: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
    paid: 'green',
    failed: 'red',
    pending: 'yellow',
    refunded: 'gray',
  }
  return <Badge variant={map[status] ?? 'gray'}>{status}</Badge>
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  iconBg: string
  subtext?: string
}

function StatCard({ title, value, icon, iconBg, subtext }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
    </Card>
  )
}

export default function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'transactions'>('subscriptions')
  const [subPage, setSubPage] = useState(1)
  const [txPage, setTxPage] = useState(1)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'billing', 'stats'],
    queryFn: billingApi.getAdminBillingStats,
  })

  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['admin', 'billing', 'subscriptions', subPage],
    queryFn: () => billingApi.listAdminSubscriptions({ page: subPage, per_page: 15 }),
  })

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['admin', 'billing', 'transactions', txPage],
    queryFn: () => billingApi.listAdminTransactions({ page: txPage, per_page: 15 }),
    enabled: activeTab === 'transactions',
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing Overview</h1>
        <p className="text-gray-500 text-sm mt-1">System-wide subscription and payment activity</p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="flex items-center justify-center h-24"><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Active Subscriptions"
              value={formatNumber(stats?.active_subscriptions ?? 0)}
              subtext={`${formatNumber(stats?.total_subscriptions ?? 0)} total`}
              icon={<CheckCircle className="h-6 w-6 text-emerald-600" />}
              iconBg="bg-emerald-100"
            />
            <StatCard
              title="Monthly Recurring Revenue"
              value={formatCurrency(stats?.mrr ?? '0')}
              icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-100"
            />
            <StatCard
              title="Revenue This Month"
              value={formatCurrency(stats?.revenue_this_month ?? '0')}
              icon={<DollarSign className="h-6 w-6 text-brand-600" />}
              iconBg="bg-brand-100"
            />
            <StatCard
              title="Total Collected"
              value={formatCurrency(stats?.total_revenue ?? '0')}
              icon={<CreditCard className="h-6 w-6 text-purple-600" />}
              iconBg="bg-purple-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Failed Payments (All Time)"
              value={formatNumber(stats?.failed_payments ?? 0)}
              icon={<AlertCircle className="h-6 w-6 text-red-600" />}
              iconBg="bg-red-100"
            />
            <StatCard
              title="Canceled This Month"
              value={formatNumber(stats?.canceled_this_month ?? 0)}
              icon={<XCircle className="h-6 w-6 text-gray-500" />}
              iconBg="bg-gray-100"
            />
            <StatCard
              title="Inactive Subscriptions"
              value={formatNumber((stats?.total_subscriptions ?? 0) - (stats?.active_subscriptions ?? 0))}
              icon={<Clock className="h-6 w-6 text-yellow-600" />}
              iconBg="bg-yellow-100"
            />
          </div>
        </>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {(['subscriptions', 'transactions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Subscriptions */}
      {activeTab === 'subscriptions' && (
        <Card padding={false}>
          {subsLoading ? (
            <div className="flex items-center justify-center h-48"><Spinner /></div>
          ) : !subscriptions || subscriptions.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
              <CreditCard className="h-8 w-8" />
              <p className="text-sm">No subscriptions yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Billing</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {subscriptions.data.map(sub => (
                      <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{sub.tenant?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{sub.plan_name}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {formatCurrency(sub.amount)}<span className="text-xs text-gray-400 font-normal">/mo</span>
                        </td>
                        <td className="px-4 py-3">{statusBadge(sub.status)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{sub.created_by_user?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(sub.current_period_end)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(sub.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {subscriptions.meta.last_page > 1 && (
                <div className="px-4 py-3 border-t border-gray-100">
                  <Pagination
                    currentPage={subPage}
                    lastPage={subscriptions.meta.last_page}
                    onPageChange={setSubPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Transactions */}
      {activeTab === 'transactions' && (
        <Card padding={false}>
          {txLoading ? (
            <div className="flex items-center justify-center h-48"><Spinner /></div>
          ) : !transactions || transactions.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
              <DollarSign className="h-8 w-8" />
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.data.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(tx.processed_at ?? tx.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{tx.tenant?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{tx.description ?? tx.subscription?.plan_name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(tx.amount)}</td>
                        <td className="px-4 py-3">{txStatusBadge(tx.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {transactions.meta.last_page > 1 && (
                <div className="px-4 py-3 border-t border-gray-100">
                  <Pagination
                    currentPage={txPage}
                    lastPage={transactions.meta.last_page}
                    onPageChange={setTxPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  )
}
