import { http } from './http'
import { ENDPOINTS } from './endpoints'

export const onboardingService = {
  async createProject(payload) {
    return await http.post(
      ENDPOINTS.projects.create,
      payload
    )
  },

  async updateOnboarding(projectId, payload) {
    return await http.put(
      ENDPOINTS.projects.onboarding(projectId),
      payload
    )
  },

  async updateTeamMembers(projectId, teamMemberIds) {
    return await http.put(
      ENDPOINTS.projects.teamMembers(projectId),
      {
        teamMemberIds,
      }
    )
  },
}
