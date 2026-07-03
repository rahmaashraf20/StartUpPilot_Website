<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import { useAuthUser } from '../composables/useAuthUser'
import {
  managerSidebarSections,
  managerNotificationsCount,
  mockManagerUser,
} from '../data/mockManager'

const router = useRouter()
const topbarUser = useAuthUser(mockManagerUser)
const activeNav = ref('settings')

function handleNavigate(id) {
  activeNav.value = id
  if (id === 'dashboard') router.push('/dashboard/manager')
  if (id === 'financials') router.push('/manager/financials')
  if (id === 'projects') router.push('/manager/projects')
  if (id === 'tasks') router.push('/manager/tasks')
  if (id === 'teams') router.push('/manager/teams')
  if (id === 'calendar') router.push('/manager/calendar')
}

const workspaceName = ref('Acme AI Corp')
const publicUrl = ref('acme-corp')

const notifications = ref({
  email: true,
  desktop: true,
  inApp: false,
})

const language = ref('English (US)')
const timezone = ref('PST (UTC-8)')
const darkMode = ref(true)

const activeSection = ref('workspace')

const sections = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'roles', label: 'Role Management' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'billing', label: 'Billing & Subscription' },
  { id: 'security', label: 'Security' },
  { id: 'preferences', label: 'Account Preferences' },
]

const integrations = ref([
  { name: 'GitHub', desc: 'Link repos for AI-driven code reviews.', connected: true, icon: '🔴' },
  { name: 'Google Calendar', desc: 'Coordinate tasks with your schedule.', connected: false, icon: '🔵' },
])

const roleMembers = ref([
  { id: 'r1', name: 'Jane Doe', initials: 'JD', role: 'Manager', status: 'Active', color: 'from-primary to-violet-500' },
  { id: 'r2', name: 'John Smith', initials: 'JS', role: 'Team Lead', status: 'Offline', color: 'from-orange-400 to-red-400' },
])

function toggle(key) {
  notifications.value[key] = !notifications.value[key]
}
</script>

<template>
  <DashboardLayout
    :active-id="activeNav"
    :sidebar-sections="managerSidebarSections"
    :notifications-count="managerNotificationsCount"
    :user="topbarUser"
    @navigate="handleNavigate"
  >
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-xl font-black text-slate-900">Workspace Settings</h1>
      <p class="text-sm text-slate-400 mt-0.5">Update your workspace identity and core configuration.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">

      <!-- Sidebar nav -->
      <div class="lg:col-span-1">
        <nav class="sp-card p-2">
          <button
            v-for="sec in sections"
            :key="sec.id"
            @click="activeSection = sec.id"
            class="w-full text-left px-3 py-2.5 text-sm rounded-xl transition-colors font-medium"
            :class="activeSection === sec.id ? 'bg-primary-light text-primary font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'"
          >{{ sec.label }}</button>
        </nav>
      </div>

      <!-- Content -->
      <div class="lg:col-span-3 space-y-6">

        <!-- Workspace Identity -->
        <div class="sp-card p-6">
          <h2 class="font-bold text-slate-900 mb-5">Workspace Identity</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="flex-1">
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Workspace Name</label>
              <input v-model="workspaceName" type="text" class="sp-input" />

              <label class="block text-xs font-semibold text-slate-600 mb-1.5 mt-4">Public URL</label>
              <div class="flex items-center border border-[#e4e4f0] rounded-xl overflow-hidden">
                <span class="px-3 py-2.5 bg-slate-50 text-xs text-slate-400 border-r border-[#e4e4f0] whitespace-nowrap">startuppilot.ai/</span>
                <input v-model="publicUrl" type="text" class="flex-1 px-3 py-2.5 text-sm outline-none" />
              </div>
            </div>

            <div class="flex flex-col items-center justify-center border-2 border-dashed border-[#e4e4f0] rounded-2xl p-6 cursor-pointer hover:border-primary transition-colors">
              <div class="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center mb-3">
                <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p class="text-xs font-semibold text-primary">Change Logo</p>
              <p class="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</p>
            </div>
          </div>

          <div class="flex justify-end mt-5">
            <button class="sp-btn-primary">Save Changes</button>
          </div>
        </div>

        <!-- Role Management -->
        <div class="sp-card p-6">
          <h2 class="font-bold text-slate-900 mb-1">Role Management</h2>
          <p class="text-sm text-slate-400 mb-5">Configure permissions for your core team members.</p>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-[#e4e4f0]">
                  <th class="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wide pb-3">User</th>
                  <th class="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wide pb-3">Role</th>
                  <th class="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wide pb-3">Status</th>
                  <th class="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wide pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in roleMembers" :key="member.id" class="border-b border-[#e4e4f0] last:border-0">
                  <td class="py-3">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold" :class="member.color">{{ member.initials }}</div>
                      <span class="text-sm font-medium text-slate-800">{{ member.name }}</span>
                    </div>
                  </td>
                  <td class="py-3">
                    <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                      :class="member.role === 'Manager' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'">
                      {{ member.role }}
                    </span>
                  </td>
                  <td class="py-3">
                    <span class="flex items-center gap-1.5 text-sm"
                      :class="member.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'">
                      <span class="w-2 h-2 rounded-full" :class="member.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                      {{ member.status }}
                    </span>
                  </td>
                  <td class="py-3">
                    <button class="sp-btn-ghost p-1.5 text-slate-400">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Notifications -->
        <div class="sp-card p-6">
          <h2 class="font-bold text-slate-900 mb-5">Notification Toggles</h2>
          <div class="space-y-4">
            <div v-for="notif in [
              { key: 'email', label: 'Email Notifications' },
              { key: 'desktop', label: 'Desktop Push' },
              { key: 'inApp', label: 'In-app Alerts' },
            ]" :key="notif.key" class="flex items-center justify-between">
              <span class="text-sm font-medium text-slate-700">{{ notif.label }}</span>
              <button
                @click="toggle(notif.key)"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="notifications[notif.key] ? 'bg-primary' : 'bg-slate-200'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                  :class="notifications[notif.key] ? 'translate-x-6' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>
          <p class="text-xs text-slate-400 mt-4">Manage granular alerts for projects and specific team activity.</p>
        </div>

        <!-- App Integrations -->
        <div class="sp-card p-6">
          <h2 class="font-bold text-slate-900 mb-1">App Integrations</h2>
          <p class="text-sm text-slate-400 mb-5">Connect your favorite tools to sync data across your workspace.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="integ in integrations" :key="integ.name" class="border border-[#e4e4f0] rounded-xl p-4 text-center">
              <div class="text-3xl mb-2">{{ integ.icon }}</div>
              <p class="font-bold text-slate-900 mb-1">{{ integ.name }}</p>
              <p class="text-xs text-slate-400 mb-4">{{ integ.desc }}</p>
              <button
                @click="integ.connected = !integ.connected"
                class="w-full py-2 rounded-xl text-sm font-semibold transition-colors"
                :class="integ.connected ? 'bg-primary-light text-primary hover:bg-primary/20' : 'bg-primary text-white hover:bg-primary-dark'"
              >{{ integ.connected ? 'Manage' : 'Connect' }}</button>
            </div>
          </div>
        </div>

        <!-- Billing -->
        <div class="sp-card p-6">
          <h2 class="font-bold text-slate-900 mb-5">Billing & Subscription</h2>
          <div class="border border-[#e4e4f0] rounded-xl p-4 mb-4">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                  <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <p class="font-bold text-slate-900">Enterprise Plan</p>
                  <p class="text-xs text-slate-400">Billed monthly · $149/month · Renews on Dec 12, 2023</p>
                </div>
              </div>
              <button class="sp-btn-outline text-sm">Change Plan</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-surface rounded-xl p-3">
                <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">PAYMENT METHOD</p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span class="text-sm text-slate-600 font-mono">·· ·· ·· 4242</span>
                  </div>
                  <button class="text-xs font-semibold text-primary hover:underline">Edit</button>
                </div>
              </div>
              <div class="bg-surface rounded-xl p-3">
                <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">CURRENT USAGE</p>
                <div class="w-full bg-slate-200 h-2 rounded-full mb-1">
                  <div class="h-full rounded-full bg-primary" style="width: 62%"></div>
                </div>
                <div class="flex justify-between text-[10px] text-slate-400">
                  <span>6.2GB of 10GB</span>
                  <span>62% used</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Security -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div class="sp-card p-6">
            <h2 class="font-bold text-slate-900 mb-4">Security</h2>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p class="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                  <p class="text-xs text-slate-400 mb-1">Strongly recommended for sensitive accounts.</p>
                  <button class="text-xs font-bold text-primary hover:underline">Enable</button>
                </div>
              </div>
              <div class="border-t border-[#e4e4f0] pt-4">
                <p class="text-sm font-bold text-slate-900 mb-2">Active Sessions</p>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="text-xs text-slate-600">Chrome on MacOS (Current)</span>
                  </div>
                  <span class="text-xs text-primary">San Francisco, CA</span>
                </div>
                <button class="text-xs font-bold text-red-500 hover:underline">Sign out all other sessions</button>
              </div>
            </div>
          </div>

          <div class="sp-card p-6">
            <h2 class="font-bold text-slate-900 mb-4">Account Preferences</h2>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">Language</label>
                  <select v-model="language" class="sp-input text-sm">
                    <option>English (US)</option>
                    <option>Arabic</option>
                    <option>French</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">Timezone</label>
                  <select v-model="timezone" class="sp-input text-sm">
                    <option>PST (UTC-8)</option>
                    <option>EST (UTC-5)</option>
                    <option>UTC</option>
                    <option>GST (UTC+4)</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-[#e4e4f0]">
                <span class="text-sm font-semibold text-slate-700">Dark mode</span>
                <button
                  @click="darkMode = !darkMode"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="darkMode ? 'bg-primary' : 'bg-slate-200'"
                >
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform" :class="darkMode ? 'translate-x-6' : 'translate-x-1'"></span>
                </button>
              </div>

              <div class="pt-2 border-t border-[#e4e4f0]">
                <button class="text-xs font-bold text-red-500 hover:underline flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete my account
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>
