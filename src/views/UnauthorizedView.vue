<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { dashboardRouteFor } from '../middleware/authGuard'

const router = useRouter()
const auth = useAuthStore()

function goHome() {
  router.push(auth.isAuthenticated ? dashboardRouteFor(auth.role) : '/login')
}
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center px-6">
    <div class="sp-card p-10 max-w-md text-center">
      <div class="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5 text-2xl">🚫</div>
      <h1 class="text-2xl font-black text-slate-900 mb-2">Access denied</h1>
      <p class="text-slate-500 text-sm mb-8">You don't have permission to view this page with your current role.</p>
      <button @click="goHome" class="sp-btn-primary px-6 py-2.5">Go to my dashboard</button>
    </div>
  </div>
</template>
