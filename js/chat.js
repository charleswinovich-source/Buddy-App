// ════════════════════════════════════════════════════════
// CHAT
// ════════════════════════════════════════════════════════
function initChat() {
  document.getElementById('chat-buddy-name').textContent = STATE.avatar.name;
  const chatAvatarEl = document.getElementById('chat-avatar');
  chatAvatarEl.innerHTML = '';
  createBuddy3D(chatAvatarEl, { color: STATE.avatar.color || '#E8634A', mood: STATE.avatar.mood || 'happy', accessories: STATE.avatar.accessories || [], size: 0.5 });

  const msgs = document.getElementById('chat-messages');
  msgs.innerHTML = '';

  // Load history
  STATE.chatHistory.forEach(m => addMessage(m.who, m.text, 'chat-messages'));

  if (STATE.chatHistory.length === 0) {
    // Smart first message — proactive, context-aware
    const proactive = getProactiveMessage();
    const greeting = proactive || `hey ${STATE.profile.userName || 'there'}. what's on your mind?`;
    // Show with typing indicator for first message
    setTimeout(() => {
      showTypingIndicator('chat-messages');
      setTimeout(() => {
        removeTypingIndicator();
        addMessage('buddy', greeting, 'chat-messages');
        STATE.chatHistory.push({ who: 'buddy', text: greeting });
        saveState();
      }, 1000);
    }, 500);
  }
}

function handleChatInput(text) {
  if (!text.trim()) return;
  addMessage('user', text, 'chat-messages');
  STATE.chatHistory.push({ who: 'user', text });

  // Check if this is a response to a daily question first
  const dailyResponse = handleDailyQuestionResponse(text);

  // Show typing indicator, then reveal response
  const thinkTime = 400 + Math.random() * 400;
  setTimeout(() => {
    showTypingIndicator('chat-messages');
    let response;
    if (dailyResponse) {
      // They gave a bs answer to the daily question
      response = dailyResponse;
    } else {
      response = generateBuddyResponse(text);
      // Cross-reference with calendar/context
      response = crossReferenceContext(text, response);
    }

    const typeTime = Math.min(2000, 600 + response.length * 8);
    setTimeout(() => {
      removeTypingIndicator();
      addMessage('buddy', response, 'chat-messages');
      STATE.chatHistory.push({ who: 'buddy', text: response });
      if (STATE.chatHistory.length > 100) STATE.chatHistory = STATE.chatHistory.slice(-100);
      saveState();

      // After responding, maybe ask a daily question (30% chance, not every message)
      if (!STATE.personal?._pendingQuestion && Math.random() < 0.3) {
        const dailyQ = getNextDailyQuestion();
        if (dailyQ) {
          setTimeout(() => {
            showTypingIndicator('chat-messages');
            setTimeout(() => {
              removeTypingIndicator();
              addMessage('buddy', dailyQ, 'chat-messages');
              STATE.chatHistory.push({ who: 'buddy', text: dailyQ });
              saveState();
            }, 800 + Math.random() * 600);
          }, 2000 + Math.random() * 1000);
        }
      }
    }, typeTime);
  }, thinkTime);
}

// ── ACTION INTENTS — detect when user wants to DO something ──
function detectActionIntent(input) {
  const lower = input.toLowerCase();

  // Slack: "slack kevin kim hello" or "slack abhijeeth hey" or "dm kelsey thanks"
  if (/^(?:slack|dm|message|tell)\s+/i.test(lower)) {
    const afterCmd = input.replace(/^(?:slack|dm|message|tell)\s+/i, '');

    // Try separator first: "slack kevin kim - hello"
    const sepMatch = afterCmd.match(/^(.+?)(?:\s*[-–:]\s*|\s+(?:and say|saying|that)\s+)(.+)/i);
    if (sepMatch) {
      return { type: 'slack', to: sepMatch[1].trim(), message: sepMatch[2].trim() };
    }

    // Smart split: figure out where the name ends and message begins
    const { name, message } = splitNameAndMessage(afterCmd);
    if (name) return { type: 'slack', to: name, message: message };
  }

  // Respond/reply: "respond to kelsey thanks" or "reply to scott hey can we meet"
  if (/^(?:respond|reply)\s+to\s+/i.test(lower)) {
    const afterCmd = input.replace(/^(?:respond|reply)\s+to\s+/i, '');
    const sepMatch = afterCmd.match(/^(.+?)(?:\s*[-–:]\s*|\s+(?:saying|with|and say)\s+)(.+)/i);
    if (sepMatch) return { type: 'slack_reply', to: sepMatch[1].trim(), message: sepMatch[2].trim() };
    const { name, message } = splitNameAndMessage(afterCmd);
    if (name) return { type: 'slack_reply', to: name, message: message };
  }

  // Email: "email ali cooper hey" or "email brandon - about the meeting"
  if (/^(?:email|mail|send\s+(?:an?\s+)?email)\s+/i.test(lower)) {
    const afterCmd = input.replace(/^(?:email|mail|send\s+(?:an?\s+)?email\s+(?:to\s+)?)/i, '');
    const sepMatch = afterCmd.match(/^(.+?)(?:\s*[-–:]\s*|\s+(?:saying|about|and say)\s+)(.+)/i);
    if (sepMatch) return { type: 'email', to: sepMatch[1].trim(), message: sepMatch[2].trim() };
    const { name, message } = splitNameAndMessage(afterCmd);
    if (name) return { type: 'email', to: name, message: message };
  }

  // Calendar: "schedule meeting with kevin" or "find time with kevin this week"
  const calMatch = lower.match(/(?:schedule|set up|find time|meet)\s+(?:a\s+)?(?:meeting\s+)?with\s+([a-z\s]+?)(?:\s+(?:about|to talk about|to discuss|for|this week|next week)\s*(.*))?$/);
  if (calMatch) {
    return { type: 'calendar', with: calMatch[1].trim(), topic: (calMatch[2] || '').trim() };
  }

  return null;
}

// Smart name/message splitter — assumes capitalized words are names
function splitNameAndMessage(text) {
  const words = text.split(/\s+/);
  // Common message-starting words — if we hit one, everything before is the name
  const msgStarters = ['hey', 'hi', 'hello', 'yo', 'sup', 'thanks', 'thank', 'no', 'yes',
    'yeah', 'can', 'could', 'would', 'will', 'please', 'i', 'we', 'the', 'a', 'an',
    'what', 'how', 'when', 'where', 'why', 'do', 'did', 'is', 'are', 'was', 'were',
    'let', 'lets', "let's", 'check', 'look', 'see', 'send', 'here', 'btw', 'fyi',
    'just', 'quick', 'sounds', 'ok', 'okay', 'sure', 'got', 'nice', 'great', 'cool',
    'awesome', 'perfect', 'sorry', 'apologies', 'congrats', 'love', 'need', 'want',
    'going', 'coming', 'running', 'working', 'thinking', 'trying', 'waiting',
    'im', "i'm", "i'll", "i'd", "don't", "doesn't", "didn't", "won't", "can't",
    'not', 'never', 'always', 'maybe', 'probably', 'definitely', 'absolutely',
    'all', 'good', 'bad', 'lol', 'haha', 'omg', 'wow', 'yep', 'nope', 'down',
    'bet', 'word', 'for', 'on', 'so', 'still', 'any', 'have', 'had', 'miss',
    'made', 'come', 'pull', 'push', 'meet', 'grab', 'take', 'give', 'keep',
    'stop', 'start', 'open', 'close', 'read', 'write', 'call', 'text', 'ping'];

  let nameEnd = 0;
  for (let i = 0; i < words.length; i++) {
    if (msgStarters.includes(words[i].toLowerCase())) {
      nameEnd = i;
      break;
    }
    nameEnd = i + 1;
  }
  // If all words look like a name (no message starters found), it's just a name
  if (nameEnd >= words.length) return { name: text.trim(), message: '' };
  // If first word is a message starter, treat first word as name (unlikely but safe)
  if (nameEnd === 0) nameEnd = 1;

  return {
    name: words.slice(0, nameEnd).join(' '),
    message: words.slice(nameEnd).join(' ')
  };
}

function showActionCard(intent) {
  const msgs = document.getElementById('chat-messages');
  const card = document.createElement('div');
  card.className = 'msg buddy';
  card.style.cssText = 'padding:0;';

  const actionId = 'action-' + Date.now();
  let cardContent = '';

  if (intent.type === 'slack' || intent.type === 'slack_reply') {
    cardContent = `
      <div style="padding:1rem 1.15rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
          <span style="font-size:1.1rem;">💬</span>
          <span style="font-weight:700;font-size:0.85rem;">Slack DM to ${intent.to}</span>
        </div>
        <div style="background:var(--bg1);border-radius:10px;padding:0.75rem;font-size:0.9rem;line-height:1.5;margin-bottom:0.75rem;">${intent.message}</div>
        <div style="display:flex;gap:0.5rem;">
          <button onclick="executeAction('${actionId}')" id="${actionId}" data-type="${intent.type}" data-to="${intent.to}" data-message="${intent.message.replace(/"/g, '&quot;')}" style="flex:1;padding:0.6rem;border-radius:10px;background:var(--accent);color:#fff;border:none;font-weight:700;font-size:0.85rem;cursor:pointer;">Send</button>
          <button onclick="this.closest('.msg').remove()" style="padding:0.6rem 1rem;border-radius:10px;background:var(--border);color:var(--text-light);border:none;font-size:0.85rem;cursor:pointer;">Cancel</button>
        </div>
      </div>`;
  } else if (intent.type === 'email') {
    cardContent = `
      <div style="padding:1rem 1.15rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
          <span style="font-size:1.1rem;">📧</span>
          <span style="font-weight:700;font-size:0.85rem;">Email to ${intent.to}</span>
        </div>
        <div style="background:var(--bg1);border-radius:10px;padding:0.75rem;font-size:0.9rem;line-height:1.5;margin-bottom:0.75rem;">${intent.message}</div>
        <div style="display:flex;gap:0.5rem;">
          <button onclick="executeAction('${actionId}')" id="${actionId}" data-type="email" data-to="${intent.to}" data-message="${intent.message.replace(/"/g, '&quot;')}" style="flex:1;padding:0.6rem;border-radius:10px;background:var(--accent);color:#fff;border:none;font-weight:700;font-size:0.85rem;cursor:pointer;">Send</button>
          <button onclick="this.closest('.msg').remove()" style="padding:0.6rem 1rem;border-radius:10px;background:var(--border);color:var(--text-light);border:none;font-size:0.85rem;cursor:pointer;">Cancel</button>
        </div>
      </div>`;
  } else if (intent.type === 'calendar') {
    cardContent = `
      <div style="padding:1rem 1.15rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
          <span style="font-size:1.1rem;">📅</span>
          <span style="font-weight:700;font-size:0.85rem;">Schedule meeting with ${intent.with}</span>
        </div>
        ${intent.topic ? `<div style="font-size:0.85rem;color:var(--text-light);margin-bottom:0.75rem;">Topic: ${intent.topic}</div>` : ''}
        <div style="background:var(--bg1);border-radius:10px;padding:0.75rem;font-size:0.85rem;line-height:1.5;margin-bottom:0.75rem;">i'll find mutual free time this week and send the invite.</div>
        <div style="display:flex;gap:0.5rem;">
          <button onclick="executeAction('${actionId}')" id="${actionId}" data-type="calendar" data-with="${intent.with}" data-topic="${(intent.topic || '').replace(/"/g, '&quot;')}" style="flex:1;padding:0.6rem;border-radius:10px;background:var(--accent);color:#fff;border:none;font-weight:700;font-size:0.85rem;cursor:pointer;">Find Time & Send</button>
          <button onclick="this.closest('.msg').remove()" style="padding:0.6rem 1rem;border-radius:10px;background:var(--border);color:var(--text-light);border:none;font-size:0.85rem;cursor:pointer;">Cancel</button>
        </div>
      </div>`;
  }

  card.innerHTML = cardContent;
  msgs.appendChild(card);
  msgs.scrollTop = msgs.scrollHeight;
}

function executeAction(actionId) {
  const btn = document.getElementById(actionId);
  if (!btn) return;
  const type = btn.dataset.type;
  const card = btn.closest('.msg');

  // Show sending state
  btn.textContent = 'Sending...';
  btn.disabled = true;
  btn.style.opacity = '0.6';

  // Call the backend API
  fetch('/api/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: type,
      to: btn.dataset.to || btn.dataset.with,
      message: btn.dataset.message || '',
      topic: btn.dataset.topic || '',
    })
  })
  .then(r => r.json())
  .then(data => {
    // Replace card with confirmation
    card.innerHTML = `
      <div style="padding:1rem 1.15rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span style="font-size:1.1rem;">✅</span>
          <span style="font-weight:600;font-size:0.85rem;">${data.message || 'sent!'}</span>
        </div>
        ${data.link ? `<a href="${data.link}" target="_blank" style="font-size:0.75rem;color:var(--accent);margin-top:0.25rem;display:block;">view →</a>` : ''}
      </div>`;
  })
  .catch(err => {
    card.innerHTML = `
      <div style="padding:1rem 1.15rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span style="font-size:1.1rem;">⚠️</span>
          <span style="font-weight:600;font-size:0.85rem;color:#ffa726;">couldn't send — server not running. tell charlie in the chat and he'll send it manually.</span>
        </div>
      </div>`;
  });
}

function generateBuddyResponse(input) {
  const lower = input.toLowerCase();
  const name = STATE.profile.userName || 'friend';
  const buddyName = STATE.avatar.name;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // ─────────────────────────────────────────────────────
  // ACTION INTENT DETECTION — catch "slack X", "email X", "schedule with X"
  // ─────────────────────────────────────────────────────
  const intent = detectActionIntent(input);
  if (intent) {
    setTimeout(() => showActionCard(intent), 100);
    if (intent.type === 'slack' || intent.type === 'slack_reply') {
      return `got it — here's what i'll send to ${intent.to}:`;
    } else if (intent.type === 'email') {
      return `drafting an email to ${intent.to}:`;
    } else if (intent.type === 'calendar') {
      return `on it — finding time with ${intent.with}${intent.topic ? ' to talk about ' + intent.topic : ''}:`;
    }
  }

  // ─────────────────────────────────────────────────────
  // PERSONAL KNOWLEDGE — the buddy remembers what you've shared
  // ─────────────────────────────────────────────────────
  const p = STATE.personal || {};
  const integ = STATE.integrations || {};

  // ── Health / wellness — only if connected ──
  if (lower.includes('sleep') || lower.includes('slept')) {
    if (integ.whoop?.connected) return `your whoop says you got ${integ.whoop.sleep} last night with ${integ.whoop.recovery}% recovery. ${integ.whoop.recovery < 50 ? 'take it easy today.' : integ.whoop.recovery > 80 ? 'you\'re charged up.' : 'decent — listen to your body.'}`;
    if (integ.oura?.connected) return `oura has you at ${integ.oura.sleep} of sleep, readiness score ${integ.oura.readiness}. ${integ.oura.readiness > 80 ? 'good to go.' : 'might want to pace yourself.'}`;
    return pick([`how'd you sleep?`, `good rest or rough night?`, `sleep is everything. how was yours?`]);
  }

  if (lower.includes('recovery') || lower.includes('hrv') || lower.includes('strain')) {
    if (integ.whoop?.connected) return `whoop says recovery ${integ.whoop.recovery}%, strain ${integ.whoop.strain}. ${integ.whoop.recovery < 50 ? 'low recovery — maybe dial it back today.' : 'looking solid.'}`;
    if (integ.oura?.connected) return `oura readiness: ${integ.oura.readiness}. hrv: ${integ.oura.hrv}ms. ${integ.oura.readiness > 80 ? 'body says go.' : 'body says chill.'}`;
  }

  if (lower.includes('steps') || lower.includes('walk') || lower.includes('active')) {
    if (integ.appleHealth?.connected) return `apple health shows ${integ.appleHealth.steps.toLocaleString()} steps, ${integ.appleHealth.activeEnergy} cal burned. ${integ.appleHealth.steps > 8000 ? 'nice work staying active.' : 'maybe take a walk break?'}`;
    if (integ.fitbit?.connected) return `fitbit has you at ${integ.fitbit.steps.toLocaleString()} steps today.`;
    if (integ.garmin?.connected) return `garmin shows ${integ.garmin.steps.toLocaleString()} steps.`;
  }

  if (lower.includes('run') || lower.includes('workout') || lower.includes('exercise') || lower.includes('training')) {
    if (integ.strava?.connected) return `strava says your last run was ${integ.strava.lastRun} at ${integ.strava.pace}. nice work getting out there.`;
    if (integ.whoop?.connected) return `whoop has your strain at ${integ.whoop.strain} today. ${integ.whoop.strain > 14 ? 'you went hard.' : 'room for more if you feel it.'}`;
  }

  if ((lower.includes('health') || lower.includes('blood') || lower.includes('labs') || lower.includes('vitamin')) && integ.functionHealth?.connected) {
    const fh = integ.functionHealth;
    const flagged = fh.flagged?.length ? `heads up — your last panel flagged: ${fh.flagged.join(', ')}.` : 'everything looked good on your last panel.';
    return `last function health panel was ${fh.lastPanel}. ${flagged}`;
  }

  if (lower.includes('listening') || lower.includes('song') || lower.includes('music') || lower.includes('playing')) {
    if (integ.spotify?.connected) return `you were just listening to ${integ.spotify.recentTrack}. ${integ.spotify.mood === 'chill' ? 'vibes are mellow.' : integ.spotify.mood === 'hype' ? 'energy mode.' : 'good taste as always.'}`;
    if (p.music) return `you told me you're into ${p.music}. what are you listening to right now?`;
    return `what are you listening to?`;
  }

  // ── Personal knowledge — reference only what they've shared ──
  if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) {
    if (p.pets) return `how's ${p.pets} doing?`;
  }
  if (lower.includes('coffee') || lower.includes('caffeine') || lower.includes('morning drink')) {
    if (p.coffeeOrder) return `need your ${p.coffeeOrder}? some things are non-negotiable.`;
    return `what's your go-to morning drink?`;
  }
  if (lower.includes('food') || lower.includes('hungry') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('eat')) {
    if (p.food) return `you're a ${p.food} person right? what sounds good?`;
    return pick([`what are you in the mood for?`, `hungry? what's calling your name?`]);
  }
  if (lower.includes('show') || lower.includes('watch') || lower.includes('netflix') || lower.includes('tv')) {
    if (p.shows) return `still watching ${p.shows}? or onto something new?`;
    return `watching anything good lately?`;
  }
  if (lower.includes('vacation') || lower.includes('travel') || lower.includes('trip')) {
    if (p.dreamVacation) return `still dreaming about ${p.dreamVacation}? you should go.`;
    return `where would you go if you could leave tomorrow?`;
  }
  if (lower.includes('hobby') || lower.includes('hobbies') || lower.includes('free time')) {
    if (p.hobbies) return `been doing any ${p.hobbies} lately?`;
    if (STATE.profile.interests) return `you mentioned ${STATE.profile.interests} — been keeping up with that?`;
    return `what do you do when you're not working?`;
  }

  // ── Gmail intelligence ──
  if (integ.gmail?.connected) {
    if (lower.includes('email') || lower.includes('inbox') || lower.includes('mail')) {
      const emails = getMockEmails();
      const urgent = emails.needsReply.filter(e => e.urgent);
      let msg = `you have ${emails.needsReply.length} emails that need a reply, ${emails.fyi.length} FYIs, and ${emails.ignorable} you can skip.\n\n`;
      if (urgent.length) {
        msg += `priority:\n`;
        urgent.forEach(e => { msg += `• ${e.from} — "${e.subject}" (${e.time})\n`; });
      }
      emails.needsReply.filter(e => !e.urgent).forEach(e => {
        msg += `• ${e.from} — "${e.subject}" (${e.time})\n`;
      });
      return msg.trim();
    }
  }

  // ── Slack intelligence ──
  if (integ.slack?.connected) {
    if (lower.includes('slack') || lower.includes('messages') || lower.includes('dms') || lower.includes('mentions')) {
      const slack = getMockSlack();
      const unreadDMs = slack.dms.filter(d => d.unread);
      const mentions = slack.channels.filter(c => c.mentions > 0);
      let msg = '';
      if (slack.waitingOnYou > 0) msg += `heads up — ${slack.waitingOnYou} people are waiting on you.\n\n`;
      if (unreadDMs.length) {
        msg += `unread DMs:\n`;
        unreadDMs.forEach(d => { msg += `• ${d.from}: "${d.preview.substring(0, 50)}" (${d.time})${d.waitingOnYou ? ' ← waiting on you' : ''}\n`; });
      }
      if (mentions.length) {
        msg += `\nmentions:\n`;
        mentions.forEach(c => { msg += `• ${c.name}: ${c.preview.substring(0, 50)} (${c.time})\n`; });
      }
      if (slack.threads.length) msg += `\n${slack.threads.length} thread${slack.threads.length > 1 ? 's' : ''} need your reply.`;
      return msg.trim();
    }
    if (lower.includes('draft') || lower.includes('reply to')) {
      return `tell me who and what you want to say — i'll draft it for you. you approve before anything gets sent.`;
    }
  }

  // ── Google Drive intelligence ──
  if (integ.gdrive?.connected) {
    if (lower.includes('doc') || lower.includes('drive') || lower.includes('find') || lower.includes('sheet') || lower.includes('slides')) {
      const drive = getMockDrive();
      if (lower.includes('find') || lower.includes('search') || lower.includes('where')) {
        return `what are you looking for? give me a name or topic and i'll search your drive.`;
      }
      let msg = `recent drive activity:\n\n`;
      msg += `shared with you:\n`;
      drive.recentlyShared.forEach(d => { msg += `• ${d.name} (${d.type}) — from ${d.sharedBy}, ${d.time}\n`; });
      msg += `\nyou recently edited:\n`;
      drive.recentlyEdited.forEach(d => { msg += `• ${d.name} (${d.type}) — ${d.time}\n`; });
      return msg.trim();
    }
  }

  // ── Calendar intelligence — morning briefing + meeting prep ──
  if (STATE.integrations?.googleCalendar?.connected) {
    const events = getMockCalendar();
    const meetings = events.filter(e => e.type !== 'break');
    const flags = getCalendarFlags(events);

    if (lower.includes('my day') || lower.includes('schedule') || lower.includes('calendar') || lower.includes('what\'s today') || lower.includes('what do i have')) {
      const morningStyle = STATE.profile.morning || '';
      const slowStarter = morningStyle.toLowerCase().includes('slow') || morningStyle.toLowerCase().includes('ease');
      let brief = `you've got ${meetings.length} meetings today.\n\n`;
      events.forEach(ev => {
        if (ev.type === 'break') {
          brief += `${ev.time} — lunch break (protect this)\n`;
        } else {
          brief += `${ev.time} — ${ev.title} with ${ev.people.join(', ')}\n`;
        }
      });
      if (flags.length) brief += `\nheads up: ${flags.join('. ')}.`;
      if (slowStarter) brief += `\n\nyou said mornings are slow for you — your first meeting isn't until ${events[0]?.time}, so you've got some breathing room.`;
      return brief;
    }

    // Meeting-specific prep
    if (lower.includes('prep') || lower.includes('prepare') || lower.includes('ready for') || lower.includes('what should i know')) {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const next = events.find(ev => {
        const [h, m] = ev.time.split(':').map(Number);
        return h * 60 + m > currentMin && ev.type !== 'break' && ev.prep;
      }) || meetings[0]; // fallback to first meeting

      if (next?.prep) {
        const p = next.prep;
        return `here's your prep for ${next.title} at ${next.time}:\n\n${p.context}\n\nagenda: ${p.agenda.join(', ')}\n\nwhat they'll want to discuss: ${p.theyWant}\n\nyou should bring up: ${p.youShould}${p.followUps?.length ? '\n\nopen follow-ups: ' + p.followUps.join(', ') : ''}`;
      }
    }

    // Next meeting
    if (lower.includes('next meeting') || lower.includes('what\'s next') || lower.includes('coming up')) {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const next = events.find(ev => {
        const [h, m] = ev.time.split(':').map(Number);
        return h * 60 + m > currentMin && ev.type !== 'break';
      });
      if (next) {
        return `next up: ${next.title} at ${next.time} with ${next.people.join(', ')}. ${next.prep ? 'want me to prep you for it?' : ''}`;
      }
      return `you're clear for the rest of the day. nice.`;
    }
  }

  // ── Remember things — the buddy stores what you tell it ──
  const rememberMatch = lower.match(/^(?:remember|don't forget|note that|btw|fyi)[:\s]+(.+)/);
  if (rememberMatch) {
    if (!STATE.personal) STATE.personal = { memories: [] };
    if (!STATE.personal.memories) STATE.personal.memories = [];
    STATE.personal.memories.push({ text: rememberMatch[1].trim(), date: new Date().toISOString().split('T')[0] });
    saveState();
    return `got it. i'll remember that.`;
  }

  // ── Tell the buddy personal things — it stores them naturally ──
  const personalSetters = [
    { patterns: ['my dog', 'my cat', 'my pet', 'my puppy', 'my kitten'], key: 'pets', extract: true },
    { patterns: ['i love eating', 'favorite food', 'i\'m a', 'my go-to food'], key: 'food', extract: true },
    { patterns: ['my coffee order', 'i drink', 'i usually get'], key: 'coffeeOrder', extract: true },
    { patterns: ['favorite show', 'i\'m watching', 'been watching', 'binging'], key: 'shows', extract: true },
    { patterns: ['dream vacation', 'i want to go to', 'dream trip'], key: 'dreamVacation', extract: true },
  ];
  for (const setter of personalSetters) {
    if (setter.patterns.some(pat => lower.includes(pat))) {
      if (!STATE.personal) STATE.personal = {};
      STATE.personal[setter.key] = input.substring(0, 100);
      saveState();
      return pick([`noted. i'll remember that.`, `love that. filed away.`, `good to know, ${name}.`]);
    }
  }

  // ── PROACTIVE WORK DETECTION ──
  const workflowSignals = ['every time', 'every week', 'every day', 'every monday', 'every morning',
    'always have to', 'keep having to', 'manually', 'repetitive', 'copy paste', 'copy and paste',
    'same thing', 'over and over', 'tedious', 'routine', 'rinse and repeat', 'same steps'];
  if (workflowSignals.some(s => lower.includes(s))) {
    return `okay so that sounds like reactive work — you're doing the same thing over and over because nothing's set up to handle it for you.\n\nthat's a workflow. a workflow is a sequence of steps that can run automatically when something triggers it. instead of you doing it every time, you define the steps once and let it rip.\n\nthe difference? right now you're reacting to the task. a workflow makes it proactive — it just happens without you.`;
  }

  const pluginSignals = ['i wish', 'doesn\'t do', 'can\'t do', 'missing feature', 'no way to',
    'there\'s no option', 'if only', 'would be nice if', 'should be able to', 'doesn\'t support',
    'no integration', 'doesn\'t connect', 'tool doesn\'t'];
  if (pluginSignals.some(s => lower.includes(s))) {
    return `that's a gap in your tool — you're working around a limitation instead of fixing it.\n\nthat's a plugin. a plugin extends something you already use by adding a capability it's missing. you're not building a new tool, you're making an existing one smarter.\n\nright now you're being reactive — manually compensating for what the tool can't do. the proactive move is building a plugin that closes the gap permanently.`;
  }

  const skillSignals = ['how do i', 'don\'t know how', 'not sure how', 'never learned',
    'need to learn', 'want to learn', 'struggling with', 'don\'t understand',
    'what\'s the best way', 'getting better at', 'improve at', 'upskill'];
  if (skillSignals.some(s => lower.includes(s))) {
    return `sounds like a skill gap — totally normal. this is different from a tool problem. the tool might be fine, but you need to level up on how to use it or think about it.\n\na skill is a focused capability you build over time. i can help you practice consistently instead of just googling it when it comes up.\n\nthat's the shift from reactive to proactive — instead of scrambling when you hit the wall, you train so the wall isn't there.`;
  }

  const agentSignals = ['figure out', 'decide which', 'triage', 'prioritize', 'sort through',
    'too many', 'which one should', 'analyze', 'evaluate', 'assess', 'review all',
    'go through each', 'check every', 'monitor', 'watch for', 'alert me', 'flag'];
  if (agentSignals.some(s => lower.includes(s))) {
    return `that's a judgment call that takes real context — you're sorting, evaluating, deciding. that eats up your brain.\n\nthat's an agent. an agent is different from a workflow because it makes decisions, not just follows steps. it can look at data, weigh options, and act based on rules you set.\n\nyou're doing reactive triage right now — handling each thing as it hits you. an agent makes it proactive by continuously watching, filtering, and surfacing only what actually needs you.`;
  }

  const appSignals = ['need a tool', 'build something', 'whole new', 'dashboard', 'tracker',
    'there\'s nothing for', 'no tool for', 'custom tool', 'internal tool', 'need an app',
    'need a place to', 'centralize', 'single source', 'one place for'];
  if (appSignals.some(s => lower.includes(s))) {
    return `sounds like you need something that doesn't exist yet — not an extension of a tool, but a whole new thing.\n\nthat's an app. apps are the biggest lift but also the biggest unlock. you're building a new experience from scratch to solve a problem no existing tool handles.\n\nthis is the most proactive thing you can do — instead of duct-taping three tools together reactively, you build the thing that should've existed.`;
  }

  const reactiveSignals = ['putting out fires', 'firefighting', 'always reacting', 'never get ahead',
    'behind on', 'playing catch up', 'catching up', 'drowning in', 'swamped', 'can\'t keep up',
    'interrupt', 'context switch', 'too many things', 'pulled in', 'whack-a-mole'];
  if (reactiveSignals.some(s => lower.includes(s))) {
    return `i hear you, ${name}. that's reactive work — you're spending your energy responding to things instead of preventing them.\n\nhere's how i think about it:\n• if it's repetitive steps → that's a workflow\n• if a tool is missing something → that's a plugin\n• if it needs judgment/triage → that's an agent\n• if nothing exists for it → that's an app\n• if you don't know how → that's a skill\n\ntell me what's eating your time the most and i'll help you figure out which one gets you out of reactive mode.`;
  }

  const autoSignals = ['automate', 'automation', 'make it faster', 'speed up', 'streamline',
    'more efficient', 'save time', 'takes too long', 'waste of time', 'bottleneck'];
  if (autoSignals.some(s => lower.includes(s))) {
    return `good instinct — you're thinking proactively. wanting to automate means you've identified reactive work that shouldn't need you.\n\nlet me ask you this: is the thing you want to automate a series of steps (workflow), a missing capability in a tool (plugin), or something that requires decisions along the way (agent)?\n\ntell me more about what's slow and i'll point you to exactly what to build.`;
  }

  // ── Fivetran knowledge layer ──
  const fivetranGeneralSignals = ['fivetran', 'data pipeline', 'data stack', 'elt', 'etl'];
  if (fivetranGeneralSignals.some(s => lower.includes(s))) {
    return `fivetran is the managed context layer — it moves data from your sources (apps, databases, files) into your destination (warehouse or lake) automatically.\n\nthe key idea: fivetran uses ELT, not ETL. it extracts and loads raw data first, then you transform it in the warehouse. that means your raw data is always available even if a transformation breaks.\n\nyour buddy runs on top of this — fivetran gives me the context about what's happening across your tools so i can actually help you.`;
  }

  const connectorSignals = ['connector', 'connect my', 'sync my', 'data source', 'pull data from',
    'salesforce data', 'hubspot data', 'jira data', 'github data', 'stripe data', 'shopify data',
    'google ads data', 'facebook ads data', 'zendesk data'];
  if (connectorSignals.some(s => lower.includes(s))) {
    return `connectors are how fivetran pulls data from your tools into your warehouse. there are 500+ pre-built connectors — salesforce, hubspot, jira, stripe, shopify, github, google ads, you name it.\n\neach connector creates its own schema in your destination, handles syncing automatically, and captures new/changed/deleted data.\n\nif the data you need lives in an app, there's probably a connector for it. what source are you trying to connect?`;
  }

  const transformSignals = ['transform', 'dbt', 'data model', 'quickstart model', 'reshape data',
    'analytics-ready', 'data modeling'];
  if (transformSignals.some(s => lower.includes(s))) {
    return `transformations reshape your raw data into analytics-ready tables. fivetran offers two paths:\n\n• quickstart data models — pre-built, no-code, set up in the dashboard. great for common use cases like ad reporting or CRM analytics.\n• dbt integration — bring your own dbt project for full customization. fivetran hosts dbt core or orchestrates dbt cloud.\n\ntransformations run automatically after syncs complete, so your data stays fresh. first 5,000 model runs per month are free.`;
  }

  const activationSignals = ['activation', 'reverse etl', 'retl', 'push data back', 'sync to crm',
    'sync to salesforce', 'sync to hubspot', 'data activation', 'audience', 'segment'];
  if (activationSignals.some(s => lower.includes(s))) {
    return `activations is fivetran's reverse ETL — it takes data from your warehouse and pushes it back into business tools like salesforce, hubspot, braze, or ad platforms.\n\nthe flow: connectors pull data in → transformations clean it → activations push insights out. that's the full bidirectional pipeline.\n\nyou define datasets (SQL queries or no-code segments), map them to destination objects, and activations keeps everything in sync. your data never touches fivetran's servers — it goes straight from warehouse to tool.`;
  }

  const destSignals = ['destination', 'warehouse', 'snowflake', 'bigquery', 'redshift', 'databricks',
    'data lake', 'where does data go'];
  if (destSignals.some(s => lower.includes(s))) {
    return `destinations are where fivetran loads your data. the big ones: snowflake, bigquery, redshift, databricks, and postgres.\n\nfivetran handles all the schema creation, type mapping, and incremental updates. it tries to faithfully replicate your source data with minimal transformation — just enough to make it useful.\n\nonce it's in your warehouse, that's where the real power kicks in: transformations, activations, and your buddy using that data to help you work smarter.`;
  }

  const pipelineIssueSignals = ['sync fail', 'sync broke', 'data not updating', 'pipeline broken',
    'stale data', 'data is old', 'missing data', 'sync error', 'connector error', 'data is wrong'];
  if (pipelineIssueSignals.some(s => lower.includes(s))) {
    return `pipeline issues are no fun. here's how i'd think through it:\n\n• sync failure → check the connector status in fivetran dashboard. most errors are auth expiry or API rate limits.\n• stale data → check your sync frequency. fivetran syncs on a schedule — the data might just not be due yet.\n• missing data → check if the table/column is blocked in your connector settings. fivetran lets you exclude specific schemas, tables, or columns.\n• wrong data → check if there's a transformation that's not running or failing after the sync.\n\nwant me to help you figure out which one it might be?`;
  }

  // ── Emotional / personal responses ──
  if (lower.includes('stress') || lower.includes('overwhelm') || lower.includes('anxious')) {
    return pick([`hey. i'm here. what's the worst part right now?`, `that's a lot. let's break it down — is it one big thing or a bunch of small ones?`, `i hear you, ${name}. take a breath. sometimes just naming the thing helps — what's got you?`]);
  }
  if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('burnt out')) {
    return pick([`go easy today. half speed is still moving.`, `sounds like a low-key day. i'll keep it quiet for you.`, `rest isn't quitting, ${name}. take what you need.`]);
  }
  if (lower.includes('bored') || lower.includes('boring')) {
    return pick([`slow day? want to knock out a quest? sometimes one small thing changes everything.`, `yeah those days are rough. want to do something or just hang?`, `boredom usually means you need a change of pace. what sounds good?`]);
  }
  if (lower.includes('happy') || lower.includes('great') || lower.includes('good') || lower.includes('amazing')) {
    return pick([`good. you deserve that, ${name}.`, `love to hear it. ride that wave.`, `that's what i like to see.`]);
  }
  if (lower.includes('goal') || lower.includes('progress')) {
    if (STATE.profile.goals) return `you mentioned "${STATE.profile.goals}" — how's that going?`;
    return `what are you working towards right now?`;
  }
  if (lower.includes('weather')) {
    const w = getMockWeather();
    return `${w.temp}, ${w.desc.toLowerCase()}. ${w.note.toLowerCase()}.`;
  }
  if (lower.includes('thank')) {
    return pick([`anytime, ${name}.`, `of course.`, `that's what i'm here for.`]);
  }
  if (lower.includes('how are you') || lower.includes('how\'re you') || lower.includes('what\'s up')) {
    return pick([`i'm good. better question — how are you, ${name}?`, `all good on my end. what's going on with you?`, `i'm here. what's on your mind?`]);
  }
  if (lower.includes('help')) {
    return `what do you need? i can help you think through problems, figure out what to build, or just listen.`;
  }
  if (lower.includes('meeting') || lower.includes('standup') || lower.includes('call')) {
    return `want me to sit in the hangout and take notes? you focus, i'll handle the recap.`;
  }
  if (lower.includes('skill') || lower.includes('learn')) {
    if (STATE.profile.skills) return `you said you wanted to work on ${STATE.profile.skills}. want me to build that into your quests?`;
    return `what do you want to get better at? i can help make it a habit.`;
  }

  if (lower.includes('proactive') || lower.includes('reactive') || lower.includes('what should i build') || lower.includes('what can i build')) {
    return `here's how i think about it, ${name}.\n\nreactive work = you're responding. someone asks, something breaks, a task lands on you. you handle it.\n\nproactive work = you're preventing. you build something once so the reactive stuff stops showing up.\n\nthe five things you can build:\n• workflow — automates a sequence of steps\n• plugin — adds a missing feature to a tool\n• skill — levels up your ability to handle something\n• agent — makes decisions and triages for you\n• app — creates something entirely new\n\ntell me what's eating your time and i'll tell you which one to build.`;
  }

  // ── DAILY PERSONAL QUESTION ──
  if (!STATE._personalQAskedToday && STATE._chatMsgCount > 2 && Math.random() < 0.4) {
    const unanswered = DAILY_PERSONAL_QUESTIONS.filter(q => !STATE.profile[q.field]);
    if (unanswered.length > 0) {
      const q = unanswered[0];
      STATE._personalQAskedToday = true;
      STATE._pendingPersonalQ = q.field;
      return q.msg(STATE.profile);
    }
  }

  // ── CAPTURE PERSONAL Q ANSWER ──
  if (STATE._pendingPersonalQ) {
    const field = STATE._pendingPersonalQ;
    STATE.profile[field] = input;
    STATE._pendingPersonalQ = null;
    saveState();
    const responses = [`noted. i'll remember that.`, `good to know, ${name}.`, `appreciate you sharing that.`, `filed away. i'll use that.`];
    return pick(responses);
  }

  // ── FALLBACK ──
  if (!STATE._chatMsgCount) STATE._chatMsgCount = 0;
  STATE._chatMsgCount++;
  const fallbacks = [`tell me more about that.`, `i hear you. anything i can do?`, `noted. what else is on your mind?`, `interesting. i'll keep that in mind, ${name}.`, `i'm here. whatever you need.`, `always on your side, ${name}.`];
  return pick(fallbacks);
}

document.getElementById('chat-send').onclick = () => {
  const input = document.getElementById('chat-input');
  handleChatInput(input.value);
  input.value = '';
};
document.getElementById('chat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { handleChatInput(e.target.value); e.target.value = ''; }
});
