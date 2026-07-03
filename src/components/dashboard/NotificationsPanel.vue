<script setup>
import { computed } from 'vue'
import { mockNotifications } from '../../data/mockNotifications'

// Local-only notification state (no backend). `mockNotifications` is a
// shared reactive array (see mockNotifications.js), so mutating it here
// is automatically reflected anywhere else it's read — e.g. the unread
// badge count derived in DashboardLayout. Still emits so a parent (e.g.
// NotificationButton) can react to changes if it chooses to.
const emit = defineEmits(['change'])

const notifications = mockNotifications

const unreadCount = computed(() => notifications.filter((n) => !n.read).length)
const allRead = computed(() => notifications.every((n) => n.read))

const TYPE_STYLE = {
  task: 'bg-primary-light text-primary',
  project: 'bg-violet-50 text-violet-600',
  ai: 'bg-emerald-50 text-emerald-600',
  system: 'bg-slate-100 text-slate-500',
}

const TYPE_LABEL = {
  task: 'Task',
  project: 'Project',
  ai: 'AI Insight',
  system: 'System',
}

function emitChange() {
  emit('change', { unreadCount: unreadCount.value })
}

function markAsRead(id) {
  const n = notifications.find((n) => n.id === id)
  if (n && !n.read) {
    n.read = true
    emitChange()
  }
}

function markAllAsRead() {
  notifications.forEach((n) => { n.read = true })
  emitChange()
}
</script>

<template>
  <div class="sp-card w-80 max-w-[90vw] py-0 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-[#e4e4f0]">
      <h3 class="text-sm font-bold text-slate-900">Notifications</h3>
      <button
        v-if="!allRead"
        type="button"
        class="text-xs font-semibold text-primary hover:underline"
        @click="markAllAsRead"
      >
        Mark all as read
      </button>
    </div>

    <!-- Empty state: everything read -->
    <div v-if="allRead" class="py-10 px-4 flex flex-col items-center text-center">
      <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-sm font-bold text-slate-700">You're all caught up</p>
      <p class="text-xs text-slate-400 mt-1">No unread notifications.</p>
    </div>

    <!-- Notification list -->
    <ul v-else class="max-h-96 overflow-y-auto divide-y divide-[#e4e4f0]">
      <li
        v-for="n in notifications"
        :key="n.id"
        class="flex items-start gap-3 px-4 py-3 transition-colors"
        :class="n.read ? 'bg-white' : 'bg-primary-light/30 hover:bg-primary-light/50'"
      >
        <span
          class="w-2 h-2 rounded-full shrink-0 mt-1.5"
          :class="n.read ? 'bg-transparent' : 'bg-primary'"
        ></span>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <span class="sp-badge text-[10px]" :class="TYPE_STYLE[n.type] || 'bg-slate-100 text-slate-500'">
              {{ TYPE_LABEL[n.type] || 'Update' }}
            </span>
            <span class="text-[11px] text-slate-400">{{ n.time }}</span>
          </div>
          <p class="text-sm font-semibold text-slate-900 leading-snug">{{ n.title }}</p>
          <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{{ n.message }}</p>

          <button
            v-if="!n.read"
            type="button"
            class="text-[11px] font-semibold text-primary hover:underline mt-1.5"
            @click="markAsRead(n.id)"
          >
            Mark as Read
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>