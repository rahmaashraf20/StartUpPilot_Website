<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

// UI-only — no endpoint exists yet for invite codes / join requests, so this
// is a frontend placeholder that doesn't touch the real onboarding submission
// (onboardingService.submitEmployee, still called from OnboardingView).
const mode = ref(null) // 'code' | 'request'
const inviteCode = ref('')
const requestNote = ref('')
const submitted = ref(false)

function chooseMode(m) {
  mode.value = m
  submitted.value = false
}

function submitCode() {
  if (!inviteCode.value.trim()) return
  // Placeholder only — no backend endpoint exists for this yet.
  submitted.value = true
  toast.success('Code accepted — let’s finish your profile.')
}

function submitRequest() {
  // Placeholder only — no backend endpoint exists for this yet.
  submitted.value = true
  toast.info('Request noted. Continuing to onboarding for now.')
}

function continueToOnboarding() {
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

      <span class="sp-badge bg-emerald-50 text-emerald-700 border border-emerald-100">👥 Employee</span>

      <div class="w-32 sm:w-40">
        <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" :style="`width: ${submitted ? 100 : 50}%`"></div>
        </div>
      </div>
    </div>

    <!-- Main layout -->
    <div class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

      <!-- Form panel -->
      <div class="lg:col-span-2 sp-card p-8 border-emerald-100 animate-slide-up">

        <div class="flex items-center gap-3 mb-6">
          <div class="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
            <svg class="w-5.5 h-5.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-black text-slate-900">Join a workspace</h1>
            <p class="text-sm text-slate-500">Connect with your team's existing startup on StartupPilot.</p>
          </div>
        </div>

        <!-- Mode selection -->
        <div v-if="!mode" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button @click="chooseMode('code')"
            class="group text-left rounded-2xl border-2 border-[#e4e4f0] bg-white p-6 transition-all duration-300
                   hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-elevated">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <h3 class="font-bold text-slate-900 mb-1">Join with invitation code</h3>
            <p class="text-xs text-slate-500 leading-relaxed">Already have a code from your manager? Enter it to join instantly.</p>
          </button>

          <button @click="chooseMode('request')"
            class="group text-left rounded-2xl border-2 border-[#e4e4f0] bg-white p-6 transition-all duration-300
                   hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-elevated">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 class="font-bold text-slate-900 mb-1">Request an invitation</h3>
            <p class="text-xs text-slate-500 leading-relaxed">No code yet? Send a request and continue setting up your profile.</p>
          </button>
        </div>

        <!-- Code entry -->
        <div v-else-if="mode === 'code' && !submitted" class="space-y-5">
          <button @click="mode = null" class="sp-btn-ghost text-xs px-2 -ml-2">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Choose a different option
          </button>
          <div>
            <label class="sp-label">Invitation code</label>
            <input type="text" v-model="inviteCode" placeholder="e.g. SP-7K2M-9XQ" class="sp-input uppercase tracking-wider font-mono" />
            <p class="text-xs text-slate-400 mt-1.5">Ask your manager for the workspace invite code.</p>
          </div>
          <button @click="submitCode" :disabled="!inviteCode.trim()" class="sp-btn-primary px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60">
            Verify & join
          </button>
        </div>

        <!-- Request entry -->
        <div v-else-if="mode === 'request' && !submitted" class="space-y-5">
          <button @click="mode = null" class="sp-btn-ghost text-xs px-2 -ml-2">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Choose a different option
          </button>
          <div>
            <label class="sp-label">Tell us which startup or team (optional)</label>
            <textarea v-model="requestNote" placeholder="e.g. Joining the Finterra engineering team" class="sp-input min-h-[100px] resize-none"></textarea>
          </div>
          <button @click="submitRequest" class="sp-btn-primary px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700">
            Send request
          </button>
        </div>

        <!-- Confirmation -->
        <div v-else class="space-y-5 text-center py-4">
          <div class="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
            <svg class="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h3 class="font-black text-lg text-slate-900">
              {{ mode === 'code' ? 'Workspace linked' : 'Request sent' }}
            </h3>
            <p class="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {{ mode === 'code'
                ? 'You\'re all set. Let\'s finish your profile so your team can find you.'
                : 'Your manager will be notified. In the meantime, let\'s finish your profile.' }}
            </p>
          </div>
        </div>

        <!-- Navigation -->
        <div v-if="submitted" class="flex justify-end pt-6 mt-6 border-t border-[#e4e4f0]">
          <button @click="continueToOnboarding" class="sp-btn-primary px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700">
            Continue to onboarding
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Side panel -->
      <div class="sp-card p-6 space-y-4 border-emerald-100 lg:sticky lg:top-24">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
            <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-sm font-bold text-slate-900">What's next</span>
        </div>
        <ul class="space-y-3 text-sm text-slate-600">
          <li class="flex items-start gap-2.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>Finish a short onboarding about your skills</li>
          <li class="flex items-start gap-2.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>Get matched to relevant tasks</li>
          <li class="flex items-start gap-2.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>Start tracking your progress with your team</li>
        </ul>
      </div>
    </div>
  </div>
</template>
