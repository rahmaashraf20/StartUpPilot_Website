<script setup>
import { computed } from 'vue'
import TaskItem from './TaskItem.vue'

const props = defineProps({
  tasks: { type: Array, required: true },
})

const emit = defineEmits(['toggle-task', 'view-all'])

const remaining = computed(() => props.tasks.filter((t) => !t.done).length)
const allDone = computed(() => props.tasks.length > 0 && remaining.value === 0)
</script>

<template>
  <div class="sp-card p-6">
    <div class="flex items-center justify-between mb-2">
      <div>
        <h3 class="font-bold text-slate-900">Today's Tasks</h3>
        <p class="text-xs text-slate-400 mt-0.5">
          {{ tasks.length === 0 ? 'Nothing scheduled for today' : `${remaining} of ${tasks.length} remaining` }}
        </p>
      </div>
      <button type="button" class="sp-btn-ghost text-xs py-1.5" @click="emit('view-all')">
        View All
      </button>
    </div>

    <!-- Empty state: no tasks at all -->
    <div v-if="tasks.length === 0" class="flex flex-col items-center justify-center text-center py-10 px-4">
      <div class="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-sm font-semibold text-slate-700">You're all caught up</p>
      <p class="text-xs text-slate-400 mt-1">No tasks scheduled for today.</p>
    </div>

    <!-- All done state -->
    <div v-else-if="allDone" class="flex flex-col items-center justify-center text-center py-8 px-4">
      <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p class="text-sm font-semibold text-slate-700">Nice work — all done for today!</p>
    </div>

    <div v-else class="divide-y divide-[#f1f1f7] -mx-2">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :title="task.title"
        :project="task.project"
        :priority="task.priority"
        :due-time="task.dueTime"
        :status="task.status"
        :done="task.done"
        class="mx-2"
        @toggle="emit('toggle-task', task.id)"
      />
    </div>
  </div>
</template>
