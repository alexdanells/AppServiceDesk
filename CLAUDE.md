# AppServiceDesk — Claude Code Guide

## Project Overview
A Service Desk for managing Apprenticeships built as a single-page app for The Tess Group. Learner Success Coaches (LSC) raise requests via the frontend. Managers and Admins view and action those requests via a workflow backend — similar to a lightweight JIRA.

**Live site:** https://alexdanells.github.io/AppServiceDesk/ (GitHub Pages not yet enabled on the new repo — see Git & GitHub section)

## Stack
- **HTML** — `index.html` (single entry point)
- **CSS** — `style.css`
- **JavaScript** — `app.js`

No build tools, no frameworks, no package manager. Everything lives in these three files only.

## Constraints
- **No new libraries** without asking the user first.
- **No new files** — all logic stays in `index.html`, `style.css`, and `app.js`.
- **LocalStorage only** — there is no backend. All data is read from and written to `localStorage`.
- **GitHub Pages compatible** — open `index.html` directly in a browser; no server required.

## Running the App
Open `index.html` in any browser. No build step, no dev server.

---

## Users (hardcoded, no registration)
| Username | Password | Role    | Description |
|----------|----------|---------|-------------|
| LSC      | tess     | coach   | Learner Success Coach — raises requests |
| Manager  | tess     | manager | Request Processor — actions tickets |
| Admin    | tess     | admin   | Full visibility of all tickets |

Login is a modal with button-click user selection (no typed password). Switch User and Logout buttons appear in the header when logged in.

---

## Data Layer — localStorage keys
| Key | Contents |
|-----|----------|
| `asd_tickets` | Array of all ticket objects |
| `asd_session` | Currently logged-in user object |
| `asd_read` | `{ username: [ticketId, ...] }` — which tickets each user has opened |
| `asd_comment_read` | `{ username: { ticketId: seenCount } }` — how many comments each user has seen per ticket |
| `asd_demo_hidden` | `'true'` if demo data is hidden from workflow view |

---

## Ticket Structure
```js
{
  id: 'ASD-001',           // auto-incrementing
  createdBy: 'LSC',        // username
  assignedTo: 'Manager',   // username — defaults to Manager on creation
  participants: [],         // array of usernames who can also see the ticket
  comments: [{ author, text, createdAt }],
  status: 'open',          // open | in-progress | awaiting-review | solved
  createdAt: ISO string,
  type: 'gateway',         // see ticket types below
  _isDemo: true,           // present on demo-seeded tickets only
  // ...type-specific fields
}
```

## Ticket Types & Their Fields
| Type | Key Fields |
|------|-----------|
| `gateway` | learnerName, employerName, standard, notes, gatewayConfirmed |
| `bil` | learnerName, employerName, standard, ldol, expectedRtl, notes |
| `rtl` | learnerName, employerName, standard, actualRtl, notes |
| `withdrawal` | learnerName, employerName, standard, ldol, withdrawalReason, notes |
| `achievement` | learnerName, employerName, standard, outcome (Pass/Merit/Distinction), notes |
| `refer` | learnerName, employerName, standard, notes |
| `new-enrolment` | learnerName, employerName, standard, plannedStartDate |
| `role-suitability` | learnerName, employerName, standard, details |
| `commitment-concern` | learnerName, employerName, standard, details |
| `technical-mentor` | learnerName, employerName, standard, supportArea, details |
| `curriculum-feedback` | standard, feedbackType, details |
| `platform-request` | learnerName, employerName, standard, requestType, details |
| `system-support` | systemAffected, issueType, details |
| `other` | subject, learnerName (optional), employerName (optional), details |

## Ticket Statuses
`open` → `in-progress` → `awaiting-review` → `solved`

## Apprenticeship Standards dropdown (used on all forms)
Data Analyst, Data Technician, Applied AI & Automation, Multi-Channel Marketer, Assistant Accountant, Professional Accounting Technician, Digital Support Technician, Business Administrator, Operations/Departmental Manager

---

## App Structure (app.js)

### Key constants
- `STANDARDS` — shared dropdown list
- `CATEGORIES`, `LEARNER_STATUS_TYPES`, `NEW_LEARNER_TYPES`, `SUITABILITY_TYPES`, `CURRICULUM_TYPES` — card data for home and sub-menus
- `USERS` — hardcoded user objects
- `TICKET_TYPE_LABELS`, `STATUS_LABELS` — display label maps

### Auth functions
`getCurrentUser()`, `setCurrentUser()`, `clearCurrentUser()`, `openLoginModal()`, `closeLoginModal()`, `requireLogin(fn)`, `updateHeader()`

`_currentView` tracks current view (`'home'` or `'workflow'`) to control the header My Workflow / Main Menu toggle.

### Ticket helpers
`generateTicketId()`, `saveTicket(data)`, `getTicket(id)`, `updateTicket(id, updates)`, `formatDate(dateStr)`, `formatDateTime(dateStr)`, `renderTicketFields(ticket)`

### Read / unread tracking
`getReadMap()`, `isTicketRead(id, username)`, `markTicketRead(id, username)`, `markTicketUnread(id, username)`, `getUnreadQueueCount(user)`

`getCommentReadMap()`, `getSeenCommentCount(id, username)`, `markCommentsRead(id, username, count)`, `hasNewComments(ticket, username)` — NOTE: `hasNewComments` returns false for tickets not yet opened (those are covered by the ⚡ badge, not 💬).

`getNewCommentCount(user)` — count of all visible tickets with unseen comments.

### Demo data
`getDemoTickets()` — returns all 50 demo ticket objects (split across two functions combined via IIFE). `seedDemoData()` — writes demo tickets + pre-seeded read state to localStorage. Auto-runs on DOMContentLoaded if no demo tickets exist.

### View functions
`renderHome()`, `renderLearnerStatus()`, `renderNewLearner()`, `renderSuitabilityConcern()`, `renderCurriculum()` — card grid navigation views.

`renderFormAchievement()`, `renderFormRefer()`, `renderFormGateway()`, `renderFormBIL()`, `renderFormRTL()`, `renderFormWithdrawal()`, `renderFormNewEnrolment()`, `renderFormSuitability(type, title)`, `renderFormTechnicalMentor()`, `renderFormCurriculumFeedback()`, `renderFormPlatformRequest()`, `renderFormSystemSupport()`, `renderFormOther()` — 13 ticket creation forms.

`renderWorkflow(tab, statusFilter)` — the My Workflow view. Tabs: Queue / Requests Made. Admin sees all tickets with no tabs. Includes live search bar, status filter pills with counts, unread row highlighting, Reset/Hide demo controls at bottom.

`renderTicketDetail(ticketId, origin)` — full ticket detail. Two-panel layout: main (ticket fields, participants, comments) + sidebar (assignee, status). Marks ticket as read on open. Shows TEST DATA badge for demo tickets.

`renderConfirmation()` — post-submission screen.

### Validation
`getFieldError(el)`, `validateField(el)`, `validateForm()`, `attachValidation()` — all forms use `novalidate` + custom inline validation on submit and on input.

---

## UI / Design
- Dark theme: bg `#191a1f`, cards `#292a32`
- White header with The Tess Group logo (`tesslogo.webp`)
- Purple accent: `#673aff`
- Red error/unread: `#e53935` / `#ff5454`
- Cards use flexbox with `justify-content: center` so orphan rows are centred
- Forms have `max-width: 600px; margin: 0 auto`
- `[hidden] { display: none !important; }` — critical rule preventing CSS from overriding HTML hidden attribute on the login modal

## Header layout (when logged in)
`[My Workflow] [Switch User] [Logout] [👤 Username] [⚡ N] [💬 N]`
- ⚡ = unread queue tickets (never opened)
- 💬 = tickets with new comments since last view

---

## Workflow features
- **Queue** — tickets assigned to the user or where they're a participant
- **Requests Made** — tickets created by the user
- **Admin** — sees all tickets, flat list, no tabs, extra "Raised By" column
- **Unread rows** — red background tint + red ticket ID for unread or new-comment tickets
- **Search** — live DOM filter by ticket ID, learner name, employer name, raised by
- **Filter pills** — each shows count for that status
- **Last Comment column** — timestamp of most recent comment

## Ticket detail features
- Back button returns to origin tab (Queue or Requests Made)
- Mark as Unread button next to back button
- Assignee dropdown — Manager/Admin only, saves on change
- Status dropdown — Manager/Admin only, saves on change
- Participants — add/remove, visible to all logged-in users
- Comments — any logged-in user can post; timestamped with date and time
- TEST DATA badge — shown in red next to status on all demo tickets

---

## Demo data (50 tickets, ASD-001 to ASD-050)
Pre-seeded with realistic UK apprenticeship scenarios:
- ASD-001 to ASD-012: Gateway to EPA (LSC raises, assigned to Manager)
- ASD-013 to ASD-020: Break in Learning (LSC raises, assigned to Manager)
- ASD-021 to ASD-028: Return to Learning (LSC raises, assigned to Manager)
- ASD-029 to ASD-036: Withdrawal (LSC raises, assigned to Manager)
- ASD-037 to ASD-042: Achievement (Manager raises, assigned to LSC)
- ASD-043 to ASD-046: Refer (Manager raises, assigned to LSC) — **unread for LSC** ⚡
- ASD-047: Technical Mentor (LSC raises) — **unread for Manager** ⚡
- ASD-048 to ASD-050: Platform Request / System Support / Curriculum Feedback — **new comment for Manager** 💬

Reset/Hide buttons at the bottom of the workflow manage demo data visibility.

---

## Git & GitHub
- **Repo:** https://github.com/alexdanells/AppServiceDesk
- **Deployed:** https://alexdanells.github.io/AppServiceDesk/ (enable GitHub Pages on this repo — currently returns 404)
- `main` — always deployable
- Branch per feature, merge to main when done

## Commit style
Short imperative sentences, lower-case, no period:
```
add ticket creation form
fix status filter not resetting
style admin dashboard layout
```

## Branches used so far
`feature/form-request` → `ticket-database` → `ticket-management` → `notification-sys` → `final-workflowchanges` → `example-data`
