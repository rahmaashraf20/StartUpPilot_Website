import { useAuthStore } from '../stores/auth'

export const dashboardRouteFor = (role) =>
  role === 'manager' ? { name: 'manager-dashboard' } : role === 'employee' ? { name: 'employee-dashboard' } : { name: 'login' }

/**
 * Global navigation guard. Attach via router.beforeEach(authGuard).
 * Route meta flags supported:
 *  - requiresAuth: boolean
 *  - guestOnly: boolean (login/register — redirect away if already authenticated)
 *  - roles: string[] (restrict to specific roles)
 */
export async function authGuard(to) {
  const auth = useAuthStore()
  if (!auth.initialized) {
    await auth.restoreSession()
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return dashboardRouteFor(auth.role)
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.roles && auth.isAuthenticated && !to.meta.roles.includes(auth.role)) {
    return { name: 'unauthorized' }
  }

  return true
}
