<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAIStore } from '../stores/ai'
import { aiService } from '../services/aiService'
import { useAuthStore } from '../stores/auth'
import { onboardingService } from '../services/onboardingService'
import { useApiRequest } from '../composables/useApiRequest'
import { useToast } from '../composables/useToast'
import { dashboardRouteFor } from '../middleware/authGuard'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const aiStore = useAIStore()
const { loading, error, fieldErrors, run } = useApiRequest()


const isManager = computed(() => auth.role === 'manager')
const currentStep = ref(0)

// Presentation only — mirrors the role theme introduced in Register /
// Create Startup / Join Workspace so the wizard feels continuous.
const theme = computed(() => isManager.value
  ? { dot: 'bg-violet-500', ring: 'ring-violet-500/20', btn: 'bg-violet-600 hover:bg-violet-700', badge: 'bg-violet-50 text-violet-700 border-violet-100', iconBg: 'bg-violet-100 text-violet-600' }
  : { dot: 'bg-emerald-500', ring: 'ring-emerald-500/20', btn: 'bg-emerald-600 hover:bg-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', iconBg: 'bg-emerald-100 text-emerald-600' }
)

const managerSteps = ['Startup', 'Team & Budget', 'Goals']
const employeeSteps = ['Profile']
const steps = computed(() => (isManager.value ? managerSteps : employeeSteps))

const managerForm = ref({ startupName: '', category: '', budget: 50000, teamSize: 1, goals: '' })
const employeeForm = ref({ department: '', skills: '', experienceLevel: 'Junior' })

const aiAdvice = computed(() => {
  if (isManager.value) {
    const advices = [
      managerForm.value.startupName
        ? `"${managerForm.value.startupName}" — great name. The AI will calibrate market positioning around it.`
        : 'A clear startup name helps the AI calibrate market positioning data.',
      managerForm.value.budget < 20000
        ? '⚠️ Budget under $20K detected. AI recommends a lean MVP approach.'
        : `$${Number(managerForm.value.budget).toLocaleString()} budget → solid runway for a focused team of ${managerForm.value.teamSize}.`,
      'Concrete goals improve AI roadmap accuracy by up to 60%. Be specific.',
    ]
    return advices[currentStep.value] || advices[0]
  }
  return 'Tell us your department, skills, and experience level so we can match you to the right projects and tasks.'
})

function nextStep() {
  if (currentStep.value < steps.value.length - 1) currentStep.value++
}
function prevStep() {
  if (currentStep.value > 0) currentStep.value--
}

async function handleSubmit() {
  try {
    if (isManager.value) {
      const createResponse = await onboardingService.createProject({
        managerId: auth.user.id,
        startupName: managerForm.value.startupName,
        industry: managerForm.value.category,
        description: managerForm.value.goals,
      })

      console.log('createResponse =>', createResponse)
      console.log('project =>', createResponse?.project)

      const projectId = createResponse?.project?._id

      if (!projectId) {
        throw new Error('Project ID not found in createProject response')
      }

     const aiResponse = await aiStore.generatePlan(projectId)
     localStorage.setItem('projectId', projectId)
     console.log('Store after AI:', {
  overview: aiStore.overview,
  roadmap: aiStore.roadmap,
  tasks: aiStore.tasks,
})

console.log('AI Response =>', aiResponse)

      await onboardingService.updateOnboarding(projectId, {
        currentStep: 1,
        marketInfo: {
          startupStage: 'idea',
          businessModel: 'startup',
          targetAudience: [],
          competitors: [],
        },
        features: [],
        isOnboardingComplete: true,
      })
    }

    auth.setOnboardingComplete()

    toast.success('Workspace ready!')
    console.log('Before push', {
  overview: aiStore.overview,
  roadmap: aiStore.roadmap.length,
  tasks: aiStore.tasks.length,
})

    router.push(dashboardRouteFor(auth.role))
  } catch (err) {
    console.error(err)

    toast.error(
      err?.response?.data?.message ||
      err?.message ||
      'Failed to complete onboarding'
    )
  }
}
console.log('After push', {
  overview: aiStore.overview,
  roadmap: aiStore.roadmap.length,
  tasks: aiStore.tasks.length,
})
async function backToLogin() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-surface flex flex-col">
    <div
      v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
    >
      <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-4">
        <div
          class="mx-auto w-16 h-16 rounded-full border-4 border-slate-100 border-t-transparent animate-spin"
          :class="isManager ? 'border-r-violet-600' : 'border-r-emerald-600'"
        ></div>
        <div>
          <h2 class="text-xl font-black text-slate-900">
            {{ isManager ? 'Generating Workspace...' : 'Setting up profile...' }}
          </h2>
          <p class="text-sm text-slate-500 mt-2 leading-relaxed">
            {{ isManager
              ? 'Our AI models are building your startup roadmap and tasks. This may take a few moments.'
              : 'Matching your skills with active workspace projects.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Top bar -->
    <div class="bg-white border-b border-[#e4e4f0] px-6 py-4 flex items-center justify-between">
      <button @click="backToLogin" class="sp-btn-ghost text-sm">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
        </svg>
        Back to login
      </button>

      <!-- Step progress -->
      <div class="hidden sm:flex items-center gap-3">
        <span class="sp-badge text-[11px]" :class="theme.badge" style="border-width:1px">
          {{ isManager ? '🚀 Manager' : '👥 Employee' }}
        </span>
        <div class="flex items-center gap-2">
          <div v-for="(label, i) in steps" :key="label" class="flex items-center gap-2">
            <div class="flex items-center gap-1.5">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                :class="i < currentStep ? `${theme.dot} text-white` : i === currentStep ? `${theme.dot} text-white ring-4 ${theme.ring}` : 'bg-slate-100 text-slate-400'">
                <svg v-if="i < currentStep" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span class="text-xs font-medium" :class="i === currentStep ? 'text-slate-900' : 'text-slate-400'">{{ label }}</span>
            </div>
            <div v-if="i < steps.length - 1" class="w-8 h-px transition-colors duration-300" :class="i < currentStep ? theme.dot : 'bg-slate-200'"></div>
          </div>
        </div>
      </div>

      <span class="text-xs font-semibold text-slate-400 sm:hidden">Step {{ currentStep + 1 }} / {{ steps.length }}</span>
    </div>

    <!-- Main layout -->
    <div class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

      <!-- Form panel -->
      <div class="lg:col-span-2 sp-card p-8 animate-slide-up transition-colors duration-300"
        :class="isManager ? 'border-violet-100' : 'border-emerald-100'">

        <div v-if="error" class="mb-5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 space-y-1">
          <p>{{ error }}</p>
          <ul v-if="fieldErrors" class="list-disc list-inside text-xs font-normal">
            <li v-for="(msg, field) in fieldErrors" :key="field">{{ field }}: {{ Array.isArray(msg) ? msg.join(', ') : msg }}</li>
          </ul>
        </div>

        <!-- MANAGER FLOW -->
        <template v-if="isManager">
          <div v-if="currentStep === 0" class="space-y-5">
            <div>
              <h2 class="text-xl font-black text-slate-900">Define your startup</h2>
              <p class="text-slate-500 text-sm mt-1">The AI calibrates its models around your startup's identity and category.</p>
            </div>
            <div>
              <label class="sp-label">Startup name</label>
              <input type="text" v-model="managerForm.startupName" placeholder="e.g. Finterra, Launchify, Nexora" class="sp-input" />
            </div>
            <div>
              <label class="sp-label">Startup category</label>
              <select v-model="managerForm.category" class="sp-input">
                <option value="">Select category</option>
                <option value="saas">SaaS / B2B Software</option>
                <option value="fintech">Fintech</option>
                <option value="ai">Artificial Intelligence</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="health">Health Tech</option>
                <option value="edtech">EdTech</option>
              </select>
            </div>
          </div>

          <div v-else-if="currentStep === 1" class="space-y-5">
            <div>
              <h2 class="text-xl font-black text-slate-900">Team & budget</h2>
              <p class="text-slate-500 text-sm mt-1">Set your capital and team parameters.</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="sp-label">Initial budget (USD)</label>
                <input type="number" v-model="managerForm.budget" class="sp-input" min="0" />
              </div>
              <div>
                <label class="sp-label">Team size</label>
                <input type="number" v-model="managerForm.teamSize" class="sp-input" min="1" />
              </div>
            </div>
            <input type="range" min="1000" max="200000" v-model="managerForm.budget" class="w-full accent-primary h-1.5 rounded-full" />
          </div>

          <div v-else class="space-y-5">
            <div>
              <h2 class="text-xl font-black text-slate-900">Set your goals</h2>
              <p class="text-slate-500 text-sm mt-1">Concrete targets help the AI generate an accurate roadmap.</p>
            </div>
            <div>
              <label class="sp-label">Primary goals</label>
              <textarea v-model="managerForm.goals" placeholder="Reach product-market fit, close 50 paying customers, launch in 3 markets..." class="sp-input min-h-[120px] resize-none"></textarea>
            </div>
          </div>
        </template>

        <!-- EMPLOYEE FLOW -->
        <template v-else>
          <div class="space-y-5">
            <div>
              <h2 class="text-xl font-black text-slate-900">Tell us about you</h2>
              <p class="text-slate-500 text-sm mt-1">This helps your manager assign you to the right projects.</p>
            </div>
            <div>
              <label class="sp-label">Department</label>
              <select v-model="employeeForm.department" class="sp-input">
                <option value="">Select department</option>
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="operations">Operations</option>
                <option value="finance">Finance</option>
              </select>
            </div>
            <div>
              <label class="sp-label">Skills</label>
              <input type="text" v-model="employeeForm.skills" placeholder="e.g. Vue.js, Figma, SQL (comma separated)" class="sp-input" />
            </div>
            <div>
              <label class="sp-label">Experience level</label>
              <select v-model="employeeForm.experienceLevel" class="sp-input">
                <option value="Junior">Junior</option>
                <option value="Mid">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>
        </template>

        <!-- Navigation -->
        <div class="flex justify-between items-center pt-6 mt-2 border-t border-[#e4e4f0]">
          <button @click="prevStep" :disabled="currentStep === 0"
            class="sp-btn-ghost" :class="currentStep === 0 ? 'opacity-0 pointer-events-none' : ''">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>

          <button v-if="currentStep < steps.length - 1" @click="nextStep" class="sp-btn-primary px-7 py-2.5" :class="theme.btn">
            Continue
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button v-else @click="handleSubmit" :disabled="loading" class="sp-btn-primary px-8 py-2.5 shadow-elevated disabled:opacity-60" :class="theme.btn">
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ loading ? 'Setting up...' : 'Complete setup' }}
          </button>
        </div>
      </div>

      <!-- AI Assist Panel -->
      <div class="sp-card p-6 space-y-4 lg:sticky lg:top-24 transition-colors duration-300" :class="isManager ? 'border-violet-100' : 'border-emerald-100'">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-300" :class="theme.iconBg">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-sm font-bold text-slate-900">AI Assist</span>
          <span class="w-2 h-2 rounded-full bg-emerald-400 ml-auto animate-pulse-slow"></span>
        </div>

        <div class="bg-surface border border-[#e4e4f0] rounded-xl p-4">
          <p class="text-sm text-slate-600 leading-relaxed">{{ aiAdvice }}</p>
        </div>

        <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-2.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span class="text-xs font-medium text-emerald-700">AI models ready to initialize</span>
        </div>
      </div>
    </div>
  </div>
</template>
