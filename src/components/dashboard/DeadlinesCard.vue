<script setup>
defineProps({
  deadlines: { type: Array, required: true },
})
</script>

<template>
  <div class="sp-card p-6">
    <h3 class="font-bold text-slate-900 mb-5">Upcoming Deadlines</h3>

    <div v-if="deadlines.length === 0" class="py-6 text-center">
      <p class="text-sm text-slate-400">No deadlines on the horizon.</p>
    </div>

    <ol v-else class="relative space-y-5">
      <li
        v-for="(item, idx) in deadlines"
        :key="item.id"
        class="relative pl-7"
      >
        <span
          v-if="idx !== deadlines.length - 1"
          class="absolute left-[7px] top-4 bottom-[-1.25rem] w-px bg-[#e4e4f0]"
        ></span>
        <span class="absolute left-0 top-0.5 w-3.5 h-3.5 rounded-full bg-primary-light ring-4 ring-primary-light/40 flex items-center justify-center">
          <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
        </span>
        <p class="text-sm font-semibold text-slate-800">{{ item.title }}</p>
        <p class="text-xs text-slate-400 mt-0.5">{{ item.date }} · {{ item.project }}</p>
      </li>
    </ol>
  </div>
</template>
