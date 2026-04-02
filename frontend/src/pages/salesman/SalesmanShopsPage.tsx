import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Pencil, Trash2, Store, KeyRound, ExternalLink } from 'lucide-react'
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

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function extractError(err: unknown, fallback: string): string {
  const response = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response
  const firstError = response?.data?.errors
    ? Object.values(response.data.errors).flat()[0]
    : response?.data?.message
  return firstError ?? fallback
}

// ---- Create Shop Modal ----

interface CreateShopModalProps {
  onClose: () => void
}

function CreateShopModal({ onClose }: CreateShopModalProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pointsPerDollar, setPointsPerDollar] = useState('1')
  const [minRedemptionPoints, setMinRedemptionPoints] = useState('100')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(name))
    }
  }, [name, slugManuallyEdited])

  const mutation = useMutation({
    mutationFn: salesmanApi.createShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesman', 'shops'] })
      onClose()
    },
    onError: (err: unknown) => {
      setError(extractError(err, 'Failed to create shop. Please try again.'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required.')
      return
    }
    if (!email.trim()) {
      setError('Email is required to create the owner account.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    mutation.mutate({
      name: name.trim(),
      slug: slug.trim(),
      email: email.trim(),
      password,
      settings: {
        points_per_dollar: parseFloat(pointsPerDollar) || 1,
        min_redemption_points: parseInt(minRedemptionPoints) || 100,
      },
    })
  }

  return (
    <Modal title="New Shop" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <Input
          label="Name *"
          placeholder="My Smoke Shop"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Slug *"
          placeholder="my-smoke-shop"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugManuallyEdited(true)
          }}
        />

        <Input
          label="Owner Email *"
          type="email"
          placeholder="owner@shop.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Owner Password *"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

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
            Create Shop
          </Button>
        </div>
      </form>
    </Modal>
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

export default function SalesmanShopsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingShop, setEditingShop] = useState<TenantWithCounts | null>(null)
  const [changingPasswordShop, setChangingPasswordShop] = useState<TenantWithCounts | null>(null)
  const perPage = 15

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    clearTimeout((window as unknown as { _salesmanShopSearchTimeout?: ReturnType<typeof setTimeout> })._salesmanShopSearchTimeout)
    ;(window as unknown as { _salesmanShopSearchTimeout?: ReturnType<typeof setTimeout> })._salesmanShopSearchTimeout = setTimeout(() => {
      setDebouncedSearch(value)
    }, 350)
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['salesman', 'shops', { search: debouncedSearch, page, per_page: perPage }],
    queryFn: () =>
      salesmanApi.listShops({ search: debouncedSearch || undefined, page, per_page: perPage }),
  })

  const deleteMutation = useMutation({
    mutationFn: salesmanApi.deleteShop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesman', 'shops'] })
    },
  })

  const handleDelete = (shop: TenantWithCounts) => {
    if (window.confirm(`Delete shop "${shop.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(shop.id)
    }
  }

  const shops = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shops</h1>
          <p className="text-gray-500 text-sm mt-1">
            {meta ? `${new Intl.NumberFormat('en-US').format(meta.total)} total shops` : 'Manage your shops'}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          New Shop
        </Button>
      </div>

      <Card padding={false}>
        <div className="px-4 py-3 border-b border-gray-100">
          <Input
            placeholder="Search shops..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <EmptyState title="Failed to load shops" description="Please refresh the page." />
        ) : shops.length === 0 ? (
          <EmptyState
            icon={<Store className="h-12 w-12" />}
            title="No shops found"
            description={debouncedSearch ? 'Try a different search term.' : 'Create your first shop to get started.'}
            action={
              !debouncedSearch ? (
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4" />
                  New Shop
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {shops.map((shop) => {
                    const revenue = shop.purchases_sum_amount ? parseFloat(shop.purchases_sum_amount) : 0
                    return (
                      <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{shop.name}</p>
                          <p className="text-xs text-gray-400">ID #{shop.id}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {shop.email ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          {new Intl.NumberFormat('en-US').format(shop.customers_count)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-600 text-right">
                          ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={shop.is_active ? 'green' : 'red'}>
                            {shop.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/salesman/shops/${shop.id}`)}
                            >
                              <ExternalLink className="h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingShop(shop)}
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setChangingPasswordShop(shop)}
                            >
                              <KeyRound className="h-4 w-4" />
                              Password
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(shop)}
                              loading={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {meta && meta.last_page > 1 && (
              <div className="border-t border-gray-100">
                <Pagination
                  currentPage={meta.current_page}
                  lastPage={meta.last_page}
                  from={meta.from}
                  to={meta.to}
                  total={meta.total}
                  onPrev={() => setPage((p) => Math.max(1, p - 1))}
                  onNext={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {showCreateModal && (
        <CreateShopModal onClose={() => setShowCreateModal(false)} />
      )}

      {editingShop && (
        <EditShopModal
          shop={editingShop}
          onClose={() => setEditingShop(null)}
        />
      )}

      {changingPasswordShop && (
        <ChangePasswordModal
          shop={changingPasswordShop}
          onClose={() => setChangingPasswordShop(null)}
        />
      )}
    </div>
  )
}
