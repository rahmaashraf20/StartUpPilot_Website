<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import TaskCard from '../components/dashboard/TaskCard.vue'
import TaskDrawer from '../components/dashboard/TaskDrawer.vue'
import AIRecommendationCard from '../components/dashboard/AIRecommendationCard.vue'
import SkeletonBlock from '../components/dashboard/SkeletonBlock.vue'
import { mockTasks, mockTasksAiRecommendation } from '../data/mockTasks'
import { mockEmployeeUser } from '../data/mockEmployee'

const auth = useAuthStore()
const toast = useToast()

// Tracks which sidebar section is active on this page (mirrors the pattern
// used in EmployeeDashboardView so DashboardLayout's @navigate is handled
// consistently everywhere it's used).
const activeSection = ref('tasks')
function handleNavigate(id) {
  activeSection.value = id
}

// ── Loading (prototype mode skeleton) ─────────────────────────────
const isLoading = ref(true)
onMounted(() => setTimeout(() => { isLoading.value = false }, 500))

// ── Local task state ──────────────────────────────────────────────
const tasks = ref(mockTasks.map((t) => ({
  ...t,
  checklist: (t.checklist || []).map((c) => ({ ...c })),
  comments: (t.comments || []).map((c) => ({ ...c })),
  attachments: (t.attachments || []).map((a) => ({ ...a })),
})))

// ── Drawer ────────────────────────────────────────────────────────
const drawerOpen = ref(false)
const selectedTask = ref(null)

function openTask(task) {
  selectedTask.value = tasks.value.find((t) => t.id === task.id) || task
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
}

function handleComplete(id) {
  const t = tasks.value.find((t) => t.id === id)
  if (t) { t.done = true; t.status = 'done'; t.progress = 100 }
  drawerOpen.value = false
}

function handleReopen(id) {
  const t = tasks.value.find((t) => t.id === id)
  if (t) { t.done = false; t.status = 'todo' }
  drawerOpen.value = false
}

function handleToggle(id) {
  const t = tasks.value.find((t) => t.id === id)
  if (!t) return
  t.done = !t.done
  t.status = t.done ? 'done' : 'todo'
  if (t.done) t.progress = 100
}

function handleUpdateStatus({ id, status }) {
  const t = tasks.value.find((t) => t.id === id)
  if (!t) return

  const wasDone = t.status === 'done'
  t.status = status

  if (status === 'done') {
    t.done = true
    t.progress = 100
    t.checklist = t.checklist.map((c) => ({ ...c, done: true }))
  } else if (wasDone) {
    t.done = false
  }

  t.updatedAt = new Date().toISOString()

  if (selectedTask.value && selectedTask.value.id === id) {
    selectedTask.value = t
  }
}

// ── Comments (local, Prototype Mode — no backend) ──────────────────
function handleAddComment({ id, text }) {
  const trimmed = text.trim()
  if (!trimmed) return

  const t = tasks.value.find((t) => t.id === id)
  if (!t) return

  t.comments.push({
    id: `cm-${Date.now()}`,
    author: auth.user?.fullName || mockEmployeeUser.fullName,
    text: trimmed,
    time: 'Just now',
  })

  if (selectedTask.value && selectedTask.value.id === id) {
    selectedTask.value = t
  }
}

// ── Attachments (local, Prototype Mode — no backend) ────────────────
const SIMULATED_UPLOADS = [
  { fileName: 'meeting-notes.docx', fileSize: '64 KB', type: 'docx' },
  { fileName: 'updated-mockup.png', fileSize: '1.8 MB', type: 'png' },
  { fileName: 'reference-doc.pdf', fileSize: '512 KB', type: 'pdf' },
]

function handleUploadAttachment({ id }) {
  const t = tasks.value.find((t) => t.id === id)
  if (!t) return

  const sample = SIMULATED_UPLOADS[Math.floor(Math.random() * SIMULATED_UPLOADS.length)]

  t.attachments.push({
    id: `att-${Date.now()}`,
    fileName: sample.fileName,
    fileSize: sample.fileSize,
    uploadedBy: auth.user?.fullName || mockEmployeeUser.fullName,
    uploadedAt: 'Just now',
    type: sample.type,
  })

  if (selectedTask.value && selectedTask.value.id === id) {
    selectedTask.value = t
  }

  toast.success('File uploaded.')
}

function handleRemoveAttachment({ id, attachmentId }) {
  const t = tasks.value.find((t) => t.id === id)
  if (!t) return

  t.attachments = t.attachments.filter((a) => a.id !== attachmentId)

  if (selectedTask.value && selectedTask.value.id === id) {
    selectedTask.value = t
  }
}

// ── AI recommendation ─────────────────────────────────────────────
function handleApplyAI() {
  const t = tasks.value.find((t) => t.id === mockTasksAiRecommendation.focusTaskId)
  if (t) t.status = 'in-progress'
}

// ── Add Task (local, Prototype Mode — no backend) ─────────────────
function handleAddTask() {
  const id = `task-${Date.now()}`
  tasks.value.unshift({
    id,
    title: 'New Task',
    description: 'Click to add a description.',
    priority: 'Medium',
    status: 'todo',
    project: 'StartupPilot AI',
    dueDate: 'No due date',
    estimatedTime: '—',
    assignedBy: auth.user?.fullName || mockEmployeeUser.fullName,
    progress: 0,
    done: false,
    updatedAt: new Date().toISOString(),
    checklist: [],
    attachments: [],
    comments: [],
    activity: [],
  })
  toast.success('Task added.')
}

// ── Filters / Search / Sort ──────────────────────────────────────
const FILTERS = ['All', 'Todo', 'In Progress', 'Review', 'Completed']
const SORTS = ['Priority', 'Due Date', 'Recently Updated']
const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }

const activeFilter = ref('All')
const activeSort = ref('Priority')
const searchQuery = ref('')

const filtered = computed(() => {
  let list = tasks.value

  // Filter
  const f = activeFilter.value
  if (f === 'Todo') list = list.filter((t) => t.status === 'todo')
  else if (f === 'In Progress') list = list.filter((t) => t.status === 'in-progress')
  else if (f === 'Review') list = list.filter((t) => t.status === 'review')
  else if (f === 'Completed') list = list.filter((t) => t.done || t.status === 'done')

  // Search
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.project.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    )
  }

  // Sort
  const s = activeSort.value
  if (s === 'Priority') list = [...list].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
  else if (s === 'Due Date') list = [...list].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  else if (s === 'Recently Updated') list = [...list].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  return list
})

// ── Stats ─────────────────────────────────────────────────────────
const stats = computed(() => [
  { id: 'total', label: 'Total Tasks', value: tasks.value.length, icon: 'tasks', tone: 'primary' },
  { id: 'completed', label: 'Completed', value: tasks.value.filter((t) => t.done || t.status === 'done').length, icon: 'bell', tone: 'primary' },
  { id: 'in-progress', label: 'In Progress', value: tasks.value.filter((t) => t.status === 'in-progress').length, icon: 'messages', tone: 'violet' },
  { id: 'overdue', label: 'Overdue', value: tasks.value.filter((t) => !t.done && t.dueDate).length > 0 ? 1 : 0, icon: 'calendar', tone: 'amber' },
])

// ── Empty state helpers ───────────────────────────────────────────
const noResults = computed(() => !isLoading.value && filtered.value.length === 0)
</script>

<template>
  <DashboardLayout :active-id="activeSection" @navigate="handleNavigate">
    <div class="space-y-6 animate-fade-in">

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">My Tasks</h1>
          <p class="text-sm text-slate-500 mt-1">Track, prioritize, and complete your assigned work.</p>
        </div>
        <button
          type="button"
          class="sp-btn-primary self-start sm:self-auto"
          aria-label="Add new task"
          @click="handleAddTask"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      <!-- Loading Skeleton -->
      <template v-if="isLoading">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonBlock v-for="i in 4" :key="i" height="4.5rem" rounded="1.125rem" />
        </div>
        <SkeletonBlock height="6rem" rounded="1.125rem" />
        <div class="space-y-3">
          <SkeletonBlock v-for="i in 4" :key="i" height="5.5rem" rounded="1.125rem" />
        </div>
      </template>

      <template v-else>
        <!-- Task Stats -->
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

        <!-- AI Recommendation -->
        <div class="animate-slide-up" style="animation-delay: 60ms">
          <AIRecommendationCard
            :tag="mockTasksAiRecommendation.tag"
            :headline="mockTasksAiRecommendation.headline"
            :body="mockTasksAiRecommendation.body"
            :confidence="mockTasksAiRecommendation.confidence"
            :task-title="mockTasksAiRecommendation.suggestedAction"
            @apply="handleApplyAI"
          />
        </div>

       <!-- Search + Sort -->
<div class="animate-slide-up" style="animation-delay:100ms">

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
        placeholder="Search tasks by title, project, or description..."
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
        >
          <option
            v-for="s in SORTS"
            :key="s"
          >
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
    aria-label="Filter tasks"
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
        {{
          f === 'Todo'
            ? tasks.filter(t => t.status === 'todo').length
            : f === 'In Progress'
            ? tasks.filter(t => t.status === 'in-progress').length
            : f === 'Review'
            ? tasks.filter(t => t.status === 'review').length
            : tasks.filter(t => t.done || t.status === 'done').length
        }}
      </span>
    </button>
  </div>

</div>

        <!-- Task List -->
        <div class="space-y-3 animate-slide-up" style="animation-delay: 140ms">

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
            <p class="text-sm font-bold text-slate-700">No tasks match "{{ searchQuery }}"</p>
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
            <p class="text-sm font-bold text-slate-700">No completed tasks yet</p>
            <p class="text-xs text-slate-400 mt-1">Complete a task and it'll show up here.</p>
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
            <p class="text-sm font-bold text-slate-700">No tasks here</p>
            <p class="text-xs text-slate-400 mt-1">Switch filters or add a new task.</p>
          </div>

          <!-- Task cards -->
          <TaskCard
            v-for="(task, idx) in filtered"
            :key="task.id"
            :task="task"
            :style="{ animationDelay: `${idx * 50}ms` }"
            @toggle="handleToggle"
            @open="openTask"
          />
        </div>
      </template>
    </div>

    <!-- Task Details Drawer (teleported outside layout flow) -->
    <TaskDrawer
      :task="selectedTask"
      :open="drawerOpen"
      @close="closeDrawer"
      @complete="handleComplete"
      @reopen="handleReopen"
      @update-status="handleUpdateStatus"
      @add-comment="handleAddComment"
      @upload-attachment="handleUploadAttachment"
      @remove-attachment="handleRemoveAttachment"
    />
  </DashboardLayout>
</template>
