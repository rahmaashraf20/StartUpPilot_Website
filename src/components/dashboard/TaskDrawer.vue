<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  task: { type: Object, default: null },
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'complete', 'reopen', 'update-status', 'add-comment', 'upload-attachment', 'remove-attachment'])

// Local checklist state (no backend)
const localChecklist = ref([])
const commentText = ref('')

// Local status state (no backend)
const localStatus = ref('todo')
const statusMenuOpen = ref(false)

const STATUS_OPTIONS = [
  { key: 'todo', label: 'Todo' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Completed' },
]

watch(
  () => props.task,
  (t) => {
    if (t) {
      localChecklist.value = t.checklist.map((c) => ({ ...c }))
      localStatus.value = t.status
    }
    statusMenuOpen.value = false
  },
  { immediate: true },
)

const checklistDone = computed(() => localChecklist.value.filter((c) => c.done).length)

const PRIORITY_STYLE = {
  High: 'bg-red-50 text-red-500 border border-red-200',
  Medium: 'bg-amber-50 text-amber-500 border border-amber-200',
  Low: 'bg-slate-100 text-slate-500 border border-slate-200',
}

const STATUS_STYLE = {
  'todo': 'bg-slate-100 text-slate-500',
  'in-progress': 'bg-primary-light text-primary',
  'review': 'bg-violet-50 text-violet-600',
  'done': 'bg-emerald-50 text-emerald-600',
}
const STATUS_LABEL = { 'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done' }

const ACTIVITY_ICON = {
  status: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  assign: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  comment: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
}

const FILE_ICON_DOCUMENT = 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
const FILE_ICON_IMAGE = 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 10h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'

const FILE_TYPE_CONFIG = {
  pdf: { icon: FILE_ICON_DOCUMENT, bg: 'bg-red-50', text: 'text-red-500' },
  docx: { icon: FILE_ICON_DOCUMENT, bg: 'bg-primary-light', text: 'text-primary' },
  doc: { icon: FILE_ICON_DOCUMENT, bg: 'bg-primary-light', text: 'text-primary' },
  png: { icon: FILE_ICON_IMAGE, bg: 'bg-violet-50', text: 'text-violet-500' },
  jpg: { icon: FILE_ICON_IMAGE, bg: 'bg-violet-50', text: 'text-violet-500' },
  jpeg: { icon: FILE_ICON_IMAGE, bg: 'bg-violet-50', text: 'text-violet-500' },
  default: { icon: FILE_ICON_DOCUMENT, bg: 'bg-slate-100', text: 'text-slate-500' },
}

function fileTypeConfig(type) {
  return FILE_TYPE_CONFIG[type] || FILE_TYPE_CONFIG.default
}

function formatAttachmentDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function toggleCheckItem(id) {
  const item = localChecklist.value.find((c) => c.id === id)
  if (item) item.done = !item.done
}

function toggleStatusMenu() {
  statusMenuOpen.value = !statusMenuOpen.value
}

function setStatus(key) {
  localStatus.value = key
  statusMenuOpen.value = false
  emit('update-status', { id: props.task.id, status: key })
}

function addComment() {
  const text = commentText.value.trim()
  if (!text) return
  emit('add-comment', { id: props.task.id, text })
  commentText.value = ''
}

function handleUploadClick() {
  emit('upload-attachment', { id: props.task.id })
}

function handleRemoveAttachment(attachmentId) {
  emit('remove-attachment', { id: props.task.id, attachmentId })
}
</script>

<template>
  <!-- Overlay -->
  <Transition name="fade-overlay">
    <div
      v-if="open"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40"
      @click="emit('close')"
    />
  </Transition>

  <!-- Drawer -->
  <Transition name="slide-drawer">
    <aside
      v-if="open && task"
      class="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-white flex flex-col shadow-elevated"
      role="dialog"
      aria-modal="true"
      :aria-label="`Task details: ${task.title}`"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[#e4e4f0] shrink-0">
        <h2 class="font-bold text-slate-900">Task Details</h2>
        <button
          type="button"
          class="sp-btn-ghost p-1.5 rounded-lg"
          aria-label="Close task details"
          @click="emit('close')"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body (scrollable) -->
      <div class="flex-1 overflow-y-auto">
        <div class="px-6 py-5 space-y-6">

          <!-- Priority + ID -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="sp-badge text-xs font-bold" :class="PRIORITY_STYLE[task.priority]">
              {{ task.priority.toUpperCase() }}
            </span>
            <span class="text-sm text-slate-400 font-mono">#SP-{{ task.id.split('-')[1] || '000' }}</span>
          </div>

          <!-- Title -->
          <h3 class="text-2xl font-black text-slate-900 leading-tight tracking-tight -mt-2">
            {{ task.title }}
          </h3>

          <!-- Meta card: due date + assigned by -->
          <div class="grid grid-cols-2 gap-4 p-4 rounded-xl border border-[#e4e4f0] bg-slate-50/60">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Due Date</p>
              <div class="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ task.dueDate }}
              </div>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Assigned By</p>
              <div class="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <div class="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <span class="text-[8px] font-black text-primary">{{ task.assignedBy[0] }}</span>
                </div>
                {{ task.assignedBy }}
              </div>
            </div>
          </div>

          <!-- Status + Project + Est. time -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="sp-badge text-xs" :class="STATUS_STYLE[localStatus]">
              {{ STATUS_LABEL[localStatus] }}
            </span>
            <span class="sp-badge bg-slate-100 text-slate-500 text-xs">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {{ task.project }}
            </span>
            <span class="sp-badge bg-slate-100 text-slate-500 text-xs">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ task.estimatedTime }} est.
            </span>
          </div>

          <!-- Description -->
          <div>
            <h4 class="text-sm font-bold text-slate-900 mb-2">Description</h4>
            <p class="text-sm text-slate-600 leading-relaxed">{{ task.description }}</p>
          </div>

          <!-- Progress bar -->
          <div v-if="task.progress > 0">
            <div class="flex items-center justify-between mb-1.5">
              <h4 class="text-sm font-bold text-slate-900">Progress</h4>
              <span class="text-xs font-bold text-primary">{{ task.progress }}%</span>
            </div>
            <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full bg-primary transition-all duration-500"
                :style="{ width: task.progress + '%' }"
              />
            </div>
          </div>

          <!-- Checklist -->
          <div v-if="localChecklist.length">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-bold text-slate-900">Checklist</h4>
              <span class="text-xs text-slate-400 font-semibold">{{ checklistDone }}/{{ localChecklist.length }}</span>
            </div>
            <div class="space-y-2">
              <button
                v-for="item in localChecklist"
                :key="item.id"
                type="button"
                class="flex items-center gap-3 w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                @click="toggleCheckItem(item.id)"
              >
                <div
                  class="w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                  :class="item.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-primary'"
                  style="width:18px;height:18px;"
                >
                  <svg v-if="item.done" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="text-sm flex-1" :class="item.done ? 'line-through text-slate-400' : 'text-slate-700'">{{ item.text }}</span>
              </button>
            </div>
          </div>

          <!-- Attachments -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-bold text-slate-900">Attachments</h4>
              <button type="button" class="text-xs text-primary font-semibold flex items-center gap-1 hover:underline" @click="handleUploadClick">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload File
              </button>
            </div>
            <div v-if="task.attachments.length" class="space-y-2">
              <div
                v-for="att in task.attachments"
                :key="att.id"
                class="flex items-center gap-3 p-3 rounded-xl border border-[#e4e4f0] bg-slate-50/60 hover:bg-slate-50 transition-colors group"
              >
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="fileTypeConfig(att.type).bg">
                  <svg class="w-4 h-4" :class="fileTypeConfig(att.type).text" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="fileTypeConfig(att.type).icon" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-800 truncate">{{ att.fileName }}</p>
                  <p class="text-xs text-slate-400">{{ att.fileSize }} · {{ att.uploadedBy }} · {{ formatAttachmentDate(att.uploadedAt) }}</p>
                </div>
                <button
                  type="button"
                  class="sp-btn-ghost p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  :aria-label="`Remove ${att.fileName}`"
                  @click="handleRemoveAttachment(att.id)"
                >
                  <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p v-else class="text-sm text-slate-400">No attachments yet. Upload a file to get started.</p>
          </div>

          <!-- Comments -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-bold text-slate-900">Comments</h4>
              <span class="text-xs text-slate-400 font-semibold">{{ task.comments.length }}</span>
            </div>
            <div v-if="task.comments.length" class="space-y-2">
              <div
                v-for="cm in task.comments"
                :key="cm.id"
                class="flex items-start gap-3"
              >
                <div class="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center shrink-0 mt-0.5">
                  <span class="text-[10px] font-black text-primary">{{ cm.author[0] }}</span>
                </div>
                <div class="flex-1">
                  <div class="p-3 rounded-xl bg-slate-50/60 border border-[#e4e4f0]">
                    <p class="text-sm text-slate-700 leading-relaxed">{{ cm.text }}</p>
                    <p class="text-xs text-slate-400 mt-1">{{ cm.author }} · {{ cm.time }}</p>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-slate-400">No comments yet. Be the first to add one.</p>
          </div>

          <!-- Activity History -->
          <div>
            <h4 class="text-sm font-bold text-slate-900 mb-3">Activity History</h4>
            <div class="space-y-3">
              <div
                v-for="item in task.activity"
                :key="item.id"
                class="flex items-start gap-3"
              >
                <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="ACTIVITY_ICON[item.type] || ACTIVITY_ICON.status" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-slate-700">
                    <span class="font-semibold">{{ item.actor }}</span>
                    {{ ' ' + item.detail }}
                  </p>
                  <p class="text-xs text-slate-400 mt-0.5">{{ item.time }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Spacer for fixed footer -->
          <div class="h-4"></div>
        </div>
      </div>

      <!-- Comment input -->
      <div class="px-6 py-3 border-t border-[#e4e4f0] shrink-0 bg-white">
        <div class="flex items-center gap-2">
          <input
            v-model="commentText"
            type="text"
            class="sp-input py-2.5 text-sm"
            placeholder="Add a comment..."
            @keydown.enter="addComment"
          />
          <button
            type="button"
            class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 hover:bg-primary-dark transition-colors disabled:opacity-40"
            :disabled="!commentText.trim()"
            aria-label="Send comment"
            @click="addComment"
          >
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="grid grid-cols-2 gap-3 px-6 py-4 border-t border-[#e4e4f0] shrink-0 bg-white">
        <div class="relative">
          <button
            type="button"
            class="sp-btn-outline justify-center py-2.5 text-sm w-full"
            @click="task.done ? emit('reopen', task.id) : toggleStatusMenu()"
          >
            {{ task.done ? 'Reopen Task' : 'Update Status' }}
          </button>

          <Transition name="fade-overlay">
            <div
              v-if="statusMenuOpen && !task.done"
              class="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-[#e4e4f0] bg-white shadow-elevated overflow-hidden z-10"
            >
              <button
                v-for="opt in STATUS_OPTIONS"
                :key="opt.key"
                type="button"
                class="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between"
                :class="localStatus === opt.key ? 'font-bold text-primary' : 'text-slate-700'"
                @click="setStatus(opt.key)"
              >
                {{ opt.label }}
                <svg v-if="localStatus === opt.key" class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </Transition>
        </div>
        <button
          type="button"
          class="sp-btn-primary justify-center py-2.5 text-sm"
          :class="task.done ? 'opacity-50 cursor-not-allowed' : ''"
          :disabled="task.done"
          @click="emit('complete', task.id)"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Mark Complete
        </button>
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
.slide-drawer-leave-active { transition: transform 0.28s cubic-bezier(0.32, 0, 0.67, 0); }
.slide-drawer-enter-from,
.slide-drawer-leave-to { transform: translateX(100%); }
</style>