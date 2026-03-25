// ════════════════════════════════════════════════════════
// GAMIFICATION
// ════════════════════════════════════════════════════════
function updateStreak() {
  const today = new Date().toDateString();
  if (STATE.lastCheckin === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (STATE.lastCheckin === yesterday) {
    STATE.streak++;
  } else if (STATE.lastCheckin !== today) {
    STATE.streak = 1;
  }
  STATE.lastCheckin = today;

  // Streak milestones
  if (STATE.streak === 7 && !STATE.milestones.includes('streak-7')) {
    STATE.milestones.push('streak-7');
    if (!STATE.collectibles.includes('week-warrior')) STATE.collectibles.push('week-warrior');
    setTimeout(() => celebrate('1 Week Streak!', `You and ${STATE.avatar.name} have been together for a whole week!`), 500);
  }
  if (STATE.streak === 30 && !STATE.milestones.includes('streak-30')) {
    STATE.milestones.push('streak-30');
    if (!STATE.collectibles.includes('month-master')) STATE.collectibles.push('month-master');
    setTimeout(() => celebrate('30 Day Streak!', `A whole month! ${STATE.avatar.name} is so proud of you.`), 500);
  }
  saveState();
}

function generateDailyQuests() {
  const allQuests = [
    { text: 'Take a 5 minute break and stretch', xp: 15 },
    { text: 'Tell me one good thing about today', xp: 20 },
    { text: 'Knock out that one task you\'ve been avoiding', xp: 30 },
    { text: 'Drink a glass of water', xp: 10 },
    { text: 'Check in with a coworker — just say hi', xp: 20 },
    { text: 'Write down 3 things you\'re grateful for', xp: 20 },
    { text: 'Take a short walk, even just around the block', xp: 15 },
    { text: 'Clear 5 unread emails', xp: 25 },
    { text: 'Spend 2 minutes just breathing', xp: 15 },
    { text: 'Set one intention for tomorrow', xp: 20 },
    { text: 'Tidy up your workspace for 2 minutes', xp: 10 },
    { text: 'Listen to a song that makes you happy', xp: 15 },
  ];
  // Pick 4 random quests
  const shuffled = allQuests.sort(() => Math.random() - 0.5);
  STATE.quests = shuffled.slice(0, 4).map(q => ({ ...q, done: false }));
  STATE.questsDate = new Date().toDateString();
  saveState();
}

function generateDailyQuestsIfNeeded() {
  if (STATE.questsDate !== new Date().toDateString()) generateDailyQuests();
}

function toggleQuest(idx) {
  const q = STATE.quests[idx];
  if (q.done) return;
  q.done = true;
  gainXP(q.xp);
  saveState();
  renderDashBody();

  // Check if all quests done
  if (STATE.quests.every(x => x.done) && !STATE.milestones.includes('quests-first')) {
    STATE.milestones.push('quests-first');
    if (!STATE.collectibles.includes('quest-hero')) STATE.collectibles.push('quest-hero');
    saveState();
    setTimeout(() => celebrate('All Quests Done!', 'You crushed every quest today. Here\'s something special.'), 500);
  }
}

function gainXP(amount) {
  STATE.xp += amount;
  const needed = STATE.level * 100;
  if (STATE.xp >= needed) {
    STATE.xp -= needed;
    STATE.level++;
    if (!STATE.collectibles.includes(`level-${STATE.level}`)) STATE.collectibles.push(`level-${STATE.level}`);
    saveState();
    setTimeout(() => celebrate(`Level ${STATE.level}!`, `${STATE.avatar.name} evolved! Keep going.`), 300);
  }
  saveState();
}

function setMood(idx) {
  const today = new Date().toDateString();
  const existing = STATE.moodLog.findIndex(m => m.date === today);
  if (existing >= 0) STATE.moodLog[existing].mood = idx;
  else STATE.moodLog.push({ date: today, mood: idx });
  if (STATE.moodLog.length > 90) STATE.moodLog = STATE.moodLog.slice(-90);
  if (!STATE.collectibles.includes('first-mood')) { STATE.collectibles.push('first-mood'); }
  gainXP(10);
  saveState();
  // Re-render whichever screen is active
  const lifeScreen = document.getElementById('life');
  if (lifeScreen && lifeScreen.classList.contains('active')) {
    initLife();
  } else {
    renderDashBody();
  }
}

function getCollectibleLabel(id) {
  const labels = {
    'starter-badge': '\u{1F31F} Starter Badge',
    'week-warrior': '\u{1F525} Week Warrior',
    'month-master': '\u{1F3C5} Month Master',
    'quest-hero': '\u{1F9E9} Quest Hero',
    'first-mood': '\u{1F60A} Mood Tracker',
  };
  if (id.startsWith('level-')) return `\u2B50 Level ${id.split('-')[1]}`;
  return labels[id] || `\u{1F381} ${id}`;
}

function generateBriefing() {
  const items = [];
  const hour = new Date().getHours();
  const name = STATE.profile.userName || 'you';

  if (hour < 12) {
    items.push(`It's morning — ${STATE.profile.morning ? STATE.profile.morning.includes('early') ? 'looks like you\'re on schedule' : 'ease into it, no rush' : 'take it at your pace'}`);
  } else if (hour < 17) {
    items.push('Afternoon push — you\'re past the halfway mark');
  } else {
    items.push('Evening mode — time to start winding down');
  }

  if (STATE.profile.goals) items.push(`Remember your goal: "${STATE.profile.goals.substring(0, 60)}${STATE.profile.goals.length > 60 ? '...' : ''}"`);
  if (STATE.profile.skills) items.push(`Skill building: keep working on ${STATE.profile.skills.split(' ').slice(0, 5).join(' ')}`);
  if (STATE.profile.systems) items.push(`Your tools today: ${STATE.profile.systems.split(',').slice(0, 3).join(', ').trim()}`);
  if (STATE.profile.interests) items.push(`Don't forget to make time for ${STATE.profile.interests.split(' ').slice(0, 4).join(' ')}`);
  items.push(`${STATE.quests.filter(q => !q.done).length} quests remaining today`);

  return items;
}
