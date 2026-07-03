import { useAuthStore } from '../stores/auth'

export const dashboardRouteFor = (role) => {
  if (role === 'manager') return { name: 'manager-dashboard' }
  if (role === 'employee') return { name: 'employee-dashboard' }
  return { name: 'landing' }
}

export async function authGuard(to, from, next) {
  const auth = useAuthStore()

  if (!auth.initialized && typeof auth.restoreSession === 'function') {
    await auth.restoreSession()
  }

  const isAuthenticated = Boolean(auth.isAuthenticated)
  const userRole = auth.user?.role || auth.role
  const isGuestOnlyRoute = Boolean(to.meta.guestOnly)
  const requiresAuth = Boolean(to.meta.requiresAuth)
  const allowedRoles = Array.isArray(to.meta.roles) ? to.meta.roles : null

  if (isGuestOnlyRoute && isAuthenticated) {
    next(dashboardRouteFor(userRole))
    return
  }

  if (requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (allowedRoles && isAuthenticated && !allowedRoles.includes(userRole)) {
    next({ name: 'unauthorized' })
    return
  }

  next()
}
