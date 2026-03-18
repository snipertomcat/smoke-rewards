import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ChevronLeft,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Award,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react'
import * as customersApi from '../api/customers'
import * as purchasesApi from '../api/purchases'
import * as transactionsApi from '../api/transactions'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

// Adjust Points Modal
const adjustSchema = z.object({
  points: z
    .number({ invalid_type_error: 'Points must be a number' })
    .int('Points must be a whole number')
    .refine((v) => v !== 0, 'Points cannot be zero'),
  type: z.enum(['manual_adjust', 'redemption']),
  notes: z.string().optional(),
})

type AdjustFormValues = z.infer<typeof adjustSchema>

interface AdjustPointsModalProps {
  customerId: number
  currentBalance: number
  onClose: () => void
  onSuccess: () => void
}

function AdjustPointsModal({
  customerId,
  currentBalance,
  onClose,
  onSuccess,
}: AdjustPointsModalProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { type: 'manual_adjust', notes: '' },
  })

  const pointsValue = watch('points')
  const typeValue = watch('type')
  const pointsNum = Number(pointsValue)

  const mutation = useMutation({
    mutationFn: (data: transactionsApi.AdjustPointsData) =>
      transactionsApi.adjust(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] })
      queryClient.invalidateQueries({ queryKey: ['transactions', customerId] })
      onSuccess()
    },
  })

  const onSubmit = async (data: AdjustFormValues) => {
    try {
      // For redemption, points should be negative
      const points = data.type === 'redemption' ? -Math.abs(data.points) : data.points
      await mutation.mutateAsync({
        points,
        type: data.type,
        notes: data.notes,
      })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to adjust points.'
      setError('points', { message })
    }
  }

  const previewBalance =
    !isNaN(pointsNum)
      ? typeValue === 'redemption'
        ? currentBalance - Math.abs(pointsNum)
        : currentBalance + pointsNum
      : currentBalance

  return (
    <Modal title="Adjust Points" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Current Balance</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(currentBalance)} pts</p>
        </div>

        <Select
          label="Adjustment Type"
          options={[
            { value: 'manual_adjust', label: 'Manual Adjustment (add/remove points)' },
            { value: 'redemption', label: 'Redemption (customer spends points)' },
          ]}
          error={errors.type?.message}
          {...register('type')}
        />

        <Input
          label={
            typeValue === 'redemption'
              ? 'Points to Redeem (positive number)'
              : 'Points to Add or Remove (use negative to deduct)'
          }
          type="number"
          placeholder={typeValue === 'redemption' ? 'e.g. 100' : 'e.g. 50 or -25'}
          error={errors.points?.message}
          {...register('points', { valueAsNumber: true })}
        />

        {!isNaN(pointsNum) && pointsNum !== 0 && (
          <div
            className={`p-3 rounded-lg text-sm font-medium ${
              previewBalance < 0
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            }`}
          >
            {previewBalance < 0 ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Resulting balance would be negative ({formatNumber(previewBalance)})
              </div>
            ) : (
              <>New balance: {formatNumber(previewBalance)} pts</>
            )}
          </div>
        )}

        <Input
          label="Notes (optional)"
          placeholder="Reason for adjustment..."
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Apply Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Record Purchase Modal
const purchaseSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be positive'),
  notes: z.string().optional(),
  purchased_at: z.string().optional(),
})

type PurchaseFormValues = z.infer<typeof purchaseSchema>

interface RecordPurchaseModalProps {
  customerId: number
  onClose: () => void
  onSuccess: () => void
}

function RecordPurchaseModal({ customerId, onClose, onSuccess }: RecordPurchaseModalProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { notes: '', purchased_at: new Date().toISOString().slice(0, 16) },
  })

  const mutation = useMutation({
    mutationFn: (data: purchasesApi.CreatePurchaseData) =>
      purchasesApi.create(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] })
      queryClient.invalidateQueries({ queryKey: ['purchases', customerId] })
      queryClient.invalidateQueries({ queryKey: ['transactions', customerId] })
      onSuccess()
    },
  })

  const onSubmit = async (data: PurchaseFormValues) => {
    try {
      const payload: purchasesApi.CreatePurchaseData = { amount: data.amount }
      if (data.notes) payload.notes = data.notes
      if (data.purchased_at) payload.purchased_at = data.purchased_at
      await mutation.mutateAsync(payload)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to record purchase.'
      setError('amount', { message })
    }
  }

  return (
    <Modal title="Record Purchase" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Purchase Amount ($)"
          type="number"
          step="0.01"
          placeholder="e.g. 45.00"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />

        <Input
          label="Purchase Date & Time (optional)"
          type="datetime-local"
          error={errors.purchased_at?.message}
          {...register('purchased_at')}
        />

        <Input
          label="Notes (optional)"
          placeholder="e.g. In-store purchase, product details..."
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Record Purchase
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Transaction type badge
function TransactionTypeBadge({ type }: { type: string }) {
  switch (type) {
    case 'purchase_earn':
      return <Badge variant="blue">Purchase Earn</Badge>
    case 'manual_adjust':
      return <Badge variant="orange">Manual Adjust</Badge>
    case 'redemption':
      return <Badge variant="red">Redemption</Badge>
    default:
      return <Badge variant="gray">{type}</Badge>
  }
}

type Tab = 'purchases' | 'transactions'

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const customerId = Number(id)

  const [activeTab, setActiveTab] = useState<Tab>('purchases')
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchasePage, setPurchasePage] = useState(1)
  const [txPage, setTxPage] = useState(1)
  const perPage = 10

  const { data: customer, isLoading: customerLoading, error: customerError } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customersApi.get(customerId),
    enabled: !isNaN(customerId),
  })

  const { data: purchasesData, isLoading: purchasesLoading } = useQuery({
    queryKey: ['purchases', customerId, purchasePage, perPage],
    queryFn: () => purchasesApi.listForCustomer(customerId, { page: purchasePage, per_page: perPage }),
    enabled: !isNaN(customerId) && activeTab === 'purchases',
  })

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['transactions', customerId, txPage, perPage],
    queryFn: () => transactionsApi.listForCustomer(customerId, { page: txPage, per_page: perPage }),
    enabled: !isNaN(customerId) && activeTab === 'transactions',
  })

  if (customerLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (customerError || !customer) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/customers')}>
          <ChevronLeft className="h-4 w-4" />
          Back to Customers
        </Button>
        <EmptyState title="Customer not found" description="This customer may have been deleted." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/customers')}>
        <ChevronLeft className="h-4 w-4" />
        Back to Customers
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {customer.first_name} {customer.last_name}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Customer #{customer.id}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowAdjustModal(true)}>
            <Award className="h-4 w-4" />
            Adjust Points
          </Button>
          <Button variant="primary" onClick={() => setShowPurchaseModal(true)}>
            <ShoppingBag className="h-4 w-4" />
            Record Purchase
          </Button>
        </div>
      </div>

      {/* Profile + Points */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customer.email && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                  </div>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{customer.phone}</p>
                  </div>
                </div>
              )}
              {customer.rfid_uid && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">RFID Card</p>
                    <p className="text-sm font-medium text-gray-900 font-mono">{customer.rfid_uid}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(customer.created_at)}
                  </p>
                </div>
              </div>
              {customer.last_visit_at && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Visit</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(customer.last_visit_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Points Balance Card */}
        <Card>
          <div className="flex flex-col items-center justify-center h-full text-center py-4">
            <div className="h-16 w-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-3">
              <Award className="h-8 w-8 text-brand-600" />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Points Balance</p>
            <p className="text-4xl font-bold text-brand-600">
              {formatNumber(customer.points_balance)}
            </p>
            <p className="text-sm text-gray-400 mt-1">points</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card padding={false}>
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'purchases'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Purchase History
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Point Transactions
          </button>
        </div>

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <>
            {purchasesLoading ? (
              <div className="flex items-center justify-center h-48">
                <Spinner />
              </div>
            ) : !purchasesData || purchasesData.data.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="h-10 w-10" />}
                title="No purchases yet"
                description="Record this customer's first purchase."
                action={
                  <Button variant="primary" onClick={() => setShowPurchaseModal(true)}>
                    <ShoppingBag className="h-4 w-4" />
                    Record Purchase
                  </Button>
                }
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points Earned
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {purchasesData.data.map((purchase) => (
                        <tr key={purchase.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDateTime(purchase.purchased_at)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            {formatCurrency(purchase.amount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-emerald-600">
                              +{formatNumber(purchase.points_earned)} pts
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {purchase.notes ?? <span className="text-gray-300">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {purchasesData.meta.last_page > 1 && (
                  <div className="border-t border-gray-100">
                    <Pagination
                      currentPage={purchasesData.meta.current_page}
                      lastPage={purchasesData.meta.last_page}
                      from={purchasesData.meta.from}
                      to={purchasesData.meta.to}
                      total={purchasesData.meta.total}
                      onPrev={() => setPurchasePage((p) => Math.max(1, p - 1))}
                      onNext={() =>
                        setPurchasePage((p) =>
                          Math.min(purchasesData.meta.last_page, p + 1)
                        )
                      }
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <>
            {txLoading ? (
              <div className="flex items-center justify-center h-48">
                <Spinner />
              </div>
            ) : !txData || txData.data.length === 0 ? (
              <EmptyState
                icon={<Award className="h-10 w-10" />}
                title="No transactions yet"
                description="Point transactions will appear here."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Points
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance After
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {txData.data.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDateTime(tx.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <TransactionTypeBadge type={tx.type} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`text-sm font-semibold ${
                                tx.points >= 0 ? 'text-emerald-600' : 'text-red-600'
                              }`}
                            >
                              {tx.points >= 0 ? '+' : ''}
                              {formatNumber(tx.points)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {formatNumber(tx.balance_after)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {tx.notes ?? <span className="text-gray-300">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {txData.meta.last_page > 1 && (
                  <div className="border-t border-gray-100">
                    <Pagination
                      currentPage={txData.meta.current_page}
                      lastPage={txData.meta.last_page}
                      from={txData.meta.from}
                      to={txData.meta.to}
                      total={txData.meta.total}
                      onPrev={() => setTxPage((p) => Math.max(1, p - 1))}
                      onNext={() =>
                        setTxPage((p) => Math.min(txData.meta.last_page, p + 1))
                      }
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Card>

      {/* Modals */}
      {showAdjustModal && (
        <AdjustPointsModal
          customerId={customerId}
          currentBalance={customer.points_balance}
          onClose={() => setShowAdjustModal(false)}
          onSuccess={() => setShowAdjustModal(false)}
        />
      )}
      {showPurchaseModal && (
        <RecordPurchaseModal
          customerId={customerId}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={() => setShowPurchaseModal(false)}
        />
      )}
    </div>
  )
}
