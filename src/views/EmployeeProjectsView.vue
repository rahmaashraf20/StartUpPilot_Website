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
  formatTaskDate,
  mapApiTask,
} from '../utils/workspaceProject'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import SkeletonBlock from '../components/dashboard/SkeletonBlock.vue'

const auth = useAuthStore()
const router = useRouter()

const activeSection = ref('projects')
function handleNavigate(id) {
  activeSection.value = id
}

const isLoading = ref(true)
const loadError = ref('')
const currentProject = ref(null)
const projectId = ref('')
const tasks = ref([])

onMounted(async () => {
  try {
    loadError.value = ''
    const workspaceId = auth.user?.workspaceId

    if (!workspaceId) {
      throw new Error('No workspace is linked to this employee account yet.')
    }

    const workspaceProjectResponse = await taskService.getProjectsByWorkspace(workspaceId)
    const extracted = extractWorkspaceProject(workspaceProjectResponse)
    currentProject.value = extracted.project
    projectId.value = extracted.projectId

    if (!projectId.value) {
      throw new Error('No project id was returned for this workspace.')
    }

    localStorage.setItem('projectId', projectId.value)

    const response = await taskService.getProjectTasks(projectId.value)
    tasks.value = (response.tasks || []).map((task) => mapApiTask(task, currentProject.value))
  } catch (error) {
    console.error(error)
    loadError.value = error.message || 'Failed to load your project.'
  } finally {
    isLoading.value = false
  }
})

const completedTasks = computed(() =>
  tasks.value.filter((task) => task.done || task.status === 'done').length
)

const progress = computed(() => calculateProgress(tasks.value))

const projectInfo = computed(() => {
  const project = currentProject.value || {}
  const basicInfo = project.basicInfo || {}
  const marketInfo = project.marketInfo || {}
  const financialInfo = project.financialInfo || {}
  const roadmap = project.aiOutputs?.roadmap || []

  return {
    name: basicInfo.name || 'Workspace Project',
    industry: basicInfo.industry || 'Workspace',
    description: basicInfo.description || project.aiOutputs?.overview || 'Project details will appear here.',
    stage: basicInfo.stage || 'Active',
    businessModel: basicInfo.businessModel || 'Not specified',
    location: marketInfo.location || 'Not specified',
    audience: marketInfo.targetAudience || 'Not specified',
    startupCost: financialInfo.initialInvestment || project.aiOutputs?.financialPlan?.estimatedStartupCost || 0,
    monthlyBurn: project.aiOutputs?.financialPlan?.monthlyBurnRate || 0,
    roadmapCount: roadmap.length,
    createdAt: formatTaskDate(project.createdAt, 'Unknown'),
    managerName: project.managerId?.name || 'Manager',
    managerEmail: project.managerId?.email || '',
  }
})

const upcomingTasks = computed(() =>
  [...tasks.value]
    .filter((task) => task.status !== 'done')
    .sort(compareByDueDate)
    .slice(0, 4)
)

const statusBreakdown = computed(() => [
  { label: 'Todo', value: tasks.value.filter((task) => task.status === 'todo').length, color: 'bg-slate-400' },
  { label: 'In progress', value: tasks.value.filter((task) => task.status === 'in-progress').length, color: 'bg-primary' },
  { label: 'Review', value: tasks.value.filter((task) => task.status === 'review').length, color: 'bg-amber-400' },
  { label: 'Done', value: completedTasks.value, color: 'bg-emerald-500' },
])

const stats = computed(() => [
  { id: 'progress', label: 'Progress', value: `${progress.value}%`, icon: 'tasks', tone: 'primary' },
  { id: 'tasks', label: 'Tasks', value: tasks.value.length, icon: 'bell', tone: 'violet' },
  { id: 'roadmap', label: 'Roadmap Items', value: projectInfo.value.roadmapCount, icon: 'calendar', tone: 'amber' },
  { id: 'completed', label: 'Completed', value: completedTasks.value, icon: 'messages', tone: 'primary' },
])

function formatMoney(value) {
  const amount = Number(value || 0)
  if (!amount) return 'Not set'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function openTasks() {
  router.push('/dashboard/employee/tasks')
}
</script>

<template>
  <DashboardLayout :active-id="activeSection" @navigate="handleNavigate">
    <div class="mx-auto w-full max-w-7xl space-y-6 animate-fade-in">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <h1 class="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            My Project
          </h1>
          <p class="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            View the workspace project details, task progress, and upcoming work.
          </p>
        </div>
        <button type="button" class="sp-btn-primary w-full sm:w-auto" @click="openTasks">
          View Tasks
        </button>
      </div>

      <template v-if="isLoading">
        <SkeletonBlock height="13rem" rounded="1.125rem" />
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SkeletonBlock v-for="i in 4" :key="i" height="4.5rem" rounded="1.125rem" />
        </div>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SkeletonBlock height="15rem" rounded="1.125rem" class="lg:col-span-2" />
          <SkeletonBlock height="15rem" rounded="1.125rem" />
        </div>
      </template>

      <template v-else>
        <div
          v-if="loadError"
          class="sp-card border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600"
        >
          {{ loadError }}
        </div>

        <section class="sp-card overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div class="p-5 sm:p-6">
              <div class="flex flex-wrap items-center gap-2">
                <span class="sp-badge bg-primary-light text-primary capitalize">
                  {{ projectInfo.industry }}
                </span>
                <span class="sp-badge bg-slate-100 text-slate-500 capitalize">
                  {{ projectInfo.stage }}
                </span>
                <span class="sp-badge bg-violet-50 text-violet-600">
                  {{ projectInfo.businessModel }}
                </span>
              </div>

              <h2 class="mt-4 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                {{ projectInfo.name }}
              </h2>
              <p class="mt-3 max-w-4xl text-sm leading-6 text-slate-500">
                {{ projectInfo.description }}
              </p>

              <div class="mt-6">
                <div class="mb-2 flex items-center justify-between gap-3">
                  <span class="text-xs font-black uppercase tracking-wide text-slate-400">
                    Project progress
                  </span>
                  <span class="text-sm font-black text-primary">{{ progress }}%</span>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full bg-primary transition-all duration-500"
                    :style="{ width: `${progress}%` }"
                  />
                </div>
              </div>
            </div>

            <div class="border-t border-slate-100 bg-slate-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
              <p class="text-xs font-black uppercase tracking-wide text-slate-400">
                Managed by
              </p>
              <p class="mt-2 text-sm font-black text-slate-900">
                {{ projectInfo.managerName }}
              </p>
              <p class="mt-1 break-all text-xs text-slate-500">
                {{ projectInfo.managerEmail || 'No email available' }}
              </p>

              <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-1">
                <div class="rounded-lg bg-white p-3">
                  <p class="text-[10px] font-black uppercase tracking-wide text-slate-400">Created</p>
                  <p class="mt-1 text-sm font-bold text-slate-800">{{ projectInfo.createdAt }}</p>
                </div>
                <div class="rounded-lg bg-white p-3">
                  <p class="text-[10px] font-black uppercase tracking-wide text-slate-400">Location</p>
                  <p class="mt-1 text-sm font-bold text-slate-800">{{ projectInfo.location }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

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

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section class="sp-card p-5 sm:p-6 lg:col-span-2">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 class="font-bold text-slate-900">Upcoming Work</h3>
                <p class="mt-0.5 text-xs text-slate-400">Nearest pending tasks from this project.</p>
              </div>
              <button type="button" class="sp-btn-ghost w-full text-xs sm:w-auto" @click="openTasks">
                Open Tasks
              </button>
            </div>

            <div v-if="upcomingTasks.length === 0" class="py-10 text-center">
              <p class="text-sm font-semibold text-slate-700">No pending tasks</p>
              <p class="mt-1 text-xs text-slate-400">Everything assigned to you is complete.</p>
            </div>

            <div v-else class="mt-5 divide-y divide-slate-100">
              <div
                v-for="task in upcomingTasks"
                :key="task.id"
                class="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="min-w-0">
                  <p class="text-sm font-bold text-slate-900">{{ task.title }}</p>
                  <p class="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{{ task.description }}</p>
                </div>
                <div class="flex shrink-0 flex-wrap items-center gap-2">
                  <span class="sp-badge bg-slate-100 text-slate-500">{{ task.priority }}</span>
                  <span class="sp-badge bg-primary-light text-primary">{{ formatShortDate(task.dueTimestamp) }}</span>
                </div>
              </div>
            </div>
          </section>

          <aside class="space-y-5">
            <section class="sp-card p-5 sm:p-6">
              <h3 class="font-bold text-slate-900">Task Status</h3>
              <div class="mt-5 space-y-4">
                <div v-for="item in statusBreakdown" :key="item.label">
                  <div class="mb-1.5 flex items-center justify-between">
                    <span class="text-xs font-semibold text-slate-500">{{ item.label }}</span>
                    <span class="text-xs font-black text-slate-800">{{ item.value }}</span>
                  </div>
                  <div class="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      class="h-full rounded-full"
                      :class="item.color"
                      :style="{ width: tasks.length ? `${Math.round((item.value / tasks.length) * 100)}%` : '0%' }"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section class="sp-card p-5 sm:p-6">
              <h3 class="font-bold text-slate-900">Project Details</h3>
              <dl class="mt-4 space-y-3 text-sm">
                <div>
                  <dt class="text-xs font-bold uppercase tracking-wide text-slate-400">Audience</dt>
                  <dd class="mt-1 text-slate-700">{{ projectInfo.audience }}</dd>
                </div>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <dt class="text-xs font-bold uppercase tracking-wide text-slate-400">Startup Cost</dt>
                    <dd class="mt-1 font-bold text-slate-800">{{ formatMoney(projectInfo.startupCost) }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs font-bold uppercase tracking-wide text-slate-400">Monthly Burn</dt>
                    <dd class="mt-1 font-bold text-slate-800">{{ formatMoney(projectInfo.monthlyBurn) }}</dd>
                  </div>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>
