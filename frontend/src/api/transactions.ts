import { apiClient } from './client'
import type { PointTransaction, PaginatedResponse } from '../types'

export interface TransactionListParams {
  per_page?: number
  page?: number
  type?: string
  search?: string
}

export interface AdjustPointsData {
  points: number
  type: 'manual_adjust' | 'redemption'
  notes?: string
}

export async function listForTenant(
  params?: TransactionListParams
): Promise<PaginatedResponse<PointTransaction>> {
  const response = await apiClient.get<PaginatedResponse<PointTransaction>>(
    '/transactions',
    { params }
  )
  return response.data
}

export async function listForCustomer(
  customerId: number,
  params?: TransactionListParams
): Promise<PaginatedResponse<PointTransaction>> {
  const response = await apiClient.get<PaginatedResponse<PointTransaction>>(
    `/customers/${customerId}/transactions`,
    { params }
  )
  return response.data
}

export async function adjust(
  customerId: number,
  data: AdjustPointsData
): Promise<PointTransaction> {
  const response = await apiClient.post<{ data: PointTransaction } | PointTransaction>(
    `/customers/${customerId}/points/adjust`,
    data
  )
  const result = response.data
  if (result && typeof result === 'object' && 'data' in result && !('id' in result)) {
    return (result as { data: PointTransaction }).data
  }
  return result as PointTransaction
}
