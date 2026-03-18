import { apiClient } from './client'
import type { Purchase, PaginatedResponse } from '../types'

export interface PurchaseListParams {
  per_page?: number
  page?: number
}

export interface CreatePurchaseData {
  amount: number
  notes?: string
  purchased_at?: string
}

export async function listForCustomer(
  customerId: number,
  params?: PurchaseListParams
): Promise<PaginatedResponse<Purchase>> {
  const response = await apiClient.get<PaginatedResponse<Purchase>>(
    `/customers/${customerId}/purchases`,
    { params }
  )
  return response.data
}

export async function create(
  customerId: number,
  data: CreatePurchaseData
): Promise<Purchase> {
  const response = await apiClient.post<{ data: Purchase } | Purchase>(
    `/customers/${customerId}/purchases`,
    data
  )
  const result = response.data
  if (result && typeof result === 'object' && 'data' in result && !('id' in result)) {
    return (result as { data: Purchase }).data
  }
  return result as Purchase
}
