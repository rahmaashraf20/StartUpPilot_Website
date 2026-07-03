// Centralized API configuration.
// NOTE: The Postman documentation links provided render client-side (SPA) and
// could not be scraped automatically. Endpoints below follow standard REST
// conventions inferred from the project spec. Adjust paths/payload keys here
// if your actual Postman collection differs — every service file reads from
// this single config, so one edit here propagates everywhere.

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh-token',
    logout: '/auth/logout',
    me: '/auth/me',
  },

projects: {
  create: '/projects',

  onboarding: (projectId) =>
    `/projects/${projectId}/onboarding`,

  teamMembers: (projectId) =>
    `/projects/${projectId}/team-members`,

  generateAIPlan: (projectId) =>
    `/projects/${projectId}/generate-ai-plan`,

  getAIOutput: (projectId) =>
    `/projects/${projectId}/ai-output`,
},
}

export const STORAGE_KEYS = {
  accessToken: 'sp_access_token',
  refreshToken: 'sp_refresh_token',
  user: 'sp_user',
}
