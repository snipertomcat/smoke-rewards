import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2, Users } from 'lucide-react'
import * as adminApi from '../../api/admin'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

export default function AdminCustomersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [tenantId, setTenantId] = useState<string>('')
  const [page, setPage] = useState(1)
  const perPage = 15

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    clearTimeout((window as unknown as { _adminCustSearchTimeout?: ReturnType<typeof setTimeout> })._adminCustSearchTimeout)
    ;(window as unknown as { _adminCustSearchTimeout?: ReturnType<typeof setTimeout> })._adminCustSearchTimeout = setTimeout(() => {
      setDebouncedSearch(value)
    }, 350)
  }

  // Load tenant list for the shop filter
  const { data: tenantsData } = useQuery({
    queryKey: ['admin', 'tenants', 'all'],
    queryFn: () => adminApi.listTenants({ per_page: 100 }),
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'customers', { search: debouncedSearch, tenant_id: tenantId, page, per_page: perPage }],
    queryFn: () =>
      adminApi.listAllCustomers({
        search: debouncedSearch || undefined,
        tenant_id: tenantId ? parseInt(tenantId) : undefined,
        page,
        per_page: perPage,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
    },
  })

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Delete customer "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  const customers = data?.data ?? []
  const meta = data?.meta
  const tenants = tenantsData?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Customers</h1>
          <p className="text-gray-500 text-sm mt-1">
            {meta ? `${new Intl.NumberFormat('en-US').format(meta.total)} total customers` : 'All customers across all shops'}
          </p>
        </div>
      </div>

      <Card padding={false}>
        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100 flex gap-3 flex-col sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={tenantId}
              onChange={(e) => {
                setTenantId(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">All Shops</option>
              {tenants.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <EmptyState title="Failed to load customers" description="Please refresh the page." />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No customers found"
            description={debouncedSearch || tenantId ? 'Try adjusting your filters.' : 'No customers registered yet.'}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {customer.tenant.name}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-brand-600 text-right">
                          {formatNumber(customer.points_balance)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(customer.last_visit_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(customer.id, displayName)}
                            loading={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
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
    </div>
  )
}
