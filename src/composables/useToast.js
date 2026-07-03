import { reactive } from 'vue'

const state = reactive({ items: [] })
let uid = 0

export function useToast() {
  function show(message, type = 'info') {
    const id = ++uid
    state.items.push({ id, message, type })
    setTimeout(() => {
      const i = state.items.findIndex((t) => t.id === id)
      if (i !== -1) state.items.splice(i, 1)
    }, 4000)
  }

  return {
    items: state.items,
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
    info: (msg) => show(msg, 'info'),
  }
}
