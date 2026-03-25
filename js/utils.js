// ════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
// SHARED 3D BUDDY RENDERER
// ════════════════════════════════════════════════════════
function createBuddy3D(container, options = {}) {
  if (!container || !window.THREE) return null;
  const { color = '#E8634A', mood = 'happy', accessories = [], size = 1, interactive = false } = options;
  const disposables = [];

  // Scene setup
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

  // Lighting
  scene.add(new THREE.AmbientLight(0xfff5e6, 0.6));
  const dirLight = new THREE.DirectionalLight(0xfff8f0, 0.8);
  dirLight.position.set(-2, 3, 2);
  scene.add(dirLight);
  const rimLight = new THREE.DirectionalLight(0xC8F031, 0.2);
  rimLight.position.set(0, -1, -2);
  scene.add(rimLight);

  // Body — soft blob ghost shape with vertex deformation
  const bodyGeo = new THREE.SphereGeometry(1 * size, 48, 48);
  const positions = bodyGeo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    if (y < -0.3) positions.setY(i, -0.3 + (y + 0.3) * 0.3);
    if (y < -0.1) {
      const wave = Math.sin(Math.atan2(z, x) * 5) * 0.08 * Math.abs(y + 0.1);
      positions.setY(i, positions.getY(i) + wave);
    }
    const noise = Math.sin(x * 3 + y * 2) * 0.03 + Math.cos(z * 4 + y) * 0.02;
    positions.setX(i, x + noise);
    positions.setZ(i, z + noise);
  }
  bodyGeo.computeVertexNormals();
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color), roughness: 0.3, metalness: 0,
    clearcoat: 0.3, clearcoatRoughness: 0.2, transparent: true, opacity: 0.95
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  scene.add(body);
  disposables.push(bodyGeo, bodyMat);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.12, 24, 24);
  eyeGeo.scale(1, 1.2, 0.5);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2C2418 });
  disposables.push(eyeGeo, eyeMat);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.28 * size, 0.15, 0.85 * size);
  body.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.28 * size, 0.15, 0.85 * size);
  body.add(rightEye);

  // Blush
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

  // Mood system
  let currentAnimSpeed = 0.8, currentAnimAmp = 0.1;
  let currentMood = mood;

  function applyMoodToEyes(moodId) {
    const m = BUDDY_MOODS.find(m => m.id === moodId) || BUDDY_MOODS[0];
    leftEye.scale.set(1, 1, 1); rightEye.scale.set(1, 1, 1);
    leftEye.rotation.z = 0; rightEye.rotation.z = 0;
    if (m.eyes === 'curved-up') { leftEye.scale.y = 0.6; rightEye.scale.y = 0.6; }
    else if (m.eyes === 'half-closed') { leftEye.scale.y = 0.5; rightEye.scale.y = 0.5; }
    else if (m.eyes === 'wide') { leftEye.scale.set(1.2, 1.3, 1); rightEye.scale.set(1.2, 1.3, 1); }
    else if (m.eyes === 'squint') { leftEye.scale.y = 0.7; }
    currentAnimSpeed = m.animSpeed;
    currentAnimAmp = m.animAmp;
  }
  applyMoodToEyes(mood);

  // Accessories
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
      mesh.add(Object.assign(new THREE.Mesh(g, m), { position: new THREE.Vector3(0, 0.1*s, 0) }));
      mesh.add(new THREE.Mesh(brim, m));
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
      const lLens = new THREE.Mesh(ringGeo, gm); lLens.position.set(-0.28*s, 0.15, 0.95*s);
      const rLens = new THREE.Mesh(ringGeo, gm); rLens.position.set(0.28*s, 0.15, 0.95*s);
      const bg = new THREE.CylinderGeometry(0.015*s, 0.015*s, 0.2*s, 4);
      const bridge = new THREE.Mesh(bg, gm); bridge.rotation.z = Math.PI/2; bridge.position.set(0, 0.15, 0.95*s);
      mesh.add(lLens, rLens, bridge);
      disposables.push(ringGeo, gm, bg);
    } else if (id === 'bow') {
      const g = new THREE.SphereGeometry(0.1*s, 8, 8);
      const m = new THREE.MeshPhysicalMaterial({ color: 0xC44569, roughness: 0.4 });
      mesh = new THREE.Group();
      const center = new THREE.Mesh(g, m);
      const left = new THREE.Mesh(g, m); left.position.x = -0.12*s; left.scale.set(1.3, 0.8, 0.6);
      const right = new THREE.Mesh(g, m); right.position.x = 0.12*s; right.scale.set(1.3, 0.8, 0.6);
      mesh.add(center, left, right);
      mesh.position.set(0, -0.35*s, 0.7*s);
      disposables.push(g, m);
    } else if (id === 'star') {
      const g = new THREE.IcosahedronGeometry(0.12*s, 0);
      const m = new THREE.MeshPhysicalMaterial({ color: 0xD4941A, metalness: 0.4, roughness: 0.2 });
      mesh = new THREE.Mesh(g, m);
      mesh._orbit = true;
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

  // Animation loop
  let time = 0, running = true;
  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    time += 0.016;
    body.position.y = Math.sin(time * currentAnimSpeed) * currentAnimAmp;
    body.rotation.z = Math.sin(time * 0.5) * 0.03;
    body.scale.y = 1 + Math.sin(time * 1.2) * 0.02;
    body.scale.x = 1 - Math.sin(time * 1.2) * 0.01;
    if (accMeshes.star) {
      accMeshes.star.position.set(
        Math.sin(time * 1.5) * 1.4 * size,
        0.5 * size,
        Math.cos(time * 1.5) * 1.4 * size
      );
      accMeshes.star.rotation.y += 0.03;
    }
    renderer.render(scene, camera);
  }
  animate();

  // Controller
  return {
    setColor(hex) { bodyMat.color.set(hex); blushMat.color.set(hex); },
    setMood(id) { currentMood = id; applyMoodToEyes(id); },
    setAccessories(ids) {
      Object.keys(accMeshes).forEach(k => { if (!ids.includes(k)) removeAccessory(k); });
      ids.forEach(addAccessory);
    },
    cleanup() {
      running = false;
      disposables.forEach(d => d.dispose && d.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    },
    reactToInput(text) {
      if (/help|how|what|\?/.test(text)) applyMoodToEyes('thoughtful');
      else if (/great|awesome|happy|love/.test(text)) applyMoodToEyes('happy');
      else if (/stress|anxious|worried/.test(text)) applyMoodToEyes('chill');
      else applyMoodToEyes(currentMood);
    }
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
  document.getElementById(screenId).classList.add('active');

  // Update all bottom nav active states across all screens
  document.querySelectorAll('.dash-bottom-nav button').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));

  // Set active tab on the dashboard bottom nav
  if (screenId === 'dashboard') {
    document.getElementById('nav-home')?.classList.add('active');
  }
  if (screenId === 'insights') {
    document.getElementById('nav-insights')?.classList.add('active');
    document.getElementById('insights-nav-insights')?.classList.add('active');
  }
  if (screenId === 'life') {
    document.getElementById('nav-life')?.classList.add('active');
    document.getElementById('life-nav-life')?.classList.add('active');
  }
  if (screenId === 'profile') {
    document.getElementById('nav-profile')?.classList.add('active');
  }

  // Show/hide the dashboard bottom nav (only for dashboard screen)
  const dashNav = document.getElementById('dash-bottom-nav');
  if (dashNav) dashNav.style.display = (screenId === 'dashboard') ? 'flex' : 'none';

  // Show/hide legacy bottom nav for other screens
  const nav = document.getElementById('bottom-nav');
  if (nav) nav.classList.toggle('visible', screenId === 'chat' || screenId === 'hangout');

  // Init screens
  if (screenId === 'creator') initCreator();
  if (screenId === 'role-picker') initRolePicker();
  if (screenId === 'dashboard') initDashboard();
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
  // Support line breaks and bullet points — sanitize first
  const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  div.innerHTML = safe.replace(/\n/g, '<br>');
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
