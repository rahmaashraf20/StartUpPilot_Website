import { defineStore } from 'pinia'

export const useEmployeeRegistrationStore = defineStore('employeeRegistration', {
  state: () => ({
    registrationData: null,
  }),

  actions: {
    saveRegistrationData(data) {
      this.registrationData = data
    },

    clearRegistrationData() {
      this.registrationData = null
    },
  },
})