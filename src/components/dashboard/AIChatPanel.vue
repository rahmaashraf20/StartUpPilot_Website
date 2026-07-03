<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { getAiReply } from '../../data/mockAiWorkspace'

const messages = ref([
  {
    id: 'm-welcome',
    role: 'ai',
    text: "Hi! I'm your AI workspace assistant. Ask me about your tasks, projects, deadlines, or progress.",
  },
])

const inputText = ref('')
const isTyping = ref(false)
const scrollRef = ref(null)

function scrollToBottom() {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
  })
}

function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return

  messages.value.push({ id: `m-${Date.now()}-u`, role: 'user', text })
  inputText.value = ''
  scrollToBottom()

  isTyping.value = true
  setTimeout(() => {
    const reply = getAiReply(text)
    messages.value.push({ id: `m-${Date.now()}-ai`, role: 'ai', text: reply })
    isTyping.value = false
    scrollToBottom()
  }, 450)
}

onMounted(scrollToBottom)
</script>

<template>
  <div class="sp-card p-0 flex flex-col h-[28rem] overflow-hidden">
    <!-- Header -->
    <div class="flex items-center gap-2.5 px-5 py-4 border-b border-[#e4e4f0] shrink-0">
      <span class="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
        <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </span>
      <div>
        <p class="text-sm font-bold text-slate-900">AI Assistant</p>
        <p class="text-xs text-slate-400">Local prototype — keyword-based replies</p>
      </div>
    </div>

    <!-- Messages (scrollable, auto-scrolls to latest) -->
    <div ref="scrollRef" class="flex-1 overflow-y-auto px-5 py-4 space-y-3">
      <div
        v-for="m in messages"
        :key="m.id"
        class="flex"
        :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          v-if="m.role === 'ai'"
          class="flex items-start gap-2.5 max-w-[85%]"
        >
          <div class="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 border border-[#e4e4f0]">
            <p class="text-sm text-slate-700 leading-relaxed">{{ m.text }}</p>
          </div>
        </div>

        <div
          v-else
          class="max-w-[85%] p-3 rounded-xl bg-primary text-white"
        >
          <p class="text-sm leading-relaxed">{{ m.text }}</p>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="isTyping" class="flex items-start gap-2.5">
        <div class="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center shrink-0">
          <svg class="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 border border-[#e4e4f0] flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 120ms"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 240ms"></span>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="px-5 py-3 border-t border-[#e4e4f0] shrink-0 bg-white">
      <div class="flex items-center gap-2">
        <input
          v-model="inputText"
          type="text"
          class="sp-input py-2.5 text-sm"
          placeholder="Ask about your tasks, projects, deadlines…"
          aria-label="Message the AI assistant"
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
  </div>
</template>