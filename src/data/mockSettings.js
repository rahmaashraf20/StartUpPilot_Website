// Sprint 12 — Employee Settings mock data.
// Local-only settings/preferences. No backend, no fetch(), no API calls.
//
// MIGRATION NOTE: shaped like the response of a future `GET /me/settings`
// endpoint (with each section mapping to a corresponding `PATCH /me/settings`
// payload). Components consume this as a plain object, so swapping the data
// source later shouldn't require template changes — only where it's fetched
// and saved.
//
// Organized into the same logical sections a settings page would expose as
// tabs/cards: Account, Appearance, Notifications, Security. Identity-ish
// fields under `account` intentionally mirror `mockEmployeeUser`
// (mockEmployee.js) / `mockProfile` (mockProfile.js) — same signed-in
// employee, same values — since Settings edits preferences for that same
// person rather than describing a separate record.

export const mockSettings = {
  // ── Account ───────────────────────────────────────────────────────
  // Maps to a future `PATCH /me/settings/account`. `language` and
  // `timezone` are preference fields specific to Settings (not duplicated
  // in mockProfile.js, which only covers identity/bio-style fields).
  account: {
    fullName: 'Alex Carter',
    email: 'alex.carter@startuppilot.io',
    language: 'en',
    timezone: 'America/Chicago',
  },

  // ── Appearance ────────────────────────────────────────────────────
  // Maps to a future `PATCH /me/settings/appearance`. `theme` drives
  // light/dark/system styling; `density` controls spacing density across
  // dashboard lists/cards (compact vs. comfortable).
  appearance: {
    theme: 'system', // 'light' | 'dark' | 'system'
    density: 'comfortable', // 'comfortable' | 'compact'
  },

  // ── Notifications ─────────────────────────────────────────────────
  // Maps to a future `PATCH /me/settings/notifications`. Each flag is a
  // simple boolean toggle, same shape a settings form's checkboxes/switches
  // would bind to directly.
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    weeklyDigest: false,
    aiSuggestions: true,
  },

  // ── Security ──────────────────────────────────────────────────────
  // Maps to a future `GET/PATCH /me/settings/security`. `lastPasswordChange`
  // is informational (ISO date, same real-date-math convention used for
  // `updatedAt`/`lastMessageAt` elsewhere); `twoFactorEnabled` is a toggle;
  // `activeSessions` is a count for a future "log out of other devices"
  // affordance.
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: '2025-01-12',
    activeSessions: 2,
  },
}