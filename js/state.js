// ════════════════════════════════════════════════════════
// BUDDY CUSTOMIZATION CONSTANTS
// ════════════════════════════════════════════════════════

const BUDDY_COLORS = [
  { name: 'Coral',    hex: '#E8634A' },
  { name: 'Teal',     hex: '#2A9D8F' },
  { name: 'Indigo',   hex: '#5A67D8' },
  { name: 'Amber',    hex: '#D4941A' },
  { name: 'Rose',     hex: '#C44569' },
  { name: 'Sage',     hex: '#6B8E6B' },
  { name: 'Lavender', hex: '#9B8FD4' },
  { name: 'Sunset',   hex: '#E8915C' },
];

const BUDDY_MOODS = [
  { id: 'happy',      label: 'Happy',      desc: 'always smiling',  eyes: 'curved-up',   animSpeed: 1.8, animAmp: 0.2  },
  { id: 'chill',      label: 'Chill',      desc: 'cool and calm',   eyes: 'half-closed',  animSpeed: 0.6, animAmp: 0.08 },
  { id: 'energetic',  label: 'Energetic',  desc: 'full of energy',  eyes: 'wide',         animSpeed: 2.2, animAmp: 0.25 },
  { id: 'thoughtful', label: 'Thoughtful', desc: 'always thinking', eyes: 'squint',       animSpeed: 0.8, animAmp: 0.1  },
];

const BUDDY_ACCESSORIES = [
  { id: 'hat',     label: 'Tiny Hat',  icon: '🎩', group: 'head' },
  { id: 'crown',   label: 'Crown',     icon: '👑', group: 'head' },
  { id: 'glasses', label: 'Glasses',   icon: '👓', group: 'face' },
  { id: 'bow',     label: 'Bow',       icon: '🎀', group: 'base' },
  { id: 'star',    label: 'Star',      icon: '⭐', group: 'orbit' },
  { id: 'scarf',   label: 'Scarf',     icon: '🧣', group: 'base' },
];

// ════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════
function defaultState() {
  return {
    avatar: { color: '#E8634A', mood: 'happy', accessories: [], name: '' },
    profile: { userName: '', role: '', city: '', morning: '', interests: '', funfact: '', avoid: '', private: '', goals: '', interactionLevel: '', systems: '', dayToDay: '', skills: '' },
    personal: {
      pets: '', food: '', music: '', hobbies: '', sports: '', shows: '',
      coffeeOrder: '', favoritePlace: '', dreamVacation: '', motto: '',
      memories: []
    },
    integrations: {
      whoop: null, oura: null, appleHealth: null, functionHealth: null,
      garmin: null, fitbit: null, spotify: null, strava: null, googleCalendar: null,
    },
    autopilot: {
      postCallFill: false,       // auto-fill SF opps after Gong calls
      autoCreateOpp: false,      // auto-create expansion opp if none exists
      defaultProduct: 'Fivetran Saas',  // product to select in "Products Being Pitched"
    },
    role: null, subrole: null,
    activeFocus: null, activeCategory: 'all',
    onboarded: false,
    xp: 0, level: 1, streak: 0, lastCheckin: null,
    quests: [], questsDate: null,
    moodLog: [],
    chatHistory: [],
    collectibles: ['starter-badge'],
    milestones: []
  };
}

function loadState() {
  const state = defaultState();
  try {
    const saved = JSON.parse(localStorage.getItem('buddy-state'));
    if (saved) {
      Object.assign(state, saved);
      // Migrate old avatar format
      if (state.avatar && state.avatar.shape) {
        delete state.avatar.shape;
        if (!state.avatar.mood) state.avatar.mood = 'happy';
        const validColors = BUDDY_COLORS.map(c => c.hex);
        if (!validColors.includes(state.avatar.color)) {
          state.avatar.color = '#E8634A';
        }
      }
    }
  } catch(e) {}
  return state;
}

const STATE = loadState();

function saveState() {
  localStorage.setItem('buddy-state', JSON.stringify(STATE));
}

