<script setup>
defineProps({
  count: { type: Number, default: 0 },
})

defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="relative sp-btn-ghost p-2 text-slate-400 hover:text-slate-700"
    aria-label="Notifications"
    @click="$emit('click')"
  >
    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
    <span
      v-if="count > 0"
      class="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none"
    >
      {{ count > 9 ? '9+' : count }}
    </span>
  </button>
</template>
