// Temporary mock data for the Employee Dashboard.
// There is no backend yet — every dashboard component should read its
// data from here (or from the auth store) instead of hardcoding values.
//
// MIGRATION NOTE:
// When a real API exists, replace `mockEmployeeUser` with a call such as
// `employeeService.getProfile()` and `mockNotificationsCount` with a real
// notifications endpoint. Components already consume these as plain
// values/props, so no component code should need to change shape —
// only where the value comes from.

export const mockEmployeeUser = {
  id: 'emp_001',
  fullName: 'Alex Carter',
  email: 'alex.carter@startuppilot.io',
  role: 'employee',
  roleLabel: 'Employee',
  avatarUrl: null, // null -> UI falls back to initials avatar
  workspace: 'StartupPilot Core',
}

// Unread notifications badge shown on the Topbar bell icon (UI only for now).
export const mockNotificationsCount = 3

// Sidebar navigation. `id` is used for active-state matching since most
// of these sections don't have real routes yet this sprint.
export const sidebarNavSections = [
  {
    title: 'Workspace',
    items: [
      { id: 'home', label: 'Home', icon: 'projects', to: '/dashboard/employee' },
      { id: 'tasks', label: 'My Tasks', icon: 'tasks', to: '/dashboard/employee/tasks' },
      { id: 'projects', label: 'My Projects', icon: 'files', to: '/dashboard/employee/projects' },
      { id: 'calendar', label: 'Calendar', icon: 'calendar', to: '/dashboard/employee/calendar' },
      { id: 'messages', label: 'Messages', icon: 'messages', to: '/dashboard/employee/messages' },
      { id: 'ai-assistant', label: 'AI Assistant', icon: 'ai', to: '/dashboard/employee/ai-workspace' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Profile', icon: 'profile', to: '/dashboard/employee/profile' },
      { id: 'settings', label: 'Settings', icon: 'settings', to: '/dashboard/employee/settings' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Sprint 2 — Employee Dashboard Home
// ---------------------------------------------------------------------------
// Everything below is scoped to what an individual employee should see:
// their own tasks, their own projects' progress, and team-level activity
// they're a participant in. No budget, revenue, or company-wide analytics.
//
// MIGRATION NOTE: each export here is shaped like the response of a future
// endpoint (e.g. `GET /me/dashboard-summary`, `GET /me/tasks?due=today`).
// Components consume these as plain props, so swapping the data source
// later shouldn't require template changes — only where these are fetched.

// Quick Stats — first row of small tiles.
export const mockQuickStats = [
  { id: 'today-tasks', label: "Today's Tasks", value: 3, icon: 'tasks', tone: 'primary' },
  { id: 'deadlines', label: 'Upcoming Deadlines', value: 2, icon: 'calendar', tone: 'amber' },
  { id: 'comments', label: 'New Comments', value: 5, icon: 'messages', tone: 'violet' },
  { id: 'notifications', label: 'Notifications', value: 12, icon: 'bell', tone: 'primary' },
]

// Today's Tasks — interactive list. `done` is local UI state the task
// card toggles; a real API would PATCH this back on change.
export const mockTodaysTasks = [
  {
    id: 'task-1',
    title: 'Finalize API Documentation',
    project: 'Tech Stack Redesign',
    priority: 'High',
    dueTime: '5:00 PM',
    status: 'in-progress',
    done: false,
  },
  {
    id: 'task-2',
    title: 'Team Sync Meeting Prep',
    project: 'Marketing Campaign',
    priority: 'Medium',
    dueTime: '2:30 PM',
    status: 'todo',
    done: false,
  },
  {
    id: 'task-3',
    title: 'Review Q4 Roadmap',
    project: 'Product Vision',
    priority: 'Low',
    dueTime: 'Tomorrow',
    status: 'todo',
    done: false,
  },
]

// AI Recommendation — premium "what should I do next" panel.
export const mockAiRecommendation = {
  headline: 'Complete your highest priority task',
  body: 'Finish the highest-priority pending task to increase overall project progress and unblock dependent work.',
  focusTaskId: '',
  confidence: 88,
  tag: 'Priority Insight',
}

// Project Progress — only projects this employee is assigned to.
export const mockProjectProgress = [
  { id: 'proj-1', name: 'Tech Stack Redesign', pct: 64, tasksDone: 9, tasksTotal: 14, color: 'bg-primary' },
  { id: 'proj-2', name: 'Marketing Campaign', pct: 38, tasksDone: 5, tasksTotal: 13, color: 'bg-violet-500' },
  { id: 'proj-3', name: 'Product Vision', pct: 90, tasksDone: 18, tasksTotal: 20, color: 'bg-emerald-500' },
]

// Upcoming Deadlines — compact list, intentionally not a full calendar.
// `urgency` drives the visual treatment: 'overdue' (red), 'soon' (amber,
// due within the next few days), or 'normal' (default primary tone).
export const mockUpcomingDeadlines = [
  { id: 'dl-1', title: 'Landing Page Review', date: 'Oct 25', project: 'Marketing', urgency: 'overdue' },
  { id: 'dl-2', title: 'Sprint 12 Completion', date: 'Oct 27', project: 'Dev Team', urgency: 'soon' },
  { id: 'dl-3', title: 'Investor Deck Draft', date: 'Oct 30', project: 'Strategy', urgency: 'normal' },
]

// Recent Activity — feed of events relevant to this employee (their
// projects/tasks), not company-wide admin activity.
export const mockRecentActivity = [
  {
    id: 'act-1',
    actor: 'Sarah Miller',
    action: 'uploaded 4 new files to',
    target: 'Q4 Campaign',
    time: '2 hours ago',
    avatarUrl: null,
  },
  {
    id: 'act-2',
    actor: 'AI Assistant',
    action: 'generated a weekly summary for',
    target: 'Sprint 11',
    time: '5 hours ago',
    avatarUrl: null,
    isAi: true,
  },
  {
    id: 'act-3',
    actor: 'David Miller',
    action: 'marked Q4 Roadmap as complete',
    target: '',
    time: 'Yesterday',
    avatarUrl: null,
  },
]