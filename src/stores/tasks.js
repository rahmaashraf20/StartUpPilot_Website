import { defineStore } from 'pinia'
import { taskService } from '../services/taskService'

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
  }),

  actions: {
    async loadTasks(projectId) {
      this.loading = true
      this.error = null

      try {
        const data = await taskService.getProjectTasks(projectId)

        console.log('TASKS RESPONSE =>', data)

        this.tasks = data.tasks || []

        return this.tasks
      } catch (err) {
        console.error('LOAD TASKS ERROR =>', err)
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateStatus(taskId, status) {
      try {
        const data = await taskService.updateTaskStatus(taskId, status)

        const index = this.tasks.findIndex(task => task._id === taskId)

        if (index !== -1) {
          this.tasks[index].status = data.task.status
        }

        return data
      } catch (err) {
        console.error('UPDATE TASK ERROR =>', err)
        throw err
      }
    },

    clear() {
      this.tasks = []
      this.error = null
    },
  },
})