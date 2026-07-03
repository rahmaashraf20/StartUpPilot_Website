import { http } from './http'
import { ENDPOINTS } from './endpoints'

export const aiService = {
  async generatePlan(projectId) {
    return await http.post(
      ENDPOINTS.projects.generateAIPlan(projectId)
    )
  },
  async getAIOutput(projectId) {
  return await http.get(
    ENDPOINTS.projects.getAIOutput(projectId)
  )
},
}