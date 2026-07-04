import { http, setTokens, clearTokens } from './http'
import { ENDPOINTS, STORAGE_KEYS } from './endpoints'

function persistAuthPayload(data) {
  const inviteCode = data?.user?.inviteCode || data?.inviteCode || null

  if (inviteCode) {
    localStorage.setItem(STORAGE_KEYS.inviteCode, inviteCode)
  } else {
    localStorage.removeItem(STORAGE_KEYS.inviteCode)
  }

  if (data?.user) {
    localStorage.setItem(
      STORAGE_KEYS.user,
      JSON.stringify(inviteCode ? { ...data.user, inviteCode } : data.user)
    )
  }
}

export const authService = {
  // Single endpoint for both roles — the backend differentiates by `role`.
  // Manager payloads additionally require workspaceName + startupName;
  // employee payloads additionally require inviteCode + specialization.
  async register({ name, email, password, role, workspaceName, startupName, inviteCode, specialization }) {
    const payload =
      role === 'manager'
        ? { name, email, password, role, workspaceName, startupName }
        : { name, email, password, role, inviteCode, specialization }

    const data = await http.post(ENDPOINTS.auth.register, payload, { auth: false })
    if (data?.token) {
      setTokens({ accessToken: data.token, refreshToken: data.refreshToken })
      persistAuthPayload(data)
    }
    return data
  },

  async login({ email, password }) {
    const data = await http.post(ENDPOINTS.auth.login, { email, password }, { auth: false })

    setTokens({ accessToken: data.token, refreshToken: data.refreshToken })
    persistAuthPayload(data)
    return data
  },

  async me() {
    const data = await http.get(ENDPOINTS.auth.me)
    return data.user
  },

  async logout() {
    try {
      await http.post(ENDPOINTS.auth.logout, {})
    } catch {
      // best-effort — this endpoint isn't in the documented Authentication
      // API, so a failure here is expected; clear the local session anyway.
    } finally {
      clearTokens()
    }
  },
}
