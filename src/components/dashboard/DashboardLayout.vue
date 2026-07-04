<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useAuthUser } from '../../composables/useAuthUser'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
import { mockEmployeeUser, mockNotificationsCount, sidebarNavSections } from '../../data/mockEmployee'

const props = defineProps({
  activeId: { type: String, default: 'tasks' },
  sidebarSections: { type: Array, default: null },
  notificationsCount: { type: Number, default: null },
  user: { type: Object, default: null },
  // Real routes for the Topbar user-menu's Profile/Settings items.
  // Defaults to the Employee paths (the layout's default context); pages
  // for a role without those routes (e.g. Manager, which has Settings but
  // no Profile page yet) should pass an explicit override, or null to
  // leave the click as a no-op navigate event.
  profilePath: { type: String, default: undefined },
  settingsPath: { type: String, default: undefined },
})

const emit = defineEmits(['navigate'])

const router = useRouter()
const auth = useAuthStore()

const defaultEmployeeUser = useAuthUser(mockEmployeeUser)
const employee = computed(() => props.user || defaultEmployeeUser.value)

const navSections = computed(() => props.sidebarSections || sidebarNavSections)
const notifCount = computed(() => props.notificationsCount ?? mockNotificationsCount)

// Default Profile/Settings links only apply to the default (Employee)
// context. Pages that pass their own `user` (e.g. Manager views) get no
// link unless they explicitly pass profilePath/settingsPath themselves.
const resolvedProfilePath = computed(() =>
  props.profilePath !== undefined ? props.profilePath : (props.user ? null : '/dashboard/employee/profile')
)
const resolvedSettingsPath = computed(() =>
  props.settingsPath !== undefined ? props.settingsPath : (props.user ? null : '/dashboard/employee/settings')
)

const collapsed = ref(false)
const mobileOpen = ref(false)

function handleNavigate(id) {
  emit('navigate', id)
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="h-screen overflow-hidden bg-surface flex">

    <Sidebar
      :sections="navSections"
      :active-id="activeId"
      :collapsed="collapsed"
      :mobile-open="mobileOpen"
      @navigate="handleNavigate"
      @toggle-collapse="collapsed = !collapsed"
      @close-mobile="mobileOpen = false"
      @logout="handleLogout"
    />

    <div class="min-w-0 flex flex-1 flex-col overflow-hidden">
      <Topbar
        :user="employee"
        :notifications-count="notifCount"
        :profile-path="resolvedProfilePath"
        :settings-path="resolvedSettingsPath"
        @open-mobile-sidebar="mobileOpen = true"
        @logout="handleLogout"
        @navigate-user="handleNavigate"
      />

      <main class="min-w-0 flex-1 overflow-y-auto p-5 lg:p-7">
        <slot />
      </main>
    </div>
  </div>
</template>
