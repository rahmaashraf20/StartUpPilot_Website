// Sprint 9 — Employee Calendar mock data.
// All data is local-only. No backend, no fetch(), no API calls.
//
// MIGRATION NOTE: shaped like the response of a future `GET /me/calendar-events`
// endpoint. Components consume this as a plain array, so swapping the data
// source later shouldn't require template changes — only where it's fetched.
//
// `type` drives the icon/visual treatment in the Calendar views:
// 'task' | 'meeting' | 'deadline'
// `date` is an ISO date string (YYYY-MM-DD) so calendar grids/sorting can
// use real date math (`new Date(event.date)`), matching the ISO convention
// already used for `updatedAt` in mockTasks.js / mockProjects.js. `time` is
// a separate display string, mirroring the dueDate/dueTime split already
// used for mockTodaysTasks in mockEmployee.js.
//
// Where an event represents an existing task/project/deadline, it links
// back by id (`relatedTaskId` / `relatedProjectId`) rather than duplicating
// that record — same pattern as `focusTaskId` / `focusProjectId` in
// mockAiWorkspace.js — plus a denormalized display field for convenience.

export const mockCalendarEvents = [
  {
    id: 'cal-1',
    title: 'Finalize API Documentation',
    type: 'task',
    date: '2024-10-22',
    time: '5:00 PM',
    project: 'Tech Stack Redesign',
    relatedTaskId: 'task-1',
  },
  {
    id: 'cal-2',
    title: 'Team Sync Meeting',
    type: 'meeting',
    date: '2024-10-22',
    time: '2:30 PM',
    project: 'Marketing Campaign',
    relatedTaskId: 'task-2',
  },
  {
    id: 'cal-3',
    title: 'Update Design System',
    type: 'task',
    date: '2024-10-23',
    time: '11:00 AM',
    project: 'Infrastructure',
    relatedTaskId: 'task-003',
  },
  {
    id: 'cal-4',
    title: 'Landing Page Review',
    type: 'deadline',
    date: '2024-10-25',
    time: 'End of day',
    project: 'Marketing Campaign',
    relatedProjectId: 'proj-002',
  },
  {
    id: 'cal-5',
    title: 'Q3 Board Deck Layout',
    type: 'task',
    date: '2024-10-25',
    time: '4:00 PM',
    project: 'Investor Relations',
    relatedTaskId: 'task-004',
  },
  {
    id: 'cal-6',
    title: 'Design Review Sync',
    type: 'meeting',
    date: '2024-10-26',
    time: '10:00 AM',
    project: 'Product Vision',
  },
  {
    id: 'cal-7',
    title: 'Founders Feedback Loop',
    type: 'task',
    date: '2024-10-26',
    time: '3:00 PM',
    project: 'Product Discovery',
    relatedTaskId: 'task-002',
  },
  {
    id: 'cal-8',
    title: 'Sprint 12 Completion',
    type: 'deadline',
    date: '2024-10-27',
    time: 'End of day',
    project: 'Dev Team',
  },
  {
    id: 'cal-9',
    title: 'API Rate Limiting Setup',
    type: 'task',
    date: '2024-10-21',
    time: '1:00 PM',
    project: 'StartupPilot AI',
    relatedTaskId: 'task-007',
  },
  {
    id: 'cal-10',
    title: 'Marketing Campaign Launch',
    type: 'deadline',
    date: '2024-10-30',
    time: '9:00 AM',
    project: 'Marketing Campaign',
    relatedProjectId: 'proj-002',
  },
  {
    id: 'cal-11',
    title: 'Investor Deck Draft Due',
    type: 'deadline',
    date: '2024-10-30',
    time: 'End of day',
    project: 'Strategy',
  },
  {
    id: 'cal-12',
    title: 'Compliance Check-in',
    type: 'meeting',
    date: '2024-11-01',
    time: '11:30 AM',
    project: 'Compliance',
    relatedProjectId: 'proj-006',
  },
]