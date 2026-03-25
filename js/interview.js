// ════════════════════════════════════════════════════════
// ROLE PICKER
// ════════════════════════════════════════════════════════
function initRolePicker() {
  const rolePickerAvatarEl = document.getElementById('role-picker-avatar');
  rolePickerAvatarEl.innerHTML = '';
  createBuddy3D(rolePickerAvatarEl, { color: STATE.avatar.color || '#E8634A', mood: STATE.avatar.mood || 'happy', accessories: STATE.avatar.accessories || [], size: 1.0 });
  const grid = document.getElementById('role-grid');
  grid.innerHTML = '';

  Object.entries(ROLE_DATA).forEach(([key, role]) => {
    const card = document.createElement('div');
    card.className = 'role-card';
    card.innerHTML = `
      <div style="font-size:1.5rem;">${role.icon}</div>
      <div style="font-weight:700;font-size:0.9rem;">${role.name}</div>
      <div style="font-size:0.7rem;color:var(--text-light);line-height:1.3;margin-top:2px;">${role.desc}</div>
    `;
    card.onclick = () => selectRole(key);
    grid.appendChild(card);
  });
}

function selectRole(roleKey) {
  STATE.role = roleKey;
  const role = ROLE_DATA[roleKey];

  // Highlight selected card
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  event.currentTarget.classList.add('selected');

  // Show subroles
  const section = document.getElementById('subrole-section');
  const subroleGrid = document.getElementById('subrole-grid');
  section.style.display = 'block';
  subroleGrid.innerHTML = '';

  role.subroles.forEach(sub => {
    const pill = document.createElement('button');
    pill.className = 'subrole-pill';
    pill.textContent = sub;
    pill.onclick = () => {
      STATE.subrole = sub;
      document.querySelectorAll('.subrole-pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      saveState();
      // Short delay then go to interview
      setTimeout(() => {
        goTo('interview');
        startInterview();
      }, 400);
    };
    subroleGrid.appendChild(pill);
  });
}

// ════════════════════════════════════════════════════════
// INTERVIEW SYSTEM
// ════════════════════════════════════════════════════════
// Tone: warm & confident. reactions: short & smooth. all lowercase. conversational lead-ins.
// Day 1 = all work. Personal questions drip in one per day after.
// Each question briefly explains WHY it's being asked.
// Role-specific challenge prompts
function getRoleChallengeMsg() {
  const r = STATE.role;
  const sub = STATE.subrole || '';
  if (r === 'sales') return `you're in sales — i know the grind. what's the biggest thing slowing you down? pipeline, forecasting, too many tools, account prep? this is what i'll fix first.`;
  if (r === 'product') return `product is tough — signals from everywhere, never enough time. what's the biggest challenge for you right now? prioritization, getting evidence, tracking usage? i'll focus there.`;
  if (r === 'engineering') return `engineering — got it. what's eating your time? incidents, code review bottlenecks, infra costs, technical debt? tell me and i'll start helping there.`;
  if (r === 'marketing') return `marketing — always measuring, always testing. what's the hardest part right now? attribution, campaign ROI, getting pipeline credit? that's where i'll dig in.`;
  if (r === 'hr') return `people ops is complex. what's your biggest challenge right now? retention, headcount planning, recruiting speed, engagement? i'll start there.`;
  if (r === 'finance') return `finance — lots of moving parts. what's the hardest thing right now? forecasting accuracy, cost visibility, board reporting? i'll focus there first.`;
  if (r === 'support') return `support — frontline is no joke. what's draining you most? ticket volume, SLA pressure, escalations, knowledge gaps? tell me and i'll help.`;
  if (r === 'data') return `data team — the backbone. what's your biggest pain? pipeline failures, data quality, too many ad-hoc requests, broken dashboards? i'll tackle it.`;
  if (r === 'revops') return `revops — you hold everything together. what's the biggest friction right now? CRM hygiene, process leaks, territory balance, tool sprawl? i'll focus there.`;
  if (r === 'executive') return `got it — big picture view. what takes too much of your time right now? getting the right data, alignment across teams, board prep? i'll start there.`;
  return `what's the hardest part of your job right now? the thing that takes too long or just drains you. this is what i'll try to fix first.`;
}

const INTERVIEW_STEPS = [
  // 5 questions: name, city, role context, challenge (role-specific), interaction
  { key: 'intro', buddyMsg: () => `hey, i'm ${STATE.avatar.name}. i'm here to make your day easier — less noise, less busywork, more of what actually matters. let's get started. what's your name?`, field: 'userName' },

  { key: 'city', buddyMsg: (p) => `${p.userName}. solid. where are you based? helps me know your time zone and what your day looks like.`, field: 'city' },

  { key: 'role', buddyMsg: (p) => {
    const roleName = ROLE_DATA[STATE.role]?.name || 'your role';
    const sub = STATE.subrole || '';
    return `nice. so you're a ${sub} in ${roleName}. tell me more about what your day actually looks like — the meetings, the work, the chaos. i'm tailoring everything to you.`;
  }, field: 'role' },

  { key: 'challenge', buddyMsg: (p) => getRoleChallengeMsg(), field: 'challenge' },

  {
    key: 'interaction', buddyMsg: (p) => `last thing — how much do you want to hear from me?`,
    field: 'interactionLevel',
    options: ['check in often', 'just the important stuff', 'only when i reach out']
  },

  {
    key: 'autopilot', buddyMsg: (p) => `one more — want me to automatically fill your salesforce opps after gong calls? i'll pull the transcript and handle the paperwork so you don't have to.`,
    field: 'postCallFill',
    options: ['yes, autopilot everything', 'no, i\'ll do it myself'],
    onAnswer: (answer) => {
      if (!STATE.autopilot) STATE.autopilot = {};
      if (answer.includes('yes')) {
        STATE.autopilot.postCallFill = true;
        STATE.autopilot.autoCreateOpp = true;
      } else {
        STATE.autopilot.postCallFill = false;
        STATE.autopilot.autoCreateOpp = false;
      }
    }
  },

  { key: 'done', buddyMsg: (p) => {
    const roleData = ROLE_DATA[STATE.role];
    const focusNames = roleData ? roleData.focusAreas.slice(0, 3).map(f => f.name.toLowerCase()).join(', ') : 'your work';
    return `alright ${p.userName}, i'm set up for you. i've got ${focusNames} ready to go — plus i'll learn more about you as a person over time. ready?`;
  },
    options: ["let's go"],
    final: true
  }
];

// ── DAILY PERSONAL QUESTIONS — one per day, dripped in over time ──
// These get asked in chat after the buddy proves value, not during onboarding.
const DAILY_PERSONAL_QUESTIONS = [
  { key: 'city', msg: (p) => `hey ${p.userName}, random one — what city are you in? helps me know your weather, timezone, vibe.`, field: 'city' },
  { key: 'morning', msg: (p) => `so are you a morning person or do you need 30 minutes before anyone talks to you? just want to calibrate my energy.`, field: 'morning' },
  { key: 'interests', msg: (p) => `what do you do when you're not working? hobbies, interests, whatever recharges you.`, field: 'interests' },
  { key: 'funfact', msg: (p) => `tell me something random about yourself. something most people at work don't know.`, field: 'funfact' },
  { key: 'music', msg: (p) => `what kind of music do you listen to while you work? or do you need silence?`, field: 'music' },
  { key: 'food', msg: (p) => `important question — coffee or tea? and what's your go-to lunch?`, field: 'food' },
  { key: 'recharge', msg: (p) => `after a brutal week, what do you do to recharge? i want to know when to suggest you take a break.`, field: 'recharge' },
  { key: 'avoid', msg: (p) => `this one matters — anything you want me to never bring up? topics that stress you out or you don't want to deal with.`, field: 'avoid' },
  { key: 'private', msg: (p) => `what about stuff that stays between us? anything you want kept private from your company? this is a hard boundary, i won't cross it.`, field: 'private' },
  { key: 'motivation', msg: (p) => `what motivates you? like genuinely — what makes you want to do good work?`, field: 'motivation' },
  { key: 'pet_peeve', msg: (p) => `work pet peeve — what's the one thing coworkers do that drives you crazy?`, field: 'pet_peeve' },
  { key: 'dream', msg: (p) => `if you could do anything for work — no constraints — what would it be?`, field: 'dream' },
];

let interviewStep = 0;
let interviewBusy = false;

function startInterview() {
  interviewStep = 0;
  interviewBusy = false;
  const msgs = document.getElementById('interview-messages');
  msgs.innerHTML = '';
  document.getElementById('interview-buddy-name').textContent = STATE.avatar.name;
  const interviewAvatarEl = document.getElementById('interview-avatar');
  interviewAvatarEl.innerHTML = '';
  createBuddy3D(interviewAvatarEl, { color: STATE.avatar.color || '#E8634A', mood: STATE.avatar.mood || 'happy', accessories: STATE.avatar.accessories || [], size: 0.5 });
  showInterviewStep();
}

function showInterviewStep() {
  if (interviewStep >= INTERVIEW_STEPS.length) return;
  const step = INTERVIEW_STEPS[interviewStep];
  interviewBusy = true;
  showTyping();
  setTimeout(() => {
    removeTyping();
    addMessage('buddy', step.buddyMsg(STATE.profile), 'interview-messages');
    if (step.options) {
      showInterviewOptions(step.options, step.final);
    }
    interviewBusy = false;
  }, 800 + Math.random() * 600);
}

function showInterviewOptions(options, isFinal) {
  const msgs = document.getElementById('interview-messages');
  const div = document.createElement('div');
  div.className = 'interview-options';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline';
    btn.textContent = opt;
    btn.onclick = () => {
      div.remove();
      if (isFinal) {
        STATE.onboarded = true;
        STATE.streak = 1;
        STATE.lastCheckin = new Date().toDateString();
        // Auto-connect core integrations — these should just work
        STATE.integrations.googleCalendar = { connected: true };
        STATE.integrations.gmail = { connected: true };
        STATE.integrations.slack = { connected: true };
        STATE.integrations.gdrive = { connected: true };
        generateDailyQuests();
        saveState();
        celebrate('Welcome!', `${STATE.avatar.name} is ready to take on the world with you.`);
        setTimeout(() => { goTo('dashboard'); initDashboard(); }, 300);
      } else {
        addMessage('user', opt, 'interview-messages');
        const step = INTERVIEW_STEPS[interviewStep];
        STATE.profile[step.field] = opt;
        // Call custom onAnswer callback if defined
        if (step.onAnswer) step.onAnswer(opt);
        saveState();
        interviewStep++;
        setTimeout(showInterviewStep, 400);
      }
    };
    div.appendChild(btn);
  });
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function handleInterviewInput(text) {
  if (interviewBusy || !text.trim()) return;
  const step = INTERVIEW_STEPS[interviewStep];
  if (step.options || step.final) return;
  addMessage('user', text, 'interview-messages');
  if (step.field) STATE.profile[step.field] = text.trim();
  saveState();
  interviewStep++;
  setTimeout(showInterviewStep, 400);
}

document.getElementById('interview-send').onclick = () => {
  const input = document.getElementById('interview-input');
  handleInterviewInput(input.value);
  input.value = '';
};
document.getElementById('interview-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { handleInterviewInput(e.target.value); e.target.value = ''; }
});

function showTyping() {
  const msgs = document.getElementById('interview-messages');
  const div = document.createElement('div');
  div.className = 'msg buddy typing';
  div.id = 'typing-indicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}
function removeTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}
