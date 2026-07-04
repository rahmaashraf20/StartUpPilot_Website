<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { taskService } from '../services/taskService'
import {
  calculateProgress,
  compareByDueDate,
  extractWorkspaceProject,
  formatShortDate,
  mapApiTask,
} from '../utils/workspaceProject'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import AIRecommendationCard from '../components/dashboard/AIRecommendationCard.vue'
import ProjectProgressCard from '../components/dashboard/ProjectProgressCard.vue'
import TasksCard from '../components/dashboard/TasksCard.vue'
import DeadlinesCard from '../components/dashboard/DeadlinesCard.vue'
import ActivityFeedCard from '../components/dashboard/ActivityFeedCard.vue'
import SkeletonBlock from '../components/dashboard/SkeletonBlock.vue'
import {
  mockEmployeeUser,
} from '../data/mockEmployee'

const auth = useAuthStore()
const router = useRouter()

// Tracks which sidebar / user-menu section is active. No routing yet for
// these sections — each one will become a real page in a later sprint.
const activeSection = ref('home')

function handleNavigate(id) {
  activeSection.value = id
}

// --- Greeting -------------------------------------------------------------
const firstName = computed(() => {
  const name = auth.user?.fullName || mockEmployeeUser.fullName
  return name.split(' ')[0]
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const todayLabel = computed(() =>
  new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
)

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
    loadError.value = error.message || 'Failed to load your dashboard.'
  } finally {
    isLoading.value = false
  }
})

const priorityTaskCount = computed(
  () => tasks.value.filter((t) => !t.done && t.priority === 'High').length
)

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }

const aiSuggestedTask = computed(() => {
  const pending = tasks.value.filter((t) => t.status !== 'done')
  if (pending.length === 0) return null
  return [...pending].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )[0]
})

const recommendedTaskTitle = computed(() => {
  return aiSuggestedTask.value?.title || ''
})
const priorityHeadline = computed(() => {
  return aiSuggestedTask.value
    ? `Complete: ${aiSuggestedTask.value.title}`
    : 'No pending tasks right now'
})

const sortedPendingTasks = computed(() =>
  [...tasks.value]
    .filter((task) => !task.done && task.status !== 'done')
    .sort((a, b) => {
      const priorityDelta = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      return priorityDelta || compareByDueDate(a, b)
    })
)

const dashboardTasks = computed(() => sortedPendingTasks.value.slice(0, 5))

const upcomingDeadlines = computed(() =>
  [...tasks.value]
    .filter((task) => task.dueTimestamp && task.status !== 'done')
    .sort(compareByDueDate)
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      title: task.title,
      date: formatShortDate(task.dueTimestamp),
      project: task.project,
    }))
)

const projectProgress = computed(() => {
  if (!currentProject.value) return []

  return [
    {
      id: currentProject.value._id || currentProject.value.id || 'workspace-project',
      name: currentProject.value.basicInfo?.name || 'Workspace Project',
      pct: calculateProgress(tasks.value),
      tasksDone: tasks.value.filter((task) => task.done || task.status === 'done').length,
      tasksTotal: tasks.value.length,
      color: 'bg-primary',
    },
  ]
})

const recentActivity = computed(() =>
  [...tasks.value]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4)
    .map((task) => ({
      id: task.id,
      actor: task.assignedBy || 'Manager',
      action: task.status === 'done' ? 'marked complete' : 'updated',
      target: task.title,
      time: formatShortDate(task.updatedAt, 'Recently'),
      avatarUrl: null,
    }))
)

const quickStats = computed(() => [
  {
    id: 'assigned-tasks',
    label: 'Assigned Tasks',
    value: tasks.value.length,
    icon: 'tasks',
    tone: 'primary',
  },
  {
    id: 'due-soon',
    label: 'Deadlines',
    value: upcomingDeadlines.value.length,
    icon: 'calendar',
    tone: 'amber',
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    value: tasks.value.filter((task) => task.status === 'in-progress').length,
    icon: 'messages',
    tone: 'violet',
  },
  {
    id: 'completed',
    label: 'Completed',
    value: tasks.value.filter((task) => task.done || task.status === 'done').length,
    icon: 'bell',
    tone: 'primary',
  },
])

const projectName = computed(() => currentProject.value?.basicInfo?.name || 'your workspace')

function handleToggleTask(id) {
  const task = tasks.value.find((t) => t.id === id)
  if (!task) return
  task.done = !task.done
  task.status = task.done ? 'done' : 'todo'
}

function handleViewAllTasks() {
  router.push('/dashboard/employee/tasks')
}

function handleApplyRecommendation() {
  if (aiSuggestedTask.value) {
    router.push('/dashboard/employee/tasks')
  }
}
console.log('TASKS:', tasks.value)
console.log('AI TASK:', aiSuggestedTask.value)
</script>

<template>
  <DashboardLayout :active-id="activeSection" @navigate="handleNavigate">
    <div class="mx-auto w-full max-w-7xl space-y-6 animate-fade-in">

      <!-- Greeting -->
      <div>
        <h1 class="text-2xl sm:text-[1.75rem] font-black text-slate-900 tracking-tight flex items-center gap-2">
          {{ greeting }}, {{ firstName }}
          <span class="inline-block animate-wave" style="transform-origin: 70% 70%;">👋</span>
        </h1>
        <p class="text-sm text-slate-500 mt-1.5">
          {{ todayLabel }} - {{ projectName }}
        </p>
        <p v-if="!isLoading && priorityTaskCount > 0" class="text-sm text-slate-500 mt-0.5">
          You have <span class="font-semibold text-primary">{{ priorityTaskCount }} priority task{{ priorityTaskCount > 1 ? 's' : '' }}</span> waiting today.
        </p>
      </div>

      <!-- Loading skeleton -->
      <template v-if="isLoading">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonBlock v-for="i in 4" :key="i" height="4.5rem" rounded="1.125rem" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div class="lg:col-span-2 space-y-5">
            <SkeletonBlock height="9rem" rounded="1.125rem" />
            <SkeletonBlock height="14rem" rounded="1.125rem" />
          </div>
          <div class="space-y-5">
            <SkeletonBlock height="8rem" rounded="1.125rem" />
            <SkeletonBlock height="8rem" rounded="1.125rem" />
            <SkeletonBlock height="8rem" rounded="1.125rem" />
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-if="loadError"
          class="sp-card border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600"
        >
          {{ loadError }}
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 gap-4 animate-slide-up sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            v-for="stat in quickStats"
            :key="stat.id"
            :label="stat.label"
            :value="stat.value"
            :icon="stat.icon"
            :tone="stat.tone"
          />
        </div>

        <!-- Main content (left) + right rail -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <!-- Left: AI recommendation + Today's tasks -->
          <div class="lg:col-span-2 space-y-5 animate-slide-up" style="animation-delay: 80ms">
<AIRecommendationCard
  tag="Priority Insight"
  :headline="priorityHeadline"
  body="Finishing this high-priority task will improve project progress and help keep delivery on schedule."
  :confidence="88"
  :show-action="!!aiSuggestedTask"
  @apply="handleApplyRecommendation"
/>
            <TasksCard
              :tasks="dashboardTasks"
              title="Priority Tasks"
              empty-title="No pending tasks"
              empty-body="Everything assigned to you is complete."
              @toggle-task="handleToggleTask"
              @view-all="handleViewAllTasks"
            />
          </div>

          <!-- Right rail: project progress, deadlines, activity -->
          <div class="space-y-5 animate-slide-up" style="animation-delay: 140ms">
            <ProjectProgressCard :projects="projectProgress" />
            <DeadlinesCard :deadlines="upcomingDeadlines" />
            <ActivityFeedCard :activity="recentActivity" />
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>
