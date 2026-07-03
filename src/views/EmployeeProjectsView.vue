<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import ProjectCard from '../components/dashboard/ProjectCard.vue'
import SkeletonBlock from '../components/dashboard/SkeletonBlock.vue'
import { mockProjects } from '../data/mockProjects'

// Tracks which sidebar section is active on this page (mirrors the pattern
// used in EmployeeDashboardView / EmployeeTasksView so DashboardLayout's
// @navigate is handled consistently everywhere it's used).
const activeSection = ref('projects')
function handleNavigate(id) {
  activeSection.value = id
}

// ── Loading (prototype mode skeleton) ─────────────────────────────
const isLoading = ref(true)
onMounted(() => setTimeout(() => { isLoading.value = false }, 500))

// ── Local project state ────────────────────────────────────────────
const projects = ref(mockProjects.map((p) => ({ ...p, team: p.team.map((m) => ({ ...m })) })))

// ── Filters / Search / Sort ──────────────────────────────────────
const FILTERS = ['All', 'Active', 'Completed', 'At Risk']
const SORTS = ['Progress', 'Name', 'Due Date']
const STATUS_KEY = { 'Active': 'active', 'Completed': 'completed', 'At Risk': 'at-risk' }

const activeFilter = ref('All')
const activeSort = ref('Progress')
const searchQuery = ref('')

const filtered = computed(() => {
  let list = projects.value

  // Filter
  const f = activeFilter.value
  if (f !== 'All') list = list.filter((p) => p.status === STATUS_KEY[f])

  // Search
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q),
    )
  }

  // Sort
  const s = activeSort.value
  if (s === 'Progress') list = [...list].sort((a, b) => b.progress - a.progress)
  else if (s === 'Name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
  else if (s === 'Due Date') list = [...list].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  return list
})

// ── Stats ─────────────────────────────────────────────────────────
const stats = computed(() => [
  { id: 'total', label: 'Total Projects', value: projects.value.length, icon: 'tasks', tone: 'primary' },
  { id: 'active', label: 'Active', value: projects.value.filter((p) => p.status === 'active').length, icon: 'messages', tone: 'violet' },
  { id: 'completed', label: 'Completed', value: projects.value.filter((p) => p.status === 'completed').length, icon: 'bell', tone: 'primary' },
  { id: 'at-risk', label: 'At Risk', value: projects.value.filter((p) => p.status === 'at-risk').length, icon: 'calendar', tone: 'amber' },
])

// ── Empty state helpers ───────────────────────────────────────────
const noResults = computed(() => !isLoading.value && filtered.value.length === 0)
</script>

<template>
  <DashboardLayout :active-id="activeSection" @navigate="handleNavigate">
    <div class="space-y-6 animate-fade-in">

      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">My Projects</h1>
        <p class="text-sm text-slate-500 mt-1">Track progress across every project you're contributing to.</p>
      </div>

      <!-- Loading Skeleton -->
      <template v-if="isLoading">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonBlock v-for="i in 4" :key="i" height="4.5rem" rounded="1.125rem" />
        </div>
        <SkeletonBlock height="3rem" rounded="1.125rem" />
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonBlock v-for="i in 6" :key="i" height="11rem" rounded="1.125rem" />
        </div>
      </template>

      <template v-else>
        <!-- Project Stats -->
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

       <!-- Search + Sort -->
<div class="animate-slide-up" style="animation-delay: 60ms">

  <div class="flex items-center justify-between gap-4 flex-wrap">

    <!-- Search -->
    <div class="relative w-full lg:max-w-3xl">
      <svg
        class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search projects by name, owner, or description..."
        class="w-full h-11 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm shadow-sm focus:border-primary focus:ring-4 focus:ring-violet-100 focus:outline-none"
      />
    </div>

   <!-- Sort -->
<div class="flex items-center gap-2 shrink-0">
  <svg
    class="w-4 h-4 text-slate-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
    />
  </svg>

  <div class="relative">
    <select
      v-model="activeSort"
      class="appearance-none h-11 rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-600 shadow-sm focus:border-primary focus:ring-4 focus:ring-violet-100 focus:outline-none"
      aria-label="Sort projects"
    >
      <option v-for="s in SORTS" :key="s">
        {{ s }}
      </option>
    </select>

    <svg
      class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
</div>

  </div>

  <!-- Filters -->
  <div
    class="mt-4 flex items-center gap-2 flex-wrap"
    role="group"
    aria-label="Filter projects"
  >
    <button
      v-for="f in FILTERS"
      :key="f"
      type="button"
      class="px-4 py-2 rounded-xl text-sm font-semibold transition-all border"
      :class="activeFilter === f
        ? 'bg-primary text-white border-primary shadow-sm'
        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'"
      @click="activeFilter = f"
    >
      {{ f }}

      <span
        v-if="f !== 'All'"
        class="ml-1 opacity-70"
      >
        {{ projects.filter(p => p.status === STATUS_KEY[f]).length }}
      </span>
    </button>
  </div>

</div>

        <!-- Project Grid -->
        <div class="animate-slide-up" style="animation-delay: 100ms">

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
            <p class="text-sm font-bold text-slate-700">No projects match "{{ searchQuery }}"</p>
            <p class="text-xs text-slate-400 mt-1">Try a different keyword or clear the search.</p>
            <button type="button" class="sp-btn-ghost text-xs mt-4" @click="searchQuery = ''">Clear search</button>
          </div>

          <!-- Empty: filter with no results -->
          <div
            v-else-if="noResults && activeFilter === 'Completed'"
            class="sp-card p-10 flex flex-col items-center text-center"
          >
            <div class="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-sm font-bold text-slate-700">No completed projects yet</p>
            <p class="text-xs text-slate-400 mt-1">Finish a project and it'll show up here.</p>
          </div>

          <div
            v-else-if="noResults"
            class="sp-card p-10 flex flex-col items-center text-center"
          >
            <div class="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p class="text-sm font-bold text-slate-700">No projects here</p>
            <p class="text-xs text-slate-400 mt-1">Switch filters to see more projects.</p>
          </div>

          <!-- Project cards -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProjectCard
              v-for="(project, idx) in filtered"
              :key="project.id"
              :project="project"
              :style="{ animationDelay: `${idx * 50}ms` }"
            />
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>