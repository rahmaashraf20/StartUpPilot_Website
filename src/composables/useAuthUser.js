import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

// Topbar / UserMenu need a few fields (roleLabel, avatarUrl, workspace)
// that the Auth API doesn't return yet. This merges the real authenticated
// user (name/fullName/email/role) over a role-specific mock fallback, so
// once logged in the UI always shows the real person instead of the mock
// identity, while UI-only fields still fall back to mock data until a real
// profile API exists.
export function useAuthUser(mockUser) {
  const auth = useAuthStore()

  return computed(() => {
    if (!auth.user) return mockUser

    return {
      ...mockUser,
      ...auth.user,
      fullName: auth.user.fullName || auth.user.name || mockUser.fullName,
      roleLabel: mockUser.roleLabel,
      avatarUrl: auth.user.avatarUrl || mockUser.avatarUrl,
    }
  })
}
