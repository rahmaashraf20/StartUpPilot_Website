<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import { useAuthUser } from '../composables/useAuthUser'
import { taskService } from '../services/taskService'
import {
  managerSidebarSections,
  managerNotificationsCount,
  mockManagerUser,
} from '../data/mockManager'

const router = useRouter()
const topbarUser = useAuthUser(mockManagerUser)
const activeNav = ref('tasks')

function handleNavigate(id) {
  activeNav.value = id
  if (id === 'dashboard') router.push('/dashboard/manager')
  if (id === 'financials') router.push('/manager/financials')
  if (id === 'teams') router.push('/manager/teams')
  if (id === 'calendar') router.push('/manager/calendar')
  if (id === 'settings') router.push('/manager/settings')
  if (id === 'projects') router.push('/manager/projects')
}

// Filters
const searchQuery = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const assigneeFilter = ref('all')
const sortBy = ref('estimated_time')

// Active dropdown for 3-dot menus
const openMenuId = ref(null)
const tasks = ref([])
const loading = ref(false)
const error = ref(null)
const showCreateModal = ref(false)
const creatingTask = ref(false)
const createError = ref(null)
const createForm = ref({
  title: '',
  description: '',
  assignedMember: '',
  manualAssignedMember: '',
  priority: 'high',
  status: 'todo',
})
// ألوان بنلفّ عليها للـ avatar بشكل ثابت حسب الاسم
const avatarColors = [
  'bg-violet-500', 'bg-emerald-500', 'bg-blue-500',
  'bg-orange-500', 'bg-pink-500', 'bg-cyan-500',
]

function colorForName(name) {
  if (!name) return 'bg-slate-400'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function initialsForName(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function normalizeStatus(status) {
  const normalized = String(status || 'todo').toLowerCase().replace(/-/g, '_')
  return normalized === 'done' ? 'completed' : normalized
}

function normalizePriority(priority) {
  const normalized = String(priority || 'low').toUpperCase()
  return normalized === 'MEDIUM' ? 'MED' : normalized
}

function estimatedWeeks(value) {
  const match = String(value || '').match(/\d+/)
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER
}

function normalizeTask(t) {
  const memberName = t.assignedMember?.name || 'Unassigned'

  return {
    ...t,
    id: t._id,
    description: t.description || '',
    project: t.project?.name || t.projectName || t.projectId || '',
    progress: t.progress ?? 0,
    status: normalizeStatus(t.status),
    priority: normalizePriority(t.priority),
    estimatedTime: t.estimatedTime || 'Not estimated',
    updatedAt: t.updatedAt || t.createdAt || '',
    assignee: {
      name: memberName,
      initials: initialsForName(memberName),
      color: colorForName(memberName),
      specialization: t.assignedMember?.specialization || '',
    },
  }
}

async function loadTasks() {
  loading.value = true
  error.value = null

  try {
    const projectId = localStorage.getItem('projectId')

    if (!projectId) {
      tasks.value = []
      error.value = 'No active project selected.'
      return
    }

    const response = await taskService.getProjectTasks(projectId)

    console.log('TASKS =>', response)

    tasks.value = (response.tasks || []).map(normalizeTask)
  } catch (err) {
    console.error(err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}


const statusOptions = [
  { value: 'all', label: 'Status: All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
]

const priorityOptions = [
  { value: 'all', label: 'Priority: All' },
  { value: 'HIGH', label: 'High' },
  { value: 'MED', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
]

const assigneeOptions = computed(() => {
  const names = [...new Set(tasks.value.map(t => t.assignee.name).filter(Boolean))]
  return [
    { value: 'all', label: 'Assignee: All' },
    ...names.map(name => ({ value: name, label: name })),
  ]
})

const memberOptions = computed(() => {
  const members = new Map()

  tasks.value.forEach(task => {
    const member = task.assignedMember
    if (!member?._id || members.has(member._id)) return
    members.set(member._id, {
      id: member._id,
      name: member.name || member.email || member._id,
      specialization: member.specialization || member.role || '',
    })
  })

  return [...members.values()]
})

const sortOptions = [
  { value: 'estimated_time', label: 'Sort: Estimate' },
  { value: 'priority', label: 'Sort: Priority' },
  { value: 'status', label: 'Sort: Status' },
  { value: 'recent', label: 'Sort: Recently Updated' },
]

const filteredTasks = computed(() => {
  let result = tasks.value.filter(t => {
    const title = String(t.title || '').toLowerCase()
    const description = String(t.description || '').toLowerCase()
    const query = searchQuery.value.trim().toLowerCase()
    const matchSearch = !query || title.includes(query) || description.includes(query)
    const matchStatus = statusFilter.value === 'all' || t.status === statusFilter.value
    const matchPriority = priorityFilter.value === 'all' || t.priority === priorityFilter.value
    const matchAssignee = assigneeFilter.value === 'all' || t.assignee.name === assigneeFilter.value
    return matchSearch && matchStatus && matchPriority && matchAssignee
  })

  const priorityOrder = { HIGH: 0, MED: 1, LOW: 2 }
  const statusOrder = { blocked: 0, in_progress: 1, review: 2, todo: 3, completed: 4 }

  if (sortBy.value === 'priority') result = [...result].sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99))
  else if (sortBy.value === 'estimated_time') result = [...result].sort((a, b) => estimatedWeeks(a.estimatedTime) - estimatedWeeks(b.estimatedTime))
  else if (sortBy.value === 'status') result = [...result].sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99))
  else if (sortBy.value === 'recent') result = [...result].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  return result
})

const stats = computed(() => ({
  total: tasks.value.length,
  completed: tasks.value.filter(t => t.status === 'completed').length,
  inProgress: tasks.value.filter(t => t.status === 'in_progress').length,
  unassigned: tasks.value.filter(t => t.assignee.name === 'Unassigned').length,
}))

const completionRate = computed(() => {
  if (!stats.value.total) return 0
  return Math.round((stats.value.completed / stats.value.total) * 100)
})

const estimatedTimeline = computed(() =>
  tasks.value
    .filter(t => t.status !== 'completed')
    .sort((a, b) => estimatedWeeks(a.estimatedTime) - estimatedWeeks(b.estimatedTime))
    .slice(0, 4)
)

const teamWorkload = computed(() => {
  const assignedTasks = tasks.value.filter(t => t.assignee.name !== 'Unassigned')
  const taskCounts = assignedTasks.reduce((counts, task) => {
    counts[task.assignee.name] = (counts[task.assignee.name] || 0) + 1
    return counts
  }, {})
  const maxTasks = Math.max(1, ...Object.values(taskCounts))

  const members = new Map()

  assignedTasks.forEach(task => {
    const existing = members.get(task.assignee.name)
    if (existing) {
      existing.tasks += 1
      existing.capacity = Math.round((existing.tasks / maxTasks) * 100)
      return
    }

    members.set(task.assignee.name, {
      name: task.assignee.name,
      initials: task.assignee.initials,
      color: task.assignee.color,
      specialization: task.assignee.specialization,
      tasks: 1,
      capacity: Math.round((1 / maxTasks) * 100),
    })
  })

  return [...members.values()].sort((a, b) => b.tasks - a.tasks)
})

const productivityScore = computed(() => {
  return completionRate.value
})

const tasksAtRisk = computed(() =>
  tasks.value
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      const priorityOrder = { HIGH: 0, MED: 1, LOW: 2 }
      return (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99) || estimatedWeeks(a.estimatedTime) - estimatedWeeks(b.estimatedTime)
    })
    .slice(0, 3)
)

const recommendedTasks = computed(() =>
  tasksAtRisk.value.slice(0, 2)
)

function priorityConfig(p) {
  return {
    HIGH: { label: 'High', cls: 'bg-red-50 text-red-500 border border-red-100' },
    MED: { label: 'Medium', cls: 'bg-amber-50 text-amber-600 border border-amber-100' },
    LOW: { label: 'Low', cls: 'bg-slate-100 text-slate-500 border border-slate-200' },
  }[p] || { label: p, cls: 'bg-slate-100 text-slate-400' }
}

function statusConfig(s) {
  return {
    todo: { label: 'To Do', cls: 'bg-slate-100 text-slate-600' },
    in_progress: { label: 'In Progress', cls: 'bg-blue-50 text-blue-600' },
    review: { label: 'Review', cls: 'bg-violet-50 text-violet-600' },
    completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-600' },
    blocked: { label: 'Blocked', cls: 'bg-red-50 text-red-600' },
  }[s] || { label: s, cls: 'bg-slate-100 text-slate-400' }
}

function progressColor(p) {
  if (p >= 80) return 'bg-emerald-500'
  if (p >= 50) return 'bg-primary'
  if (p >= 20) return 'bg-amber-400'
  return 'bg-slate-300'
}

async function toggleTask(id) {
  const t = tasks.value.find(t => t.id === id)
  if (!t) return

  const previousStatus = t.status
  const nextStatus = t.status === 'completed' ? 'todo' : 'completed'
  t.status = nextStatus

  try {
    const data = await taskService.updateTaskStatus(id, nextStatus)
    if (data?.task) Object.assign(t, normalizeTask(data.task))
  } catch (err) {
    t.status = previousStatus
    error.value = err.message
    console.error(err)
  }
}

function resetCreateForm() {
  createForm.value = {
    title: '',
    description: '',
    assignedMember: memberOptions.value[0]?.id || '',
    manualAssignedMember: '',
    priority: 'high',
    status: 'todo',
  }
  createError.value = null
}

function openCreateModal() {
  resetCreateForm()
  showCreateModal.value = true
}

function closeCreateModal() {
  if (creatingTask.value) return
  showCreateModal.value = false
  createError.value = null
}

async function submitCreateTask() {
  createError.value = null

  const projectId = localStorage.getItem('projectId')
  const assignedMember = createForm.value.assignedMember === '__manual__'
    ? createForm.value.manualAssignedMember.trim()
    : createForm.value.assignedMember

  if (!projectId) {
    createError.value = 'No active project selected.'
    return
  }

  if (!createForm.value.title.trim()) {
    createError.value = 'Task title is required.'
    return
  }

  if (!createForm.value.description.trim()) {
    createError.value = 'Task description is required.'
    return
  }

  if (!assignedMember) {
    createError.value = 'Assigned member is required.'
    return
  }

  creatingTask.value = true

  try {
    const payload = {
      title: createForm.value.title.trim(),
      description: createForm.value.description.trim(),
      assignedMember,
      priority: createForm.value.priority,
      status: createForm.value.status,
    }

    const data = await taskService.createTask(projectId, payload)

    if (data?.task) {
      tasks.value.unshift(normalizeTask(data.task))
    } else {
      await loadTasks()
    }

    showCreateModal.value = false
  } catch (err) {
    console.error('CREATE TASK ERROR =>', err)
    createError.value = err.message
  } finally {
    creatingTask.value = false
  }
}

function toggleMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function closeMenu() {
  openMenuId.value = null
}
onMounted(() => {
  loadTasks()
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
        <h1 class="text-[28px] font-black text-slate-900">Tasks</h1>
        <p class="text-sm text-slate-500 mt-1">Manage your team's work, priorities and upcoming deadlines.</p>
      </div>
      <button class="sp-btn-primary gap-2" @click="openCreateModal">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create Task
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="sp-card p-5 hover:shadow-elevated transition-shadow duration-200 cursor-default">
        <div class="flex items-start justify-between mb-3">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Tasks</p>
          <div class="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center">
            <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        <p class="text-3xl font-black text-slate-900">{{ stats.total }}</p>
        <p class="text-xs text-slate-400 mt-1">across all projects</p>
      </div>

      <div class="sp-card p-5 hover:shadow-elevated transition-shadow duration-200 cursor-default">
        <div class="flex items-start justify-between mb-3">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completed</p>
          <div class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
            <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="text-3xl font-black text-emerald-600">{{ stats.completed }}</p>
        <div class="w-full h-1.5 bg-slate-100 rounded-full mt-2">
          <div class="h-full rounded-full bg-emerald-500 transition-all" :style="`width: ${completionRate}%`"></div>
        </div>
        <p class="text-xs text-slate-400 mt-1">{{ completionRate }}% completion rate</p>
      </div>

      <div class="sp-card p-5 hover:shadow-elevated transition-shadow duration-200 cursor-default">
        <div class="flex items-start justify-between mb-3">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">In Progress</p>
          <div class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg class="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="text-3xl font-black text-blue-600">{{ stats.inProgress }}</p>
        <p class="text-xs text-slate-400 mt-1">actively being worked on</p>
      </div>

      <div class="sp-card p-5 hover:shadow-elevated transition-shadow duration-200 cursor-default">
        <div class="flex items-start justify-between mb-3">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Unassigned</p>
          <div class="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
            <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <p class="text-3xl font-black text-red-500">{{ stats.unassigned }}</p>
        <p class="text-xs text-red-400 mt-1">waiting for an owner</p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">

      <!-- Left: Filters + Task List -->
      <div class="xl:col-span-2 space-y-4">

        <!-- Filters -->
<div class="flex flex-col xl:flex-row gap-3 mb-6">

  <!-- Search -->
  <div class="relative flex-1 min-w-[280px]">
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
      placeholder="Search tasks..."
      class="sp-input !pl-12"
    />
  </div>

  <!-- Status -->
  <div class="relative w-full xl:w-44 shrink-0">
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
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/>
    </svg>
  </div>

  <!-- Priority -->
  <div class="relative w-full xl:w-44 shrink-0">
    <select
      v-model="priorityFilter"
      class="sp-input appearance-none pr-10"
    >
      <option
        v-for="o in priorityOptions"
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
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/>
    </svg>
  </div>

  <!-- Assignee -->
  <div class="relative w-full xl:w-48 shrink-0">
    <select
      v-model="assigneeFilter"
      class="sp-input appearance-none pr-10"
    >
      <option
        v-for="o in assigneeOptions"
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
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/>
    </svg>
  </div>

  <!-- Sort -->
  <div class="relative w-full xl:w-44 shrink-0">
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
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/>
    </svg>
  </div>

</div>
        <!-- Task List -->
        <div class="space-y-3" @click="closeMenu">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="sp-card p-4 hover:shadow-elevated transition-all duration-200 group"
            :class="task.status === 'completed' ? 'opacity-70' : ''"
          >
            <div class="flex items-start gap-3">
              <!-- Checkbox -->
              <button
                class="w-5 h-5 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all duration-150"
                :class="task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-primary'"
                @click.stop="toggleTask(task.id)"
              >
                <svg v-if="task.status === 'completed'" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-slate-800 text-sm leading-snug" :class="task.status === 'completed' ? 'line-through text-slate-400' : ''">
                      {{ task.title }}
                    </p>
                    <p class="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-1">
                      {{ task.assignee.specialization || (task.isAiGenerated ? 'AI generated task' : 'Manual task') }}
                    </p>
                  </div>

                  <!-- 3-dot menu -->
                  <div class="relative shrink-0" @click.stop>
                    <button
                      class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all"
                      @click="toggleMenu(task.id)"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                      </svg>
                    </button>
                    <div v-if="openMenuId === task.id" class="absolute right-0 top-8 w-36 sp-card py-1 z-10 shadow-elevated">
                      <button class="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Edit Task</button>
                      <button class="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Change Status</button>
                      <button class="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Reassign</button>
                      <button class="w-full text-left px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50">Delete</button>
                    </div>
                  </div>
                </div>

                <!-- Meta row -->
                <div class="flex items-center flex-wrap gap-2 mt-2.5">
                  <!-- Priority -->
                  <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md" :class="priorityConfig(task.priority).cls">
                    {{ priorityConfig(task.priority).label }}
                  </span>

                  <!-- Status -->
                  <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md" :class="statusConfig(task.status).cls">
                    {{ statusConfig(task.status).label }}
                  </span>

                  <!-- Project -->
                  <span v-if="task.project" class="text-[11px] text-slate-400">
                    <span class="text-slate-300 mr-1">·</span>{{ task.project }}
                  </span>

                  <div class="flex-1"></div>

                  <!-- Assignee -->
                  <div class="flex items-center gap-1.5">
                    <div class="w-5 h-5 rounded-full text-white flex items-center justify-center text-[9px] font-bold shrink-0" :class="task.assignee.color">
                      {{ task.assignee.initials }}
                    </div>
                    <span class="text-[11px] text-slate-500 font-medium">{{ task.assignee.name }}</span>
                  </div>

                  <!-- Estimate -->
                  <span class="text-[11px] font-semibold text-slate-400">
                    {{ task.status === 'completed' ? 'Done' : task.estimatedTime }}
                  </span>
                </div>

                <!-- Progress bar -->
                <div v-if="task.progress > 0" class="mt-3">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] text-slate-400 font-medium">Progress</span>
                    <span class="text-[10px] font-bold text-slate-600">{{ task.progress }}%</span>
                  </div>
                  <div class="w-full h-1.5 bg-slate-100 rounded-full">
                    <div class="h-full rounded-full transition-all duration-500" :class="progressColor(task.progress)" :style="`width: ${task.progress}%`"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filteredTasks.length === 0" class="sp-card p-12 text-center">
            <div class="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p class="font-bold text-slate-800">No tasks found</p>
            <p class="text-sm text-slate-400 mt-1">Try adjusting your filters or create a new task.</p>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="space-y-4">

        <!-- AI Productivity Panel -->
       <div class="sp-card p-5 mt-16" style="background-color: #4343D5; color: white;">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.674M12 3v1m6.364.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707M8 17a4 4 0 118 0c0 1.5-1 2-1 3H9c0-1-1-1.5-1-3z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-white/70 uppercase tracking-wide">AI Task Insights</p>
            </div>
          </div>

          <!-- Productivity Score -->
          <div class="bg-white/15 rounded-xl p-4 mb-3">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-semibold text-white/80">Productivity Score</span>
              <span class="text-lg font-black text-white">{{ productivityScore }}%</span>
            </div>
            <div class="w-full h-2 bg-white/20 rounded-full">
              <div class="h-full rounded-full bg-white transition-all" :style="`width: ${productivityScore}%`"></div>
            </div>
            <p class="text-[10px] text-white/60 mt-1.5">{{ stats.completed }} of {{ stats.total }} tasks completed</p>
          </div>

          <!-- Tasks at Risk -->
          <div class="bg-white/15 rounded-xl p-4 mb-3">
            <p class="text-xs font-semibold text-white/80 mb-2">High Priority Open Tasks</p>
            <div class="space-y-1.5">
              <div v-for="task in tasksAtRisk" :key="task.id" class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="task.priority === 'HIGH' ? 'bg-red-300' : task.priority === 'MED' ? 'bg-amber-300' : 'bg-white/50'"></div>
                <span class="text-xs text-white/90">{{ task.title }} — {{ task.estimatedTime }}</span>
              </div>
              <div v-if="tasksAtRisk.length === 0" class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0"></div>
                <span class="text-xs text-white/90">No open tasks yet</span>
              </div>
            </div>
          </div>

          <!-- AI Recommendation -->
          <div class="bg-white/15 rounded-xl p-4 mb-4">
            <p class="text-xs font-semibold text-white/80 mb-2">Recommended Focus</p>
            <div class="space-y-1.5">
              <div v-for="task in recommendedTasks" :key="task.id" class="flex items-center gap-2">
                <svg class="w-3 h-3 text-yellow-300 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                <span class="text-xs text-white/90">{{ task.title }}</span>
              </div>
              <div v-if="recommendedTasks.length === 0" class="flex items-center gap-2">
                <svg class="w-3 h-3 text-yellow-300 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                <span class="text-xs text-white/90">No focus task available</span>
              </div>
            </div>
          </div>

          <button class="w-full bg-white text-primary font-bold text-xs py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Optimize Schedule
          </button>
        </div>

        <!-- Estimated Timeline -->
        <div class="sp-card p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Estimated Timeline</h3>
              <p class="text-xs text-slate-400 mt-0.5">Shortest open tasks first</p>
            </div>
            <button class="text-xs font-semibold text-primary hover:underline">View all</button>
          </div>
          <div class="space-y-3">
            <div
              v-for="task in estimatedTimeline"
              :key="task.id"
              class="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0"
            >
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="task.assignee.color">
                <span class="text-white text-[10px] font-bold">{{ task.assignee.initials }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold text-slate-800 truncate">{{ task.title }}</p>
                <p class="text-[10px] text-slate-400 mt-0.5">{{ task.assignee.name }}</p>
              </div>
              <span class="text-[10px] font-bold shrink-0 text-slate-500">
                {{ task.estimatedTime }}
              </span>
            </div>
            <p v-if="estimatedTimeline.length === 0" class="text-xs text-slate-400">No open tasks available.</p>
          </div>
        </div>

        <!-- Team Workload -->
        <div class="sp-card p-5">
          <div class="mb-4">
            <h3 class="font-bold text-slate-900 text-sm">Team Workload</h3>
            <p class="text-xs text-slate-400 mt-0.5">Current capacity usage</p>
          </div>
          <div class="space-y-4">
            <div v-for="member in teamWorkload" :key="member.name">
              <div class="flex items-center gap-2 mb-1.5">
                <div class="w-6 h-6 rounded-full text-white flex items-center justify-center text-[9px] font-bold shrink-0" :class="member.color">
                  {{ member.initials }}
                </div>
                <span class="text-xs font-semibold text-slate-700 flex-1">{{ member.name }}</span>
                <span class="text-[10px] text-slate-400">{{ member.tasks }} tasks</span>
                <span class="text-[10px] font-bold" :class="member.capacity > 80 ? 'text-red-500' : member.capacity > 60 ? 'text-amber-500' : 'text-emerald-500'">{{ member.capacity }}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="member.capacity > 80 ? 'bg-red-400' : member.capacity > 60 ? 'bg-amber-400' : 'bg-emerald-500'"
                  :style="`width: ${member.capacity}%`"
                ></div>
              </div>
            </div>
            <p v-if="teamWorkload.length === 0" class="text-xs text-slate-400">No assigned tasks yet.</p>
          </div>
        </div>

      </div>
    </div>

    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      @click.self="closeCreateModal"
    >
      <form
        class="w-full max-w-xl rounded-2xl bg-white shadow-elevated border border-slate-100 p-6"
        @submit.prevent="submitCreateTask"
      >
        <div class="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 class="text-xl font-black text-slate-900">Create Task</h2>
            <p class="text-sm text-slate-500 mt-1">Add a task to the active project.</p>
          </div>
          <button
            type="button"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
            @click="closeCreateModal"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="createError" class="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {{ createError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="sp-label">Title</label>
            <input
              v-model="createForm.title"
              class="sp-input"
              type="text"
              placeholder="Design Login Page"
            />
          </div>

          <div>
            <label class="sp-label">Description</label>
            <textarea
              v-model="createForm.description"
              class="sp-input min-h-[110px] resize-none"
              placeholder="Create the wireframe and UI for the login screen"
            ></textarea>
          </div>

          <div>
            <label class="sp-label">Assigned Member</label>
            <select
              v-model="createForm.assignedMember"
              class="sp-input"
            >
              <option value="" disabled>Select a member</option>
              <option
                v-for="member in memberOptions"
                :key="member.id"
                :value="member.id"
              >
                {{ member.name }}{{ member.specialization ? ` · ${member.specialization}` : '' }}
              </option>
              <option value="__manual__">Enter member ID manually</option>
            </select>
          </div>

          <div v-if="createForm.assignedMember === '__manual__'">
            <label class="sp-label">Member ID</label>
            <input
              v-model="createForm.manualAssignedMember"
              class="sp-input"
              type="text"
              placeholder="60d5ec49f1b2c50015a84e21"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="sp-label">Priority</label>
              <select v-model="createForm.priority" class="sp-input">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label class="sp-label">Status</label>
              <select v-model="createForm.status" class="sp-input">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 mt-6">
          <button type="button" class="sp-btn-outline" @click="closeCreateModal">Cancel</button>
          <button type="submit" class="sp-btn-primary" :disabled="creatingTask">
            {{ creatingTask ? 'Creating...' : 'Create Task' }}
          </button>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
