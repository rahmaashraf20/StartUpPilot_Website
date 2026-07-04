<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EmptyDashboardView from './EmptyDashboardView.vue'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import { useAuthUser } from '../composables/useAuthUser'
import { useAIStore } from '../stores/ai'
import { useAuthStore } from '../stores/auth'
import { useTaskStore } from '../stores/tasks'

import {
  managerSidebarSections,
  managerNotificationsCount,
  mockManagerUser,
} from '../data/mockManager'

const topbarUser = useAuthUser(mockManagerUser)
const router = useRouter()
const auth = useAuthStore()
const aiStore = useAIStore()
const taskStore = useTaskStore()

const activeNav = ref('dashboard')
const dismissedAdvisory = ref(false)

onMounted(async () => {
  const projectId = localStorage.getItem('projectId')
  if (!projectId) return

  try {
    await aiStore.loadAIOutput(projectId)
    await taskStore.loadTasks(projectId)
  } catch (err) {
    console.error('Failed to load dashboard data', err)
  }
})

const hasRoadmap = computed(() => aiStore.roadmap.length > 0)
const inviteCode = computed(() => auth.user?.inviteCode || auth.inviteCode || '')
const financialPlan = computed(() => aiStore.financialPlan || {})
const expectedRevenue = computed(() => financialPlan.value.expectedRevenue || {})

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '--'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

const groupedRoadmap = computed(() => {
  const groups = new Map()

  aiStore.roadmap
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach((item) => {
      const phase = item.phase || 'Execution'
      if (!groups.has(phase)) groups.set(phase, [])
      groups.get(phase).push(item)
    })

  return Array.from(groups, ([phase, items], index) => ({
    phase,
    order: index + 1,
    items,
  }))
})

const dashboardStats = computed(() => [
  {
    label: 'Roadmap Steps',
    value: aiStore.roadmap.length || '--',
    detail: `${groupedRoadmap.value.length || 0} execution phases`,
    tone: 'primary',
  },
  {
    label: 'Startup Cost',
    value: formatCurrency(financialPlan.value.estimatedStartupCost),
    detail: 'Estimated launch capital',
    tone: 'violet',
  },
  {
    label: 'Monthly Burn',
    value: formatCurrency(financialPlan.value.monthlyBurnRate),
    detail: 'Planned operating spend',
    tone: 'amber',
  },
  {
    label: 'Target Revenue',
    value: formatCurrency(expectedRevenue.value.target),
    detail: 'Projected monthly target',
    tone: 'emerald',
  },
])

const activeTasks = computed(() =>
  taskStore.tasks.slice(0, 5).map((task) => ({
    id: task._id,
    title: task.title,
    priority: task.priority?.toUpperCase() || 'LOW',
    due: task.estimatedTime || 'No estimate',
    done: task.status === 'done',
    sub: task.assignedMember?.name || 'Unassigned',
  }))
)

const priorityClass = {
  HIGH: 'bg-red-50 text-red-600',
  MEDIUM: 'bg-amber-50 text-amber-600',
  MED: 'bg-amber-50 text-amber-600',
  LOW: 'bg-slate-100 text-slate-500',
}

const statToneClass = {
  primary: 'bg-primary-light text-primary border-primary/20',
  violet: 'bg-violet-50 text-violet-600 border-violet-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
}

function handleNavigate(id) {
  activeNav.value = id
  if (id === 'teams') router.push('/manager/teams')
  if (id === 'calendar') router.push('/manager/calendar')
  if (id === 'settings') router.push('/manager/settings')
  if (id === 'tasks') router.push('/manager/tasks')
  if (id === 'projects') router.push('/manager/projects')
  if (id === 'financials') router.push('/manager/financials')
}

async function copyInviteCode() {
  if (!inviteCode.value) return

  try {
    await navigator.clipboard.writeText(inviteCode.value)
  } catch (err) {
    console.error('Failed to copy invite code', err)
  }
}

async function toggleTask(id) {
  const task = taskStore.tasks.find((item) => item._id === id)
  if (!task) return

  try {
    await taskStore.updateStatus(id, task.status === 'done' ? 'todo' : 'done')
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <EmptyDashboardView v-if="!hasRoadmap" />

  <DashboardLayout
    v-else
    :active-id="activeNav"
    :sidebar-sections="managerSidebarSections"
    :notifications-count="managerNotificationsCount"
    :user="topbarUser"
    @navigate="handleNavigate"
  >
    <div class="space-y-6">
      <header class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-3xl">
          <p class="text-sm font-semibold text-primary">
            Welcome back, {{ topbarUser.fullName }}
          </p>
          <h1 class="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Mission Command Center
          </h1>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            {{ aiStore.overview }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button class="sp-btn-outline text-xs" @click="handleNavigate('projects')">
            Projects
          </button>
          <button class="sp-btn-primary text-xs" @click="handleNavigate('tasks')">
            View Tasks
          </button>
        </div>
      </header>

      <section
        v-if="inviteCode"
        class="sp-card overflow-hidden border-primary/20 bg-white"
      >
        <div class="grid grid-cols-1 gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div class="min-w-0">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0" />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs font-black uppercase tracking-wide text-slate-400">
                  Team invite code
                </p>
                <h2 class="mt-1 text-lg font-black text-slate-900">
                  Share this with employees to join your workspace.
                </h2>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-lg font-black tracking-wider text-slate-900">
              {{ inviteCode }}
            </div>
            <button class="sp-btn-primary justify-center text-sm" @click="copyInviteCode">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 16h8M8 12h8m-6 8h8a2 2 0 002-2V7.414a2 2 0 00-.586-1.414l-3.414-3.414A2 2 0 0014.586 2H10a2 2 0 00-2 2v2M6 8H4a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              Copy
            </button>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="stat in dashboardStats"
          :key="stat.label"
          class="sp-card min-w-0 p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-400">
                {{ stat.label }}
              </p>
              <p class="mt-2 break-words text-2xl font-black leading-tight text-slate-900">
                {{ stat.value }}
              </p>
            </div>
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
              :class="statToneClass[stat.tone]"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p class="mt-3 text-xs font-medium text-slate-500">
            {{ stat.detail }}
          </p>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <div class="sp-card overflow-hidden">
          <div class="border-b border-slate-100 p-5 sm:p-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 class="text-xl font-black text-slate-900">
                  AI Venture Roadmap
                </h2>
                <p class="mt-1 text-sm text-slate-500">
                  {{ aiStore.roadmap.length }} ordered milestones across {{ groupedRoadmap.length }} phases.
                </p>
              </div>
              <span class="w-fit rounded-full bg-primary-light px-3 py-1 text-xs font-bold text-primary">
                Execution plan
              </span>
            </div>
          </div>

          <div class="divide-y divide-slate-100">
            <section
              v-for="group in groupedRoadmap"
              :key="group.phase"
              class="p-5 sm:p-6"
            >
              <div class="mb-5 flex items-center gap-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                  {{ group.order }}
                </div>
                <div class="min-w-0">
                  <h3 class="font-black text-slate-900">
                    {{ group.phase }}
                  </h3>
                  <p class="text-xs text-slate-400">
                    {{ group.items.length }} milestones
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <article
                  v-for="item in group.items"
                  :key="`${item.order}-${item.title}`"
                  class="rounded-lg border border-slate-100 bg-white p-4 transition-colors hover:border-primary/30"
                >
                  <div class="flex items-start justify-between gap-3">
                    <p class="text-xs font-black text-primary">
                      Step {{ item.order }}
                    </p>
                    <span class="shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                      {{ item.estimatedDuration || 'TBD' }}
                    </span>
                  </div>
                  <h4 class="mt-2 text-sm font-black leading-snug text-slate-900">
                    {{ item.title }}
                  </h4>
                  <p class="mt-2 text-sm leading-6 text-slate-500">
                    {{ item.description }}
                  </p>
                </article>
              </div>
            </section>
          </div>
        </div>

        <aside class="space-y-6">
          <div class="sp-card p-5 sm:p-6">
            <h3 class="font-black text-slate-900">
              Financial Strategy
            </h3>
            <p class="mt-3 text-sm leading-6 text-slate-500">
              {{ financialPlan.summary || 'No financial summary available yet.' }}
            </p>

            <div class="mt-5 grid grid-cols-1 gap-3">
              <div class="rounded-lg bg-slate-50 p-4">
                <p class="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Conservative
                </p>
                <p class="mt-1 text-xl font-black text-slate-900">
                  {{ formatCurrency(expectedRevenue.conservative) }}
                </p>
              </div>
              <div class="rounded-lg bg-primary-light p-4">
                <p class="text-xs font-bold uppercase tracking-wide text-primary">
                  Target
                </p>
                <p class="mt-1 text-xl font-black text-slate-900">
                  {{ formatCurrency(expectedRevenue.target) }}
                </p>
              </div>
              <div class="rounded-lg bg-emerald-50 p-4">
                <p class="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  Aggressive
                </p>
                <p class="mt-1 text-xl font-black text-slate-900">
                  {{ formatCurrency(expectedRevenue.aggressive) }}
                </p>
              </div>
            </div>
          </div>

          <div class="sp-card p-5 sm:p-6">
            <h3 class="font-black text-slate-900">
              Funding Advice
            </h3>
            <p class="mt-3 text-sm leading-6 text-slate-500">
              {{ financialPlan.fundingAdvice || 'Funding advice will appear after AI planning.' }}
            </p>
          </div>
        </aside>
      </section>

      <section class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div class="sp-card p-5 sm:p-6">
          <h3 class="font-black text-slate-900">
            Main Costs
          </h3>
          <ul class="mt-4 space-y-3">
            <li
              v-for="cost in financialPlan.mainCosts || []"
              :key="cost"
              class="flex gap-3 text-sm leading-5 text-slate-600"
            >
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span>
              <span>{{ cost }}</span>
            </li>
          </ul>
        </div>

        <div class="sp-card p-5 sm:p-6">
          <h3 class="font-black text-slate-900">
            Risk Watch
          </h3>
          <ul class="mt-4 space-y-3">
            <li
              v-for="risk in financialPlan.risks || []"
              :key="risk"
              class="flex gap-3 text-sm leading-5 text-slate-600"
            >
              <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400"></span>
              <span>{{ risk }}</span>
            </li>
          </ul>
        </div>

        <div class="sp-card p-5 sm:p-6">
          <div class="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 class="font-black text-slate-900">
                Active Tasks
              </h3>
              <p class="mt-1 text-xs text-slate-400">
                Latest assigned execution work
              </p>
            </div>
            <button class="text-xs font-bold text-primary hover:underline" @click="handleNavigate('tasks')">
              View all
            </button>
          </div>

          <div v-if="activeTasks.length" class="space-y-3">
            <button
              v-for="task in activeTasks"
              :key="task.id"
              class="flex w-full items-start gap-3 rounded-lg border border-slate-100 p-3 text-left transition-colors hover:border-primary/30"
              @click="toggleTask(task.id)"
            >
              <span
                class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-slate-200"
                :class="task.done ? 'border-emerald-500 bg-emerald-500' : ''"
              >
                <svg v-if="task.done" class="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-bold leading-snug text-slate-800" :class="task.done ? 'text-slate-400 line-through' : ''">
                  {{ task.title }}
                </span>
                <span class="mt-2 flex flex-wrap items-center gap-2">
                  <span class="rounded-md px-1.5 py-0.5 text-[10px] font-black" :class="priorityClass[task.priority] || priorityClass.LOW">
                    {{ task.priority }}
                  </span>
                  <span class="text-[11px] text-slate-400">
                    {{ task.due }}
                  </span>
                  <span class="text-[11px] text-slate-400">
                    {{ task.sub }}
                  </span>
                </span>
              </span>
            </button>
          </div>

          <p v-else class="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
            No active tasks loaded yet.
          </p>
        </div>
      </section>

      <section
        v-if="!dismissedAdvisory"
        class="sp-card flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
          <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.674M12 3v1m6.364.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M8 17a4 4 0 118 0c0 1.5-1 2-1 3H9c0-1-1-1.5-1-3z" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-black text-slate-900">
            AI Business Overview
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            {{ aiStore.overview }}
          </p>
        </div>
        <button class="sp-btn-outline shrink-0 text-xs" @click="dismissedAdvisory = true">
          Dismiss
        </button>
      </section>
    </div>
  </DashboardLayout>
</template>
