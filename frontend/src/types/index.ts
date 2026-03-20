export interface Tenant {
  id: number
  name: string
  slug: string
  logo_url?: string | null
  settings?: {
    points_per_dollar?: number
    [key: string]: unknown
  }
}

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'staff' | 'super_admin' | string
  tenant: Tenant
}

export interface Customer {
  id: number
  tenant_id: number
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  rfid_uid: string | null
  points_balance: number
  last_visit_at: string | null
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: number
  tenant_id: number
  customer_id: number
  recorded_by: number
  amount: number
  points_earned: number
  notes: string | null
  purchased_at: string
  created_at: string
}

export interface PointTransaction {
  id: number
  tenant_id: number
  customer_id: number
  recorded_by: number | { id: number; name: string }
  points: number
  balance_after: number
  type: 'purchase_earn' | 'manual_adjust' | 'redemption'
  notes: string | null
  created_at: string
  customer?: { id: number; first_name: string | null; last_name: string | null }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

export interface Statistics {
  total_customers: number
  total_points_issued: number
  total_points_outstanding: number
  purchases_this_month: number
  revenue_this_month: number
}

export interface TopCustomer {
  id: number
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  points_balance: number
  total_spent?: number
}

export interface PurchaseTrend {
  month: string
  purchase_count: number
  revenue: number
}

export interface AdminStats {
  total_tenants: number
  active_tenants: number
  total_customers: number
  total_users: number
  total_purchases: number
  total_revenue: string
  total_points_issued: number
  total_points_outstanding: number
  purchases_this_month: number
  revenue_this_month: string
}

export interface TenantWithCounts extends Tenant {
  customers_count: number
  users_count: number
  is_active: boolean
  email: string | null
  purchases_sum_amount: string | null
}

export interface AdminActivity {
  id: number
  tenant_id: number
  customer_id: number
  amount: string
  points_earned: number
  purchased_at: string
  customer: { first_name: string | null; last_name: string | null }
  tenant: { name: string }
}

export interface AdminPurchaseTrend {
  month: string
  count: number
  revenue: string
}
