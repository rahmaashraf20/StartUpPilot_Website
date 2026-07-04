<script setup>
import { computed } from 'vue'
import NavItem from './NavItem.vue'

const props = defineProps({
  sections: { type: Array, required: true },
  activeId: { type: String, required: true },
  collapsed: { type: Boolean, default: false },
  mobileOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['navigate', 'toggle-collapse', 'close-mobile', 'logout'])

const widthClass = computed(() => (props.collapsed ? 'w-[72px]' : 'w-60'))
</script>

<template>
  <!-- Mobile overlay -->
  <Transition name="fade-overlay">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 lg:hidden"
      @click="emit('close-mobile')"
    />
  </Transition>

  <!-- Desktop sidebar (static) -->
  <aside
    class="sticky top-0 hidden h-screen max-h-screen lg:flex flex-col shrink-0 overflow-hidden border-r border-[#e4e4f0] bg-white py-5 transition-all duration-200"
    :class="[widthClass, collapsed ? 'px-2' : 'px-3']"
  >
    <router-link
      to="/"
      class="flex items-center gap-2 font-black text-base text-slate-900 tracking-tight px-2 mb-5"
      :class="collapsed ? 'justify-center' : ''"
    >
      <div class="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <span v-if="!collapsed">Startup<span class="text-primary">Pilot</span></span>
    </router-link>

    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-5 pr-1">
      <div v-for="section in sections" :key="section.title" class="space-y-0.5">
        <p v-if="!collapsed" class="sp-section-title px-3 mb-2 mt-1">{{ section.title }}</p>
        <div v-else class="h-2"></div>
        <NavItem
          v-for="item in section.items"
          :key="item.id"
          :to="item.to"
          :label="item.label"
          :icon="item.icon"
          :active="activeId === item.id"
          :collapsed="collapsed"
          @click="emit('navigate', item.id)"
        />
      </div>
    </div>

    <div class="pt-3 mt-3 border-t border-[#e4e4f0] space-y-0.5">
      <NavItem label="Logout" icon="logout" :collapsed="collapsed" @click="emit('logout')" />

      <button
        type="button"
        class="sp-nav-item text-slate-400 hover:bg-slate-50 hover:text-slate-700"
        :class="collapsed ? 'justify-center px-2' : ''"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="emit('toggle-collapse')"
      >
        <svg class="w-[18px] h-[18px] shrink-0 transition-transform" :class="collapsed ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        <span v-if="!collapsed">Collapse</span>
      </button>
    </div>
  </aside>

  <!-- Mobile drawer -->
  <Transition name="slide-drawer">
    <aside
      v-if="mobileOpen"
      class="fixed inset-y-0 left-0 z-50 h-dvh w-64 overflow-hidden bg-white flex flex-col py-5 px-3 lg:hidden shadow-elevated"
    >
      <div class="flex items-center justify-between px-3 mb-4">
        <router-link to="/" class="flex items-center gap-2 font-black text-base text-slate-900 tracking-tight" @click="emit('close-mobile')">
          <div class="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          Startup<span class="text-primary">Pilot</span>
        </router-link>
        <button type="button" class="sp-btn-ghost p-1.5" @click="emit('close-mobile')">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-5">
        <div v-for="section in sections" :key="section.title" class="space-y-0.5">
          <p class="sp-section-title px-3 mb-2 mt-1">{{ section.title }}</p>
          <NavItem
            v-for="item in section.items"
            :key="item.id"
            :to="item.to"
            :label="item.label"
            :icon="item.icon"
            :active="activeId === item.id"
            @click="emit('navigate', item.id); emit('close-mobile')"
          />
        </div>
      </div>

      <div class="pt-3 mt-3 border-t border-[#e4e4f0]">
        <NavItem label="Logout" icon="logout" @click="emit('logout')" />
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.fade-overlay-enter-active,
.fade-overlay-leave-active { transition: opacity 0.2s ease; }
.fade-overlay-enter-from,
.fade-overlay-leave-to { opacity: 0; }

.slide-drawer-enter-active,
.slide-drawer-leave-active { transition: transform 0.25s ease; }
.slide-drawer-enter-from,
.slide-drawer-leave-to { transform: translateX(-100%); }
</style>
