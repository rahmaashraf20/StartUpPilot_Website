<script setup>
defineProps({
  height: { type: String, default: '1rem' },
  width: { type: String, default: '100%' },
  rounded: { type: String, default: '0.5rem' },
})
</script>

<template>
  <div
    class="animate-pulse bg-slate-100"
    :style="{ height, width, borderRadius: rounded }"
  ></div>
</template>
