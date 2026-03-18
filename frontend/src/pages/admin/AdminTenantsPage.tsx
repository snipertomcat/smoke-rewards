import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Pencil, Trash2, Store } from 'lucide-react'
import * as adminApi from '../../api/admin'
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

// ---- Create Tenant Modal ----

interface CreateTenantModalProps {
  onClose: () => void
}

function CreateTenantModal({ onClose }: CreateTenantModalProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [email, setEmail] = useState('')
  const [pointsPerDollar, setPointsPerDollar] = useState('1')
  const [minRedemptionPoints, setMinRedemptionPoints] = useState('100')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(name))
    }
  }, [name, slugManuallyEdited])

  const mutation = useMutation({
    mutationFn: adminApi.createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      onClose()
    },
    onError: (err: unknown) => {
      const response = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response
      const firstError = response?.data?.errors
        ? Object.values(response.data.errors).flat()[0]
        : response?.data?.message
      setError(firstError ?? 'Failed to create shop. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required.')
      return
    }
    mutation.mutate({
      name: name.trim(),
      slug: slug.trim(),
      email: email.trim() || undefined,
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
          label="Email"
          type="email"
          placeholder="shop@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

// ---- Edit Tenant Modal ----

interface EditTenantModalProps {
  tenant: TenantWithCounts
  onClose: () => void
}

function EditTenantModal({ tenant, onClose }: EditTenantModalProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(tenant.name)
  const [email, setEmail] = useState(tenant.email ?? '')
  const [isActive, setIsActive] = useState(tenant.is_active)
  const [pointsPerDollar, setPointsPerDollar] = useState(
    String(tenant.settings?.points_per_dollar ?? 1)
  )
  const [minRedemptionPoints, setMinRedemptionPoints] = useState(
    String((tenant.settings as { min_redemption_points?: number } | undefined)?.min_redemption_points ?? 100)
  )
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (data: adminApi.UpdateTenantData) => adminApi.updateTenant(tenant.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
      onClose()
    },
    onError: (err: unknown) => {
      const response = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response
      const firstError = response?.data?.errors
        ? Object.values(response.data.errors).flat()[0]
        : response?.data?.message
      setError(firstError ?? 'Failed to update shop. Please try again.')
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
    <Modal title={`Edit: ${tenant.name}`} onClose={onClose}>
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
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
              isActive ? 'bg-brand-500' : 'bg-gray-200'
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

// ---- Main Page ----

export default function AdminTenantsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTenant, setEditingTenant] = useState<TenantWithCounts | null>(null)
  const perPage = 15

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    clearTimeout((window as unknown as { _adminTenantSearchTimeout?: ReturnType<typeof setTimeout> })._adminTenantSearchTimeout)
    ;(window as unknown as { _adminTenantSearchTimeout?: ReturnType<typeof setTimeout> })._adminTenantSearchTimeout = setTimeout(() => {
      setDebouncedSearch(value)
    }, 350)
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'tenants', { search: debouncedSearch, page, per_page: perPage }],
    queryFn: () =>
      adminApi.listTenants({ search: debouncedSearch || undefined, page, per_page: perPage }),
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] })
    },
  })

  const handleDelete = (tenant: TenantWithCounts) => {
    if (window.confirm(`Delete shop "${tenant.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(tenant.id)
    }
  }

  const tenants = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shops</h1>
          <p className="text-gray-500 text-sm mt-1">
            {meta ? `${new Intl.NumberFormat('en-US').format(meta.total)} total shops` : 'Manage all shops'}
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
        ) : tenants.length === 0 ? (
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-xs text-gray-400">ID #{tenant.id}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{tenant.slug}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {tenant.email ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                        {new Intl.NumberFormat('en-US').format(tenant.customers_count)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                        {new Intl.NumberFormat('en-US').format(tenant.users_count)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={tenant.is_active ? 'green' : 'red'}>
                          {tenant.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTenant(tenant)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(tenant)}
                            loading={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
        <CreateTenantModal onClose={() => setShowCreateModal(false)} />
      )}

      {editingTenant && (
        <EditTenantModal
          tenant={editingTenant}
          onClose={() => setEditingTenant(null)}
        />
      )}
    </div>
  )
}
