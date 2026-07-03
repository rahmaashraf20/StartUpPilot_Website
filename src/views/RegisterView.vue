<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useApiRequest } from '../composables/useApiRequest'
import { useToast } from '../composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const { loading, error, fieldErrors, run } = useApiRequest()

const step = ref(0) // 0 = role select, 1 = account details

const form = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
})

const managerExtras = ref({
  startupName: '',
  companySize: '',
  industry: '',
})

const employeeExtras = ref({
  department: '',
  experience: '',
  skills: '',
})

const isManager = computed(() => form.value.role === 'manager')

const passwordsMatch = computed(() =>
  form.value.password === form.value.confirmPassword
)

const theme = computed(() =>
  isManager.value
    ? {
        badgeBg: 'bg-violet-50 text-violet-700 border border-violet-100',
        iconBg: 'bg-violet-100 text-violet-600',
        cardBorder: 'border-violet-100',
        benefitsBg: 'bg-violet-50/60 border-violet-100',
        btn: 'bg-violet-600 hover:bg-violet-700',
        dot: 'bg-violet-500',
      }
    : {
        badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        iconBg: 'bg-emerald-100 text-emerald-600',
        cardBorder: 'border-emerald-100',
        benefitsBg: 'bg-emerald-50/60 border-emerald-100',
        btn: 'bg-emerald-600 hover:bg-emerald-700',
        dot: 'bg-emerald-500',
      }
)

const benefits = computed(() =>
  isManager.value
    ? [
        'AI-generated roadmap from day one',
        'Real-time budget & runway tracking',
        'Invite your team in a few clicks',
      ]
    : [
        'Get matched to relevant tasks fast',
        'Track your own progress & hours',
        'Stay in sync with your team',
      ]
)

function selectRole(key) {
  form.value.role = key
  step.value = 1
}

async function handleRegister() {
  if (!passwordsMatch.value) {
    toast.error('Passwords do not match')
    return
  }

  const payload = {
    name: form.value.fullName.trim(),
    email: form.value.email.trim(),
    password: form.value.password,
    role: form.value.role,
  }

  if (form.value.role === 'manager') {
    payload.workspaceName = managerExtras.value.startupName.trim()
    payload.startupName = managerExtras.value.startupName.trim()
  } else {
    payload.inviteCode = ''
    payload.specialization = employeeExtras.value.skills.trim()
  }

  console.log('Register Payload:', payload)

  try {
    await run(() => auth.register(payload))

    toast.success('Account created')

    router.push(
  form.value.role === 'manager'
    ? '/onboarding'
    : '/join-workspace'
)
  } catch (err) {
    console.error('Register Error:', err)
    console.error('API Error:', error.value)

    toast.error(error.value || 'Registration failed')
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface flex flex-col">

    <!-- Mini nav -->
    <div class="bg-white border-b border-[#e4e4f0] px-8 py-5 flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-2 font-black text-slate-900 text-base">
        <div class="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
          <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        StartupPilot
      </router-link>
      <router-link to="/login" class="text-sm font-semibold text-slate-500 hover:text-primary transition-colors">
        Already have an account? <span class="text-primary">Sign in</span>
      </router-link>
    </div>

    <div class="flex-1 flex items-center justify-center px-4 py-14">

      <!-- Step 0: Role selection -->
      <div v-if="step === 0" class="w-full max-w-3xl text-center animate-slide-up">
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Choose your account type</h1>
        <p class="text-slate-500 mt-3 mb-12 max-w-md mx-auto">You can't change this later, so pick the role that matches what you'll do on StartupPilot.</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <!-- Manager card -->
          <button
            @click="selectRole('manager')"
            class="group relative text-left rounded-2xl border-2 bg-white p-8 transition-all duration-300 ease-out
                   border-[#e4e4f0] hover:border-violet-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(124,58,237,0.25)]
                   focus:outline-none focus:ring-4 focus:ring-violet-500/15"
          >
            <div class="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-5
                        transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <svg class="w-7 h-7 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            </div>
            <h3 class="font-black text-xl text-slate-900 mb-2 flex items-center gap-2">
              Manager
              <span class="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">Founder path</span>
            </h3>
            <p class="text-sm text-slate-500 leading-relaxed mb-4">Create and manage startups, teams, projects, and budgets.</p>
            <p class="text-xs text-slate-400 leading-relaxed border-t border-slate-100 pt-3">You'll define your startup, set goals, and get an AI-generated roadmap.</p>

            <span class="inline-flex items-center gap-1.5 text-violet-600 text-sm font-bold mt-5
                         opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Continue as Manager
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>

            <div class="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>

          <!-- Employee card -->
          <button
            @click="selectRole('employee')"
            class="group relative text-left rounded-2xl border-2 bg-white p-8 transition-all duration-300 ease-out
                   border-[#e4e4f0] hover:border-emerald-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_-8px_rgba(16,185,129,0.25)]
                   focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
          >
            <div class="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-5
                        transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
              <svg class="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 class="font-black text-xl text-slate-900 mb-2 flex items-center gap-2">
              Employee
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">Team path</span>
            </h3>
            <p class="text-sm text-slate-500 leading-relaxed mb-4">Join projects, view assigned tasks, and track your progress.</p>
            <p class="text-xs text-slate-400 leading-relaxed border-t border-slate-100 pt-3">You'll join a workspace and get matched to the right tasks for your skills.</p>

            <span class="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-bold mt-5
                         opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Continue as Employee
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>

            <div class="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        </div>
      </div>

      <!-- Step 1: Account details -->
      <div v-else class="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 animate-slide-up items-start">

        <!-- Form card -->
        <div class="sp-card p-8" :class="theme.cardBorder">
          <button @click="step = 0" class="sp-btn-ghost text-xs mb-3 px-2">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Change role
          </button>

          <div class="flex items-center gap-2 mb-1">
            <span class="sp-badge" :class="theme.badgeBg">{{ isManager ? '🚀 Manager' : '👥 Employee' }}</span>
          </div>
          <h2 class="text-xl font-black text-slate-900 mb-1">Create your account</h2>
          <p class="text-slate-500 text-sm mb-6">
            {{ isManager ? 'Set up your credentials to start building your startup.' : 'Set up your credentials to start collaborating with your team.' }}
          </p>

          <div v-if="error" class="mb-5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 space-y-1">
            <p>{{ error }}</p>
            <ul v-if="fieldErrors" class="list-disc list-inside text-xs font-normal">
              <li v-for="(msg, field) in fieldErrors" :key="field">{{ field }}: {{ Array.isArray(msg) ? msg.join(', ') : msg }}</li>
            </ul>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label class="sp-label">Full name</label>
              <input type="text" v-model="form.fullName" placeholder="Alex Johnson" class="sp-input"  />
            </div>
            <div>
              <label class="sp-label">Email</label>
              <input type="email" v-model="form.email" placeholder="alex@startup.com" class="sp-input"  />
            </div>
            <div>
              <label class="sp-label">Password</label>
              <input type="password" v-model="form.password" placeholder="Min. 8 characters" class="sp-input"  />
            </div>
            <div>
              <label class="sp-label">Confirm password</label>
              <input type="password" v-model="form.confirmPassword" placeholder="Repeat password" class="sp-input"  />
              <p v-if="form.confirmPassword && !passwordsMatch" class="text-xs text-red-500 mt-1.5">Passwords do not match.</p>
            </div>

            <!-- Optional, UI-only extras — never submitted to the register API -->
            <div class="pt-2 border-t border-slate-100">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Optional — helps us tailor your setup
              </p>

              <div v-if="isManager" class="space-y-3">
                <div>
                  <label class="sp-label">Startup name</label>
                  <input type="text" v-model="managerExtras.startupName" placeholder="e.g. Finterra" class="sp-input" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="sp-label">Company size</label>
                    <select v-model="managerExtras.companySize" class="sp-input">
                      <option value="">Select</option>
                      <option value="solo">Just me</option>
                      <option value="2-10">2–10</option>
                      <option value="11-50">11–50</option>
                      <option value="50+">50+</option>
                    </select>
                  </div>
                  <div>
                    <label class="sp-label">Industry</label>
                    <select v-model="managerExtras.industry" class="sp-input">
                      <option value="">Select</option>
                      <option value="saas">SaaS</option>
                      <option value="fintech">Fintech</option>
                      <option value="ai">AI</option>
                      <option value="ecommerce">E-Commerce</option>
                      <option value="health">Health Tech</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div v-else class="space-y-3">
                <div>
                  <label class="sp-label">Department</label>
                  <select v-model="employeeExtras.department" class="sp-input">
                    <option value="">Select</option>
                    <option value="engineering">Engineering</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="operations">Operations</option>
                  </select>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="sp-label">Experience</label>
                    <select v-model="employeeExtras.experience" class="sp-input">
                      <option value="">Select</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-level</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>
                  <div>
                    <label class="sp-label">Top skill</label>
                    <input type="text" v-model="employeeExtras.skills" placeholder="e.g. Vue.js" class="sp-input" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" :disabled="loading"
              class="sp-btn-primary w-full justify-center py-3 text-base shadow-elevated mt-2 disabled:opacity-60"
              :class="theme.btn">
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ loading ? 'Creating account...' : 'Create account' }}
            </button>
          </form>
        </div>

        <!-- Benefits card -->
        <div class="sp-card p-6 space-y-4 lg:sticky lg:top-24" :class="theme.cardBorder">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="theme.iconBg">
              <svg v-if="isManager" class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41" />
              </svg>
              <svg v-else class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 6.75a3 3 0 11-6 0 3 3 0 016 0zM4.5 19.5c1.05-3.6 3.84-6 7.5-6s6.45 2.4 7.5 6" />
              </svg>
            </div>
            <p class="font-bold text-sm text-slate-900">{{ isManager ? 'Built for founders' : 'Built for teams' }}</p>
          </div>

          <ul class="space-y-3">
            <li v-for="b in benefits" :key="b" class="flex items-start gap-2.5 text-sm text-slate-600">
              <span class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" :class="theme.dot"></span>
              {{ b }}
            </li>
          </ul>

          <div class="rounded-xl p-3.5 border" :class="theme.benefitsBg">
            <p class="text-xs leading-relaxed" :class="isManager ? 'text-violet-700' : 'text-emerald-700'">
              {{ isManager
                ? 'Next: tell us about your startup, then a quick onboarding before we generate your roadmap.'
                : 'Next: join your workspace with an invite code, then a quick onboarding to match you with tasks.' }}
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
