import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Trash2, UserCog } from 'lucide-react'
import * as adminApi from '../../api/admin'
import type { AdminUser } from '../../api/admin'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ─── Create User Modal ────────────────────────────────────────────────────────

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [tenantId, setTenantId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'staff'>('staff')
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: tenantsData } = useQuery({
    queryKey: ['admin', 'tenants', 'dropdown'],
    queryFn: () => adminApi.listTenants({ per_page: 100 }),
  })
  const tenants = tenantsData?.data ?? []

  const mutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      onClose()
    },
    onError: (err: unknown) => {
      const resp = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response
      const msg = resp?.data?.errors
        ? Object.values(resp.data.errors).flat()[0]
        : resp?.data?.message
      setServerError(msg ?? 'Failed to create user.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    if (!tenantId || !name.trim() || !email.trim() || !password) {
      setServerError('All fields are required.')
      return
    }
    mutation.mutate({ tenant_id: parseInt(tenantId), name: name.trim(), email: email.trim(), password, role })
  }

  return (
    <Modal title="New User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{serverError}</div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Shop *</label>
          <select
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          >
            <option value="" disabled>Select a shop...</option>
            {tenants.map((t) => (
              <option key={t.id} value={String(t.id)}>{t.name}</option>
            ))}
          </select>
        </div>

        <Input label="Name *" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email *" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password *" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Role *</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'staff')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={mutation.isPending}>Create User</Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterTenantId, setFilterTenantId] = useState('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const perPage = 15

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
    clearTimeout((window as unknown as { _uSearch?: ReturnType<typeof setTimeout> })._uSearch)
    ;(window as unknown as { _uSearch?: ReturnType<typeof setTimeout> })._uSearch = setTimeout(() => setDebouncedSearch(val), 350)
  }

  const { data: tenantsData } = useQuery({
    queryKey: ['admin', 'tenants', 'dropdown'],
    queryFn: () => adminApi.listTenants({ per_page: 100 }),
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', { search: debouncedSearch, tenant_id: filterTenantId, page, perPage }],
    queryFn: () => adminApi.listUsers({
      search: debouncedSearch || undefined,
      tenant_id: filterTenantId ? parseInt(filterTenantId) : undefined,
      page,
      per_page: perPage,
    }),
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const handleDelete = (user: AdminUser) => {
    if (window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(user.id)
    }
  }

  const users = data?.data ?? []
  const meta = data?.meta
  const tenants = tenantsData?.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">
            {meta ? `${new Intl.NumberFormat('en-US').format(meta.total)} total users` : 'All shop users'}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New User
        </Button>
      </div>

      <Card padding={false}>
        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <select
            value={filterTenantId}
            onChange={(e) => { setFilterTenantId(e.target.value); setPage(1) }}
            className="sm:w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Shops</option>
            {tenants.map((t) => (
              <option key={t.id} value={String(t.id)}>{t.name}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div>
        ) : error ? (
          <EmptyState title="Failed to load users" description="Please refresh the page." />
        ) : users.length === 0 ? (
          <EmptyState
            icon={<UserCog className="h-12 w-12" />}
            title="No users found"
            description={debouncedSearch || filterTenantId ? 'Try adjusting your filters.' : 'No users yet.'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">ID #{user.id}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.tenant?.name ?? <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === 'admin' ? 'blue' : 'gray'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {user.created_at ? formatDate(user.created_at) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          loading={deleteMutation.isPending && deleteMutation.variables === user.id}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
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

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
