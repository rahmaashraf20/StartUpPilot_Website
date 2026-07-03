<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
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
  mockQuickStats,
  mockTodaysTasks,
  mockAiRecommendation,
  mockProjectProgress,
  mockUpcomingDeadlines,
  mockRecentActivity,
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

// --- Prototype Mode: brief simulated load -----------------------------
// No backend exists yet. This local timeout stands in for a future
// `GET /me/dashboard-summary` request so the loading-state UI has a real
// (if momentary) job to do, without any network call.
const isLoading = ref(true)
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})

// --- Today's Tasks (local, interactive — no backend) -----------------
const tasks = ref(mockTodaysTasks.map((t) => ({ ...t })))

const priorityTaskCount = computed(
  () => tasks.value.filter((t) => !t.done && t.priority === 'High').length
)

const recommendedTaskTitle = computed(
  () => tasks.value.find((t) => t.id === mockAiRecommendation.focusTaskId)?.title || ''
)

function handleToggleTask(id) {
  const task = tasks.value.find((t) => t.id === id)
  if (!task) return
  task.done = !task.done
  task.status = task.done ? 'done' : 'todo'
}

function handleViewAllTasks() {
  router.push('/dashboard/employee/tasks')
}

// --- AI Recommendation --------------------------------------------------
function handleApplyRecommendation() {
  const target = tasks.value.find((t) => t.id === mockAiRecommendation.focusTaskId)
  if (target) target.status = 'in-progress'
}
</script>

<template>
  <DashboardLayout :active-id="activeSection" @navigate="handleNavigate">
    <div class="space-y-6 animate-fade-in">

      <!-- Greeting -->
      <div>
        <h1 class="text-2xl sm:text-[1.75rem] font-black text-slate-900 tracking-tight flex items-center gap-2">
          {{ greeting }}, {{ firstName }}
          <span class="inline-block animate-wave" style="transform-origin: 70% 70%;">👋</span>
        </h1>
        <p class="text-sm text-slate-500 mt-1.5">
          {{ todayLabel }} — let's make today productive.
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
        <!-- Quick Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatCard
            v-for="stat in mockQuickStats"
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
              :tag="mockAiRecommendation.tag"
              :headline="mockAiRecommendation.headline"
              :body="mockAiRecommendation.body"
              :confidence="mockAiRecommendation.confidence"
              :task-title="recommendedTaskTitle"
              @apply="handleApplyRecommendation"
            />
            <TasksCard
              :tasks="tasks"
              @toggle-task="handleToggleTask"
              @view-all="handleViewAllTasks"
            />
          </div>

          <!-- Right rail: project progress, deadlines, activity -->
          <div class="space-y-5 animate-slide-up" style="animation-delay: 140ms">
            <ProjectProgressCard :projects="mockProjectProgress" />
            <DeadlinesCard :deadlines="mockUpcomingDeadlines" />
            <ActivityFeedCard :activity="mockRecentActivity" />
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>
