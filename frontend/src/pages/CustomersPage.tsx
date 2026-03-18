import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Plus, Eye, UserPlus, CreditCard } from 'lucide-react'
import * as customersApi from '../api/customers'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
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

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

// Register Customer Schema — only email OR phone required; all other fields optional
const registerSchema = z
  .object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email('Enter a valid email address').or(z.literal('')).optional(),
    phone: z.string().optional(),
    rfid_uid: z.string().optional(),
  })
  .refine((data) => (data.email && data.email !== '') || (data.phone && data.phone !== ''), {
    message: 'At least an email address or phone number is required.',
    path: ['contact'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterCustomerModalProps {
  onClose: () => void
  onSuccess: () => void
}

function RegisterCustomerModal({ onClose, onSuccess }: RegisterCustomerModalProps) {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { first_name: '', last_name: '', email: '', phone: '', rfid_uid: '' },
  })

  const mutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      onSuccess()
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null)
    try {
      const payload: customersApi.CreateCustomerData = {}
      if (data.first_name) payload.first_name = data.first_name
      if (data.last_name) payload.last_name = data.last_name
      if (data.email) payload.email = data.email
      if (data.phone) payload.phone = data.phone
      if (data.rfid_uid) payload.rfid_uid = data.rfid_uid
      await mutation.mutateAsync(payload)
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response
      const firstApiError = response?.data?.errors
        ? Object.values(response.data.errors).flat()[0]
        : response?.data?.message
      setServerError(firstApiError ?? 'Failed to register customer. Please try again.')
    }
  }

  // contact-level error from the zod refine
  const contactError = (errors as { contact?: { message?: string } }).contact?.message

  return (
    <Modal title="Register New Customer" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            error={errors.first_name?.message}
            {...register('first_name')}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            error={errors.last_name?.message}
            {...register('last_name')}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 555 000 0000"
          error={errors.phone?.message}
          {...register('phone')}
        />

        {contactError && (
          <p className="text-xs text-red-600 -mt-2">{contactError}</p>
        )}

        <Input
          label="RFID Card UID"
          placeholder="e.g. A1B2C3D4 (optional)"
          icon={<CreditCard className="h-4 w-4" />}
          error={errors.rfid_uid?.message}
          {...register('rfid_uid')}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Register Customer
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function CustomersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const perPage = 15

  // Simple debounce via a timeout ref
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    clearTimeout((window as unknown as { _searchTimeout?: ReturnType<typeof setTimeout> })._searchTimeout)
    ;(window as unknown as { _searchTimeout?: ReturnType<typeof setTimeout> })._searchTimeout = setTimeout(() => {
      setDebouncedSearch(value)
    }, 350)
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', { search: debouncedSearch, page, per_page: perPage }],
    queryFn: () =>
      customersApi.list({ search: debouncedSearch || undefined, page, per_page: perPage }),
  })

  const customers = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">
            {meta ? `${new Intl.NumberFormat('en-US').format(meta.total)} total customers` : 'Manage your loyalty members'}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowRegisterModal(true)}
        >
          <Plus className="h-4 w-4" />
          Register Customer
        </Button>
      </div>

      <Card padding={false}>
        {/* Search bar */}
        <div className="px-4 py-3 border-b border-gray-100">
          <Input
            placeholder="Search by name, email, phone, or RFID..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <EmptyState title="Failed to load customers" description="Please refresh the page." />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<UserPlus className="h-12 w-12" />}
            title="No customers found"
            description={debouncedSearch ? 'Try a different search term.' : 'Register your first customer to get started.'}
            action={
              !debouncedSearch ? (
                <Button variant="primary" onClick={() => setShowRegisterModal(true)}>
                  <Plus className="h-4 w-4" />
                  Register Customer
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RFID
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {customer.first_name} {customer.last_name}
                        </p>
                        <p className="text-xs text-gray-400">ID #{customer.id}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {customer.email ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {customer.phone ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {customer.rfid_uid ?? <span className="text-gray-300 font-sans">—</span>}
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
                          onClick={() => navigate(`/customers/${customer.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          View
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

      {showRegisterModal && (
        <RegisterCustomerModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  )
}
