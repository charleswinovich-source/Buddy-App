// === Creator Screen ===
let _creatorBuddy = null;

function initCreator() {
  if (_creatorBuddy) { _creatorBuddy.cleanup(); _creatorBuddy = null; }

  const container = document.getElementById('creator-buddy-3d');
  container.innerHTML = '';
  _creatorBuddy = createBuddy3D(container, {
    color: STATE.avatar.color || '#E8634A',
    mood: STATE.avatar.mood || 'happy',
    accessories: STATE.avatar.accessories || [],
  });

  const swatchContainer = document.getElementById('color-swatches');
  swatchContainer.innerHTML = BUDDY_COLORS.map(c =>
    `<div class="color-swatch ${STATE.avatar.color === c.hex ? 'selected' : ''}"
          style="background:${c.hex}" data-color="${c.hex}"
          title="${c.name}" onclick="pickColor('${c.hex}')"></div>`
  ).join('');

  const moodContainer = document.getElementById('mood-picker');
  moodContainer.innerHTML = BUDDY_MOODS.map(m =>
    `<div class="mood-card ${STATE.avatar.mood === m.id ? 'selected' : ''}"
          data-mood="${m.id}" onclick="pickMood('${m.id}')">
      <div class="mood-card-name">${m.label}</div>
      <div class="mood-card-desc">${m.desc}</div>
    </div>`
  ).join('');

  const accContainer = document.getElementById('accessory-grid');
  accContainer.innerHTML = BUDDY_ACCESSORIES.map(a =>
    `<div class="accessory-btn ${(STATE.avatar.accessories||[]).includes(a.id) ? 'selected' : ''}"
          data-acc="${a.id}" onclick="toggleAccessory('${a.id}')">
      <span class="acc-icon">${a.icon}</span>
      ${a.label}
    </div>`
  ).join('');

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

  document.querySelectorAll('.accessory-btn').forEach(b =>
    b.classList.toggle('selected', accs.includes(b.dataset.acc)));
}

function finishCreator() {
  STATE.avatar.name = document.getElementById('buddy-name-input').value.trim() || 'Buddy';
  saveState();
  if (_creatorBuddy) { _creatorBuddy.cleanup(); _creatorBuddy = null; }
  goTo('role-picker');
}
