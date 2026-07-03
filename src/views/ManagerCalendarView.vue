<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import { useAuthUser } from '../composables/useAuthUser'
import { useAIStore } from '../stores/ai'
import { useTaskStore } from '../stores/tasks'
import {
  managerSidebarSections,
  managerNotificationsCount,
  mockManagerUser,
} from '../data/mockManager'

const router = useRouter()
const aiStore = useAIStore()
const taskStore = useTaskStore()
const topbarUser = useAuthUser(mockManagerUser)
const activeNav = ref('calendar')
const calendarView = ref('Week')
const filters = ref({ tasks: true, milestones: true, risks: true })
const loading = ref(false)
const error = ref(null)

function handleNavigate(id) {
  activeNav.value = id
  if (id === 'dashboard') router.push('/dashboard/manager')
  if (id === 'financials') router.push('/manager/financials')
  if (id === 'projects') router.push('/manager/projects')
  if (id === 'tasks') router.push('/manager/tasks')
  if (id === 'teams') router.push('/manager/teams')
  if (id === 'settings') router.push('/manager/settings')
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10)
}

function normalizeStatus(status) {
  const normalized = String(status || 'todo').toLowerCase().replace(/-/g, '_')
  return normalized === 'done' ? 'completed' : normalized
}

function normalizePriority(priority) {
  const normalized = String(priority || 'low').toUpperCase()
  return normalized === 'MEDIUM' ? 'MED' : normalized
}

const today = new Date()
today.setHours(0, 0, 0, 0)

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index)
    return {
      date,
      key: toDateKey(date),
      label: date.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase(),
      num: date.getDate(),
      current: index === 0,
    }
  })
)

const monthLabel = computed(() =>
  today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
)

const typeConfig = {
  task: {
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    label: 'TASK',
  },
  milestone: {
    color: 'bg-primary-light text-primary border-primary/20',
    icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9',
    label: 'MILESTONE',
  },
  risk: {
    color: 'bg-red-50 text-red-600 border-red-200',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    label: 'RISK',
  },
}

const events = computed(() => {
  const roadmapEvents = (aiStore.roadmap || []).map((item, index) => ({
    id: `roadmap-${index}`,
    type: 'milestone',
    date: toDateKey(addDays(today, Math.min(index * 2, 6))),
    title: item.phase || item.title,
    sub: item.title,
    time: item.estimatedDuration || `Phase ${item.order || index + 1}`,
    order: index,
  }))

  const taskEvents = (taskStore.tasks || [])
    .filter(task => normalizeStatus(task.status) !== 'completed')
    .map((task, index) => ({
      id: task._id || `task-${index}`,
      type: 'task',
      date: toDateKey(addDays(today, index % 7)),
      title: task.title,
      sub: task.assignedMember?.name || 'Unassigned',
      time: task.estimatedTime || 'Estimate pending',
      priority: normalizePriority(task.priority),
      order: index,
    }))

  const riskEvents = (aiStore.financialPlan?.risks || []).slice(0, 3).map((risk, index) => ({
    id: `risk-${index}`,
    type: 'risk',
    date: toDateKey(addDays(today, Math.min(index * 3 + 1, 6))),
    title: risk,
    sub: 'Financial risk watchlist',
    time: 'Monitor',
    order: index,
  }))

  return [...roadmapEvents, ...taskEvents, ...riskEvents]
})

const visibleEvents = computed(() =>
  events.value.filter(event => {
    if (event.type === 'task') return filters.value.tasks
    if (event.type === 'milestone') return filters.value.milestones
    if (event.type === 'risk') return filters.value.risks
    return true
  })
)

function eventsForDay(dayKey) {
  return visibleEvents.value
    .filter(event => event.date === dayKey)
    .sort((a, b) => a.order - b.order)
}

const timelineItems = computed(() =>
  visibleEvents.value
    .filter(event => event.date === toDateKey(today))
    .sort((a, b) => a.order - b.order)
)

const stats = computed(() => ({
  total: visibleEvents.value.length,
  tasks: events.value.filter(event => event.type === 'task').length,
  milestones: events.value.filter(event => event.type === 'milestone').length,
  risks: events.value.filter(event => event.type === 'risk').length,
}))

const schedulingInsight = computed(() => {
  const highPriorityTasks = (taskStore.tasks || []).filter(task =>
    normalizeStatus(task.status) !== 'completed' &&
    normalizePriority(task.priority) === 'HIGH'
  )

  if (highPriorityTasks.length >= 3) {
    return {
      label: 'Heavy task load',
      body: `${highPriorityTasks.length} high-priority open tasks are scheduled into this planning week.`,
      recommendation: 'Review ownership and move lower-priority work after the first roadmap milestone.',
    }
  }

  if (stats.value.risks > 0) {
    return {
      label: 'Risk watchlist active',
      body: `${stats.value.risks} AI financial risks are visible on this planning calendar.`,
      recommendation: 'Review the risk items before committing milestone timing.',
    }
  }

  return {
    label: 'Plan looks clear',
    body: 'No major scheduling warnings were derived from the current AI output.',
    recommendation: 'Keep updating task status so this calendar can stay accurate.',
  }
})

onMounted(async () => {
  const projectId = localStorage.getItem('projectId')

  if (!projectId) {
    error.value = 'No active project selected.'
    return
  }

  loading.value = true
  error.value = null

  try {
    await Promise.all([
      aiStore.roadmap.length && aiStore.financialPlan ? Promise.resolve() : aiStore.loadAIOutput(projectId),
      taskStore.loadTasks(projectId),
    ])
  } catch (err) {
    console.error('Failed to load calendar data', err)
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
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-black text-slate-900">Calendar</h1>
        <p class="text-sm text-slate-400 mt-1">AI roadmap, open tasks, and financial risks mapped into a planning week.</p>
      </div>

      <div class="flex items-center gap-3">
        <span class="font-bold text-slate-700">{{ monthLabel }}</span>
      </div>
    </div>

    <div v-if="loading" class="sp-card p-5 text-sm font-semibold text-slate-500">
      Loading calendar data...
    </div>

    <div v-else-if="error" class="sp-card p-5 text-sm font-semibold text-red-500">
      {{ error }}
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2 sp-card p-5">
        <div class="grid grid-cols-7 mb-3">
          <div v-for="day in weekDays" :key="day.key" class="text-center">
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{{ day.label }}</p>
            <div
              class="mx-auto mt-1 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
              :class="day.current ? 'bg-primary text-white' : 'text-slate-700'"
            >
              {{ day.num }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-3 min-h-[420px]">
          <div
            v-for="day in weekDays"
            :key="day.key"
            class="space-y-2 rounded-xl p-2 hover:bg-slate-50 transition-all duration-200"
          >
            <div
              v-for="evt in eventsForDay(day.key)"
              :key="evt.id"
              class="w-full rounded-xl p-2 text-xs font-semibold border transition-all hover:shadow-sm"
              :class="typeConfig[evt.type]?.color || 'bg-slate-100 text-slate-600 border-slate-200'"
            >
              <div class="flex items-center gap-0.5 mb-0.5 opacity-70">
                <svg class="w-2.5 h-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="typeConfig[evt.type].icon" />
                </svg>
                <span class="text-[8px] font-bold tracking-wide">{{ typeConfig[evt.type].label }}</span>
              </div>
              <div class="opacity-60 text-[9px] mb-0.5">{{ evt.time }}</div>
              <p class="line-clamp-3">{{ evt.title }}</p>
              <p v-if="evt.sub" class="text-[9px] opacity-70 mt-1 line-clamp-2">{{ evt.sub }}</p>
            </div>
          </div>
        </div>

        <div class="border-t border-[#e4e4f0] mt-4 pt-4">
          <h3 class="font-bold text-slate-900 mb-4">Today&apos;s Planning Timeline</h3>
          <div v-if="timelineItems.length === 0" class="text-sm text-slate-400">No items mapped to today.</div>
          <div v-else class="space-y-4">
            <div v-for="item in timelineItems" :key="item.id" class="flex items-start gap-4">
              <div class="flex flex-col items-center shrink-0">
                <div class="w-2.5 h-2.5 rounded-full mt-0.5" :class="item.type === 'risk' ? 'bg-red-500' : item.type === 'milestone' ? 'bg-primary' : 'bg-emerald-500'"></div>
                <div class="w-px flex-1 bg-slate-100 mt-1" style="min-height: 28px"></div>
              </div>
              <div class="flex-1 min-w-0 pb-2">
                <p class="text-xs font-bold text-slate-400">{{ item.time }}</p>
                <p class="text-sm font-semibold text-slate-800">{{ item.title }}</p>
                <p v-if="item.sub" class="text-xs text-slate-400">{{ item.sub }}</p>
              </div>
              <span class="shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg border border-[#e4e4f0] text-slate-500">
                {{ typeConfig[item.type].label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="sp-card p-4">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">View</p>
          <div class="flex border border-[#e4e4f0] rounded-xl overflow-hidden mb-4">
            <button
              v-for="v in ['Day', 'Week', 'Month']"
              :key="v"
              @click="calendarView = v"
              class="flex-1 py-2 text-xs font-semibold transition-colors"
              :class="calendarView === v ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'"
            >
              {{ v }}
            </button>
          </div>

          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Filters</p>
          <div class="space-y-2.5">
            <label
              v-for="f in [
                { key: 'tasks', label: 'Tasks' },
                { key: 'milestones', label: 'Roadmap Milestones' },
                { key: 'risks', label: 'Financial Risks' },
              ]"
              :key="f.key"
              class="flex items-center gap-2.5 cursor-pointer"
            >
              <div
                class="w-4 h-4 rounded border-2 border-primary flex items-center justify-center"
                :class="filters[f.key] ? 'bg-primary' : 'bg-white'"
                @click="filters[f.key] = !filters[f.key]"
              >
                <svg v-if="filters[f.key]" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-sm text-slate-700">{{ f.label }}</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="sp-card p-4">
            <p class="text-[10px] font-bold text-slate-400 uppercase">Tasks</p>
            <p class="text-2xl font-black text-slate-900 mt-1">{{ stats.tasks }}</p>
          </div>
          <div class="sp-card p-4">
            <p class="text-[10px] font-bold text-slate-400 uppercase">Phases</p>
            <p class="text-2xl font-black text-slate-900 mt-1">{{ stats.milestones }}</p>
          </div>
          <div class="sp-card p-4">
            <p class="text-[10px] font-bold text-slate-400 uppercase">Risks</p>
            <p class="text-2xl font-black text-slate-900 mt-1">{{ stats.risks }}</p>
          </div>
        </div>

        <div class="sp-card p-4">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.674M12 3v1m6.364.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M8 17a4 4 0 118 0c0 1.5-1 2-1 3H9c0-1-1.5-1-3z" />
            </svg>
            <span class="text-xs font-bold text-primary">AI Scheduling Insight</span>
          </div>

          <div class="bg-slate-50 border border-[#e4e4f0] rounded-xl p-3 mb-3">
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">{{ schedulingInsight.label }}</p>
            <p class="text-xs text-slate-600">{{ schedulingInsight.body }}</p>
          </div>

          <div class="bg-primary-light border border-primary/20 rounded-xl p-3">
            <p class="text-[10px] font-bold text-primary uppercase tracking-wide mb-1">Recommendation</p>
            <p class="text-xs text-primary/80">{{ schedulingInsight.recommendation }}</p>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
