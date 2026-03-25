// ════════════════════════════════════════════════════════
// CALENDAR — mock data (would be Google Calendar API in prod)
// ════════════════════════════════════════════════════════
function getMockCalendar() {
  return [
    { time: '8:00', end: '9:00', title: 'All Hands Meeting', people: ['Company'], type: 'recurring',
      prep: null },
    { time: '8:30', end: '9:00', title: 'Breakfast for Summit', people: ['Summit attendees'], type: 'break' },
    { time: '8:30', end: '9:00', title: 'Sync on USAA MCP Discussion', people: ['Scott Neiger', 'team'], type: 'important',
      prep: { context: 'aligning on game plan for Friday call with USAA. reviewing MCP with Authorization workflows design pattern.',
        agenda: ['MCP authorization workflow design', 'USAA call prep for Friday'],
        theyWant: 'Scott wants to align on the positioning for the MCP auth pattern.',
        youShould: 'bring your thoughts on how MCP fits the USAA use case',
        followUps: [] }},
    { time: '9:00', end: '10:00', title: 'AI Summit: Inspiration and Examples', people: ['Kevin Kim', 'Elijah Davis'], type: 'meeting',
      prep: { context: 'anyone can build their own automations and apps. Elijah demos Workloads app (Rocketlane, Salesforce).',
        agenda: ['automations and apps demo', 'Elijah\'s Workloads app'],
        theyWant: 'Kevin is running it. Elijah is demoing.',
        youShould: 'pay attention to how Elijah built the Workloads app — could inform your buddy product thinking',
        followUps: [] }},
    { time: '10:00', end: '10:30', title: 'AI Summit: Support Team Goals', people: ['Summit team'], type: 'meeting',
      prep: null },
    { time: '10:30', end: '12:00', title: 'AI Summit: Building Production Agents', people: ['Summit team'], type: 'important',
      prep: { context: 'core session on building agents that actually run in production.',
        agenda: ['production agent architecture', 'deployment patterns', 'real-world examples'],
        theyWant: 'Kevin organized this. Deep technical session.',
        youShould: 'think about how this connects to the buddy/companion product you\'re designing',
        followUps: [] }},
    { time: '12:00', end: '12:30', title: 'Kelsey / Charlie - FDE Solutions', people: ['Kelsey Boyce'], type: '1on1',
      prep: { context: 'FDE Solutions sync. Kelsey messaged saying DD is going through merger work so she may not have updates.',
        agenda: ['DD merger status', 'FDE solutions progress'],
        theyWant: 'Kelsey offered to reschedule since you\'re at the summit.',
        youShould: 'check if you still want to keep this or take her up on rescheduling',
        followUps: [] }},
    { time: '12:30', end: '13:00', title: 'Busy', people: [], type: 'break' },
    { time: '13:00', end: '15:00', title: 'AI Summit: Deploying Production Agents', people: ['Summit team'], type: 'important',
      prep: null },
    { time: '13:00', end: '13:30', title: 'Charlie / Logan', people: ['Logan'], type: '1on1',
      prep: { context: 'sync with Logan. conflicts with the AI Summit session.',
        agenda: ['catch up'],
        theyWant: 'Logan set this up.',
        youShould: 'decide if you\'re attending this or staying in the summit session',
        followUps: [] }},
    { time: '15:00', end: '16:00', title: 'AI Summit: Agents Architecture', people: ['Summit team'], type: 'meeting',
      prep: null },
  ];
}

function getCalendarFlags(events) {
  const flags = [];
  for (let i = 0; i < events.length - 1; i++) {
    if (events[i].end === events[i+1].time && events[i].type !== 'break' && events[i+1].type !== 'break') {
      flags.push(`back-to-back: ${events[i].title} → ${events[i+1].title}`);
    }
  }
  const hasLunch = events.some(e => e.type === 'break');
  if (!hasLunch) flags.push('no break scheduled — consider blocking time for lunch');
  const meetingCount = events.filter(e => e.type !== 'break').length;
  if (meetingCount >= 5) flags.push(`${meetingCount} meetings today — heavy day, pace yourself`);
  return flags;
}

// ════════════════════════════════════════════════════════
// GMAIL — mock data (would be Gmail API in prod)
// ════════════════════════════════════════════════════════
function getMockEmails() {
  return {
    needsReply: [
      { from: 'Brandon Hales', subject: 'Proposed new time: Brandon / Charlie - MGMT @ Fri Mar 20', time: '10:50 AM', preview: 'Brandon Hales has accepted and proposed Fri Mar 20, 11am – 11:30am', urgent: false },
      { from: 'Ali Cooper', subject: 'Fivetran / Samsara - AI & MCP Discovery/Demo @ Fri Mar 27', time: '9:56 AM', preview: 'You have been invited to attend an event on Friday Mar 27, 12pm - 1pm', urgent: false },
    ],
    fyi: [
      { from: 'Ali & Pradiep', subject: 'Re: Fivetran / Samsara - Executive Business Review', time: '9:56 AM', preview: 'That time works! I\'ll send an invite shortly.' },
    ],
    ignorable: 0,
    total: 3,
  };
}

// ════════════════════════════════════════════════════════
// GOOGLE DRIVE — mock data
// ════════════════════════════════════════════════════════
function getMockDrive() {
  return {
    recentlyShared: [
      { name: 'Fivetran AI Summit Agenda', type: 'doc', sharedBy: 'Kevin Kim', time: 'Today', link: '#' },
    ],
    recentlyEdited: [
      { name: 'Fivetran AI Summit Agenda', type: 'doc', time: 'Today', link: '#' },
    ],
    meetingDocs: {
      'AI Summit: Inspiration and Examples': [
        { name: 'Fivetran AI Summit Agenda', type: 'doc', link: '#' },
      ],
      'AI Summit: Building Production Agents': [
        { name: 'Fivetran AI Summit Agenda', type: 'doc', link: '#' },
      ],
      'Sync on USAA MCP Discussion': [
        { name: 'MCP Authorization Workflows', type: 'doc', link: '#' },
      ],
    }
  };
}

// ════════════════════════════════════════════════════════
// SLACK — mock data
// ════════════════════════════════════════════════════════
function getMockSlack() {
  return {
    dms: [
      { from: 'Kelsey Boyce', preview: 'hey! I dont have an update for you since DD is going through merger work...offering the time back', time: '11:24 AM', unread: true, waitingOnYou: true },
    ],
    channels: [],
    threads: [],
    waitingOnYou: 1,
  };
}

// ════════════════════════════════════════════════════════
// WEATHER — mock data
// ════════════════════════════════════════════════════════
function getMockWeather() {
  const city = STATE.profile.city || 'your city';
  const temps = ['52\u00B0F','68\u00B0F','74\u00B0F','45\u00B0F','82\u00B0F','61\u00B0F'];
  const descs = ['Partly cloudy','Sunny','Light rain','Overcast','Clear skies','Breezy'];
  const icons = ['\u26C5','\u2600\uFE0F','\u{1F327}\uFE0F','\u2601\uFE0F','\u2600\uFE0F','\u{1F32C}\uFE0F'];
  const notes = [
    'Good day for a walk at lunch',
    'Perfect day outside',
    'Grab a jacket',
    'Cozy inside day',
    'Beautiful out there',
    'Layer up'
  ];
  const seed = new Date().getDate() % temps.length;
  return { temp: temps[seed], desc: `${descs[seed]} in ${city}`, icon: icons[seed], note: notes[seed] };
}

// ════════════════════════════════════════════════════════
// SPORTS — mock data
// ════════════════════════════════════════════════════════
function getMockSports() {
  return [
    { team1: 'Warriors', emoji1: '\u{1F3C0}', score1: 112, team2: 'Lakers', emoji2: '\u{1F3C0}', score2: 108, status: 'FINAL' },
    { team1: 'Giants', emoji1: '\u26BE', score1: 3, team2: 'Dodgers', emoji2: '\u26BE', score2: 5, status: 'LIVE \u00B7 6th' },
    { team1: '49ers', emoji1: '\u{1F3C8}', score1: 0, team2: 'Seahawks', emoji2: '\u{1F3C8}', score2: 0, status: 'Sun 1:05 PM' },
  ];
}

// ════════════════════════════════════════════════════════
// HEALTH — mock data
// ════════════════════════════════════════════════════════
function getMockHealth() {
  const integ = STATE.integrations || {};
  const hasHealth = integ.whoop?.connected || integ.oura?.connected || integ.appleHealth?.connected;
  if (!hasHealth) return { connected: false };
  return {
    connected: true,
    stats: [
      { label: 'Sleep Score', value: '82', color: '#9DBF10' },
      { label: 'Recovery', value: '67%', color: '#10b981' },
      { label: 'HRV', value: '45ms', color: '#d97706' },
      { label: 'Strain', value: '8.2', color: '#ef4444' },
    ]
  };
}

// ════════════════════════════════════════════════════════
// MUSIC — mock data
// ════════════════════════════════════════════════════════
function getMockMusic() {
  return [
    { title: 'Redbone', artist: 'Childish Gambino', time: '3:26', color: '#EEEDFE' },
    { title: 'Electric Feel', artist: 'MGMT', time: '3:49', color: '#E1F5EE' },
    { title: 'Nights', artist: 'Frank Ocean', time: '5:07', color: '#FEF3C7' },
  ];
}
