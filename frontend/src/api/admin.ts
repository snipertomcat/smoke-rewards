import { apiClient } from './client'
import type {
  AdminStats,
  AdminActivity,
  AdminPurchaseTrend,
  TenantWithCounts,
  Tenant,
  Customer,
  User,
  PaginatedResponse,
} from '../types'

// ---- Stats ----

export async function getStats(): Promise<AdminStats> {
  const response = await apiClient.get<{ data: AdminStats }>('/admin/stats')
  return response.data.data
}

export async function getPurchaseTrend(months = 6): Promise<AdminPurchaseTrend[]> {
  const response = await apiClient.get<{ data: AdminPurchaseTrend[] }>(
    '/admin/stats/purchase-trend',
    { params: { months } }
  )
  return response.data.data
}

export async function getTopTenants(limit = 10): Promise<TenantWithCounts[]> {
  const response = await apiClient.get<{ data: TenantWithCounts[] }>(
    '/admin/stats/top-tenants',
    { params: { limit } }
  )
  return response.data.data
}

export async function getRecentActivity(): Promise<AdminActivity[]> {
  const response = await apiClient.get<{ data: AdminActivity[] }>(
    '/admin/stats/recent-activity'
  )
  return response.data.data
}

// ---- Tenants ----

export interface TenantListParams {
  search?: string
  per_page?: number
  page?: number
}

export interface CreateTenantData {
  name: string
  slug: string
  email: string
  password: string
  settings?: {
    points_per_dollar?: number
    min_redemption_points?: number
  }
}

export interface UpdateTenantData {
  name?: string
  email?: string
  is_active?: boolean
  settings?: {
    points_per_dollar?: number
    min_redemption_points?: number
  }
}

// Normalize raw Laravel paginator (top-level fields) into PaginatedResponse shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePage<T>(raw: any): PaginatedResponse<T> {
  return {
    data: raw.data ?? [],
    meta: {
      current_page: raw.current_page ?? raw.meta?.current_page ?? 1,
      last_page:    raw.last_page    ?? raw.meta?.last_page    ?? 1,
      per_page:     raw.per_page     ?? raw.meta?.per_page     ?? 20,
      total:        raw.total        ?? raw.meta?.total        ?? 0,
      from:         raw.from         ?? raw.meta?.from         ?? null,
      to:           raw.to           ?? raw.meta?.to           ?? null,
    },
    links: {
      first: raw.first_page_url ?? raw.links?.first ?? null,
      last:  raw.last_page_url  ?? raw.links?.last  ?? null,
      prev:  raw.prev_page_url  ?? raw.links?.prev  ?? null,
      next:  raw.next_page_url  ?? raw.links?.next  ?? null,
    },
  }
}

export async function listTenants(
  params?: TenantListParams
): Promise<PaginatedResponse<TenantWithCounts>> {
  const response = await apiClient.get('/admin/tenants', { params })
  return normalizePage<TenantWithCounts>(response.data)
}

export async function createTenant(data: CreateTenantData): Promise<Tenant> {
  const response = await apiClient.post<{ data: Tenant }>('/admin/tenants', data)
  return response.data.data
}

export async function updateTenant(id: number, data: UpdateTenantData): Promise<Tenant> {
  const response = await apiClient.put<{ data: Tenant }>(`/admin/tenants/${id}`, data)
  return response.data.data
}

export async function deleteTenant(id: number): Promise<void> {
  await apiClient.delete(`/admin/tenants/${id}`)
}

// ---- Customers ----

export interface AdminCustomerListParams {
  search?: string
  tenant_id?: number
  per_page?: number
  page?: number
}

export type AdminCustomer = Customer & { tenant: { id: number; name: string } }

export async function listAllCustomers(
  params?: AdminCustomerListParams
): Promise<PaginatedResponse<AdminCustomer>> {
  const response = await apiClient.get('/admin/customers', { params })
  return normalizePage<AdminCustomer>(response.data)
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiClient.delete(`/admin/customers/${id}`)
}

// ---- Users ----

export interface AdminUserListParams {
  search?: string
  tenant_id?: number
  per_page?: number
  page?: number
}

export type AdminUser = User & {
  tenant: { id: number; name: string } | null
  created_at: string
}

export interface CreateUserData {
  tenant_id: number
  name: string
  email: string
  password: string
  role: 'admin' | 'staff' | 'salesman'
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
}

export async function listUsers(
  params?: AdminUserListParams
): Promise<PaginatedResponse<AdminUser>> {
  const response = await apiClient.get('/admin/users', { params })
  return normalizePage<AdminUser>(response.data)
}

export async function createUser(data: CreateUserData): Promise<User> {
  const response = await apiClient.post<{ data: User }>('/admin/users', data)
  return response.data.data
}

export async function updateUser(id: number, data: UpdateUserData): Promise<AdminUser> {
  const response = await apiClient.put<{ data: AdminUser }>(`/admin/users/${id}`, data)
  return response.data.data
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`)
}
