// Sprint 8 — Notifications mock data.
// Local-only notification list. No backend, no fetch(), no API calls.
//
// MIGRATION NOTE: shaped like the response of a future `GET /me/notifications`
// endpoint. Components consume this as a plain array, so swapping the data
// source later shouldn't require template changes — only where it's fetched.
//
// `type` drives the icon/visual treatment in NotificationsPanel:
// 'task' | 'project' | 'ai' | 'system'
// `to` is an optional route the notification can navigate to when clicked.
//
// Wrapped in `reactive()` so this module acts as a single shared store:
// any component that mutates an entry's `read` flag (e.g. NotificationsPanel)
// is automatically reflected everywhere else this array is read (e.g. the
// unread badge count in DashboardLayout) — no Pinia, no backend, just one
// shared reactive source of truth.
import { reactive } from 'vue'

export const mockNotifications = reactive([
  {
    id: 'notif-1',
    title: 'Task due soon',
    message: '"Finalize API Documentation" is due today at 5:00 PM.',
    type: 'task',
    time: '15 minutes ago',
    read: false,
    to: '/dashboard/employee/tasks',
  },
  {
    id: 'notif-2',
    title: 'Project at risk',
    message: 'Marketing Campaign is falling behind schedule. Review the latest insight.',
    type: 'ai',
    time: '2 hours ago',
    read: false,
    to: '/dashboard/employee/ai-workspace',
  },
  {
    id: 'notif-3',
    title: 'Comment added',
    message: 'Sarah Chen commented on Tech Stack Redesign.',
    type: 'project',
    time: '4 hours ago',
    read: false,
    to: '/dashboard/employee/projects/proj-001',
  },
  {
    id: 'notif-4',
    title: 'Task moved to Review',
    message: '"Design Landing Page" is now in Review and waiting on feedback.',
    type: 'task',
    time: 'Yesterday',
    read: true,
    to: '/dashboard/employee/tasks',
  },
  {
    id: 'notif-5',
    title: 'Milestone completed',
    message: 'Investor Relations reached 100% completion.',
    type: 'project',
    time: 'Yesterday',
    read: true,
    to: '/dashboard/employee/projects/proj-004',
  },
  {
    id: 'notif-6',
    title: 'Welcome to StartupPilot',
    message: 'Your workspace is set up. Explore your dashboard to get started.',
    type: 'system',
    time: '3 days ago',
    read: true,
  },
])