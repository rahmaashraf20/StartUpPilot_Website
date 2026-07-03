// Sprint 3 — Employee Task Management mock data.
// All data is local-only. No backend, no fetch(), no API calls.

export const mockTasksAiRecommendation = {
  tag: 'Priority Insight',
  headline: 'Finish Design System before Dashboard UI to unblock 3 tasks.',
  body: 'Completing the Design System task first will unblock the Dashboard UI, Analytics Charts, and Component Library tasks — saving an estimated 4 hours of blocked work this week.',
  confidence: 88,
  focusTaskId: 'task-003',
  suggestedAction: 'Start Design System',
}

export const mockTasks = [
  {
    id: 'task-001',
    title: 'Optimize Latency for LLM',
    description:
      'Reduce the inference response time for the main GPT-4 portal. Current latency is ~2.4s. Goal is to reach sub-1.5s through prompt caching and response streaming optimizations. Focus on the middleware layer and token buffering.',
    priority: 'High',
    status: 'in-progress',
    project: 'StartupPilot AI',
    dueDate: 'Oct 24, 2024',
    estimatedTime: '3h',
    assignedBy: 'Sarah Chen',
    progress: 65,
    done: false,
    updatedAt: '2024-10-22T10:00:00Z',
    checklist: [
      { id: 'cl-1', text: 'Analyze current bottlenecks', done: true },
      { id: 'cl-2', text: 'Implement prompt caching', done: true },
      { id: 'cl-3', text: 'Enable response streaming', done: false },
      { id: 'cl-4', text: 'Benchmark and validate < 1.5s', done: false },
    ],
    attachments: [
      { id: 'att-1', fileName: 'performance_audit.pdf', fileSize: '1.2 MB', uploadedBy: 'Sarah Chen', uploadedAt: '2024-10-20T15:40:00Z', type: 'pdf' },
    ],
    comments: [
      { id: 'cm-1', author: 'Sarah Chen', text: 'Make sure to test the streaming response on slow 3G connections too.', time: '2 hours ago' },
    ],
    activity: [
      { id: 'ac-1', type: 'status', actor: 'Sarah Chen', detail: 'changed status to In Progress', time: '2 hours ago' },
      { id: 'ac-2', type: 'assign', actor: 'Sarah Chen', detail: 'assigned this task to you', time: 'Yesterday' },
    ],
  },
  {
    id: 'task-002',
    title: 'Founders Feedback Loop',
    description:
      'Set up a structured feedback loop with early founders using the platform. Create a survey template, schedule interviews, and compile findings into a product insights doc.',
    priority: 'High',
    status: 'in-progress',
    project: 'Product Discovery',
    dueDate: 'Oct 26, 2024',
    estimatedTime: '5h',
    assignedBy: 'James Park',
    progress: 40,
    done: false,
    updatedAt: '2024-10-21T14:30:00Z',
    checklist: [
      { id: 'cl-1', text: 'Draft survey template', done: true },
      { id: 'cl-2', text: 'Schedule 5 founder interviews', done: false },
      { id: 'cl-3', text: 'Compile findings document', done: false },
    ],
    attachments: [
      { id: 'att-1', fileName: 'founder_survey_template.docx', fileSize: '128 KB', uploadedBy: 'James Park', uploadedAt: '2024-10-20T11:15:00Z', type: 'docx' },
    ],
    comments: [
      { id: 'cm-1', author: 'James Park', text: 'Prioritize founders from YC cohort first.', time: 'Yesterday' },
    ],
    activity: [
      { id: 'ac-1', type: 'status', actor: 'James Park', detail: 'assigned this task', time: '2 days ago' },
    ],
  },
  {
    id: 'task-003',
    title: 'Update Design System',
    description:
      'Audit and update the existing design system tokens. Focus on color palette consistency, spacing scale, and component documentation in Figma.',
    priority: 'Medium',
    status: 'todo',
    project: 'Infrastructure',
    dueDate: 'Oct 28, 2024',
    estimatedTime: '4h',
    assignedBy: 'Rania El-Said',
    progress: 0,
    done: false,
    updatedAt: '2024-10-20T09:00:00Z',
    checklist: [
      { id: 'cl-1', text: 'Audit current tokens', done: false },
      { id: 'cl-2', text: 'Update color palette', done: false },
      { id: 'cl-3', text: 'Update spacing scale', done: false },
      { id: 'cl-4', text: 'Document components in Figma', done: false },
    ],
    attachments: [
      { id: 'att-1', fileName: 'design-audit-notes.pdf', fileSize: '840 KB', uploadedBy: 'Rania El-Said', uploadedAt: '2024-10-19T13:05:00Z', type: 'pdf' },
      { id: 'att-2', fileName: 'figma-export.png', fileSize: '2.1 MB', uploadedBy: 'Rania El-Said', uploadedAt: '2024-10-18T09:30:00Z', type: 'png' },
    ],
    comments: [
      { id: 'cm-1', author: 'Rania El-Said', text: 'Let\'s align the spacing scale with the new Figma library before touching colors.', time: '1 day ago' },
      { id: 'cm-2', author: 'Sarah Chen', text: 'Agreed — ping me when the token audit is ready for review.', time: '20 hours ago' },
    ],
    activity: [
      { id: 'ac-1', type: 'assign', actor: 'Rania El-Said', detail: 'assigned this task to you', time: '3 days ago' },
    ],
  },
  {
    id: 'task-004',
    title: 'Q3 Board Deck Layout',
    description:
      'Prepare the layout and visual structure for the Q3 investor board deck. Use the existing brand guidelines and include key metrics, roadmap, and financial summary slides.',
    priority: 'Low',
    status: 'review',
    project: 'Investor Relations',
    dueDate: 'Oct 25, 2024',
    estimatedTime: '6h',
    assignedBy: 'Sarah Chen',
    progress: 90,
    done: false,
    updatedAt: '2024-10-22T08:15:00Z',
    checklist: [
      { id: 'cl-1', text: 'Draft slide structure', done: true },
      { id: 'cl-2', text: 'Add metrics slides', done: true },
      { id: 'cl-3', text: 'Add roadmap section', done: true },
      { id: 'cl-4', text: 'Final proofreading', done: false },
    ],
    attachments: [
      { id: 'att-1', fileName: 'q3-deck-draft.pdf', fileSize: '3.4 MB', uploadedBy: 'Sarah Chen', uploadedAt: '2024-10-21T17:20:00Z', type: 'pdf' },
    ],
    comments: [
      { id: 'cm-1', author: 'Sarah Chen', text: 'Looks great — just needs proofreading before I send to the board.', time: '4 hours ago' },
    ],
    activity: [
      { id: 'ac-1', type: 'status', actor: 'Sarah Chen', detail: 'moved to Review', time: '4 hours ago' },
    ],
  },
  {
    id: 'task-005',
    title: 'Security Audit Report',
    description:
      'Complete a full security audit of the API endpoints and authentication flows. Document all findings and categorize by severity. Provide remediation recommendations.',
    priority: 'High',
    status: 'done',
    project: 'Compliance',
    dueDate: 'Oct 20, 2024',
    estimatedTime: '8h',
    assignedBy: 'James Park',
    progress: 100,
    done: true,
    updatedAt: '2024-10-20T18:00:00Z',
    checklist: [
      { id: 'cl-1', text: 'Audit authentication flows', done: true },
      { id: 'cl-2', text: 'Test API endpoint security', done: true },
      { id: 'cl-3', text: 'Document findings', done: true },
      { id: 'cl-4', text: 'Submit final report', done: true },
    ],
    attachments: [
      { id: 'att-1', fileName: 'security-audit-final.pdf', fileSize: '2.8 MB', uploadedBy: 'You', uploadedAt: '2024-10-20T18:00:00Z', type: 'pdf' },
    ],
    comments: [],
    activity: [
      { id: 'ac-1', type: 'status', actor: 'You', detail: 'marked as complete', time: 'Oct 20' },
    ],
  },
  {
    id: 'task-006',
    title: 'Landing Page Copy Revision',
    description:
      'Revise the landing page copy based on the latest user research insights. Focus on the hero headline, feature descriptions, and call-to-action buttons.',
    priority: 'Medium',
    status: 'todo',
    project: 'Marketing Campaign',
    dueDate: 'Oct 22, 2024',
    estimatedTime: '2h',
    assignedBy: 'Rania El-Said',
    progress: 0,
    done: false,
    updatedAt: '2024-10-19T11:00:00Z',
    checklist: [
      { id: 'cl-1', text: 'Review user research notes', done: false },
      { id: 'cl-2', text: 'Rewrite hero headline', done: false },
      { id: 'cl-3', text: 'Update feature descriptions', done: false },
    ],
    attachments: [],
    comments: [
      { id: 'cm-1', author: 'Rania El-Said', text: 'Lead with the new onboarding-time stat from the research doc — it tested well.', time: '3 days ago' },
    ],
    activity: [
      { id: 'ac-1', type: 'assign', actor: 'Rania El-Said', detail: 'assigned this task', time: '4 days ago' },
    ],
  },
  {
    id: 'task-007',
    title: 'API Rate Limiting Setup',
    description:
      'Implement rate limiting across all public API endpoints using a token-bucket algorithm. Configure limits per tier (free, pro, enterprise) and add proper error responses.',
    priority: 'High',
    status: 'todo',
    project: 'StartupPilot AI',
    dueDate: 'Oct 21, 2024',
    estimatedTime: '5h',
    assignedBy: 'James Park',
    progress: 0,
    done: false,
    updatedAt: '2024-10-18T16:00:00Z',
    checklist: [
      { id: 'cl-1', text: 'Research token-bucket options', done: false },
      { id: 'cl-2', text: 'Implement middleware', done: false },
      { id: 'cl-3', text: 'Configure per-tier limits', done: false },
      { id: 'cl-4', text: 'Write tests', done: false },
    ],
    attachments: [],
    comments: [
      { id: 'cm-1', author: 'James Park', text: 'Start with the enterprise tier limits — that contract renewal depends on it.', time: '4 days ago' },
    ],
    activity: [
      { id: 'ac-1', type: 'assign', actor: 'James Park', detail: 'assigned this task', time: '5 days ago' },
    ],
  },
]