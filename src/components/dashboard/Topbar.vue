<script setup>
import NotificationButton from './NotificationButton.vue'
import UserMenu from './UserMenu.vue'

defineProps({
  user: { type: Object, required: true },
  notificationsCount: { type: Number, default: 0 },
  profilePath: { type: String, default: null },
  settingsPath: { type: String, default: null },
})

const emit = defineEmits(['open-mobile-sidebar', 'logout', 'navigate-user'])
</script>

<template>
  <header class="bg-white/80 backdrop-blur-lg border-b border-[#e4e4f0] sticky top-0 z-30">
    <div class="h-16 flex items-center justify-between gap-3 px-4 lg:px-6">

      <!-- Mobile menu toggle -->
      <button
        type="button"
        class="sp-btn-ghost p-2 lg:hidden text-slate-500 shrink-0"
        aria-label="Open menu"
        @click="emit('open-mobile-sidebar')"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>




      <!-- Right Actions -->
        <div class="flex items-center justify-between gap-3 shrink-0">


        <div class="hidden sm:block h-6 w-px bg-[#e4e4f0]"></div>

        <UserMenu
          :name="user.fullName"
          :role-label="user.roleLabel"
          :avatar-url="user.avatarUrl"
          :profile-path="profilePath"
          :settings-path="settingsPath"
          @logout="emit('logout')"
          @navigate="(section) => emit('navigate-user', section)"
        />
      </div>

    </div>
  </header>
</template>