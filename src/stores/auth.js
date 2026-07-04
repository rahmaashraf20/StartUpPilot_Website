import { defineStore } from 'pinia'
import { authService } from '../services/authService'
import { setUnauthorizedHandler, clearTokens } from '../services/http'
import { STORAGE_KEYS } from '../services/endpoints'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem(STORAGE_KEYS.accessToken) || null,
    refreshToken: localStorage.getItem(STORAGE_KEYS.refreshToken) || null,
    inviteCode: localStorage.getItem(STORAGE_KEYS.inviteCode) || null,
    initialized: false,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    role: (state) => state.user?.role || null,
    onboardingComplete: (state) => !!state.user?.onboardingComplete,
  },

  actions: {
    _persistUser(user, inviteCode = undefined) {
      // The Authentication API returns `name`; keep a `fullName` alias so
      // existing UI (e.g. the Topbar greeting) that reads `user.fullName`
      // keeps working without touching those components.
      const resolvedInviteCode = arguments.length > 1
        ? inviteCode || user?.inviteCode || null
        : user?.inviteCode || this.inviteCode

      this.inviteCode = resolvedInviteCode || null
      this.user = user
        ? {
            ...user,
            fullName: user.fullName || user.name,
            ...(resolvedInviteCode ? { inviteCode: resolvedInviteCode } : {}),
          }
        : user

      if (this.inviteCode) {
        localStorage.setItem(STORAGE_KEYS.inviteCode, this.inviteCode)
      } else {
        localStorage.removeItem(STORAGE_KEYS.inviteCode)
      }
      if (this.user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(this.user))
    },

    async register(payload) {
      this.loading = true
      this.error = null
      try {
        const data = await authService.register(payload)
        this.accessToken = data.token
        this.refreshToken = data.refreshToken || null
        this._persistUser(data.user || { email: payload.email, name: payload.name, role: payload.role }, data.user?.inviteCode || data.inviteCode)
        console.log('Registration successful:', data)
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async login(payload) {
      this.loading = true
      this.error = null
      try {
        const data = await authService.login(payload)
        console.log('Login successful:', data)
        this.accessToken = data.token
        this.refreshToken = data.refreshToken || null
        this._persistUser(data.user || null, data.user?.inviteCode || data.inviteCode)
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      try {
        const user = await authService.me()
        this._persistUser(user)
      } catch {
        // token invalid — handled by 401 interceptor
      }
    },

    async restoreSession() {
      if (this.initialized) return
      const storedUser = localStorage.getItem(STORAGE_KEYS.user)
      if (storedUser) {
        try { this._persistUser(JSON.parse(storedUser)) } catch { this.user = null }
      }
      this.inviteCode = localStorage.getItem(STORAGE_KEYS.inviteCode) || this.user?.inviteCode || null
      if (this.accessToken && !this.user) {
        await this.fetchProfile()
      }
      this.initialized = true
    },

    setOnboardingComplete() {
      if (this.user) {
        this.user.onboardingComplete = true
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(this.user))
      }
    },

    async logout() {
      await authService.logout()
      this.$reset()
      clearTokens()
    },
  },
})

// Wire 401-refresh-failure → force logout + redirect handled by router guard reacting to isAuthenticated
setUnauthorizedHandler(() => {
  const store = useAuthStore()
  store.$reset()
})
