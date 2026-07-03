<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  project: { type: Object, required: true },
})

const router = useRouter()

const STATUS_STYLE = {
  'active': 'bg-primary-light text-primary',
  'completed': 'bg-emerald-50 text-emerald-600',
  'at-risk': 'bg-red-50 text-red-500',
}

const STATUS_LABEL = {
  'active': 'Active',
  'completed': 'Completed',
  'at-risk': 'At Risk',
}

function handleOpen() {
  router.push(`/dashboard/employee/projects/${props.project.id}`)
}
</script>

<template>
  <div
    class="sp-card p-4 sm:p-5 hover:shadow-elevated transition-all duration-200 cursor-pointer group animate-slide-up"
    @click="handleOpen"
  >
    <!-- Top row: name + status badge -->
    <div class="flex items-start justify-between gap-2 flex-wrap">
      <div class="flex-1 min-w-0">
        <p class="font-bold text-slate-900 text-sm leading-snug truncate">{{ project.name }}</p>
        <p class="text-xs text-slate-400 mt-0.5 truncate">{{ project.description }}</p>
      </div>
      <span class="sp-badge text-xs shrink-0" :class="STATUS_STYLE[project.status]">
        {{ STATUS_LABEL[project.status] }}
      </span>
    </div>

    <!-- Progress bar -->
    <div class="mt-4">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Progress</span>
        <span
          class="text-[10px] font-bold tabular-nums"
          :class="project.progress === 100 ? 'text-emerald-500' : 'text-primary'"
        >
          {{ project.progress }}%
        </span>
      </div>
      <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="project.color || 'bg-primary'"
          :style="{ width: project.progress + '%' }"
        />
      </div>
    </div>

    <!-- Meta row -->
    <div class="flex items-center gap-3 mt-4 flex-wrap">
      <!-- Tasks done/total -->
      <span class="flex items-center gap-1 text-xs text-slate-400">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        {{ project.completedTasks }}/{{ project.totalTasks }} tasks
      </span>
      <!-- Due date -->
      <span class="flex items-center gap-1 text-xs text-slate-400">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ project.dueDate }}
      </span>
      <!-- Owner -->
      <span class="flex items-center gap-1 text-xs text-slate-400 ml-auto">
        <div class="w-4 h-4 rounded-full bg-primary-light flex items-center justify-center shrink-0">
          <span class="text-[8px] font-black text-primary">{{ project.owner[0] }}</span>
        </div>
        {{ project.owner }}
      </span>
    </div>

    <!-- Team avatars -->
    <div v-if="project.team?.length" class="flex items-center -space-x-1.5 mt-3">
      <div
        v-for="member in project.team"
        :key="member.name"
        class="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center shrink-0"
        :title="member.name"
      >
        <span class="text-[9px] font-bold text-slate-500">{{ member.name[0] }}</span>
      </div>
    </div>
  </div>
</template>