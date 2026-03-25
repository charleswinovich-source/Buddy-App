// ════════════════════════════════════════════════════════
// HANGOUT — Social Avatar Interaction
// ════════════════════════════════════════════════════════
const COWORKER_BUDDIES = [
  { name: 'Mochi', owner: 'Sarah',  color: '#2A9D8F', mood: 'chill',      accessories: ['bow'] },
  { name: 'Zap',   owner: 'Marcus', color: '#D4941A', mood: 'energetic',  accessories: ['glasses'] },
  { name: 'Whisper',owner:'Priya',  color: '#9B8FD4', mood: 'thoughtful', accessories: ['star'] },
  { name: 'Nox',   owner: 'James',  color: '#E8915C', mood: 'happy',      accessories: ['hat'] },
  { name: 'Clover',owner: 'Lin',    color: '#6B8E6B', mood: 'happy',      accessories: ['crown'] },
];

function initHangout() {
  const room = document.getElementById('hangout-room');
  const feed = document.getElementById('hangout-feed');

  // Draw the room background (a cozy scene)
  room.innerHTML = `
    <canvas id="hangout-bg" width="800" height="320" style="position:absolute;inset:0;width:100%;height:100%;"></canvas>
    <div class="hangout-avatars" id="hangout-avatars"></div>
  `;

  // Draw cozy room background
  const canvas = document.getElementById('hangout-bg');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  // Gradient floor
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#FDF6EE');
  grad.addColorStop(0.6, '#FDF6EE');
  grad.addColorStop(1, '#F5EBD8');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  // Floor line
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, h * 0.7); ctx.lineTo(w, h * 0.7); ctx.stroke();
  // Some ambient dots
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h * 0.65, 1 + Math.random(), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232,99,74,${0.08 + Math.random() * 0.12})`;
    ctx.fill();
  }

  // Place avatars in the room
  const avatarsDiv = document.getElementById('hangout-avatars');
  avatarsDiv.innerHTML = '';

  // Your buddy first
  const yourSlot = document.createElement('div');
  yourSlot.className = 'hangout-avatar-slot';
  const yourBuddyContainer = document.createElement('div');
  yourBuddyContainer.className = 'hangout-buddy-3d';
  yourBuddyContainer.style.width = '60px';
  yourBuddyContainer.style.height = '60px';
  createBuddy3D(yourBuddyContainer, {
    color: STATE.avatar.color || '#E8634A',
    mood: STATE.avatar.mood || 'happy',
    accessories: STATE.avatar.accessories || [],
    size: 0.9
  });
  yourSlot.appendChild(yourBuddyContainer);
  const yourLabel = document.createElement('span');
  yourLabel.className = 'avatar-name-tag';
  yourLabel.style.color = 'var(--accent)';
  yourLabel.textContent = `${STATE.avatar.name} (You)`;
  yourSlot.appendChild(yourLabel);
  avatarsDiv.appendChild(yourSlot);

  // Coworker buddies
  COWORKER_BUDDIES.forEach(coworker => {
    const slot = document.createElement('div');
    slot.className = 'hangout-avatar-slot';
    const buddyContainer = document.createElement('div');
    buddyContainer.className = 'hangout-buddy-3d';
    buddyContainer.style.width = '60px';
    buddyContainer.style.height = '60px';
    const buddy3d = createBuddy3D(buddyContainer, {
      color: coworker.color,
      mood: coworker.mood,
      accessories: coworker.accessories,
      size: 0.8
    });
    slot.appendChild(buddyContainer);
    const label = document.createElement('span');
    label.className = 'avatar-name-tag';
    label.textContent = coworker.name;
    slot.appendChild(label);
    slot.onclick = () => showBuddyInteraction(coworker);
    avatarsDiv.appendChild(slot);
  });

  // Activity feed
  feed.innerHTML = '';
  feed.innerHTML += `<div class="hangout-section-label">Activity Feed</div>`;
  const events = generateHangoutEvents();
  events.forEach(ev => {
    const div = document.createElement('div');
    div.className = 'hangout-event';
    div.innerHTML = `
      <div class="event-avatar" style="width:32px;height:32px;"></div>
      <div>
        <div class="event-text">${ev.text}</div>
        <div class="event-time">${ev.time}</div>
      </div>
    `;
    feed.appendChild(div);
    // Render mini avatar
    const avEl = div.querySelector('.event-avatar');
    if (ev.buddy) {
      createBuddy3D(avEl, {
        color: ev.buddy.color || '#E8634A',
        mood: ev.buddy.mood || 'happy',
        accessories: ev.buddy.accessories || [],
        size: 0.5
      });
    }
  });

  // Meeting notes section
  feed.innerHTML += `
    <div class="hangout-section-label">Upcoming Meetings</div>
    <div class="dash-card" style="margin-top:0.5rem;">
      <h3 style="font-size:0.95rem;"><span class="meeting-badge">Live</span> &nbsp;Sprint Standup</h3>
      <p style="font-size:0.85rem;color:var(--text-light);margin-top:0.5rem;">
        ${STATE.avatar.name}, Mochi, and Zap are attending.
        ${STATE.avatar.name} is taking notes for you.
      </p>
      <div style="margin-top:0.75rem;display:flex;gap:0.5rem;">
        <button class="btn btn-outline btn-sm" onclick="showMeetingNotes()">View Notes</button>
        <button class="btn btn-outline btn-sm" onclick="sendBuddyToMeeting()">Send ${STATE.avatar.name}</button>
      </div>
    </div>
    <div class="dash-card" style="margin-top:0.75rem;">
      <h3 style="font-size:0.95rem;">1:1 with Manager — 2:00 PM</h3>
      <p style="font-size:0.85rem;color:var(--text-light);margin-top:0.5rem;">
        ${STATE.avatar.name} and Nox will be there. Want ${STATE.avatar.name} to prep talking points?
      </p>
      <div style="margin-top:0.75rem;">
        <button class="btn btn-outline btn-sm" onclick="prepMeeting()">Prep Talking Points</button>
      </div>
    </div>
  `;
  feed.innerHTML += '<div style="height:5rem"></div>';
}

function generateHangoutEvents() {
  const buddyName = STATE.avatar.name;
  const events = [
    { buddy: COWORKER_BUDDIES[0], text: `<strong>Mochi</strong> waved at <strong>${buddyName}</strong>! They're doing a little dance together.`, time: '2 min ago' },
    { buddy: COWORKER_BUDDIES[1], text: `<strong>Zap</strong> shared meeting notes from the morning standup with everyone.`, time: '15 min ago' },
    { buddy: COWORKER_BUDDIES[2], text: `<strong>Whisper</strong> is feeling thoughtful today. Priya's been in deep work mode.`, time: '32 min ago' },
    { buddy: STATE.avatar, text: `<strong>${buddyName}</strong> leveled up! The whole hangout celebrated.`, time: '1 hr ago' },
    { buddy: COWORKER_BUDDIES[3], text: `<strong>Nox</strong> and <strong>Clover</strong> had a chat about the Q2 roadmap while James and Lin were in a meeting.`, time: '2 hr ago' },
    { buddy: COWORKER_BUDDIES[4], text: `<strong>Clover</strong> brought virtual snacks for everyone. Morale +10!`, time: '3 hr ago' },
  ];
  return events;
}

function showBuddyInteraction(buddy) {
  const buddyName = STATE.avatar.name;
  const interactions = [
    `${buddyName} walked over to ${buddy.name} and they did a little high five!`,
    `${buddyName} and ${buddy.name} are chatting about ${buddy.owner}'s latest project.`,
    `${buddy.name} showed ${buddyName} something funny. They're both giggling.`,
    `${buddyName} is sharing your meeting notes with ${buddy.name} so ${buddy.owner} stays in the loop.`,
  ];
  const msg = interactions[Math.floor(Math.random() * interactions.length)];
  alert(`${buddy.name} (${buddy.owner}'s buddy)\n\n${msg}`);
}

function showMeetingNotes() {
  const buddyName = STATE.avatar.name;
  alert(`${buddyName}'s Meeting Notes — Sprint Standup\n\n` +
    `- Team discussed blockers on the auth migration\n` +
    `- Sarah's Mochi flagged a dependency conflict in staging\n` +
    `- Marcus committed to finishing the API docs by Thursday\n` +
    `- Action item for you: review the PR #247 before EOD\n\n` +
    `${buddyName} says: "I got you covered. The important stuff is highlighted."`);
}

function sendBuddyToMeeting() {
  alert(`${STATE.avatar.name} is heading to the standup!\n\n"I'll take notes and let you know if anything important comes up. Go focus on your work!"`);
  gainXP(15);
  saveState();
}

function prepMeeting() {
  const goals = STATE.profile.goals || 'your current projects';
  alert(`${STATE.avatar.name}'s Talking Points for 1:1:\n\n` +
    `1. Progress update on: ${goals}\n` +
    `2. Blockers to discuss\n` +
    `3. Feedback on recent work\n` +
    `4. Career growth — skills you mentioned wanting to build: ${STATE.profile.skills || 'general growth'}\n\n` +
    `${STATE.avatar.name} says: "You got this. I believe in you!"`);
  gainXP(10);
  saveState();
}
