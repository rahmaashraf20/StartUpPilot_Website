import { defineStore } from 'pinia'
import { aiService } from '../services/aiService'

export const useAIStore = defineStore('ai', {
  state: () => ({
    overview: '',
    roadmap: [],
    financialPlan: null,
    tasks: [],
    loading: false,
    error: null,
  }),

  actions: {
    async generatePlan(projectId) {
      console.log('generatePlan called with =>', projectId)

      this.loading = true
      this.error = null

      try {
        const data = await aiService.generatePlan(projectId)

        console.log('AI RESPONSE =>', data)

        this.overview = data.aiOutputs?.overview || ''
        this.roadmap = data.aiOutputs?.roadmap || []
        this.financialPlan = data.aiOutputs?.financialPlan || null
        this.tasks = data.tasks || []

        console.log('STORE UPDATED =>', {
          overview: this.overview,
          roadmap: this.roadmap,
          tasks: this.tasks,
        })

        return data
      } catch (err) {
        console.error('AI STORE ERROR =>', err)
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async loadAIOutput(projectId) {
      console.log('Loading AI Output =>', projectId)

      this.loading = true
      this.error = null

      try {
        const data = await aiService.getAIOutput(projectId)
        console.log(projectId)
        console.log('AI OUTPUT =>', data)

        this.overview = data.aiOutputs?.overview || ''
        this.roadmap = data.aiOutputs?.roadmap || []
        this.financialPlan = data.aiOutputs?.financialPlan || null

        // الـ GET endpoint الحالي لا يرجع tasks
        // لذلك لا نقوم بتعديل this.tasks هنا.

        return data
      } catch (err) {
        console.error('LOAD AI ERROR =>', err)
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    clear() {
      this.overview = ''
      this.roadmap = []
      this.financialPlan = null
      this.tasks = []
      this.error = null
    },
  },
})