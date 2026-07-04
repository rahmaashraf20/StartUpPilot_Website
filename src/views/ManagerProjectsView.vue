<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import { useAuthUser } from '../composables/useAuthUser'
import { useAIStore } from '../stores/ai'
import { useAuthStore } from '../stores/auth'
import { useTaskStore } from '../stores/tasks'
import { taskService } from '../services/taskService'
import {
  managerSidebarSections,
  managerNotificationsCount,
  mockManagerUser,
} from '../data/mockManager'

const router = useRouter()
const topbarUser = useAuthUser(mockManagerUser)
const auth = useAuthStore()
const aiStore = useAIStore()
const taskStore = useTaskStore()
const activeNav = ref('projects')

function handleNavigate(id) {
  activeNav.value = id
  if (id === 'dashboard') router.push('/dashboard/manager')
  if (id === 'financials') router.push('/manager/financials')
  if (id === 'tasks') router.push('/manager/tasks')
  if (id === 'teams') router.push('/manager/teams')
  if (id === 'calendar') router.push('/manager/calendar')
  if (id === 'settings') router.push('/manager/settings')
}

// View state
const viewMode = ref('grid') // 'grid' | 'list'
const searchQuery = ref('')
const statusFilter = ref('all')
const sortBy = ref('newest')
const openMenuId = ref(null)
const selectedProject = ref(null)
const currentProject = ref(null)
const loading = ref(false)
const error = ref(null)

const avatarColors = [
  'bg-violet-500', 'bg-emerald-500', 'bg-blue-500',
  'bg-orange-500', 'bg-pink-500', 'bg-cyan-500',
]

function normalizeStatus(status) {
  const normalized = String(status || 'todo').toLowerCase().replace(/-/g, '_')
  return normalized === 'done' ? 'completed' : normalized
}

function initialsForName(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function colorForName(name) {
  if (!name) return 'bg-slate-400'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function formatCurrency(value) {
  if (value == null) return 'Not set'
  return `$${Number(value).toLocaleString()}`
}

function formatDate(value) {
  if (!value) return 'Not set'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function inferProjectTitle(overview) {
  const match = String(overview || '').match(/^(.+?)\s+is\s+/i)
  return match?.[1] || 'AI Generated Project'
}

function getTeamFromTasks(tasks) {
  const members = new Map()

  tasks.forEach(task => {
    const member = task.assignedMember
    if (!member?.name || members.has(member._id || member.email || member.name)) return

    members.set(member._id || member.email || member.name, {
      name: member.name,
      initials: initialsForName(member.name),
      color: colorForName(member.name),
    })
  })

  return [...members.values()]
}

function getCurrentPhaseIndex(roadmap, progress) {
  if (!roadmap.length) return 0
  if (progress >= 100) return roadmap.length
  return Math.min(roadmap.length - 1, Math.floor((progress / 100) * roadmap.length))
}

function getRiskLevel(tasks, risks) {
  const openHighPriority = tasks.filter(task =>
    normalizeStatus(task.status) !== 'completed' &&
    String(task.priority || '').toLowerCase() === 'high'
  ).length

  if (openHighPriority >= 3 || risks.length >= 4) return 'High'
  if (openHighPriority > 0 || risks.length > 0) return 'Medium'
  return 'Low'
}

const projects = computed(() => {
  const project = currentProject.value
  const projectId = project?._id || localStorage.getItem('projectId')
  const roadmap = project?.aiOutputs?.roadmap || aiStore.roadmap || []
  const financialPlan = project?.aiOutputs?.financialPlan || aiStore.financialPlan
  const tasks = taskStore.tasks || []
  const overview = project?.aiOutputs?.overview || aiStore.overview

  if (!projectId && !roadmap.length && !overview) return []

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => normalizeStatus(task.status) === 'completed').length
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
  const currentPhaseIndex = getCurrentPhaseIndex(roadmap, progress)
  const risk = getRiskLevel(tasks, financialPlan?.risks || [])
  const status = progress === 100 && totalTasks > 0 ? 'completed' : risk === 'High' ? 'delayed' : 'in_progress'

  return [{
    id: projectId || 'active-project',
    title: project?.basicInfo?.name || inferProjectTitle(overview),
    category: project?.basicInfo?.industry || 'Startup',
    categoryColor: 'text-violet-600 bg-violet-50',
    status,
    progress,
    dueDate: roadmap.length ? `${roadmap.length} phases` : 'Roadmap pending',
    dueDays: 99,
    budget: formatCurrency(financialPlan?.estimatedStartupCost),
    team: [
      ...(project?.teamMembers || []).map(member => ({
        name: member.name || member.email || 'Team member',
        initials: initialsForName(member.name || member.email),
        color: colorForName(member.name || member.email),
      })),
      ...getTeamFromTasks(tasks),
    ].slice(0, 6),
    description: project?.basicInfo?.description || overview || financialPlan?.summary || 'AI-generated roadmap and financial plan.',
    phase: roadmap[currentPhaseIndex]?.phase || roadmap[0]?.phase || 'Planning',
    risk,
    milestones: roadmap.map((item, index) => ({
      label: item.title,
      date: item.estimatedDuration || item.phase,
      done: index < currentPhaseIndex,
    })),
    aiInsight: overview || financialPlan?.summary || 'Generate an AI plan to see project insight.',
    aiRec: financialPlan?.fundingAdvice || financialPlan?.risks?.[0] || 'Keep refining the roadmap as task progress changes.',
    timeline: roadmap.map((item, index) => ({
      label: item.phase || item.title,
      date: item.estimatedDuration || `P${item.order || index + 1}`,
      status: index < currentPhaseIndex ? 'completed' : index === currentPhaseIndex ? 'in_progress' : 'planned',
    })),
  }]
})

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'delayed', label: 'Delayed' },
]

const sortOptions = [
  { value: 'newest', label: 'Sort by: Newest' },
  { value: 'oldest', label: 'Sort by: Oldest' },
  { value: 'progress', label: 'Sort by: Progress' },
  { value: 'budget', label: 'Sort by: Budget' },
]

const filteredProjects = computed(() => {
  let res = projects.value.filter(p => {
    const query = searchQuery.value.trim().toLowerCase()
    const matchSearch = !query ||
      p.title.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    const matchStatus = statusFilter.value === 'all' || p.status === statusFilter.value
    return matchSearch && matchStatus
  })

  if (sortBy.value === 'progress') res = [...res].sort((a, b) => b.progress - a.progress)
  if (sortBy.value === 'budget') {
    res = [...res].sort((a, b) =>
      Number(String(b.budget).replace(/[^\d.]/g, '') || 0) -
      Number(String(a.budget).replace(/[^\d.]/g, '') || 0)
    )
  }
  return res
})

const activeProject = computed(() => selectedProject.value || projects.value[0])
const projectFinancials = computed(() => currentProject.value?.aiOutputs?.financialPlan || aiStore.financialPlan || {})
const projectRoadmap = computed(() => currentProject.value?.aiOutputs?.roadmap || aiStore.roadmap || [])
const projectMeta = computed(() => ({
  name: currentProject.value?.basicInfo?.name || activeProject.value?.title || 'Workspace Project',
  description: currentProject.value?.basicInfo?.description || activeProject.value?.description || 'Project details will appear here.',
  industry: currentProject.value?.basicInfo?.industry || activeProject.value?.category || 'Startup',
  stage: currentProject.value?.marketInfo?.startupStage || 'planning',
  model: currentProject.value?.marketInfo?.businessModel || 'startup',
  manager: currentProject.value?.managerId?.name || topbarUser.value.fullName || 'Manager',
  createdAt: formatDate(currentProject.value?.createdAt),
  roadmapCount: projectRoadmap.value.length,
  teamCount: currentProject.value?.teamMembers?.length || 0,
  startupCost: formatCurrency(projectFinancials.value?.estimatedStartupCost),
  monthlyBurn: formatCurrency(projectFinancials.value?.monthlyBurnRate),
}))

function statusConfig(s) {
  return {
    planning: { label: 'Planning', cls: 'bg-slate-100 text-slate-600' },
    in_progress: { label: 'In Progress', cls: 'bg-blue-50 text-blue-600' },
    completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-600' },
    delayed: { label: 'Delayed', cls: 'bg-red-50 text-red-500' },
  }[s] || { label: s, cls: 'bg-slate-100 text-slate-500' }
}

function progressColor(p, status) {
  if (status === 'delayed') return 'bg-red-400'
  if (status === 'completed') return 'bg-emerald-500'
  if (p >= 70) return 'bg-primary'
  return 'bg-primary'
}

function riskColor(r) {
  return { Low: 'text-emerald-600 bg-emerald-50 border-emerald-200', Medium: 'text-amber-600 bg-amber-50 border-amber-200', High: 'text-red-500 bg-red-50 border-red-200' }[r] || 'text-slate-500 bg-slate-100'
}

function riskDot(r) {
  return { Low: 'bg-emerald-500', Medium: 'bg-amber-500', High: 'bg-red-500' }[r] || 'bg-slate-400'
}

function timelineStatusClass(s) {
  return {
    completed: { dot: 'bg-primary border-primary', label: 'text-slate-500', sub: 'text-slate-400', line: 'bg-primary' },
    in_progress: { dot: 'bg-white border-primary ring-4 ring-primary/20', label: 'text-primary font-bold', sub: 'text-primary/70', line: 'bg-slate-200' },
    upcoming: { dot: 'bg-slate-200 border-slate-300', label: 'text-slate-500', sub: 'text-slate-400', line: 'bg-slate-200' },
    planned: { dot: 'bg-slate-200 border-slate-300', label: 'text-slate-400', sub: 'text-slate-300', line: '' },
  }[s] || {}
}

function toggleMenu(id) { openMenuId.value = openMenuId.value === id ? null : id }
function closeMenus() { openMenuId.value = null }
function selectProject(p) { selectedProject.value = p }

onMounted(async () => {
  const workspaceId = auth.user?.workspaceId

  if (!workspaceId) {
    error.value = 'No workspace is linked to this manager account.'
    return
  }

  loading.value = true
  error.value = null

  try {
    const projectResponse = await taskService.getProjectsByWorkspace(workspaceId)
    const project = projectResponse.project || projectResponse
    const projectId = projectResponse.projectId || project?._id

    currentProject.value = project
    if (projectId) localStorage.setItem('projectId', projectId)

    if (project?.aiOutputs) {
      aiStore.overview = project.aiOutputs.overview || ''
      aiStore.roadmap = project.aiOutputs.roadmap || []
      aiStore.financialPlan = project.aiOutputs.financialPlan || null
    }

    if (projectId) {
      await taskStore.loadTasks(projectId)
    }
  } catch (err) {
    console.error('Failed to load project data', err)
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
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-[28px] font-black text-slate-900">Projects</h1>
        <p class="text-sm text-slate-500 mt-1">Manage and track all startup projects.</p>
      </div>
      <!-- Grid/List toggle + New Project -->
      <div class="flex items-center gap-3">
        <div class="flex border border-[#e4e4f0] rounded-xl overflow-hidden bg-white shadow-card">
          <button
            v-for="mode in ['grid', 'list']"
            :key="mode"
            @click="viewMode = mode"
            class="px-4 py-2 text-xs font-semibold capitalize transition-colors"
            :class="viewMode === mode ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'"
          >{{ mode === 'grid' ? 'Grid' : 'List' }}</button>
        </div>

      </div>
    </div>

 
   <!-- Filters -->
<div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-6">

  <!-- Search -->
  <div class="relative flex-1">
    <svg
      class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
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
      type="text"
      placeholder="Search projects..."
      class="sp-input !pl-12"
    />
  </div>

  <!-- Status -->
  <div class="relative !w-full lg:!w-52 shrink-0">
  <select
    v-model="statusFilter"
    class="sp-input appearance-none pr-10"
  >
    <option
      v-for="o in statusOptions"
      :key="o.value"
      :value="o.value"
    >
      {{ o.label }}
    </option>
  </select>

  <svg
    class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6 9l6 6 6-6"
    />
  </svg>
</div>

  <!-- Sort -->
  <div class="relative !w-full lg:!w-56 shrink-0">
  <select
    v-model="sortBy"
    class="sp-input appearance-none pr-10"
  >
    <option
      v-for="o in sortOptions"
      :key="o.value"
      :value="o.value"
    >
      {{ o.label }}
    </option>
  </select>

  <svg
    class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6 9l6 6 6-6"
    />
  </svg>
</div>

</div>

    <div v-if="loading" class="sp-card p-5 mb-6 text-sm font-semibold text-slate-500">
      Loading project data...
    </div>
    <div v-else-if="error" class="sp-card p-5 mb-6 text-sm font-semibold text-red-500">
      {{ error }}
    </div>

    <section
      v-else-if="currentProject"
      class="sp-card mb-6 overflow-hidden"
    >
      <div class="grid grid-cols-1 gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div class="p-5 sm:p-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="mb-3 flex flex-wrap items-center gap-2">
                <span class="rounded-full bg-primary-light px-3 py-1 text-xs font-black uppercase tracking-wide text-primary">
                  {{ projectMeta.industry }}
                </span>
                <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-500">
                  {{ projectMeta.stage }}
                </span>
                <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-600">
                  {{ projectMeta.model }}
                </span>
              </div>

              <h2 class="text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                {{ projectMeta.name }}
              </h2>
              <p class="mt-3 max-w-4xl text-sm leading-6 text-slate-500">
                {{ projectMeta.description }}
              </p>
            </div>

            <button class="sp-btn-primary shrink-0 text-sm" @click="handleNavigate('tasks')">
              View Tasks
            </button>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p class="text-[10px] font-black uppercase tracking-wide text-slate-400">
                Roadmap
              </p>
              <p class="mt-1 text-xl font-black text-slate-900">
                {{ projectMeta.roadmapCount }}
              </p>
              <p class="text-xs text-slate-400">
                milestones
              </p>
            </div>
            <div class="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p class="text-[10px] font-black uppercase tracking-wide text-slate-400">
                Team
              </p>
              <p class="mt-1 text-xl font-black text-slate-900">
                {{ projectMeta.teamCount }}
              </p>
              <p class="text-xs text-slate-400">
                members
              </p>
            </div>
            <div class="rounded-lg border border-violet-100 bg-violet-50 p-4">
              <p class="text-[10px] font-black uppercase tracking-wide text-violet-600">
                Startup cost
              </p>
              <p class="mt-1 text-xl font-black text-slate-900">
                {{ projectMeta.startupCost }}
              </p>
              <p class="text-xs text-violet-500">
                estimate
              </p>
            </div>
            <div class="rounded-lg border border-amber-100 bg-amber-50 p-4">
              <p class="text-[10px] font-black uppercase tracking-wide text-amber-600">
                Monthly burn
              </p>
              <p class="mt-1 text-xl font-black text-slate-900">
                {{ projectMeta.monthlyBurn }}
              </p>
              <p class="text-xs text-amber-600">
                planned
              </p>
            </div>
          </div>
        </div>

        <aside class="border-t border-slate-100 bg-slate-50/80 p-5 sm:p-6 xl:border-l xl:border-t-0">
          <p class="text-xs font-black uppercase tracking-wide text-slate-400">
            Project owner
          </p>
          <div class="mt-3 flex items-center gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white" :class="colorForName(projectMeta.manager)">
              {{ initialsForName(projectMeta.manager) }}
            </div>
            <div class="min-w-0">
              <p class="font-black text-slate-900">
                {{ projectMeta.manager }}
              </p>
              <p class="text-xs text-slate-400">
                Created {{ projectMeta.createdAt }}
              </p>
            </div>
          </div>

          <div class="mt-5 rounded-xl bg-white p-4">
            <p class="text-xs font-black uppercase tracking-wide text-slate-400">
              AI overview
            </p>
            <p class="mt-2 line-clamp-5 text-sm leading-6 text-slate-500">
              {{ currentProject.aiOutputs?.overview || 'AI overview is not available yet.' }}
            </p>
          </div>
        </aside>
      </div>
    </section>

    <!-- Main Content -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6" @click="closeMenus">

      <!-- Projects Grid/List -->
      <div class="xl:col-span-2">

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="sp-card p-5 hover:shadow-elevated transition-all duration-200 cursor-pointer group"
            :class="project.status === 'delayed' ? 'border-red-200' : activeProject?.id === project.id ? 'border-primary/40' : ''"
            @click="selectProject(project)"
          >
            <!-- Top row -->
            <div class="flex items-start justify-between mb-3">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide" :class="project.categoryColor">{{ project.category }}</span>
              <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full" :class="statusConfig(project.status).cls">{{ statusConfig(project.status).label }}</span>
            </div>

            <!-- Title -->
            <h3 class="font-black text-slate-900 text-base leading-tight mb-3">{{ project.title }}</h3>

            <!-- Progress -->
            <div class="mb-4">
              <div class="flex justify-between text-xs mb-1.5">
                <span class="text-slate-500 font-medium">Progress</span>
                <span class="font-bold text-slate-800">{{ project.progress }}%</span>
              </div>
              <div class="w-full h-2 bg-slate-100 rounded-full">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="progressColor(project.progress, project.status)"
                  :style="`width: ${project.progress}%`"
                ></div>
              </div>
            </div>

            <!-- Team + Due -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex -space-x-1.5">
                <div
                  v-for="(member, i) in project.team"
                  :key="i"
                  class="w-7 h-7 rounded-full border-2 border-white text-white flex items-center justify-center text-[9px] font-bold"
                  :class="member.color"
                >{{ member.initials }}</div>
              </div>
              <div class="text-right">
                <p class="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Roadmap</p>
                <p class="text-xs font-bold" :class="project.status === 'delayed' ? 'text-red-500' : project.dueDays <= 1 ? 'text-amber-500' : 'text-slate-700'">{{ project.dueDate }}</p>
              </div>
            </div>

            <!-- Budget + menu -->
            <div class="flex items-center justify-between border-t border-slate-100 pt-3">
              <span class="text-sm font-semibold text-slate-700">Budget: <span class="text-slate-900">{{ project.budget }}</span></span>
              <div class="relative" @click.stop>
                <button
                  class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100"
                  @click="toggleMenu(project.id)"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
                <div v-if="openMenuId === project.id" class="absolute right-0 bottom-8 w-36 sp-card py-1 z-20 shadow-elevated">
                  <button class="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">View Details</button>
                  <button class="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Edit Project</button>
                  <button class="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Archive</button>
                  <button class="w-full text-left px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50">Delete</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredProjects.length === 0" class="col-span-2 sp-card p-12 text-center">
            <div class="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p class="font-bold text-slate-800">No projects found</p>
            <p class="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
          </div>
        </div>

        <!-- List View -->
        <div v-else class="space-y-3">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="sp-card p-4 hover:shadow-elevated transition-all duration-200 cursor-pointer group flex items-center gap-4"
            :class="project.status === 'delayed' ? 'border-red-200' : ''"
            @click="selectProject(project)"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md" :class="project.categoryColor">{{ project.category }}</span>
                <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full" :class="statusConfig(project.status).cls">{{ statusConfig(project.status).label }}</span>
              </div>
              <p class="font-bold text-slate-900 text-sm">{{ project.title }}</p>
              <p class="text-xs text-slate-400 mt-0.5 truncate">{{ project.description }}</p>
            </div>
            <div class="w-32 shrink-0">
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-400">Progress</span>
                <span class="font-bold text-slate-700">{{ project.progress }}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full">
                <div class="h-full rounded-full" :class="progressColor(project.progress, project.status)" :style="`width: ${project.progress}%`"></div>
              </div>
            </div>
            <div class="flex -space-x-1.5 shrink-0">
              <div v-for="(m, i) in project.team" :key="i" class="w-7 h-7 rounded-full border-2 border-white text-white flex items-center justify-center text-[9px] font-bold" :class="m.color">{{ m.initials }}</div>
            </div>
            <div class="text-right shrink-0 w-24">
              <p class="text-[9px] text-slate-400 uppercase font-semibold tracking-wide">Roadmap</p>
              <p class="text-xs font-bold" :class="project.status === 'delayed' ? 'text-red-500' : 'text-slate-700'">{{ project.dueDate }}</p>
            </div>
            <span class="text-sm font-semibold text-slate-700 shrink-0 w-20 text-right">{{ project.budget }}</span>
            <div class="relative shrink-0" @click.stop>
              <button class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100" @click="toggleMenu(project.id)">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
              </button>
              <div v-if="openMenuId === project.id" class="absolute right-0 top-8 w-36 sp-card py-1 z-20 shadow-elevated">
                <button class="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">View Details</button>
                <button class="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Edit Project</button>
                <button class="w-full text-left px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Project Insight Panel -->
      <div class="sp-card p-5 h-fit">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-black text-slate-900">AI Project Insight</h3>
          <div class="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center">
            <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.674M12 3v1m6.364.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M8 17a4 4 0 118 0c0 1.5-1 2-1 3H9c0-1-1.5-1-3z" />
            </svg>
          </div>
        </div>

        <!-- Project selector tabs -->
        <div class="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1">
          <button
            v-for="p in projects"
            :key="p.id"
            @click="selectProject(p)"
            class="flex-1 text-[10px] font-semibold py-1 rounded-lg transition-all truncate"
            :class="activeProject?.id === p.id ? 'bg-white text-primary shadow-card' : 'text-slate-400 hover:text-slate-600'"
          >{{ p.title.split(' ')[0] }}</button>
        </div>

        <!-- Overview -->
        <div class="mb-4">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Overview</p>
          <p class="text-xs text-slate-600 leading-relaxed">{{ activeProject?.aiInsight }}</p>
        </div>

        <!-- Phase + Completion -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-slate-50 rounded-xl p-3">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Current Phase</p>
            <p class="text-sm font-bold text-primary">{{ activeProject?.phase }}</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Completion</p>
            <p class="text-sm font-bold text-slate-900">{{ activeProject?.progress }}%</p>
          </div>
        </div>

        <!-- Milestones -->
        <div class="mb-4">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Upcoming Milestones</p>
          <div class="space-y-2">
            <div v-for="m in activeProject?.milestones" :key="m.label" class="flex items-center gap-2">
              <div class="w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors" :class="m.done ? 'bg-primary border-primary' : 'border-slate-300'">
                <svg v-if="m.done" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span class="flex-1 text-xs text-slate-700 font-medium">{{ m.label }}</span>
              <span class="text-[10px] text-slate-400 font-semibold">{{ m.date }}</span>
            </div>
          </div>
        </div>

        <!-- Risk Level -->
        <div class="flex items-center justify-between mb-4 px-3 py-2 rounded-xl border" :class="riskColor(activeProject?.risk)">
          <span class="text-xs font-bold">Risk Level: {{ activeProject?.risk }}</span>
          <div class="w-2.5 h-2.5 rounded-full" :class="riskDot(activeProject?.risk)"></div>
        </div>

        <!-- AI Recommendation -->
        <div class="bg-primary-light rounded-xl p-3">
          <p class="text-[10px] font-bold text-primary uppercase tracking-wide mb-1.5">AI Recommendation</p>
          <p class="text-xs text-primary/80 leading-relaxed italic">"{{ activeProject?.aiRec }}"</p>
        </div>
      </div>
    </div>

    <!-- Project Timeline -->
    <div class="sp-card p-6">
      <h3 class="font-black text-slate-900 mb-6">Project Timeline View</h3>

      <div class="relative">
        <!-- Timeline line -->
        <div class="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 mx-8"></div>

        <!-- Nodes -->
        <div class="relative flex justify-between">
          <div
            v-for="(step, i) in activeProject?.timeline"
            :key="i"
            class="flex flex-col items-center text-center w-1/5"
          >
            <!-- Date badge -->
            <div
              class="text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 z-10"
              :class="step.status === 'in_progress' ? 'bg-primary text-white' : step.status === 'completed' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'"
            >{{ step.date }}</div>

            <!-- Dot -->
            <div
              class="w-4 h-4 rounded-full border-2 z-10 transition-all"
              :class="timelineStatusClass(step.status).dot"
            ></div>

            <!-- Label -->
            <p class="text-xs mt-2 leading-tight" :class="timelineStatusClass(step.status).label">{{ step.label }}</p>
            <p class="text-[10px] capitalize mt-0.5" :class="timelineStatusClass(step.status).sub">
              {{ step.status === 'in_progress' ? 'In Progress' : step.status.charAt(0).toUpperCase() + step.status.slice(1) }}
            </p>
          </div>
        </div>
      </div>
    </div>

  </DashboardLayout>
</template>
