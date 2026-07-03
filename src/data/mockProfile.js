// Sprint 11 — Employee Profile mock data.
// Local-only profile data. No backend, no fetch(), no API calls.
//
// MIGRATION NOTE: shaped like the response of a future `GET /me/profile`
// endpoint. Components consume this as a plain object, so swapping the
// data source later shouldn't require template changes — only where it's
// fetched.
//
// Identity fields (`id`, `fullName`, `email`, `avatarUrl`, `role`) mirror
// `mockEmployeeUser` in mockEmployee.js — same person, same values — since
// the Profile page is a more detailed view of the same signed-in employee
// rather than a separate record. Naming otherwise follows the conventions
// established in mockProjects.js, mockMessages.js, and mockCalendar.js.

export const mockProfile = {
  // ── Basic Information ────────────────────────────────────────────
  id: 'emp_001',
  fullName: 'Alex Carter',
  email: 'alex.carter@startuppilot.io',
  avatarUrl: null, // null -> UI falls back to initials avatar
  role: 'employee',
  department: 'Engineering',
  position: 'Frontend Engineer',
  phone: '+1 (555) 014-2287',
  location: 'Austin, TX',
  joinDate: '2023-03-06',

  // ── Professional Information ─────────────────────────────────────
  bio: "Frontend engineer focused on developer-facing tools and AI-assisted workflows. Currently leading the latency and UX work on StartupPilot's LLM-powered project portal.",
  experience: '4 years',
  skills: ['Vue.js', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'AI Integration', 'UI/UX Design'],

  // ── Statistics ────────────────────────────────────────────────────
  // Summary metrics for the profile stats row. Sourced independently from
  // mockTasks.js / mockProjects.js (those are sprint-scoped snapshots; these
  // are cumulative profile totals), matching how mockEmployee.js's own
  // quick stats are also hand-set summary numbers rather than computed
  // from the raw task/project lists.
  stats: {
    completedTasks: 87,
    activeProjects: 3,
    aiSuggestionsApplied: 41,
    currentStreak: 12, // consecutive days with at least one completed task
  },
}