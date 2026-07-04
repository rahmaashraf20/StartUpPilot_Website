export function extractWorkspaceProject(response) {
  const project = response?.project || response || null
  const projectId = response?.projectId || project?._id || project?.id || ''

  return { project, projectId }
}

export function normalizeStatus(status) {
  const value = String(status || 'todo').toLowerCase()
  if (['done', 'completed', 'complete'].includes(value)) return 'done'
  if (['in-progress', 'in_progress', 'progress', 'doing'].includes(value)) return 'in-progress'
  if (['review', 'in-review', 'in_review'].includes(value)) return 'review'
  return 'todo'
}

export function normalizePriority(priority) {
  const value = String(priority || 'low').toLowerCase()
  if (value === 'high') return 'High'
  if (value === 'medium' || value === 'med') return 'Medium'
  return 'Low'
}

export function progressForStatus(status) {
  if (status === 'done') return 100
  if (status === 'review') return 75
  if (status === 'in-progress') return 45
  return 0
}

export function formatTaskDate(value, fallback = 'No due date') {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatShortDate(value, fallback = 'No date') {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatTaskTime(value, fallback = 'Any time') {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function mapApiTask(task, project) {
  const status = normalizeStatus(task.status)
  const managerName = project?.managerId?.name || 'Manager'
  const projectName = project?.basicInfo?.name || 'Workspace Project'
  const dueValue = task.dueDate || task.deadline || null

  return {
    id: task._id || task.id,
    title: task.title || 'Untitled task',
    description: task.description || 'No description provided.',
    status,
    priority: normalizePriority(task.priority),
    project: projectName,
    dueDate: formatTaskDate(dueValue || task.createdAt),
    dueTime: formatTaskTime(dueValue),
    dueTimestamp: dueValue,
    estimatedTime: task.estimatedTime || task.duration || 'No estimate',
    assignedBy: task.assignedBy?.name || task.manager?.name || managerName,
    progress: Number.isFinite(task.progress) ? task.progress : progressForStatus(status),
    done: status === 'done',
    updatedAt: task.updatedAt || task.createdAt || new Date().toISOString(),
    checklist: task.checklist || [],
    comments: task.comments || [],
    attachments: task.attachments || [],
    activity: task.activity || [],
  }
}

export function compareByDueDate(a, b) {
  const aTime = a.dueTimestamp ? new Date(a.dueTimestamp).getTime() : Number.MAX_SAFE_INTEGER
  const bTime = b.dueTimestamp ? new Date(b.dueTimestamp).getTime() : Number.MAX_SAFE_INTEGER
  return aTime - bTime
}

export function calculateProgress(tasks) {
  if (!tasks.length) return 0
  const completed = tasks.filter((task) => task.done || task.status === 'done').length
  return Math.round((completed / tasks.length) * 100)
}
