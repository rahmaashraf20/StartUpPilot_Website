<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import SkeletonBlock from '../components/dashboard/SkeletonBlock.vue'
import { mockSettings } from '../data/mockSettings'
import { mockProfile } from '../data/mockProfile'

// Tracks which sidebar section is active on this page (mirrors the pattern
// used in EmployeeTasksView / EmployeeCalendarView / EmployeeMessagesView /
// EmployeeProfileView so DashboardLayout's @navigate is handled consistently
// everywhere it's used).
const activeSection = ref('settings')
function handleNavigate(id) {
  activeSection.value = id
}

// ── Loading (prototype mode skeleton) ─────────────────────────────
const isLoading = ref(true)
onMounted(() => setTimeout(() => { isLoading.value = false }, 500))

// ── Local settings state (no backend) ───────────────────────────────
// `role` is read-only Account info not present in mockSettings.js itself,
// so it's sourced from mockProfile.js — same cross-file reuse convention
// EmployeeProfileView.vue already established for shared identity fields.
const settings = ref(
  mockSettings
    ? {
        account: { ...mockSettings.account, role: mockProfile?.role || 'employee' },
        appearance: { ...mockSettings.appearance },
        notifications: { ...mockSettings.notifications },
        security: { ...mockSettings.security },
      }
    : null,
)

const noSettings = computed(() => !isLoading.value && !settings.value)

const ROLE_LABEL = {
  employee: 'Employee',
  manager: 'Manager',
}

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' },
]

const TIMEZONE_OPTIONS = [
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Africa/Cairo', label: 'Cairo' },
]

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ── Local editing (Prototype Mode — no backend, no API) ─────────────
// `isEditing` toggles the page into edit mode. `draft` is a separate
// working copy so Cancel can discard changes without ever touching
// `settings` — only Save commits `draft` back into the real local state.
// Same pattern as EmployeeProfileView.vue's startEdit/saveEdit/cancelEdit.
const isEditing = ref(false)
const draft = ref(null)

function startEdit() {
  if (!settings.value) return
  draft.value = {
    account: { ...settings.value.account },
    appearance: { ...settings.value.appearance },
    notifications: { ...settings.value.notifications },
    security: { ...settings.value.security },
  }
  isEditing.value = true
}

function saveEdit() {
  if (!draft.value) return
  settings.value = {
    account: { ...draft.value.account },
    appearance: { ...draft.value.appearance },
    notifications: { ...draft.value.notifications },
    security: { ...draft.value.security },
  }
  isEditing.value = false
  draft.value = null
}

function cancelEdit() {
  isEditing.value = false
  draft.value = null
}

// ── Change Password (UI only, no backend) ───────────────────────────
function handleChangePassword() {
  if (draft.value) {
    draft.value.security.lastPasswordChange = new Date().toISOString().slice(0, 10)
  }
}
</script>

<template>
  <DashboardLayout :active-id="activeSection" @navigate="handleNavigate">
    <div class="space-y-6 animate-fade-in">

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p class="text-sm text-slate-500 mt-1">Manage your account, appearance, and notification preferences.</p>
        </div>

        <!-- Edit / Save / Cancel controls -->
        <div v-if="!isLoading && settings" class="flex items-center gap-2 shrink-0">
          <template v-if="!isEditing">
            <button type="button" class="sp-btn-primary text-xs px-4 py-2" @click="startEdit">
              Edit Settings
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

      <!-- Loading Skeleton -->
      <template v-if="isLoading">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonBlock height="10rem" rounded="1.125rem" />
          <SkeletonBlock height="10rem" rounded="1.125rem" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonBlock height="12rem" rounded="1.125rem" />
          <SkeletonBlock height="12rem" rounded="1.125rem" />
        </div>
        <SkeletonBlock height="8rem" rounded="1.125rem" />
      </template>

      <!-- Empty state: no settings data -->
      <div
        v-else-if="noSettings"
        class="sp-card p-10 flex flex-col items-center text-center"
      >
        <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p class="text-sm font-bold text-slate-700">Settings unavailable</p>
        <p class="text-xs text-slate-400 mt-1">We couldn't load your settings.</p>
      </div>

      <template v-else>
        <!-- Account + Appearance -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up">
          <!-- Account (read-only) -->
          <div class="sp-card p-5">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Account</h3>
            <dl class="space-y-3.5">
              <div>
                <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Email</dt>
                <dd class="text-sm text-slate-700 mt-0.5">{{ settings.account.email }}</dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Role</dt>
                <dd class="mt-1">
                  <span class="sp-badge bg-primary-light text-primary text-xs">
                    {{ ROLE_LABEL[settings.account.role] || settings.account.role }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <!-- Appearance -->
          <div class="sp-card p-5">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Appearance</h3>
            <div>
              <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5 block">Theme</label>
              <div v-if="!isEditing" class="text-sm text-slate-700">
                {{ THEME_OPTIONS.find((t) => t.value === settings.appearance.theme)?.label || settings.appearance.theme }}
              </div>
              <div v-else class="flex flex-wrap gap-1.5">
                <button
                  v-for="opt in THEME_OPTIONS"
                  :key="opt.value"
                  type="button"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border"
                  :class="draft.appearance.theme === opt.value
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-slate-500 border-[#e4e4f0] hover:bg-slate-50 hover:text-slate-700'"
                  @click="draft.appearance.theme = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications + Preferences -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-up" style="animation-delay: 60ms">
          <!-- Notifications -->
          <div class="sp-card p-5">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Notifications</h3>
            <div class="space-y-3.5">
              <label class="flex items-center justify-between gap-3 cursor-pointer">
                <span class="text-sm text-slate-700">Email notifications</span>
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-[#e4e4f0] text-primary focus:ring-primary/30"
                  :checked="isEditing ? draft.notifications.emailNotifications : settings.notifications.emailNotifications"
                  :disabled="!isEditing"
                  @change="isEditing && (draft.notifications.emailNotifications = $event.target.checked)"
                />
              </label>
              <label class="flex items-center justify-between gap-3 cursor-pointer">
                <span class="text-sm text-slate-700">Push notifications</span>
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-[#e4e4f0] text-primary focus:ring-primary/30"
                  :checked="isEditing ? draft.notifications.pushNotifications : settings.notifications.pushNotifications"
                  :disabled="!isEditing"
                  @change="isEditing && (draft.notifications.pushNotifications = $event.target.checked)"
                />
              </label>
              <label class="flex items-center justify-between gap-3 cursor-pointer">
                <span class="text-sm text-slate-700">AI recommendations</span>
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-[#e4e4f0] text-primary focus:ring-primary/30"
                  :checked="isEditing ? draft.notifications.aiSuggestions : settings.notifications.aiSuggestions"
                  :disabled="!isEditing"
                  @change="isEditing && (draft.notifications.aiSuggestions = $event.target.checked)"
                />
              </label>
            </div>
          </div>

          <!-- Preferences -->
          <div class="sp-card p-5">
            <h3 class="text-sm font-bold text-slate-900 mb-4">Preferences</h3>
            <div class="space-y-3.5">
              <div>
                <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5 block">Language</label>
                <p v-if="!isEditing" class="text-sm text-slate-700">
                  {{ LANGUAGE_OPTIONS.find((l) => l.value === settings.account.language)?.label || settings.account.language }}
                </p>
                <select
                  v-else
                  v-model="draft.account.language"
                  class="text-sm font-medium text-slate-700 bg-white border border-[#e4e4f0] rounded-lg px-2.5 py-1.5 w-full cursor-pointer outline-none hover:bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option v-for="opt in LANGUAGE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>
              <div>
                <label class="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5 block">Timezone</label>
                <p v-if="!isEditing" class="text-sm text-slate-700">
                  {{ TIMEZONE_OPTIONS.find((t) => t.value === settings.account.timezone)?.label || settings.account.timezone }}
                </p>
                <select
                  v-else
                  v-model="draft.account.timezone"
                  class="text-sm font-medium text-slate-700 bg-white border border-[#e4e4f0] rounded-lg px-2.5 py-1.5 w-full cursor-pointer outline-none hover:bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option v-for="opt in TIMEZONE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Security -->
        <div class="sp-card p-5 animate-slide-up" style="animation-delay: 100ms">
          <h3 class="text-sm font-bold text-slate-900 mb-4">Security</h3>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-slate-800">Password</p>
              <p class="text-xs text-slate-400 mt-0.5">
                Last changed {{ formatDate(isEditing ? draft.security.lastPasswordChange : settings.security.lastPasswordChange) }}
              </p>
            </div>
            <button
              type="button"
              class="sp-btn-ghost text-xs px-4 py-2 shrink-0"
              :disabled="!isEditing"
              @click="handleChangePassword"
            >
              Change Password
            </button>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>