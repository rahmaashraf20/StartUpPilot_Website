<script setup>
defineProps({
  projects: { type: Array, required: true },
})
</script>

<template>
  <div class="sp-card p-6">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="font-bold text-slate-900">Project Progress</h3>
        <p class="text-xs text-slate-400 mt-0.5">Projects you're contributing to</p>
      </div>
    </div>

    <div v-if="projects.length === 0" class="py-8 text-center">
      <p class="text-sm text-slate-400">You're not assigned to any projects yet.</p>
    </div>

    <div v-else class="space-y-5">
      <div v-for="project in projects" :key="project.id">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-sm font-semibold text-slate-700 truncate">{{ project.name }}</span>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-xs text-slate-400">{{ project.tasksDone }}/{{ project.tasksTotal }} tasks</span>
            <span
              class="text-xs font-bold"
              :class="project.pct === 100 ? 'text-emerald-500' : 'text-primary'"
            >
              {{ project.pct }}%
            </span>
          </div>
        </div>
        <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="project.color || 'bg-primary'"
            :style="`width: ${project.pct}%`"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
