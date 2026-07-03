<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

// UI-only draft. No API call here — the real submission already happens
// in OnboardingView via onboardingService.submitManager(), which is
// untouched. This page just collects a friendlier first impression of the
// same kind of info before the wizard.
const draft = ref({
  startupName: '',
  category: '',
  teamSize: 1,
  budget: 50000,
  goal: '',
})

const steps = ['Identity', 'Team & Budget', 'Goal']
const currentStep = ref(0)
const progressPct = computed(() => ((currentStep.value + 1) / steps.length) * 100)

const categories = [
  { value: 'saas', label: 'SaaS / B2B Software' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'ai', label: 'Artificial Intelligence' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'health', label: 'Health Tech' },
  { value: 'edtech', label: 'EdTech' },
]

function nextStep() {
  if (currentStep.value < steps.length - 1) currentStep.value++
  else goToOnboarding()
}
function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

function goToOnboarding() {
  router.push('/onboarding')
}

async function backToLogin() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-surface flex flex-col">

    <!-- Top bar -->
    <div class="bg-white border-b border-[#e4e4f0] px-6 py-4 flex items-center justify-between">
      <button @click="backToLogin" class="sp-btn-ghost text-sm">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
        </svg>
        Back to login
      </button>

      <div class="flex items-center gap-2">
        <span class="sp-badge bg-violet-50 text-violet-700 border border-violet-100">🚀 Manager</span>
        <span class="text-xs font-semibold text-slate-400 hidden sm:inline">Step {{ currentStep + 1 }} of {{ steps.length }}</span>
      </div>

      <div class="w-32 sm:w-40">
        <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-violet-500 rounded-full transition-all duration-500" :style="`width: ${progressPct}%`"></div>
        </div>
      </div>
    </div>

    <!-- Main layout -->
    <div class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

      <!-- Form panel -->
      <div class="lg:col-span-2 sp-card p-8 border-violet-100 animate-slide-up">

        <div class="flex items-center gap-3 mb-6">
          <div class="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
            <svg class="w-5.5 h-5.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-black text-slate-900">Create your startup</h1>
            <p class="text-sm text-slate-500">A quick snapshot before we tailor your onboarding.</p>
          </div>
        </div>

        <!-- Step 0: Identity -->
        <div v-if="currentStep === 0" class="space-y-5">
          <div>
            <label class="sp-label">Startup name</label>
            <input type="text" v-model="draft.startupName" placeholder="e.g. Finterra, Launchify, Nexora" class="sp-input" />
          </div>
          <div>
            <label class="sp-label">Category</label>
            <select v-model="draft.category" class="sp-input">
              <option value="">Select category</option>
              <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
          </div>
        </div>

        <!-- Step 1: Team & Budget -->
        <div v-else-if="currentStep === 1" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="sp-label">Team size</label>
              <input type="number" v-model="draft.teamSize" class="sp-input" min="1" />
            </div>
            <div>
              <label class="sp-label">Budget range (USD)</label>
              <input type="number" v-model="draft.budget" class="sp-input" min="0" step="1000" />
            </div>
          </div>
          <input type="range" min="1000" max="200000" v-model="draft.budget" class="w-full accent-violet-500 h-1.5 rounded-full" />
          <p class="text-xs text-slate-400">This is just a starting estimate — you can refine it during onboarding.</p>
        </div>

        <!-- Step 2: Goal -->
        <div v-else class="space-y-5">
          <div>
            <label class="sp-label">Primary business goal</label>
            <textarea v-model="draft.goal" placeholder="e.g. Reach product-market fit, launch in 3 markets..." class="sp-input min-h-[120px] resize-none"></textarea>
          </div>
          <div class="bg-violet-50/60 border border-violet-100 rounded-xl p-4 flex items-start gap-3">
            <span class="text-lg">🚀</span>
            <p class="text-sm text-violet-700 leading-relaxed">
              Next, you'll complete a short onboarding wizard where these details feed directly into your AI roadmap.
            </p>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between items-center pt-6 mt-6 border-t border-[#e4e4f0]">
          <button @click="prevStep" :disabled="currentStep === 0"
            class="sp-btn-ghost" :class="currentStep === 0 ? 'opacity-0 pointer-events-none' : ''">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>

          <button @click="nextStep" class="sp-btn-primary px-7 py-2.5 bg-violet-600 hover:bg-violet-700">
            {{ currentStep < steps.length - 1 ? 'Continue' : 'Start onboarding' }}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Side panel -->
      <div class="sp-card p-6 space-y-4 border-violet-100 lg:sticky lg:top-24">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
            <svg class="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-sm font-bold text-slate-900">What's next</span>
        </div>
        <ul class="space-y-3 text-sm text-slate-600">
          <li class="flex items-start gap-2.5"><span class="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0"></span>Onboarding wizard refines these details</li>
          <li class="flex items-start gap-2.5"><span class="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0"></span>AI calibrates your roadmap and budget plan</li>
          <li class="flex items-start gap-2.5"><span class="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0"></span>Invite your team once setup is complete</li>
        </ul>
      </div>
    </div>
  </div>
</template>
