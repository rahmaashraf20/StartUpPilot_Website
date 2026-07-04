import { http } from './http'
import { ENDPOINTS } from './endpoints'

export const taskService = {
  getMyProjects() {
    return http.get(ENDPOINTS.projects.myProjects)
  },

  getProjectsByWorkspace(workspaceId) {
    return http.get(ENDPOINTS.projects.byWorkspace(workspaceId))
  },

  getProjectTasks(projectId) {
    return http.get(`/projects/${projectId}/tasks`)
  },

  createTask(projectId, payload) {
    return http.post(`/projects/${projectId}/tasks`, payload)
  },

  updateTaskStatus(taskId, status) {
    return http.put(
      `/projects/tasks/${taskId}/status`,
      { status }
    )
  },
}
