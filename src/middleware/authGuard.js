import { useAuthStore } from '../stores/auth'

export const dashboardRouteFor = (role) => {
  if (role === 'manager') return { name: 'manager-dashboard' }
  if (role === 'employee') return { name: 'employee-dashboard' }
  return { name: 'landing' }
}

export async function authGuard(to) {
  const auth = useAuthStore()

  if (!auth.initialized && typeof auth.restoreSession === 'function') {
    await auth.restoreSession()
  }

  const isAuthenticated = Boolean(auth.isAuthenticated)
  let userRole = auth.user?.role || auth.role

  if (isAuthenticated && !userRole && typeof auth.restoreSession === 'function') {
    await auth.restoreSession()
    userRole = auth.user?.role || auth.role
  }

  const isGuestOnlyRoute = Boolean(to.meta.guestOnly)
  const requiresAuth = Boolean(to.meta.requiresAuth)
  const allowedRoles = Array.isArray(to.meta.roles) ? to.meta.roles : null

  if (isGuestOnlyRoute && isAuthenticated) {
    return dashboardRouteFor(userRole)
  }

  if (requiresAuth && !isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (allowedRoles && isAuthenticated && !allowedRoles.includes(userRole)) {
    return { name: 'unauthorized' }
  }

  return true
}
