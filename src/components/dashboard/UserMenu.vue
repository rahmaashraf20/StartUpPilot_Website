<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  name: { type: String, required: true },
  roleLabel: { type: String, default: '' },
  avatarUrl: { type: String, default: null },
  // Optional real routes for the Profile/Settings menu items. When omitted,
  // UserMenu only emits 'navigate' and leaves routing to the parent — this
  // keeps the component role-agnostic (e.g. Manager has no Profile page yet).
  profilePath: { type: String, default: null },
  settingsPath: { type: String, default: null },
})

const router = useRouter()

const emit = defineEmits(['logout', 'navigate'])

const open = ref(false)
const rootEl = ref(null)

const initials = computed(() =>
  props.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'
)

function toggle() {
  open.value = !open.value
}

function handleClickOutside(e) {
  if (rootEl.value && !rootEl.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="rootEl" class="relative">
    <button
      type="button"
      class="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-50 transition-colors"
      @click="toggle"
    >
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="name"
        class="w-8 h-8 rounded-full object-cover shrink-0"
      />
      <div
        v-else
        class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0"
      >
        {{ initials }}
      </div>

      <div class="hidden sm:flex flex-col items-start leading-tight">
        <span class="text-sm font-semibold text-slate-800">{{ name }}</span>
        <span v-if="roleLabel" class="sp-badge bg-primary-light text-primary text-[10px] px-1.5 py-0">{{ roleLabel }}</span>
      </div>

      <svg class="hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform" :class="open ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition name="fade-overlay">
      <div
        v-if="open"
        class="absolute right-0 mt-2 w-48 sp-card py-1.5 z-50"
      >
        <button type="button" class="sp-nav-item text-slate-600 hover:bg-slate-50 hover:text-slate-900" @click="emit('navigate', 'profile'); open = false; if (profilePath) router.push(profilePath)">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </button>
        <button type="button" class="sp-nav-item text-slate-600 hover:bg-slate-50 hover:text-slate-900" @click="emit('navigate', 'settings'); open = false; if (settingsPath) router.push(settingsPath)">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
        <div class="my-1 border-t border-[#e4e4f0]"></div>
        <button type="button" class="sp-nav-item text-red-500 hover:bg-red-50" @click="emit('logout'); open = false">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-overlay-enter-active,
.fade-overlay-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.fade-overlay-enter-from,
.fade-overlay-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
