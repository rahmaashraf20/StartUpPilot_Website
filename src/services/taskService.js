import { http } from './http'

export const taskService = {
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
