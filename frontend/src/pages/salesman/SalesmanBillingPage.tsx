import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, DollarSign, CheckCircle, XCircle, Clock, TrendingUp, AlertCircle, X, Plus, Zap } from 'lucide-react'
import * as billingApi from '../../api/billing'
import * as salesmanApi from '../../api/salesman'
import type { Subscription, BillingTransaction } from '../../types'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '')

function formatCurrency(val: string | number) {
  const num = typeof val === 'string' ? parseFloat(val) : val
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(str: string | null) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

// ---- New Subscription Form (inside Elements) ----

interface NewSubscriptionFormProps {
  onSuccess: () => void
  onCancel: () => void
}

function NewSubscriptionForm({ onSuccess, onCancel }: NewSubscriptionFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const queryClient = useQueryClient()
  const [tenantId, setTenantId] = useState<number | ''>('')
  const [planName, setPlanName] = useState('')
  const [amount, setAmount] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { data: shopsPage } = useQuery({
    queryKey: ['salesman', 'shops', 'all'],
    queryFn: () => salesmanApi.listShops({ per_page: 100 }),
  })
  const shops = shopsPage?.data ?? []

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    if (!tenantId || !planName || !amount) {
      setError('Please fill in all fields.')
      return
    }

    setError(null)
    setLoading(true)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Card element not found.')
      setLoading(false)
      return
    }

    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { name: cardholderName || undefined },
    })

    if (pmError || !paymentMethod) {
      setError(pmError?.message ?? 'Failed to process card.')
      setLoading(false)
      return
    }

    try {
      const result = await billingApi.createSubscription({
        tenant_id: tenantId as number,
        plan_name: planName,
        amount: parseFloat(amount),
        payment_method_id: paymentMethod.id,
      })

      // If Stripe requires confirmation (3DS or incomplete)
      if (result.client_secret) {
        const { error: confirmError } = await stripe.confirmCardPayment(result.client_secret)
        if (confirmError) {
          setError(confirmError.message ?? 'Payment confirmation failed.')
          setLoading(false)
          return
        }
        // Sync status back to backend
        await billingApi.confirmSubscriptionPayment(result.data.id)
      }

      queryClient.invalidateQueries({ queryKey: ['salesman', 'billing'] })
      onSuccess()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [stripe, elements, tenantId, planName, amount, cardholderName, queryClient, onSuccess])

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '14px',
        color: '#111827',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        '::placeholder': { color: '#9ca3af' },
      },
      invalid: { color: '#ef4444' },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Shop</label>
        <select
          value={tenantId}
          onChange={e => setTenantId(e.target.value ? Number(e.target.value) : '')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        >
          <option value="">Select a shop…</option>
          {shops.map(shop => (
            <option key={shop.id} value={shop.id}>{shop.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
        <input
          type="text"
          value={planName}
          onChange={e => setPlanName(e.target.value)}
          placeholder="e.g. Monthly Plan"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Amount ($)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="99.00"
            min="0.50"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
        <input
          type="text"
          value={cardholderName}
          onChange={e => setCardholderName(e.target.value)}
          placeholder="Name on card"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Card Details</label>
        <div className="border border-gray-300 rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={loading || !stripe} className="flex-1">
          {loading ? <Spinner size="sm" /> : <CreditCard className="h-4 w-4" />}
          {loading ? 'Processing…' : 'Charge & Subscribe'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

// ---- One-Time Charge Form ----

interface OneTimeChargeFormProps {
  onSuccess: () => void
  onCancel: () => void
}

function OneTimeChargeForm({ onSuccess, onCancel }: OneTimeChargeFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const queryClient = useQueryClient()
  const [tenantId, setTenantId] = useState<number | ''>('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { data: shopsPage } = useQuery({
    queryKey: ['salesman', 'shops', 'all'],
    queryFn: () => salesmanApi.listShops({ per_page: 100 }),
  })
  const shops = shopsPage?.data ?? []

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    if (!tenantId || !description || !amount) {
      setError('Please fill in all fields.')
      return
    }

    setError(null)
    setLoading(true)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Card element not found.')
      setLoading(false)
      return
    }

    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { name: cardholderName || undefined },
    })

    if (pmError || !paymentMethod) {
      setError(pmError?.message ?? 'Failed to process card.')
      setLoading(false)
      return
    }

    try {
      const result = await billingApi.chargeOnce({
        tenant_id: tenantId as number,
        description,
        amount: parseFloat(amount),
        payment_method_id: paymentMethod.id,
      })

      if (result.client_secret) {
        const { error: confirmError } = await stripe.confirmCardPayment(result.client_secret)
        if (confirmError) {
          setError(confirmError.message ?? 'Payment confirmation failed.')
          setLoading(false)
          return
        }
      }

      queryClient.invalidateQueries({ queryKey: ['salesman', 'billing'] })
      onSuccess()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [stripe, elements, tenantId, description, amount, cardholderName, queryClient, onSuccess])

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '14px',
        color: '#111827',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        '::placeholder': { color: '#9ca3af' },
      },
      invalid: { color: '#ef4444' },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Shop</label>
        <select
          value={tenantId}
          onChange={e => setTenantId(e.target.value ? Number(e.target.value) : '')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        >
          <option value="">Select a shop…</option>
          {shops.map(shop => (
            <option key={shop.id} value={shop.id}>{shop.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. Setup & Training Fee"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="150.00"
            min="0.50"
            step="0.01"
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
        <input
          type="text"
          value={cardholderName}
          onChange={e => setCardholderName(e.target.value)}
          placeholder="Name on card"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Card Details</label>
        <div className="border border-gray-300 rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={loading || !stripe} className="flex-1">
          {loading ? <Spinner size="sm" /> : <Zap className="h-4 w-4" />}
          {loading ? 'Processing…' : 'Charge Now'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

// ---- Main Page ----

export default function SalesmanBillingPage() {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'transactions'>('subscriptions')
  const [showModal, setShowModal] = useState(false)
  const [showChargeModal, setShowChargeModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [subPage, setSubPage] = useState(1)
  const [txPage, setTxPage] = useState(1)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['salesman', 'billing', 'stats'],
    queryFn: billingApi.getSalesmanBillingStats,
  })

  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['salesman', 'billing', 'subscriptions', subPage],
    queryFn: () => billingApi.listSalesmanSubscriptions({ page: subPage, per_page: 15 }),
  })

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['salesman', 'billing', 'transactions', txPage],
    queryFn: () => billingApi.listSalesmanTransactions({ page: txPage, per_page: 15 }),
    enabled: activeTab === 'transactions',
  })

  const queryClient = useQueryClient()
  const cancelMutation = useMutation({
    mutationFn: billingApi.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesman', 'billing'] })
    },
  })

  const handleSuccess = () => {
    setShowModal(false)
    setSuccessMessage('Subscription created and payment processed successfully.')
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  const handleChargeSuccess = () => {
    setShowChargeModal(false)
    setActiveTab('transactions')
    setSuccessMessage('One-time charge processed successfully.')
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-500 text-sm mt-1">Manage shop subscriptions and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowChargeModal(true)}>
            <Zap className="h-4 w-4" />
            One-Time Charge
          </Button>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            New Subscription
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Stats */}
      {statsLoading ? (
        <div className="flex items-center justify-center h-24"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Active Subscriptions"
            value={String(stats?.active_subscriptions ?? 0)}
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
            icon={<DollarSign className="h-6 w-6 text-orange-600" />}
            iconBg="bg-orange-100"
          />
          <StatCard
            title="Total Collected"
            value={formatCurrency(stats?.total_revenue ?? '0')}
            icon={<CreditCard className="h-6 w-6 text-purple-600" />}
            iconBg="bg-purple-100"
          />
        </div>
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
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Subscriptions Tab */}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Billing</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {subscriptions.data.map(sub => (
                      <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{sub.tenant?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{sub.plan_name}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(sub.amount)}<span className="text-xs text-gray-400 font-normal">/mo</span></td>
                        <td className="px-4 py-3">{statusBadge(sub.status)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(sub.current_period_end)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(sub.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          {sub.status !== 'canceled' && (
                            <button
                              onClick={() => {
                                if (confirm('Cancel this subscription?')) cancelMutation.mutate(sub.id)
                              }}
                              className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {subscriptions.meta.last_page > 1 && (
                <div className="border-t border-gray-100">
                  <Pagination
                    currentPage={subPage}
                    lastPage={subscriptions.meta.last_page}
                    from={subscriptions.meta.from}
                    to={subscriptions.meta.to}
                    total={subscriptions.meta.total}
                    onPrev={() => setSubPage(p => p - 1)}
                    onNext={() => setSubPage(p => p + 1)}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Transactions Tab */}
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
                <div className="border-t border-gray-100">
                  <Pagination
                    currentPage={txPage}
                    lastPage={transactions.meta.last_page}
                    from={transactions.meta.from}
                    to={transactions.meta.to}
                    total={transactions.meta.total}
                    onPrev={() => setTxPage(p => p - 1)}
                    onNext={() => setTxPage(p => p + 1)}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* New Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-500" />
                <h2 className="text-base font-semibold text-gray-900">New Subscription</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <Elements stripe={stripePromise}>
                <NewSubscriptionForm
                  onSuccess={handleSuccess}
                  onCancel={() => setShowModal(false)}
                />
              </Elements>
            </div>
          </div>
        </div>
      )}

      {/* One-Time Charge Modal */}
      {showChargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                <h2 className="text-base font-semibold text-gray-900">One-Time Charge</h2>
              </div>
              <button onClick={() => setShowChargeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-500 mb-4">Charge a one-time fee (setup, training, etc.) — not recurring.</p>
              <Elements stripe={stripePromise}>
                <OneTimeChargeForm
                  onSuccess={handleChargeSuccess}
                  onCancel={() => setShowChargeModal(false)}
                />
              </Elements>
            </div>
          </div>
        </div>
      )}

      {/* Status icons legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-500" /> Active</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-yellow-500" /> Pending / Past Due</span>
        <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-gray-400" /> Canceled</span>
        <span className="flex items-center gap-1"><AlertCircle className="h-3 w-3 text-red-500" /> Failed</span>
      </div>
    </div>
  )
}
