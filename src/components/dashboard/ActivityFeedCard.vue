<script setup>
defineProps({
  activity: { type: Array, required: true },
})

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'U'
}
</script>

<template>
  <div class="sp-card p-6">
    <h3 class="font-bold text-slate-900 mb-5">Recent Activity</h3>

    <div v-if="activity.length === 0" class="py-6 text-center">
      <p class="text-sm text-slate-400">Nothing new to show yet.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="item in activity" :key="item.id" class="flex items-start gap-3">
        <div
          v-if="item.isAi"
          class="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0"
        >
          <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <img
          v-else-if="item.avatarUrl"
          :src="item.avatarUrl"
          :alt="item.actor"
          class="w-8 h-8 rounded-full object-cover shrink-0"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0"
        >
          {{ initials(item.actor) }}
        </div>

        <div class="min-w-0">
          <p class="text-sm text-slate-700 leading-snug">
            <span class="font-semibold text-slate-900">{{ item.actor }}</span>
            {{ ' ' }}{{ item.action }}
            <span v-if="item.target" class="font-semibold text-primary">{{ ' ' }}{{ item.target }}</span>
          </p>
          <p class="text-xs text-slate-400 mt-0.5">{{ item.time }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
