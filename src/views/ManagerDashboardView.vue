<script setup>
import EmptyDashboardView from './EmptyDashboardView.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAIStore } from '../stores/ai'
import { useTaskStore } from '../stores/tasks'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import { useAuthUser } from '../composables/useAuthUser'
import { onMounted } from 'vue'

import {
  mockManagerStats,
  mockRevenueChart,
  mockActiveTasks,
  mockAiAdvisory,
  managerSidebarSections,
  managerNotificationsCount,
  mockManagerUser,
} from '../data/mockManager'

const topbarUser = useAuthUser(mockManagerUser)
const router = useRouter()
const aiStore = useAIStore()
const taskStore = useTaskStore()
onMounted(async () => {
  const projectId = localStorage.getItem('projectId')

  if (!projectId) return

  if (aiStore.roadmap.length === 0) {
    try {
      await aiStore.loadAIOutput(projectId)
await taskStore.loadTasks(projectId)
    } catch (err) {
      console.error('Failed to load AI output', err)
    }
  }
})
console.log('overview =', aiStore.overview)
console.log('roadmap =', aiStore.roadmap)
console.log('roadmap length =', aiStore.roadmap.length)
console.log('tasks length =', aiStore.tasks.length)
const activeNav = ref('dashboard')

const hasRoadmap = computed(() => aiStore.roadmap.length > 0)
console.log('Roadmap Length:', aiStore.roadmap.length)
console.log('Has Roadmap:', hasRoadmap.value)
const dismissedAdvisory = ref(false)

function handleNavigate(id) {
  activeNav.value = id
  if (id === 'teams') router.push('/manager/teams')
  if (id === 'calendar') router.push('/manager/calendar')
  if (id === 'settings') router.push('/manager/settings')
  if (id === 'tasks') router.push('/manager/tasks')
  if (id === 'projects') router.push('/manager/projects')
  if (id === 'financials') router.push('/manager/financials')
}

const forecastMode = ref('Forecast')
const tasks = computed(() =>
  taskStore.tasks.map(task => ({
    id: task._id,
    title: task.title,
    priority: task.priority?.toUpperCase() || 'LOW',
    due: task.estimatedTime,
    done: task.status === 'done',
    sub: task.assignedMember?.name || 'Unassigned',
  }))
)

async function toggleTask(id) {
  const task = taskStore.tasks.find(t => t._id === id)

  if (!task) return

  const newStatus = task.status === 'done' ? 'todo' : 'done'

  try {
    await taskStore.updateStatus(id, newStatus)
  } catch (err) {
    console.error(err)
  }
}

const priorityClass = {
  HIGH: 'bg-red-50 text-red-500',
  MED: 'bg-amber-50 text-amber-500',
  LOW: 'bg-slate-100 text-slate-400',
}

const roadmap = computed(() =>
  aiStore.roadmap.map((item, index) => ({
    title: item.title,
    status: item.phase,
    progress: (index + 1) * 20,
    color: 'bg-primary',
  }))
)
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
    <!-- Page Header -->
    <div>
  <p class="text-sm font-semibold text-primary">
    Welcome back, {{ topbarUser.fullName }}
  </p>

  <h1 class="text-[38px] font-black text-slate-900 mt-1">
    Mission Command Center
  </h1>

  <p class="text-sm text-slate-500 mt-1">
    Monitor your startup performance, roadmap and AI recommendations.
  </p>
</div>
<br>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        v-for="(stat, i) in mockManagerStats"
        :key="stat.label"
        class="sp-card p-5"
        :class="i === 0 ? 'border-primary/30' : ''"
      >
        <div class="flex items-start justify-between mb-1">
          <p class="text-xs font-semibold text-slate-500">{{ stat.label }}</p>
          <!-- mini icon per card -->
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
            :class="i === 0 ? 'bg-primary-light' : i === 1 ? 'bg-red-50' : i === 2 ? 'bg-violet-50' : 'bg-orange-50'">
            <svg class="w-3.5 h-3.5" :class="i === 0 ? 'text-primary' : i === 1 ? 'text-red-500' : i === 2 ? 'text-violet-500' : 'text-orange-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path v-if="i===0" stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              <path v-else-if="i===1" stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path v-else-if="i===2" stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
        </div>
        <p class="text-2xl font-black text-slate-900 mt-2">{{ stat.value }}</p>
        <div v-if="i === 0" class="w-full bg-slate-100 h-1.5 rounded-full mt-2 mb-1">
          <div class="h-full rounded-full bg-primary" style="width: 88%"></div>
        </div>
        <div v-if="i === 3" class="w-full bg-slate-100 h-1.5 rounded-full mt-2 mb-1">
          <div class="h-full rounded-full bg-orange-400" style="width: 35%"></div>
        </div>
        <div class="flex items-center gap-1 mt-1">
          <span class="text-xs font-semibold" :class="stat.positive ? 'text-emerald-500' : 'text-red-400'">{{ stat.delta }}</span>
          <span class="text-[10px] text-slate-400">{{ stat.sub }}</span>
        </div>
      </div>
    </div>

<!-- Venture Roadmap -->
<div class="sp-card p-6 mb-6">

  <div class="flex items-center justify-between mb-6">
    <div>
      <h3 class="text-lg font-bold text-slate-900">
        Venture Roadmap
      </h3>

      <p class="text-sm text-slate-400">
        AI generated execution roadmap
      </p>
    </div>

    <button class="sp-btn-outline text-xs">
      View Roadmap
    </button>
  </div>

  <div class="space-y-5">

    <div
      v-for="item in roadmap"
      :key="item.title"
    >

      <div class="flex justify-between mb-2">

        <div>
          <p class="font-semibold text-slate-800">
            {{ item.title }}
          </p>

          <p class="text-xs text-slate-400">
            {{ item.status }}
          </p>
        </div>

        <span class="text-sm font-bold text-primary">
          {{ item.progress }}%
        </span>

      </div>

      <div class="w-full h-2 rounded-full bg-slate-100">
        <div
          class="h-2 rounded-full transition-all"
          :class="item.color"
          :style="{ width: item.progress + '%' }"
        ></div>
      </div>

    </div>

  </div>

</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

  <!-- Founder Intelligence -->
  <div class="sp-card p-6">

    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="font-bold text-slate-900">
          Founder Intelligence
        </h3>

        <p class="text-xs text-slate-400 mt-1">
          AI insights for your startup
        </p>
      </div>

      <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-semibold">
        Healthy
      </span>
    </div>

    <div class="space-y-4">

      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-600">
          Investor Readiness
        </span>

        <span class="font-bold text-primary">
          92%
        </span>
      </div>

      <div class="w-full h-2 bg-slate-100 rounded-full">
        <div class="w-[92%] h-full rounded-full bg-primary"></div>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-600">
          Team Productivity
        </span>

        <span class="font-bold text-primary">
          81%
        </span>
      </div>

      <div class="w-full h-2 bg-slate-100 rounded-full">
        <div class="w-[81%] h-full rounded-full bg-violet-500"></div>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-600">
          Market Validation
        </span>

        <span class="font-bold text-primary">
          74%
        </span>
      </div>

      <div class="w-full h-2 bg-slate-100 rounded-full">
        <div class="w-[74%] h-full rounded-full bg-emerald-500"></div>
      </div>

    </div>

  </div>

  <!-- Upcoming Deadlines -->

  <div class="sp-card p-6">

    <div class="mb-5">
      <h3 class="font-bold text-slate-900">
        Upcoming Deadlines
      </h3>

      <p class="text-xs text-slate-400 mt-1">
        Important milestones
      </p>
    </div>

    <div class="space-y-4">

      <div class="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <p class="font-medium text-slate-800">
            MVP Release
          </p>

          <p class="text-xs text-slate-400">
            June 28
          </p>
        </div>

        <span class="text-red-500 text-xs font-semibold">
          2 days left
        </span>
      </div>

      <div class="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <p class="font-medium text-slate-800">
            Investor Pitch
          </p>

          <p class="text-xs text-slate-400">
            July 3
          </p>
        </div>

        <span class="text-amber-500 text-xs font-semibold">
          1 week
        </span>
      </div>

      <div class="flex justify-between items-center">
        <div>
          <p class="font-medium text-slate-800">
            Beta Launch
          </p>

          <p class="text-xs text-slate-400">
            July 15
          </p>
        </div>

        <span class="text-primary text-xs font-semibold">
          Planned
        </span>
      </div>

    </div>

  </div>

</div>
   

    <!-- Revenue Forecast + Active Tasks -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

      <!-- Revenue Chart -->
      <div class="lg:col-span-2 sp-card p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="font-bold text-slate-900">Revenue Forecast</h3>
            <p class="text-xs text-slate-400 mt-0.5">Projected growth for the next 6 months</p>
          </div>
          <div class="flex border border-[#e4e4f0] rounded-xl overflow-hidden">
            <button
              v-for="mode in ['Forecast', 'Historical']"
              :key="mode"
              @click="forecastMode = mode"
              class="px-4 py-2 text-xs font-semibold transition-colors"
              :class="forecastMode === mode ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'"
            >{{ mode }}</button>
          </div>
        </div>

        <!-- Bar chart -->
        <div class="flex items-end gap-1.5 h-40 mb-2">
          <div
            v-for="(h, i) in mockRevenueChart"
            :key="i"
            class="flex-1 rounded-t-md transition-all duration-300 cursor-pointer hover:opacity-80 relative group"
            :class="i === 7 ? 'bg-gradient-to-t from-primary to-violet-400' : 'bg-primary-light hover:bg-primary/20'"
            :style="`height: ${h}%`"
          >
            <div v-if="i === 7" class="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">Apr (Exp)</div>
          </div>
        </div>
        <div class="flex justify-between text-[10px] text-slate-400 font-mono">
          <span v-for="m in ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']" :key="m">{{ m }}</span>
        </div>
      </div>

      <!-- Active Tasks -->
      <div class="sp-card p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-bold text-slate-900">Active Tasks</h3>
          <!-- <button class="text-xs font-semibold text-primary hover:underline"><a href="ManagerTasksView.vue">View all</a></button> -->
        </div>
        <div class="space-y-3">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-start gap-3 cursor-pointer group"
            @click="toggleTask(task.id)"
          >
            <div
              class="w-4 h-4 rounded border-2 border-slate-200 mt-0.5 shrink-0 flex items-center justify-center transition-colors"
              :class="task.done ? 'bg-emerald-500 border-emerald-500' : 'group-hover:border-primary'"
            >
              <svg v-if="task.done" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800 leading-snug" :class="task.done ? 'line-through text-slate-400' : ''">{{ task.title }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md" :class="priorityClass[task.priority] || 'bg-slate-100 text-slate-500'">{{ task.priority }}</span>
                <span class="text-[10px] text-slate-400">{{ task.due }}</span>
                <span v-if="task.sub" class="text-[10px] text-slate-400">· {{ task.sub }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Advisory Banner -->
    <div v-if="!dismissedAdvisory" class="sp-card p-5 flex items-start gap-4">
      <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.674M12 3v1m6.364.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M8 17a4 4 0 118 0c0 1.5-1 2-1 3H9c0-1-1-1.5-1-3z" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-bold text-slate-900 text-sm">
  AI Business Overview
</p>
        <p class="text-sm text-slate-500 mt-1 leading-relaxed">{{ aiStore.overview }}</p>
        <div class="flex gap-3 mt-4">
          <button class="sp-btn-primary text-xs py-2 px-4">Re-calculate now</button>
          <button class="sp-btn-outline text-xs py-2 px-4" @click="dismissedAdvisory = true">Dismiss</button>
        </div>
      </div>
      <button class="sp-btn-ghost p-1.5 shrink-0" @click="dismissedAdvisory = true">
        <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

     
  </DashboardLayout>
</template>
