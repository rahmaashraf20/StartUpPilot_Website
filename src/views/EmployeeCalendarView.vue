<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { taskService } from '../services/taskService'
import {
  compareByDueDate,
  extractWorkspaceProject,
  formatShortDate,
  mapApiTask,
} from '../utils/workspaceProject'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import SkeletonBlock from '../components/dashboard/SkeletonBlock.vue'

const auth = useAuthStore()

const activeSection = ref('calendar')
function handleNavigate(id) {
  activeSection.value = id
}

const isLoading = ref(true)
const loadError = ref('')
const currentProject = ref(null)
const tasks = ref([])

onMounted(async () => {
  try {
    loadError.value = ''
    const workspaceId = auth.user?.workspaceId

    if (!workspaceId) {
      throw new Error('No workspace is linked to this employee account yet.')
    }

    const workspaceProjectResponse = await taskService.getProjectsByWorkspace(workspaceId)
    const { project, projectId } = extractWorkspaceProject(workspaceProjectResponse)
    currentProject.value = project

    if (!projectId) {
      throw new Error('No project id was returned for this workspace.')
    }

    const response = await taskService.getProjectTasks(projectId)
    tasks.value = (response.tasks || []).map((task) => mapApiTask(task, project))
  } catch (error) {
    console.error(error)
    loadError.value = error.message || 'Failed to load your calendar.'
  } finally {
    isLoading.value = false
  }
})

function startOfDay(value) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function isPast(event) {
  return startOfDay(event.date) < startOfDay(new Date())
}

function isToday(event) {
  return startOfDay(event.date).getTime() === startOfDay(new Date()).getTime()
}

const TYPE_STYLE = {
  task: 'bg-primary-light text-primary',
  deadline: 'bg-red-50 text-red-500',
  completed: 'bg-emerald-50 text-emerald-600',
}

const TYPE_LABEL = {
  task: 'Task',
  deadline: 'Deadline',
  completed: 'Done',
}

const TYPE_ICON = {
  task: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  deadline: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.25 3h.008v.008h-.008V12z',
  completed: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const events = computed(() =>
  tasks.value
    .filter((task) => task.dueTimestamp)
    .map((task) => {
      const completed = task.done || task.status === 'done'
      const overdue = !completed && new Date(task.dueTimestamp).getTime() < Date.now()

      return {
        id: task.id,
        title: task.title,
        project: task.project,
        date: task.dueTimestamp,
        time: task.dueTime,
        priority: task.priority,
        status: task.status,
        type: completed ? 'completed' : overdue ? 'deadline' : 'task',
      }
    })
)

const FILTERS = ['All', 'Tasks', 'Deadlines', 'Completed']
const SORTS = ['Date', 'Priority']
const TYPE_KEY = { Tasks: 'task', Deadlines: 'deadline', Completed: 'completed' }
const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }

const activeFilter = ref('All')
const activeSort = ref('Date')
const searchQuery = ref('')

const filtered = computed(() => {
  let list = events.value

  const filter = activeFilter.value
  if (filter !== 'All') list = list.filter((event) => event.type === TYPE_KEY[filter])

  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    list = list.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        (event.project || '').toLowerCase().includes(query),
    )
  }

  if (activeSort.value === 'Priority') {
    list = [...list].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  } else {
    list = [...list].sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  return list
})

const grouped = computed(() => {
  const groups = []

  for (const event of filtered.value) {
    const dayKey = startOfDay(event.date).toISOString()
    const last = groups[groups.length - 1]
    if (last && last.dateKey === dayKey) last.events.push(event)
    else groups.push({ dateKey: dayKey, date: event.date, events: [event] })
  }

  return groups
})

const stats = computed(() => [
  { id: 'total', label: 'Scheduled Tasks', value: events.value.length, icon: 'calendar', tone: 'primary' },
  { id: 'today', label: 'Today', value: events.value.filter((event) => isToday(event)).length, icon: 'tasks', tone: 'violet' },
  { id: 'deadlines', label: 'Overdue', value: events.value.filter((event) => event.type === 'deadline').length, icon: 'bell', tone: 'amber' },
  { id: 'completed', label: 'Completed', value: events.value.filter((event) => event.type === 'completed').length, icon: 'messages', tone: 'primary' },
])

const noResults = computed(() => !isLoading.value && filtered.value.length === 0)
const projectName = computed(() => currentProject.value?.basicInfo?.name || 'Workspace Project')
</script>

<template>
  <DashboardLayout :active-id="activeSection" @navigate="handleNavigate">
    <div class="mx-auto w-full max-w-7xl space-y-6 animate-fade-in">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <p class="text-sm font-semibold text-primary">{{ projectName }}</p>
          <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Calendar
          </h1>
          <p class="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Your project task schedule, deadlines, and completed work in one place.
          </p>
        </div>
      </div>

      <template v-if="isLoading">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SkeletonBlock v-for="i in 4" :key="i" height="4.5rem" rounded="1.125rem" />
        </div>
        <SkeletonBlock height="4rem" rounded="1.125rem" />
        <div class="space-y-3">
          <SkeletonBlock v-for="i in 4" :key="i" height="5.5rem" rounded="1.125rem" />
        </div>
      </template>

      <template v-else>
        <div
          v-if="loadError"
          class="sp-card border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600"
        >
          {{ loadError }}
        </div>

        <div class="grid grid-cols-1 gap-4 animate-slide-up sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            v-for="stat in stats"
            :key="stat.id"
            :label="stat.label"
            :value="stat.value"
            :icon="stat.icon"
            :tone="stat.tone"
          />
        </div>

        <section class="sp-card p-4 animate-slide-up sm:p-5" style="animation-delay:60ms">
          <div class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div class="relative min-w-0">
              <svg
                class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>

              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search scheduled tasks..."
                class="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div class="relative w-full lg:w-44">
              <select
                v-model="activeSort"
                class="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-600 shadow-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-violet-100"
              >
                <option v-for="sort in SORTS" :key="sort">
                  {{ sort }}
                </option>
              </select>

              <svg
                class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div
            class="mt-4 flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible"
            role="group"
            aria-label="Filter calendar events"
          >
            <button
              v-for="filter in FILTERS"
              :key="filter"
              type="button"
              class="shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition-all"
              :class="activeFilter === filter
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'"
              @click="activeFilter = filter"
            >
              {{ filter }}
            </button>
          </div>
        </section>

        <div class="space-y-5 animate-slide-up" style="animation-delay: 100ms">
          <div
            v-if="noResults && searchQuery"
            class="sp-card flex flex-col items-center p-10 text-center"
          >
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <svg class="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p class="text-sm font-bold text-slate-700">No calendar items match "{{ searchQuery }}"</p>
            <p class="mt-1 text-xs text-slate-400">Try a different keyword or clear the search.</p>
            <button type="button" class="sp-btn-ghost mt-4 text-xs" @click="searchQuery = ''">
              Clear search
            </button>
          </div>

          <div
            v-else-if="noResults"
            class="sp-card flex flex-col items-center p-10 text-center"
          >
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
              <svg class="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-sm font-bold text-slate-700">No scheduled tasks here</p>
            <p class="mt-1 text-xs text-slate-400">Tasks with due dates will appear on this calendar.</p>
          </div>

          <div
            v-for="group in grouped"
            :key="group.dateKey"
            class="space-y-2.5"
          >
            <div class="flex items-center gap-2 px-1">
              <span
                class="text-xs font-bold uppercase tracking-wide"
                :class="isToday({ date: group.date }) ? 'text-primary' : 'text-slate-400'"
              >
                {{ formatDate(group.date) }}
              </span>
              <span v-if="isToday({ date: group.date })" class="sp-badge bg-primary-light text-primary text-[10px]">Today</span>
              <span v-else-if="isPast({ date: group.date })" class="sp-badge bg-slate-100 text-slate-400 text-[10px]">Past</span>
            </div>

            <div class="sp-card divide-y divide-[#f1f1f7] p-2">
              <div
                v-for="event in group.events"
                :key="event.id"
                class="flex flex-col gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center"
                :class="isPast(event) && event.type !== 'completed' ? 'opacity-70' : ''"
              >
                <div class="flex min-w-0 flex-1 items-start gap-3.5">
                  <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    :class="TYPE_STYLE[event.type]"
                  >
                    <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" :d="TYPE_ICON[event.type]" />
                    </svg>
                  </div>

                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-800">{{ event.title }}</p>
                    <div class="mt-1 flex flex-wrap items-center gap-2">
                      <p v-if="event.project" class="text-xs text-slate-400">{{ event.project }}</p>
                      <span class="sp-badge text-[10px] py-0.5 px-2" :class="TYPE_STYLE[event.type]">
                        {{ TYPE_LABEL[event.type] }}
                      </span>
                      <span class="sp-badge bg-slate-100 text-slate-500 text-[10px] py-0.5 px-2">
                        {{ event.priority }}
                      </span>
                    </div>
                  </div>
                </div>

                <span class="shrink-0 text-left text-xs font-semibold text-slate-500 sm:min-w-[72px] sm:text-right">
                  {{ event.time }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>
