import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function useBranding() {
  const { user } = useAuth()

  useEffect(() => {
    const tenant = user?.tenant

    // ── Title ──────────────────────────────────────────────────────────────
    document.title = tenant?.name ? `${tenant.name} | Smoke Rewards` : 'Smoke Rewards'

    // ── Favicon ────────────────────────────────────────────────────────────
    const href = tenant?.logo_url ?? '/favicon.svg'
    const link = document.getElementById('app-favicon') as HTMLLinkElement | null
    if (link) {
      link.href = href
      // Browsers cache favicons aggressively; append a cache-bust when it's
      // a custom uploaded URL so changes take effect immediately.
      if (tenant?.logo_url) {
        link.href = `${tenant.logo_url}?v=${Date.now()}`
      }
    }
  }, [user?.tenant?.name, user?.tenant?.logo_url])
}
