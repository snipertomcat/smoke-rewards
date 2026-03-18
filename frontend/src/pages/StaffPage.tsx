import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  UserPlus, Pencil, Trash2, Users, ShoppingBag,
  DollarSign, UserCheck, TrendingUp, Search,
} from 'lucide-react'
import * as staffApi from '../api/staff'
import type { StaffMember } from '../api/staff'
import { useAuth } from '../contexts/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import Pagination from '../components/ui/Pagination'
import EmptyState from '../components/ui/EmptyState'

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) { return new Intl.NumberFormat('en-US').format(n) }
function fmtCurrency(v: string) {
  return `$${parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtDate(str: string | null) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── schemas ─────────────────────────────────────────────────────────────────

const createSchema = z.object({
  name:     z.string().min(1, 'Name is required'),
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role:     z.enum(['admin', 'staff']),
})

const editSchema = z.object({
  name:     z.string().min(1, 'Name is required'),
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').or(z.literal('')).optional(),
  role:     z.enum(['admin', 'staff']),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues   = z.infer<typeof editSchema>

// ─── CreateStaffModal ────────────────────────────────────────────────────────

function CreateStaffModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: 'staff' },
  })

  const mutation = useMutation({
    mutationFn: staffApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      onClose()
    },
  })

  const onSubmit = async (data: CreateFormValues) => {
    setServerError(null)
    try {
      await mutation.mutateAsync(data)
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response
      const msg = resp?.data?.errors ? Object.values(resp.data.errors).flat()[0] : resp?.data?.message
      setServerError(msg ?? 'Failed to create staff member.')
    }
  }

  return (
    <Modal title="Add Staff Member" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{serverError}</div>
        )}
        <Input label="Full Name" placeholder="Jane Smith" error={errors.name?.message} {...register('name')} />
        <Input label="Email Address" type="email" placeholder="jane@shop.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="Min. 8 characters" error={errors.password?.message} {...register('password')} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register('role')}
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <p className="text-xs text-red-600">{errors.role.message}</p>}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>Add Staff Member</Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── EditStaffModal ───────────────────────────────────────────────────────────

function EditStaffModal({ member, onClose }: { member: StaffMember; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: member.name, email: member.email, password: '', role: member.role },
  })

  const mutation = useMutation({
    mutationFn: (data: EditFormValues) => {
      const payload: staffApi.UpdateStaffData = { name: data.name, email: data.email, role: data.role }
      if (data.password) payload.password = data.password
      return staffApi.update(member.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      onClose()
    },
  })

  const onSubmit = async (data: EditFormValues) => {
    setServerError(null)
    try {
      await mutation.mutateAsync(data)
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response
      const msg = resp?.data?.errors ? Object.values(resp.data.errors).flat()[0] : resp?.data?.message
      setServerError(msg ?? 'Failed to update staff member.')
    }
  }

  return (
    <Modal title="Edit Staff Member" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{serverError}</div>
        )}
        <Input label="Full Name" error={errors.name?.message} {...register('name')} />
        <Input label="Email Address" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="New Password" type="password" placeholder="Leave blank to keep current" error={errors.password?.message} {...register('password')} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            {...register('role')}
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── StaffStatsSection ───────────────────────────────────────────────────────

function StaffStatsSection() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['staff', 'stats'],
    queryFn: staffApi.getStats,
  })

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="lg" /></div>
  if (!stats?.length) return null

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Staff Performance</h2>
      <div className="grid grid-cols-1 gap-4">
        {stats.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-500">{s.email}</p>
              </div>
              <Badge variant={s.role === 'admin' ? 'blue' : 'gray'} className="capitalize">{s.role}</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-brand-50 shrink-0">
                  <UserCheck className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{fmt(s.customers_registered)}</p>
                  <p className="text-xs text-gray-500">Customers Registered</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-50 shrink-0">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{fmt(s.purchases_recorded)}</p>
                  <p className="text-xs text-gray-500">Purchases Recorded</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50 shrink-0">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{fmtCurrency(s.revenue_recorded)}</p>
                  <p className="text-xs text-gray-500">Revenue Recorded</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-50 shrink-0">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{fmt(s.adjustments_recorded)}</p>
                  <p className="text-xs text-gray-500">Point Adjustments</p>
                </div>
              </div>
            </div>
            {s.last_sale_at && (
              <p className="mt-3 text-xs text-gray-400">Last sale: {fmtDate(s.last_sale_at)}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── StaffPage ───────────────────────────────────────────────────────────────

export default function StaffPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const perPage = 20

  const isAdmin = user?.role === 'admin'

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
    clearTimeout((window as unknown as { _staffSearch?: ReturnType<typeof setTimeout> })._staffSearch)
    ;(window as unknown as { _staffSearch?: ReturnType<typeof setTimeout> })._staffSearch = setTimeout(() => {
      setDebouncedSearch(value)
    }, 350)
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['staff', 'list', { search: debouncedSearch, page, perPage }],
    queryFn: () => staffApi.list({ search: debouncedSearch || undefined, page, per_page: perPage }),
  })

  const deleteMutation = useMutation({
    mutationFn: staffApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
  })

  const handleDelete = async (member: StaffMember) => {
    if (!window.confirm(`Remove ${member.name} from your team? This cannot be undone.`)) return
    await deleteMutation.mutateAsync(member.id)
  }

  const members = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-500 text-sm mt-1">
            {meta ? `${fmt(meta.total)} team member${meta.total !== 1 ? 's' : ''}` : 'Manage your team'}
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <UserPlus className="h-4 w-4" />
            Add Staff Member
          </Button>
        )}
      </div>

      {/* Staff list */}
      <Card padding={false}>
        <div className="px-4 py-3 border-b border-gray-100">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40"><Spinner size="lg" /></div>
        ) : error ? (
          <EmptyState title="Failed to load staff" description="Please refresh the page." />
        ) : members.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No staff members found"
            description={debouncedSearch ? 'Try a different search term.' : 'Add your first team member to get started.'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</th>
                    {isAdmin && (
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{m.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={m.role === 'admin' ? 'blue' : 'gray'} className="capitalize">{m.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(m.created_at)}</td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditing(m)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(m)}
                              loading={deleteMutation.isPending && deleteMutation.variables === m.id}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </td>
                      )}
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

      {/* Per-staff stats (admin only) */}
      {isAdmin && <StaffStatsSection />}

      {/* Modals */}
      {showCreate && <CreateStaffModal onClose={() => setShowCreate(false)} />}
      {editing && <EditStaffModal member={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
