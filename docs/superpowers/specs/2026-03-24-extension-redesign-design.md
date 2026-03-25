# Vibetran Extension Redesign — "Context Bridge" Sidebar

**Date**: 2026-03-24
**Status**: Draft
**Scope**: Full extension UX redesign — sidebar, smart context, insert system, visual polish

---

## Problem

The current extension is a floating panel that shows the same content on every site. Copying requires multiple clicks and manual pasting. There's no way to take actions on the page. Users constantly switch between apps (Gong → Salesforce, Salesforce → Gmail) manually carrying context in their heads.

## Vision

**The extension should feel like a superpower, not a tool.** It should:
- Know what you're looking at before you ask
- Surface exactly what you need, nothing more
- Let you act without leaving the page
- Make every interaction feel fast, smooth, and satisfying

## Design Principles

1. **Zero-step intelligence** — Don't make the user tell buddy what page they're on. Buddy already knows.
2. **One-click actions** — Every useful thing should be one click. If it takes two, redesign it.
3. **Insert, don't copy** — The goal isn't to put text on a clipboard. It's to put text in the right place.
4. **Delight in the details** — Micro-animations, smooth transitions, satisfying feedback. This should feel alive.
5. **Disappear when not needed** — On irrelevant sites, be minimal. On relevant sites, be indispensable.

---

## Architecture

### Sidebar (not a floating panel)

The sidebar slides in from the right edge of the viewport. The page content compresses to make room — nothing is hidden or overlapped. This feels native, like a browser devtools panel.

- **Width**: 320px
- **Open/close**: FAB click, toolbar icon, or keyboard shortcut (Cmd+Shift+B)
- **Transition**: 300ms ease-out slide + page content shift
- **Persistence**: Stays open across page navigations within the same tab. Context updates automatically.
- **Position**: Fixed to right edge, full viewport height

### FAB (Floating Action Button)

When the sidebar is closed, a small FAB lives in the bottom-right corner.

- **Size**: 44px circle
- **Design**: Warm cream background, subtle shadow, tiny buddy face (the 3D blob rendered as a static 2D icon)
- **Badge**: Small lime dot when buddy has something relevant
- **Hover**: Gentle scale-up (1.0 → 1.08) + shadow increase
- **Click**: Opens sidebar with a smooth slide
- **Drag**: Can be repositioned along the right edge (remembers position)

### Context Detection

Buddy reads the current page and builds a context object:

| Platform | What It Detects | How |
|----------|----------------|-----|
| Salesforce | Account, Opportunity, Contact, Lead + record name | URL patterns + DOM selectors |
| Gmail | Composing/reading + recipient/sender + subject | DOM selectors |
| Slack | Channel name | `data-qa` attributes |
| LinkedIn | Profile name + company | DOM selectors |
| Google Meet | Active call + participants | URL + DOM |
| Gong | Call recording + participants + account | URL + page content |
| Google Calendar | Event details | DOM selectors |
| Outreach | Sequence + prospect | URL + DOM |
| Unknown | Page title + selected text + URL | Always available |

On unknown sites, buddy also scans the page title and any user-selected text for known account/contact names and surfaces relevant data if found.

---

## Sidebar Views

### Layout (all views)

```
┌────────────────────────────┐
│  ● vibetran           ─  ✕ │  Header
├────────────────────────────┤
│  🏢 Acme Corp · Opportunity│  Context bar (detected)
├────────────────────────────┤
│                            │
│  [Dynamic content area]    │  View-specific cards
│                            │
│                            │
│                            │
├────────────────────────────┤
│  ┌────────────────────  ↑ ┐│  Chat input (always present)
│  │ ask buddy...           ││
│  └────────────────────────┘│
└────────────────────────────┘
```

**Header**: "vibetran" wordmark + minimize (—) and close (✕) buttons. Minimize collapses to FAB. Close removes sidebar.

**Context bar**: Shows what buddy detected — platform icon, entity name, entity type. Subtle animated entrance when context changes. If nothing detected: "browsing · [hostname]".

**Dynamic content area**: Scrollable. Contains action cards specific to the current context. Each card has:
- Left color accent bar (coded by type)
- Title + subtitle
- Content preview (expandable)
- Action buttons on hover (Insert / Copy)

**Chat input**: Sticky at bottom. "ask buddy..." placeholder. Enter to send. Results appear inline above the input as cards.

### View: Salesforce Opportunity

When user is on a Salesforce Opportunity page:

```
┌────────────────────────────┐
│  ● vibetran           ─  ✕ │
├────────────────────────────┤
│  🏢 Acme Corp              │
│  Opportunity · $120K       │
├────────────────────────────┤
│                            │
│  ┌─ RECENT CALL ──────────┐│
│  │ 📞 Call w/ Sarah Chen   ││
│  │    Today, 2:30pm · 42m  ││
│  │                         ││
│  │  NEXT STEPS             ││
│  │  • Send security quest. ││
│  │  • Schedule deep-dive   ││
│  │         [Insert ▸]      ││
│  │                         ││
│  │  CHAMPION               ││
│  │  Sarah Chen, VP Sales   ││
│  │         [Insert ▸]      ││
│  │                         ││
│  │  PAIN                   ││
│  │  Manual data migration  ││
│  │  taking 2 weeks/quarter ││
│  │         [Insert ▸]      ││
│  │                         ││
│  │  COMPETITION            ││
│  │  Evaluated Fivetran,    ││
│  │  concerns about pricing ││
│  │         [Insert ▸]      ││
│  └─────────────────────────┘│
│                            │
│  ┌─ QUICK ACTIONS ────────┐│
│  │  ⚡ Log this call       ││
│  │  ✏️  Update stage        ││
│  │  📧 Draft follow-up     ││
│  └─────────────────────────┘│
│                            │
├────────────────────────────┤
│  ask buddy...              │
└────────────────────────────┘
```

**"Insert ▸" behavior on Salesforce:**
1. User clicks `Insert ▸` on "NEXT STEPS"
2. Buddy scans the Salesforce page for the Next Steps field
3. Finds it, scrolls it into view, highlights it with a brief glow
4. Text appears in the field with a typewriter animation (satisfying, confirms it worked)
5. Small toast: "✓ Inserted into Next Steps"
6. If field not found: falls back to clipboard copy with toast "📋 Copied — paste into the right field"

**MEDDPICC field mapping:**
The call summary is pre-structured into MEDDPICC sections. Each maps to a Salesforce field:
- Next Steps → Next Step field
- Champion → Champion field
- Pain → Identified Pain field
- Metrics → Metrics field
- Economic Buyer → Economic Buyer field
- Decision Criteria → Decision Criteria field
- Decision Process → Decision Process field
- Competition → Competition field

### View: Gmail Composing

When user is composing an email:

```
┌────────────────────────────┐
│  ● vibetran           ─  ✕ │
├────────────────────────────┤
│  ✉️  Composing to           │
│  sarah.chen@acme.com       │
├────────────────────────────┤
│                            │
│  ┌─ ABOUT ACME ───────────┐│
│  │  $120K Opp · Stage 3    ││
│  │  Last call: Today 2:30  ││
│  │  Champion: Sarah Chen   ││
│  │         [Insert ▸]      ││
│  └─────────────────────────┘│
│                            │
│  ┌─ SUGGESTED ────────────┐│
│  │  📝 Follow-up from call  ││
│  │  "Hi Sarah, great call  ││
│  │  today. As discussed..." ││
│  │         [Insert ▸]      ││
│  │                         ││
│  │  📝 Meeting request      ││
│  │  "Would love to set up  ││
│  │  a technical deep-dive" ││
│  │         [Insert ▸]      ││
│  └─────────────────────────┘│
│                            │
├────────────────────────────┤
│  ask buddy...              │
└────────────────────────────┘
```

**Insert into Gmail compose**: Buddy finds the active compose body, inserts at cursor position. Uses `document.execCommand('insertText')` or clipboard API for rich text.

### View: Gmail Reading

```
Context: Email from sarah.chen@acme.com
Cards:
  - Account context (Acme Corp, opp details)
  - Suggested reply drafts
  - Action: "Log to Salesforce"
  - Action: "Summarize thread"
```

### View: Gong Call Recording

```
Context: Call with Sarah Chen, Acme Corp · 42min
Cards:
  - Structured summary (MEDDPICC format)
  - Key moments with timestamps
  - Action items extracted
  - Action: "Push to Salesforce" (pre-maps to MEDDPICC fields)
  - Action: "Draft follow-up email"
  - Action: "Copy full summary"
```

### View: LinkedIn Profile

```
Context: Sarah Chen · VP Sales, Acme Corp
Cards:
  - CRM data if contact exists (opp, last activity, notes)
  - Action: "Draft connection note" → Insert into LinkedIn message box
  - Action: "Add to Salesforce" (if not in CRM)
  - Action: "Research Acme Corp"
```

### View: Google Meet (Live Call)

```
Context: Call in progress · Acme Corp (live indicator pulsing)
Cards:
  - Live trigger cards (competitor mentions, objections, pricing)
  - Running action items
  - Action: "Copy notes so far"
  - Post-call: structured summary appears automatically
```

### View: Unknown Site (Fallback)

```
Context: browsing · example.com
Content:
  - Search/chat input (prominent, centered)
  - Quick access buttons: Recent copies, Draft email, Look up account, Next meeting
  - Recent items from buddy (last 5)
  - If page title or selected text matches a known account: surfaces that account's context card
```

---

## Insert System

### Tier 1: Copy (works everywhere)
- One-click copy to clipboard
- Smart format detection: plain text for Slack fields, rich text for Gmail compose
- Toast confirmation with satisfying animation

### Tier 2: Insert (supported sites — Salesforce, Gmail, Slack, LinkedIn)
- Buddy detects the active/target text field on the page
- Click `Insert ▸` → text appears directly in the field
- On Salesforce: can target specific named fields (Next Steps, Champion, etc.) using label-to-field DOM mapping
- On Gmail: inserts at cursor position in compose body
- On Slack: inserts into the active message input
- Fallback: if no field detected, copy to clipboard with helpful toast

### Tier 2 Insert Implementation (Salesforce field targeting):
1. Scan page for `<label>` elements or `lightning-input-field` components
2. Match label text to MEDDPICC field names
3. Find the associated `<input>`, `<textarea>`, or rich text editor
4. Focus the field, set its value, dispatch input/change events to trigger Salesforce's reactivity
5. Brief highlight animation on the field to confirm

### Tier 3: Execute (future — requires API auth)
- `Log call` → creates Salesforce Task record via API
- `Update stage` → PATCH opportunity via API
- `Send follow-up` → opens pre-filled Gmail compose

Tier 3 is out of scope for this phase. Focus on Tiers 1-2.

---

## Micro-Interactions & Delight

### Sidebar open/close
- Slide in: 300ms cubic-bezier(0.4, 0, 0.2, 1) — fast start, gentle land
- Page content shifts smoothly with the same timing
- Context bar content fades in 150ms after sidebar finishes opening

### Card hover
- Cards lift slightly (translateY -2px) with shadow increase
- Action buttons (Insert/Copy) fade in from the right — they're hidden until hover
- Left accent bar subtly brightens

### Insert action
- Button ripple effect on click
- Target field gets a brief lime-green glow pulse (0.5s)
- Text appears with a quick fade-in (not typewriter — too slow)
- Toast slides up from bottom: "✓ Inserted into Next Steps" with lime check
- Toast auto-dismisses after 2s

### Copy action
- Button flashes to "✓ Copied" with green background
- Subtle confetti burst (3-4 tiny particles) from the button — playful, not over the top
- Resets after 1.5s

### FAB
- Idle: gentle breathing animation (scale 1.0 → 1.02, loop)
- Badge appears: pops in with spring animation
- Hover: scale up + shadow increase
- Click: FAB morphs/slides into the sidebar opening (connected animation)

### Context change
- When navigating to a new page: old cards fade out, context bar updates with a slide transition, new cards fade in staggered (50ms delay between each)
- Loading state: subtle shimmer animation on placeholder cards (skeleton loading)

### Chat responses
- Buddy's reply appears as a card with a typing indicator first (3 dots), then the content fades in
- If the reply contains insertable content, the Insert button pulses once to draw attention

---

## Visual Design

### Colors (matching main app)
- Background: `#FAF8F5` (warm cream)
- Surface: `#FFFFFF` (cards)
- Text: `#2C2418` (primary), `#5C4F3D` (mid), `#8A7E6B` (light)
- Accent: `#C8F031` (lime green — Insert buttons, active states)
- Accent dark: `#9DBF10` (hover states)

### Card accent colors (left border)
- Coral `#E8634A` — Calls, meetings
- Teal `#2A9D8F` — Tasks, action items
- Indigo `#5A67D8` — Insights, data
- Amber `#D4941A` — Account info
- Rose `#C44569` — Alerts, urgent items

### Typography
- Font: Inter (body), Nunito (headings)
- Sidebar header: Nunito 600, 14px
- Context bar: Inter 600, 13px (entity name) + Inter 400, 12px (type)
- Card title: Inter 600, 13px
- Card content: Inter 400, 13px, line-height 1.5
- Action buttons: Inter 600, 12px
- Chat input: Inter 400, 13px

### Spacing
- Sidebar padding: 16px
- Card padding: 14px
- Card gap: 10px
- Card border-radius: 12px
- Button border-radius: 8px

### Shadows
- Sidebar: `0 0 40px rgba(44,36,24,0.08)` (soft, wide)
- Cards: none by default, `0 2px 8px rgba(44,36,24,0.06)` on hover
- FAB: `0 2px 12px rgba(44,36,24,0.12)`
- Toast: `0 4px 16px rgba(44,36,24,0.1)`

---

## Code Changes

### Files Modified
- `extension/content.js` — Major rewrite: sidebar DOM, smart context per site, insert system, new card rendering
- `extension/panel.css` → renamed to `extension/sidebar.css` — Full rewrite for sidebar layout + all component styles + animations
- `extension/popup.html` — Simplified (sidebar is the main UI now)
- `extension/manifest.json` — May need additional permissions for DOM manipulation on specific sites

### Files Unchanged
- `extension/background.js` — Badge system works as-is
- `extension/icons/` — Keep existing icons
- `server.js` — API endpoints stay the same (may add new ones for Gong data)

### New server endpoints (may be needed)
- `POST /api/context/salesforce` — Get MEDDPICC data for an opportunity
- `POST /api/context/gmail` — Get account data for an email recipient
- `POST /api/gong/summary` — Get structured call summary for a Gong recording
- `POST /api/draft` — Generate drafted text (email, message, notes)

---

## Scope for Phase 1

**Build:**
- Sidebar shell (open/close, shift page, responsive)
- FAB with badge
- Context detection (existing platforms + Gong)
- Smart context views for: Salesforce, Gmail, Gong, Unknown/fallback
- Tier 1 Copy (one-click, toast)
- Tier 2 Insert for Salesforce (field detection + insert)
- Tier 2 Insert for Gmail compose (insert at cursor)
- Chat input (reuse existing buddy chat API)
- Micro-interactions (card hover, insert glow, copy confetti, smooth transitions)

**Defer:**
- LinkedIn deep integration
- Outreach integration
- Tier 3 API-based actions
- Drag-to-reposition FAB
- Call live-listening redesign (keep current but in sidebar format)

---

## Non-Goals
- Changing the buddy app itself (only the extension)
- Authentication/OAuth flows for Salesforce API
- Mobile support
- Multi-tab sync
