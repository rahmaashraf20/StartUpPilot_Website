<script setup>
const props = defineProps({
  title: { type: String, required: true },
  project: { type: String, default: '' },
  priority: { type: String, default: 'Medium' }, // High | Medium | Low
  dueTime: { type: String, default: '' },
  status: { type: String, default: 'todo' }, // todo | in-progress | done
  done: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle'])

const STATUS_LABEL = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
}
</script>

<template>
  <div
    class="flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-slate-50 transition-colors group"
  >
    <button
      type="button"
      class="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors"
      :class="done || props.status === 'done'
        ? 'bg-emerald-500 border-emerald-500'
        : 'border-slate-300 group-hover:border-primary'"
      :aria-pressed="done"
      :aria-label="`Mark ${title} as ${done ? 'not done' : 'done'}`"
      @click="emit('toggle')"
    >
      <svg v-if="done || props.status === 'done'" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </button>

    <div class="flex-1 min-w-0">
      <p
        class="text-sm font-semibold text-slate-800 truncate transition-colors"
        :class="done ? 'line-through text-slate-400' : ''"
      >
        {{ title }}
      </p>
      <p class="text-xs text-slate-400 truncate mt-0.5">{{ project }}</p>
    </div>

    <div class="hidden sm:flex items-center gap-2 shrink-0">
      <span
        class="sp-badge"
        :class="{
          'bg-red-50 text-red-500': priority === 'High',
          'bg-amber-50 text-amber-500': priority === 'Medium',
          'bg-slate-100 text-slate-400': priority === 'Low',
        }"
      >
        {{ priority }} Priority
      </span>
    </div>

    <div class="flex flex-col items-end shrink-0 gap-1 min-w-[72px]">
      <span class="text-xs font-semibold text-slate-500">{{ dueTime ? `Due ${dueTime}` : '' }}</span>
      <span
        class="text-[10px] font-bold uppercase tracking-wide"
        :class="{
          'text-emerald-500': status === 'done',
          'text-primary': status === 'in-progress',
          'text-slate-400': status === 'todo',
        }"
      >
        {{ STATUS_LABEL[status] }}
      </span>
    </div>
  </div>
</template>
