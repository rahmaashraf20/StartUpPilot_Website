<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import SkeletonBlock from '../components/dashboard/SkeletonBlock.vue'
import { mockProfile } from '../data/mockProfile'

// Tracks which sidebar section is active on this page (mirrors the pattern
// used in EmployeeTasksView / EmployeeProjectsView / EmployeeCalendarView /
// EmployeeMessagesView so DashboardLayout's @navigate is handled consistently
// everywhere it's used).
const activeSection = ref('profile')
function handleNavigate(id) {
  activeSection.value = id
}

// ── Loading (prototype mode skeleton) ─────────────────────────────
const isLoading = ref(true)
onMounted(() => setTimeout(() => { isLoading.value = false }, 500))

// ── Local profile state (no backend) ────────────────────────────────
const profile = ref(mockProfile ? { ...mockProfile } : null)

const noProfile = computed(() => !isLoading.value && !profile.value)

// ── Local editing (Prototype Mode — no backend, no API) ─────────────
// `isEditing` toggles the page into edit mode. `draft` is a separate
// working copy so Cancel can discard changes without ever touching
// `profile` — only Save commits `draft` back into the real local state.
const isEditing = ref(false)
const draft = ref(null)
const newSkill = ref('')

function startEdit() {
  if (!profile.value) return
  draft.value = {
    ...profile.value,
    skills: [...(profile.value.skills || [])],
  }
  newSkill.value = ''
  isEditing.value = true
}

function saveEdit() {
  if (!draft.value) return
  profile.value = { ...draft.value, skills: [...draft.value.skills] }
  isEditing.value = false
  draft.value = null
}

function cancelEdit() {
  isEditing.value = false
  draft.value = null
  newSkill.value = ''
}

function addSkill() {
  const skill = newSkill.value.trim()
  if (!skill || !draft.value) return
  if (!draft.value.skills.includes(skill)) {
    draft.value.skills.push(skill)
  }
  newSkill.value = ''
}

function removeSkill(skill) {
  if (!draft.value) return
  draft.value.skills = draft.value.skills.filter((s) => s !== skill)
}

function initials(name) {
  return (
    (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'U'
  )
}

const ROLE_LABEL = {
  employee: 'Employee',
  manager: 'Manager',
}

function formatJoinDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ── Stats (reuses StatCard, same shape as other views' stats rows) ──
const stats = computed(() => {
  if (!profile.value) return []
  const s = profile.value.stats || {}
  return [
    { id: 'completed-tasks', label: 'Completed Tasks', value: s.completedTasks ?? 0, icon: 'tasks', tone: 'primary' },
    { id: 'active-projects', label: 'Active Projects', value: s.activeProjects ?? 0, icon: 'files', tone: 'violet' },
    { id: 'ai-suggestions', label: 'AI Suggestions Applied', value: s.aiSuggestionsApplied ?? 0, icon: 'ai', tone: 'amber' },
    { id: 'streak', label: 'Current Streak', value: s.currentStreak ?? 0, icon: 'bell', tone: 'primary' },
  ]
})
</script>

<template>
  <DashboardLayout :active-id="activeSection" @navigate="handleNavigate">
    <div class="space-y-6 animate-fade-in">

      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Profile</h1>
        <p class="text-sm text-slate-500 mt-1">Your account details, role, and activity at a glance.</p>
      </div>

      <!-- Loading Skeleton -->
      <template v-if="isLoading">
        <SkeletonBlock height="9rem" rounded="1.125rem" />
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonBlock v-for="i in 4" :key="i" height="4.5rem" rounded="1.125rem" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonBlock height="10rem" rounded="1.125rem" />
          <SkeletonBlock height="10rem" rounded="1.125rem" />
        </div>
        <SkeletonBlock height="6rem" rounded="1.125rem" />
      </template>

      <!-- Empty state: no profile data -->
      <div
        v-else-if="noProfile"
        class="sp-card p-10 flex flex-col items-center text-center"
      >
        <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p class="text-sm font-bold text-slate-700">Profile unavailable</p>
        <p class="text-xs text-slate-400 mt-1">We couldn't load your profile information.</p>
      </div>

      <template v-else>
        <!-- Profile Summary Card -->
        <div class="sp-card p-6 flex flex-col sm:flex-row sm:items-center gap-5 animate-slide-up">
          <img
            v-if="profile.avatarUrl"
            :src="profile.avatarUrl"
            :alt="profile.fullName"
            class="w-20 h-20 rounded-2xl object-cover shrink-0"
          />
          <div
            v-else
            class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-2xl font-bold shrink-0"
          >
            {{ initials(isEditing ? draft.fullName : profile.fullName) }}
          </div>

          <div class="flex-1 min-w-0">
            <template v-if="isEditing">
              <input
                v-model="draft.fullName"
                type="text"
                class="sp-input text-lg font-black text-slate-900 py-2"
                placeholder="Full name"
                aria-label="Full name"
              />
            </template>
            <h2 v-else class="text-xl font-black text-slate-900 truncate">{{ profile.fullName }}</h2>

            <p class="text-sm text-slate-500 mt-0.5">{{ profile.position }} &middot; {{ profile.department }}</p>

            <div class="flex flex-wrap items-center gap-2 mt-3">
              <span class="sp-badge bg-primary-light text-primary text-xs">
                {{ ROLE_LABEL[profile.role] || profile.role }}
              </span>
              <span class="sp-badge bg-slate-100 text-slate-500 text-xs">
                Joined {{ formatJoinDate(profile.joinDate) }}
              </span>
            </div>
          </div>

          <!-- Edit / Save / Cancel controls -->
          <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <template v-if="!isEditing">
              <button type="button" class="sp-btn-primary text-xs px-4 py-2" @click="startEdit">
                Edit Profile
              </button>
            </template>
            <template v-else>
              <button type="button" class="sp-btn-ghost text-xs px-4 py-2" @click="cancelEdit">
                Cancel
              </button>
              <button type="button" class="sp-btn-primary text-xs px-4 py-2" @click="saveEdit">
                Save
              </button>
            </template>
          </div>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style="animation-delay: 60ms">
          <StatCard
            v-for="stat in stats"
            :key="stat.id"
            :label="stat.label"
            :value="stat.value"
            :icon="stat.icon"
            :tone="stat.tone"
          />
        </div>

        <!-- Personal Information + Professional Information -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up" style="animation-delay: 100ms">
          <!-- Personal Information -->
          <div class="sp-card p-5">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Personal Information</h3>
            <dl class="space-y-3.5">
              <div class="flex items-start gap-3">
                <svg class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div class="min-w-0">
                  <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Email</dt>
                  <dd class="text-sm text-slate-700 truncate">{{ profile.email }}</dd>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <svg class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div class="min-w-0 flex-1">
                  <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Phone</dt>
                  <dd v-if="!isEditing" class="text-sm text-slate-700 truncate">{{ profile.phone }}</dd>
                  <input
                    v-else
                    v-model="draft.phone"
                    type="text"
                    class="sp-input text-sm py-1.5 mt-1"
                    placeholder="Phone number"
                    aria-label="Phone"
                  />
                </div>
              </div>
              <div class="flex items-start gap-3">
                <svg class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div class="min-w-0 flex-1">
                  <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Location</dt>
                  <dd v-if="!isEditing" class="text-sm text-slate-700 truncate">{{ profile.location }}</dd>
                  <input
                    v-else
                    v-model="draft.location"
                    type="text"
                    class="sp-input text-sm py-1.5 mt-1"
                    placeholder="Location"
                    aria-label="Location"
                  />
                </div>
              </div>
            </dl>
          </div>

          <!-- Professional Information -->
          <div class="sp-card p-5">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Professional Information</h3>
            <div class="space-y-3.5">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Bio</p>
                <p v-if="!isEditing" class="text-sm text-slate-700 leading-relaxed">{{ profile.bio }}</p>
                <textarea
                  v-else
                  v-model="draft.bio"
                  rows="4"
                  class="sp-input text-sm leading-relaxed resize-none"
                  placeholder="Tell your team about yourself…"
                  aria-label="Bio"
                ></textarea>
              </div>
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Experience</p>
                <p v-if="!isEditing" class="text-sm text-slate-700">{{ profile.experience }}</p>
                <input
                  v-else
                  v-model="draft.experience"
                  type="text"
                  class="sp-input text-sm py-1.5"
                  placeholder="e.g. 4 years"
                  aria-label="Experience"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div class="sp-card p-5 animate-slide-up" style="animation-delay: 140ms">
          <h3 class="text-sm font-bold text-slate-900 mb-4">Skills</h3>

          <template v-if="!isEditing">
            <div v-if="profile.skills && profile.skills.length" class="flex flex-wrap gap-2">
              <span
                v-for="skill in profile.skills"
                :key="skill"
                class="sp-badge bg-primary-light text-primary text-xs"
              >
                {{ skill }}
              </span>
            </div>
            <p v-else class="text-sm text-slate-400">No skills listed yet.</p>
          </template>

          <template v-else>
            <div v-if="draft.skills.length" class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="skill in draft.skills"
                :key="skill"
                class="sp-badge bg-primary-light text-primary text-xs inline-flex items-center gap-1.5"
              >
                {{ skill }}
                <button
                  type="button"
                  class="text-primary/60 hover:text-primary leading-none"
                  :aria-label="`Remove ${skill}`"
                  @click="removeSkill(skill)"
                >
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
            <p v-else class="text-sm text-slate-400 mb-3">No skills listed yet.</p>

            <div class="flex items-center gap-2">
              <input
                v-model="newSkill"
                type="text"
                class="sp-input text-sm py-2"
                placeholder="Add a skill…"
                aria-label="Add a skill"
                @keydown.enter.prevent="addSkill"
              />
              <button
                type="button"
                class="sp-btn-ghost text-xs px-3 py-2 shrink-0"
                :disabled="!newSkill.trim()"
                @click="addSkill"
              >
                Add
              </button>
            </div>
          </template>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>