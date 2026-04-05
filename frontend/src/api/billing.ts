import { apiClient } from './client'
import type { BillingStats, BillingTransaction, PaginatedResponse, Subscription } from '../types'

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

// ---- Salesman Billing ----

export async function getSalesmanBillingStats(): Promise<BillingStats> {
  const r = await apiClient.get<{ data: BillingStats }>('/salesman/billing/stats')
  return r.data.data
}

export interface SubscriptionListParams {
  tenant_id?: number
  status?: string
  per_page?: number
  page?: number
}

export async function listSalesmanSubscriptions(
  params?: SubscriptionListParams
): Promise<PaginatedResponse<Subscription>> {
  const r = await apiClient.get('/salesman/billing/subscriptions', { params })
  return normalizePage<Subscription>(r.data)
}

export interface CreateSubscriptionData {
  tenant_id: number
  plan_name: string
  amount: number
  payment_method_id: string
}

export interface CreateSubscriptionResponse {
  data: Subscription
  client_secret: string | null
}

export async function createSubscription(
  data: CreateSubscriptionData
): Promise<CreateSubscriptionResponse> {
  const r = await apiClient.post<CreateSubscriptionResponse>('/salesman/billing/subscriptions', data)
  return r.data
}

export async function confirmSubscriptionPayment(id: number): Promise<Subscription> {
  const r = await apiClient.post<{ data: Subscription }>(`/salesman/billing/subscriptions/${id}/confirm`)
  return r.data.data
}

export async function cancelSubscription(id: number): Promise<Subscription> {
  const r = await apiClient.post<{ data: Subscription }>(`/salesman/billing/subscriptions/${id}/cancel`)
  return r.data.data
}

export interface TransactionListParams {
  tenant_id?: number
  status?: string
  per_page?: number
  page?: number
}

export async function listSalesmanTransactions(
  params?: TransactionListParams
): Promise<PaginatedResponse<BillingTransaction>> {
  const r = await apiClient.get('/salesman/billing/transactions', { params })
  return normalizePage<BillingTransaction>(r.data)
}

// ---- Admin Billing ----

export async function getAdminBillingStats(): Promise<BillingStats> {
  const r = await apiClient.get<{ data: BillingStats }>('/admin/billing/stats')
  return r.data.data
}

export async function listAdminSubscriptions(
  params?: SubscriptionListParams & { search?: string }
): Promise<PaginatedResponse<Subscription>> {
  const r = await apiClient.get('/admin/billing/subscriptions', { params })
  return normalizePage<Subscription>(r.data)
}

export async function listAdminTransactions(
  params?: TransactionListParams & { search?: string }
): Promise<PaginatedResponse<BillingTransaction>> {
  const r = await apiClient.get('/admin/billing/transactions', { params })
  return normalizePage<BillingTransaction>(r.data)
}
