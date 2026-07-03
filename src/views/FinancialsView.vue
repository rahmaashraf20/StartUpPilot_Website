<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import { useAuthUser } from '../composables/useAuthUser'
import { useAIStore } from '../stores/ai'
import { managerSidebarSections, managerNotificationsCount, mockManagerUser } from '../data/mockManager'

const router = useRouter()
const aiStore = useAIStore()
const topbarUser = useAuthUser(mockManagerUser)
const activeNav = ref('financials')
const loading = ref(false)
const error = ref(null)

function handleNavigate(id) {
  activeNav.value = id
  if (id === 'dashboard') router.push('/dashboard/manager')
  if (id === 'projects') router.push('/manager/projects')
  if (id === 'tasks') router.push('/manager/tasks')
  if (id === 'teams') router.push('/manager/teams')
  if (id === 'calendar') router.push('/manager/calendar')
  if (id === 'settings') router.push('/manager/settings')
}

const financialPlan = computed(() => aiStore.financialPlan || null)
const expectedRevenue = computed(() => financialPlan.value?.expectedRevenue || {})

function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return 'Not available'
  return `$${Number(value).toLocaleString()}`
}

const runwayMonths = computed(() => {
  const startupCost = Number(financialPlan.value?.estimatedStartupCost || 0)
  const burnRate = Number(financialPlan.value?.monthlyBurnRate || 0)
  if (!startupCost || !burnRate) return null
  return Math.max(1, Math.floor(startupCost / burnRate))
})

const revenueScenarios = computed(() => {
  const scenarios = [
    { key: 'conservative', label: 'Conservative', tone: 'bg-slate-500' },
    { key: 'target', label: 'Target', tone: 'bg-primary' },
    { key: 'aggressive', label: 'Aggressive', tone: 'bg-emerald-500' },
  ]
  const max = Math.max(...scenarios.map(s => Number(expectedRevenue.value[s.key] || 0)), 1)

  return scenarios.map(s => {
    const value = Number(expectedRevenue.value[s.key] || 0)
    return {
      ...s,
      value,
      formatted: formatCurrency(value),
      pct: Math.round((value / max) * 100),
    }
  })
})

const mainCosts = computed(() => financialPlan.value?.mainCosts || [])
const risks = computed(() => financialPlan.value?.risks || [])

const kpis = computed(() => [
  {
    label: 'Startup Cost',
    value: formatCurrency(financialPlan.value?.estimatedStartupCost),
    sub: 'AI-estimated launch budget',
    tone: 'bg-primary-light text-primary',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
  {
    label: 'Monthly Burn',
    value: formatCurrency(financialPlan.value?.monthlyBurnRate),
    sub: 'Projected operating spend',
    tone: 'bg-amber-50 text-amber-600',
    icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
  },
  {
    label: 'Runway',
    value: runwayMonths.value ? `${runwayMonths.value} months` : 'Not available',
    sub: 'Startup cost divided by burn',
    tone: 'bg-blue-50 text-blue-600',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    label: 'Target Revenue',
    value: formatCurrency(expectedRevenue.value.target),
    sub: 'AI target scenario',
    tone: 'bg-emerald-50 text-emerald-600',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  },
])

onMounted(async () => {
  const projectId = localStorage.getItem('projectId')

  if (!projectId) {
    error.value = 'No active project selected.'
    return
  }

  if (financialPlan.value) return

  loading.value = true
  error.value = null

  try {
    await aiStore.loadAIOutput(projectId)
  } catch (err) {
    console.error('Failed to load financial plan', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <DashboardLayout
    :active-id="activeNav"
    :sidebar-sections="managerSidebarSections"
    :notifications-count="managerNotificationsCount"
    :user="topbarUser"
    @navigate="handleNavigate"
  >
    <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 class="text-[28px] font-black text-slate-900">Financials</h1>
        <p class="text-sm text-slate-500 mt-1">AI-generated financial plan, cost drivers, and funding risks.</p>
      </div>
    </div>

    <div v-if="loading" class="sp-card p-5 text-sm font-semibold text-slate-500">
      Loading financial plan...
    </div>

    <div v-else-if="error" class="sp-card p-5 text-sm font-semibold text-red-500">
      {{ error }}
    </div>

    <div v-else-if="!financialPlan" class="sp-card p-12 text-center">
      <p class="font-bold text-slate-800">No financial plan available</p>
      <p class="text-sm text-slate-400 mt-1">Generate an AI plan first to populate this page.</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div
          v-for="item in kpis"
          :key="item.label"
          class="sp-card p-6 min-h-[160px] hover:shadow-elevated transition-all duration-300 cursor-default"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-11 h-11 rounded-2xl flex items-center justify-center" :class="item.tone">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-slate-500 font-medium mb-2">{{ item.label }}</p>
          <p class="text-[30px] font-black text-slate-900 tracking-tight">{{ item.value }}</p>
          <p class="text-xs text-slate-400 mt-2">{{ item.sub }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <div class="xl:col-span-2 space-y-5">
          <div class="sp-card p-6">
            <h3 class="font-bold text-slate-900 mb-2">Financial Summary</h3>
            <p class="text-sm text-slate-600 leading-relaxed">{{ financialPlan.summary }}</p>
          </div>

          <div class="sp-card p-6">
            <div class="flex items-center justify-between mb-5">
              <div>
                <h3 class="font-bold text-slate-900">Expected Revenue</h3>
                <p class="text-xs text-slate-400 mt-0.5">AI-generated scenario range.</p>
              </div>
            </div>

            <div class="space-y-5">
              <div v-for="scenario in revenueScenarios" :key="scenario.key">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-sm font-semibold text-slate-700">{{ scenario.label }}</span>
                  <span class="text-sm font-black text-slate-900">{{ scenario.formatted }}</span>
                </div>
                <div class="w-full h-2.5 bg-slate-100 rounded-full">
                  <div class="h-full rounded-full transition-all" :class="scenario.tone" :style="`width: ${scenario.pct}%`"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="sp-card p-6">
            <h3 class="font-bold text-slate-900 mb-4">Main Cost Drivers</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="cost in mainCosts"
                :key="cost"
                class="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p class="text-sm font-semibold text-slate-700">{{ cost }}</p>
              </div>
            </div>
            <p v-if="mainCosts.length === 0" class="text-sm text-slate-400">No cost drivers were returned.</p>
          </div>
        </div>

        <div class="space-y-5">
          <div class="sp-card p-6">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.674M12 3v1m6.364.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M8 17a4 4 0 118 0c0 1.5-1 2-1 3H9c0-1-1.5-1-3z" />
                </svg>
              </div>
              <h3 class="font-bold text-slate-900">Funding Advice</h3>
            </div>
            <p class="text-sm text-slate-600 leading-relaxed">{{ financialPlan.fundingAdvice }}</p>
          </div>

          <div class="sp-card p-6">
            <h3 class="font-bold text-slate-900 mb-4">Risk Watchlist</h3>
            <div class="space-y-3">
              <div
                v-for="risk in risks"
                :key="risk"
                class="flex items-start gap-3 p-3 rounded-xl border-l-4 border-red-400 bg-red-50"
              >
                <svg class="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-xs font-semibold text-slate-700 leading-relaxed">{{ risk }}</p>
              </div>
            </div>
            <p v-if="risks.length === 0" class="text-sm text-slate-400">No risks were returned.</p>
          </div>
        </div>
      </div>

      <div class="sp-card p-6 bg-primary-light border-primary/20">
        <div class="flex flex-wrap items-center gap-5">
          <div class="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[11px] font-bold text-primary uppercase tracking-wide mb-1">AI Financial Recommendation</p>
            <p class="text-sm text-slate-700 leading-relaxed">{{ financialPlan.fundingAdvice }}</p>
          </div>
        </div>
      </div>
    </template>
  </DashboardLayout>
</template>
