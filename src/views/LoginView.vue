<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useApiRequest } from '../composables/useApiRequest'
import { useToast } from '../composables/useToast'
import { dashboardRouteFor } from '../middleware/authGuard'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()
const { loading, error, fieldErrors, run } = useApiRequest()

const form = ref({ email: '', password: '', remember: false })

const planItems = [
  { label: 'Market Fit', pct: 88 },
  { label: 'Financial Viability', pct: 74 },
  { label: 'Team Readiness', pct: 91 },
]

async function handleLogin() {
  try {
    await run(() =>
      auth.login({
        email: form.value.email,
        password: form.value.password,
      })
    )

    toast.success('Welcome back!')

    const redirect = route.query.redirect

    if (redirect) {
      router.push(redirect)
    } else {
      router.push(dashboardRouteFor(auth.role))
    }
  } catch {
    // error state already set
  }
}
</script>

<template>
  <div class="min-h-screen flex bg-white">

    <!-- Left: Auth Form -->
    <div class="w-full lg:w-1/2 flex flex-col">
      <!-- Mini nav -->
      <div class="px-8 py-5 border-b border-[#e4e4f0]">
        <router-link to="/" class="flex items-center gap-2 font-black text-slate-900 text-base">
          <div class="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          StartupPilot
        </router-link>
      </div>

      <div class="flex-1 flex items-center justify-center px-8 py-12">
        <div class="w-full max-w-sm animate-slide-up">
          <div class="mb-8">
            <h1 class="text-2xl font-black text-slate-900">Welcome back</h1>
            <p class="text-slate-500 text-sm mt-1.5">Sign in to your workspace to continue.</p>
          </div>

          <div v-if="error" class="mb-5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 space-y-1">
            <p>{{ error }}</p>
            <ul v-if="fieldErrors" class="list-disc list-inside text-xs font-normal">
              <li v-for="(msg, field) in fieldErrors" :key="field">{{ field }}: {{ Array.isArray(msg) ? msg.join(', ') : msg }}</li>
            </ul>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="sp-label">Email address</label>
              <input type="email" v-model="form.email" placeholder="name@company.com" class="sp-input" required />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="sp-label mb-0">Password</label>
                <a class="text-xs text-primary font-medium hover:underline cursor-pointer">Forgot?</a>
              </div>
              <input type="password" v-model="form.password" placeholder="••••••••" class="sp-input" required />
            </div>

            <label class="flex items-center gap-2.5 cursor-pointer py-1">
              <input type="checkbox" v-model="form.remember" class="w-4 h-4 rounded border-[#e4e4f0] accent-primary" />
              <span class="text-sm text-slate-500">Keep me signed in</span>
            </label>

            <button type="submit" :disabled="loading" class="sp-btn-primary w-full justify-center py-3 text-base shadow-elevated mt-2 disabled:opacity-60">
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <p class="text-center text-sm text-slate-500 mt-7">
            No account yet?
            <router-link to="/register" class="text-primary font-semibold hover:underline ml-1">Create one free</router-link>
          </p>
        </div>
      </div>
    </div>

    <!-- Right: Brand Panel -->
    <div class="hidden lg:flex w-1/2 bg-surface border-l border-[#e4e4f0] flex-col items-center justify-center p-12 relative overflow-hidden">
      <div class="absolute inset-0 bg-grid opacity-60 pointer-events-none"></div>
      <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl"></div>

      <div class="relative z-10 w-full max-w-sm space-y-4">
        <div class="sp-card p-5 animate-slide-up">
          <div class="flex items-center justify-between mb-4">
            <span class="sp-section-title mb-0">AI Business Plan</span>
            <span class="sp-badge bg-emerald-50 text-emerald-600">● Generated</span>
          </div>
          <div class="space-y-2.5">
            <div v-for="item in planItems" :key="item.label" class="flex items-center justify-between">
              <span class="text-xs text-slate-500">{{ item.label }}</span>
              <div class="flex items-center gap-2">
                <div class="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full bg-primary" :style="`width: ${item.pct}%`"></div>
                </div>
                <span class="text-xs font-bold text-slate-800 w-8 text-right">{{ item.pct }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="sp-card p-4">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Runway</p>
            <p class="text-2xl font-black text-slate-900 mt-1">18 mo</p>
            <p class="text-[10px] text-emerald-500 font-medium mt-0.5">↑ Sustainable</p>
          </div>
          <div class="sp-card p-4">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasks Done</p>
            <p class="text-2xl font-black text-slate-900 mt-1">24/30</p>
            <p class="text-[10px] text-primary font-medium mt-0.5">→ On schedule</p>
          </div>
        </div>

        <div class="sp-card p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-slate-900">AI Insight</p>
            <p class="text-xs text-slate-500 leading-relaxed">Budget allocation is optimal for a 12-month sprint.</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
