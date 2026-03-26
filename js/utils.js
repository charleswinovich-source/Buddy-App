// ════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
// SHARED 3D BUDDY RENDERER
// ════════════════════════════════════════════════════════
function createBuddy3D(container, options = {}) {
  if (!container || !window.THREE) return null;
  let { color = '#E8634A', mood = 'happy', accessories = [], size = 1, interactive = false } = options;
  const disposables = [];

  // ── Scene ──
  const w = container.clientWidth || 160;
  const h = container.clientHeight || 160;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 100);
  camera.position.set(0, 0.1, 3.8);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ── Lighting — soft, diffuse, no harsh specular ──
  scene.add(new THREE.AmbientLight(0xfff5e6, 0.8));
  const key = new THREE.DirectionalLight(0xfff0e0, 0.5);
  key.position.set(0, 3, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffe8d8, 0.25);
  fill.position.set(-3, 1, 2);
  scene.add(fill);

  // ── Body — soft inflated blob, rounded bottom like a water balloon ──
  const geo = new THREE.SphereGeometry(1 * size, 64, 48);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Rounded bottom — not flat, gently curved
    // Compress Y below -0.5 but keep curvature (not a hard cutoff)
    if (y < -0.5) {
      y = -0.5 + (y + 0.5) * 0.35; // softer compression = rounder bottom
    }

    // Subtle outward bulge at the lower-middle — water balloon resting
    const r = Math.sqrt(x * x + z * z);
    const bulgeZone = Math.max(0, 1 - Math.abs(y + 0.2) * 2); // centered around y=-0.2
    const bulge = 1 + bulgeZone * 0.06; // 6% outward bulge
    x *= bulge;
    z *= bulge;

    // Slightly wider than tall overall
    x *= 1.06;
    z *= 1.06;

    pos.setX(i, x);
    pos.setY(i, y);
    pos.setZ(i, z);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.75,
    metalness: 0,
  });
  const body = new THREE.Mesh(geo, mat);
  scene.add(body);
  disposables.push(geo, mat);

  // ── Eyes — 2D canvas texture on a plane ──
  const eyeRes = 256;
  const eyeCanvas = document.createElement('canvas');
  eyeCanvas.width = eyeRes;
  eyeCanvas.height = eyeRes;
  const eyeCtx = eyeCanvas.getContext('2d');
  const eyeTex = new THREE.CanvasTexture(eyeCanvas);

  function drawEyes() {
    const ctx = eyeCtx;
    const s = eyeRes;
    ctx.clearRect(0, 0, s, s);

    const cx = s / 2;
    const cy = s / 2; // centered vertically
    const spacing = 42; // wide apart
    const r = 20; // circular eyes

    [-1, 1].forEach(side => {
      const ex = cx + side * spacing;
      ctx.save();

      // Solid round eye
      ctx.beginPath();
      ctx.arc(ex, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a2e';
      ctx.fill();

      // Big bright highlight — top right, makes it look alive
      ctx.beginPath();
      ctx.arc(ex + side * 6, cy - 7, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fill();

      // Small secondary highlight
      ctx.beginPath();
      ctx.arc(ex - side * 4, cy + 5, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fill();

      ctx.restore();
    });

    eyeTex.needsUpdate = true;
  }

  drawEyes();

  const eyePlaneGeo = new THREE.PlaneGeometry(1.8 * size, 1.8 * size);
  const eyePlaneMat = new THREE.MeshBasicMaterial({
    map: eyeTex, transparent: true, depthWrite: false,
  });
  const eyePlane = new THREE.Mesh(eyePlaneGeo, eyePlaneMat);
  eyePlane.position.set(0, 0.15 * size, 1.02 * size);
  eyePlane.renderOrder = 1;
  body.add(eyePlane);
  disposables.push(eyePlaneGeo, eyePlaneMat, eyeTex);

  // ── Animation — floating + squash/stretch loop ──
  let time = 0;
  let running = true;

  // Animation — slow float with subtle squash/stretch
  // Period ~3.5 seconds (2π / 1.8 ≈ 3.5s)
  const floatSpeed = 1.8;
  const floatHeight = 0.08 * size; // gentle rise/fall
  const squashPct = 0.055; // ~5.5% compression

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    time += 0.016;

    const phase = time * floatSpeed;
    const sinVal = Math.sin(phase);

    // Smooth float
    body.position.y = sinVal * floatHeight;

    // Squash at bottom, stretch at top
    // sinVal: -1 = bottom (squash), +1 = top (stretch)
    const squashY = 1 + sinVal * squashPct;        // compress at bottom, stretch at top
    const squashXZ = 1 - sinVal * squashPct * 0.4;  // widen at bottom, narrow at top

    body.scale.set(squashXZ, squashY, squashXZ);

    renderer.render(scene, camera);
  }
  animate();

  // ── Controller (API for the rest of the app) ──
  return {
    setColor(hex) {
      color = hex;
      mat.color.set(hex);
    },
    setMood(id) { /* reserved for future expression changes */ },
    setAccessories(ids) { /* no accessories in clean design */ },
    bounce() { /* no-op in controlled animation */ },
    squish() { /* no-op in controlled animation */ },
    cleanup() {
      running = false;
      disposables.forEach(d => d.dispose && d.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    },
    reactToInput(text) { /* reserved for future eye reactions */ },
  };
}

// ════════════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════════════
function goTo(screenId) {
  if (typeof _buddy3dCleanup === 'function' && _buddy3dCleanup) {
    _buddy3dCleanup(); _buddy3dCleanup = null;
  }
  if (typeof closeBottomSheet === 'function') {
    try { closeBottomSheet(); } catch(e) {}
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const targetScreen = document.getElementById(screenId);
  if (!targetScreen) { console.warn('Screen not found:', screenId); return; }
  targetScreen.classList.add('active');

  // Update all bottom nav active states across all screens
  document.querySelectorAll('.dash-bottom-nav button').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));

  // Set active tab — find buttons by nav id pattern
  const mainScreens = ['dashboard', 'calendar', 'insights', 'life'];
  const navMap = { dashboard: 'nav-home', calendar: 'nav-calendar', insights: 'nav-insights', life: 'nav-life' };
  // Activate matching buttons across ALL navs
  document.querySelectorAll('.dash-bottom-nav button, .bottom-nav button').forEach(btn => {
    const match = mainScreens.find(s => {
      if (s === screenId) {
        const txt = btn.textContent.trim().toLowerCase();
        if (s === 'dashboard' && txt === 'buddy') return true;
        if (s === 'calendar' && txt === 'calendar') return true;
        if (s === 'insights' && txt === 'pulse') return true;
        if (s === 'life' && txt === 'life') return true;
      }
      return false;
    });
    if (match) btn.classList.add('active');
  });

  // Show/hide dashboard bottom nav
  const dashNav = document.getElementById('dash-bottom-nav');
  if (dashNav) dashNav.style.display = (screenId === 'dashboard') ? 'flex' : 'none';

  // Init screens
  if (screenId === 'creator') initCreator();
  if (screenId === 'role-picker') initRolePicker();
  if (screenId === 'dashboard') initDashboard();
  if (screenId === 'calendar' && typeof initCalendar === 'function') initCalendar();
  if (screenId === 'chat') initChat();
  if (screenId === 'hangout') initHangout();
  if (screenId === 'insights') initInsights();
  if (screenId === 'life') initLife();
}

// ════════════════════════════════════════════════════════
// CELEBRATION + CONFETTI
// ════════════════════════════════════════════════════════
function celebrate(title, text) {
  document.getElementById('celebration-title').textContent = title;
  document.getElementById('celebration-text').textContent = text;
  // Render buddy into celebration avatar container
  const celebAvatar = document.getElementById('celebration-avatar');
  if (celebAvatar) {
    celebAvatar.innerHTML = '';
    createBuddy3D(celebAvatar, { color: STATE.avatar.color || '#E8634A', mood: 'happy', accessories: STATE.avatar.accessories || [], size: 0.8 });
  }
  document.getElementById('celebration').classList.add('active');
  spawnConfetti();
}

function closeCelebration() {
  document.getElementById('celebration').classList.remove('active');
  document.getElementById('confetti').innerHTML = '';
}

function spawnConfetti() {
  const container = document.getElementById('confetti');
  container.innerHTML = '';
  const colors = ['#C8F031','#E8634A','#2A9D8F','#5A67D8','#D4941A','#C44569'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const size = 6 + Math.random() * 8;
    piece.style.cssText = `
      position:absolute; left:${left}%; top:-10px; width:${size}px; height:${size}px;
      background:${color}; border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      animation: confettiFall ${1.5 + Math.random()}s ease-in ${delay}s forwards;
    `;
    container.appendChild(piece);
  }
}

// ════════════════════════════════════════════════════════
// CHAT MESSAGES (shared)
// ════════════════════════════════════════════════════════
function addMessage(who, text, containerId, options = {}) {
  const msgs = document.getElementById(containerId);
  const div = document.createElement('div');
  div.className = `msg ${who}`;

  // Support markdown-lite: bold, code blocks, bullet points
  let safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  // Convert markdown tables to simple HTML
  safe = safe.replace(/\|(.+)\|/g, (m) => {
    const cells = m.split('|').filter(c => c.trim());
    if (cells.every(c => /^[\s-]+$/.test(c))) return ''; // separator row
    return '<tr>' + cells.map(c => `<td style="padding:4px 8px;border-bottom:1px solid var(--border);font-size:0.85rem;">${c.trim()}</td>`).join('') + '</tr>';
  });
  if (safe.includes('<tr>')) safe = `<table style="border-collapse:collapse;width:100%;margin:0.5rem 0;">${safe}</table>`;
  // Bold
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Inline code
  safe = safe.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.06);padding:2px 6px;border-radius:4px;font-size:0.85em;">$1</code>');
  // Line breaks
  safe = safe.replace(/\n/g, '<br>');

  div.innerHTML = safe;

  // Add data context badge if this is a data response
  if (options.dataContext) {
    const ctx = options.dataContext;
    const badge = document.createElement('div');
    badge.style.cssText = 'margin-top:0.5rem;';
    badge.innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:0.4rem;padding:4px 10px;border-radius:8px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.15);cursor:pointer;font-size:0.72rem;color:#3B82F6;font-weight:600;" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
        📊 powered by fivetran ai · ${ctx.stepsCount} steps · ${ctx.tables?.length || 0} tables
      </div>
      <div style="display:none;margin-top:0.5rem;padding:0.75rem;background:rgba(0,0,0,0.03);border-radius:8px;font-family:monospace;font-size:0.75rem;color:var(--text-mid);white-space:pre-wrap;overflow-x:auto;">${(ctx.sqlQuery || '').replace(/</g,'&lt;')}</div>`;
    div.appendChild(badge);
  }

  if (options.id) div.id = options.id;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function showTypingIndicator(containerId) {
  const msgs = document.getElementById(containerId);
  const div = document.createElement('div');
  div.className = 'msg buddy typing';
  div.id = 'typing-indicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function removeTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

function typeGreeting(el, text, speed) {
  speed = speed || 40;
  el.textContent = '';
  el.classList.add('typing-cursor');
  let i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(type, speed);
    } else {
      el.classList.remove('typing-cursor');
    }
  }
  type();
}

// ════════════════════════════════════════════════════════
// SIGN OUT
// ════════════════════════════════════════════════════════
function signOut() {
  if (confirm('Sign out? This will reset your buddy.')) {
    localStorage.removeItem('buddy-state');
    Object.assign(STATE, defaultState());
    location.reload();
  }
}

// ════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════
function init() {
  if (STATE.onboarded) {
    goTo('dashboard');
    initDashboard();

    // Proactive: show buddy message in chat after a brief delay
    setTimeout(() => {
      const proactive = getProactiveMessage();
      if (proactive && !STATE._lastProactiveDate) {
        STATE._lastProactiveDate = new Date().toDateString();
        STATE.chatHistory.push({ who: 'buddy', text: proactive });
        saveState();
      }
    }, 1000);
  } else {
    goTo('welcome');
    initWelcome();
  }
}
