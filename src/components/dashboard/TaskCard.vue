<script setup>
const props = defineProps({
  task: { type: Object, required: true },
})

const emit = defineEmits(['toggle', 'open'])

const PRIORITY_STYLE = {
  High: 'bg-red-50 text-red-500',
  Medium: 'bg-amber-50 text-amber-500',
  Low: 'bg-slate-100 text-slate-400',
}

const STATUS_STYLE = {
  'todo': 'bg-slate-100 text-slate-500',
  'in-progress': 'bg-primary-light text-primary',
  'review': 'bg-violet-50 text-violet-600',
  'done': 'bg-emerald-50 text-emerald-600',
}

const STATUS_LABEL = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'review': 'Review',
  'done': 'Done',
}
</script>

<template>
  <div
    class="sp-card p-4 sm:p-5 hover:shadow-elevated transition-all duration-200 cursor-pointer group animate-slide-up"
    :class="task.done ? 'opacity-70' : ''"
    @click="emit('open', task)"
  >
    <div class="flex items-start gap-3.5">
      <!-- Checkbox -->
      <button
        type="button"
        class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150 active:scale-90"
        :class="task.done
          ? 'bg-emerald-500 border-emerald-500'
          : 'border-slate-300 group-hover:border-primary hover:scale-110'"
        :aria-pressed="task.done"
        :aria-label="`Mark ${task.title} as ${task.done ? 'not done' : 'done'}`"
        @click.stop="emit('toggle', task.id)"
      >
        <svg v-if="task.done" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <!-- Top row: title + badges -->
        <div class="flex items-start justify-between gap-2 flex-wrap">
          <div class="flex-1 min-w-0">
            <p
              class="font-bold text-slate-900 text-sm leading-snug transition-colors truncate"
              :class="task.done ? 'line-through text-slate-400' : ''"
            >
              {{ task.title }}
            </p>
            <p class="text-xs text-slate-400 mt-0.5 truncate">{{ task.description }}</p>
          </div>
          <div class="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <span class="sp-badge text-xs" :class="PRIORITY_STYLE[task.priority]">{{ task.priority }}</span>
            <span class="sp-badge text-xs" :class="STATUS_STYLE[task.status]">{{ STATUS_LABEL[task.status] }}</span>
          </div>
        </div>

        <!-- Progress bar (only when in-progress) -->
        <div v-if="task.progress > 0 && task.progress < 100" class="mt-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Progress</span>
            <span class="text-[10px] font-bold text-primary">{{ task.progress }}%</span>
          </div>
          <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-primary transition-all duration-500"
              :style="{ width: task.progress + '%' }"
            />
          </div>
        </div>

        <!-- Meta row -->
        <div class="flex items-center gap-3 mt-3 flex-wrap">
          <!-- Project -->
          <span class="flex items-center gap-1 text-xs text-slate-400">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span class="font-medium text-slate-500">{{ task.project }}</span>
          </span>
          <!-- Due date -->
          <span class="flex items-center gap-1 text-xs text-slate-400">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ task.dueDate }}
          </span>
          <!-- Est. time -->
          <span class="flex items-center gap-1 text-xs text-slate-400">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ task.estimatedTime }}
          </span>
          <!-- Assigned by -->
          <span class="flex items-center gap-1 text-xs text-slate-400 ml-auto">
            <div class="w-4 h-4 rounded-full bg-primary-light flex items-center justify-center shrink-0">
              <span class="text-[8px] font-black text-primary">{{ task.assignedBy[0] }}</span>
            </div>
            {{ task.assignedBy }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
