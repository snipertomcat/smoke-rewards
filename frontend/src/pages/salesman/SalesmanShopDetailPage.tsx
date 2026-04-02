import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, KeyRound, Store, Users, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react'
import * as salesmanApi from '../../api/salesman'
import type { TenantWithCounts } from '../../types'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'

function formatCurrency(val: string | number) {
  const num = typeof val === 'string' ? parseFloat(val) : val
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function extractError(err: unknown, fallback: string): string {
  const response = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response
  const firstError = response?.data?.errors
    ? Object.values(response.data.errors).flat()[0]
    : response?.data?.message
  return firstError ?? fallback
}

// ---- Stat Card ----

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  iconBg: string
}

function StatCard({ title, value, icon, iconBg }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

// ---- Edit Shop Modal ----

interface EditShopModalProps {
  shop: TenantWithCounts
  onClose: () => void
}

function EditShopModal({ shop, onClose }: EditShopModalProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(shop.name)
  const [email, setEmail] = useState(shop.email ?? '')
  const [isActive, setIsActive] = useState(shop.is_active)
  const [pointsPerDollar, setPointsPerDollar] = useState(
    String(shop.settings?.points_per_dollar ?? 1)
  )
  const [minRedemptionPoints, setMinRedemptionPoints] = useState(
    String((shop.settings as { min_redemption_points?: number } | undefined)?.min_redemption_points ?? 100)
  )
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (data: salesmanApi.UpdateShopData) => salesmanApi.updateShop(shop.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesman', 'shops'] })
      queryClient.invalidateQueries({ queryKey: ['salesman', 'shop', shop.id] })
      onClose()
    },
    onError: (err: unknown) => {
      setError(extractError(err, 'Failed to update shop. Please try again.'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    mutation.mutate({
      name: name.trim(),
      email: email.trim() || undefined,
      is_active: isActive,
      settings: {
        points_per_dollar: parseFloat(pointsPerDollar) || 1,
        min_redemption_points: parseInt(minRedemptionPoints) || 100,
      },
    })
  }

  return (
    <Modal title={`Edit: ${shop.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Email"
          type="email"
          placeholder="shop@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Active</label>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
              isActive ? 'bg-orange-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Points Per Dollar"
            type="number"
            min="0"
            step="0.01"
            value={pointsPerDollar}
            onChange={(e) => setPointsPerDollar(e.target.value)}
          />
          <Input
            label="Min Redemption Points"
            type="number"
            min="0"
            step="1"
            value={minRedemptionPoints}
            onChange={(e) => setMinRedemptionPoints(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={mutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ---- Change Password Modal ----

interface ChangePasswordModalProps {
  shop: TenantWithCounts
  onClose: () => void
}

function ChangePasswordModal({ shop, onClose }: ChangePasswordModalProps) {
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const mutation = useMutation({
    mutationFn: () => salesmanApi.updateShopPassword(shop.id, password, passwordConfirmation),
    onSuccess: () => {
      setSuccess(true)
      setTimeout(onClose, 1200)
    },
    onError: (err: unknown) => {
      setError(extractError(err, 'Failed to update password. Please try again.'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.')
      return
    }
    mutation.mutate()
  }

  return (
    <Modal title={`Change Password: ${shop.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            Password updated successfully.
          </div>
        )}

        <Input
          label="New Password *"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          label="Confirm Password *"
          type="password"
          placeholder="Repeat new password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={mutation.isPending}>
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ---- Main Page ----

export default function SalesmanShopDetailPage() {
  const { id } = useParams<{ id: string }>()
  const shopId = parseInt(id ?? '0', 10)
  const navigate = useNavigate()
  const [customersPage, setCustomersPage] = useState(1)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const perPage = 15

  const { data: shop, isLoading: shopLoading, error: shopError } = useQuery({
    queryKey: ['salesman', 'shop', shopId],
    queryFn: () => salesmanApi.getShop(shopId),
    enabled: shopId > 0,
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['salesman', 'shop', shopId, 'stats'],
    queryFn: () => salesmanApi.getShopStats(shopId),
    enabled: shopId > 0,
  })

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['salesman', 'shop', shopId, 'customers', { page: customersPage, per_page: perPage }],
    queryFn: () => salesmanApi.listCustomers({ tenant_id: shopId, page: customersPage, per_page: perPage }),
    enabled: shopId > 0,
  })

  if (shopLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (shopError || !shop) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/salesman/shops')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Shops
        </Button>
        <EmptyState title="Shop not found" description="This shop may have been deleted or does not exist." />
      </div>
    )
  }

  const customers = customersData?.data ?? []
  const customersMeta = customersData?.meta

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/salesman/shops')}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
              <Badge variant={shop.is_active ? 'green' : 'red'}>
                {shop.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {shop.email && (
              <p className="text-sm text-gray-500">{shop.email}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">ID #{shop.id} &middot; Slug: {shop.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowPasswordModal(true)}>
            <KeyRound className="h-4 w-4" />
            Change Password
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowEditModal(true)}>
            <Pencil className="h-4 w-4" />
            Edit Shop
          </Button>
        </div>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="flex items-center justify-center h-32">
          <Spinner />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Customers"
            value={formatNumber(stats.total_customers)}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            iconBg="bg-blue-100"
          />
          <StatCard
            title="Total Purchases"
            value={formatNumber(stats.total_purchases)}
            icon={<ShoppingBag className="h-6 w-6 text-amber-600" />}
            iconBg="bg-amber-100"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.total_revenue)}
            icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
            iconBg="bg-emerald-100"
          />
          <StatCard
            title="Revenue This Month"
            value={formatCurrency(stats.revenue_this_month)}
            icon={<TrendingUp className="h-6 w-6 text-orange-600" />}
            iconBg="bg-orange-100"
          />
        </div>
      ) : null}

      {/* Shop Settings */}
      <Card>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Settings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Points Per Dollar</p>
            <p className="font-medium text-gray-900">{shop.settings?.points_per_dollar ?? 1}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Min Redemption Points</p>
            <p className="font-medium text-gray-900">
              {(shop.settings as { min_redemption_points?: number } | undefined)?.min_redemption_points ?? 100}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">Users</p>
            <p className="font-medium text-gray-900">{formatNumber(shop.users_count)}</p>
          </div>
        </div>
      </Card>

      {/* Customers */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Store className="h-4 w-4 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">Customers</h2>
          {customersMeta && (
            <span className="ml-auto text-xs text-gray-400">
              {formatNumber(customersMeta.total)} total
            </span>
          )}
        </div>

        {customersLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No customers yet"
            description="This shop has no registered customers."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((customer) => {
                    const displayName = [customer.first_name, customer.last_name].filter(Boolean).join(' ') || '—'
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{displayName}</p>
                          <p className="text-xs text-gray-400">ID #{customer.id}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {customer.email ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {customer.phone ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-orange-600 text-right">
                          {formatNumber(customer.points_balance)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(customer.last_visit_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {customersMeta && customersMeta.last_page > 1 && (
              <div className="border-t border-gray-100">
                <Pagination
                  currentPage={customersMeta.current_page}
                  lastPage={customersMeta.last_page}
                  from={customersMeta.from}
                  to={customersMeta.to}
                  total={customersMeta.total}
                  onPrev={() => setCustomersPage((p) => Math.max(1, p - 1))}
                  onNext={() => setCustomersPage((p) => Math.min(customersMeta.last_page, p + 1))}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {showEditModal && (
        <EditShopModal
          shop={shop}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          shop={shop}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  )
}
