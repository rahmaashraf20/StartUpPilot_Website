<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import SkeletonBlock from '../components/dashboard/SkeletonBlock.vue'
import AIRecommendationCard from '../components/dashboard/AIRecommendationCard.vue'
import AIChatPanel from '../components/dashboard/AIChatPanel.vue'
import { useToast } from '../composables/useToast'
import { mockAiInsights, mockSuggestedActions } from '../data/mockAiWorkspace'

const router = useRouter()
const toast = useToast()

// Sidebar active-state.
const activeSection = ref('ai-assistant')
function handleNavigate(id) {
  activeSection.value = id
}

// ── Loading (prototype mode skeleton) ─────────────────────────────
const isLoading = ref(true)
onMounted(() => setTimeout(() => { isLoading.value = false }, 500))

// ── Local state (no backend) ───────────────────────────────────────
const insights = ref([...mockAiInsights])
const suggestedActions = ref([...mockSuggestedActions])

const TAG_STYLE = {
  'Risk Alert': 'bg-red-50 text-red-500',
  'Positive Trend': 'bg-emerald-50 text-emerald-600',
  'Workflow Tip': 'bg-primary-light text-primary',
}

// ── Suggested action handling (local prototype actions only) ──────
function handleApplyAction(action) {
  suggestedActions.value = suggestedActions.value.filter((a) => a.id !== action.id)

  if (action.focusTaskId) {
    toast.success(`Applied: ${action.taskTitle}. Taking you to your tasks…`)
    router.push('/dashboard/employee/tasks')
  } else if (action.focusProjectId) {
    toast.success(`Applied: ${action.projectName}. Opening project details…`)
    router.push(`/dashboard/employee/projects/${action.focusProjectId}`)
  } else {
    toast.success('Suggestion applied.')
  }
}
</script>

<template>
  <DashboardLayout :active-id="activeSection" @navigate="handleNavigate">
    <div class="space-y-6 animate-fade-in">

      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">AI Workspace</h1>
        <p class="text-sm text-slate-500 mt-1">Insights, suggestions, and a local assistant for your tasks and projects.</p>
      </div>

      <!-- Loading Skeleton -->
      <template v-if="isLoading">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SkeletonBlock height="14rem" rounded="1.125rem" class="lg:col-span-2" />
          <SkeletonBlock height="14rem" rounded="1.125rem" />
        </div>
        <SkeletonBlock height="10rem" rounded="1.125rem" />
        <SkeletonBlock height="28rem" rounded="1.125rem" />
      </template>

      <template v-else>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

          <!-- AI Insights feed -->
          <div class="sp-card p-6 lg:col-span-2 animate-slide-up">
            <h3 class="font-bold text-slate-900 mb-5">AI Insights</h3>

            <div v-if="!insights.length" class="py-10 text-center">
              <div class="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <p class="text-sm font-bold text-slate-700">No insights right now</p>
              <p class="text-xs text-slate-400 mt-1">Check back later as your tasks and projects evolve.</p>
            </div>

            <ol v-else class="relative space-y-4">
              <li
                v-for="(item, idx) in insights"
                :key="item.id"
                class="relative flex items-start gap-3 rounded-lg -mx-1 px-1 py-1 transition-colors hover:bg-slate-50"
              >
                <span
                  v-if="idx !== insights.length - 1"
                  class="absolute left-4 top-9 bottom-[-1rem] w-px bg-[#e4e4f0]"
                ></span>

                <div class="relative w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0 ring-4 ring-white">
                  <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>

                <div class="min-w-0 pt-0.5 flex-1">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <span class="sp-badge text-[10px]" :class="TAG_STYLE[item.tag] || 'bg-slate-100 text-slate-500'">
                      {{ item.tag }}
                    </span>
                    <span class="text-xs text-slate-400">{{ item.time }}</span>
                  </div>
                  <p class="text-sm font-semibold text-slate-900 leading-snug">{{ item.headline }}</p>
                  <p class="text-sm text-slate-600 leading-relaxed mt-0.5">{{ item.body }}</p>
                </div>
              </li>
            </ol>
          </div>

          <!-- Suggested Actions -->
          <div class="sp-card p-6 animate-slide-up" style="animation-delay: 60ms">
            <h3 class="font-bold text-slate-900 mb-5">Suggested Actions</h3>

            <div v-if="!suggestedActions.length" class="py-10 text-center">
              <div class="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-sm font-bold text-slate-700">All caught up</p>
              <p class="text-xs text-slate-400 mt-1">No suggested actions right now.</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="action in suggestedActions"
                :key="action.id"
                class="p-3.5 rounded-xl border border-[#e4e4f0] hover:bg-slate-50 transition-colors"
              >
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <span class="sp-badge text-[10px] bg-primary-light text-primary">{{ action.tag }}</span>
                  <span class="text-[10px] font-bold text-primary">{{ action.confidence }}%</span>
                </div>
                <p class="text-sm font-semibold text-slate-800 leading-snug">{{ action.headline }}</p>
                <p class="text-xs text-slate-500 mt-1 leading-relaxed">{{ action.body }}</p>
                <button
                  type="button"
                  class="sp-btn-primary text-xs py-2 px-3.5 mt-3"
                  @click="handleApplyAction(action)"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Highlighted recommendation (reusing AIRecommendationCard) -->
        <AIRecommendationCard
          v-if="suggestedActions.length"
          :tag="suggestedActions[0].tag"
          :headline="suggestedActions[0].headline"
          :body="suggestedActions[0].body"
          :confidence="suggestedActions[0].confidence"
          :task-title="suggestedActions[0].taskTitle || suggestedActions[0].projectName"
          class="animate-slide-up"
          style="animation-delay: 100ms"
          @apply="handleApplyAction(suggestedActions[0])"
        />

        <!-- AI Chat Panel -->
        <div class="animate-slide-up" style="animation-delay: 140ms">
          <AIChatPanel />
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>