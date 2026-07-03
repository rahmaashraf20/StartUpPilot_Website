<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import SkeletonBlock from '../components/dashboard/SkeletonBlock.vue'
import { mockCalendarEvents } from '../data/mockCalendar'

// Tracks which sidebar section is active on this page (mirrors the pattern
// used in EmployeeTasksView / EmployeeProjectsView so DashboardLayout's
// @navigate is handled consistently everywhere it's used).
const activeSection = ref('calendar')
function handleNavigate(id) {
  activeSection.value = id
}

// ── Loading (prototype mode skeleton) ─────────────────────────────
const isLoading = ref(true)
onMounted(() => setTimeout(() => { isLoading.value = false }, 500))

// ── Local event state (no backend) ─────────────────────────────────
const events = ref(mockCalendarEvents.map((e) => ({ ...e })))

// ── "Today" reference (prototype mode — pinned to the mock data's own
// timeframe so urgency/upcoming logic has something meaningful to show
// against, the same way mockEmployee.js's dates are all clustered
// around a single fixed week rather than the real current date) ─────
const TODAY = new Date('2024-10-23T00:00:00Z')

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function isPast(event) {
  return startOfDay(event.date) < startOfDay(TODAY)
}
function isToday(event) {
  return startOfDay(event.date).getTime() === startOfDay(TODAY).getTime()
}

const TYPE_STYLE = {
  task: 'bg-primary-light text-primary',
  meeting: 'bg-violet-50 text-violet-600',
  deadline: 'bg-red-50 text-red-500',
}
const TYPE_LABEL = {
  task: 'Task',
  meeting: 'Meeting',
  deadline: 'Deadline',
}
const TYPE_ICON = {
  task: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  meeting: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  deadline: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.25 3h.008v.008h-.008V12z',
}

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// ── Filters / Search / Sort ──────────────────────────────────────
const FILTERS = ['All', 'Tasks', 'Meetings', 'Deadlines']
const SORTS = ['Date', 'Type']
const TYPE_KEY = { 'Tasks': 'task', 'Meetings': 'meeting', 'Deadlines': 'deadline' }
const TYPE_ORDER = { task: 0, meeting: 1, deadline: 2 }

const activeFilter = ref('All')
const activeSort = ref('Date')
const searchQuery = ref('')

const filtered = computed(() => {
  let list = events.value

  // Filter
  const f = activeFilter.value
  if (f !== 'All') list = list.filter((e) => e.type === TYPE_KEY[f])

  // Search
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.project || '').toLowerCase().includes(q),
    )
  }

  // Sort
  const s = activeSort.value
  if (s === 'Date') list = [...list].sort((a, b) => new Date(a.date) - new Date(b.date))
  else if (s === 'Type') list = [...list].sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type])

  return list
})

// Grouped by date so the list reads like a real calendar agenda rather
// than a flat table — groups stay in the order produced by `filtered`.
const grouped = computed(() => {
  const groups = []
  for (const event of filtered.value) {
    const last = groups[groups.length - 1]
    if (last && last.date === event.date) last.events.push(event)
    else groups.push({ date: event.date, events: [event] })
  }
  return groups
})

// ── Stats ─────────────────────────────────────────────────────────
const stats = computed(() => [
  { id: 'total', label: 'Total Events', value: events.value.length, icon: 'calendar', tone: 'primary' },
  { id: 'today', label: 'Today', value: events.value.filter((e) => isToday(e)).length, icon: 'tasks', tone: 'violet' },
  { id: 'deadlines', label: 'Deadlines', value: events.value.filter((e) => e.type === 'deadline').length, icon: 'bell', tone: 'amber' },
  { id: 'meetings', label: 'Meetings', value: events.value.filter((e) => e.type === 'meeting').length, icon: 'messages', tone: 'primary' },
])

// ── Empty state helpers ───────────────────────────────────────────
const noResults = computed(() => !isLoading.value && filtered.value.length === 0)
</script>

<template>
  <DashboardLayout :active-id="activeSection" @navigate="handleNavigate">
    <div class="space-y-6 animate-fade-in">

      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Calendar</h1>
        <p class="text-sm text-slate-500 mt-1">Your tasks, meetings, and deadlines in one place.</p>
      </div>

      <!-- Loading Skeleton -->
      <template v-if="isLoading">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonBlock v-for="i in 4" :key="i" height="4.5rem" rounded="1.125rem" />
        </div>
        <SkeletonBlock height="3rem" rounded="1.125rem" />
        <div class="space-y-3">
          <SkeletonBlock v-for="i in 4" :key="i" height="5.5rem" rounded="1.125rem" />
        </div>
      </template>

      <template v-else>
        <!-- Event Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatCard
            v-for="stat in stats"
            :key="stat.id"
            :label="stat.label"
            :value="stat.value"
            :icon="stat.icon"
            :tone="stat.tone"
          />
        </div>

        <!-- Search + Filters + Sort -->
        <div class="animate-slide-up" style="animation-delay: 60ms">
          <!-- Search -->
          <div class="relative mb-3">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              class="sp-input pl-10 pr-4 py-2.5"
              placeholder="Search events by title or project…"
              aria-label="Search calendar events"
            />
          </div>

          <!-- Filter chips + Sort -->
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <!-- Filter chips -->
            <div class="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Filter calendar events">
              <button
                v-for="f in FILTERS"
                :key="f"
                type="button"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border"
                :class="activeFilter === f
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-slate-500 border-[#e4e4f0] hover:bg-slate-50 hover:text-slate-700'"
                @click="activeFilter = f"
              >
                {{ f }}
                <span
                  v-if="f !== 'All'"
                  class="ml-1 opacity-70"
                >
                  {{ events.filter(e => e.type === TYPE_KEY[f]).length }}
                </span>
              </button>
            </div>

            <!-- Sort -->
            <div class="flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <select
                v-model="activeSort"
                class="text-xs font-semibold text-slate-600 bg-white border border-[#e4e4f0] rounded-lg px-2.5 py-1.5 cursor-pointer outline-none hover:bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/10"
                aria-label="Sort calendar events"
              >
                <option v-for="s in SORTS" :key="s">{{ s }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Event List (grouped by date) -->
        <div class="space-y-5 animate-slide-up" style="animation-delay: 100ms">

          <!-- Empty: no search results -->
          <div
            v-if="noResults && searchQuery"
            class="sp-card p-10 flex flex-col items-center text-center"
          >
            <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p class="text-sm font-bold text-slate-700">No events match "{{ searchQuery }}"</p>
            <p class="text-xs text-slate-400 mt-1">Try a different keyword or clear the search.</p>
            <button type="button" class="sp-btn-ghost text-xs mt-4" @click="searchQuery = ''">Clear search</button>
          </div>

          <!-- Empty: filter with no results -->
          <div
            v-else-if="noResults"
            class="sp-card p-10 flex flex-col items-center text-center"
          >
            <div class="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-sm font-bold text-slate-700">No events here</p>
            <p class="text-xs text-slate-400 mt-1">Switch filters to see more of your calendar.</p>
          </div>

          <!-- Date groups -->
          <div
            v-for="group in grouped"
            :key="group.date"
            class="space-y-2.5"
          >
            <div class="flex items-center gap-2 px-1">
              <span class="text-xs font-bold uppercase tracking-wide" :class="isToday({ date: group.date }) ? 'text-primary' : 'text-slate-400'">
                {{ formatDate(group.date) }}
              </span>
              <span v-if="isToday({ date: group.date })" class="sp-badge bg-primary-light text-primary text-[10px]">Today</span>
              <span v-else-if="isPast({ date: group.date })" class="sp-badge bg-slate-100 text-slate-400 text-[10px]">Past</span>
            </div>

            <div class="sp-card p-2 divide-y divide-[#f1f1f7]">
              <div
                v-for="event in group.events"
                :key="event.id"
                class="flex items-start sm:items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                :class="isPast(event) ? 'opacity-60' : ''"
              >
                <div
                  class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  :class="TYPE_STYLE[event.type]"
                >
                  <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="TYPE_ICON[event.type]" />
                  </svg>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-800 truncate">{{ event.title }}</p>
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
                    <p v-if="event.project" class="text-xs text-slate-400 truncate">{{ event.project }}</p>
                    <span
                      class="sp-badge sm:hidden text-[10px] py-0.5 px-2"
                      :class="TYPE_STYLE[event.type]"
                    >
                      {{ TYPE_LABEL[event.type] }}
                    </span>
                  </div>
                </div>

                <div class="hidden sm:flex items-center gap-2 shrink-0">
                  <span class="sp-badge text-xs" :class="TYPE_STYLE[event.type]">
                    {{ TYPE_LABEL[event.type] }}
                  </span>
                </div>

                <span class="text-xs font-semibold text-slate-500 shrink-0 min-w-[72px] text-right">
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