import { ref } from 'vue'

/**
 * useApiRequest — wraps any async service call with loading/error/success state.
 * Usage:
 *   const { loading, error, run } = useApiRequest()
 *   await run(() => authService.login(form))
 */
export function useApiRequest() {
  const loading = ref(false)
  const error = ref(null)
  const fieldErrors = ref(null)
  const success = ref(false)

  async function run(fn) {
    loading.value = true
    error.value = null
    fieldErrors.value = null
    success.value = false
    try {
      const result = await fn()
      success.value = true
      return result
    } catch (err) {
      error.value = err?.message || 'Something went wrong. Please try again.'
      fieldErrors.value = err?.errors || null
      throw err
    } finally {
      loading.value = false
    }
  }

  function reset() {
    loading.value = false
    error.value = null
    fieldErrors.value = null
    success.value = false
  }

  return { loading, error, fieldErrors, success, run, reset }
}
