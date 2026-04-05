import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useBranding } from './hooks/useBranding'
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'
import SalesmanLayout from './components/layout/SalesmanLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CustomersPage from './pages/CustomersPage'
import CustomerDetailPage from './pages/CustomerDetailPage'
import SettingsPage from './pages/SettingsPage'
import TransactionHistoryPage from './pages/TransactionHistoryPage'
import StaffPage from './pages/StaffPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminTenantsPage from './pages/admin/AdminTenantsPage'
import AdminCustomersPage from './pages/admin/AdminCustomersPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import SalesmanDashboardPage from './pages/salesman/SalesmanDashboardPage'
import SalesmanShopsPage from './pages/salesman/SalesmanShopsPage'
import SalesmanShopDetailPage from './pages/salesman/SalesmanShopDetailPage'
import SalesmanCustomersPage from './pages/salesman/SalesmanCustomersPage'
import SalesmanBillingPage from './pages/salesman/SalesmanBillingPage'
import AdminBillingPage from './pages/admin/AdminBillingPage'
import SalesPage from './pages/SalesPage'
import Spinner from './components/ui/Spinner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  if (user.role === 'super_admin') return <Navigate to="/admin" replace />
  if (user.role === 'salesman') return <Navigate to="/salesman" replace />

  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (user.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />
  }

  if (window.location.pathname == "/") {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function SalesmanRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (user.role !== 'salesman') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default function App() {
  const { user, isLoading } = useAuth()
  useBranding()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public homepage */}
      <Route
        path="/"
        element={
          user
            ? user.role === 'super_admin'
              ? <Navigate to="/admin" replace />
              : user.role === 'salesman'
              ? <Navigate to="/salesman" replace />
              : <Navigate to="/dashboard" replace />
            : <LoginPage />
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          user
            ? user.role === 'super_admin'
              ? <Navigate to="/admin" replace />
              : user.role === 'salesman'
              ? <Navigate to="/salesman" replace />
              : <Navigate to="/dashboard" replace />
            : <LoginPage />
        }
      />

      {/* Salesman routes */}
      <Route
        path="/salesman"
        element={
          <SalesmanRoute>
            <SalesmanLayout />
          </SalesmanRoute>
        }
      >
        <Route index element={<SalesmanDashboardPage />} />
        <Route path="shops" element={<SalesmanShopsPage />} />
        <Route path="shops/:id" element={<SalesmanShopDetailPage />} />
        <Route path="customers" element={<SalesmanCustomersPage />} />
        <Route path="billing" element={<SalesmanBillingPage />} />
      </Route>

      {/* Protected app routes */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/transactions" element={<TransactionHistoryPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="tenants" element={<AdminTenantsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="billing" element={<AdminBillingPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
