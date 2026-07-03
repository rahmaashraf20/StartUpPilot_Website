<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import SkeletonBlock from '../components/dashboard/SkeletonBlock.vue'
import { mockConversations, mockMessagesByConversation } from '../data/mockMessages'

// Tracks which sidebar section is active on this page (mirrors the pattern
// used in EmployeeTasksView / EmployeeProjectsView / EmployeeCalendarView
// so DashboardLayout's @navigate is handled consistently everywhere it's used).
const activeSection = ref('messages')
function handleNavigate(id) {
  activeSection.value = id
}

// ── Loading (prototype mode skeleton) ─────────────────────────────
const isLoading = ref(true)
onMounted(() => {
  setTimeout(() => { isLoading.value = false }, 500)
  scrollToBottom()
})

// ── Conversation + thread state ──────────────────────────────────
// `mockConversations` and `mockMessagesByConversation` are shared reactive
// objects (see mockMessages.js — same pattern as mockNotifications.js in
// Sprint 8). Reading/mutating them directly here, instead of cloning into
// a local copy, keeps unread counts and message threads in sync with any
// other consumer of this data — no duplicate state, no stale copies.
const conversations = mockConversations
const messagesByConversation = mockMessagesByConversation

// ── Active conversation (drives both panes) ────────────────────────
const activeConversationId = ref(conversations[0]?.id || null)

const activeConversation = computed(
  () => conversations.find((c) => c.id === activeConversationId.value) || null,
)

const activeMessages = computed(
  () => (activeConversationId.value ? messagesByConversation[activeConversationId.value] || [] : []),
)

// ── Scroll-to-bottom (same pattern as AIChatPanel.vue) ──────────────
const scrollRef = ref(null)
function scrollToBottom() {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
  })
}

// Opening a conversation also clears its unread count — same "viewing it
// marks it read" behavior as NotificationsPanel.vue's markAsRead, kept in
// sync everywhere via the shared reactive conversations array.
function openConversation(id) {
  activeConversationId.value = id
  const conv = conversations.find((c) => c.id === id)
  if (conv) conv.unread = 0
  scrollToBottom()
}

function backToList() {
  activeConversationId.value = null
}

// ── Sending messages (local, Prototype Mode — no backend) ──────────
const inputText = ref('')

function sendMessage() {
  const text = inputText.value.trim()
  if (!text || !activeConversationId.value) return

  const id = activeConversationId.value
  const thread = messagesByConversation[id] || (messagesByConversation[id] = [])

  thread.push({
    id: `msg-${id}-${Date.now()}`,
    senderId: 'me',
    text,
    time: 'Just now',
  })

  // Update the conversation's preview + timestamp, same local-mutation
  // pattern used for tasks in EmployeeTasksView.vue (t.updatedAt = ...).
  const conv = conversations.find((c) => c.id === id)
  if (conv) {
    conv.lastMessage = text
    conv.lastMessageAt = new Date().toISOString()
  }

  inputText.value = ''
  scrollToBottom()
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'U'
}

// ── Stats ─────────────────────────────────────────────────────────
const stats = computed(() => [
  { id: 'total', label: 'Conversations', value: conversations.length, icon: 'messages', tone: 'primary' },
  { id: 'unread', label: 'Unread', value: conversations.reduce((sum, c) => sum + (c.unread || 0), 0), icon: 'bell', tone: 'amber' },
  { id: 'with-unread', label: 'Need a Reply', value: conversations.filter((c) => c.unread > 0).length, icon: 'tasks', tone: 'violet' },
])

// ── Empty state helper ──────────────────────────────────────────────
const noConversations = computed(() => !isLoading.value && conversations.length === 0)
</script>

<template>
  <DashboardLayout :active-id="activeSection" @navigate="handleNavigate">
    <div class="space-y-6 animate-fade-in">

      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Messages</h1>
        <p class="text-sm text-slate-500 mt-1">Conversations with your team, in one place.</p>
      </div>

      <!-- Loading Skeleton -->
      <template v-if="isLoading">
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonBlock v-for="i in 3" :key="i" height="4.5rem" rounded="1.125rem" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          <SkeletonBlock height="28rem" rounded="1.125rem" />
          <SkeletonBlock height="28rem" rounded="1.125rem" class="hidden lg:block" />
        </div>
      </template>

      <template v-else>
        <!-- Message Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
          <StatCard
            v-for="stat in stats"
            :key="stat.id"
            :label="stat.label"
            :value="stat.value"
            :icon="stat.icon"
            :tone="stat.tone"
          />
        </div>

        <!-- Empty: no conversations at all -->
        <div
          v-if="noConversations"
          class="sp-card p-10 flex flex-col items-center text-center animate-slide-up"
        >
          <div class="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p class="text-sm font-bold text-slate-700">No conversations yet</p>
          <p class="text-xs text-slate-400 mt-1">When your team messages you, it'll show up here.</p>
        </div>

        <!-- Two-pane layout: conversation list + active thread -->
        <div
          v-else
          class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 animate-slide-up"
          style="animation-delay: 60ms"
        >
          <!-- Conversation list pane -->
          <!-- On mobile: shown only when no conversation is open. On lg+: always shown. -->
          <div
            class="sp-card p-2 overflow-hidden"
            :class="activeConversationId ? 'hidden lg:block' : 'block'"
          >
            <div class="px-2.5 py-2 mb-1">
              <h3 class="text-sm font-bold text-slate-900">All Conversations</h3>
            </div>
            <ul class="divide-y divide-[#f1f1f7] max-h-[28rem] overflow-y-auto">
              <li v-for="conv in conversations" :key="conv.id">
                <button
                  type="button"
                  class="w-full flex items-start gap-3 px-2.5 py-3 rounded-xl text-left transition-colors hover:bg-slate-50"
                  :class="activeConversationId === conv.id ? 'bg-primary-light/50' : ''"
                  @click="openConversation(conv.id)"
                >
                  <img
                    v-if="conv.avatarUrl"
                    :src="conv.avatarUrl"
                    :alt="conv.participant"
                    class="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <div
                    v-else
                    class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0"
                  >
                    {{ initials(conv.participant) }}
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <p class="text-sm font-semibold text-slate-800 truncate">{{ conv.participant }}</p>
                      <span
                        v-if="conv.unread > 0"
                        class="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center leading-none shrink-0"
                      >
                        {{ conv.unread > 9 ? '9+' : conv.unread }}
                      </span>
                    </div>
                    <p
                      class="text-xs mt-0.5 truncate"
                      :class="conv.unread > 0 ? 'text-slate-700 font-medium' : 'text-slate-400'"
                    >
                      {{ conv.lastMessage }}
                    </p>
                  </div>
                </button>
              </li>
            </ul>
          </div>

          <!-- Active thread pane -->
          <!-- On mobile: shown only when a conversation is open. On lg+: always shown. -->
          <div
            class="sp-card p-0 flex flex-col h-[28rem] overflow-hidden"
            :class="activeConversationId ? 'block' : 'hidden lg:flex'"
          >
            <template v-if="activeConversation">
              <!-- Thread header -->
              <div class="flex items-center gap-2.5 px-5 py-4 border-b border-[#e4e4f0] shrink-0">
                <button
                  type="button"
                  class="sp-btn-ghost p-1.5 -ml-1 lg:hidden"
                  aria-label="Back to conversations"
                  @click="backToList"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div
                  v-if="!activeConversation.avatarUrl"
                  class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0"
                >
                  {{ initials(activeConversation.participant) }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-bold text-slate-900 truncate">{{ activeConversation.participant }}</p>
                </div>
              </div>

              <!-- Messages (scrollable, auto-scrolls to latest) -->
              <div ref="scrollRef" class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                <div
                  v-for="m in activeMessages"
                  :key="m.id"
                  class="flex"
                  :class="m.senderId === 'me' ? 'justify-end' : 'justify-start'"
                >
                  <div
                    v-if="m.senderId !== 'me'"
                    class="flex items-start gap-2.5 max-w-[85%]"
                  >
                    <div class="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
                      {{ initials(activeConversation.participant) }}
                    </div>
                    <div class="p-3 rounded-xl bg-slate-50 border border-[#e4e4f0]">
                      <p class="text-sm text-slate-700 leading-relaxed">{{ m.text }}</p>
                      <p class="text-[10px] text-slate-400 mt-1">{{ m.time }}</p>
                    </div>
                  </div>

                  <div
                    v-else
                    class="max-w-[85%] p-3 rounded-xl bg-primary text-white"
                  >
                    <p class="text-sm leading-relaxed">{{ m.text }}</p>
                    <p class="text-[10px] text-primary-light/80 mt-1">{{ m.time }}</p>
                  </div>
                </div>

                <!-- Empty thread (no messages yet) -->
                <div v-if="activeMessages.length === 0" class="py-10 text-center">
                  <p class="text-sm text-slate-400">No messages yet in this conversation.</p>
                </div>
              </div>

              <!-- Composer -->
              <div class="px-5 py-3 border-t border-[#e4e4f0] shrink-0 bg-white">
                <div class="flex items-center gap-2">
                  <input
                    v-model="inputText"
                    type="text"
                    class="sp-input py-2.5 text-sm"
                    placeholder="Type a message…"
                    aria-label="Message input"
                    @keydown.enter="sendMessage"
                  />
                  <button
                    type="button"
                    class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 hover:bg-primary-dark transition-colors disabled:opacity-40"
                    :disabled="!inputText.trim()"
                    aria-label="Send message"
                    @click="sendMessage"
                  >
                    <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </template>

            <!-- No conversation selected (lg+ only, since mobile hides this pane entirely) -->
            <div v-else class="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div class="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
                <svg class="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p class="text-sm font-bold text-slate-700">Select a conversation</p>
              <p class="text-xs text-slate-400 mt-1">Choose someone from the list to see your messages.</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>