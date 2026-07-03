// Sprint 10 — Employee Messages mock data.
// Local-only conversations and messages. No backend, no fetch(), no API calls.
//
// MIGRATION NOTE: shaped like the response of a future `GET /me/conversations`
// and `GET /me/conversations/:id/messages` endpoint. Components consume these
// as plain arrays, so swapping the data source later shouldn't require
// template changes — only where it's fetched.
//
// People reused from the existing mock dataset (mockProjects.js team
// members / mockTasks.js assignedBy) rather than introducing new names:
// Sarah Chen, James Park, Rania El-Said, Alex Carter. Alex Carter is the
// signed-in employee (mockEmployeeUser.fullName in mockEmployee.js), so
// every conversation here is between Alex and one of the other three.
//
// `participant` is denormalized onto the conversation (name only, no
// duplicated user record) — same lightweight cross-referencing style as
// `owner` / `assignedBy` in mockProjects.js / mockTasks.js. `relatedProjectId`
// optionally links a conversation back to an existing mockProjects.js entry,
// the same way mockCalendar.js's `relatedProjectId` links events to projects.
//
// `senderId` on each message is either 'me' (the signed-in employee) or the
// conversation's `id`, so a single thread's messages can be told apart by
// sender without re-storing the participant's name on every message.
//
// Wrapped in `reactive()` — same shared-state pattern used for
// mockNotifications.js in Sprint 8. Both exports below are single
// shared sources of truth: any component that opens a conversation
// (clearing `unread`) or sends a message (pushing into a thread, updating
// `lastMessage`/`lastMessageAt`) mutates these directly, so unread counts
// stay in sync everywhere they're read — no Pinia, no backend, no
// duplicate per-component copies of this state.
import { reactive } from 'vue'

export const mockConversations = reactive([
  {
    id: 'conv-1',
    participant: 'Sarah Chen',
    avatarUrl: null,
    relatedProjectId: 'proj-001',
    lastMessage: "Make sure to test the streaming response on slow 3G connections too.",
    lastMessageAt: '2024-10-22T08:00:00Z',
    unread: 2,
  },
  {
    id: 'conv-2',
    participant: 'James Park',
    avatarUrl: null,
    relatedProjectId: 'proj-003',
    lastMessage: 'Prioritize founders from YC cohort first.',
    lastMessageAt: '2024-10-21T15:00:00Z',
    unread: 0,
  },
  {
    id: 'conv-3',
    participant: 'Rania El-Said',
    avatarUrl: null,
    relatedProjectId: 'proj-002',
    lastMessage: 'Looks great — just needs proofreading before I send to the board.',
    lastMessageAt: '2024-10-22T13:30:00Z',
    unread: 1,
  },
])

// Messages keyed by conversation id. Each thread is a flat, time-ordered
// array — no pagination yet, matching the "local-only, no backend" scope
// of every other Sprint 1–9 mock data module. Also reactive, for the same
// shared-state reason as mockConversations above.
export const mockMessagesByConversation = reactive({
  'conv-1': [
    {
      id: 'msg-1-1',
      senderId: 'conv-1',
      text: "Hey — saw you started on the latency work for the LLM portal. How's the prompt caching going?",
      time: 'Yesterday, 9:10 AM',
    },
    {
      id: 'msg-1-2',
      senderId: 'me',
      text: "Going well. Caching is in, working on response streaming next.",
      time: 'Yesterday, 9:14 AM',
    },
    {
      id: 'msg-1-3',
      senderId: 'conv-1',
      text: "Nice. Make sure to test the streaming response on slow 3G connections too.",
      time: 'Today, 8:00 AM',
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      senderId: 'conv-2',
      text: "For the founders feedback loop, let's get the survey out this week.",
      time: '2 days ago, 11:00 AM',
    },
    {
      id: 'msg-2-2',
      senderId: 'me',
      text: 'On it — drafting the template now.',
      time: '2 days ago, 11:05 AM',
    },
    {
      id: 'msg-2-3',
      senderId: 'conv-2',
      text: 'Prioritize founders from YC cohort first.',
      time: 'Yesterday, 3:00 PM',
    },
  ],
  'conv-3': [
    {
      id: 'msg-3-1',
      senderId: 'me',
      text: "Q3 board deck layout is in review — added the metrics and roadmap sections.",
      time: 'Today, 1:00 PM',
    },
    {
      id: 'msg-3-2',
      senderId: 'conv-3',
      text: 'Looks great — just needs proofreading before I send to the board.',
      time: 'Today, 1:30 PM',
    },
  ],
})