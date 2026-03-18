import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, History } from 'lucide-react'
import * as transactionsApi from '../api/transactions'
import type { PointTransaction } from '../types'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import Pagination from '../components/ui/Pagination'
import EmptyState from '../components/ui/EmptyState'

type TransactionType = 'all' | 'purchase_earn' | 'manual_adjust' | 'redemption'

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'purchase_earn', label: 'Purchase Earn' },
  { value: 'manual_adjust', label: 'Manual Adjustment' },
  { value: 'redemption', label: 'Redemption' },
]

function typeBadge(type: PointTransaction['type']) {
  switch (type) {
    case 'purchase_earn':  return <Badge variant="green">Purchase</Badge>
    case 'manual_adjust':  return <Badge variant="blue">Adjustment</Badge>
    case 'redemption':     return <Badge variant="red">Redemption</Badge>
  }
}

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function customerName(tx: PointTransaction) {
  const c = tx.customer
  if (!c) return `Customer #${tx.customer_id}`
  const name = [c.first_name, c.last_name].filter(Boolean).join(' ')
  return name || `Customer #${tx.customer_id}`
}

export default function TransactionHistoryPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [type, setType] = useState<TransactionType>('all')
  const [page, setPage] = useState(1)
  const perPage = 25

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
    clearTimeout((window as unknown as { _txSearch?: ReturnType<typeof setTimeout> })._txSearch)
    ;(window as unknown as { _txSearch?: ReturnType<typeof setTimeout> })._txSearch = setTimeout(() => {
      setDebouncedSearch(value)
    }, 350)
  }

  const handleTypeChange = (value: TransactionType) => {
    setType(value)
    setPage(1)
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', { search: debouncedSearch, type, page, perPage }],
    queryFn: () => transactionsApi.listForTenant({
      search: debouncedSearch || undefined,
      type: type === 'all' ? undefined : type,
      page,
      per_page: perPage,
    }),
  })

  const transactions = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-500 text-sm mt-1">
          {meta
            ? `${new Intl.NumberFormat('en-US').format(meta.total)} total transactions`
            : 'All point transactions for your store'}
        </p>
      </div>

      <Card padding={false}>
        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by customer name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <EmptyState title="Failed to load transactions" description="Please refresh the page." />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<History className="h-12 w-12" />}
            title="No transactions found"
            description={debouncedSearch || type !== 'all' ? 'Try adjusting your filters.' : 'Transactions will appear here once customers earn or spend points.'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance After</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <Link
                          to={`/customers/${tx.customer_id}`}
                          className="text-brand-600 hover:text-brand-700 hover:underline"
                        >
                          {customerName(tx)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{typeBadge(tx.type)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-right whitespace-nowrap">
                        <span className={tx.points >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {tx.points >= 0 ? '+' : ''}{new Intl.NumberFormat('en-US').format(tx.points)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right whitespace-nowrap">
                        {new Intl.NumberFormat('en-US').format(tx.balance_after)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                        {tx.notes ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {typeof tx.recorded_by === 'object' ? tx.recorded_by.name : '—'}
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
    </div>
  )
}
