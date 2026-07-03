import { useAuthStore } from '../stores/auth'

export const dashboardRouteFor = (role) => {
  if (role === 'manager') {
    return { name: 'manager-dashboard' }
  }

  if (role === 'employee') {
    return { name: 'employee-dashboard' }
  }

  return { name: 'login' }
}

/**
 * Global navigation guard
 */
export async function authGuard(to) {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.restoreSession()
  }

  // extra safety
  if (auth.isAuthenticated && !auth.role) {
    await auth.restoreSession()
  }

  // guest routes
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return dashboardRouteFor(auth.role)
  }

  // protected routes
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // role-based access
  if (
    to.meta.roles &&
    auth.isAuthenticated &&
    !to.meta.roles.includes(auth.role)
  ) {
    return { name: 'unauthorized' }
  }

  return true
}