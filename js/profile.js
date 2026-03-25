// ════════════════════════════════════════════════════════
// PROFILE
// ════════════════════════════════════════════════════════
function showProfile() {
  goTo('profile');
  const profileAvatarEl = document.getElementById('profile-avatar');
  profileAvatarEl.innerHTML = '';
  createBuddy3D(profileAvatarEl, { color: STATE.avatar.color || '#E8634A', mood: STATE.avatar.mood || 'happy', accessories: STATE.avatar.accessories || [], size: 1.2 });
  document.getElementById('profile-buddy-name').textContent = STATE.avatar.name;

  const p = STATE.profile;
  const items = [
    { label: 'Your Name', value: p.userName },
    { label: 'City', value: p.city },
    { label: 'Morning Style', value: p.morning },
    { label: 'Interests', value: p.interests },
    { label: 'Role', value: p.role },
    { label: 'Tools', value: p.systems },
    { label: 'Skills Building', value: p.skills },
    { label: 'Goals', value: p.goals },
    { label: 'Level', value: `Level ${STATE.level}` },
    { label: 'XP', value: `${STATE.xp} / ${STATE.level * 100}` },
    { label: 'Streak', value: `${STATE.streak} day${STATE.streak !== 1 ? 's' : ''}` },
    { label: 'Interaction', value: p.interactionLevel },
  ].filter(i => i.value);

  document.getElementById('profile-details').innerHTML = items.map(i =>
    `<div style="display:flex;justify-content:space-between;padding:0.75rem 1rem;background:var(--surface);border-radius:12px;">
      <span style="color:var(--text-light);font-size:0.85rem;">${i.label}</span>
      <span style="font-weight:600;font-size:0.9rem;text-align:right;max-width:60%;">${i.value}</span>
    </div>`
  ).join('');

  // ── Integrations grid ──
  const integrations = [
    { id: 'whoop', name: 'Whoop', icon: '⌚', desc: 'sleep, recovery, strain', mockData: { connected: true, sleep: '6h 20m', recovery: 72, strain: 8.4 } },
    { id: 'oura', name: 'Oura', icon: '💍', desc: 'readiness, sleep, HRV', mockData: { connected: true, readiness: 85, sleep: '7h 10m', hrv: 42 } },
    { id: 'appleHealth', name: 'Apple Health', icon: '🍎', desc: 'steps, calories, activity', mockData: { connected: true, steps: 8420, activeEnergy: 340 } },
    { id: 'functionHealth', name: 'Function Health', icon: '🧬', desc: 'blood panels, biomarkers', mockData: { connected: true, lastPanel: '2026-02-15', flagged: ['vitamin D low'] } },
    { id: 'garmin', name: 'Garmin', icon: '📡', desc: 'activity, GPS, heart rate', mockData: { connected: true, steps: 9200 } },
    { id: 'fitbit', name: 'Fitbit', icon: '📱', desc: 'steps, sleep, heart rate', mockData: { connected: true, steps: 7800 } },
    { id: 'spotify', name: 'Spotify', icon: '🎵', desc: 'what you\'re listening to', mockData: { connected: true, recentTrack: 'Daft Punk - Something About Us', mood: 'chill' } },
    { id: 'strava', name: 'Strava', icon: '🏃', desc: 'runs, rides, workouts', mockData: { connected: true, lastRun: '3.2mi', pace: '8:20/mi' } },
    { id: 'googleCalendar', name: 'Google Calendar', icon: '📅', desc: 'meetings, schedule, prep', mockData: { connected: true } },
    { id: 'gmail', name: 'Gmail', icon: '📧', desc: 'email digest, triage', mockData: { connected: true } },
    { id: 'gdrive', name: 'Google Drive', icon: '📁', desc: 'docs, sheets, meeting prep', mockData: { connected: true } },
    { id: 'slack', name: 'Slack', icon: '💬', desc: 'messages, mentions, threads', mockData: { connected: true } },
  ];

  const integ = STATE.integrations || {};
  document.getElementById('profile-integrations').innerHTML = integrations.map(ig => {
    const connected = integ[ig.id]?.connected;
    return `<button onclick="toggleIntegration('${ig.id}')" style="
      display:flex;align-items:center;gap:0.6rem;padding:0.75rem 1rem;
      background:${connected ? 'rgba(76,175,80,0.12)' : 'var(--surface)'};
      border:1.5px solid ${connected ? '#4caf50' : 'transparent'};
      border-radius:12px;cursor:pointer;text-align:left;color:var(--text);
      transition:all 0.2s;">
      <span style="font-size:1.3rem;">${ig.icon}</span>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:0.85rem;">${ig.name}</div>
        <div style="font-size:0.7rem;color:var(--text-light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${connected ? 'connected' : ig.desc}</div>
      </div>
      <span style="font-size:0.7rem;color:${connected ? '#4caf50' : 'var(--accent)'};font-weight:600;">${connected ? '✓' : 'connect'}</span>
    </button>`;
  }).join('');

  // ── Autopilot settings ──
  const ap = STATE.autopilot || {};
  const autopilotEl = document.getElementById('profile-autopilot');
  if (autopilotEl) {
    autopilotEl.innerHTML = [
      { id: 'postCallFill', label: 'Post-call auto-fill', desc: 'fill salesforce fields from gong transcripts', value: ap.postCallFill },
      { id: 'autoCreateOpp', label: 'Auto-create expansion opp', desc: 'create new opp if none exists for the account', value: ap.autoCreateOpp },
    ].map(s => `
      <button onclick="toggleAutopilot('${s.id}')" style="
        display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;
        background:${s.value ? 'rgba(76,175,80,0.12)' : 'var(--surface)'};
        border:1.5px solid ${s.value ? '#4caf50' : 'transparent'};
        border-radius:12px;cursor:pointer;text-align:left;color:var(--text);
        transition:all 0.2s;">
        <div style="width:36px;height:20px;border-radius:10px;background:${s.value ? '#4caf50' : '#ccc'};position:relative;transition:background 0.2s;">
          <div style="width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:2px;${s.value ? 'right:2px' : 'left:2px'};transition:all 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.2);"></div>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:0.85rem;">${s.label}</div>
          <div style="font-size:0.7rem;color:var(--text-light);">${s.desc}</div>
        </div>
      </button>
    `).join('') + `
      <div style="padding:0.75rem 1rem;background:var(--surface);border-radius:12px;">
        <div style="font-weight:700;font-size:0.85rem;margin-bottom:0.5rem;">default product</div>
        <select onchange="setAutopilotProduct(this.value)" style="
          width:100%;padding:0.5rem;border-radius:8px;border:1px solid var(--border);
          background:var(--bg1);color:var(--text);font-size:0.85rem;">
          ${['Fivetran Saas', 'HVR', 'Hybrid', 'Census'].map(p =>
            `<option value="${p}" ${ap.defaultProduct === p ? 'selected' : ''}>${p}</option>`
          ).join('')}
        </select>
      </div>
    `;
  }

  // ── Privacy / Meeting Intelligence settings ──
  if (!STATE.privacy) STATE.privacy = { externalMeetingPrep: true, internalChannelContext: false, internalDMContext: false, postMeetingTranscript: false, postMeetingActionItems: false, sharedContextPeople: [] };
  const priv = STATE.privacy;
  const privacyEl = document.getElementById('profile-privacy');
  if (privacyEl) {
    privacyEl.innerHTML = [
      { id: 'externalMeetingPrep', label: 'External meeting prep', desc: 'pull Gong, Salesforce, Zendesk context before customer calls', value: priv.externalMeetingPrep, locked: true },
      { id: 'internalChannelContext', label: 'Public channel context', desc: 'read public Slack channels to prep for internal meetings', value: priv.internalChannelContext },
      { id: 'postMeetingTranscript', label: 'Post-meeting summaries', desc: 'pull Google Meet transcripts and create summaries', value: priv.postMeetingTranscript },
      { id: 'postMeetingActionItems', label: 'Extract action items', desc: 'find commitments from meeting transcripts and add to your tasks', value: priv.postMeetingActionItems },
    ].map(s => `
      <button onclick="${s.locked ? '' : `togglePrivacy('${s.id}')`}" style="
        display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;
        background:${s.value ? 'rgba(16,185,129,0.1)' : 'var(--surface)'};
        border:1.5px solid ${s.value ? '#10B981' : 'transparent'};
        border-radius:12px;cursor:${s.locked ? 'default' : 'pointer'};text-align:left;color:var(--text);
        transition:all 0.2s;${s.locked ? 'opacity:0.7;' : ''}">
        <div style="width:36px;height:20px;border-radius:10px;background:${s.value ? '#10B981' : '#ccc'};position:relative;transition:background 0.2s;">
          <div style="width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:2px;${s.value ? 'right:2px' : 'left:2px'};transition:all 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.2);"></div>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:0.85rem;">${s.label}${s.locked ? ' <span style="font-size:0.65rem;color:#10B981;font-weight:600;">ALWAYS ON</span>' : ''}</div>
          <div style="font-size:0.7rem;color:var(--text-light);">${s.desc}</div>
        </div>
      </button>
    `).join('');
  }

  // ── Shared context people ──
  const sharedEl = document.getElementById('profile-shared-context');
  if (sharedEl) {
    const people = priv.sharedContextPeople || [];
    if (people.length === 0) {
      sharedEl.innerHTML = '<div style="font-size:0.8rem;color:var(--text-faint);padding:0.5rem 0;">no one yet. invite coworkers you meet with regularly.</div>';
    } else {
      sharedEl.innerHTML = people.map((p, i) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0.75rem;background:var(--surface);border-radius:10px;">
          <div>
            <div style="font-weight:600;font-size:0.85rem;">${p.name || p.email}</div>
            <div style="font-size:0.7rem;color:${p.accepted ? '#10B981' : '#ffa726'};">${p.accepted ? '✓ mutual' : '⏳ pending their approval'}</div>
          </div>
          <button onclick="removeSharedContextPerson(${i})" style="background:none;border:none;color:var(--text-light);cursor:pointer;font-size:0.8rem;">remove</button>
        </div>
      `).join('');
    }
  }

  // ── Memories ──
  const memories = STATE.personal?.memories || [];
  const personalFields = STATE.personal || {};
  const personalItems = [
    personalFields.pets && { label: 'pets', value: personalFields.pets },
    personalFields.food && { label: 'food', value: personalFields.food },
    personalFields.coffeeOrder && { label: 'coffee', value: personalFields.coffeeOrder },
    personalFields.music && { label: 'music', value: personalFields.music },
    personalFields.shows && { label: 'shows', value: personalFields.shows },
    personalFields.dreamVacation && { label: 'dream trip', value: personalFields.dreamVacation },
  ].filter(Boolean);

  const allMemories = [
    ...personalItems.map(m => `<div style="padding:0.6rem 1rem;background:var(--surface);border-radius:10px;font-size:0.85rem;"><span style="color:var(--accent);font-weight:600;">${m.label}:</span> ${m.value}</div>`),
    ...memories.map(m => `<div style="padding:0.6rem 1rem;background:var(--surface);border-radius:10px;font-size:0.85rem;"><span style="color:var(--text-light);font-size:0.7rem;">${m.date}</span> ${m.text}</div>`),
  ];

  document.getElementById('profile-memories').innerHTML = allMemories.length
    ? allMemories.join('')
    : `<div style="color:var(--text-light);font-size:0.85rem;font-style:italic;">nothing yet. tell me things in chat and i'll remember them. try "remember my dog's name is Luna" or "my coffee order is oat milk latte".</div>`;
}

function toggleIntegration(id) {
  if (!STATE.integrations) STATE.integrations = {};
  const integrations = {
    whoop: { connected: true, sleep: '6h 20m', recovery: 72, strain: 8.4 },
    oura: { connected: true, readiness: 85, sleep: '7h 10m', hrv: 42 },
    appleHealth: { connected: true, steps: 8420, activeEnergy: 340 },
    functionHealth: { connected: true, lastPanel: '2026-02-15', flagged: ['vitamin D low'] },
    garmin: { connected: true, steps: 9200 },
    fitbit: { connected: true, steps: 7800 },
    spotify: { connected: true, recentTrack: 'Daft Punk - Something About Us', mood: 'chill' },
    strava: { connected: true, lastRun: '3.2mi', pace: '8:20/mi' },
    googleCalendar: { connected: true },
    gmail: { connected: true },
    gdrive: { connected: true },
    slack: { connected: true },
  };
  if (STATE.integrations[id]?.connected) {
    STATE.integrations[id] = null;
  } else {
    STATE.integrations[id] = integrations[id];
  }
  saveState();
  showProfile(); // re-render
}

function toggleAutopilot(id) {
  if (!STATE.autopilot) STATE.autopilot = { postCallFill: false, autoCreateOpp: false, defaultProduct: 'Fivetran Saas' };
  STATE.autopilot[id] = !STATE.autopilot[id];
  saveState();
  showProfile();
}

function setAutopilotProduct(value) {
  if (!STATE.autopilot) STATE.autopilot = { postCallFill: false, autoCreateOpp: false, defaultProduct: 'Fivetran Saas' };
  STATE.autopilot.defaultProduct = value;
  saveState();
}

function togglePrivacy(id) {
  if (!STATE.privacy) STATE.privacy = { externalMeetingPrep: true, internalChannelContext: false, internalDMContext: false, postMeetingTranscript: false, postMeetingActionItems: false, sharedContextPeople: [] };
  STATE.privacy[id] = !STATE.privacy[id];

  // If enabling action items, also enable transcripts (dependency)
  if (id === 'postMeetingActionItems' && STATE.privacy[id]) {
    STATE.privacy.postMeetingTranscript = true;
  }
  // If disabling transcripts, also disable action items
  if (id === 'postMeetingTranscript' && !STATE.privacy[id]) {
    STATE.privacy.postMeetingActionItems = false;
  }

  saveState();
  showProfile();
}

function addSharedContextPerson() {
  const email = prompt('Enter their @fivetran.com email:');
  if (!email || !email.includes('@fivetran.com')) {
    if (email) alert('Must be a @fivetran.com email');
    return;
  }
  if (!STATE.privacy) STATE.privacy = { externalMeetingPrep: true, internalChannelContext: false, internalDMContext: false, postMeetingTranscript: false, postMeetingActionItems: false, sharedContextPeople: [] };
  if (!STATE.privacy.sharedContextPeople) STATE.privacy.sharedContextPeople = [];

  // Check for duplicates
  if (STATE.privacy.sharedContextPeople.some(p => p.email === email)) {
    alert('Already added');
    return;
  }

  STATE.privacy.sharedContextPeople.push({
    email,
    name: email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    accepted: false,
    invitedAt: new Date().toISOString(),
  });

  // TODO: Send notification to the other person via Slack
  // For now just save locally
  saveState();
  showProfile();
}

function removeSharedContextPerson(index) {
  if (!STATE.privacy?.sharedContextPeople) return;
  STATE.privacy.sharedContextPeople.splice(index, 1);
  saveState();
  showProfile();
}

// ════════════════════════════════════════════════════════
// ONGOING DAILY QUESTIONS — learns more about you every day
// ════════════════════════════════════════════════════════
const DAILY_QUESTIONS = [
  { id: 'pets', q: (n) => `hey ${n}, random one — do you have any pets?`, field: 'pets', minLength: 2 },
  { id: 'coffee', q: (n) => `what's your go-to morning drink? coffee, tea, something else?`, field: 'coffeeOrder', minLength: 2 },
  { id: 'food', q: (n) => `what kind of food are you into? like if you could eat one thing forever.`, field: 'food', minLength: 2 },
  { id: 'music', q: (n) => `what kind of music do you listen to? or who are you into right now?`, field: 'music', minLength: 2 },
  { id: 'shows', q: (n) => `watching anything good lately? shows, movies, youtube — whatever.`, field: 'shows', minLength: 2 },
  { id: 'sports', q: (n) => `are you into sports? playing or watching — either counts.`, field: 'sports', minLength: 2 },
  { id: 'vacation', q: (n) => `if you could go anywhere tomorrow, where would you go?`, field: 'dreamVacation', minLength: 2 },
  { id: 'motto', q: (n) => `do you have a motto or something you remind yourself of when things get hard?`, field: 'motto', minLength: 3 },
  { id: 'favoritePlace', q: (n) => `what's your favorite place in the world? somewhere that just feels right.`, field: 'favoritePlace', minLength: 2 },
  // Retry variants
  { id: 'pets_retry', q: (n) => `so — cat person, dog person, or neither?`, field: 'pets', minLength: 2, retryOf: 'pets' },
  { id: 'music_retry', q: (n) => `what was the last song you had on repeat?`, field: 'music', minLength: 2, retryOf: 'music' },
  { id: 'food_retry', q: (n) => `what did you eat for dinner last night? just curious.`, field: 'food', minLength: 2, retryOf: 'food' },
  { id: 'shows_retry', q: (n) => `anyone recommend a show to you recently? i'm always looking for recs.`, field: 'shows', minLength: 2, retryOf: 'shows' },
];

function getNextDailyQuestion() {
  if (!STATE.personal) STATE.personal = { memories: [] };
  if (!STATE.personal._askedQuestions) STATE.personal._askedQuestions = {};
  if (!STATE.personal._skippedQuestions) STATE.personal._skippedQuestions = {};

  const name = STATE.profile.userName || 'friend';
  const today = new Date().toDateString();
  const personal = STATE.personal;

  // Don't ask if already asked today
  if (personal._lastQuestionDate === today) return null;

  // Find unanswered questions (field is empty/missing)
  for (const dq of DAILY_QUESTIONS) {
    if (dq.retryOf) continue; // skip retries in first pass
    const value = personal[dq.field];
    if (value && value.length >= dq.minLength) continue; // already answered well

    // Check if we asked this and got a bs answer — try the retry variant
    if (personal._skippedQuestions[dq.id]) {
      const retry = DAILY_QUESTIONS.find(r => r.retryOf === dq.id);
      if (retry && !personal._askedQuestions[retry.id]) {
        personal._askedQuestions[retry.id] = today;
        personal._lastQuestionDate = today;
        personal._pendingQuestion = retry;
        saveState();
        return retry.q(name);
      }
      continue; // exhausted retries for this question
    }

    // Haven't asked this yet
    if (!personal._askedQuestions[dq.id]) {
      personal._askedQuestions[dq.id] = today;
      personal._lastQuestionDate = today;
      personal._pendingQuestion = dq;
      saveState();
      return dq.q(name);
    }
  }
  return null;
}

function handleDailyQuestionResponse(text) {
  const pending = STATE.personal?._pendingQuestion;
  if (!pending) return false;

  if (text.trim().length < (pending.minLength || 2) ||
      ['idk', 'no', 'nah', 'nope', 'pass', 'skip', 'whatever', 'meh', 'n/a'].includes(text.trim().toLowerCase())) {
    // BS answer — mark as skipped so we retry later
    if (!STATE.personal._skippedQuestions) STATE.personal._skippedQuestions = {};
    STATE.personal._skippedQuestions[pending.retryOf || pending.id] = true;
    STATE.personal._pendingQuestion = null;
    saveState();
    return 'all good, no pressure.';
  }

  // Good answer — store it
  STATE.personal[pending.field] = text.trim();
  STATE.personal._pendingQuestion = null;
  saveState();
  return null; // let the normal response handler take it
}

// ════════════════════════════════════════════════════════
// PROACTIVE BUDDY MESSAGES
// ════════════════════════════════════════════════════════
function getProactiveMessage() {
  const name = STATE.profile.userName || 'friend';
  const hour = new Date().getHours();
  const integ = STATE.integrations || {};
  const messages = [];

  // Morning greeting with health + calendar
  if (hour >= 7 && hour < 10) {
    let msg = `morning, ${name}.`;
    if (integ.whoop?.connected) {
      msg += ` whoop says ${integ.whoop.sleep} of sleep, ${integ.whoop.recovery}% recovery.`;
      if (integ.whoop.recovery < 50) msg += ` low recovery — go easy today.`;
    }
    if (integ.googleCalendar?.connected) {
      const events = getMockCalendar();
      const meetings = events.filter(e => e.type !== 'break');
      msg += ` you've got ${meetings.length} meetings. first one at ${meetings[0]?.time || 'nothing'}.`;
      if (meetings.length >= 5) msg += ` heavy day — pace yourself.`;
    }
    if (integ.spotify?.connected) {
      msg += `\n\nlast thing you were listening to: ${integ.spotify.recentTrack}.`;
    }
    messages.push(msg);
  }

  // Pre-meeting nudge (20 min before next meeting)
  if (integ.googleCalendar?.connected) {
    const events = getMockCalendar();
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const upcoming = events.find(ev => {
      const [h, m] = ev.time.split(':').map(Number);
      const evMin = h * 60 + m;
      return evMin - currentMin > 0 && evMin - currentMin <= 20 && ev.type !== 'break' && ev.prep;
    });
    if (upcoming) {
      messages.push(`heads up — ${upcoming.title} with ${upcoming.people.join(', ')} in ${Math.round(((upcoming.time.split(':')[0] * 60 + +upcoming.time.split(':')[1]) - currentMin))} minutes. want me to prep you?`);
    }
  }

  // Afternoon check-in
  if (hour >= 14 && hour < 15) {
    messages.push(`how's the afternoon going, ${name}? halfway through the day.`);
  }

  // End of day
  if (hour >= 17 && hour < 18) {
    messages.push(`wrapping up? anything you want to get off your chest before you clock out?`);
  }

  return messages.length ? messages[0] : null;
}

// ════════════════════════════════════════════════════════
// SMART CHAT — cross-references calendar when you mention meetings
// ════════════════════════════════════════════════════════
function crossReferenceContext(input, baseResponse) {
  const lower = input.toLowerCase();
  const integ = STATE.integrations || {};

  // If they mention "meeting" or a person's name and we have calendar data
  if (integ.googleCalendar?.connected && (lower.includes('meeting') || lower.includes('nervous') || lower.includes('anxious') || lower.includes('stressed'))) {
    const events = getMockCalendar();
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    // Find next meeting
    const next = events.find(ev => {
      const [h, m] = ev.time.split(':').map(Number);
      return h * 60 + m > currentMin && ev.type !== 'break';
    });

    if (next && lower.includes('meeting')) {
      if (next.prep) {
        return baseResponse + `\n\nyour next one is ${next.title} at ${next.time} with ${next.people.join(', ')}. ${next.prep.youShould}`;
      }
    }

    // If stressed/anxious and have meetings, connect the dots
    if ((lower.includes('nervous') || lower.includes('anxious') || lower.includes('stressed')) && next) {
      return baseResponse + `\n\nis it about ${next.title} at ${next.time}? ${next.prep ? 'i can prep you for it if that helps.' : ''}`;
    }
  }

  // If they mention someone by name, check if that person is in a meeting today
  if (integ.googleCalendar?.connected) {
    const events = getMockCalendar();
    const names = events.flatMap(e => e.people || []);
    const mentioned = names.find(n => lower.includes(n.toLowerCase()));
    if (mentioned) {
      const meeting = events.find(e => e.people?.includes(mentioned));
      if (meeting) {
        return baseResponse + `\n\nbtw you have ${meeting.title} with ${mentioned} at ${meeting.time} today.`;
      }
    }
  }

  return baseResponse;
}
