<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, default: 'tasks' },
  tone: { type: String, default: 'primary' }, // primary | amber | violet | rose
})

const ICONS = {
  tasks: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  messages: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
}

const TONES = {
  primary: 'bg-primary-light text-primary',
  amber: 'bg-amber-50 text-amber-500',
  violet: 'bg-violet-50 text-violet-500',
  rose: 'bg-rose-50 text-rose-500',
}

const iconPath = computed(() => ICONS[props.icon] || ICONS.tasks)
const toneClass = computed(() => TONES[props.tone] || TONES.primary)
</script>

<template>
  <div class="sp-stat-card flex items-center gap-3.5">
    <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="toneClass">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" :d="iconPath" />
      </svg>
    </div>
    <div class="min-w-0">
      <p class="text-xs font-semibold text-slate-400 truncate">{{ label }}</p>
      <p class="text-2xl font-black text-slate-900 leading-tight">{{ value }}</p>
    </div>
  </div>
</template>
