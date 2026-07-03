// Sprint 7 — AI Workspace mock data.
// All data and logic here is local-only. No backend, no fetch(), no API calls.
// The "AI chat" is a simple keyword-matched prototype simulation, not a real assistant.
//
// MIGRATION NOTE: shaped like the response of a future `GET /me/ai/insights`
// and `GET /me/ai/suggested-actions` endpoint. Components consume these as
// plain props, so swapping the data source later shouldn't require template
// changes — only where it's fetched. `getAiReply()` is the seam that would
// be replaced by a real AI chat API call later.

// ── AI Insights feed ─────────────────────────────────────────────
// Shown like the `isAi` activity items already used in ActivityFeedCard,
// but scoped to this workspace rather than mixed into general activity.
export const mockAiInsights = [
  {
    id: 'insight-1',
    headline: 'Marketing Campaign is falling behind',
    body: 'Creative approvals have slipped twice this week. At the current pace, the Oct 30 launch date is at risk.',
    tag: 'Risk Alert',
    time: '2 hours ago',
  },
  {
    id: 'insight-2',
    headline: 'Compliance has stalled',
    body: 'Only 20% complete with the deadline a few days away. Consider reassigning a teammate to unblock it.',
    tag: 'Risk Alert',
    time: '5 hours ago',
  },
  {
    id: 'insight-3',
    headline: "You're ahead of schedule on Product Vision",
    body: '90% complete with 19 days left before the due date. Nice work — this is on track to finish early.',
    tag: 'Positive Trend',
    time: 'Yesterday',
  },
  {
    id: 'insight-4',
    headline: 'Review-stage tasks are piling up',
    body: 'Several tasks have been sitting in Review for multiple days. A quick pass could unblock the team.',
    tag: 'Workflow Tip',
    time: 'Yesterday',
  },
]

// ── Suggested Actions ─────────────────────────────────────────────
// Same shape/spirit as the existing mockAiRecommendation / mockTasksAiRecommendation,
// but as a list so the AI Workspace can show several at once. References
// existing tasks/projects by id rather than duplicating their data.
export const mockSuggestedActions = [
  {
    id: 'action-1',
    tag: 'Focus Suggestion',
    headline: 'Finalize API Documentation before your next sync',
    body: 'This is your highest-priority task today and clears your queue before the Team Sync.',
    confidence: 92,
    focusTaskId: 'task-1',
    taskTitle: 'Finalize API Documentation',
  },
  {
    id: 'action-2',
    tag: 'Risk Mitigation',
    headline: 'Reassign a teammate to Compliance',
    body: 'Compliance is at risk of missing its deadline. Pulling in a second teammate could help it catch up.',
    confidence: 78,
    focusProjectId: 'proj-006',
    projectName: 'Compliance',
  },
  {
    id: 'action-3',
    tag: 'Focus Suggestion',
    headline: 'Review Marketing Campaign creative assets',
    body: 'Creative approvals are the current bottleneck for this campaign. A review today keeps the launch date realistic.',
    confidence: 81,
    focusProjectId: 'proj-002',
    projectName: 'Marketing Campaign',
  },
]

// ── Local keyword-based chat replies ──────────────────────────────
// Each entry's `keywords` are checked against the lowercased user message.
// First matching entry wins. If nothing matches, GENERIC_REPLY is used.
const KEYWORD_REPLIES = [
  {
    keywords: ['task', 'tasks', 'todo', 'to-do'],
    reply: "You currently have a mix of tasks across To Do, In Progress, and Review. Your highest priority right now is finishing the API documentation — want me to pull up your task list?",
  },
  {
    keywords: ['project', 'projects'],
    reply: 'You\'re part of 6 projects. Tech Stack Redesign and Product Vision are on track, while Marketing Campaign and Compliance are flagged as at-risk.',
  },
  {
    keywords: ['deadline', 'deadlines', 'due', 'due date'],
    reply: 'Your nearest deadlines are coming up on Marketing Campaign (Oct 30) and Compliance (Nov 1). Both are currently behind pace.',
  },
  {
    keywords: ['progress', 'status', 'how am i doing'],
    reply: "Overall you're making steady progress — Product Vision is at 90%, but Marketing Campaign and Compliance need attention to stay on schedule.",
  },
  {
    keywords: ['risk', 'at risk', 'behind'],
    reply: 'Marketing Campaign and Compliance are both flagged as at-risk right now. Reviewing creative assets or reassigning teammates could help bring them back on track.',
  },
  {
    keywords: ['team', 'teammate', 'who'],
    reply: 'Your most active collaborators right now are Sarah Chen, James Park, Rania El-Said, and Alex Carter.',
  },
  {
    keywords: ['help', 'what can you do'],
    reply: 'I can help you think through your tasks, projects, deadlines, and overall progress. Try asking me about a specific project or what to focus on next.',
  },
]

const GENERIC_REPLY = "I'm a local prototype assistant, so I can only respond to a few topics right now — try asking about your tasks, projects, deadlines, or progress."

/**
 * Returns a locally-matched reply for a given user message.
 * Purely local/string matching — no network calls, no real AI model.
 */
export function getAiReply(message) {
  const text = (message || '').toLowerCase()
  const match = KEYWORD_REPLIES.find((entry) =>
    entry.keywords.some((kw) => text.includes(kw)),
  )
  return match ? match.reply : GENERIC_REPLY
}