# Unified Design System & Buddy Creator Rework

**Date**: 2026-03-24
**Status**: Draft
**Scope**: Visual unification, buddy creator rebuild, sign-out button

---

## Problem

The app has two conflicting visual identities:
- **Dark cosmic** (welcome, creator, interview, role-picker): `#0f0f1a` backgrounds, neon purple/teal accents, glass-morphism cards
- **Warm cream** (dashboard, insights, life, profile): `#FAF8F5` backgrounds, dark brown text, lime green accents, soft shadows

The buddy creation system uses pixel art sprites (20x20 grids) while the dashboard uses a polished 3D Three.js blob. These feel like two different apps.

There is no sign-out mechanism accessible from the main UI (only buried in profile settings).

## Goals

1. Unify all screens under the warm cream palette
2. Replace pixel art buddy creator with a 3D blob-based system (color + mood + accessories)
3. Add a sign-out icon to the top-right corner on post-onboarding screens

## Non-Goals

- Changing navigation architecture
- Changing state management or onboarding flow order
- Modifying the role system, gamification, or chat logic
- Backend/server changes

---

## Design

### 1. Unified Color Palette

All screens adopt the warm cream palette:

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#FAF8F5` | Page background |
| `--surface` | `#FFFFFF` | Cards, modals |
| `--surface-soft` | `#F5F2ED` | Subtle backgrounds |
| `--text` | `#2C2418` | Primary text |
| `--text-mid` | `#5C4F3D` | Secondary text |
| `--text-light` | `#8A7E6B` | Tertiary/muted text |
| `--text-faint` | `#B5AA98` | Placeholders |
| `--accent` | `#C8F031` | Primary accent (lime green) |
| `--accent-dark` | `#9DBF10` | Accent hover/active |
| `--border` | `rgba(44,36,24,0.06)` | Borders |
| `--shadow-sm` | `0 2px 20px rgba(44,36,24,0.04)` | Card shadows |
| `--shadow-md` | `0 4px 30px rgba(44,36,24,0.06)` | Elevated shadows |

Additional accent colors (for buddy, charts, badges):
- Coral: `#E8634A`
- Teal: `#2A9D8F`
- Indigo: `#5A67D8`
- Amber: `#D4941A`
- Rose: `#C44569`
- Sage: `#6B8E6B`
- Lavender: `#9B8FD4`
- Sunset: `#E8915C`

**Typography**: Inter (body, UI) + Nunito (headings) + DM Sans (dashboard labels). Already in use on dashboard, extended to all screens. Note: DM Sans is loaded via `@import` in `base.css` (not in `<head>`) — this import must be preserved when rewriting `base.css`.

**Buttons**: Rounded pill style with warm styling. Primary buttons use `--accent` background with dark text. Secondary buttons use white/surface with border.

### 2. Welcome Page

Warm cream palette with a subtle hero gradient (cream → soft sage or peach) for landing-page energy.

**Changes**:
- Background: dark cosmic → warm cream with gradient hero section
- Crystal 3D prism → 3D buddy blob as hero visual (same Three.js renderer)
- Canvas particle burst → removed (or replaced with soft floating warm-toned shapes)
- Buttons: dark glass → warm pill buttons matching dashboard style
- Text: neon purple/teal gradients → dark brown with lime green accent on key word
- "vibetran" logo: white → dark brown

### 3. New Buddy Creator

**Replaces**: Pixel art shape picker, color wheel, emoji accessories.

**Layout** (top to bottom):
1. Heading: "Create Your Buddy" + subtext
2. Large 3D buddy preview (live updates as user customizes)
3. **Color** — 8 circular swatches in a row
4. **Mood** — 4 cards: Happy, Chill, Energetic, Thoughtful
5. **Accessories** — grid of toggleable options
6. Name input field
7. "That's my buddy!" CTA button

#### 3a. Color Swatches

8 curated colors, displayed as circular swatches:

| Name | Hex | Notes |
|------|-----|-------|
| Coral | `#E8634A` | Pre-selected default |
| Teal | `#2A9D8F` | |
| Indigo | `#5A67D8` | |
| Amber | `#D4941A` | |
| Rose | `#C44569` | |
| Sage | `#6B8E6B` | |
| Lavender | `#9B8FD4` | |
| Sunset | `#E8915C` | |

Selected swatch gets a ring/check indicator. No color wheel.

#### 3b. Mood Selection

4 mood options, each displayed as a card with name and mini description:

| Mood | Eyes | Animation | Description |
|------|------|-----------|-------------|
| Happy | Upward curved | Bouncy bob | "always smiling" |
| Chill | Relaxed half-closed | Slow gentle float | "cool and calm" |
| Energetic | Wide bright | Fast bob + slight spin | "full of energy" |
| Thoughtful | One eye squinted | Slow head tilt | "always thinking" |

Default: Happy. Selected card gets accent border highlight.

#### 3c. 3D Accessories

Rendered as part of the Three.js scene (not flat overlays):

| Accessory | Placement | Notes |
|-----------|-----------|-------|
| Tiny hat | Floats above head | |
| Glasses | On face (between eyes) | |
| Bow | At base/front | |
| Crown | Floats above head | Replaces hat if both selected |
| Star | Orbits around buddy | Animated orbit |
| Scarf | Wraps around base | |

Toggle on/off. Multiple can be stacked (except hat+crown: selecting crown auto-deselects hat, and vice versa). Displayed as a grid of icon buttons on warm surface cards.

#### 3d. Name Input

Text input, max 20 chars. Placeholder: "name your buddy". Same warm styling as dashboard inputs. Falls back to "Buddy" if empty.

#### 3e. No Uniqueness System

The coworker uniqueness/availability system (`getClaimedCombos()`, "X left" labels) is removed entirely. Anyone can pick any combination.

### 4. Role Picker

Same content and flow, restyled. Note: role-picker has no dedicated CSS file — styles are inline in `index.html` using dark-theme CSS variables. These inline styles must be updated to use warm palette tokens.

- Background: dark → warm cream
- Role cards: dark glass → white surface cards with warm shadows
- Text: light/neon → dark brown
- Accent highlights: purple → lime green
- Subrole chips: same behavior, warm styling

### 5. Interview Screen

Same chat flow and questions, restyled:
- Background: dark → warm cream
- Chat bubbles: dark glass → white surface (buddy messages) and soft accent (user messages)
- Send button: purple → lime green
- Input field: dark glass → warm bordered input
- Header: dark → warm cream with buddy name

### 6. Sign Out Button

**Scope**: Dashboard, chat, hangout, insights, life, profile screens only.

**Design**:
- Icon: door/logout SVG icon
- Position: top-right corner of header bar
- Color: `#8A7E6B` (text-light) default, `#2C2418` (text-primary) on hover
- Size: ~20px, matching settings gear style

**Behavior**:
- Clears `buddy-state` from localStorage
- Resets in-memory `STATE` to defaults via `Object.assign(STATE, defaultState())`
- Calls `location.reload()` to fully reset (matches existing profile sign-out behavior; avoids stale in-memory state)

**Not shown on**: welcome, creator, role-picker, interview.

**Existing profile buttons**: The "Sign Out" and "Reset Everything" buttons already on the profile screen remain as-is. The new header icon provides quick access without navigating to profile.

### 7. Hangout Screen Coworker Buddies

The predefined coworker buddies (Mochi, Zap, Whisper, Nox, Clover) in `js/hangout.js` switch from pixel art to small 3D blob renderings. The old `shape` field (blob, robot, ghost, alien, cat) is replaced with a `mood` field. Each coworker keeps their assigned color and gets a default mood + accessory for personality:

| Buddy | Color | Mood | Accessory |
|-------|-------|------|-----------|
| Mochi (Sarah) | `#2A9D8F` (teal) | Chill | Bow |
| Zap (Marcus) | `#D4941A` (amber) | Energetic | Glasses |
| Whisper (Priya) | `#9B8FD4` (lavender) | Thoughtful | Star |
| Nox (James) | `#E8915C` (sunset) | Happy | Tiny hat |
| Clover (Lin) | `#6B8E6B` (sage) | Happy | Crown |

---

## Code Changes

### Files Modified
- `css/base.css` — Replace dark palette CSS variables with warm palette as globals. The current dual-token system (`--bg` for dark, `--warm-bg` for warm) collapses: the `--warm-*` prefixed tokens become the un-prefixed defaults. All downstream CSS files (dashboard, insights, life, profile) that reference `--warm-*` tokens must be updated to use the un-prefixed versions.
- `css/welcome.css` — Full restyle to warm cream + hero gradient
- `css/creator.css` — Full rewrite for new 3D buddy creator layout
- `css/interview.css` — Restyle to warm cream
- `css/chat.css` — Unify accent colors
- `css/hangout.css` — Update coworker buddy rendering
- `css/celebration.css` — Update confetti colors from dark-palette neons (`#7c6ff7`, `#ff6b9d`, `#4ecdc4`) to warm palette accents
- `index.html` — Update creator screen markup, add sign-out icon to headers, update role-picker inline styles from dark to warm tokens
- `js/creator.js` — Rewrite: remove pixel art, add 3D preview + color/mood/accessory pickers
- `js/state.js` — Remove `SPRITE_DATA` and `SHAPES` definitions, update `defaultState()` avatar from `{ shape, color }` to `{ color, mood }`, add mood/accessory constant definitions
- `js/welcome.js` — Remove canvas particle burst system, replace with warm-toned alternative or remove entirely
- `js/dashboard.js` — Add sign-out button handler
- `js/hangout.js` — Update `COWORKER_BUDDIES` from `shape` field to `mood` field
- `js/utils.js` — Remove pixel art `renderAvatar()`, update `spawnConfetti()` colors to warm palette

### Files Potentially Removed/Gutted
- Pixel art rendering functions (in creator.js, utils.js, state.js)
- Color wheel code (in creator.js)
- Canvas particle code (in js/welcome.js)
- `SPRITE_DATA` and `SHAPES` objects (in js/state.js — NOT data.js)

### Files Unchanged
- `server.js`
- `data.js` (contains only `ROLE_DATA`, no sprite data)
- `css/dashboard.css`, `css/insights.css`, `css/life.css`, `css/profile.css` (already warm — only `--warm-*` → un-prefixed token rename)

---

## State Shape Changes

The `STATE.avatar` object updates from:
```js
// Old
{ shape: 'blob', color: '#7c6ff7', accessories: ['crown'], name: 'Buddy' }

// New
{ color: '#E8634A', mood: 'happy', accessories: ['glasses'], name: 'Buddy' }
```

The `shape` field is removed (only one shape now). The `mood` field is added.

---

## Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| Three.js performance on creator (rendering live preview during customization) | Reuse existing dashboard 3D setup; keep polygon count low |
| Accessory 3D models add complexity | Start simple (geometric primitives), iterate on polish |
| Welcome page loses visual drama without dark theme | Hero gradient + 3D buddy animation + warm tones can still feel premium |
| State migration for existing users | On load, map old `shape` field to `mood: 'happy'` (default); keep color if in new 8-color palette, else default to coral `#E8634A`. Note: the old default `#7c6ff7` (neon purple) is NOT in the new palette, so all users who kept the default get migrated to coral. This is intentional. |
