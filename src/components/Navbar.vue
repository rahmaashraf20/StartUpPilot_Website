<template>
  <header class="bg-white/80 backdrop-blur-lg border-b border-[#e4e4f0] sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

      <!-- Brand -->
      <router-link to="/" class="flex items-center gap-2 font-black text-lg text-slate-900 tracking-tight">
        <div class="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        Startup<span class="text-primary">Pilot</span>
      </router-link>

      <!-- Nav Links -->
      <nav class="hidden lg:flex items-center gap-1">
        <a v-for="item in navItems" :key="item" href="#"
          class="px-3.5 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
          {{ item }}
        </a>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <template v-if="auth.isAuthenticated">
          <router-link :to="dashboardLink" class="hidden sm:block text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
            Dashboard
          </router-link>
          <button @click="handleLogout" class="sp-btn-outline">Sign out</button>
        </template>
        <template v-else>
          <router-link to="/login" class="hidden sm:block text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
            Sign in
          </router-link>
          <router-link to="/register" class="sp-btn-primary">
            Get started
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </router-link>
        </template>
      </div>

    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { dashboardRouteFor } from '../middleware/authGuard'

const navItems = ['Features', 'Pricing', 'Docs', 'Blog']
const auth = useAuthStore()
const router = useRouter()

const dashboardLink = computed(() => dashboardRouteFor(auth.role))

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>
