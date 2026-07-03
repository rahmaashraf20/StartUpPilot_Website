import { defineStore } from 'pinia'

export const useProjectStore = defineStore('project', {
  state: () => ({
    currentProject: null,
  }),

  actions: {
    setProject(project) {
      this.currentProject = project
    },

    clearProject() {
      this.currentProject = null
    },
  },
})