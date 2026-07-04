import { API_BASE_URL, ENDPOINTS, STORAGE_KEYS } from './endpoints'

let isRefreshing = false
let refreshQueue = []
let onUnauthorized = () => {}

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

function getAccessToken() {
  return localStorage.getItem(STORAGE_KEYS.accessToken)
}
function getRefreshToken() {
  return localStorage.getItem(STORAGE_KEYS.refreshToken)
}
export function setTokens({ accessToken, refreshToken } = {}) {
  if (accessToken) localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
}
export function clearTokens() {
  localStorage.removeItem(STORAGE_KEYS.accessToken)
  localStorage.removeItem(STORAGE_KEYS.refreshToken)
  localStorage.removeItem(STORAGE_KEYS.user)
  localStorage.removeItem(STORAGE_KEYS.inviteCode)
}

class ApiError extends Error {
  constructor(message, status, errors = null) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

async function parseResponse(res) {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return text
  }
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new ApiError('No refresh token', 401)

  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.auth.refresh}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  const data = await parseResponse(res)
  if (!res.ok) throw new ApiError(data?.message || 'Session expired', res.status)

  setTokens({ accessToken: data.accessToken || data.token, refreshToken: data.refreshToken })
  return data.accessToken || data.token
}

/**
 * Core request function with automatic Bearer auth + single-retry refresh on 401.
 * @param {string} path - relative path (e.g. ENDPOINTS.auth.login)
 * @param {object} options - fetch options { method, body, auth }
 */
export async function request(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && auth && retry) {
    if (!isRefreshing) {
      isRefreshing = true
      try {
        const newToken = await refreshAccessToken()
        isRefreshing = false
        refreshQueue.forEach((cb) => cb(newToken))
        refreshQueue = []
      } catch (err) {
        isRefreshing = false
        refreshQueue = []
        clearTokens()
        onUnauthorized()
        throw new ApiError('Session expired. Please sign in again.', 401)
      }
    }
    return new Promise((resolve, reject) => {
      refreshQueue.push(async () => {
        try {
          resolve(await request(path, { method, body, auth, retry: false }))
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  const data = await parseResponse(res)

  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`
    const fieldErrors = data?.errors || null
    throw new ApiError(message, res.status, fieldErrors)
  }

  return data
}

export const http = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}

export { ApiError }
