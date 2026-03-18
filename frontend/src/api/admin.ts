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
  email?: string
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

export async function listTenants(
  params?: TenantListParams
): Promise<PaginatedResponse<TenantWithCounts>> {
  const response = await apiClient.get<PaginatedResponse<TenantWithCounts>>('/admin/tenants', {
    params,
  })
  return response.data
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
  const response = await apiClient.get<PaginatedResponse<AdminCustomer>>('/admin/customers', {
    params,
  })
  return response.data
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

export type AdminUser = User & { tenant: { id: number; name: string } }

export interface CreateUserData {
  tenant_id: number
  name: string
  email: string
  password: string
  role: 'admin' | 'staff'
}

export async function listUsers(
  params?: AdminUserListParams
): Promise<PaginatedResponse<AdminUser>> {
  const response = await apiClient.get<PaginatedResponse<AdminUser>>('/admin/users', { params })
  return response.data
}

export async function createUser(data: CreateUserData): Promise<User> {
  const response = await apiClient.post<{ data: User }>('/admin/users', data)
  return response.data.data
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`)
}
