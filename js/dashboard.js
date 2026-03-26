// ════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════

let _buddy3dCleanup = null;

// ════════════════════════════════════════════════════════
// CALENDAR TAB
// ════════════════════════════════════════════════════════
let _calDateOffset = 0; // 0=today, -1=yesterday, +1=tomorrow

async function initCalendar() {
  _calDateOffset = 0;
  await renderCalendar();
}

async function _calShift(dir) {
  _calDateOffset += dir;
  if (_calDateOffset < -1) _calDateOffset = -1;
  if (_calDateOffset > 1) _calDateOffset = 1;
  await renderCalendar();
}

async function renderCalendar() {
  const container = document.getElementById('calendar-content');
  if (!container) return;
  const datePill = document.getElementById('cal-date-pill');

  const target = new Date();
  target.setDate(target.getDate() + _calDateOffset);
  const dateStr = target.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const dayLabel = _calDateOffset === 0 ? 'Today' : _calDateOffset === -1 ? 'Yesterday' : 'Tomorrow';

  if (datePill) datePill.textContent = dateStr;

  // Date switcher
  const switcher = `
    <div style="display:flex;align-items:center;justify-content:center;gap:1rem;margin-bottom:1rem;">
      <button onclick="_calShift(-1)" style="background:none;border:1px solid var(--border);border-radius:8px;padding:6px 14px;cursor:pointer;font-size:0.85rem;color:var(--text-mid);${_calDateOffset <= -1 ? 'opacity:0.3;pointer-events:none;' : ''}">&larr;</button>
      <div style="text-align:center;">
        <div style="font-family:'Nunito',sans-serif;font-weight:800;font-size:1.3rem;color:var(--text);">${dayLabel}</div>
        <div style="font-size:0.8rem;color:var(--text-light);">${dateStr}</div>
      </div>
      <button onclick="_calShift(1)" style="background:none;border:1px solid var(--border);border-radius:8px;padding:6px 14px;cursor:pointer;font-size:0.85rem;color:var(--text-mid);${_calDateOffset >= 1 ? 'opacity:0.3;pointer-events:none;' : ''}">&rarr;</button>
    </div>`;

  // 7-day mini week
  const weekDays = [];
  const now = new Date();
  for (let i = -1; i <= 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const isSelected = i === _calDateOffset;
    const isToday = i === 0;
    weekDays.push(`<div onclick="_calDateOffset=${i};renderCalendar();" style="
      text-align:center;cursor:pointer;padding:6px 0;border-radius:10px;min-width:44px;
      ${isSelected ? 'background:var(--accent);color:var(--text);font-weight:700;' : ''}
      ${isToday && !isSelected ? 'border:1px solid var(--accent);' : ''}
    ">
      <div style="font-size:0.65rem;color:${isSelected ? 'var(--text)' : 'var(--text-faint)'};text-transform:uppercase;">${d.toLocaleDateString('en-US',{weekday:'short'})}</div>
      <div style="font-size:1rem;font-weight:600;">${d.getDate()}</div>
    </div>`);
  }
  const weekStrip = `<div style="display:flex;justify-content:space-between;gap:4px;margin-bottom:1.5rem;padding:0.5rem;background:var(--surface);border-radius:14px;">${weekDays.join('')}</div>`;

  container.innerHTML = switcher + weekStrip + '<div style="color:var(--text-light);text-align:center;padding:2rem;">Loading meetings...</div>';

  // Fetch events
  try {
    // Use local date, NOT UTC — toISOString converts to UTC which shifts the day
    const dateParam = target.getFullYear() + '-' + String(target.getMonth()+1).padStart(2,'0') + '-' + String(target.getDate()).padStart(2,'0');
    const res = await fetch(`/api/calendar/events?date=${dateParam}`);
    const data = await res.json();

    if (!data.ok || !data.events || data.events.length === 0) {
      container.innerHTML = switcher + weekStrip + `
        <div style="text-align:center;padding:3rem 1rem;">
          <div style="font-size:2rem;margin-bottom:0.5rem;">🎉</div>
          <div style="font-family:'Nunito',sans-serif;font-weight:800;font-size:1.2rem;color:var(--text);">No meetings ${dayLabel.toLowerCase()}</div>
          <div style="color:var(--text-light);font-size:0.85rem;margin-top:0.25rem;">enjoy the free time</div>
        </div>`;
      return;
    }

    const events = data.events.filter(e => !e.allDay);
    const allDay = data.events.filter(e => e.allDay);

    let html = '';

    // All-day events
    if (allDay.length) {
      html += allDay.map(e => `
        <div style="background:var(--accent-soft);border-radius:10px;padding:8px 14px;margin-bottom:0.5rem;font-size:0.8rem;color:var(--text-mid);">
          📌 ${e.title}
        </div>`).join('');
    }

    // Timeline
    const isPast = _calDateOffset < 0 || (_calDateOffset === 0);
    events.forEach(e => {
      const startTime = new Date(e.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const endTime = e.end ? new Date(e.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';
      const isExt = e.isExternal;
      const dotColor = isExt ? '#3B82F6' : '#10B981';
      const people = e.attendees?.filter(a => !a.self).map(a => a.name || a.email.split('@')[0]).slice(0, 3).join(', ') || '';
      const meetEnded = _calDateOffset < 0 || (_calDateOffset === 0 && e.end && new Date(e.end) < now);

      html += `
        <div onclick="this.querySelector('.cal-expand')?.classList.toggle('open')" style="
          display:flex;gap:0.75rem;padding:0.75rem 0;border-bottom:1px solid var(--border);cursor:pointer;
          ${meetEnded ? 'opacity:0.5;' : ''}
        ">
          <div style="width:55px;flex-shrink:0;text-align:right;">
            <div style="font-size:0.85rem;font-weight:600;color:var(--text);">${startTime}</div>
            <div style="font-size:0.7rem;color:var(--text-faint);">${endTime}</div>
          </div>
          <div style="width:3px;border-radius:2px;background:${dotColor};flex-shrink:0;"></div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;font-size:0.9rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.title}</div>
            ${people ? `<div style="font-size:0.75rem;color:var(--text-light);margin-top:2px;">${people}</div>` : ''}
            <div class="cal-expand" style="max-height:0;overflow:hidden;transition:max-height 0.3s;">
              <div style="padding-top:0.75rem;display:flex;flex-direction:column;gap:0.5rem;">
                ${e.meetLink ? `<a href="${e.meetLink}" target="_blank" style="display:inline-flex;align-items:center;gap:0.4rem;padding:6px 14px;background:${dotColor};color:white;border-radius:8px;font-size:0.75rem;font-weight:600;text-decoration:none;width:fit-content;">Join →</a>` : ''}
                <button onclick="event.stopPropagation();showMeetingPrep('${e.title.replace(/'/g, "\\'")}')" style="padding:6px 14px;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:8px;font-size:0.75rem;font-weight:600;cursor:pointer;width:fit-content;">${isExt ? '🔍 Intel' : '📋 Agenda'}</button>
                <textarea placeholder="your notes..." onclick="event.stopPropagation()" style="
                  width:100%;min-height:50px;resize:vertical;border:1px solid var(--border);border-radius:8px;
                  padding:8px;font-size:0.8rem;font-family:'Inter',sans-serif;background:var(--surface);color:var(--text);
                  box-sizing:border-box;
                "></textarea>
              </div>
            </div>
          </div>
        </div>`;
    });

    container.innerHTML = switcher + weekStrip + html;

    // Make expand animation work
    container.querySelectorAll('.cal-expand').forEach(el => {
      const parent = el.closest('[onclick]');
      if (parent) {
        parent.addEventListener('click', () => {
          if (el.classList.contains('open')) {
            el.style.maxHeight = el.scrollHeight + 'px';
          } else {
            el.style.maxHeight = '0';
          }
        });
      }
    });

  } catch (err) {
    container.innerHTML = switcher + weekStrip + `
      <div style="text-align:center;padding:2rem;color:var(--text-light);">
        <p>Calendar not connected</p>
        <a href="/api/connect/google" style="color:var(--accent-dark);text-decoration:underline;">Connect Google Calendar</a>
      </div>`;
  }
}
let _buddy3dState = null;
let _realCalendarEvents = null; // cached real calendar events

// ── Scratchpad ──
let _scratchpadTimeout = null;
function _saveScratchpad() {
  clearTimeout(_scratchpadTimeout);
  _scratchpadTimeout = setTimeout(() => {
    const el = document.getElementById('scratchpad');
    if (el) { STATE.scratchpad = el.value; saveState(); }
  }, 500);
}
function _clearScratchpad() {
  if (!confirm('clear your scratchpad?')) return;
  STATE.scratchpad = '';
  saveState();
  const el = document.getElementById('scratchpad');
  if (el) el.value = '';
}

// ── Idea Machine helpers ──
let _ideaTimeout;
function _saveIdeaRaw() {
  clearTimeout(_ideaTimeout);
  _ideaTimeout = setTimeout(() => {
    const el = document.getElementById('idea-machine-input');
    if (!el) return;
    if (!STATE.ideaMachine) STATE.ideaMachine = { notes: [], raw: '' };
    STATE.ideaMachine.raw = el.value;
    saveState();
  }, 500);
}

function _clearIdeas() {
  if (!confirm('clear all notes?')) return;
  STATE.ideaMachine = { notes: [], raw: '' };
  saveState();
  initLife();
}

function _toggleIdeaTask(idx) {
  if (!STATE.ideaMachine?.notes?.[idx]) return;
  STATE.ideaMachine.notes[idx].done = !STATE.ideaMachine.notes[idx].done;
  saveState();
  initLife();
}

async function _organizeIdeas() {
  const el = document.getElementById('idea-machine-input');
  if (!el || !el.value.trim()) return;
  const raw = el.value.trim();
  const btn = el.parentElement.querySelector('button');
  if (btn) { btn.textContent = 'thinking...'; btn.disabled = true; }
  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Categorize each line or thought from this brain dump into exactly one of: task, idea, reminder, journal. Return ONLY a JSON array like [{"type":"task","text":"..."},{"type":"idea","text":"..."}]. No markdown, no explanation. Here's the text:\n\n${raw}`,
        context: 'idea-machine'
      })
    });
    const data = await resp.json();
    const reply = data.reply || data.response || '';
    // Extract JSON array from response
    const match = reply.match(/\[[\s\S]*\]/);
    if (match) {
      const notes = JSON.parse(match[0]);
      if (!STATE.ideaMachine) STATE.ideaMachine = { notes: [], raw: '' };
      STATE.ideaMachine.notes = notes.map(n => ({ ...n, done: false }));
      STATE.ideaMachine.raw = raw;
      saveState();
      initLife();
    }
  } catch (e) {
    console.error('Idea organize failed:', e);
    if (btn) { btn.textContent = 'organize my thoughts'; btn.disabled = false; }
  }
}

// ── Fetch real calendar and refresh the UPCOMING widget ──
async function _fetchRealCalendar() {
  try {
    const res = await fetch('/api/calendar/events');
    const data = await res.json();
    if (data.ok && data.events?.length >= 0) {
      // Convert API format to the format getMockCalendar uses
      _realCalendarEvents = data.events.map(ev => {
        const start = ev.allDay ? null : new Date(ev.start);
        const end = ev.allDay ? null : new Date(ev.end);
        const time = ev.allDay ? 'all day' : start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false }).replace(/^0/, '');
        const endTime = ev.allDay ? '' : end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false }).replace(/^0/, '');
        const people = ev.attendees?.filter(a => !a.self).map(a => a.name) || [];
        return {
          time,
          end: endTime,
          title: ev.title,
          people,
          type: ev.isExternal ? 'important' : 'meeting',
          prep: ev.isExternal ? { context: 'loading...', theyWant: '', youShould: '' } : null,
          account: ev.title, // used for meeting prep lookups
          allDay: ev.allDay,
          meetLink: ev.meetLink,
          htmlLink: ev.htmlLink,
          isExternal: ev.isExternal,
          attendees: ev.attendees,
        };
      });

      // Override getMockCalendar globally so all existing UI uses real data
      window._originalGetMockCalendar = window._originalGetMockCalendar || (typeof getMockCalendar === 'function' ? getMockCalendar : null);
      window.getMockCalendar = () => _realCalendarEvents;

      // Re-render the dashboard with real data
      const content = document.getElementById('dash-content');
      const greetingArea = content?.querySelector('.dash-greeting-area');
      if (greetingArea && !document.getElementById('dash-chat-area')) {
        // Only refresh if we're not in chat mode
        renderDashContent();
      }
      return _realCalendarEvents;
    }
  } catch (e) {
    console.log('[calendar] Real calendar unavailable, using mock:', e.message);
  }
  return null;
}

// ── Fetch real Gmail and refresh MESSAGES widget ──
async function _fetchRealGmail() {
  try {
    const res = await fetch('/api/gmail/inbox');
    const data = await res.json();
    if (data.ok && data.messages?.length >= 0) {
      _refreshMessagesWidget(data.messages);
    } else if (data.authUrl) {
      // Gmail not authorized — show connect prompt in messages widget
      _refreshMessagesWidget(null, true);
    }
  } catch (e) {
    console.log('[gmail] Real gmail unavailable:', e.message);
  }
}

function _refreshMessagesWidget(messages, needsAuth) {
  // Find the MESSAGES widget
  const widgets = document.querySelectorAll('.dash-widget-title');
  let card = null;
  widgets.forEach(w => { if (w.textContent.includes('MESSAGES') || w.textContent.includes('INBOX')) card = w.closest('.dash-widget-card'); });
  if (!card) return;

  if (needsAuth) {
    card.innerHTML = `<div class="dash-widget-title">📧 INBOX</div>
      <a href="/api/connect/google" style="font-size:0.78rem;color:var(--accent);text-decoration:none;">connect Gmail →</a>`;
    return;
  }

  const unread = messages.slice(0, 4);
  const count = messages.length;

  let html = `<div class="dash-widget-title">📧 INBOX</div>`;
  if (count > 0) {
    html += `<div style="font-size:0.72rem;color:var(--coral);font-weight:600;margin-bottom:0.4rem;">${count} unread</div>`;
    html += unread.map(m =>
      `<div style="display:flex;gap:0.5rem;align-items:center;padding:0.25rem 0;">
        <span style="font-size:0.7rem;">${m.isExternal ? '🔵' : '💬'}</span>
        <div style="min-width:0;flex:1;">
          <div style="font-size:0.78rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.from}</div>
          <div style="font-size:0.65rem;color:var(--text-light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${m.subject}</div>
        </div>
      </div>`
    ).join('');
  } else {
    html += '<div style="font-size:0.78rem;color:var(--text-light);">inbox zero ✨</div>';
  }

  card.innerHTML = html;
}

// ── Fetch tomorrow's events for "day is done" card ──
function _fetchTomorrowPreview() {
  const el = document.getElementById('tomorrow-events');
  if (!el) return;

  const events = _realCalendarEvents || [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Filter for tomorrow's events (real calendar returns today + tomorrow)
  const tomorrowEvents = events.filter(ev => {
    if (ev.allDay) return false;
    // Check if the event's start time suggests it's tomorrow
    const evTime = ev.time?.match(/(\d+):(\d+)/);
    if (!evTime) return false;
    // If we only have today's data, we can't distinguish — show all future
    return true;
  });

  // Since our API returns today + tomorrow, events after current time are either later today or tomorrow
  // For now show a clean message; real tomorrow data will populate when calendar is connected
  if (tomorrowEvents.length === 0) {
    el.innerHTML = '<span style="color:var(--text-faint);">connect your calendar to see tomorrow\'s schedule</span>';
    return;
  }

  // Show up to 4 tomorrow events
  const preview = tomorrowEvents.slice(0, 4);
  el.innerHTML = preview.map(ev => {
    const isExt = ev.isExternal;
    const dot = isExt ? '🔵' : '🟢';
    return `<div style="display:flex;align-items:center;gap:0.5rem;padding:0.25rem 0;">
      <span style="font-size:0.5rem;">${dot}</span>
      <span style="font-size:0.72rem;color:var(--text-light);min-width:36px;">${ev.time}</span>
      <span style="font-size:0.8rem;color:var(--text);">${ev.title}</span>
    </div>`;
  }).join('') + (tomorrowEvents.length > 4 ? `<div style="font-size:0.72rem;color:var(--text-faint);margin-top:0.25rem;">+ ${tomorrowEvents.length - 4} more</div>` : '');
}

function _refreshUpcomingWidget() {
  const widget = document.querySelector('.dash-widget-title');
  if (!widget || !widget.textContent.includes('UPCOMING')) return;
  const card = widget.closest('.dash-widget-card');
  if (!card) return;

  const events = _realCalendarEvents || [];
  const eventsToShow = events.filter(e => !e.allDay).slice(0, 3);

  const calHtml = eventsToShow.length ? eventsToShow.map(ev =>
    `<div style="display:flex;gap:0.6rem;align-items:flex-start;padding:0.3rem 0;">
      <span style="font-size:0.72rem;color:var(--text-light);min-width:36px;font-family:'JetBrains Mono',monospace;">${ev.time}</span>
      <span style="font-size:0.78rem;color:var(--text);font-weight:500;">${ev.title}</span>
    </div>`
  ).join('') : '<div style="font-size:0.78rem;color:var(--text-light);">no more meetings today ✨</div>';

  card.innerHTML = `<div class="dash-widget-title">📅 UPCOMING</div>${calHtml}`;
}

function buddyReactToTyping(text) {
  if (_buddy3dState && _buddy3dState.reactToInput) {
    _buddy3dState.reactToInput(text);
  }
}

function initBuddy3D(containerOrCanvas) {
  if (_buddy3dCleanup) _buddy3dCleanup();
  let container = containerOrCanvas;
  if (!container) {
    container = document.getElementById('buddy-3d-inline');
    if (!container) return;
  }
  if (container.tagName === 'CANVAS') {
    container = container.parentElement;
  }
  container.innerHTML = '';
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

function setFocus(focusId) {
  STATE.activeFocus = focusId;
  saveState();
  renderDashBody();
}

function runAction(el, title) {
  // Navigate to chat and pre-fill the action as a message
  goTo('chat');
  initChat();
  const input = document.getElementById('chat-input');
  if (input) {
    input.value = title;
    input.focus();
  }
}

function initDashboard() {
  if (_buddy3dCleanup) { _buddy3dCleanup(); _buddy3dCleanup = null; }
  updateStreak();
  generateDailyQuestsIfNeeded();
  renderDashDatePill();
  renderDashContent();
  renderBottomSheet();

  // Fetch real data in background — updates widgets when ready
  _fetchRealCalendar().then(() => _fetchTomorrowPreview());
  _fetchRealGmail();
}

function renderDashDatePill() {
  const now = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const h = now.getHours(); const m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const timeStr = `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')}${ampm}`;
  const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  const pill = document.getElementById('dash-date-pill');
  if (pill) pill.innerHTML = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;margin-right:6px;vertical-align:middle;"></span>${dateStr} \u2022 ${timeStr}`;
}

function renderDashSidebar() {
  const sidebar = document.getElementById('dash-sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = '';

  const roleKey = STATE.role || 'sales';
  const roleData = (typeof ROLE_DATA !== 'undefined' && ROLE_DATA[roleKey]) ? ROLE_DATA[roleKey] : null;
  if (!roleData) return;

  // Role card
  const roleCard = document.createElement('div');
  roleCard.className = 'dash-sidebar-role';
  roleCard.innerHTML = `
    <span style="font-size:1.3rem;">${roleData.icon}</span>
    <div>
      <div class="dash-sidebar-role-name">${roleData.name}</div>
    </div>
    <span class="dash-sidebar-role-change" onclick="goTo('welcome')">change</span>
  `;
  sidebar.appendChild(roleCard);

  // Focus areas label
  const label = document.createElement('div');
  label.className = 'dash-sidebar-label';
  label.textContent = 'Focus Areas';
  sidebar.appendChild(label);

  // Determine active focus
  const activeFocus = STATE.activeFocus || roleData.focusAreas[0]?.id;

  // Focus area items
  roleData.focusAreas.forEach(fa => {
    const item = document.createElement('div');
    item.className = 'dash-focus-item' + (fa.id === activeFocus ? ' active' : '');
    const actionCount = fa.actions ? fa.actions.length : 0;
    item.innerHTML = `
      <span>${fa.icon}</span>
      <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${fa.name}</span>
      <span class="dash-focus-count">${actionCount}</span>
    `;
    item.onclick = () => setDashFocus(fa.id);
    sidebar.appendChild(item);
  });
}

function _getContextualChips() {
  const chips = [];

  // From calendar — next meeting that needs prep
  if (typeof getMockCalendar === 'function') {
    const events = getMockCalendar();
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const upcoming = events.find(ev => {
      const [h, m] = ev.time.split(':').map(Number);
      return h * 60 + m > currentMin && ev.prep;
    });
    if (upcoming) {
      chips.push({
        icon: '\uD83D\uDCC5',
        text: `prep for ${upcoming.title}`,
        color: '#9DBF10',
        action: () => { if (typeof showMeetingPrep === 'function') showMeetingPrep(upcoming.title); }
      });
    }
  }

  // From Slack — unread DMs waiting on reply
  if (typeof getMockSlack === 'function') {
    const slack = getMockSlack();
    const waiting = slack.dms?.find(d => d.unread && d.waitingOnYou);
    if (waiting) {
      chips.push({
        icon: '\uD83D\uDCAC',
        text: `reply to ${waiting.from}`,
        color: '#E91E63',
        action: () => { _startDashChat(`reply to ${waiting.from}`); }
      });
    }
  }

  // From Email — needs reply
  if (typeof getMockEmails === 'function') {
    const emails = getMockEmails();
    const urgent = emails.needsReply?.find(e => e.urgent);
    if (urgent) {
      chips.push({
        icon: '\uD83D\uDCE7',
        text: `respond to ${urgent.from}`,
        color: '#2196F3',
        action: () => { _startDashChat(`respond to ${urgent.from} email`); }
      });
    }
  }

  // From company tasks — overdue or due soon
  if (typeof COMPANY_TASKS !== 'undefined') {
    const now = new Date();
    const dueSoon = COMPANY_TASKS.find(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      const daysUntil = (due - now) / (1000 * 60 * 60 * 24);
      return daysUntil >= 0 && daysUntil <= 3;
    });
    if (dueSoon) {
      chips.push({
        icon: '\u26A1',
        text: dueSoon.title.toLowerCase().substring(0, 40),
        color: '#FF9800',
        action: () => { _startDashChat(dueSoon.buddyMsg || dueSoon.title); }
      });
    }
  }

  return chips.slice(0, 3);
}

function renderDashContent() {
  const content = document.getElementById('dash-content');
  if (!content) return;
  content.innerHTML = '';

  const roleKey = STATE.role || 'sales';
  const roleData = (typeof ROLE_DATA !== 'undefined' && ROLE_DATA[roleKey]) ? ROLE_DATA[roleKey] : null;

  // ── Greeting with typing animation ──
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  // Get name from state
  let name = STATE.profile.userName || '';
  if (!name || name.length < 2) name = 'there';
  const greetingText = `${greeting}, ${name}!`;

  const greetingArea = document.createElement('div');
  greetingArea.className = 'dash-greeting-area';
  // Build widget cards from real data
  const calEvents = (typeof getMockCalendar === 'function') ? getMockCalendar().slice(0, 3) : [];
  const slackData = (typeof getMockSlack === 'function') ? getMockSlack() : { dms: [], waitingOnYou: 0 };
  const emailData = (typeof getMockEmails === 'function') ? getMockEmails() : { needsReply: [] };
  const waitingCount = (slackData.waitingOnYou || 0) + (emailData.needsReply?.length || 0);
  const slackUnread = slackData.dms?.filter(d => d.unread) || [];
  const emailUrgent = emailData.needsReply?.slice(0, 2) || [];

  const calHtml = calEvents.map(ev =>
    `<div style="display:flex;gap:0.6rem;align-items:flex-start;padding:0.3rem 0;">
      <span style="font-size:0.72rem;color:var(--text-light);min-width:36px;font-family:'JetBrains Mono',monospace;">${ev.time}</span>
      <span style="font-size:0.78rem;color:var(--text);font-weight:500;">${ev.title}</span>
    </div>`
  ).join('');

  const commsItems = [];
  slackUnread.forEach(d => commsItems.push(`<div style="display:flex;gap:0.5rem;align-items:center;padding:0.25rem 0;"><span style="font-size:0.7rem;">💬</span><span style="font-size:0.78rem;font-weight:500;">${d.from}</span></div>`));
  emailUrgent.forEach(e => commsItems.push(`<div style="display:flex;gap:0.5rem;align-items:center;padding:0.25rem 0;"><span style="font-size:0.7rem;">📧</span><span style="font-size:0.78rem;font-weight:500;">${e.from}</span></div>`));

  // Build NOW card — next upcoming meeting with smart treatment
  const allEvents = (typeof getMockCalendar === 'function') ? getMockCalendar() : [];
  const now = new Date();
  const nowHours = now.getHours();
  const nowMins = now.getMinutes();
  const nowTotal = nowHours * 60 + nowMins;

  // Find next non-allDay meeting
  const nextMeeting = allEvents.find(ev => {
    if (ev.allDay) return false;
    const timeParts = ev.time?.match(/(\d+):(\d+)/);
    if (!timeParts) return false;
    const evTotal = parseInt(timeParts[1]) * 60 + parseInt(timeParts[2]);
    return evTotal >= nowTotal - 15; // include current meetings (started up to 15 min ago)
  });

  // Remaining meetings after the next one
  const laterMeetings = allEvents.filter(ev => {
    if (ev.allDay || ev === nextMeeting) return false;
    const timeParts = ev.time?.match(/(\d+):(\d+)/);
    if (!timeParts) return false;
    const evTotal = parseInt(timeParts[1]) * 60 + parseInt(timeParts[2]);
    return evTotal > nowTotal;
  }).slice(0, 4);

  // Tomorrow's meetings (for end-of-day prep)
  const tomorrowEvents = allEvents.filter(ev => {
    if (ev.allDay) return false;
    // If we have real calendar, events from tomorrow will have different dates
    // For mock data, just show last few events as "tomorrow"
    const timeParts = ev.time?.match(/(\d+):(\d+)/);
    if (!timeParts) return false;
    return false; // Will be populated when real calendar returns 2 days
  });

  let nowCardHtml = '';
  if (nextMeeting) {
    const isExt = nextMeeting.isExternal;
    const borderColor = isExt ? '#3B82F6' : '#10B981';
    const badge = isExt ? '<span style="font-size:0.6rem;background:#3B82F6;color:white;padding:2px 8px;border-radius:50px;font-weight:600;letter-spacing:0.05em;">EXTERNAL</span>' : '<span style="font-size:0.6rem;background:#10B981;color:white;padding:2px 8px;border-radius:50px;font-weight:600;letter-spacing:0.05em;">INTERNAL</span>';
    const people = nextMeeting.people?.join(', ') || nextMeeting.attendees?.filter(a => !a.self).map(a => a.name).join(', ') || '';
    const joinBtn = nextMeeting.meetLink ? `<a href="${nextMeeting.meetLink}" target="_blank" style="display:inline-flex;align-items:center;gap:0.4rem;padding:8px 16px;background:${borderColor};color:white;border-radius:10px;font-size:0.78rem;font-weight:600;text-decoration:none;transition:opacity 0.2s;">Join →</a>` : '';
    const prepBtn = `<button onclick="showMeetingPrep('${nextMeeting.title.replace(/'/g, "\\'")}')" style="display:inline-flex;align-items:center;gap:0.4rem;padding:8px 16px;background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:10px;font-size:0.78rem;font-weight:600;cursor:pointer;transition:all 0.2s;">${isExt ? '🔍 View Prep' : '📋 Suggested Agenda'}</button>`;

    nowCardHtml = `
      <div id="now-card" style="background:var(--surface);border-radius:16px;border-left:4px solid ${borderColor};padding:1.25rem;margin-bottom:1rem;box-shadow:0 1px 8px rgba(0,0,0,0.04);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem;">
          <div style="font-size:0.7rem;color:var(--text-light);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">UP NEXT</div>
          ${badge}
        </div>
        <div style="font-family:'Nunito',sans-serif;font-weight:800;font-size:1.15rem;color:var(--text);margin-bottom:0.25rem;">${nextMeeting.title}</div>
        <div style="font-size:0.8rem;color:var(--text-light);margin-bottom:0.75rem;">${nextMeeting.time}${nextMeeting.end ? ' – ' + nextMeeting.end : ''}${people ? ' · ' + people : ''}</div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          ${joinBtn}
          ${prepBtn}
        </div>
      </div>`;
  } else {
    // Day is done — show wrap-up with tomorrow preview
    const completedCount = allEvents.filter(e => !e.allDay).length;
    const privCheck = STATE.privacy || {};
    nowCardHtml = `
      <div id="now-card" style="background:var(--surface);border-radius:16px;border-left:4px solid #8B5CF6;padding:1.25rem;margin-bottom:1rem;box-shadow:0 1px 8px rgba(0,0,0,0.04);">
        <div style="font-size:0.7rem;color:var(--text-light);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.75rem;">YOUR DAY</div>
        <div style="font-family:'Nunito',sans-serif;font-weight:800;font-size:1.15rem;color:var(--text);margin-bottom:0.25rem;">you're done for today ✨</div>
        <div style="font-size:0.85rem;color:var(--text-light);line-height:1.6;margin-bottom:0.75rem;">
          ${completedCount > 0 ? completedCount + ' meeting' + (completedCount > 1 ? 's' : '') + ' completed.' : 'clear day.'}
          ${privCheck.postMeetingTranscript ? ' check summaries below.' : ''}
        </div>
        <div style="border-top:1px solid var(--border);padding-top:0.75rem;">
          <div style="font-size:0.7rem;color:#8B5CF6;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">PREP FOR TOMORROW</div>
          <div style="font-size:0.8rem;color:var(--text-light);" id="tomorrow-events">loading tomorrow's schedule...</div>
        </div>
      </div>`;
  }

  // Later meetings — compact pills
  let laterHtml = '';
  if (laterMeetings.length) {
    laterHtml = `<div style="margin-bottom:1rem;">
      <div style="font-size:0.7rem;color:var(--text-light);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">LATER TODAY</div>
      ${laterMeetings.map(ev => {
        const isExt = ev.isExternal;
        const dot = isExt ? '🔵' : '🟢';
        return `<div style="display:flex;align-items:center;gap:0.6rem;padding:0.35rem 0;">
          <span style="font-size:0.5rem;">${dot}</span>
          <span style="font-size:0.72rem;color:var(--text-light);min-width:36px;">${ev.time}</span>
          <span style="font-size:0.8rem;color:var(--text);font-weight:500;">${ev.title}</span>
        </div>`;
      }).join('')}
    </div>`;
  }

  // Completed meetings — past meetings today
  const doneMeetings = allEvents.filter(ev => {
    if (ev.allDay) return false;
    const timeParts = ev.time?.match(/(\d+):(\d+)/);
    if (!timeParts) return false;
    const endParts = ev.end?.match(/(\d+):(\d+)/);
    if (!endParts) return false;
    const endTotal = parseInt(endParts[1]) * 60 + parseInt(endParts[2]);
    return endTotal <= nowTotal && ev !== nextMeeting;
  }).slice(-4); // last 4 completed meetings

  const priv = STATE.privacy || {};
  let doneHtml = '';
  if (doneMeetings.length) {
    doneHtml = `<div style="margin-bottom:1rem;">
      <div style="font-size:0.7rem;color:var(--text-light);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">DONE</div>
      ${doneMeetings.map(ev => {
        const isExt = ev.isExternal;
        const dot = isExt ? '🔵' : '🟢';
        const summaryBtn = priv.postMeetingTranscript
          ? `<button onclick="processMeeting('${ev.title.replace(/'/g, "\\'")}')" style="font-size:0.65rem;padding:3px 8px;border-radius:6px;border:1px solid var(--border);background:none;color:var(--text-light);cursor:pointer;">get summary</button>`
          : '';
        return `<div style="display:flex;align-items:center;gap:0.6rem;padding:0.35rem 0;opacity:0.6;">
          <span style="font-size:0.5rem;">${dot}</span>
          <span style="font-size:0.72rem;color:var(--text-light);min-width:36px;">${ev.time}</span>
          <span style="font-size:0.8rem;color:var(--text);font-weight:500;flex:1;">${ev.title}</span>
          ${summaryBtn}
        </div>`;
      }).join('')}
    </div>`;
  }

  // Messages summary
  const msgCount = waitingCount + commsItems.length;
  const msgHtml = msgCount > 0 ? `<div class="dash-widget-card" style="margin-bottom:1rem;">
    <div class="dash-widget-title">💬 MESSAGES</div>
    ${waitingCount > 0 ? `<div style="font-size:0.72rem;color:var(--coral);font-weight:600;margin-bottom:0.4rem;">${waitingCount} need your attention</div>` : ''}
    ${commsItems.join('') || ''}
  </div>` : '';

  greetingArea.innerHTML = `
    <!-- Buddy Avatar — hero position -->
    <div id="buddy-3d-inline" style="width:160px;height:160px;margin:0 auto 0.5rem;pointer-events:none;"></div>

    <h1 id="dash-greeting-text" style="margin-bottom:0.75rem;text-align:center;"></h1>

    <!-- Command Bar — the main experience -->
    <div style="position:relative;margin:0 0 0.5rem;">
      <div style="background:var(--surface);border-radius:20px;padding:4px;box-shadow:0 2px 16px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.04);">
        <div style="display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1.25rem;">
          <input type="text" id="dash-ai-input" placeholder="ask buddy anything..."
            onkeydown="if(event.key==='Enter')dashAskQuestion()"
            oninput="buddyReactToTyping(this.value)"
            style="flex:1;border:none;outline:none;background:none;font-size:1.05rem;font-family:'Inter',sans-serif;color:var(--text);padding:0;" />
          <button id="dash-ai-send" onclick="dashAskQuestion()" style="width:38px;height:38px;border-radius:50%;background:var(--text);border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform 0.15s;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;
  content.appendChild(greetingArea);

  // Trigger typing animation
  const greetingEl = document.getElementById('dash-greeting-text');
  if (greetingEl) {
    typeGreeting(greetingEl, greetingText, 40);
    // Fade in subtitle after typing finishes
    setTimeout(() => {
      const sub = document.querySelector('.dash-greeting-sub');
      if (sub) sub.classList.add('visible');
    }, greetingText.length * 40 + 200);
  }

  // ── Contextual action chips ──
  const chips = _getContextualChips();
  if (chips.length) {
    const chipsWrap = document.createElement('div');
    chipsWrap.className = 'dash-ctx-chips';
    chipsWrap.innerHTML = chips.map((c, i) =>
      `<button class="dash-ctx-chip" data-chip="${i}" style="--chip-color: ${c.color}">
        <span>${c.icon}</span> ${c.text}
      </button>`
    ).join('');
    content.appendChild(chipsWrap);
    // Store chip actions for onclick
    window._chipActions = chips.map(c => c.action);
    chipsWrap.querySelectorAll('.dash-ctx-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.chip);
        if (window._chipActions && window._chipActions[idx]) window._chipActions[idx]();
      });
    });
  }

  // ── Explore Actions button ──
  const exploreBtn = document.createElement('button');
  exploreBtn.className = 'dash-explore-btn';
  exploreBtn.innerHTML = `✨ Explore Actions`;
  exploreBtn.onclick = () => openBottomSheet();
  content.appendChild(exploreBtn);

  // 3D Buddy is now inline above the chat bar — init it
  setTimeout(() => initBuddy3D(), 50);

  // Bottom spacer
  const spacer = document.createElement('div');
  spacer.style.height = '4rem';
  content.appendChild(spacer);
}

// ═══ Bottom Sheet (Explore Actions) ═══
function renderBottomSheet() {
  // Remove existing sheet
  document.querySelectorAll('.dash-sheet-overlay, .dash-sheet').forEach(el => el.remove());

  const roleKey = STATE.role || 'sales';
  const roleData = (typeof ROLE_DATA !== 'undefined' && ROLE_DATA[roleKey]) ? ROLE_DATA[roleKey] : null;
  if (!roleData) return;

  // Overlay
  const overlay = document.createElement('div');
  overlay.className = 'dash-sheet-overlay';
  overlay.onclick = () => closeBottomSheet();
  document.body.appendChild(overlay);

  // Sheet
  const sheet = document.createElement('div');
  sheet.className = 'dash-sheet';
  sheet.id = 'dash-sheet';

  const activeFocusId = STATE.activeFocus || roleData.focusAreas[0]?.id;
  const activeCategory = STATE.activeCategory || 'all';

  // Header + handle
  let html = `<div class="dash-sheet-handle"></div>`;
  html += `<div class="dash-sheet-header">
    <span class="dash-sheet-title">Explore Actions</span>
    <button class="dash-sheet-close" onclick="closeBottomSheet()">✕</button>
  </div>`;

  // Company section
  if (typeof EMPLOYEE_HELP !== 'undefined') {
    html += `<div style="margin-bottom:1rem;">
      <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9A96A8;margin-bottom:0.5rem;">COMPANY</div>
      <button class="dash-sheet-cat" onclick="showEmployeeHelp()" style="width:100%;background:#F5F4F7;">
        <span class="dash-sheet-cat-icon">${EMPLOYEE_HELP.icon}</span>
        <span class="dash-sheet-cat-name">${EMPLOYEE_HELP.label}</span>
      </button>
    </div>`;
  }

  // Knowledge section
  if (typeof KNOWLEDGE_ACTIONS !== 'undefined') {
    html += `<div style="margin-bottom:1rem;">
      <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9A96A8;margin-bottom:0.5rem;">KNOWLEDGE</div>
      <div class="dash-sheet-categories" style="grid-template-columns:repeat(3,1fr);">`;
    KNOWLEDGE_ACTIONS.categories.forEach(cat => {
      html += `<button class="dash-sheet-cat" onclick="showKnowledgeCategory('${cat.id}')">
        <span class="dash-sheet-cat-icon">${cat.icon}</span>
        <span class="dash-sheet-cat-name">${cat.name}</span>
      </button>`;
    });
    html += `</div></div>`;
  }

  // Category grid (focus areas)
  html += `<div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9A96A8;margin-bottom:0.5rem;">FOCUS AREAS</div>`;
  html += `<div class="dash-sheet-categories" id="sheet-categories">`;
  roleData.focusAreas.forEach(fa => {
    html += `<button class="dash-sheet-cat${fa.id === activeFocusId ? ' active' : ''}" onclick="sheetSelectFocus('${fa.id}')">
      <span class="dash-sheet-cat-icon">${fa.icon}</span>
      <span class="dash-sheet-cat-name">${fa.name}</span>
    </button>`;
  });
  html += `</div>`;

  // Category filter tabs
  html += `<div class="dash-category-tabs" id="sheet-cat-tabs">`;
  [{ key: 'all', label: 'All' }, { key: 'question', label: 'Questions' }, { key: 'automation', label: 'Automations' }, { key: 'action', label: 'Actions' }, { key: 'generator', label: 'Generate' }].forEach(cat => {
    html += `<button class="dash-category-tab${activeCategory === cat.key ? ' active' : ''}" onclick="sheetSelectCategory('${cat.key}')">${cat.label}</button>`;
  });
  html += `</div>`;

  // Prompt list
  html += `<div class="dash-sheet-prompts" id="sheet-prompts"></div>`;

  sheet.innerHTML = html;
  document.body.appendChild(sheet);

  // Render prompts
  renderSheetPrompts();
}

function renderSheetPrompts() {
  const container = document.getElementById('sheet-prompts');
  if (!container) return;

  const roleKey = STATE.role || 'sales';
  const roleData = (typeof ROLE_DATA !== 'undefined' && ROLE_DATA[roleKey]) ? ROLE_DATA[roleKey] : null;
  if (!roleData) return;

  const activeFocusId = STATE.activeFocus || roleData.focusAreas[0]?.id;
  const activeCategory = STATE.activeCategory || 'all';
  const focusArea = roleData.focusAreas.find(fa => fa.id === activeFocusId) || roleData.focusAreas[0];
  if (!focusArea) return;

  const actions = focusArea.actions || [];
  const filtered = activeCategory === 'all' ? actions : actions.filter(a => a.category === activeCategory);

  // Stagger animation for prompts
  const staggerPrompts = (el) => {
    const items = el.querySelectorAll('.dash-sheet-prompt');
    items.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(12px)';
      item.style.transition = 'all 0.4s ease';
      requestAnimationFrame(() => {
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, i * 50);
      });
    });
  };

  container.innerHTML = filtered.map((action, idx) => {
    const catStyle = (typeof CATEGORY_STYLES !== 'undefined' && CATEGORY_STYLES[action.category])
      ? CATEGORY_STYLES[action.category]
      : { icon: '', label: action.category, bg: '#f0f0f0', text: '#666' };

    const hasTemplate = action.template && action.template.length > 0;

    // Replace ___ in title with styled blanks
    let displayTitle = action.title;
    if (hasTemplate) {
      let slotIdx = 0;
      displayTitle = action.title.replace(/___/g, () => {
        const tmpl = action.template[slotIdx] || action.template[0];
        slotIdx++;
        return `<span style="border-bottom:2px dashed var(--accent);color:var(--accent-dark);font-weight:600;padding:0 2px;">___</span>`;
      });
    }

    // Template inputs (shown on click)
    let templateHtml = '';
    if (hasTemplate) {
      templateHtml = `<div class="action-template-inputs" id="tmpl-${idx}" style="display:none;margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--border);">`;
      action.template.forEach((t, ti) => {
        if (t.options) {
          templateHtml += `<div style="margin-bottom:0.5rem;">
            <label style="font-size:0.7rem;color:var(--text-light);display:block;margin-bottom:4px;">${t.slot}</label>
            <select class="tmpl-input" data-slot="${ti}" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:10px;font-size:0.85rem;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;">
              ${t.options.map(o => `<option value="${o}">${o}</option>`).join('')}
            </select>
          </div>`;
        } else {
          templateHtml += `<div style="margin-bottom:0.5rem;">
            <label style="font-size:0.7rem;color:var(--text-light);display:block;margin-bottom:4px;">${t.slot}</label>
            <input type="text" class="tmpl-input" data-slot="${ti}" placeholder="${t.placeholder || ''}" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:10px;font-size:0.85rem;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;box-sizing:border-box;" />
          </div>`;
        }
      });
      templateHtml += `<button onclick="runTemplateAction(${idx})" style="width:100%;padding:10px;background:var(--accent);border:none;border-radius:10px;font-weight:700;font-size:0.85rem;cursor:pointer;font-family:'Inter',sans-serif;margin-top:0.25rem;">Run</button>`;
      templateHtml += `</div>`;
    }

    const clickHandler = hasTemplate
      ? `toggleTemplate(${idx})`
      : `sheetRunAction('${action.title.replace(/'/g, "\\'")}')`;

    return `<div class="dash-sheet-prompt" onclick="${clickHandler}">
      <span class="dash-sheet-prompt-badge" style="background:${catStyle.bg};color:${catStyle.text};">${catStyle.icon}</span>
      <div style="flex:1;">
        <div class="dash-sheet-prompt-text">${displayTitle}</div>
        <div class="dash-sheet-prompt-meta">${action.meta || ''}</div>
        ${templateHtml}
      </div>
    </div>`;
  }).join('');

  // Apply stagger animation
  requestAnimationFrame(() => staggerPrompts(container));
}

function openBottomSheet() {
  document.querySelector('.dash-sheet-overlay')?.classList.add('open');
  document.querySelector('.dash-sheet')?.classList.add('open');
}

function closeBottomSheet() {
  document.querySelector('.dash-sheet-overlay')?.classList.remove('open');
  document.querySelector('.dash-sheet')?.classList.remove('open');
}

function showEmployeeHelp() {
  const sheet = document.getElementById('dash-sheet');
  if (!sheet || typeof EMPLOYEE_HELP === 'undefined') return;

  let html = `<div class="dash-sheet-handle"></div>`;
  html += `<div class="dash-sheet-header">
    <span class="dash-sheet-title">${EMPLOYEE_HELP.icon} ${EMPLOYEE_HELP.label}</span>
    <button class="dash-sheet-close" onclick="renderBottomSheet(); openBottomSheet();">← Back</button>
  </div>`;

  // Employee help categories
  html += `<div class="dash-sheet-categories" id="sheet-emp-cats">`;
  EMPLOYEE_HELP.categories.forEach(cat => {
    html += `<button class="dash-sheet-cat" onclick="showEmployeeHelpCategory('${cat.id}')">
      <span class="dash-sheet-cat-icon">${cat.icon}</span>
      <span class="dash-sheet-cat-name">${cat.name}</span>
    </button>`;
  });
  html += `</div>`;

  // Prompt list container
  html += `<div class="dash-sheet-prompts" id="sheet-emp-prompts"></div>`;

  sheet.innerHTML = html;
}

function showEmployeeHelpCategory(catId) {
  if (typeof EMPLOYEE_HELP === 'undefined') return;
  const cat = EMPLOYEE_HELP.categories.find(c => c.id === catId);
  if (!cat) return;

  const container = document.getElementById('sheet-emp-prompts');
  if (!container) return;

  // Highlight active category
  document.querySelectorAll('#sheet-emp-cats .dash-sheet-cat').forEach(el => el.classList.remove('active'));
  event.target.closest('.dash-sheet-cat')?.classList.add('active');

  const catStyles = typeof CATEGORY_STYLES !== 'undefined' ? CATEGORY_STYLES : {};
  container.innerHTML = cat.actions.map(action => {
    const catStyle = catStyles[action.category] || { icon: '', label: action.category, bg: '#f0f0f0', text: '#666' };
    return `<div class="dash-sheet-prompt" onclick="sheetRunAction('${action.title.replace(/'/g, "\\'")}')">
      <span class="dash-sheet-prompt-badge" style="background:${catStyle.bg};color:${catStyle.text};">${catStyle.icon}</span>
      <div>
        <div class="dash-sheet-prompt-text">${action.title}</div>
        <div class="dash-sheet-prompt-meta">${action.meta || ''}</div>
      </div>
    </div>`;
  }).join('');

  // Stagger animation
  const items = container.querySelectorAll('.dash-sheet-prompt');
  items.forEach((item, i) => {
    item.style.opacity = '0'; item.style.transform = 'translateY(12px)'; item.style.transition = 'all 0.4s ease';
    requestAnimationFrame(() => { setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'translateY(0)'; }, i * 50); });
  });
}

function sheetSelectFocus(focusId) {
  STATE.activeFocus = focusId;
  STATE.activeCategory = 'all';
  saveState();
  // Update active states
  document.querySelectorAll('.dash-sheet-cat').forEach(el => el.classList.remove('active'));
  event.target.closest('.dash-sheet-cat')?.classList.add('active');
  document.querySelectorAll('#sheet-cat-tabs .dash-category-tab').forEach((el, i) => {
    el.classList.toggle('active', i === 0);
  });
  renderSheetPrompts();
}

function sheetSelectCategory(category) {
  STATE.activeCategory = category;
  saveState();
  document.querySelectorAll('#sheet-cat-tabs .dash-category-tab').forEach(el => {
    el.classList.toggle('active', el.textContent.toLowerCase().includes(category === 'all' ? 'all' : category.substring(0, 4)));
  });
  renderSheetPrompts();
}

let _actionSource = null; // Set when running from Explore Actions

function sheetRunAction(title) {
  closeBottomSheet();
  _actionSource = 'action'; // Tag this query as coming from an action
  const inp = document.getElementById('dash-ai-input');
  if (inp) inp.value = title;
  dashAskQuestion();
}

function toggleTemplate(idx) {
  const tmpl = document.getElementById(`tmpl-${idx}`);
  if (!tmpl) return;
  // Close all other templates
  document.querySelectorAll('.action-template-inputs').forEach(el => {
    if (el.id !== `tmpl-${idx}`) el.style.display = 'none';
  });
  tmpl.style.display = tmpl.style.display === 'none' ? 'block' : 'none';
  // Focus first input
  if (tmpl.style.display === 'block') {
    const firstInput = tmpl.querySelector('input, select');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }
  // Stop event propagation
  event.stopPropagation();
}

function runTemplateAction(idx) {
  event.stopPropagation();
  const roleKey = STATE.role || 'sales';
  const roleData = (typeof ROLE_DATA !== 'undefined' && ROLE_DATA[roleKey]) ? ROLE_DATA[roleKey] : null;
  if (!roleData) return;

  const activeFocusId = STATE.activeFocus || roleData.focusAreas[0]?.id;
  const activeCategory = STATE.activeCategory || 'all';
  const focusArea = roleData.focusAreas.find(fa => fa.id === activeFocusId) || roleData.focusAreas[0];
  const actions = focusArea?.actions || [];
  const filtered = activeCategory === 'all' ? actions : actions.filter(a => a.category === activeCategory);
  const action = filtered[idx];
  if (!action) return;

  // Build the prompt by replacing ___ with user inputs
  const tmplEl = document.getElementById(`tmpl-${idx}`);
  const inputs = tmplEl?.querySelectorAll('.tmpl-input') || [];
  let prompt = action.title;
  let inputIdx = 0;
  prompt = prompt.replace(/___/g, () => {
    const input = inputs[inputIdx];
    inputIdx++;
    return input?.value || input?.placeholder || '___';
  });

  closeBottomSheet();
  _actionSource = 'action'; // Tag as action-triggered
  const inp = document.getElementById('dash-ai-input');
  if (inp) inp.value = prompt;
  dashAskQuestion();
}

// ═══ Knowledge Actions Navigation ═══

function showKnowledgeActions() {
  const sheet = document.getElementById('dash-sheet');
  if (!sheet || typeof KNOWLEDGE_ACTIONS === 'undefined') return;

  let html = `<div class="dash-sheet-handle"></div>`;
  html += `<div class="dash-sheet-header">
    <span class="dash-sheet-title">Knowledge</span>
    <button class="dash-sheet-close" onclick="renderBottomSheet(); openBottomSheet();">\u2190 Back</button>
  </div>`;

  html += `<div class="dash-sheet-categories" style="grid-template-columns:repeat(3,1fr);">`;
  KNOWLEDGE_ACTIONS.categories.forEach(cat => {
    html += `<button class="dash-sheet-cat" onclick="showKnowledgeCategory('${cat.id}')">
      <span class="dash-sheet-cat-icon">${cat.icon}</span>
      <span class="dash-sheet-cat-name">${cat.name}</span>
    </button>`;
  });
  html += `</div>`;
  html += `<div class="dash-sheet-prompts" id="sheet-knowledge-prompts"></div>`;

  sheet.innerHTML = html;
}

function showKnowledgeCategory(catId) {
  if (typeof KNOWLEDGE_ACTIONS === 'undefined') return;
  const cat = KNOWLEDGE_ACTIONS.categories.find(c => c.id === catId);
  if (!cat) return;

  const sheet = document.getElementById('dash-sheet');
  if (!sheet) return;

  let html = `<div class="dash-sheet-handle"></div>`;
  html += `<div class="dash-sheet-header">
    <span class="dash-sheet-title">${cat.icon} ${cat.name}</span>
    <button class="dash-sheet-close" onclick="renderBottomSheet(); openBottomSheet();">\u2190 Back</button>
  </div>`;
  html += `<div style="font-size:0.78rem;color:#8A7E6B;margin-bottom:1rem;">${cat.description}</div>`;

  html += `<div class="dash-sheet-prompts" id="sheet-knowledge-prompts">`;
  cat.actions.forEach(action => {
    const sourceBadges = _renderSourceBadges(action.sources);
    const titleHtml = _renderKnowledgeTitle(action);

    html += `<div class="sheet-knowledge-action" data-action-id="${action.id}">
      <div class="sheet-action-title">${titleHtml}</div>
      <div class="sheet-action-sources">${sourceBadges}</div>
      <div class="sheet-action-powered">powered by fivetran ai</div>
    </div>`;
  });
  html += `</div>`;

  sheet.innerHTML = html;

  // Attach enter-key listeners to inline inputs
  sheet.querySelectorAll('.sheet-field-input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const actionId = e.target.closest('.sheet-knowledge-action')?.dataset.actionId;
        if (actionId) runKnowledgeAction(actionId);
      }
    });
    // Stop click from bubbling to the card
    input.addEventListener('click', (e) => e.stopPropagation());
  });

  // Attach click listeners to cards (but not on inputs)
  sheet.querySelectorAll('.sheet-knowledge-action').forEach(card => {
    card.addEventListener('click', () => {
      const actionId = card.dataset.actionId;
      if (actionId) runKnowledgeAction(actionId);
    });
  });

  // Stagger animation
  const items = sheet.querySelectorAll('.sheet-knowledge-action');
  items.forEach((item, i) => {
    item.style.opacity = '0'; item.style.transform = 'translateY(12px)'; item.style.transition = 'all 0.4s ease';
    requestAnimationFrame(() => { setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'translateY(0)'; }, i * 50); });
  });
}

function _renderSourceBadges(sources) {
  if (!sources || !sources.length) return '';
  const colors = typeof KNOWLEDGE_SOURCE_COLORS !== 'undefined' ? KNOWLEDGE_SOURCE_COLORS : {};
  return sources.map(src => {
    const info = colors[src] || { label: src, color: '#8A7E6B' };
    return `<span class="sheet-source-badge" style="background:${info.color}12;color:${info.color};">${info.label}</span>`;
  }).join('');
}

function _renderKnowledgeTitle(action) {
  const title = action.title;
  if (!action.fields || action.fields.length === 0 || !title.includes('___')) {
    return title;
  }
  // Split at ___ and insert input fields
  const parts = title.split('___');
  let html = '';
  parts.forEach((part, i) => {
    html += part;
    if (i < action.fields.length) {
      const field = action.fields[i];
      html += `<input type="text" class="sheet-field-input" placeholder="${field.placeholder}" data-field="${field.key}" />`;
    }
  });
  return html;
}

function runKnowledgeAction(actionId) {
  if (typeof KNOWLEDGE_ACTIONS === 'undefined') return;

  // Find the action across all categories
  let action = null;
  for (const cat of KNOWLEDGE_ACTIONS.categories) {
    action = cat.actions.find(a => a.id === actionId);
    if (action) break;
  }
  if (!action) return;

  // Collect field values
  const fields = {};
  const card = document.querySelector(`.sheet-knowledge-action[data-action-id="${actionId}"]`);
  if (card) {
    card.querySelectorAll('.sheet-field-input').forEach(input => {
      fields[input.dataset.field] = input.value.trim();
    });
  }

  // Check required fields
  if (action.fields && action.fields.length > 0) {
    for (const f of action.fields) {
      if (f.required && !fields[f.key]) {
        // Focus the empty input
        if (card) {
          const emptyInput = card.querySelector(`.sheet-field-input[data-field="${f.key}"]`);
          if (emptyInput) {
            emptyInput.focus();
            emptyInput.style.borderColor = '#E8634A';
            setTimeout(() => { emptyInput.style.borderColor = ''; }, 1500);
          }
        }
        return;
      }
    }
  }

  // Build query
  const query = action.query(fields);
  closeBottomSheet();
  _startDashChat(query);
}

function _getDashPriorityItems() {
  const items = [];

  // Calendar-based suggestion
  if (STATE.integrations?.googleCalendar?.connected) {
    const events = getMockCalendar();
    const nextMeeting = events.find(e => e.type !== 'break');
    if (nextMeeting && nextMeeting.people?.length > 0) {
      items.push({
        text: `You have a meeting with ${nextMeeting.people[0]} coming up`,
        source: 'Google Calendar',
        color: '#9DBF10'
      });
    }
  }

  // Slack-based suggestion
  if (STATE.integrations?.slack?.connected) {
    const slack = getMockSlack();
    const unread = slack.dms.filter(d => d.unread);
    if (unread.length > 0) {
      items.push({
        text: `${unread[0].from} is waiting on your reply`,
        source: 'Slack',
        color: '#e91e63'
      });
    }
  }

  // Email-based suggestion
  if (STATE.integrations?.gmail?.connected) {
    const emails = getMockEmails();
    if (emails.needsReply.length > 0) {
      items.push({
        text: `${emails.needsReply[0].from} sent you a message about "${emails.needsReply[0].subject.substring(0, 40)}"`,
        source: 'Gmail',
        color: '#d97706'
      });
    }
  }

  // Fallback suggestions if no integrations connected
  if (items.length === 0) {
    items.push(
      { text: 'Connect your calendar, Slack, and email to see personalized suggestions', source: 'Getting started', color: '#9DBF10' }
    );
  }

  return items.slice(0, 3);
}

function setDashFocus(focusId) {
  STATE.activeFocus = focusId;
  STATE.activeCategory = 'all';
  saveState();
  // Update sidebar active state
  document.querySelectorAll('.dash-focus-item').forEach(item => item.classList.remove('active'));
  // Re-render just the main content
  renderDashContent();
  // Re-render sidebar to update active state
  renderDashSidebar();
}

function setDashCategory(category) {
  STATE.activeCategory = category;
  // Re-render content (which includes the category tabs and action cards)
  renderDashContent();
}

// ════════════════════════════════════════════════════════
// INSIGHTS TAB
// ════════════════════════════════════════════════════════
function initInsights() {
  // Sync date pill
  const now = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const h = now.getHours(); const m = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const timeStr = `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')}${ampm}`;
  const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  const pill = document.getElementById('insights-date-pill');
  if (pill) pill.textContent = `${dateStr} \u2022 ${timeStr}`;

  // ── NEW: Clean signals-based insights ──
  const insightsContent = document.querySelector('.insights-content');
  if (insightsContent) {
    insightsContent.querySelector('.insights-title').textContent = 'Pulse';
    insightsContent.querySelector('.insights-sub').textContent = 'everything happening across your systems';
  }

  const feed = document.getElementById('insights-feed');
  if (!feed) return;

  // ── Gather all categorized data ──
  const allInsights = []; // flat list for expandInsight indexes
  let globalIdx = 0;

  // Helper: parse "8:00" or "13:00" to minutes since midnight
  function _parseTime(t) {
    const parts = t.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  const nowMins = now.getHours() * 60 + now.getMinutes();

  // Type colors for meetings
  const typeColors = { important: '#FF6B6B', '1on1': '#A78BFA', recurring: '#60A5FA', break: '#34D399', meeting: '#60A5FA' };
  const catIcons = { enablement: '\uD83D\uDCDA', compliance: '\uD83D\uDD12', task: '\uD83D\uDCCB', okr: '\uD83C\uDFAF' };

  // ═══ 1. MEETINGS ═══
  const cal = getMockCalendar();
  const meetingStartIdx = globalIdx;
  const meetingItems = cal.map((mtg, i) => {
    const startMins = _parseTime(mtg.time);
    const endMins = _parseTime(mtg.end);
    const isPast = endMins <= nowMins;
    const isCurrent = startMins <= nowMins && endMins > nowMins;
    const dotColor = typeColors[mtg.type] || '#60A5FA';
    const showPrep = !isPast && mtg.type !== 'break';
    const idx = globalIdx++;

    // Build insight data entry
    const insightEntry = {
      icon: '\uD83D\uDCC5', iconBg: 'rgba(200,240,49,0.12)', iconColor: '#9DBF10',
      headline: mtg.title,
      detail: mtg.people.join(', '),
      source: 'Google Calendar', time: mtg.time,
      _meeting: mtg, _isPast: isPast
    };
    allInsights.push(insightEntry);

    return `<div class="meeting-item${isPast ? ' past' : ''}${isCurrent ? ' current' : ''}" data-insight-idx="${idx}" onclick="expandInsight(${idx})">
      <div class="meeting-time">${mtg.time}<br><span style="font-weight:400;font-size:0.68rem;color:#B5AA98;">${mtg.end}</span></div>
      <div class="meeting-type-dot" style="background:${dotColor};"></div>
      <div class="meeting-info">
        <div class="meeting-title">${mtg.title}</div>
        <div class="meeting-people">${mtg.people.join(', ')}</div>
      </div>
      ${showPrep ? `<button class="meeting-prep-btn" onclick="event.stopPropagation(); expandInsight(${idx})">Prep \u2192</button>` : ''}
    </div>`;
  });

  // ═══ 2. MESSAGES ═══
  const slack = getMockSlack();
  const messageStartIdx = globalIdx;
  const allMessages = [];
  // DMs
  slack.dms.forEach(d => {
    const idx = globalIdx++;
    const insightEntry = {
      icon: '\uD83D\uDCAC', iconBg: d.waitingOnYou ? 'rgba(232,99,74,0.12)' : 'rgba(200,240,49,0.12)', iconColor: d.waitingOnYou ? '#ec4899' : '#9DBF10',
      headline: `${d.from}`,
      detail: d.preview,
      source: 'Slack DM', time: d.time,
      _slackMsg: d
    };
    allInsights.push(insightEntry);
    allMessages.push(`<div class="insight-card" data-insight-idx="${idx}" onclick="expandInsight(${idx})">
      <div class="insight-icon" style="background:${insightEntry.iconBg};color:${insightEntry.iconColor};">\uD83D\uDCAC</div>
      <div class="insight-body">
        <div class="insight-headline">${d.from}</div>
        <div class="insight-detail">${d.preview.length > 80 ? d.preview.substring(0, 80) + '...' : d.preview}</div>
        ${d.waitingOnYou ? '<span class="insight-flag">waiting on you</span>' : ''}
      </div>
      <div class="insight-time">${d.time}</div>
    </div>`);
  });
  // Channel mentions
  slack.channels.forEach(c => {
    const idx = globalIdx++;
    const insightEntry = {
      icon: '\uD83D\uDCAC', iconBg: 'rgba(200,240,49,0.12)', iconColor: '#9DBF10',
      headline: `#${c.name || 'channel'}`,
      detail: c.preview || '',
      source: 'Slack', time: c.time || '',
      _slackMsg: c
    };
    allInsights.push(insightEntry);
    allMessages.push(`<div class="insight-card" data-insight-idx="${idx}" onclick="expandInsight(${idx})">
      <div class="insight-icon" style="background:rgba(200,240,49,0.12);color:#9DBF10;">\uD83D\uDCAC</div>
      <div class="insight-body">
        <div class="insight-headline">#${c.name || 'channel'}</div>
        <div class="insight-detail">${(c.preview || '').substring(0, 80)}</div>
      </div>
      <div class="insight-time">${c.time || ''}</div>
    </div>`);
  });
  const hasWaiting = slack.dms.some(d => d.waitingOnYou) || slack.dms.some(d => d.unread);

  // ═══ 3. EMAIL ═══
  const emails = getMockEmails();
  const emailStartIdx = globalIdx;
  const emailItems = [];
  emails.needsReply.forEach(e => {
    const idx = globalIdx++;
    const insightEntry = {
      icon: '\uD83D\uDCE7', iconBg: e.urgent ? '#FCEBEB' : '#FEF3C7', iconColor: e.urgent ? '#ef4444' : '#d97706',
      headline: e.urgent ? `Urgent: ${e.from}` : e.from,
      detail: e.subject,
      source: 'Gmail', time: e.time,
      _email: e
    };
    allInsights.push(insightEntry);
    emailItems.push(`<div class="insight-card" data-insight-idx="${idx}" onclick="expandInsight(${idx})">
      <div class="insight-icon" style="background:${insightEntry.iconBg};color:${insightEntry.iconColor};">\uD83D\uDCE7</div>
      <div class="insight-body">
        <div class="insight-headline">${insightEntry.headline}</div>
        <div class="insight-detail">${e.subject}</div>
        ${e.urgent ? '<span class="insight-urgent">urgent</span>' : ''}
      </div>
      <div class="insight-time">${e.time}</div>
    </div>`);
  });
  (emails.fyi || []).forEach(e => {
    const idx = globalIdx++;
    const insightEntry = {
      icon: '\uD83D\uDCE7', iconBg: '#F5F2ED', iconColor: '#8A7E6B',
      headline: e.from,
      detail: e.subject,
      source: 'Gmail', time: e.time,
      _email: e
    };
    allInsights.push(insightEntry);
    emailItems.push(`<div class="insight-card" data-insight-idx="${idx}" onclick="expandInsight(${idx})">
      <div class="insight-icon" style="background:#F5F2ED;color:#8A7E6B;">\uD83D\uDCE7</div>
      <div class="insight-body">
        <div class="insight-headline">${e.from}</div>
        <div class="insight-detail">${e.subject}</div>
      </div>
      <div class="insight-time">${e.time}</div>
    </div>`);
  });
  const hasUrgentEmail = emails.needsReply.some(e => e.urgent);

  // ═══ 4. TASKS ═══
  const taskStartIdx = globalIdx;
  const taskItems = [];
  let hasUrgentTask = false;
  if (typeof COMPANY_TASKS !== 'undefined') {
    COMPANY_TASKS.forEach(task => {
      const idx = globalIdx++;
      const icon = catIcons[task.category] || '\uD83D\uDCCB';
      // Calculate days until due
      let daysUntil = Infinity;
      let dueFmt = '';
      let urgColor = '#10b981'; // green default
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        const diffMs = d - now;
        daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        dueFmt = `Due ${months[d.getMonth()]} ${d.getDate()}`;
        if (daysUntil < 3) { urgColor = '#ef4444'; hasUrgentTask = true; }
        else if (daysUntil < 7) urgColor = '#f59e0b';
        else urgColor = '#10b981';
      }
      const urgBg = urgColor === '#ef4444' ? '#FCEBEB' : urgColor === '#f59e0b' ? '#FEF3C7' : '#E1F5EE';

      const insightEntry = {
        icon: icon,
        iconBg: urgBg,
        iconColor: urgColor,
        headline: task.title,
        detail: task.buddyMsg || '',
        source: `${task.pushedBy}${dueFmt ? ' \u00B7 ' + dueFmt : ''}`,
        time: dueFmt,
        urgencyDot: urgColor,
        taskAction: task.buddyMsg || task.title
      };
      allInsights.push(insightEntry);
      taskItems.push(`<div class="insight-card" data-insight-idx="${idx}" onclick="expandInsight(${idx})">
        <div class="insight-icon" style="background:${urgBg};color:${urgColor};">${icon}</div>
        <div class="insight-body">
          <div class="insight-headline"><span class="task-urgency-dot" style="background:${urgColor};"></span>${task.title}</div>
          <div class="insight-detail">${task.buddyMsg || ''}</div>
          <div class="insight-source">${task.pushedBy}${dueFmt ? ' \u00B7 ' + dueFmt : ''}</div>
        </div>
      </div>`);
    });
  }

  // ═══ 5. SIGNALS ═══
  const signalStartIdx = globalIdx;
  const signalItems = [];
  const roleKey = STATE.role || 'sales';
  const signalData = [];
  if (roleKey === 'sales' || !STATE.role) {
    signalData.push(
      { icon: '\uD83C\uDFAF', iconBg: '#E1F5EE', iconColor: '#10b981', headline: '3 accounts visited your pricing page', detail: 'Acme Corp, GlobalTech, DataFlow Inc were on the pricing page in the last 24 hours', source: 'Demandbase', time: '6h ago' },
      { icon: '\u26A0\uFE0F', iconBg: '#FCEBEB', iconColor: '#ef4444', headline: 'Champion left at DataFlow Inc', detail: 'Sarah Chen (VP Engineering) is no longer at DataFlow according to LinkedIn', source: 'LinkedIn + Salesforce', time: '1d ago' },
      { icon: '\uD83D\uDCCA', iconBg: 'rgba(200,240,49,0.12)', iconColor: '#9DBF10', headline: 'Pipeline coverage dropped to 2.1x', detail: 'Down from 2.8x last month. 3 commit deals have gone stale.', source: 'Salesforce', time: '3h ago' },
      { icon: '\uD83D\uDCDE', iconBg: '#E1F5EE', iconColor: '#10b981', headline: 'New Gong insight: competitor mentioned', detail: 'In your call with TechStart yesterday, they mentioned evaluating Airbyte', source: 'Gong', time: 'yesterday' },
      { icon: '\uD83D\uDD25', iconBg: '#FEF3C7', iconColor: '#d97706', headline: '2 leads opened your email 3+ times', detail: 'Mike Torres and Lisa Park from your outbound sequence', source: 'Outreach', time: '4h ago' }
    );
  }
  signalData.forEach(s => {
    const idx = globalIdx++;
    allInsights.push(s);
    signalItems.push(`<div class="insight-card" data-insight-idx="${idx}" onclick="expandInsight(${idx})">
      <div class="insight-icon" style="background:${s.iconBg};color:${s.iconColor};">${s.icon}</div>
      <div class="insight-body">
        <div class="insight-headline">${s.headline}</div>
        <div class="insight-detail">${s.detail}</div>
        <div class="insight-source">${s.source}</div>
      </div>
      <div class="insight-time">${s.time}</div>
    </div>`);
  });

  // Store flat insight data for expandInsight
  window._insightData = allInsights;

  // ── Build sections HTML ──
  const sections = [
    { id: 'messages', icon: '\uD83D\uDCAC', title: 'Messages', count: allMessages.length, items: allMessages.join(''), collapsed: false },
    { id: 'email', icon: '\uD83D\uDCE7', title: 'Email', count: emailItems.length, items: emailItems.join(''), collapsed: !hasUrgentEmail && emails.needsReply.length === 0 },
    { id: 'tasks', icon: '\uD83C\uDFAF', title: 'Tasks', count: taskItems.length, items: taskItems.join(''), collapsed: !hasUrgentTask },
    { id: 'signals', icon: '\uD83D\uDCCA', title: 'Signals', count: signalItems.length, items: signalItems.join(''), collapsed: false },
  ];

  feed.innerHTML = sections.filter(s => s.count > 0).map(s => `
    <div class="insight-section${s.collapsed ? ' collapsed' : ''}" id="insight-section-wrap-${s.id}">
      <div class="insight-section-header" onclick="toggleInsightSection('${s.id}')">
        <span class="insight-section-icon">${s.icon}</span>
        <span class="insight-section-title">${s.title}</span>
        <span class="insight-section-count">${s.count}</span>
        <span class="insight-section-chevron">\u25BE</span>
      </div>
      <div class="insight-section-body" id="insight-section-${s.id}">
        ${s.items}
      </div>
    </div>
  `).join('');
}

// Toggle collapsible insight sections
window.toggleInsightSection = function(sectionId) {
  const wrap = document.getElementById('insight-section-wrap-' + sectionId);
  if (wrap) wrap.classList.toggle('collapsed');
};

// ════════════════════════════════════════════════════════
// INSIGHT EXPANSION — clickable insight cards
// ════════════════════════════════════════════════════════
let _expandedInsight = -1;

function _findInsightCard(index) {
  // Find card by data-insight-idx attribute (works for both .insight-card and .meeting-item)
  return document.querySelector(`[data-insight-idx="${index}"]`);
}

function expandInsight(index) {
  // Collapse previous
  document.querySelectorAll('.insight-expand').forEach(el => el.remove());

  if (_expandedInsight === index) {
    _expandedInsight = -1;
    return; // toggle off
  }
  _expandedInsight = index;

  const card = _findInsightCard(index);
  if (!card) return;

  const insight = window._insightData?.[index];
  if (!insight) return;

  const action = _getInsightAction(insight);

  const expand = document.createElement('div');
  expand.className = 'insight-expand';
  expand.innerHTML = `
    <div class="insight-expand-buddy">${action.buddyMsg}</div>
    <div class="insight-expand-content">${action.content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div>
    <div class="insight-expand-actions">
      <button class="insight-expand-primary" onclick="event.stopPropagation(); insightAction(${index}, 'primary')">${action.primaryBtn}</button>
      <button class="insight-expand-secondary" onclick="event.stopPropagation(); insightAction(${index}, 'secondary')">${action.secondaryBtn}</button>
    </div>
  `;
  card.appendChild(expand);

  // Scroll into view
  setTimeout(() => expand.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
}

function insightAction(index, type) {
  const card = _findInsightCard(index);
  const expand = card?.querySelector('.insight-expand');
  if (expand) {
    if (type === 'primary') {
      // Capture action content before removing expand
      const insight = window._insightData?.[index];
      const action = insight ? _getInsightAction(insight) : null;
      const actionContent = action?.content || '';

      expand.innerHTML = '<div class="insight-expand-buddy" style="color:#2A9D8F;">\u2713 done. i\'ll handle it.</div>';
      setTimeout(() => { expand.remove(); _expandedInsight = -1; }, 1500);

      // Save to extension clipboard
      if (insight && actionContent) {
        fetch('/api/clipboard/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'insight',
            title: insight.headline || insight.title || 'Insight action',
            content: actionContent,
            context: insight.detail || '',
            source: 'insight',
          }),
        }).catch(() => {});
      }
    } else {
      expand.remove();
      _expandedInsight = -1;
    }
  }
}

function _getInsightAction(insight) {
  const src = (insight.source || '').toLowerCase();
  const headline = (insight.headline || '').toLowerCase();

  // Meeting/Calendar insights — use real prep data if available
  if (src.includes('calendar') || headline.includes('meeting') || insight._meeting) {
    const mtg = insight._meeting;
    if (mtg && mtg.prep) {
      const p = mtg.prep;
      const agendaStr = (p.agenda || []).map(a => `\u2022 ${a}`).join('\n');
      const content = [
        p.context ? `**Context:** ${p.context}` : '',
        agendaStr ? `**Agenda:**\n${agendaStr}` : '',
        p.theyWant ? `**They want:** ${p.theyWant}` : '',
        p.youShould ? `**You should:** ${p.youShould}` : '',
      ].filter(Boolean).join('\n\n');
      return {
        buddyMsg: `here's your prep for "${mtg.title}":`,
        content: content,
        primaryBtn: 'Copy agenda',
        secondaryBtn: 'Skip',
        type: 'prep'
      };
    }
    return {
      buddyMsg: "here's a quick prep for your next meeting:",
      content: `**Agenda:**\n\u2022 Review previous action items\n\u2022 Discuss current blockers\n\u2022 Align on next steps\n\n**Key talking points:**\n\u2022 Status update on open items\n\u2022 Timeline for deliverables\n\u2022 Any decisions needed`,
      primaryBtn: 'Copy agenda',
      secondaryBtn: 'Skip',
      type: 'prep'
    };
  }

  // Slack DM / message
  if (src.includes('slack') || insight._slackMsg) {
    const person = insight._slackMsg?.from || insight.headline.replace(/.*from /i, '').replace(/\s*$/, '');
    return {
      buddyMsg: `i read ${person}'s message. here's a quick reply:`,
      content: `"hey ${person.split(' ')[0].toLowerCase()}! thanks for the heads up. totally understand \u2014 let me know when you have more info and we can sync up. no rush."`,
      primaryBtn: 'Send reply',
      secondaryBtn: 'Edit',
      type: 'reply'
    };
  }

  // Email needs reply
  if (src.includes('gmail') || headline.includes('email') || insight._email) {
    const person = insight._email?.from || insight.headline?.match(/(\w+ \w+)/)?.[1] || 'them';
    return {
      buddyMsg: `here's a draft reply to ${person}:`,
      content: `"hi ${person.split(' ')[0]}, thanks for sending this over. let me review and get back to you by end of day. appreciate the heads up."`,
      primaryBtn: 'Send reply',
      secondaryBtn: 'Edit',
      type: 'reply'
    };
  }

  // Pricing page visits / website activity
  if (headline.includes('pricing') || headline.includes('visited') || src.includes('demandbase')) {
    const accounts = insight.detail?.match(/([A-Z][a-zA-Z]+ (?:Corp|Tech|Inc|Co|Ltd|Solutions|Systems|Data|Flow|Global))/g) || ['the accounts'];
    return {
      buddyMsg: `these accounts are showing buying intent. here's outreach for each:`,
      content: accounts.map(a => `**${a}:** "hi team \u2014 noticed some activity from your org on our platform. would love to connect and see if there's a fit. open to a quick 15 min chat this week?"`).join('\n\n'),
      primaryBtn: 'Queue outreach',
      secondaryBtn: 'Edit',
      type: 'outreach'
    };
  }

  // Champion left
  if (headline.includes('champion') || headline.includes('left')) {
    return {
      buddyMsg: "losing a champion is a risk. here's a plan:",
      content: `**Immediate:**\n\u2022 Identify new stakeholder via LinkedIn\n\u2022 Reach out to remaining contacts\n\u2022 Schedule check-in with account team\n\n**Draft outreach to new contact:**\n"hi \u2014 i've been working with your team on [project]. wanted to introduce myself and make sure we keep things moving smoothly. open to a quick intro call?"`,
      primaryBtn: 'Start re-engagement',
      secondaryBtn: 'Skip',
      type: 'plan'
    };
  }

  // Pipeline / forecast
  if (headline.includes('pipeline') || headline.includes('coverage') || headline.includes('forecast')) {
    return {
      buddyMsg: "here are the deals that need attention:",
      content: `**Stale commit deals:**\n\u2022 TechStart \u2014 no activity in 18 days \u2192 suggest: schedule follow-up\n\u2022 DataFlow \u2014 champion left \u2192 suggest: find new sponsor\n\u2022 GlobalTech \u2014 stuck in legal \u2192 suggest: escalate to VP\n\n**Quick wins to boost coverage:**\n\u2022 3 accounts showing intent signals this week\n\u2022 2 expansion opportunities in existing book`,
      primaryBtn: 'Update deals',
      secondaryBtn: 'View pipeline',
      type: 'pipeline'
    };
  }

  // Competitor mentioned
  if (headline.includes('competitor') || headline.includes('airbyte') || headline.includes('compete')) {
    return {
      buddyMsg: "competitor alert. here's how to handle it:",
      content: `**Competitive response:**\n\u2022 Key differentiator: managed service vs DIY maintenance\n\u2022 ROI angle: 70% less engineering time\n\u2022 Customer proof: similar companies chose us because...\n\n**Suggested follow-up:**\n"hey \u2014 wanted to share some context on how we compare to what you're evaluating. happy to walk through a side-by-side if helpful."`,
      primaryBtn: 'Send battlecard',
      secondaryBtn: 'View details',
      type: 'compete'
    };
  }

  // Leads / outreach
  if (headline.includes('lead') || headline.includes('opened') || headline.includes('email 3')) {
    return {
      buddyMsg: "hot leads \u2014 they're clearly interested. here's a follow-up:",
      content: `**Draft follow-up:**\n"hey \u2014 i noticed you've been checking out some of our content. would love to chat about what you're working on and see if fivetran could help. open to a quick call this week?"`,
      primaryBtn: 'Send follow-up',
      secondaryBtn: 'Edit',
      type: 'outreach'
    };
  }

  // Enablement / training
  if (headline.includes('certification') || headline.includes('training') || headline.includes('enablement') || headline.includes('survey') || headline.includes('complete')) {
    const buddyMsg = insight.buddyMsg || insight.detail || "want me to help you knock this out?";
    return {
      buddyMsg: buddyMsg,
      content: `i can block 30 minutes on your calendar for this. it's quick \u2014 you'll be done before your next meeting.`,
      primaryBtn: 'Block time',
      secondaryBtn: 'Remind me later',
      type: 'task'
    };
  }

  // OKR
  if (headline.includes('okr') || headline.includes('objective')) {
    return {
      buddyMsg: insight.buddyMsg || "here's where you stand:",
      content: `**Focus accounts to close the gap:**\n\u2022 Acme Corp \u2014 expansion opportunity, $50K potential\n\u2022 TechFlow \u2014 demo scheduled, high intent\n\u2022 DataStream \u2014 pricing page visit + champion engaged`,
      primaryBtn: 'View accounts',
      secondaryBtn: 'Skip',
      type: 'pipeline'
    };
  }

  // Default
  return {
    buddyMsg: "want me to help with this?",
    content: "i can look into this further and suggest next steps.",
    primaryBtn: 'Go',
    secondaryBtn: 'Skip',
    type: 'default'
  };
}

// ════════════════════════════════════════════════════════
// LIFE TAB — init
// ════════════════════════════════════════════════════════
function saveSportsTeams() {
  const input = document.getElementById('sports-teams-input');
  if (!input || !input.value.trim()) return;
  const teams = input.value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  STATE.sportsTeams = teams;
  saveState();
  initLife();
}

async function _fetchSportsScores(teams) {
  const container = document.getElementById('sports-scores');
  if (!container) return;
  try {
    const res = await fetch(`/api/sports/scores?teams=${encodeURIComponent(teams.join(','))}`);
    const data = await res.json();
    if (!data.ok || !data.results?.length) {
      container.innerHTML = '<div style="color:#9A96A8;font-size:0.82rem;">no scores found</div>';
      return;
    }
    container.innerHTML = data.results.map(r => {
      if (r.error) return `<div style="padding:0.4rem 0;color:#9A96A8;font-size:0.82rem;">${r.team}: not found</div>`;
      if (r.news) {
        // No game today — show news
        return `<div style="padding:0.6rem 0;border-bottom:1px solid rgba(0,0,0,0.04);">
          <div style="font-weight:600;font-size:0.85rem;color:#1A1A2E;margin-bottom:0.25rem;">${r.team.charAt(0).toUpperCase()+r.team.slice(1)} <span style="font-size:0.65rem;color:#9A96A8;font-weight:400;">${r.league} · No game today</span></div>
          ${r.news.map(n => `<div style="font-size:0.8rem;color:#6B6580;line-height:1.5;padding:0.2rem 0;">${n.headline}</div>`).join('')}
        </div>`;
      }
      // Live or final score
      const isLive = r.status?.toLowerCase().includes('progress') || r.statusDetail?.toLowerCase().includes('half') || r.statusDetail?.match(/\d+(st|nd|rd|th)/);
      const statusColor = isLive ? '#ef4444' : '#9A96A8';
      const statusText = isLive ? 'LIVE · ' + r.statusDetail : r.status;
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:0.6rem 0;border-bottom:1px solid rgba(0,0,0,0.04);">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          ${r.away?.logo ? `<img src="${r.away.logo}" style="width:20px;height:20px;">` : ''}
          <span style="font-weight:600;font-size:0.85rem;color:#1A1A2E;">${r.away?.name || ''}</span>
        </div>
        <div style="text-align:center;">
          <div style="font-weight:800;font-size:1rem;color:#1A1A2E;">${r.away?.score || 0} - ${r.home?.score || 0}</div>
          <div style="font-size:0.6rem;color:${statusColor};font-weight:600;">${statusText}</div>
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span style="font-weight:600;font-size:0.85rem;color:#1A1A2E;">${r.home?.name || ''}</span>
          ${r.home?.logo ? `<img src="${r.home.logo}" style="width:20px;height:20px;">` : ''}
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    container.innerHTML = '<div style="color:#9A96A8;font-size:0.82rem;">could not load scores</div>';
  }
}

function submitWidgetIdea() {
  const input = document.getElementById('widget-suggest');
  const msg = document.getElementById('widget-suggest-msg');
  if (!input || !input.value.trim()) return;
  const idea = input.value.trim();
  input.value = '';
  if (msg) msg.textContent = 'thanks! we logged it.';
  // Log to server
  fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'widget-idea', text: idea }) }).catch(() => {});
  setTimeout(() => { if (msg) msg.textContent = ''; }, 3000);
}

function initLife() {
  // Sync date pill
  const now = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const h = now.getHours(); const mn = now.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const timeStr = `${String(h12).padStart(2,'0')}:${String(mn).padStart(2,'0')}${ampm}`;
  const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  const pill = document.getElementById('life-date-pill');
  if (pill) pill.textContent = `${dateStr} \u2022 ${timeStr}`;

  const content = document.getElementById('life-content');
  if (!content) return;

  // Keep the h2 and p, rebuild cards
  let html = '';

  // Initialize notes array in state
  if (!STATE.ideaMachine) STATE.ideaMachine = { notes: [], raw: '' };

  // Card 1: The Idea Machine
  const notes = STATE.ideaMachine.notes || [];
  const rawText = STATE.ideaMachine.raw || '';
  const taskNotes = notes.filter(n => n.type === 'task' && !n.done);
  const ideaNotes = notes.filter(n => n.type === 'idea');
  const reminderNotes = notes.filter(n => n.type === 'reminder');
  const journalNotes = notes.filter(n => n.type === 'journal');

  html += `<div class="life-card" style="padding:1.25rem;">
    <div class="life-card-title" style="margin-bottom:0.75rem;">💡 The Idea Machine</div>
    <p style="font-size:0.8rem;color:#9A96A8;margin-bottom:1rem;line-height:1.5;">brain dump anything. buddy organizes it for you.</p>
    <textarea id="idea-machine-input" placeholder="what's on your mind? tasks, ideas, reminders, thoughts..."
      oninput="_saveIdeaRaw()"
      style="width:100%;min-height:90px;max-height:200px;resize:vertical;background:rgba(0,0,0,0.02);border:1px solid rgba(0,0,0,0.06);border-radius:12px;outline:none;font-family:'Inter',sans-serif;font-size:0.9rem;line-height:1.7;color:#1A1A2E;padding:0.75rem;box-sizing:border-box;">${rawText.replace(/</g,'&lt;')}</textarea>
    <div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
      <button onclick="_organizeIdeas()" style="flex:1;padding:0.6rem;background:#9DBF10;color:white;border:none;border-radius:10px;font-size:0.8rem;font-weight:600;cursor:pointer;">organize my thoughts</button>
      <button onclick="_clearIdeas()" style="padding:0.6rem 1rem;background:none;border:1px solid rgba(0,0,0,0.08);border-radius:10px;font-size:0.8rem;color:#9A96A8;cursor:pointer;">clear</button>
    </div>
    ${notes.length > 0 ? `
      <div style="margin-top:1.25rem;border-top:1px solid rgba(0,0,0,0.06);padding-top:1rem;">
        ${taskNotes.length ? `<div style="margin-bottom:1rem;">
          <div style="font-size:0.7rem;color:#9A96A8;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">Tasks</div>
          ${taskNotes.map((n, i) => `<div style="display:flex;align-items:flex-start;gap:0.5rem;padding:0.3rem 0;">
            <input type="checkbox" onchange="_toggleIdeaTask(${notes.indexOf(n)})" style="margin-top:3px;accent-color:#9DBF10;">
            <span style="font-size:0.85rem;color:#1A1A2E;">${n.text}</span>
          </div>`).join('')}
        </div>` : ''}
        ${ideaNotes.length ? `<div style="margin-bottom:1rem;">
          <div style="font-size:0.7rem;color:#9A96A8;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">Ideas</div>
          ${ideaNotes.map(n => `<div style="padding:0.3rem 0;font-size:0.85rem;color:#1A1A2E;">💡 ${n.text}</div>`).join('')}
        </div>` : ''}
        ${reminderNotes.length ? `<div style="margin-bottom:1rem;">
          <div style="font-size:0.7rem;color:#9A96A8;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">Reminders</div>
          ${reminderNotes.map(n => `<div style="padding:0.3rem 0;font-size:0.85rem;color:#1A1A2E;">⏰ ${n.text}</div>`).join('')}
        </div>` : ''}
        ${journalNotes.length ? `<div style="margin-bottom:0.5rem;">
          <div style="font-size:0.7rem;color:#9A96A8;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.5rem;">Journal</div>
          ${journalNotes.map(n => `<div style="padding:0.3rem 0;font-size:0.85rem;color:#1A1A2E;font-style:italic;">${n.text}</div>`).join('')}
        </div>` : ''}
      </div>
    ` : ''}
  </div>`;

  // Card 2: Weather with hourly forecast
  const w = getMockWeather();
  html += `<div class="life-card">
    <div class="life-card-title">\u{1F324}\uFE0F Weather</div>
    <div style="display:flex;align-items:baseline;gap:0.75rem;margin-bottom:1rem;">
      <div style="font-size:2.5rem;font-weight:800;color:#1A1A2E;">${w.temp}</div>
      <div>
        <div style="font-weight:600;color:#1A1A2E;">${w.desc}</div>
        <div style="font-size:0.78rem;color:#9A96A8;">${w.note}</div>
      </div>
    </div>
    <div style="display:flex;gap:0.5rem;overflow-x:auto;padding-bottom:0.5rem;">
      ${['Now', '10:00', '11:00', '12:00', '1:00'].map((t, i) => {
        const temps = [w.temp, '73\u00B0F', '75\u00B0F', '76\u00B0F', '74\u00B0F'];
        const icons = ['\u{1F324}\uFE0F', '\u26C5', '\u2600\uFE0F', '\u2600\uFE0F', '\u26C5'];
        return `<div style="text-align:center;min-width:60px;padding:0.5rem;background:rgba(0,0,0,0.02);border-radius:12px;">
          <div style="font-size:0.7rem;color:#9A96A8;margin-bottom:0.3rem;">${t}</div>
          <div style="font-size:1.2rem;margin-bottom:0.2rem;">${icons[i]}</div>
          <div style="font-size:0.78rem;font-weight:600;color:#1A1A2E;">${temps[i]}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // Card 3: Sports — ask what teams if not set, else show real scores
  const savedTeams = STATE.sportsTeams || [];
  if (savedTeams.length === 0) {
    html += `<div class="life-card" id="sports-card">
      <div class="life-card-title">\u{1F3C0} Sports</div>
      <div style="color:#9A96A8;font-size:0.88rem;margin-bottom:0.75rem;">what teams do you follow?</div>
      <input id="sports-teams-input" type="text" placeholder="e.g. Warriors, 49ers, Giants" style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid #E0DDD6;font-size:0.88rem;font-family:Inter,sans-serif;outline:none;box-sizing:border-box;" onkeydown="if(event.key==='Enter')saveSportsTeams()"/>
      <button onclick="saveSportsTeams()" style="margin-top:0.75rem;width:100%;padding:10px;border-radius:10px;background:#9DBF10;color:white;font-weight:700;font-size:0.88rem;border:none;cursor:pointer;">save my teams</button>
    </div>`;
  } else {
    html += `<div class="life-card" id="sports-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
        <div class="life-card-title" style="margin:0;">\u{1F3C0} Sports</div>
        <button onclick="STATE.sportsTeams=[];saveState();initLife();" style="font-size:0.65rem;color:#9A96A8;background:none;border:none;cursor:pointer;">edit teams</button>
      </div>
      <div id="sports-scores" style="color:#9A96A8;font-size:0.82rem;">loading scores...</div>
    </div>`;
    // Fetch real ESPN data
    _fetchSportsScores(savedTeams);
  }

  // Card 4: Health
  const health = getMockHealth();
  if (health.connected) {
    html += `<div class="life-card">
      <div class="life-card-title">\u2764\uFE0F Health</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
        ${health.stats.map(s => `
          <div style="background:rgba(0,0,0,0.02);border-radius:12px;padding:0.75rem;text-align:center;">
            <div style="font-size:1.8rem;font-weight:800;color:${s.color};">${s.value}</div>
            <div style="font-size:0.72rem;color:#9A96A8;margin-top:0.2rem;">${s.label}</div>
          </div>
        `).join('')}
      </div>
    </div>`;
  } else {
    html += `<div class="life-card" style="text-align:center;padding:1.5rem;">
      <div class="life-card-title">\u2764\uFE0F Health</div>
      <div style="color:#9A96A8;font-size:0.85rem;margin-bottom:0.75rem;">connect Whoop, Oura, or Apple Health to see your stats</div>
      <button style="background:#9DBF10;color:white;border:none;padding:0.5rem 1.25rem;border-radius:20px;font-size:0.8rem;font-weight:600;cursor:pointer;">Connect</button>
    </div>`;
  }

  // Card 5: Mood Tracker
  const todayMood = STATE.moodLog.find(m => m.date === new Date().toDateString());
  const currentMoodIdx = todayMood ? todayMood.mood : -1;
  html += `<div class="life-card">
    <div class="life-card-title">\u{1F60A} How are you feeling?</div>
    <div style="display:flex;gap:0.75rem;justify-content:center;padding:0.5rem 0;">
      ${['\u{1F929}','\u{1F60A}','\u{1F610}','\u{1F614}','\u{1F622}'].map((e, i) =>
        `<button onclick="setMood(${i})" style="font-size:1.8rem;background:none;border:2px solid ${currentMoodIdx === i ? '#9DBF10' : 'transparent'};border-radius:50%;width:48px;height:48px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;" onmouseover="this.style.borderColor='#9DBF10'" onmouseout="this.style.borderColor='${currentMoodIdx === i ? '#9DBF10' : 'transparent'}'">${e}</button>`
      ).join('')}
    </div>
  </div>`;

  // "What should we add next?" suggestion box
  html += `<div class="life-card" style="text-align:center;border:1px dashed rgba(0,0,0,0.1);">
    <div class="life-card-title">💡 What should we add next?</div>
    <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
      <input id="widget-suggest" type="text" placeholder="a widget idea..." style="flex:1;padding:8px 12px;border-radius:10px;border:1px solid #E0DDD6;font-size:0.85rem;font-family:Inter,sans-serif;outline:none;" onkeydown="if(event.key==='Enter')submitWidgetIdea()"/>
      <button onclick="submitWidgetIdea()" style="padding:8px 16px;border-radius:10px;background:#9DBF10;color:white;font-weight:600;font-size:0.8rem;border:none;cursor:pointer;">send</button>
    </div>
    <div id="widget-suggest-msg" style="font-size:0.75rem;color:#9A96A8;margin-top:0.5rem;"></div>
  </div>`;

  html += '<div style="height:4rem;"></div>';

  // Append cards after the title/subtitle
  const titleH2 = content.querySelector('h2');
  const titleP = content.querySelector('p');
  // Remove old cards if any (everything after the p tag)
  const existingCards = content.querySelectorAll('.life-card, [style*="height:4rem"]');
  existingCards.forEach(c => c.remove());
  // Also remove any leftover spacer divs
  const spacers = content.querySelectorAll('div[style*="height:4rem"]');
  spacers.forEach(s => s.remove());

  // Append new content
  content.insertAdjacentHTML('beforeend', html);
}

// Keep legacy alias so nothing breaks
function initCalendarView() { initLife(); }

function dashAskQuestion() {
  const input = document.getElementById('dash-ai-input');
  if (!input || !input.value.trim()) return;
  const question = input.value.trim();
  input.value = '';
  _startDashChat(question);
}

// ═══ Inline Dashboard Chat ═══
let _dashChatActive = false;

function _startDashChat(question) {
  const content = document.getElementById('dash-content');
  if (!content) return;

  // Only hide greeting elements on first message
  if (!_dashChatActive) {
    _dashChatActive = true;
    const greetingArea = content.querySelector('.dash-greeting-area');
    const exploreBtn = content.querySelector('.dash-explore-btn');
    const buddyCanvas = document.getElementById('buddy-3d-canvas')?.parentElement;
    const ctxChips = content.querySelector('.dash-ctx-chips');

    [greetingArea, exploreBtn, buddyCanvas, ctxChips].forEach(el => {
      if (el) { el.style.transition = 'opacity 0.3s'; el.style.opacity = '0'; setTimeout(() => { el.style.display = 'none'; }, 300); }
    });
  }

  // Create chat area if not already present — or reuse existing
  const delay = document.getElementById('dash-chat-area') ? 0 : 320;
  setTimeout(() => {
    let chatArea = document.getElementById('dash-chat-area');
    if (!chatArea) {
      // Back button
      const backBtn = document.createElement('button');
      backBtn.className = 'dash-chat-back';
      backBtn.innerHTML = '← back to home';
      backBtn.onclick = _closeDashChat;
      content.insertBefore(backBtn, content.firstChild);

      chatArea = document.createElement('div');
      chatArea.className = 'dash-chat-area';
      chatArea.id = 'dash-chat-area';
      const spacer = content.querySelector('div[style*="height: 4rem"]');
      if (spacer) content.insertBefore(chatArea, spacer);
      else content.appendChild(chatArea);
    }

    // Add user message
    _addDashChatMsg('user', question);

    // Generate buddy response
    const thinkTime = 400 + Math.random() * 400;
    setTimeout(() => {
      const typing = document.createElement('div');
      typing.className = 'dash-chat-msg buddy';
      typing.id = 'dash-typing';
      typing.innerHTML = '<span style="display:flex;gap:4px;align-items:center;"><span style="width:6px;height:6px;border-radius:50%;background:#9A96A8;animation:fadeUp 0.6s ease infinite alternate;"></span><span style="width:6px;height:6px;border-radius:50%;background:#9A96A8;animation:fadeUp 0.6s ease 0.15s infinite alternate;"></span><span style="width:6px;height:6px;border-radius:50%;background:#9A96A8;animation:fadeUp 0.6s ease 0.3s infinite alternate;"></span></span>';
      chatArea.appendChild(typing);
      chatArea.scrollTop = chatArea.scrollHeight;

      _getAIResponse(question).then(response => {
        document.getElementById('dash-typing')?.remove();
        _addDashChatMsg('buddy', response, _lastDataContext);
        _lastDataContext = null;
        chatArea.scrollTop = chatArea.scrollHeight;
      });
    }, thinkTime);

    // Focus input for continued conversation
    const input = document.getElementById('dash-ai-input');
    if (input) { input.focus(); input.placeholder = 'ask a follow-up...'; }
  }, delay);
}

let _lastDataContext = null;

function _addDashChatMsg(who, text, dataContext) {
  const chatArea = document.getElementById('dash-chat-area');
  if (!chatArea) return;
  const div = document.createElement('div');
  div.className = `dash-chat-msg ${who}`;
  let safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  // Markdown-lite: bold, code
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.06);padding:2px 5px;border-radius:4px;font-size:0.85em;">$1</code>');
  // Convert → follow-up lines into clickable chips
  const lines = safe.split('\n');
  const followUps = [];
  const mainLines = [];
  lines.forEach(line => {
    if (line.trim().startsWith('→ ') || line.trim().startsWith('&rarr; ')) {
      followUps.push(line.trim().replace(/^(→|&rarr;)\s*/, ''));
    } else {
      mainLines.push(line);
    }
  });
  let mainHtml = mainLines.join('<br>');
  if (followUps.length > 0) {
    mainHtml += '<div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.75rem;">';
    followUps.forEach(fu => {
      mainHtml += `<button onclick="_actionSource='action';document.getElementById('dash-ai-input').value='${fu.replace(/'/g, "\\'")}';dashAskQuestion();" style="padding:6px 14px;border-radius:50px;border:1px solid var(--border);background:var(--surface);font-size:0.78rem;cursor:pointer;color:var(--text-mid);font-family:'Inter',sans-serif;transition:all 0.15s;white-space:nowrap;" onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--text)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-mid)'">${fu}</button>`;
    });
    mainHtml += '</div>';
  }
  div.innerHTML = mainHtml;

  // Add Fivetran AI data badge if this was a data response
  if (dataContext) {
    const badge = document.createElement('div');
    badge.style.cssText = 'margin-top:0.75rem;';
    const sqlSafe = (dataContext.sqlQuery || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    badge.innerHTML = `
      <div onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'" style="display:inline-flex;align-items:center;gap:0.4rem;padding:5px 12px;border-radius:8px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.15);cursor:pointer;font-size:0.72rem;color:#3B82F6;font-weight:600;transition:all 0.2s;">
        📊 powered by fivetran ai · ${dataContext.stepsCount || 0} steps · ${dataContext.tables?.length || 0} tables
      </div>
      <div style="display:none;margin-top:0.5rem;padding:0.75rem;background:rgba(0,0,0,0.04);border-radius:10px;font-family:'SF Mono',monospace;font-size:0.72rem;color:var(--text-mid);white-space:pre-wrap;overflow-x:auto;line-height:1.5;border:1px solid rgba(0,0,0,0.06);">
        <div style="font-weight:700;color:var(--text);margin-bottom:0.4rem;font-family:'Inter',sans-serif;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.08em;">SQL Query</div>
        ${sqlSafe}
        ${dataContext.tables?.length ? `<div style="margin-top:0.5rem;font-weight:700;color:var(--text);font-family:'Inter',sans-serif;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.08em;">Tables</div>${dataContext.tables.join(', ')}` : ''}
      </div>`;
    div.appendChild(badge);
  }

  if (who === 'buddy') {
    const msgIdx = _dashMsgIdx++;
    const feedbackRow = document.createElement('div');
    feedbackRow.className = 'dash-chat-feedback';
    feedbackRow.setAttribute('data-msg-idx', msgIdx);
    feedbackRow.innerHTML = `
      <button class="feedback-btn feedback-up" onclick="chatFeedback(${msgIdx}, 'up')" title="Good answer">\u{1F44D}</button>
      <button class="feedback-btn feedback-down" onclick="chatFeedback(${msgIdx}, 'down')" title="Not helpful">\u{1F44E}</button>
    `;
    div.appendChild(feedbackRow);

    // Create feedback log entry
    window._feedbackLog.push({
      msgIdx: msgIdx,
      timestamp: new Date().toISOString(),
      user: (typeof STATE !== 'undefined' && STATE.profile?.userName) || 'unknown',
      role: (typeof STATE !== 'undefined' && STATE.role) || 'unknown',
      question: _lastUserQuestion,
      response: text,
      rating: null,
      reason: null,
      canAnswer: _lastBuddyCanAnswer,
      category: _lastBuddyCategory,
      focusArea: (typeof STATE !== 'undefined' && STATE.activeFocus) || null,
      sessionId: (typeof STATE !== 'undefined' && STATE._sessionId) || 'unknown',
    });
  }

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function _closeDashChat() {
  const content = document.getElementById('dash-content');
  if (!content) return;

  _dashChatActive = false;

  // Remove chat area and back button
  document.getElementById('dash-chat-area')?.remove();
  content.querySelector('.dash-chat-back')?.remove();

  // Restore hidden elements
  const greetingArea = content.querySelector('.dash-greeting-area');
  const exploreBtn = content.querySelector('.dash-explore-btn');
  const buddyCanvas = document.getElementById('buddy-3d-canvas')?.parentElement;
  const ctxChips = content.querySelector('.dash-ctx-chips');

  [greetingArea, exploreBtn, buddyCanvas, ctxChips].forEach(el => {
    if (el) { el.style.display = ''; el.style.opacity = '0'; setTimeout(() => { el.style.transition = 'opacity 0.3s'; el.style.opacity = '1'; }, 20); }
  });

  // Reset input placeholder
  const input = document.getElementById('dash-ai-input');
  if (input) input.placeholder = 'ask me anything...';
}

// ── AI Chat — calls Claude API via backend ──
let _chatHistory = [];
let _msgCount = 0;
let _lastUserQuestion = '';
let _lastBuddyCanAnswer = true;
let _lastBuddyCategory = 'unknown';
let _dashMsgIdx = 0;
window._feedbackLog = [];

// Session ID
if (typeof STATE !== 'undefined' && !STATE._sessionId) {
  STATE._sessionId = 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ── Feedback global functions ──
window.chatFeedback = function(msgIdx, rating) {
  const container = document.querySelector(`.dash-chat-feedback[data-msg-idx="${msgIdx}"]`);
  if (!container) return;

  const entry = window._feedbackLog.find(f => f.msgIdx === msgIdx);
  if (!entry) return;
  entry.rating = rating;

  if (rating === 'up') {
    const upBtn = container.querySelector('.feedback-up');
    const downBtn = container.querySelector('.feedback-down');
    if (upBtn) { upBtn.classList.add('selected-up'); }
    if (downBtn) { downBtn.classList.add('dimmed'); }
    _submitFeedback(entry);
  } else {
    // Show reason options
    container.innerHTML = `
      <div class="feedback-reason-row">
        <button onclick="chatFeedbackReason(${msgIdx}, 'wrong')">wrong answer</button>
        <button onclick="chatFeedbackReason(${msgIdx}, 'not helpful')">not helpful</button>
        <button onclick="chatFeedbackReason(${msgIdx}, 'missing info')">missing info</button>
      </div>
    `;
  }
};

window.chatFeedbackReason = function(msgIdx, reason) {
  const container = document.querySelector(`.dash-chat-feedback[data-msg-idx="${msgIdx}"]`);
  if (!container) return;

  const entry = window._feedbackLog.find(f => f.msgIdx === msgIdx);
  if (!entry) return;
  entry.reason = reason;

  container.innerHTML = '<div class="feedback-logged">thanks, logged.</div>';
  _submitFeedback(entry);
};

function _submitFeedback(entry) {
  const payload = { ...entry };
  delete payload.msgIdx;
  fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(e => console.log('Feedback send failed:', e));
}

async function _getAIResponse(question) {
  _chatHistory.push({ who: 'user', text: question });
  _lastUserQuestion = question;
  _msgCount++;

  try {
    const source = _actionSource || undefined;
    _actionSource = null; // Reset after use
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        profile: STATE.profile || {},
        role: STATE.role || 'Sales',
        history: _chatHistory.slice(-10),
        source, // 'action' triggers FivetranChat routing
      }),
    });
    const data = await res.json();
    if (data.ok && data.reply) {
      _chatHistory.push({ who: 'buddy', text: data.reply });
      _lastBuddyCanAnswer = data.canAnswer !== undefined ? data.canAnswer : true;
      _lastBuddyCategory = data.category || 'unknown';
      _lastDataContext = data.dataContext || null; // Fivetran AI data context
      // Save to extension clipboard if the response contains actionable content
      _maybeSaveToClipboard(question, data.reply, data.category);
      return data.reply;
    }
  } catch (e) {
    console.log('AI backend unavailable, using local fallback');
  }
  _lastBuddyCanAnswer = true;
  _lastBuddyCategory = 'unknown';

  // Fallback to local response
  let response;
  if (typeof generateBuddyResponse === 'function') {
    response = generateBuddyResponse(question);
  } else {
    response = _simpleBuddyResponse(question);
  }
  if (typeof crossReferenceContext === 'function') {
    response = crossReferenceContext(question, response);
  }
  _chatHistory.push({ who: 'buddy', text: response });
  return response;
}

function _simpleBuddyResponse(input) {
  const lower = input.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return 'hey! what can I help you with?';
  if (lower.includes('help')) return "i'm here to help. you can ask me about your calendar, emails, slack messages, or anything work-related.";
  return "got it. let me look into that for you. is there anything specific you'd like me to focus on?";
}

function _maybeSaveToClipboard(question, reply, category) {
  // Only save substantive responses, not casual chat
  const dominated = ['personal'].includes(category);
  if (dominated) return;
  if (reply.length < 50) return; // too short to be useful

  // Extract context (account name, person name, topic) from the question
  const context = _extractContext(question);

  fetch('/api/clipboard/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: category || 'general',
      title: question.substring(0, 80),
      content: reply,
      context: context,
      source: 'chat',
    }),
  }).catch(() => {}); // silent fail
}

function _extractContext(question) {
  // Try to extract key entities from the question
  const lower = question.toLowerCase();

  // Look for "about [name]", "for [name]", "[name] account/opp"
  const patterns = [
    /(?:about|for|with|prep.*?for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:account|opportunity|deal|call|meeting)/,
  ];

  for (const p of patterns) {
    const match = question.match(p);
    if (match) return match[1];
  }

  return '';
}

function renderCalendarView() {
  // Legacy — now handled by initLife
  initLife();
}

// Keep legacy functions so nothing breaks
function renderDashGreetingLight() { /* handled by renderDashContent */ }
function renderDashGreeting() { /* handled by renderDashContent */ }
function renderDashSuggestions() { /* handled by renderDashContent */ }
function renderDashWidgets() { /* handled by renderDashContent */ }
function renderDashBody() { renderDashContent(); }

/* REMOVED: _legacyRenderDashBody_UNUSED — 246 lines of dead code cleaned up */
function _legacyRenderDashBody_REMOVED() { return; /* stub */
  const body = document.getElementById('dash-body');
  if (!body) return;
  body.innerHTML = '';

  // ── PRIORITY ORDER: Calendar → Slack → Email → Weather → rest ──

  // Calendar timeline (only if Google Calendar connected)
  if (STATE.integrations?.googleCalendar?.connected) {
    const events = getMockCalendar();
    const flags = getCalendarFlags(events);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const timelineHtml = events.map(ev => {
      const [h, m] = ev.time.split(':').map(Number);
      const evMin = h * 60 + m;
      const isPast = evMin + 60 < currentMinutes;
      const isCurrent = evMin <= currentMinutes && evMin + 60 > currentMinutes;
      const isBreak = ev.type === 'break';
      const typeColors = {
        important: '#E8634A', '1on1': '#9DBF10', recurring: '#5b9cf7', break: '#4caf50', meeting: '#ffa726'
      };
      const color = typeColors[ev.type] || 'var(--accent)';

      const clickable = !isBreak && ev.prep;
      const baseStyle = `display:flex;gap:0.75rem;align-items:flex-start;opacity:${isPast ? '0.4' : '1'};${isCurrent ? 'background:rgba(124,111,247,0.08);margin:-0.4rem -0.5rem;padding:0.4rem 0.5rem;border-radius:10px;' : ''}${clickable ? 'cursor:pointer;' : ''}`;
      return `<div style="${baseStyle}" ${clickable ? `onclick="showMeetingPrep('${ev.title.replace(/'/g, "\\'")}')"` : ''}>
        <div style="min-width:42px;font-size:0.75rem;color:var(--text-light);padding-top:2px;">${ev.time}</div>
        <div style="width:3px;min-height:${isBreak ? '20px' : '36px'};border-radius:2px;background:${color};flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:0.85rem;${isBreak ? 'font-style:italic;color:var(--text-light);' : ''}">${ev.title}${isCurrent ? ' <span style="font-size:0.7rem;color:var(--accent);font-weight:400;">now</span>' : ''}</div>
          ${ev.people?.length ? `<div style="font-size:0.7rem;color:var(--text-light);margin-top:1px;">${ev.people.join(', ')}</div>` : ''}
        </div>
        ${!isBreak && ev.prep ? `<div style="font-size:0.65rem;color:var(--accent);padding-top:4px;">prep →</div>` : ''}
      </div>`;
    }).join('');

    const flagsHtml = flags.length ? `<div style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--border);">${flags.map(f => `<div style="font-size:0.75rem;color:#ffa726;margin-bottom:0.25rem;">⚠ ${f}</div>`).join('')}</div>` : '';

    body.innerHTML += `
      <div class="dash-card">
        <h3>📅 Your Day</h3>
        <div style="display:flex;flex-direction:column;gap:0.6rem;margin-top:0.5rem;">
          ${timelineHtml}
        </div>
        ${flagsHtml}
      </div>
    `;
  }

  // ── Gmail card — morning digest ──
  if (STATE.integrations?.gmail?.connected) {
    const emails = getMockEmails();
    const urgentHtml = emails.needsReply.filter(e => e.urgent).map(e =>
      `<div style="display:flex;gap:0.6rem;align-items:flex-start;padding:0.5rem 0;border-bottom:1px solid var(--border);">
        <div style="width:6px;height:6px;border-radius:50%;background:#E8634A;margin-top:6px;flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:0.8rem;">${e.from}</div>
          <div style="font-size:0.75rem;color:var(--text-light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.subject}</div>
        </div>
        <span style="font-size:0.65rem;color:var(--text-light);flex-shrink:0;">${e.time}</span>
      </div>`
    ).join('');
    const otherHtml = emails.needsReply.filter(e => !e.urgent).map(e =>
      `<div style="display:flex;gap:0.6rem;align-items:flex-start;padding:0.5rem 0;border-bottom:1px solid var(--border);">
        <div style="width:6px;height:6px;border-radius:50%;background:var(--accent);margin-top:6px;flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:0.8rem;">${e.from}</div>
          <div style="font-size:0.75rem;color:var(--text-light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.subject}</div>
        </div>
        <span style="font-size:0.65rem;color:var(--text-light);flex-shrink:0;">${e.time}</span>
      </div>`
    ).join('');

    body.innerHTML += `
      <div class="dash-card">
        <h3>📧 Email <span style="font-size:0.75rem;font-weight:400;color:var(--text-light);">${emails.needsReply.length} need reply · ${emails.fyi.length} FYI · ${emails.ignorable} skippable</span></h3>
        ${urgentHtml}${otherHtml}
      </div>
    `;
  }

  // ── Slack card — unread summary + waiting flags ──
  if (STATE.integrations?.slack?.connected) {
    const slack = getMockSlack();
    const waitingHtml = slack.waitingOnYou > 0
      ? `<div style="background:rgba(255,107,157,0.1);border:1px solid rgba(255,107,157,0.3);border-radius:10px;padding:0.5rem 0.75rem;margin-bottom:0.75rem;font-size:0.8rem;color:#E8634A;font-weight:600;">⏳ ${slack.waitingOnYou} people waiting on you</div>`
      : '';
    const dmsHtml = slack.dms.filter(d => d.unread).map(d =>
      `<div style="display:flex;gap:0.6rem;align-items:center;padding:0.4rem 0;">
        <div style="width:6px;height:6px;border-radius:50%;background:${d.waitingOnYou ? '#E8634A' : 'var(--accent)'};flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
          <span style="font-weight:600;font-size:0.8rem;">${d.from}</span>
          <span style="font-size:0.75rem;color:var(--text-light);margin-left:0.4rem;">${d.preview.substring(0, 40)}...</span>
        </div>
      </div>`
    ).join('');
    const mentionsHtml = slack.channels.filter(c => c.mentions > 0).map(c =>
      `<div style="display:flex;gap:0.6rem;align-items:center;padding:0.4rem 0;">
        <span style="font-weight:600;font-size:0.8rem;color:var(--accent);">${c.name}</span>
        <span style="font-size:0.75rem;color:var(--text-light);">${c.preview.substring(0, 45)}...</span>
      </div>`
    ).join('');

    body.innerHTML += `
      <div class="dash-card">
        <h3>💬 Slack</h3>
        ${waitingHtml}
        ${dmsHtml}
        ${mentionsHtml}
        ${slack.threads.length ? `<div style="font-size:0.75rem;color:var(--text-light);margin-top:0.5rem;">${slack.threads.length} thread${slack.threads.length > 1 ? 's' : ''} need${slack.threads.length === 1 ? 's' : ''} your reply</div>` : ''}
      </div>
    `;
  }

  // ── Drive card — recent activity ──
  if (STATE.integrations?.gdrive?.connected) {
    const drive = getMockDrive();
    const sharedHtml = drive.recentlyShared.map(d =>
      `<div style="display:flex;gap:0.6rem;align-items:center;padding:0.4rem 0;">
        <span style="font-size:0.9rem;">${d.type === 'doc' ? '📄' : d.type === 'sheet' ? '📊' : '📁'}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:600;font-size:0.8rem;">${d.name}</div>
          <div style="font-size:0.7rem;color:var(--text-light);">shared by ${d.sharedBy} · ${d.time}</div>
        </div>
      </div>`
    ).join('');

    body.innerHTML += `
      <div class="dash-card">
        <h3>📁 Drive</h3>
        <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:0.5rem;">recently shared with you</div>
        ${sharedHtml}
      </div>
    `;
  }

  // ── ROLE-BASED FOCUS AREAS + ACTION CARDS ──
  if (STATE.role && ROLE_DATA[STATE.role]) {
    const roleData = ROLE_DATA[STATE.role];
    const activeFocus = STATE.activeFocus || roleData.focusAreas[0]?.id;

    // Focus area pills (horizontal scrollable)
    const focusPillsHtml = roleData.focusAreas.map(f =>
      `<button class="focus-pill ${f.id === activeFocus ? 'active' : ''}" onclick="setFocus('${f.id}')">${f.icon} ${f.name}</button>`
    ).join('');

    // Get active focus area's actions
    const focusArea = roleData.focusAreas.find(f => f.id === activeFocus) || roleData.focusAreas[0];
    const actionsHtml = focusArea.actions.map(a => {
      const typeStyle = TYPE_STYLES[a.type] || TYPE_STYLES.ask;
      const tagsHtml = (a.tags || []).map(t => {
        const tc = TAG_COLORS[t] || { bg: '#f3f4f6', text: '#374151', label: t };
        return `<span class="action-tag" style="background:${tc.bg};color:${tc.text};">${tc.label}</span>`;
      }).join('');
      const badges = [
        a.top ? `<span class="action-badge" style="background:#2d2055;color:#c4b5fd;">top</span>` : '',
        a.rising ? `<span class="action-badge" style="background:#44370a;color:#fbbf24;">rising</span>` : '',
        a.multi ? `<span class="action-badge" style="background:#1e1b4b;color:#a78bfa;border:1px solid #4c3f8f;">multi</span>` : '',
      ].filter(Boolean).join('');

      return `<div class="action-card" onclick="runAction(this, '${a.title.replace(/'/g, "\\'")}')">
        <div style="display:flex;align-items:center;gap:0.4rem;">
          <span class="action-type" style="background:${typeStyle.bg};color:${typeStyle.border};border:1px solid ${typeStyle.border};">${typeStyle.label}</span>
          ${badges}
        </div>
        <div class="action-title">${a.title}</div>
        <div class="action-meta">${a.meta}</div>
        <div class="action-tags">${tagsHtml}</div>
      </div>`;
    }).join('');

    body.innerHTML += `
      <div class="dash-card" style="padding:0.75rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;padding:0 0.25rem;">
          <span style="font-size:1rem;">${roleData.icon}</span>
          <h3 style="margin:0;font-size:0.95rem;">${roleData.name}</h3>
          <span style="font-size:0.7rem;color:var(--text-light);margin-left:auto;">${STATE.subrole || ''}</span>
        </div>
        <div class="focus-sidebar">${focusPillsHtml}</div>
        <div style="font-size:0.75rem;color:var(--text-light);margin:0.5rem 0.25rem 0.75rem;">${focusArea.desc}</div>
        <div style="display:grid;grid-template-columns:1fr;gap:0.6rem;">
          ${actionsHtml}
        </div>
      </div>
    `;
  }

  // Weather moved to Life tab

  // Streak + Level card
  const xpNeeded = STATE.level * 100;
  const xpPct = Math.min(100, (STATE.xp / xpNeeded) * 100);
  body.innerHTML += `
    <div class="dash-card">
      <h3>\u2728 Level ${STATE.level} <span class="streak-badge">\u{1F525} ${STATE.streak} day streak</span></h3>
      <p style="margin-bottom:0.5rem">${STATE.xp} / ${xpNeeded} XP</p>
      <div class="xp-bar-wrap"><div class="xp-bar" style="width:${xpPct}%"></div></div>
    </div>
  `;

  // Mood tracker moved to Life tab

  // Daily quests
  let questHtml = STATE.quests.map((q, i) => `
    <div class="quest-item">
      <div class="quest-check ${q.done ? 'done' : ''}" onclick="toggleQuest(${i})"></div>
      <span class="quest-text ${q.done ? 'done' : ''}">${q.text}</span>
      <span class="quest-xp">+${q.xp} XP</span>
    </div>
  `).join('');

  body.innerHTML += `
    <div class="dash-card">
      <h3>\u{1F3AF} Daily Quests</h3>
      ${questHtml}
    </div>
  `;

  // Briefing card
  body.innerHTML += `
    <div class="dash-card">
      <h3>\u{1F4CB} Today's Briefing</h3>
      <ul>
        ${generateBriefing().map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  `;

  // Collectibles
  body.innerHTML += `
    <div class="dash-card">
      <h3>\u{1F3C6} Collectibles (${STATE.collectibles.length})</h3>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem;">
        ${STATE.collectibles.map(c => `<div style="background:var(--border);border-radius:12px;padding:0.5rem 0.75rem;font-size:0.8rem;">${getCollectibleLabel(c)}</div>`).join('')}
      </div>
    </div>
  `;

  // Spacer for bottom nav
  body.innerHTML += '<div style="height:4rem"></div>';
}

// Process a completed meeting — pull transcript, summarize, extract actions
function processMeeting(title) {
  const events = (typeof getMockCalendar === 'function') ? getMockCalendar() : [];
  const ev = events.find(e => e.title === title);
  const attendees = ev?.attendees?.filter(a => !a.self).map(a => a.email) || ev?.people || [];

  // Show overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  const card = document.createElement('div');
  card.style.cssText = 'background:var(--surface);border-radius:20px;padding:2rem;max-width:520px;width:100%;max-height:85vh;overflow-y:auto;';
  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
      <h2 style="font-family:'Nunito',sans-serif;font-weight:800;font-size:1.15rem;margin:0;">${title}</h2>
      <button onclick="this.closest('div[style*=fixed]').remove()" style="background:none;border:none;color:var(--text-light);font-size:1.5rem;cursor:pointer;">×</button>
    </div>
    <div id="process-body" style="text-align:center;padding:2rem;">
      <div style="font-size:1.5rem;margin-bottom:0.5rem;">📝</div>
      <div style="font-size:0.9rem;color:var(--text-light);">looking for Google Meet transcript...</div>
    </div>`;
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  fetch('/api/meeting/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, attendees }),
  })
  .then(r => r.json())
  .then(data => {
    const body = document.getElementById('process-body');
    if (!body) return;

    if (!data.ok || !data.found) {
      body.innerHTML = `
        <div style="text-align:center;padding:1rem;">
          <div style="font-size:1.5rem;margin-bottom:0.75rem;">🔇</div>
          <div style="font-weight:600;font-size:0.95rem;margin-bottom:0.5rem;">no transcript found</div>
          <div style="font-size:0.8rem;color:var(--text-light);line-height:1.5;">${data.message || 'Make sure Google Meet transcription is enabled in your Workspace settings. Transcripts may take a few minutes to appear.'}</div>
        </div>`;
      return;
    }

    if (!data.summary) {
      body.innerHTML = '<div style="font-size:0.85rem;color:var(--text-light);">transcript found but AI summary unavailable.</div>';
      return;
    }

    const s = data.summary;
    body.style.textAlign = 'left';
    body.innerHTML = `
      ${s.summary ? `<div style="margin-bottom:1.25rem;">
        <div style="font-weight:700;font-size:0.75rem;color:var(--accent);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;">summary</div>
        <div style="font-size:0.9rem;line-height:1.6;">${s.summary}</div>
      </div>` : ''}
      ${s.decisions?.length ? `<div style="margin-bottom:1.25rem;">
        <div style="font-weight:700;font-size:0.75rem;color:#3B82F6;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;">decisions</div>
        ${s.decisions.map(d => `<div style="font-size:0.85rem;padding:0.2rem 0;">✅ ${d}</div>`).join('')}
      </div>` : ''}
      ${s.myActions?.length ? `<div style="margin-bottom:1.25rem;">
        <div style="font-weight:700;font-size:0.75rem;color:#E8634A;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;">your action items</div>
        ${s.myActions.map(a => `<div style="font-size:0.85rem;padding:0.2rem 0;">🔴 ${a}</div>`).join('')}
      </div>` : ''}
      ${s.allActionItems?.length ? `<div style="margin-bottom:1.25rem;">
        <div style="font-weight:700;font-size:0.75rem;color:#ffa726;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;">all action items</div>
        ${s.allActionItems.map(a => `<div style="font-size:0.85rem;padding:0.2rem 0;">📋 <strong>${a.owner}</strong>: ${a.task}${a.deadline ? ' (by ' + a.deadline + ')' : ''}</div>`).join('')}
      </div>` : ''}
      ${s.followUps?.length ? `<div style="margin-bottom:1.25rem;">
        <div style="font-weight:700;font-size:0.75rem;color:#10B981;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;">follow up next time</div>
        ${s.followUps.map(f => `<div style="font-size:0.85rem;padding:0.2rem 0;">↩️ ${f}</div>`).join('')}
      </div>` : ''}
    `;
  })
  .catch(err => {
    const body = document.getElementById('process-body');
    if (body) body.innerHTML = `<div style="color:var(--text-light);font-size:0.85rem;">error: ${err.message}</div>`;
  });
}

// Meeting prep overlay — shows full strategic prep for a meeting
function showMeetingPrep(title) {
  const events = getMockCalendar();
  const ev = events.find(e => e.title === title);
  if (!ev) return;

  // Show overlay immediately with loading state
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  const card = document.createElement('div');
  card.style.cssText = 'background:var(--surface);border-radius:20px;padding:2rem;max-width:520px;width:100%;max-height:85vh;overflow-y:auto;';
  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
      <div>
        <h2 style="font-family:'Nunito',sans-serif;font-weight:800;font-size:1.2rem;margin:0;">${ev.title}</h2>
        <div style="font-size:0.85rem;color:var(--text-light);margin-top:0.25rem;">${ev.time} – ${ev.end} · ${ev.people.join(', ')}</div>
      </div>
      <button onclick="this.closest('div[style*=fixed]').remove()" style="background:none;border:none;color:var(--text-light);font-size:1.5rem;cursor:pointer;">×</button>
    </div>
    <div id="prep-body" style="display:flex;flex-direction:column;gap:1.25rem;">
      <div style="text-align:center;padding:2rem;color:var(--text-light);">
        <div style="font-size:1.5rem;margin-bottom:0.5rem;">🔍</div>
        <div style="font-size:0.9rem;">pulling intel from Gong, Zendesk, and Salesforce...</div>
      </div>
    </div>`;
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Extract account name from title or attendees
  const account = ev.account || ev.title.replace(/sync|meeting|call|discussion|prep|review/gi, '').trim();

  // Determine what to fetch based on privacy settings and meeting type
  const isExternal = ev.isExternal;
  const priv = STATE.privacy || {};

  // Only call meeting prep API for external meetings, or internal if channel context is enabled
  if (!isExternal && !priv.internalChannelContext) {
    // Internal meeting with no context enabled — show clean state
    const body = document.getElementById('prep-body');
    if (body) {
      const people = ev.people?.join(', ') || '';
      body.innerHTML = `
        <div style="text-align:center;padding:1.5rem 1rem;">
          <div style="font-size:1.5rem;margin-bottom:0.75rem;">🟢</div>
          <div style="font-weight:700;font-size:0.95rem;margin-bottom:0.5rem;">internal meeting</div>
          <div style="font-size:0.85rem;color:var(--text-light);line-height:1.6;margin-bottom:1.25rem;">${people ? 'with ' + people : 'no attendee info'}</div>
          ${priv.postMeetingTranscript ? '<div style="font-size:0.75rem;color:#10B981;margin-bottom:0.75rem;">📝 post-meeting summary will be generated automatically</div>' : ''}
          <div style="font-size:0.78rem;color:var(--text-faint);">enable "public channel context" in Profile → Meeting Intelligence to get prep for internal meetings</div>
        </div>`;
    }
    return;
  }

  // Call the real meeting prep API
  fetch('/api/meeting-prep', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: ev.title, attendees: ev.people, account, isExternal }),
  })
  .then(r => r.json())
  .then(data => {
    const body = document.getElementById('prep-body');
    if (!body) return;

    if (data.ok && data.prep) {
      const p = data.prep;
      body.innerHTML = _buildPrepSection('context', 'var(--accent)', p.context)
        + _buildPrepSection('call history (gong)', '#9b59b6', p.callHistory)
        + _buildPrepSection('open support tickets', '#e67e22', p.openTickets)
        + _buildPrepSection('competitor mentions', '#e74c3c', p.competitorMentions)
        + _buildPrepSection("what they'll want to discuss", '#E8634A', p.theyWant)
        + _buildPrepSection('you should bring up', '#4caf50', p.youShould)
        + _buildPrepSection('risk signals', '#f44336', p.risk)
        + _buildPrepSources(p.sources);
    } else {
      // Fall back to mock prep if API fails
      _showMockPrep(body, ev);
    }
  })
  .catch(() => {
    const body = document.getElementById('prep-body');
    if (body) _showMockPrep(body, ev);
  });
}

function _buildPrepSection(label, color, content) {
  if (!content || content === 'none found' || content === 'none detected') return '';
  return `<div>
    <div style="font-weight:700;font-size:0.75rem;color:${color};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;">${label}</div>
    <div style="font-size:0.9rem;line-height:1.6;color:var(--text);">${content}</div>
  </div>`;
}

function _buildPrepSources(sources) {
  if (!sources) return '';
  let html = '';
  if (sources.gongCalls?.length) {
    html += `<div>
      <div style="font-weight:700;font-size:0.75rem;color:#9b59b6;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;">recent calls</div>
      ${sources.gongCalls.map(c => `<div style="font-size:0.85rem;padding:0.2rem 0;">
        ${c.url ? `<a href="${c.url}" target="_blank" style="color:var(--accent);text-decoration:none;">🎙 ${c.title}</a>` : `🎙 ${c.title}`}
      </div>`).join('')}
    </div>`;
  }
  if (sources.tickets?.length) {
    html += `<div>
      <div style="font-weight:700;font-size:0.75rem;color:#e67e22;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;">support tickets</div>
      ${sources.tickets.map(t => `<div style="font-size:0.85rem;padding:0.2rem 0;">
        ${t.url ? `<a href="${t.url}" target="_blank" style="color:var(--accent);text-decoration:none;">🎫 ${t.title}</a>` : `🎫 ${t.title}`}
      </div>`).join('')}
    </div>`;
  }
  return html;
}

function _showMockPrep(body, ev) {
  const p = ev.prep;
  if (!p) {
    body.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--text-light);font-size:0.9rem;">no prep data available for this meeting yet.</div>';
    return;
  }
  body.innerHTML = `
    <div>
      <div style="font-weight:700;font-size:0.75rem;color:var(--accent);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;">context</div>
      <div style="font-size:0.9rem;line-height:1.5;color:var(--text);">${p.context}</div>
    </div>
    ${p.agenda ? `<div>
      <div style="font-weight:700;font-size:0.75rem;color:var(--accent);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;">agenda</div>
      ${p.agenda.map(a => `<div style="font-size:0.9rem;padding:0.3rem 0;color:var(--text);">• ${a}</div>`).join('')}
    </div>` : ''}
    <div>
      <div style="font-weight:700;font-size:0.75rem;color:#E8634A;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;">what they'll want to discuss</div>
      <div style="font-size:0.9rem;line-height:1.5;color:var(--text);">${p.theyWant}</div>
    </div>
    <div>
      <div style="font-weight:700;font-size:0.75rem;color:#4caf50;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.4rem;">you should bring up</div>
      <div style="font-size:0.9rem;line-height:1.5;color:var(--text);">${p.youShould}</div>
    </div>`;
}
