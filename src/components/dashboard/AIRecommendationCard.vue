<script setup>
defineProps({
  tag: { type: String, default: 'Focus Suggestion' },
  headline: { type: String, required: true },
  body: { type: String, required: true },
  confidence: { type: Number, default: 0 },
    showAction: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['apply'])
</script>

<template>
  <div class="relative overflow-hidden sp-card bg-primary-light/60 border-primary/10 p-6">
    <!-- Decorative glow -->
    <div class="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>
    <svg class="absolute top-5 right-5 w-16 h-16 text-primary/10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>

    <div class="relative">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wide">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          {{ tag }}
        </div>
        <span v-if="confidence" class="sp-badge bg-white text-primary shadow-card">
          {{ confidence }}% confidence
        </span>
      </div>

      <h3 class="text-lg font-black text-slate-900 leading-snug">{{ headline }}</h3>
      <p class="text-sm text-slate-600 leading-relaxed mt-2 max-w-md">{{ body }}</p>

      <button type="button" class="sp-btn-primary mt-5 text-xs py-2 px-4" v-if="showAction" @click="emit('apply')">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        Start this task
      </button>
    </div>
  </div>
</template>
