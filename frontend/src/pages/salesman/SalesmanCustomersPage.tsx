import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Users } from 'lucide-react'
import * as salesmanApi from '../../api/salesman'
import Card from '../../components/ui/Card'
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

export default function SalesmanCustomersPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [tenantId, setTenantId] = useState<string>('')
  const [page, setPage] = useState(1)
  const perPage = 15

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    clearTimeout((window as unknown as { _salesmanCustSearchTimeout?: ReturnType<typeof setTimeout> })._salesmanCustSearchTimeout)
    ;(window as unknown as { _salesmanCustSearchTimeout?: ReturnType<typeof setTimeout> })._salesmanCustSearchTimeout = setTimeout(() => {
      setDebouncedSearch(value)
    }, 350)
  }

  // Load shops for the filter dropdown
  const { data: shopsData } = useQuery({
    queryKey: ['salesman', 'shops', 'all'],
    queryFn: () => salesmanApi.listShops({ per_page: 100 }),
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['salesman', 'customers', { search: debouncedSearch, tenant_id: tenantId, page, per_page: perPage }],
    queryFn: () =>
      salesmanApi.listCustomers({
        search: debouncedSearch || undefined,
        tenant_id: tenantId ? parseInt(tenantId) : undefined,
        page,
        per_page: perPage,
      }),
  })

  const customers = data?.data ?? []
  const meta = data?.meta
  const shops = shopsData?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">
            {meta
              ? `${new Intl.NumberFormat('en-US').format(meta.total)} total customers`
              : 'Read-only view across all shops'}
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Shops</option>
              {shops.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
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
                          {customer.tenant.name}
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
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(customer.created_at)}
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
