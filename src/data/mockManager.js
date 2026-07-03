// Mock data for Manager-role views.

export const mockManagerUser = {
  id: 'mgr_001',
  fullName: 'John Doe',
  email: 'john.doe@venture.scale',
  role: 'manager',
  roleLabel: 'Founder Mode',
  avatarUrl: null,
  workspace: 'Acme AI Corp',
}

export const managerNotificationsCount = 5

export const managerSidebarSections = [
  {
    title: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'projects', label: 'Projects', icon: 'projects' },
      { id: 'tasks', label: 'Tasks', icon: 'tasks' },
      { id: 'teams', label: 'Teams', icon: 'teams' },
      { id: 'financials', label: 'Financials', icon: 'financials' },
      { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

// Dashboard stats
export const mockManagerStats = [
  { label: 'Startup Progress', value: '88', unit: '', delta: '↑ 4%', positive: true, sub: 'vs last month', accent: true },
  { label: 'Monthly Burn', value: '$25k', unit: '/mo', delta: '6 months runway', positive: true, sub: 'remaining' },
  { label: 'Milestone Tasks', value: '12 / 45', unit: '', delta: '7 tasks', positive: true, sub: 'due this week' },
  { label: 'Roadmap Completion', value: '35%', unit: '', delta: '↑ 5%', positive: true, sub: 'vs last sprint' },
]

export const mockRevenueChart = [30, 42, 38, 55, 50, 64, 72, 80, 70, 85, 78, 91]

export const mockActiveTasks = [
  { id: 't1', title: 'Finalize Pitch Deck v2', priority: 'HIGH', due: 'Due today', sub: 'AI suggested', done: false },
  { id: 't2', title: 'Investor Outreach List', priority: 'MED', due: 'Due tomorrow', sub: '12 contacts', done: false },
  { id: 't3', title: 'Product Demo Wireframes', priority: 'MED', due: 'Due in 3 days', sub: '', done: false },
]

export const mockAiAdvisory = {
  headline: 'AI Advisory: Market Shift Detected',
  body: "Based on recent Series A trends in the SaaS sector, we recommend adjusting your 'Efficiency Metrics' slide. Competitive benchmarks have shifted toward 3x LTV/CAC. Would you like StartupPilot to re-calculate your forecast?",
}

// Team Management
export const mockTeamStats = [
  { label: 'Total Members', value: '28', delta: '+4 this month', icon: 'members' },
  { label: 'Avg. Productivity', value: '92.4%', delta: null, icon: 'productivity' },
  { label: 'Active Tasks', value: '142', delta: null, icon: 'tasks' },
  { label: 'Member Growth', value: '16.5%', delta: 'Vs last quarter', icon: 'growth' },
]

export const mockTeamMembers = [
  {
    id: 'm1',
    name: 'John Doe',
    title: 'Lead Designer',
    email: 'john.doe@venture.scale',
    role: 'Manager',
    productivity: 94,
    activeTasks: 12,
    avatarUrl: null,
  },
  {
    id: 'm2',
    name: 'Sarah Wang',
    title: 'Senior Engineer',
    email: 'sarah.w@venture.scale',
    role: 'Team Lead',
    productivity: 88,
    activeTasks: 8,
    avatarUrl: null,
  },
  {
    id: 'm3',
    name: 'Marcus Knight',
    title: 'Product Growth',
    email: 'marcus.k@venture.scale',
    role: 'Employee',
    productivity: 91,
    activeTasks: 15,
    avatarUrl: null,
  },
]

export const mockPendingInvites = [
  { id: 'i1', email: 'claire.v@venturescale.com', role: 'Designer', sentAgo: '2 days ago' },
  { id: 'i2', email: 'dev.ops@external.team', role: 'Engineer', sentAgo: '1 week ago' },
]

// Calendar
export const mockCalendarEvents = [
  { id: 'e1', title: 'Seed Stage Check-in', day: 1, time: '10:00 AM', type: 'meeting', col: 2 },
  { id: 'e2', title: 'Refine Pitch Deck', day: 3, time: null, type: 'deadline', col: 3 },
  { id: 'e3', title: 'Phase 2: Branding Complete', day: 4, time: null, type: 'milestone', col: 4 },
  { id: 'e4', title: 'Series A Pitch', day: 5, time: null, type: 'conflict', col: 5 },
  { id: 'e5', title: 'StartupPilot v2.0', day: 1, time: null, type: 'launch', col: 2 },
  { id: 'e6', title: 'Dev Sync (Rescheduled)', day: 2, time: '2:00 PM', type: 'meeting', col: 3 },
  { id: 'e7', title: 'Board Meeting Prep', day: 4, time: null, type: 'meeting', col: 4 },
]

export const mockTodayTimeline = [
  { time: '09:00 AM', title: 'Deep Work: Strategy Draft', tag: 'Focus Mode', color: 'violet' },
  { time: '11:00 AM', title: 'Series A Pitch (Live)', sub: 'Venture Hub Conference Room B', tag: 'Video', color: 'red' },
  { time: '02:00 PM', title: 'Dev Sync (Rescheduled)', tag: 'Team', color: 'slate' },
]

export const mockAiSchedulingInsight = {
  conflict: '"Series A Pitch" overlaps with "Dev Sync"',
  recommendation: 'Move "Dev Sync" to 2:00 PM for better flow.',
}
