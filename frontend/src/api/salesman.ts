import { apiClient } from './client'
import type {
  AdminStats,
  AdminPurchaseTrend,
  TenantWithCounts,
  Customer,
  PaginatedResponse,
  ShopStats,
} from '../types'

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

// ---- Stats ----

export async function getStats(): Promise<AdminStats> {
  const r = await apiClient.get<{ data: AdminStats }>('/salesman/stats')
  return r.data.data
}

export async function getPurchaseTrend(months = 6): Promise<AdminPurchaseTrend[]> {
  const r = await apiClient.get<{ data: AdminPurchaseTrend[] }>('/salesman/stats/purchase-trend', { params: { months } })
  return r.data.data
}

export async function getTopShops(limit = 10): Promise<TenantWithCounts[]> {
  const r = await apiClient.get<{ data: TenantWithCounts[] }>('/salesman/stats/top-shops', { params: { limit } })
  return r.data.data
}

export async function getShopStats(id: number): Promise<ShopStats> {
  const r = await apiClient.get<{ data: ShopStats }>(`/salesman/shops/${id}/stats`)
  return r.data.data
}

// ---- Shops ----

export interface ShopListParams {
  search?: string
  per_page?: number
  page?: number
}

export interface CreateShopData {
  name: string
  slug: string
  email: string
  password: string
  settings?: {
    points_per_dollar?: number
    min_redemption_points?: number
  }
}

export interface UpdateShopData {
  name?: string
  email?: string
  is_active?: boolean
  settings?: {
    points_per_dollar?: number
    min_redemption_points?: number
  }
}

export async function listShops(params?: ShopListParams): Promise<PaginatedResponse<TenantWithCounts>> {
  const r = await apiClient.get('/salesman/shops', { params })
  return normalizePage<TenantWithCounts>(r.data)
}

export async function createShop(data: CreateShopData): Promise<TenantWithCounts> {
  const r = await apiClient.post<{ data: TenantWithCounts }>('/salesman/shops', data)
  return r.data.data
}

export async function getShop(id: number): Promise<TenantWithCounts> {
  const r = await apiClient.get<{ data: TenantWithCounts }>(`/salesman/shops/${id}`)
  return r.data.data
}

export async function updateShop(id: number, data: UpdateShopData): Promise<TenantWithCounts> {
  const r = await apiClient.put<{ data: TenantWithCounts }>(`/salesman/shops/${id}`, data)
  return r.data.data
}

export async function deleteShop(id: number): Promise<void> {
  await apiClient.delete(`/salesman/shops/${id}`)
}

export async function updateShopPassword(id: number, password: string, passwordConfirmation: string): Promise<void> {
  await apiClient.put(`/salesman/shops/${id}/password`, {
    password,
    password_confirmation: passwordConfirmation,
  })
}

// ---- Customers (read-only) ----

export type SalesmanCustomer = Customer & { tenant: { id: number; name: string } }

export interface CustomerListParams {
  search?: string
  tenant_id?: number
  per_page?: number
  page?: number
}

export async function listCustomers(params?: CustomerListParams): Promise<PaginatedResponse<SalesmanCustomer>> {
  const r = await apiClient.get('/salesman/customers', { params })
  return normalizePage<SalesmanCustomer>(r.data)
}

export async function getCustomer(id: number): Promise<SalesmanCustomer> {
  const r = await apiClient.get<{ data: SalesmanCustomer }>(`/salesman/customers/${id}`)
  return r.data.data
}
