<script setup>
import { useToast } from '../composables/useToast'
const { items } = useToast()
</script>

<template>
  <div class="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm">
    <transition-group name="fade">
      <div
        v-for="t in items"
        :key="t.id"
        class="sp-card px-4 py-3 text-sm font-medium shadow-elevated flex items-center gap-2.5 bg-white"
        :class="{
          'border-emerald-200 text-emerald-700': t.type === 'success',
          'border-red-200 text-red-600': t.type === 'error',
          'text-slate-700': t.type === 'info',
        }"
      >
        <span v-if="t.type === 'success'">✅</span>
        <span v-else-if="t.type === 'error'">⚠️</span>
        <span v-else>ℹ️</span>
        {{ t.message }}
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.25s ease; }
.fade-enter-from { opacity: 0; transform: translateY(8px); }
.fade-leave-to { opacity: 0; transform: translateX(20px); }
</style>
