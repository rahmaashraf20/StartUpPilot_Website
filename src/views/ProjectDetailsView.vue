<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import SkeletonBlock from '../components/dashboard/SkeletonBlock.vue'
import ActivityFeedCard from '../components/dashboard/ActivityFeedCard.vue'
import TaskItem from '../components/dashboard/TaskItem.vue'
import { mockProjects } from '../data/mockProjects'
import { mockTasks } from '../data/mockTasks'

const route = useRoute()
const router = useRouter()

// Sidebar should keep highlighting "My Projects" while viewing a project's details.
const activeSection = ref('projects')
function handleNavigate(id) {
  activeSection.value = id
}

// ── Loading (prototype mode skeleton) ─────────────────────────────
const isLoading = ref(true)
onMounted(() => setTimeout(() => { isLoading.value = false }, 500))

// ── Local project lookup (no backend) ──────────────────────────────
const project = computed(() => mockProjects.find((p) => p.id === route.params.id) || null)

const STATUS_STYLE = {
  'active': 'bg-primary-light text-primary',
  'completed': 'bg-emerald-50 text-emerald-600',
  'at-risk': 'bg-red-50 text-red-500',
}

const STATUS_LABEL = {
  'active': 'Active',
  'completed': 'Completed',
  'at-risk': 'At Risk',
}

// Tasks scoped to this project (mockTasks.project already matches mockProjects.name)
const relatedTasks = computed(() => {
  if (!project.value) return []
  return mockTasks.filter((t) => t.project === project.value.name)
})

function goBack() {
  router.push('/dashboard/employee/projects')
}
</script>

<template>
  <DashboardLayout :active-id="activeSection" @navigate="handleNavigate">
    <div class="space-y-6 animate-fade-in">

      <!-- Back button -->
      <button
        type="button"
        class="sp-btn-ghost text-sm inline-flex items-center gap-1.5"
        @click="goBack"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </button>

      <!-- Loading Skeleton -->
      <template v-if="isLoading">
        <SkeletonBlock height="7rem" rounded="1.125rem" />
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SkeletonBlock height="14rem" rounded="1.125rem" class="lg:col-span-2" />
          <SkeletonBlock height="14rem" rounded="1.125rem" />
        </div>
        <SkeletonBlock height="10rem" rounded="1.125rem" />
      </template>

      <!-- Not Found -->
      <div
        v-else-if="!project"
        class="sp-card p-10 flex flex-col items-center text-center"
      >
        <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-sm font-bold text-slate-700">Project not found</p>
        <p class="text-xs text-slate-400 mt-1">This project may have been removed or the link is incorrect.</p>
        <button type="button" class="sp-btn-primary text-xs mt-4" @click="goBack">Back to Projects</button>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="sp-card p-6 animate-slide-up">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-2">
                <span class="sp-badge text-xs" :class="STATUS_STYLE[project.status]">
                  {{ STATUS_LABEL[project.status] }}
                </span>
              </div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ project.name }}</h1>
              <p class="text-sm text-slate-500 mt-1 max-w-2xl">{{ project.longDescription || project.description }}</p>
            </div>
          </div>

          <!-- Meta row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#e4e4f0]">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Owner</p>
              <div class="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <div class="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <span class="text-[8px] font-black text-primary">{{ project.owner[0] }}</span>
                </div>
                {{ project.owner }}
              </div>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Due Date</p>
              <div class="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ project.dueDate }}
              </div>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Tasks</p>
              <p class="text-sm font-semibold text-slate-700">{{ project.completedTasks }}/{{ project.totalTasks }} done</p>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Progress</p>
              <p
                class="text-sm font-bold"
                :class="project.progress === 100 ? 'text-emerald-500' : 'text-primary'"
              >
                {{ project.progress }}%
              </p>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="mt-4">
            <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="project.color || 'bg-primary'"
                :style="{ width: project.progress + '%' }"
              />
            </div>
          </div>

          <!-- Team -->
          <div v-if="project.team?.length" class="mt-5 pt-5 border-t border-[#e4e4f0]">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Team</p>
            <div class="flex items-center gap-3 flex-wrap">
              <div
                v-for="member in project.team"
                :key="member.name"
                class="flex items-center gap-2"
              >
                <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <span class="text-[10px] font-bold text-slate-500">{{ member.name[0] }}</span>
                </div>
                <span class="text-sm font-semibold text-slate-700">{{ member.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Milestones + Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-slide-up" style="animation-delay: 60ms">
          <!-- Milestones -->
          <div class="sp-card p-6 lg:col-span-2">
            <h3 class="font-bold text-slate-900 mb-5">Milestones</h3>
            <div v-if="!project.milestones?.length" class="py-6 text-center">
              <p class="text-sm text-slate-400">No milestones yet.</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="ms in project.milestones"
                :key="ms.id"
                class="flex items-center gap-3 p-2.5 rounded-xl"
              >
                <div
                  class="w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0"
                  :class="ms.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'"
                  style="width:18px;height:18px;"
                >
                  <svg v-if="ms.done" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="text-sm" :class="ms.done ? 'line-through text-slate-400' : 'text-slate-700'">{{ ms.title }}</span>
              </div>
            </div>
          </div>

          <!-- Activity -->
          <ActivityFeedCard :activity="project.activity || []" />
        </div>

        <!-- Related Tasks -->
        <div class="sp-card p-6 animate-slide-up" style="animation-delay: 100ms">
          <h3 class="font-bold text-slate-900 mb-3">Project Tasks</h3>
          <div v-if="!relatedTasks.length" class="py-6 text-center">
            <p class="text-sm text-slate-400">No tasks linked to this project yet.</p>
          </div>
          <div v-else class="divide-y divide-[#e4e4f0]">
            <TaskItem
              v-for="task in relatedTasks"
              :key="task.id"
              :title="task.title"
              :project="task.project"
              :priority="task.priority"
              :due-time="task.dueDate"
              :status="task.status"
              :done="task.done"
            />
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>