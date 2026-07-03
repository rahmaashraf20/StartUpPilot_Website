// Sprint 5 — Employee Projects page mock data.
// Sprint 6 — extended with detail-only fields (longDescription, milestones,
// activity) for the Project Details page, without duplicating the project
// records used by the Projects list/card.
//
// All data is local-only. No backend, no fetch(), no API calls.
//
// MIGRATION NOTE: shaped like the response of a future `GET /me/projects`
// and `GET /me/projects/:id` endpoint. Components consume this as plain
// props, so swapping the data source later shouldn't require template
// changes — only where it's fetched.

// `status` drives filter chips and badge styling on the Projects page:
// 'active' | 'completed' | 'at-risk'
export const mockProjects = [
  {
    id: 'proj-001',
    name: 'Tech Stack Redesign',
    description: 'Migrating the core platform to a modern, scalable architecture.',
    longDescription: 'This project covers the full migration of StartupPilot\'s core services to a modern, modular architecture. The goal is to reduce technical debt, improve developer velocity, and lay the groundwork for the upcoming AI Workspace features planned later in the roadmap.',
    status: 'active',
    progress: 64,
    completedTasks: 9,
    totalTasks: 14,
    owner: 'Sarah Chen',
    dueDate: 'Nov 8, 2024',
    updatedAt: '2024-10-22T09:00:00Z',
    color: 'bg-primary',
    team: [
      { name: 'Sarah Chen' },
      { name: 'James Park' },
      { name: 'Alex Carter' },
    ],
    milestones: [
      { id: 'ms-1', title: 'Service boundaries defined', done: true },
      { id: 'ms-2', title: 'Core API migrated', done: true },
      { id: 'ms-3', title: 'Frontend integration', done: false },
      { id: 'ms-4', title: 'Legacy system decommissioned', done: false },
    ],
    activity: [
      { id: 'pa-1', actor: 'Sarah Chen', action: 'updated the architecture doc for', target: 'Tech Stack Redesign', time: 'Yesterday' },
      { id: 'pa-2', actor: 'James Park', action: 'completed the migration milestone for', target: 'Core API', time: '2 days ago' },
      { id: 'pa-3', actor: 'AI Assistant', action: 'flagged a risk in', target: 'Tech Stack Redesign', time: '3 days ago', isAi: true },
    ],
  },
  {
    id: 'proj-002',
    name: 'Marketing Campaign',
    description: 'Q4 growth campaign across paid, content, and lifecycle channels.',
    longDescription: 'A coordinated Q4 growth push spanning paid acquisition, content marketing, and lifecycle email. The campaign is currently behind schedule on creative approvals, which is putting pressure on the planned launch date.',
    status: 'at-risk',
    progress: 38,
    completedTasks: 5,
    totalTasks: 13,
    owner: 'Rania El-Said',
    dueDate: 'Oct 30, 2024',
    updatedAt: '2024-10-21T16:20:00Z',
    color: 'bg-violet-500',
    team: [
      { name: 'Rania El-Said' },
      { name: 'Alex Carter' },
    ],
    milestones: [
      { id: 'ms-1', title: 'Campaign strategy approved', done: true },
      { id: 'ms-2', title: 'Creative assets finalized', done: false },
      { id: 'ms-3', title: 'Channels scheduled', done: false },
      { id: 'ms-4', title: 'Campaign launched', done: false },
    ],
    activity: [
      { id: 'pa-1', actor: 'Rania El-Said', action: 'requested feedback on creative for', target: 'Marketing Campaign', time: '5 hours ago' },
      { id: 'pa-2', actor: 'AI Assistant', action: 'warned that the budget may not cover', target: 'paid channels', time: '1 day ago', isAi: true },
      { id: 'pa-3', actor: 'Alex Carter', action: 'uploaded landing page drafts to', target: 'Marketing Campaign', time: '2 days ago' },
    ],
  },
  {
    id: 'proj-003',
    name: 'Product Vision',
    description: 'Long-term roadmap and positioning for the 2025 product line.',
    longDescription: 'Defines the long-term product roadmap and market positioning heading into 2025, including prioritization of the AI Workspace and Manager Dashboard initiatives already on the company roadmap.',
    status: 'active',
    progress: 90,
    completedTasks: 18,
    totalTasks: 20,
    owner: 'James Park',
    dueDate: 'Nov 15, 2024',
    updatedAt: '2024-10-23T11:45:00Z',
    color: 'bg-emerald-500',
    team: [
      { name: 'James Park' },
      { name: 'Sarah Chen' },
    ],
    milestones: [
      { id: 'ms-1', title: 'Market research complete', done: true },
      { id: 'ms-2', title: 'Roadmap drafted', done: true },
      { id: 'ms-3', title: 'Leadership review', done: true },
      { id: 'ms-4', title: 'Final roadmap published', done: false },
    ],
    activity: [
      { id: 'pa-1', actor: 'James Park', action: 'shared the draft roadmap for', target: 'Product Vision', time: '3 hours ago' },
      { id: 'pa-2', actor: 'Sarah Chen', action: 'approved the 2025 priorities for', target: 'Product Vision', time: 'Yesterday' },
    ],
  },
  {
    id: 'proj-004',
    name: 'Investor Relations',
    description: 'Board materials, investor updates, and Q3 reporting package.',
    longDescription: 'Covers preparation of board materials, the quarterly investor update, and the Q3 financial reporting package. All deliverables for this cycle have been completed and sent.',
    status: 'completed',
    progress: 100,
    completedTasks: 12,
    totalTasks: 12,
    owner: 'Sarah Chen',
    dueDate: 'Oct 20, 2024',
    updatedAt: '2024-10-20T08:30:00Z',
    color: 'bg-emerald-500',
    team: [
      { name: 'Sarah Chen' },
      { name: 'Alex Carter' },
    ],
    milestones: [
      { id: 'ms-1', title: 'Q3 financials compiled', done: true },
      { id: 'ms-2', title: 'Board deck finalized', done: true },
      { id: 'ms-3', title: 'Investor update sent', done: true },
    ],
    activity: [
      { id: 'pa-1', actor: 'Sarah Chen', action: 'sent the investor update for', target: 'Investor Relations', time: '4 days ago' },
      { id: 'pa-2', actor: 'Alex Carter', action: 'finalized the board deck for', target: 'Investor Relations', time: '5 days ago' },
    ],
  },
  {
    id: 'proj-005',
    name: 'Infrastructure',
    description: 'Reliability, observability, and cost optimization across services.',
    longDescription: 'Focused on improving platform reliability and observability while reducing infrastructure spend. This work directly supports the Tech Stack Redesign migration.',
    status: 'active',
    progress: 52,
    completedTasks: 11,
    totalTasks: 21,
    owner: 'James Park',
    dueDate: 'Nov 12, 2024',
    updatedAt: '2024-10-22T13:10:00Z',
    color: 'bg-primary',
    team: [
      { name: 'James Park' },
      { name: 'Alex Carter' },
    ],
    milestones: [
      { id: 'ms-1', title: 'Monitoring stack deployed', done: true },
      { id: 'ms-2', title: 'Cost audit complete', done: true },
      { id: 'ms-3', title: 'Auto-scaling rolled out', done: false },
      { id: 'ms-4', title: 'Incident response runbooks updated', done: false },
    ],
    activity: [
      { id: 'pa-1', actor: 'James Park', action: 'deployed the new monitoring stack for', target: 'Infrastructure', time: '1 day ago' },
      { id: 'pa-2', actor: 'AI Assistant', action: 'flagged a cost spike in', target: 'Infrastructure', time: '2 days ago', isAi: true },
    ],
  },
  {
    id: 'proj-006',
    name: 'Compliance',
    description: 'Security audit follow-up and policy documentation refresh.',
    longDescription: 'Addresses outstanding findings from the latest security audit and refreshes internal policy documentation. Progress has stalled due to limited team availability.',
    status: 'at-risk',
    progress: 20,
    completedTasks: 2,
    totalTasks: 10,
    owner: 'Rania El-Said',
    dueDate: 'Nov 1, 2024',
    updatedAt: '2024-10-19T15:00:00Z',
    color: 'bg-violet-500',
    team: [
      { name: 'Rania El-Said' },
    ],
    milestones: [
      { id: 'ms-1', title: 'Audit findings triaged', done: true },
      { id: 'ms-2', title: 'Remediation plan approved', done: false },
      { id: 'ms-3', title: 'Policy docs updated', done: false },
    ],
    activity: [
      { id: 'pa-1', actor: 'Rania El-Said', action: 'triaged audit findings for', target: 'Compliance', time: '6 days ago' },
      { id: 'pa-2', actor: 'AI Assistant', action: 'warned this project is at risk of missing its deadline:', target: 'Compliance', time: '1 day ago', isAi: true },
    ],
  },
]