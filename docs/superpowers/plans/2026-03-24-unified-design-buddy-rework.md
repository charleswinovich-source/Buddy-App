# Unified Design & Buddy Creator Rework — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify all screens under the warm cream palette, replace the pixel art buddy creator with a 3D blob-based system (color + mood + accessories), and add a sign-out icon to post-onboarding screens.

**Architecture:** Single-page app with screen-based navigation. All screens switch from dark cosmic to warm cream palette by collapsing the dual CSS token system (`--warm-*` → un-prefixed). The buddy creator is rebuilt to use the existing Three.js 3D blob renderer with new color/mood/accessory customization. Sign-out icon added to shared header pattern on dashboard+ screens.

**Tech Stack:** HTML/CSS/JS (vanilla), Three.js r128 (CDN), Inter/Nunito/DM Sans fonts

**Spec:** `docs/superpowers/specs/2026-03-24-unified-design-buddy-rework-design.md`

---

## File Structure

### Files Modified
| File | Lines | Responsibility |
|------|-------|---------------|
| `css/base.css` | 209 | Global tokens, shared styles — collapse `--warm-*` to un-prefixed |
| `css/welcome.css` | 276 | Welcome screen — full restyle to warm cream + hero gradient |
| `css/creator.css` | 76 | Creator screen — full rewrite for 3D buddy picker |
| `css/interview.css` | 52 | Interview screen — restyle to warm cream |
| `css/chat.css` | 15 | Chat screen — update accent colors |
| `css/hangout.css` | 38 | Hangout screen — update for 3D coworker buddies |
| `css/celebration.css` | 9 | Celebration overlay — update confetti colors |
| `css/dashboard.css` | 652 | Dashboard — rename `--warm-*` refs to un-prefixed |
| `css/insights.css` | 339 | Insights — rename `--warm-*` refs to un-prefixed |
| `css/life.css` | 19 | Life — no `--warm-*` tokens (uses hardcoded values), but verify warm compatibility |
| `css/profile.css` | 5 | Profile — comments only, no token updates needed |
| `index.html` | 393 | Markup for creator, role-picker, sign-out icons, headers; fix inline `--text-dim`/`--accent3` refs |
| `js/state.js` | 160 | Remove SPRITE_DATA/SHAPES, update defaultState(), add BUDDY_COLORS/MOODS/ACCESSORIES |
| `js/creator.js` | 148 | Full rewrite — 3D preview, color/mood/accessory pickers |
| `js/welcome.js` | 166 | Remove particle system, add warm floating shapes |
| `js/dashboard.js` | 2213 | Extract 3D buddy to shared util, add sign-out handler |
| `js/hangout.js` | 168 | Update COWORKER_BUDDIES from shape → mood |
| `js/utils.js` | 264 | Remove pixel art renderAvatar(), update spawnConfetti(), add shared 3D buddy renderer |

---

## Task 1: Collapse CSS Token System

Unify the dual-token system in `base.css` so `--warm-*` values become the un-prefixed defaults. Then update all CSS files that reference `--warm-*` to use the un-prefixed versions.

**Files:**
- Modify: `css/base.css:5-40` (`:root` variables)
- Modify: `css/dashboard.css` (all `--warm-*` references)
- Modify: `css/insights.css` (all `--warm-*` references)
- Modify: `js/dashboard.js:421-442` (inline `--warm-*` refs in template literals)

- [ ] **Step 1: Replace `:root` variables in base.css**

In `css/base.css` lines 5-40, replace the entire `:root` block. Remove all old dark variables (`--bg`, `--bg2`, `--bg3`, `--text`, `--text-dim`, `--accent`, `--accent2`, `--accent3`). Promote all `--warm-*` variables to un-prefixed names:

```css
:root {
  --bg: #FAF8F5;
  --surface: #FFFFFF;
  --surface-soft: #F5F2ED;
  --gray: #E8E4DE;
  --text: #2C2418;
  --text-mid: #5C4F3D;
  --text-light: #8A7E6B;
  --text-faint: #B5AA98;
  --text-ghost: #D1C9BC;
  --accent: #C8F031;
  --accent-dark: #9DBF10;
  --accent-soft: rgba(200,240,49,0.12);
  --border: rgba(44,36,24,0.06);
  --shadow-sm: 0 2px 20px rgba(44,36,24,0.04);
  --shadow-md: 0 4px 30px rgba(44,36,24,0.06);
  --coral: #E8634A;
  --teal: #2A9D8F;
  --indigo: #5A67D8;
  --amber: #D4941A;
  --rose: #C44569;
  --sage: #6B8E6B;
  --lavender: #9B8FD4;
  --sunset: #E8915C;
}
```

- [ ] **Step 2: Update body defaults in base.css**

In `css/base.css` lines 42-48, update body styles:

```css
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100dvh;
  overflow-x: hidden;
}
```

- [ ] **Step 3: Find-and-replace `--warm-` prefix in dashboard.css**

In `css/dashboard.css`, replace all occurrences of `--warm-` with `--` (removing the prefix). This is a global find-and-replace across the file. Examples:
- `var(--warm-bg)` → `var(--bg)`
- `var(--warm-surface)` → `var(--surface)`
- `var(--warm-text)` → `var(--text)`
- `var(--warm-accent)` → `var(--accent)`
- `var(--warm-shadow-sm)` → `var(--shadow-sm)`
- `var(--warm-coral)` → `var(--coral)`

- [ ] **Step 4: Find-and-replace `--warm-` prefix in insights.css**

Same replacement in `css/insights.css`: replace all `--warm-` with `--`.

- [ ] **Step 5: Find-and-replace `--warm-` prefix in js/dashboard.js template literals**

In `js/dashboard.js`, there are 4 inline `--warm-*` references in template literal strings at lines 421, 422, 437, and 441-442. Replace:
- `var(--warm-text-light)` → `var(--text-light)` (lines 421, 437, 442)
- `var(--warm-text)` → `var(--text)` (line 422)
- `var(--warm-coral)` → `var(--coral)` (line 441)

Note: `css/life.css` has NO `--warm-*` tokens (uses hardcoded values), so no changes needed there.

- [ ] **Step 6: Verify the dashboard still renders correctly**

Open `http://localhost:3000` in preview. The dashboard should look identical since the token values didn't change, only their names. Check that colors, shadows, and layout are unchanged.

- [ ] **Step 7: Commit**

```bash
git add css/base.css css/dashboard.css css/insights.css js/dashboard.js
git commit -m "refactor: collapse --warm-* CSS tokens to un-prefixed defaults"
```

---

## Task 2: Update Shared Styles in base.css

Update buttons, role-picker cards, bottom nav, and other shared components in `base.css` to use warm palette.

**Files:**
- Modify: `css/base.css:55-209` (buttons, role cards, bottom nav, gamification)

- [ ] **Step 1: Update button styles**

In `css/base.css` lines 55-73, restyle buttons from dark glass to warm pill:

```css
.btn {
  padding: 10px 24px;
  border-radius: 50px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.btn:hover {
  background: var(--surface-soft);
  border-color: rgba(44,36,24,0.12);
}
.btn-big {
  padding: 14px 32px;
  font-size: 1.05rem;
  background: var(--accent);
  color: var(--text);
  border: none;
  font-weight: 700;
}
.btn-big:hover {
  background: var(--accent-dark);
}
.btn-sm {
  padding: 6px 16px;
  font-size: 0.8rem;
}
.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-mid);
}
.btn-outline:hover {
  border-color: var(--text-light);
}
```

- [ ] **Step 2: Update role-picker card styles**

In `css/base.css` lines 95-109, restyle role cards:

```css
.role-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}
.role-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
.role-card.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent);
}
.subrole-pill {
  padding: 8px 18px;
  border-radius: 50px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-mid);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.subrole-pill:hover {
  border-color: var(--text-light);
}
.subrole-pill.selected {
  background: var(--accent);
  color: var(--text);
  border-color: var(--accent);
  font-weight: 600;
}
```

- [ ] **Step 3: Update bottom nav styles**

In `css/base.css` lines 125-138, restyle bottom nav:

```css
.bottom-nav {
  display: flex;
  justify-content: space-around;
  padding: 12px 0 max(12px, env(safe-area-inset-bottom));
  background: var(--surface);
  border-top: 1px solid var(--border);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
.bottom-nav button {
  background: none;
  border: none;
  color: var(--text-light);
  font-size: 0.7rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-family: 'Inter', sans-serif;
  transition: color 0.2s;
}
.bottom-nav button.active {
  color: var(--text);
}
```

- [ ] **Step 4: Update gamification, focus pills, action tags, and remaining dark references**

In `css/base.css`, do a thorough sweep for ALL remaining dark-palette values:
- Lines 64, 73, 102, 123, 186, 192: Replace all `rgba(124,111,247,...)` (hardcoded purple) with `rgba(200,240,49,...)` (lime green equivalent) or `var(--accent-soft)`
- Lines 77, 97, 104, 118, 127: Replace `var(--bg2)` with `var(--surface)` and `var(--bg3)` with `var(--border)`
- Lines 111-124 (focus sidebar/pills): Update from dark glass to warm surface cards
- Lines 140-176: Update mood tracker, quest items, streak badge, XP bar to warm palette
- Line 188-196 (chat FAB): Update from dark to warm styling

- [ ] **Step 5: Update celebration confetti colors**

In `css/celebration.css`, update the overlay background to use warm palette:

```css
.celebration-overlay {
  background: rgba(250,248,245,0.95);
}
```

- [ ] **Step 6: Verify shared components render warm**

Preview the app and check buttons, bottom nav, role cards look correct with warm styling.

- [ ] **Step 7: Commit**

```bash
git add css/base.css css/celebration.css
git commit -m "style: update shared components to warm cream palette"
```

---

## Task 3: Restyle Welcome Screen

Replace the dark cosmic welcome page with warm cream + hero gradient, and swap the crystal for a 3D buddy hero.

**Files:**
- Modify: `css/welcome.css` (full restyle, 276 lines)
- Modify: `js/welcome.js` (replace particle system, 166 lines)
- Modify: `index.html:27-87` (welcome screen markup)

- [ ] **Step 1: Rewrite welcome.css**

Replace the entire `css/welcome.css` with warm styling. Key changes:
- `.welcome` container: `background: linear-gradient(180deg, #FAF8F5 0%, #F0EDE6 40%, #E8F0E0 100%)` (cream → sage gradient)
- `.hero` section: centered, no dark glass
- `.hero-text h1`: `color: var(--text)`, large display font with `font-family: 'Nunito'`, the word "data" gets `color: var(--accent-dark)` (lime green)
- `.hero-text p`: `color: var(--text-mid)`
- `.hero-btn`: warm pill buttons matching the new `.btn` style
- `.hero-btn.primary`: `background: var(--accent); color: var(--text); border: none; font-weight: 700`
- `.hero-btn.secondary`: `background: var(--surface); border: 1px solid var(--border); color: var(--text-mid)`
- Remove all crystal CSS (`.crystal`, faces, spin animation, glow)
- `.buddy-teaser`: keep section but restyle for warm palette
- Features cards: white surface cards with warm shadows
- Remove `welcomeGradientShift` animation, keep `welcomeFadeUp`
- Add a `.hero-buddy-3d` container: `width: 280px; height: 280px; margin: 2rem auto;`

- [ ] **Step 2: Rewrite js/welcome.js**

Replace the entire particle burst system. The new `initWelcome()` should:
- Remove the canvas particle/shooting star code entirely (lines 4-165)
- Instead, use the shared `createBuddy3D()` function (built in Task 5) to render a hero buddy

**IMPORTANT dependency note:** Task 5 builds `createBuddy3D()`. If executing tasks in order, implement a temporary inline version here, then refactor in Task 5 to use the shared function. OR skip the 3D hero in this task and add it in Task 5 after the shared renderer exists.

**Preferred approach — placeholder now, wire up in Task 5:**

```js
let _welcomeBuddyCleanup = null;

function initWelcome() {
  // Cleanup previous
  if (_welcomeBuddyCleanup) { _welcomeBuddyCleanup(); _welcomeBuddyCleanup = null; }

  const container = document.getElementById('hero-buddy-3d');
  if (!container) return;
  container.innerHTML = '';

  // Will use createBuddy3D() once Task 5 is complete
  // For now, show a static placeholder or leave empty
  if (typeof createBuddy3D === 'function') {
    const buddy = createBuddy3D(container, {
      color: '#E8634A', mood: 'happy', accessories: [], size: 1
    });
    if (buddy) _welcomeBuddyCleanup = buddy.cleanup;
  }
}
```

- [ ] **Step 3: Update welcome HTML in index.html**

In `index.html` lines 27-87, update the welcome screen:
- Replace the `<canvas id="bg-canvas">` with a `<div id="hero-buddy-3d"></div>` inside the hero section
- Remove the crystal div
- Keep the hero text, buttons, features section, buddy teaser
- Update button classes if needed

- [ ] **Step 4: Verify welcome screen**

Preview: the welcome page should show a warm cream-to-sage gradient background with the 3D buddy blob floating as the hero visual. Buttons should be warm pill style. No dark elements, no particle canvas.

- [ ] **Step 5: Commit**

```bash
git add css/welcome.css js/welcome.js index.html
git commit -m "feat: restyle welcome screen to warm cream with 3D buddy hero"
```

---

## Task 4: Update State & Data Definitions

Remove pixel art data, add new buddy customization constants, update default state.

**Files:**
- Modify: `js/state.js:54-160` (remove SPRITE_DATA, SHAPES, COLORS, old ACCESSORIES; add new constants)
- Modify: `js/state.js:6-40` (update defaultState)

- [ ] **Step 1: Replace SPRITE_DATA section with new constants**

In `js/state.js`, remove everything from line 54 to 160 (SPRITE_DATA, COLORS, SHAPES, old ACCESSORIES). Replace with:

```js
// === Buddy Customization Constants ===

const BUDDY_COLORS = [
  { name: 'Coral',    hex: '#E8634A' },
  { name: 'Teal',     hex: '#2A9D8F' },
  { name: 'Indigo',   hex: '#5A67D8' },
  { name: 'Amber',    hex: '#D4941A' },
  { name: 'Rose',     hex: '#C44569' },
  { name: 'Sage',     hex: '#6B8E6B' },
  { name: 'Lavender', hex: '#9B8FD4' },
  { name: 'Sunset',   hex: '#E8915C' },
];

const BUDDY_MOODS = [
  { id: 'happy',      label: 'Happy',      desc: 'always smiling',  eyes: 'curved-up',   animSpeed: 1.8, animAmp: 0.2  },
  { id: 'chill',      label: 'Chill',      desc: 'cool and calm',   eyes: 'half-closed',  animSpeed: 0.6, animAmp: 0.08 },
  { id: 'energetic',  label: 'Energetic',  desc: 'full of energy',  eyes: 'wide',         animSpeed: 2.2, animAmp: 0.25 },
  { id: 'thoughtful', label: 'Thoughtful', desc: 'always thinking', eyes: 'squint',       animSpeed: 0.8, animAmp: 0.1  },
];

const BUDDY_ACCESSORIES = [
  { id: 'hat',     label: 'Tiny Hat',  icon: '🎩', group: 'head' },
  { id: 'crown',   label: 'Crown',     icon: '👑', group: 'head' },
  { id: 'glasses', label: 'Glasses',   icon: '👓', group: 'face' },
  { id: 'bow',     label: 'Bow',       icon: '🎀', group: 'base' },
  { id: 'star',    label: 'Star',      icon: '⭐', group: 'orbit' },
  { id: 'scarf',   label: 'Scarf',     icon: '🧣', group: 'base' },
];
```

- [ ] **Step 2: Update defaultState() avatar**

In `js/state.js` lines 6-40, update the `defaultState()` function's avatar field:

```js
// Old:
avatar: { shape: 'blob', color: '#7c6ff7', accessories: [], name: '' },

// New:
avatar: { color: '#E8634A', mood: 'happy', accessories: [], name: '' },
```

- [ ] **Step 3: Add state migration in loadState()**

In `js/state.js` `loadState()` function (lines 42-48), add migration logic after parsing:

```js
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('buddy-state'));
    if (saved) {
      Object.assign(STATE, saved);
      // Migrate old avatar format
      if (STATE.avatar.shape) {
        delete STATE.avatar.shape;
        if (!STATE.avatar.mood) STATE.avatar.mood = 'happy';
        const validColors = BUDDY_COLORS.map(c => c.hex);
        if (!validColors.includes(STATE.avatar.color)) {
          STATE.avatar.color = '#E8634A'; // default coral
        }
      }
    }
  } catch(e) {}
}
```

- [ ] **Step 4: Verify state loads without errors**

Preview the app. Existing state should migrate cleanly. Console should show no errors.

- [ ] **Step 5: Commit**

```bash
git add js/state.js
git commit -m "refactor: replace pixel art data with 3D buddy constants, add state migration"
```

---

## Task 5: Build Shared 3D Buddy Renderer

Extract the 3D buddy rendering from dashboard.js into a reusable function in utils.js that both the creator preview and dashboard can use.

**Files:**
- Modify: `js/utils.js` (remove pixel art renderAvatar, add shared 3D renderer)
- Modify: `js/dashboard.js:28-235` (refactor to use shared renderer)

- [ ] **Step 1: Remove pixel art renderAvatar from utils.js**

In `js/utils.js`, remove the `renderAvatar()` function (lines 12-95), `renderAvatarCustom()` (lines 97-108), and the `lighten()`/`darken()` helper functions (lines 5-10) that were only used by pixel art rendering.

- [ ] **Step 2: Add shared 3D buddy renderer to utils.js**

Add a new `createBuddy3D(container, options)` function to `js/utils.js`. This function:
- Takes a DOM container and options: `{ color, mood, accessories, size, interactive }`
- Creates a Three.js scene with the blob buddy (sphere body, eyes, blush)
- Supports mood-based eye expressions and animation parameters
- Renders 3D accessories (hat/crown floating above, glasses on face, bow at base, star orbiting, scarf at base)
- Returns a controller object: `{ setColor(hex), setMood(id), setAccessories([ids]), cleanup(), reactToInput(text) }`

The body geometry, material setup, eye/blush creation, and animation loop are extracted from `js/dashboard.js` lines 28-235. Key additions:
- Eye shape varies by mood (curved-up, half-closed, wide, squint)
- Accessories are simple Three.js primitives (e.g., hat = small cylinder + brim, crown = torus with points, glasses = two torus rings + bridge, star = small icosahedron orbiting, bow = small sphere cluster, scarf = torus at base)
- `setColor()` updates material color live
- `setMood()` updates eye meshes and animation params live
- `setAccessories()` adds/removes accessory meshes live

The implementation should extract the existing code from `js/dashboard.js` lines 28-235 into a reusable function. Reference those lines directly for the body geometry deformation (lines 54-73), material setup (lines 76-84), eye creation (lines 88-99), blush creation (lines 101-112), and animation loop (lines 123-221).

Key structure:

```js
function createBuddy3D(container, options = {}) {
  if (!container || !window.THREE) return null;
  const { color = '#E8634A', mood = 'happy', accessories = [], size = 1, interactive = false } = options;
  const disposables = [];

  // --- Scene setup (adapt from dashboard.js lines 34-41) ---
  const w = container.clientWidth || 160;
  const h = container.clientHeight || 160;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
  camera.position.set(0, 0.2, 3.5);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // --- Lighting (from dashboard.js lines 43-51) ---
  scene.add(new THREE.AmbientLight(0xfff5e6, 0.6));
  const dirLight = new THREE.DirectionalLight(0xfff8f0, 0.8);
  dirLight.position.set(-2, 3, 2);
  scene.add(dirLight);
  scene.add(Object.assign(new THREE.DirectionalLight(0xC8F031, 0.2), { position: new THREE.Vector3(0, -1, -2) }));

  // --- Body (from dashboard.js lines 54-86) ---
  // Copy exact vertex deformation: flatten bottom, wavy edge, blobby noise
  const bodyGeo = new THREE.SphereGeometry(1 * size, 48, 48);
  // ... (copy lines 55-73 vertex manipulation)
  bodyGeo.computeVertexNormals();
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color), roughness: 0.3, metalness: 0,
    clearcoat: 0.3, clearcoatRoughness: 0.2, transparent: true, opacity: 0.95
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  scene.add(body);
  disposables.push(bodyGeo, bodyMat);

  // --- Eyes (from dashboard.js lines 88-99, EXTENDED with mood variants) ---
  const eyeGeo = new THREE.SphereGeometry(0.12, 24, 24);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2C2418 });
  disposables.push(eyeGeo, eyeMat);

  // Mood determines initial eye scale:
  // happy: scale.y=0.6 (curved-up squint)
  // chill: scale.y=0.5 (half-closed)
  // energetic: scale.y=1.3, scale.x=1.2 (wide bright)
  // thoughtful: leftEye scale.y=0.8, rightEye scale.y=1.0 (one squinted)
  function applyMoodToEyes(moodId) {
    const m = BUDDY_MOODS.find(m => m.id === moodId) || BUDDY_MOODS[0];
    leftEye.scale.set(1, 1, 1); rightEye.scale.set(1, 1, 1);
    leftEye.rotation.z = 0; rightEye.rotation.z = 0;
    if (m.eyes === 'curved-up') { leftEye.scale.y = 0.6; rightEye.scale.y = 0.6; }
    else if (m.eyes === 'half-closed') { leftEye.scale.y = 0.5; rightEye.scale.y = 0.5; }
    else if (m.eyes === 'wide') { leftEye.scale.set(1.2, 1.3, 1); rightEye.scale.set(1.2, 1.3, 1); }
    else if (m.eyes === 'squint') { leftEye.scale.y = 0.7; } // only left squinted
    currentAnimSpeed = m.animSpeed;
    currentAnimAmp = m.animAmp;
  }

  eyeGeo.scale(1, 1.2, 0.5);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.28 * size, 0.15, 0.85 * size);
  body.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.28 * size, 0.15, 0.85 * size);
  body.add(rightEye);

  // --- Blush (from dashboard.js lines 101-112) ---
  const blushGeo = new THREE.SphereGeometry(0.08, 16, 16);
  blushGeo.scale(1.2, 0.8, 0.3);
  const blushMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.25 });
  disposables.push(blushGeo, blushMat);
  const leftBlush = new THREE.Mesh(blushGeo, blushMat);
  leftBlush.position.set(-0.42 * size, -0.02, 0.82 * size);
  body.add(leftBlush);
  const rightBlush = new THREE.Mesh(blushGeo, blushMat);
  rightBlush.position.set(0.42 * size, -0.02, 0.82 * size);
  body.add(rightBlush);

  // --- Accessories (NEW — 3D primitives) ---
  const accMeshes = {};
  function addAccessory(id) {
    if (accMeshes[id]) return;
    let mesh;
    const s = size;
    if (id === 'hat') {
      const g = new THREE.CylinderGeometry(0.25*s, 0.3*s, 0.2*s, 16);
      const brim = new THREE.CylinderGeometry(0.4*s, 0.4*s, 0.03*s, 16);
      const m = new THREE.MeshPhysicalMaterial({ color: 0x2C2418, roughness: 0.6 });
      mesh = new THREE.Group();
      const top = new THREE.Mesh(g, m); top.position.y = 0.1*s;
      const br = new THREE.Mesh(brim, m);
      mesh.add(top, br);
      mesh.position.set(0, 1.05*s, 0);
      disposables.push(g, brim, m);
    } else if (id === 'crown') {
      const g = new THREE.TorusGeometry(0.25*s, 0.05*s, 8, 5);
      const m = new THREE.MeshPhysicalMaterial({ color: 0xD4941A, metalness: 0.6, roughness: 0.2 });
      mesh = new THREE.Mesh(g, m);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.set(0, 1.05*s, 0);
      disposables.push(g, m);
    } else if (id === 'glasses') {
      mesh = new THREE.Group();
      const ringGeo = new THREE.TorusGeometry(0.13*s, 0.02*s, 8, 16);
      const gm = new THREE.MeshPhysicalMaterial({ color: 0x2C2418, roughness: 0.4 });
      const l = new THREE.Mesh(ringGeo, gm); l.position.set(-0.28*s, 0.15, 0.95*s);
      const r = new THREE.Mesh(ringGeo, gm); r.position.set(0.28*s, 0.15, 0.95*s);
      // Bridge
      const bg = new THREE.CylinderGeometry(0.015*s, 0.015*s, 0.2*s, 4);
      const bridge = new THREE.Mesh(bg, gm); bridge.rotation.z = Math.PI/2; bridge.position.set(0, 0.15, 0.95*s);
      mesh.add(l, r, bridge);
      disposables.push(ringGeo, gm, bg);
    } else if (id === 'bow') {
      const g = new THREE.SphereGeometry(0.1*s, 8, 8);
      const m = new THREE.MeshPhysicalMaterial({ color: 0xC44569, roughness: 0.4 });
      mesh = new THREE.Group();
      const c = new THREE.Mesh(g, m);
      const lg = new THREE.Mesh(g, m); lg.position.x = -0.12*s; lg.scale.set(1.3, 0.8, 0.6);
      const rg = new THREE.Mesh(g, m); rg.position.x = 0.12*s; rg.scale.set(1.3, 0.8, 0.6);
      mesh.add(c, lg, rg);
      mesh.position.set(0, -0.35*s, 0.7*s);
      disposables.push(g, m);
    } else if (id === 'star') {
      const g = new THREE.IcosahedronGeometry(0.12*s, 0);
      const m = new THREE.MeshPhysicalMaterial({ color: 0xD4941A, metalness: 0.4, roughness: 0.2 });
      mesh = new THREE.Mesh(g, m);
      mesh._orbit = true; // flag for animation loop
      disposables.push(g, m);
    } else if (id === 'scarf') {
      const g = new THREE.TorusGeometry(0.6*s, 0.08*s, 8, 24);
      const m = new THREE.MeshPhysicalMaterial({ color: 0x2A9D8F, roughness: 0.5 });
      mesh = new THREE.Mesh(g, m);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.set(0, -0.3*s, 0);
      disposables.push(g, m);
    }
    if (mesh) { body.add(mesh); accMeshes[id] = mesh; }
  }
  function removeAccessory(id) {
    if (accMeshes[id]) { body.remove(accMeshes[id]); delete accMeshes[id]; }
  }
  accessories.forEach(addAccessory);

  // --- Animation loop (from dashboard.js lines 123-221, parameterized) ---
  let time = 0, running = true;
  let currentAnimSpeed = 0.8, currentAnimAmp = 0.1;
  let currentMood = mood;
  applyMoodToEyes(mood);

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    time += 0.016;
    // Bob (parameterized by currentAnimSpeed/currentAnimAmp)
    body.position.y = Math.sin(time * currentAnimSpeed) * currentAnimAmp;
    body.rotation.z = Math.sin(time * 0.5) * 0.03;
    // Breathing
    body.scale.y = 1 + Math.sin(time * 1.2) * 0.02;
    body.scale.x = 1 - Math.sin(time * 1.2) * 0.01;
    // Orbiting star accessory
    if (accMeshes.star) {
      accMeshes.star.position.set(Math.sin(time * 1.5) * 1.4 * size, 0.5 * size, Math.cos(time * 1.5) * 1.4 * size);
      accMeshes.star.rotation.y += 0.03;
    }
    renderer.render(scene, camera);
  }
  animate();

  // --- Controller ---
  return {
    setColor(hex) {
      bodyMat.color.set(hex);
      blushMat.color.set(hex);
    },
    setMood(id) {
      currentMood = id;
      applyMoodToEyes(id);
    },
    setAccessories(ids) {
      // Remove old
      Object.keys(accMeshes).forEach(k => { if (!ids.includes(k)) removeAccessory(k); });
      // Add new
      ids.forEach(addAccessory);
    },
    cleanup() {
      running = false;
      disposables.forEach(d => d.dispose && d.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    },
    reactToInput(text) {
      // Mood detection for interactive mode (from dashboard.js lines 8-26)
      if (/help|how|what|\?/.test(text)) applyMoodToEyes('thoughtful');
      else if (/great|awesome|happy|love/.test(text)) applyMoodToEyes('happy');
      else if (/stress|anxious|worried/.test(text)) applyMoodToEyes('chill');
      else applyMoodToEyes(currentMood);
    }
  };
}
```

- [ ] **Step 3: Refactor dashboard.js initBuddy3D to use shared renderer**

In `js/dashboard.js`, replace the `initBuddy3D()` function (lines 28-235) to use the shared `createBuddy3D()`:

```js
function initBuddy3D(container) {
  if (_buddy3dCleanup) _buddy3dCleanup();
  const buddy = createBuddy3D(container, {
    color: STATE.avatar.color || '#E8634A',
    mood: STATE.avatar.mood || 'happy',
    accessories: STATE.avatar.accessories || [],
    interactive: true
  });
  if (!buddy) return;
  _buddy3dCleanup = buddy.cleanup;
  _buddy3dState = buddy;
}
```

Update `buddyReactToTyping()` (lines 8-26) to use `_buddy3dState.reactToInput(text)`.

- [ ] **Step 4: Update spawnConfetti colors in utils.js**

In `js/utils.js` `spawnConfetti()` function (lines 176-193), replace the dark-palette neon colors with warm palette:

```js
// Old: ['#7c6ff7','#ff6b9d','#4ecdc4','#ffd93d','#6bcb77']
// New:
const colors = ['#C8F031','#E8634A','#2A9D8F','#5A67D8','#D4941A','#C44569'];
```

- [ ] **Step 5: Verify dashboard 3D buddy still works**

Preview the dashboard. The 3D buddy should render identically. Typing in the chat input should trigger mood reactions.

- [ ] **Step 6: Commit**

```bash
git add js/utils.js js/dashboard.js
git commit -m "refactor: extract shared 3D buddy renderer, update dashboard to use it"
```

---

## Task 6: Rebuild Creator Screen

Replace the pixel art creator with the new 3D buddy customization system.

**Files:**
- Modify: `index.html:89-125` (creator screen markup)
- Rewrite: `css/creator.css` (76 lines → new layout)
- Rewrite: `js/creator.js` (148 lines → new logic)

- [ ] **Step 1: Replace creator HTML in index.html**

Replace `index.html` lines 89-125 (the `#creator` screen) with:

```html
<div id="creator" class="screen">
  <div class="creator-wrap">
    <h1 class="creator-title">Create Your Buddy</h1>
    <p class="creator-sub">pick a color, a mood, some flair, and a name.</p>

    <div id="creator-buddy-3d" class="creator-preview"></div>

    <div class="creator-section">
      <label class="creator-label">COLOR</label>
      <div id="color-swatches" class="color-swatches"></div>
    </div>

    <div class="creator-section">
      <label class="creator-label">MOOD</label>
      <div id="mood-picker" class="mood-picker"></div>
    </div>

    <div class="creator-section">
      <label class="creator-label">ACCESSORIES</label>
      <div id="accessory-grid" class="accessory-grid"></div>
    </div>

    <div class="creator-section">
      <label class="creator-label">NAME</label>
      <input id="buddy-name-input" class="creator-name-input" type="text" maxlength="20" placeholder="name your buddy">
    </div>

    <button class="btn btn-big creator-done" onclick="finishCreator()">That's my buddy!</button>
  </div>
</div>
```

- [ ] **Step 2: Rewrite css/creator.css**

Replace entire file with warm-themed creator styles:

```css
/* Creator Screen */
.creator-wrap {
  max-width: 480px;
  margin: 0 auto;
  padding: 40px 24px 100px;
}
.creator-title {
  font-family: 'Nunito', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: var(--text);
  text-align: center;
  margin: 0;
}
.creator-sub {
  color: var(--text-light);
  text-align: center;
  margin: 8px 0 24px;
  font-size: 0.95rem;
}
.creator-preview {
  width: 240px;
  height: 240px;
  margin: 0 auto 32px;
  border-radius: 24px;
  background: var(--surface-soft);
  overflow: hidden;
}
.creator-section {
  margin-bottom: 28px;
}
.creator-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-light);
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}
/* Color swatches */
.color-swatches {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.color-swatch:hover {
  transform: scale(1.1);
}
.color-swatch.selected {
  border-color: var(--text);
  box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--text);
}
/* Mood picker */
.mood-picker {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.mood-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.mood-card:hover {
  box-shadow: var(--shadow-sm);
}
.mood-card.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent);
}
.mood-card-name {
  font-weight: 700;
  color: var(--text);
  font-size: 0.95rem;
}
.mood-card-desc {
  color: var(--text-light);
  font-size: 0.8rem;
  margin-top: 4px;
}
/* Accessory grid */
.accessory-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.accessory-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-mid);
}
.accessory-btn:hover {
  box-shadow: var(--shadow-sm);
}
.accessory-btn.selected {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.accessory-btn .acc-icon {
  font-size: 1.4rem;
  display: block;
  margin-bottom: 4px;
}
/* Name input */
.creator-name-input {
  width: 100%;
  padding: 14px 18px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.creator-name-input:focus {
  border-color: var(--accent);
}
.creator-name-input::placeholder {
  color: var(--text-faint);
}
/* Done button */
.creator-done {
  width: 100%;
  margin-top: 12px;
}
```

- [ ] **Step 3: Rewrite js/creator.js**

Replace entire file. Remove all pixel art, color wheel, and uniqueness code. New implementation:

```js
// === Creator Screen ===
let _creatorBuddy = null;

function initCreator() {
  // Cleanup previous
  if (_creatorBuddy) { _creatorBuddy.cleanup(); _creatorBuddy = null; }

  // Init 3D preview
  const container = document.getElementById('creator-buddy-3d');
  container.innerHTML = '';
  _creatorBuddy = createBuddy3D(container, {
    color: STATE.avatar.color || '#E8634A',
    mood: STATE.avatar.mood || 'happy',
    accessories: STATE.avatar.accessories || [],
  });

  // Render color swatches
  const swatchContainer = document.getElementById('color-swatches');
  swatchContainer.innerHTML = BUDDY_COLORS.map(c =>
    `<div class="color-swatch ${STATE.avatar.color === c.hex ? 'selected' : ''}"
          style="background:${c.hex}" data-color="${c.hex}"
          title="${c.name}" onclick="pickColor('${c.hex}')"></div>`
  ).join('');

  // Render mood picker
  const moodContainer = document.getElementById('mood-picker');
  moodContainer.innerHTML = BUDDY_MOODS.map(m =>
    `<div class="mood-card ${STATE.avatar.mood === m.id ? 'selected' : ''}"
          data-mood="${m.id}" onclick="pickMood('${m.id}')">
      <div class="mood-card-name">${m.label}</div>
      <div class="mood-card-desc">${m.desc}</div>
    </div>`
  ).join('');

  // Render accessory grid
  const accContainer = document.getElementById('accessory-grid');
  accContainer.innerHTML = BUDDY_ACCESSORIES.map(a =>
    `<div class="accessory-btn ${(STATE.avatar.accessories||[]).includes(a.id) ? 'selected' : ''}"
          data-acc="${a.id}" onclick="toggleAccessory('${a.id}')">
      <span class="acc-icon">${a.icon}</span>
      ${a.label}
    </div>`
  ).join('');

  // Name input
  document.getElementById('buddy-name-input').value = STATE.avatar.name || '';
}

function pickColor(hex) {
  STATE.avatar.color = hex;
  if (_creatorBuddy) _creatorBuddy.setColor(hex);
  document.querySelectorAll('.color-swatch').forEach(s =>
    s.classList.toggle('selected', s.dataset.color === hex));
}

function pickMood(id) {
  STATE.avatar.mood = id;
  if (_creatorBuddy) _creatorBuddy.setMood(id);
  document.querySelectorAll('.mood-card').forEach(c =>
    c.classList.toggle('selected', c.dataset.mood === id));
}

function toggleAccessory(id) {
  const accs = STATE.avatar.accessories || [];
  const acc = BUDDY_ACCESSORIES.find(a => a.id === id);
  const idx = accs.indexOf(id);

  if (idx >= 0) {
    accs.splice(idx, 1);
  } else {
    // Hat/crown conflict: auto-deselect the other
    if (acc.group === 'head') {
      const conflict = accs.findIndex(a => {
        const other = BUDDY_ACCESSORIES.find(b => b.id === a);
        return other && other.group === 'head';
      });
      if (conflict >= 0) accs.splice(conflict, 1);
    }
    accs.push(id);
  }

  STATE.avatar.accessories = accs;
  if (_creatorBuddy) _creatorBuddy.setAccessories(accs);

  // Update button states
  document.querySelectorAll('.accessory-btn').forEach(b =>
    b.classList.toggle('selected', accs.includes(b.dataset.acc)));
}

function finishCreator() {
  STATE.avatar.name = document.getElementById('buddy-name-input').value.trim() || 'Buddy';
  saveState();
  if (_creatorBuddy) { _creatorBuddy.cleanup(); _creatorBuddy = null; }
  goTo('role-picker');
}
```

- [ ] **Step 4: Verify creator screen**

Preview: navigate to the creator. Should see warm cream background, 3D buddy preview, 8 color swatches, 4 mood cards, 6 accessory buttons, name input, and CTA button. Clicking swatches should update buddy color live. Selecting moods should change eye expression. Toggling accessories should add/remove 3D objects.

- [ ] **Step 5: Commit**

```bash
git add index.html css/creator.css js/creator.js
git commit -m "feat: rebuild buddy creator with 3D preview, color/mood/accessory pickers"
```

---

## Task 7: Restyle Interview Screen

Update the interview/onboarding chat to warm cream palette.

**Files:**
- Modify: `css/interview.css` (52 lines — full restyle)
- Modify: `index.html:141-155` (interview screen — minor markup tweaks if needed)

- [ ] **Step 1: Rewrite css/interview.css**

Replace entire file:

```css
/* Interview Screen */
.interview-header {
  padding: 16px 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}
.interview-header h3 {
  margin: 0;
  font-family: 'Nunito', sans-serif;
  color: var(--text);
  font-size: 1.1rem;
}
.interview-header small {
  color: var(--accent-dark);
  font-size: 0.8rem;
}
.interview-chat {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--bg);
}
.chat-msg {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  margin-bottom: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
}
.chat-msg.buddy {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
  align-self: flex-start;
}
.chat-msg.user {
  background: var(--accent);
  color: var(--text);
  border-bottom-right-radius: 4px;
  align-self: flex-end;
  margin-left: auto;
}
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  width: fit-content;
}
.typing-indicator span {
  width: 6px;
  height: 6px;
  background: var(--text-light);
  border-radius: 50%;
  animation: typingBounce 1.2s infinite;
}
.interview-input-bar {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: var(--surface);
  border-top: 1px solid var(--border);
}
.interview-input-bar input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 50px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  outline: none;
}
.interview-input-bar input:focus {
  border-color: var(--accent);
}
.interview-input-bar input::placeholder {
  color: var(--text-faint);
}
.interview-input-bar button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: var(--text);
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.interview-input-bar button:hover {
  background: var(--accent-dark);
}
```

- [ ] **Step 2: Verify interview screen**

Navigate through creator → role picker → interview. The chat should have warm cream background, white buddy bubbles, lime green user bubbles, lime green send button.

- [ ] **Step 3: Commit**

```bash
git add css/interview.css
git commit -m "style: restyle interview screen to warm cream palette"
```

---

## Task 8: Restyle Chat Screen & Update Role Picker Inline Styles

Update remaining dark-themed screens.

**Files:**
- Modify: `css/chat.css` (15 lines)
- Modify: `index.html:127-139` (role-picker inline styles)

- [ ] **Step 1: Update css/chat.css**

Replace with warm styling:

```css
/* Chat Screen */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg);
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.chat-header .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-soft);
}
.chat-header .name {
  font-weight: 700;
  color: var(--text);
}
.chat-header .status {
  font-size: 0.8rem;
  color: var(--accent-dark);
}
```

- [ ] **Step 2: Update ALL inline styles referencing removed tokens in index.html**

The following inline `style` attributes reference tokens being removed (`--text-dim`, `--accent3`). Replace each:

| Line | Old Token | New Token |
|------|-----------|-----------|
| 132 | `color:var(--text-dim)` | `color:var(--text-light)` |
| 135 | `color:var(--text-dim)` | `color:var(--text-light)` |
| 147 | `color:var(--accent3)` | `color:var(--accent-dark)` |
| 220 | `color:var(--accent3)` | `color:var(--accent-dark)` |
| 263 | `color:var(--text-dim)` | `color:var(--text-light)` |
| 264 | `color:var(--text-dim)` | `color:var(--text-light)` |
| 270 | `color:var(--text-dim)` | `color:var(--text-light)` |
| 275 | `color:var(--text-dim)` | `color:var(--text-light)` |

Also update role-picker container and text:
- Container background: use `var(--bg)`
- Title color: `var(--text)`
- Subtitle color: `var(--text-light)`
- Role grid and subrole section inherit warm styles from updated `base.css` `.role-card` and `.subrole-pill`

- [ ] **Step 3: Verify chat and role-picker**

Preview both screens. Role-picker should have warm cream background with white role cards. Chat should have warm header and background.

- [ ] **Step 4: Commit**

```bash
git add css/chat.css index.html
git commit -m "style: restyle chat screen and role-picker to warm cream"
```

---

## Task 9: Add Sign-Out Icon to Post-Onboarding Headers

Add a logout icon to the top-right of dashboard, chat, hangout, insights, life, and profile screens.

**Files:**
- Modify: `index.html` (add sign-out icon to headers of screens: dashboard lines 160-166, chat lines 198-200, hangout lines 215-217, insights lines 300-303, life lines 334-337, profile lines 246-248)
- Modify: `js/utils.js` or `js/dashboard.js` (add sign-out handler)
- Modify: `css/base.css` (add sign-out icon styles)

- [ ] **Step 1: Add sign-out icon styles to base.css**

Append to `css/base.css`:

```css
/* Sign-out icon */
.sign-out-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: var(--text-light);
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sign-out-btn:hover {
  color: var(--text);
}
.sign-out-btn svg {
  width: 20px;
  height: 20px;
}
```

- [ ] **Step 2: Add sign-out icon to dashboard header**

In `index.html`, in the dashboard top bar (around line 160-166), add the sign-out icon next to the settings gear:

```html
<button class="sign-out-btn" onclick="signOut()" title="Sign out">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
</button>
```

- [ ] **Step 3: Add sign-out icon to other screen headers**

Add the same sign-out button markup to the header/top-bar area of: chat, hangout, insights, life, profile screens. Place it in the top-right area of each screen's header.

- [ ] **Step 4: Add signOut() function**

In `js/utils.js`, add:

```js
function signOut() {
  if (confirm('Sign out? This will reset your buddy.')) {
    localStorage.removeItem('buddy-state');
    Object.assign(STATE, defaultState());
    location.reload();
  }
}
```

- [ ] **Step 5: Verify sign-out works**

Preview the dashboard. The sign-out icon should appear in the top-right. Clicking it should show a confirm dialog, then reload to the welcome screen.

- [ ] **Step 6: Commit**

```bash
git add index.html css/base.css js/utils.js
git commit -m "feat: add sign-out icon to post-onboarding screen headers"
```

---

## Task 10: Update Hangout Coworker Buddies

Switch hangout coworker buddies from pixel art to 3D blob renderings.

**Files:**
- Modify: `js/hangout.js:4-10` (update COWORKER_BUDDIES)
- Modify: `js/hangout.js:12-114` (update initHangout to use 3D rendering)
- Modify: `css/hangout.css` (update for 3D buddy containers)

- [ ] **Step 1: Update COWORKER_BUDDIES data**

In `js/hangout.js` lines 4-10, replace the shape-based definitions:

```js
const COWORKER_BUDDIES = [
  { name: 'Mochi', owner: 'Sarah',  color: '#2A9D8F', mood: 'chill',      accessories: ['bow'] },
  { name: 'Zap',   owner: 'Marcus', color: '#D4941A', mood: 'energetic',  accessories: ['glasses'] },
  { name: 'Whisper',owner:'Priya',  color: '#9B8FD4', mood: 'thoughtful', accessories: ['star'] },
  { name: 'Nox',   owner: 'James',  color: '#E8915C', mood: 'happy',      accessories: ['hat'] },
  { name: 'Clover',owner: 'Lin',    color: '#6B8E6B', mood: 'happy',      accessories: ['crown'] },
];
```

- [ ] **Step 2: Update initHangout to render 3D buddies**

In `js/hangout.js` `initHangout()`, where coworker avatars are rendered, replace the pixel art `renderAvatar()` calls with small `createBuddy3D()` containers. Each coworker gets a small (60x60) container with their color/mood/accessories.

**Performance note:** Running 5+ concurrent WebGL contexts can be heavy. Use `createBuddy3D()` with a `size: 0.5` option and lower pixel ratio. If performance is poor, fall back to rendering each buddy as a static snapshot (render once to canvas, export as image, destroy renderer). The `createBuddy3D` controller's cleanup should be called when leaving the hangout screen.

- [ ] **Step 3: Update css/hangout.css**

Add styles for the small 3D buddy containers in the hangout room:

```css
.hangout-buddy-3d {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
}
```

- [ ] **Step 4: Verify hangout screen**

Navigate to hangout. Coworker buddies should appear as small 3D blobs with their assigned colors and accessories.

- [ ] **Step 5: Commit**

```bash
git add js/hangout.js css/hangout.css
git commit -m "feat: update hangout coworker buddies to 3D blob style"
```

---

## Task 11: Final Cleanup & Verification

Remove any remaining dark-palette references and verify full app flow.

**Files:**
- Modify: Various files for cleanup

- [ ] **Step 1: Search for remaining dark palette hex values**

Search the codebase for any remaining references to old dark palette colors:
- `#0f0f1a` (dark bg)
- `#1a1a2e` (dark bg2)
- `#252540` (dark bg3)
- `#7c6ff7` (neon purple)
- `#ff6b9d` (hot pink)
- `#4ecdc4` (neon teal)

Replace or remove any found instances.

- [ ] **Step 2: Search for remaining `--warm-` prefixed token references**

Grep all CSS/JS files for `--warm-`. Replace any remaining references with un-prefixed versions.

- [ ] **Step 3: Full flow test**

Test the complete user journey:
1. Welcome screen → warm cream with hero gradient and 3D buddy
2. Click "get started" → creator screen
3. Pick color, mood, accessories, name → live 3D preview updates
4. Click "That's my buddy!" → role picker (warm cream cards)
5. Pick role and subrole → interview screen (warm chat bubbles)
6. Complete interview → dashboard (unchanged warm palette)
7. Check sign-out icon appears on dashboard, chat, hangout, insights, life, profile
8. Click sign-out → returns to welcome screen
9. Check hangout → coworker buddies are 3D blobs

- [ ] **Step 4: Check for console errors**

Open browser console during full flow. Should be zero errors.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup — remove remaining dark palette references"
```
