require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { google } = require('googleapis');
const app = express();

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Google OAuth (Calendar + Gmail) ──
const GCAL_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GCAL_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const _calTokens = new Map(); // in-memory cache: email → tokens

// GCS token persistence
const { Storage } = require('@google-cloud/storage');
const _gcs = new Storage();
const TOKEN_BUCKET = 'buddy-tokens-store';

async function saveUserTokens(email, tokens) {
  _calTokens.set(email, tokens);
  try {
    await _gcs.bucket(TOKEN_BUCKET).file(`tokens/${email}.json`).save(JSON.stringify(tokens));
    console.log(`[tokens] Saved tokens for ${email}`);
  } catch (e) {
    console.log(`[tokens] GCS save failed (local only): ${e.message}`);
  }
}

async function loadUserTokens(email) {
  // Check memory cache first
  if (_calTokens.has(email)) return _calTokens.get(email);
  // Try GCS
  try {
    const [content] = await _gcs.bucket(TOKEN_BUCKET).file(`tokens/${email}.json`).download();
    const tokens = JSON.parse(content.toString());
    _calTokens.set(email, tokens);
    console.log(`[tokens] Loaded tokens for ${email} from GCS`);
    return tokens;
  } catch (e) {
    return null;
  }
}

function getCalOAuth2(redirectUri) {
  return new google.auth.OAuth2(GCAL_CLIENT_ID, GCAL_CLIENT_SECRET, redirectUri);
}

// ── IAP user extraction — reads identity from GCP Identity-Aware Proxy headers ──
// IAP handles auth at the infrastructure level — only @fivetran.com users can reach us
function getIAPUser(req) {
  const emailHeader = req.headers['x-goog-authenticated-user-email'] || '';
  const idHeader = req.headers['x-goog-authenticated-user-id'] || '';
  // Header format: "accounts.google.com:charlie.winovich@fivetran.com"
  const email = emailHeader.replace('accounts.google.com:', '');
  const id = idHeader.replace('accounts.google.com:', '');
  if (email) return { email, id, name: email.split('@')[0].replace('.', ' ') };
  return null;
}

// ── Auth endpoint — returns current user from IAP headers ──
app.get('/api/auth/me', (req, res) => {
  const user = getIAPUser(req);
  if (user) {
    res.json({ ok: true, user });
  } else {
    // Local dev — no IAP headers, return dev user
    res.json({ ok: true, user: { email: 'dev@fivetran.com', name: 'dev', id: 'local' } });
  }
});

// ── Connect Google account (Calendar + Gmail in one prompt) ──
app.get('/api/connect/google', (req, res) => {
  if (!GCAL_CLIENT_ID) return res.json({ ok: false, error: 'Google OAuth not configured' });
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const redirectUri = `${proto}://${req.get('host')}/api/calendar/callback`;
  const oauth2 = getCalOAuth2(redirectUri);
  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    hd: 'fivetran.com',
  });
  res.redirect(url);
});

app.get('/api/calendar/auth', (req, res) => res.redirect('/api/connect/google'));

app.get('/api/calendar/callback', async (req, res) => {
  try {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const redirectUri = `${proto}://${req.get('host')}/api/calendar/callback`;
    const oauth2 = getCalOAuth2(redirectUri);
    const { tokens } = await oauth2.getToken(req.query.code);

    const user = getIAPUser(req);
    const email = user?.email || 'dev@fivetran.com';

    await saveUserTokens(email, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry: Date.now() + (tokens.expiry_date || 3600000),
    });

    console.log(`[connect] ${email} authorized Google (Calendar + Gmail)`);
    res.redirect('/?connected=true');
  } catch (err) {
    console.error('[connect] OAuth error:', err.message);
    res.status(500).send('Connection failed. Please try again.');
  }
});

app.get('/api/connect/status', async (req, res) => {
  const user = getIAPUser(req);
  const email = user?.email || 'dev@fivetran.com';
  const tokens = await loadUserTokens(email);
  res.json({ ok: true, email, google: !!tokens, slack: true, triage: true });
});

app.get('/api/calendar/status', async (req, res) => {
  const user = getIAPUser(req);
  const email = user?.email || 'dev@fivetran.com';
  const tokens = await loadUserTokens(email);
  res.json({ ok: true, connected: !!tokens, email });
});

app.get('/api/calendar/events', async (req, res) => {
  const user = getIAPUser(req);
  const email = user?.email || 'dev@fivetran.com';
  const tokens = await loadUserTokens(email);

  if (!tokens || !GCAL_CLIENT_ID) {
    return res.json({ ok: false, error: 'Calendar not connected', authUrl: '/api/calendar/auth' });
  }

  try {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const redirectUri = `${proto}://${req.get('host')}/api/calendar/callback`;
    const oauth2 = getCalOAuth2(redirectUri);
    oauth2.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2 });

    // Support ?date=YYYY-MM-DD param
    const dateParam = req.query.date;
    const targetDate = dateParam ? new Date(dateParam + 'T00:00:00') : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 20,
    });

    const events = (response.data.items || []).map(ev => ({
      id: ev.id,
      title: ev.summary || '(No title)',
      start: ev.start?.dateTime || ev.start?.date,
      end: ev.end?.dateTime || ev.end?.date,
      allDay: !!ev.start?.date,
      location: ev.location,
      attendees: (ev.attendees || []).map(a => ({
        email: a.email,
        name: a.displayName || a.email.split('@')[0],
        self: a.self,
        status: a.responseStatus,
      })),
      isExternal: (ev.attendees || []).some(a => !a.email?.endsWith('@fivetran.com') && !a.self),
      meetLink: ev.hangoutLink || ev.conferenceData?.entryPoints?.[0]?.uri,
      htmlLink: ev.htmlLink,
    }));

    res.json({ ok: true, events, count: events.length });
  } catch (err) {
    console.error('[calendar] Events error:', err.message);
    if (err.message?.includes('invalid_grant') || err.message?.includes('Token has been expired')) {
      _calTokens.delete(email);
      return res.json({ ok: false, error: 'Token expired', authUrl: '/api/calendar/auth' });
    }
    res.json({ ok: false, error: err.message });
  }
});

// ── Gmail — real inbox ──
app.get('/api/gmail/inbox', async (req, res) => {
  const user = getIAPUser(req);
  const email = user?.email || 'dev@fivetran.com';
  const tokens = await loadUserTokens(email);

  if (!tokens || !GCAL_CLIENT_ID) {
    return res.json({ ok: false, error: 'Google not connected', authUrl: '/api/connect/google' });
  }

  try {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const redirectUri = `${proto}://${req.get('host')}/api/calendar/callback`;
    const oauth2 = getCalOAuth2(redirectUri);
    oauth2.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oauth2 });

    // Get recent unread messages
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread category:primary',
      maxResults: 10,
    });

    const messages = [];
    for (const msg of (listRes.data.messages || []).slice(0, 8)) {
      try {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });

        const headers = detail.data.payload?.headers || [];
        const fromHeader = headers.find(h => h.name === 'From')?.value || '';
        const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
        const date = headers.find(h => h.name === 'Date')?.value || '';

        // Parse "Name <email>" format
        const nameMatch = fromHeader.match(/^"?([^"<]+)"?\s*<?/);
        const emailMatch = fromHeader.match(/<([^>]+)>/);
        const fromName = nameMatch ? nameMatch[1].trim() : fromHeader.split('@')[0];
        const fromEmail = emailMatch ? emailMatch[1] : fromHeader;
        const isExternal = !fromEmail.endsWith('@fivetran.com');

        messages.push({
          id: msg.id,
          threadId: detail.data.threadId,
          from: fromName,
          fromEmail,
          subject,
          date,
          isExternal,
          snippet: detail.data.snippet || '',
        });
      } catch (e) {
        // Skip messages we can't read
      }
    }

    res.json({ ok: true, messages, count: messages.length });
  } catch (err) {
    console.error('[gmail] Error:', err.message);
    if (err.message?.includes('invalid_grant') || err.message?.includes('insufficient')) {
      return res.json({ ok: false, error: 'Gmail not authorized', authUrl: '/api/connect/google' });
    }
    res.json({ ok: false, error: err.message });
  }
});

// ── Google Meet Transcripts from Drive ──
app.get('/api/meeting/transcripts', async (req, res) => {
  const user = getIAPUser(req);
  const email = user?.email || 'dev@fivetran.com';
  const tokens = await loadUserTokens(email);

  if (!tokens || !GCAL_CLIENT_ID) {
    return res.json({ ok: false, error: 'Google not connected' });
  }

  try {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const redirectUri = `${proto}://${req.get('host')}/api/calendar/callback`;
    const oauth2 = getCalOAuth2(redirectUri);
    oauth2.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2 });

    // Search for Google Meet transcripts (saved as Google Docs in Drive)
    // Meet transcripts are named like "Meeting transcript - <title> - <date>"
    const searchRes = await drive.files.list({
      q: "name contains 'transcript' and mimeType = 'application/vnd.google-apps.document' and modifiedTime > '" + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() + "'",
      fields: 'files(id, name, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 10,
    });

    const transcripts = (searchRes.data.files || []).map(f => ({
      id: f.id,
      name: f.name,
      date: f.modifiedTime,
      link: f.webViewLink,
    }));

    res.json({ ok: true, transcripts, count: transcripts.length });
  } catch (err) {
    console.error('[transcripts] Error:', err.message);
    res.json({ ok: false, error: err.message });
  }
});

// Pull a specific transcript and summarize it
app.post('/api/meeting/summarize', async (req, res) => {
  const { transcriptId, meetingTitle } = req.body;
  const user = getIAPUser(req);
  const email = user?.email || 'dev@fivetran.com';
  const tokens = await loadUserTokens(email);

  if (!tokens || !GCAL_CLIENT_ID) {
    return res.json({ ok: false, error: 'Google not connected' });
  }

  try {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const redirectUri = `${proto}://${req.get('host')}/api/calendar/callback`;
    const oauth2 = getCalOAuth2(redirectUri);
    oauth2.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2 });

    // Export transcript as plain text
    const exportRes = await drive.files.export({
      fileId: transcriptId,
      mimeType: 'text/plain',
    });

    const transcriptText = exportRes.data;

    if (!ANTHROPIC_KEY || !transcriptText) {
      return res.json({ ok: true, transcript: transcriptText, summary: null });
    }

    // Use Claude to extract summary + action items
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: `You are summarizing an internal meeting${meetingTitle ? ` titled "${meetingTitle}"` : ''} for ${email.split('@')[0]}.

Transcript:
${transcriptText.substring(0, 8000)}

Return JSON only:
{
  "summary": "2-3 sentence summary of what was discussed",
  "decisions": ["list of decisions made"],
  "actionItems": [
    {"owner": "person name", "task": "what they committed to do", "deadline": "if mentioned, or null"}
  ],
  "followUps": ["topics to revisit next time"],
  "myActions": ["action items specifically for ${email.split('@')[0]}"]
}` }],
      }),
    });

    const claudeData = await claudeRes.json();
    const text = claudeData.content?.[0]?.text || '';

    let summary;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      summary = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text };
    } catch (e) {
      summary = { summary: text };
    }

    res.json({ ok: true, summary, transcriptLength: transcriptText.length });
  } catch (err) {
    console.error('[summarize] Error:', err.message);
    res.json({ ok: false, error: err.message });
  }
});

// ── Internal meeting context (Slack channels) ──
app.post('/api/meeting/internal-context', async (req, res) => {
  const { attendeeEmails, meetingTitle } = req.body;
  if (!attendeeEmails?.length) return res.json({ ok: false, error: 'no attendees' });

  const user = getIAPUser(req);
  const email = user?.email || 'dev@fivetran.com';

  // Query Triage for Slack activity with these people
  try {
    const attendeeNames = attendeeEmails.map(e => e.split('@')[0].replace('.', ' '));
    const query = `${attendeeNames.join(' ')} ${meetingTitle || ''} discussion update project`;

    const results = await queryFivetranKnowledge(query, ['slack'], 5).catch(() => []);

    if (!ANTHROPIC_KEY || results.length === 0) {
      return res.json({ ok: true, context: null, raw: results.length });
    }

    const slackContext = results.map(r => `[SLACK] ${r.title}\n${(r.content || '').substring(0, 400)}`).join('\n\n---\n\n');

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{ role: 'user', content: `You're prepping ${email.split('@')[0]} for an internal meeting${meetingTitle ? ` titled "${meetingTitle}"` : ''} with ${attendeeNames.join(', ')}.

Here are recent Slack conversations involving these people:
${slackContext}

Return JSON only:
{
  "topics": ["active topics between these people from Slack"],
  "suggestedAgenda": ["3-5 agenda items based on what they've been discussing"],
  "openThreads": ["unresolved discussions or questions from Slack"],
  "context": "1-2 sentence summary of what these people are working on together"
}` }],
      }),
    });

    const data = await claudeRes.json();
    const text = data.content?.[0]?.text || '';
    let context;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      context = jsonMatch ? JSON.parse(jsonMatch[0]) : { context: text };
    } catch (e) {
      context = { context: text };
    }

    res.json({ ok: true, context });
  } catch (e) {
    console.error('[internal-context] Error:', e.message);
    res.json({ ok: false, error: e.message });
  }
});

// ── Post-meeting processing — check for transcript, summarize, extract actions ──
app.post('/api/meeting/process', async (req, res) => {
  const { eventId, title, attendees } = req.body;
  const user = getIAPUser(req);
  const email = user?.email || 'dev@fivetran.com';
  const tokens = await loadUserTokens(email);

  if (!tokens || !GCAL_CLIENT_ID) {
    return res.json({ ok: false, error: 'Google not connected' });
  }

  try {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const redirectUri = `${proto}://${req.get('host')}/api/calendar/callback`;
    const oauth2 = getCalOAuth2(redirectUri);
    oauth2.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2 });

    // Search for transcript matching this meeting
    const meetingName = title.replace(/[^a-zA-Z0-9 ]/g, '');
    const searchRes = await drive.files.list({
      q: `name contains 'transcript' and fullText contains '${meetingName.substring(0, 30)}' and mimeType = 'application/vnd.google-apps.document' and modifiedTime > '${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}'`,
      fields: 'files(id, name, modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 1,
    });

    const transcript = searchRes.data.files?.[0];
    if (!transcript) {
      return res.json({ ok: true, found: false, message: 'No transcript found yet. Google Meet transcripts may take a few minutes to appear in Drive.' });
    }

    // Export and summarize
    const exportRes = await drive.files.export({ fileId: transcript.id, mimeType: 'text/plain' });
    const transcriptText = exportRes.data;

    if (!ANTHROPIC_KEY) {
      return res.json({ ok: true, found: true, transcriptId: transcript.id, length: transcriptText.length, summary: null });
    }

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: `Summarize this internal meeting for ${email.split('@')[0]}. Extract their specific action items.

Meeting: "${title}"
Attendees: ${(attendees || []).join(', ')}

Transcript:
${transcriptText.substring(0, 8000)}

Return JSON:
{
  "summary": "2-3 sentence summary",
  "decisions": ["decisions made"],
  "allActionItems": [{"owner": "name", "task": "what", "deadline": "if mentioned or null"}],
  "myActions": ["action items specifically for ${email.split('@')[0]}"],
  "followUps": ["topics to revisit next meeting"],
  "keyQuotes": ["1-2 important quotes with speaker name"]
}` }],
      }),
    });

    const data = await claudeRes.json();
    const text = data.content?.[0]?.text || '';
    let summary;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      summary = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text };
    } catch (e) {
      summary = { summary: text };
    }

    res.json({ ok: true, found: true, transcriptId: transcript.id, summary });
  } catch (e) {
    console.error('[meeting/process] Error:', e.message);
    res.json({ ok: false, error: e.message });
  }
});

// ── Find mutual availability ──
app.post('/api/calendar/find-time', async (req, res) => {
  const { attendeeEmail, duration = 30 } = req.body;
  const user = getIAPUser(req);
  const email = user?.email || 'dev@fivetran.com';
  const tokens = await loadUserTokens(email);

  if (!tokens || !GCAL_CLIENT_ID) {
    return res.json({ ok: false, error: 'Calendar not connected' });
  }

  try {
    const proto = req.headers['x-forwarded-proto'] || req.protocol;
    const redirectUri = `${proto}://${req.get('host')}/api/calendar/callback`;
    const oauth2 = getCalOAuth2(redirectUri);
    oauth2.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2 });

    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 5);

    // Check freebusy for both users
    const freeBusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: now.toISOString(),
        timeMax: weekEnd.toISOString(),
        items: [{ id: email }, { id: attendeeEmail }],
      },
    });

    // Find 3 open slots
    const busySlots = [];
    Object.values(freeBusy.data.calendars || {}).forEach(cal => {
      (cal.busy || []).forEach(b => busySlots.push({ start: new Date(b.start), end: new Date(b.end) }));
    });
    busySlots.sort((a, b) => a.start - b.start);

    const slots = [];
    const durationMs = duration * 60 * 1000;
    let cursor = new Date(now);
    cursor.setMinutes(Math.ceil(cursor.getMinutes() / 30) * 30, 0, 0); // round to next 30

    while (slots.length < 3 && cursor < weekEnd) {
      const hour = cursor.getHours();
      const day = cursor.getDay();

      // Business hours only (9am-5pm, weekdays)
      if (day === 0 || day === 6 || hour < 9 || hour >= 17) {
        cursor.setDate(cursor.getDate() + (day === 0 ? 1 : day === 6 ? 2 : 0));
        cursor.setHours(9, 0, 0, 0);
        continue;
      }

      const slotEnd = new Date(cursor.getTime() + durationMs);
      const conflict = busySlots.some(b => cursor < b.end && slotEnd > b.start);

      if (!conflict && slotEnd.getHours() <= 17) {
        slots.push({
          start: cursor.toISOString(),
          end: slotEnd.toISOString(),
          startFormatted: cursor.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
          endFormatted: slotEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        });
      }

      cursor = new Date(cursor.getTime() + 30 * 60 * 1000); // advance 30 min
    }

    res.json({ ok: true, slots, attendee: attendeeEmail, duration });
  } catch (err) {
    console.error('[calendar/find-time] Error:', err.message);
    res.json({ ok: false, error: err.message });
  }
});

// Health check for Cloud Run
app.get('/health', (req, res) => res.json({ ok: true }));

// Static files (after auth gate)
app.use(express.static('.'));

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_KEY) console.warn('⚠️  ANTHROPIC_API_KEY not set — AI features disabled');

// ── Fivetran Knowledge (Triage MCP) ──
const TRIAGE_KEY = process.env.TRIAGE_API_KEY;
if (!TRIAGE_KEY) console.warn('⚠️  TRIAGE_API_KEY not set — knowledge features disabled');
const TRIAGE_BASE = 'https://api.triage.cx/token-server/mcp';

// ── Request cache + throttle — avoid hammering Triage ──
const _triageCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 min TTL
const MIN_REQUEST_GAP = 1000;     // 1 second minimum between requests
let _lastTriageRequest = 0;

function getCached(key) {
  const entry = _triageCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { _triageCache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data) {
  _triageCache.set(key, { data, ts: Date.now() });
  // Evict old entries if cache gets large
  if (_triageCache.size > 200) {
    const now = Date.now();
    for (const [k, v] of _triageCache) {
      if (now - v.ts > CACHE_TTL) _triageCache.delete(k);
    }
  }
}

async function queryFivetranKnowledge(query, sources = ['slab', 'fivetran_public_docs'], n = 3) {
  const cacheKey = `${query}::${sources.join(',')}::${n}`;
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[knowledge] Cache hit for: ${query.substring(0, 40)}...`);
    return cached;
  }

  const results = [];

  for (const source of sources) {
    try {
      // Throttle — wait if we're requesting too fast
      const now = Date.now();
      const gap = now - _lastTriageRequest;
      if (gap < MIN_REQUEST_GAP) {
        await new Promise(r => setTimeout(r, MIN_REQUEST_GAP - gap));
      }
      _lastTriageRequest = Date.now();

      const res = await fetch(`${TRIAGE_BASE}?kb_name=FivetranKnowledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TRIAGE_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          id: Date.now(),
          params: {
            name: source,
            arguments: { query, n },
          },
        }),
      });

      const text = await res.text();
      // Parse SSE response — look for data: lines
      const dataLines = text.split('\n').filter(l => l.startsWith('data: '));
      for (const line of dataLines) {
        try {
          const json = JSON.parse(line.substring(6));
          if (json.result?.content?.[0]?.text) {
            const docs = JSON.parse(json.result.content[0].text);
            for (const doc of docs) {
              results.push({
                source,
                title: doc.metadata?.title || 'Untitled',
                url: doc.metadata?.url || '',
                content: doc.content?.substring(0, 1500) || '', // truncate for context window
              });
            }
          }
        } catch (e) {}
      }
    } catch (e) {
      console.log(`[knowledge] Error querying ${source}:`, e.message);
    }
  }

  // Cache results for future identical queries
  if (results.length > 0) setCache(cacheKey, results);
  console.log(`[knowledge] Fetched ${results.length} results for: ${query.substring(0, 40)}...`);
  return results;
}

function _getRelevantSources(question) {
  const lower = question.toLowerCase();
  const sources = [];

  // Always search slab for internal info (org, processes, teams, metrics, programs)
  if (lower.includes('who') || lower.includes('team') || lower.includes('manager') || lower.includes('owner') || lower.includes('lead') || lower.includes('org') || lower.includes('process') || lower.includes('program') || lower.includes('arr') || lower.includes('revenue') || lower.includes('metric') || lower.includes('okr') || lower.includes('goal') || lower.includes('target') || lower.includes('quarter') || lower.includes('fy2') || lower.includes('adoption') || lower.includes('playbook') || lower.includes('enablement') || lower.includes('battlecard') || lower.includes('messaging') || lower.includes('positioning')) {
    sources.push('slab');
  }

  // Search public docs for product/technical questions
  if (lower.includes('connector') || lower.includes('destination') || lower.includes('setup') || lower.includes('config') || lower.includes('how') || lower.includes('what is') || lower.includes('pricing') || lower.includes('feature') || lower.includes('schema') || lower.includes('sync') || lower.includes('transform')) {
    sources.push('fivetran_public_docs');
  }

  // Search Gong for call/customer mentions
  if (lower.includes('call') || lower.includes('customer') || lower.includes('said') || lower.includes('objection') || lower.includes('feedback') || lower.includes('deal')) {
    sources.push('gongio');
  }

  // Search Salesforce for account/pipeline info
  if (lower.includes('account') || lower.includes('pipeline') || lower.includes('opportunity') || lower.includes('deal') || lower.includes('arr') || lower.includes('revenue') || lower.includes('forecast')) {
    sources.push('salesforce');
  }

  // Search Jira for engineering/product issues
  if (lower.includes('bug') || lower.includes('issue') || lower.includes('ticket') || lower.includes('jira') || lower.includes('sprint') || lower.includes('roadmap') || lower.includes('backlog')) {
    sources.push('jira');
  }

  // Search Zendesk for support questions
  if (lower.includes('support') || lower.includes('ticket') || lower.includes('customer issue') || lower.includes('zendesk') || lower.includes('escalation')) {
    sources.push('zendesk_new');
  }

  // Search PRDs for product strategy
  if (lower.includes('prd') || lower.includes('requirement') || lower.includes('strategy') || lower.includes('initiative') || lower.includes('roadmap')) {
    sources.push('product_requirements_documents');
  }

  // Default: if no specific match, search slab and public docs
  if (sources.length === 0) {
    sources.push('slab', 'fivetran_public_docs');
  }

  // Deduplicate
  return [...new Set(sources)];
}

// ── Slack API helpers ──
async function slackAPI(method, body) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SLACK_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function findSlackUser(name) {
  // Search users list for matching name
  const res = await slackAPI('users.list', { limit: 200 });
  if (!res.ok) return null;
  const lower = name.toLowerCase().trim();
  return res.members.find(m => {
    if (m.deleted || m.is_bot) return false;
    const real = (m.real_name || '').toLowerCase();
    const display = (m.profile?.display_name || '').toLowerCase();
    const uname = (m.name || '').toLowerCase();
    // Match full name, display name, first name, or username
    return real === lower || display === lower || real.startsWith(lower) || display.startsWith(lower) || uname === lower || uname.startsWith(lower.replace(/\s/g, '.'));
  });
}

async function sendSlackDM(userId, message) {
  // Open a DM channel
  const conv = await slackAPI('conversations.open', { users: userId });
  if (!conv.ok) return { ok: false, error: conv.error };
  // Send the message
  const sent = await slackAPI('chat.postMessage', { channel: conv.channel.id, text: message });
  return sent;
}

// ── Cache for user list (expensive call) ──
let userCache = null;
let userCacheTime = 0;
async function getUsers() {
  if (userCache && Date.now() - userCacheTime < 5 * 60 * 1000) return userCache;
  const res = await slackAPI('users.list', { limit: 500 });
  if (res.ok) { userCache = res.members.filter(m => !m.deleted && !m.is_bot); userCacheTime = Date.now(); }
  return userCache || [];
}

// ── Get my user ID ──
let myUserId = null;
async function getMyId() {
  if (myUserId) return myUserId;
  const res = await slackAPI('auth.test', {});
  if (res.ok) myUserId = res.user_id;
  return myUserId;
}

// ── Real Slack DMs endpoint ──
app.get('/api/slack/dms', async (req, res) => {
  if (!SLACK_TOKEN) return res.json({ ok: false, error: 'no token' });
  try {
    // Get my recent DM conversations
    const convs = await slackAPI('conversations.list', { types: 'im', limit: 20 });
    if (!convs.ok) return res.json({ ok: false, error: convs.error });

    const users = await getUsers();
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });

    const dms = [];
    for (const ch of convs.channels) {
      // Get latest message in each DM
      const hist = await slackAPI('conversations.history', { channel: ch.id, limit: 1 });
      if (!hist.ok || !hist.messages?.length) continue;
      const msg = hist.messages[0];
      const user = userMap[ch.user];
      if (!user) continue;

      // Check if unread (compare last_read vs latest ts)
      const isUnread = !ch.last_read || parseFloat(msg.ts) > parseFloat(ch.last_read);
      const myId = await getMyId();
      const isFromThem = msg.user !== myId;

      dms.push({
        from: user.profile?.display_name || user.real_name || user.name,
        userId: user.id,
        channelId: ch.id,
        preview: msg.text?.substring(0, 80) || '',
        time: new Date(parseFloat(msg.ts) * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        ts: msg.ts,
        unread: isUnread && isFromThem,
        waitingOnYou: isUnread && isFromThem,
      });
    }

    // Sort by timestamp descending
    dms.sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));
    res.json({ ok: true, dms });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ── Real Slack mentions endpoint ──
app.get('/api/slack/mentions', async (req, res) => {
  if (!SLACK_TOKEN) return res.json({ ok: false, error: 'no token' });
  try {
    const myId = await getMyId();
    // Search for recent @mentions
    const search = await fetch(`https://slack.com/api/search.messages?query=${encodeURIComponent(`<@${myId}>`)}&count=10&sort=timestamp&sort_dir=desc`, {
      headers: { 'Authorization': `Bearer ${SLACK_TOKEN}` },
    });
    const data = await search.json();

    const mentions = [];
    if (data.ok && data.messages?.matches) {
      for (const m of data.messages.matches) {
        mentions.push({
          channel: m.channel?.name || 'unknown',
          channelId: m.channel?.id,
          from: m.username || 'unknown',
          preview: m.text?.substring(0, 80) || '',
          time: new Date(parseFloat(m.ts) * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          ts: m.ts,
        });
      }
    }
    res.json({ ok: true, mentions });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ── Main action endpoint ──
app.post('/api/action', async (req, res) => {
  const { type, to, message, topic } = req.body;
  console.log(`\n📬 ${type} → ${to}: "${message || topic}"`);

  if (type === 'slack' && SLACK_TOKEN) {
    try {
      const user = await findSlackUser(to);
      if (!user) {
        console.log(`   ❌ User "${to}" not found`);
        return res.json({ success: false, message: `couldn't find "${to}" on slack` });
      }
      console.log(`   👤 Found: ${user.real_name} (${user.id})`);
      const result = await sendSlackDM(user.id, message);
      if (result.ok) {
        console.log(`   ✅ Sent to ${user.real_name}`);
        return res.json({ success: true, message: `sent to ${user.real_name}` });
      } else {
        console.log(`   ❌ ${result.error}`);
        return res.json({ success: false, message: `failed: ${result.error}` });
      }
    } catch (e) {
      console.log(`   ❌ ${e.message}`);
      return res.json({ success: false, message: `error: ${e.message}` });
    }
  }

  // Fallback for non-slack actions or no token
  res.json({ success: true, message: `queued — ${type} to ${to}` });
});

// ── AI Chat endpoint — real Claude responses ──
app.post('/api/chat', async (req, res) => {
  const { message, profile, role, history } = req.body;
  if (!ANTHROPIC_KEY) return res.json({ ok: false, reply: "ai not configured yet." });

  try {
    const name = profile?.userName || 'friend';
    const city = profile?.city || '';
    const userRole = role || profile?.role || 'Sales';
    const challenge = profile?.challenge || '';

    const systemPrompt = `You are Buddy — a warm, confident, all-lowercase AI work companion for ${name}. You work at Fivetran.

PERSONALITY: warm, confident, short responses. no capitalization ever. no emojis unless the user uses them. react smoothly — "solid.", "got it.", "love that." before moving on. never be needy or over-enthusiastic. think cool friend who genuinely cares, not customer service bot.

CONTEXT:
- ${name} is based in ${city}
- Role: ${userRole}
- Biggest challenge: ${challenge}
- Current time: ${new Date().toLocaleString()}

FIVETRAN KNOWLEDGE: You know Fivetran deeply — it's an automated data movement platform. It has 600+ connectors that sync data from SaaS apps, databases, files, and events into warehouses (Snowflake, BigQuery, Redshift, Databricks). Key concepts: connectors, destinations, transformations, the semantic layer, Fivetran AI (natural language to SQL), HVR (high-volume replication for databases), and the Connector SDK for custom connectors. Fivetran's value prop is zero-maintenance pipelines — set up once, always fresh data.

CAPABILITIES:
- You can send Slack messages ("slack [name] [message]")
- You can draft emails
- You can prep for meetings
- You can answer questions about Fivetran products, connectors, pricing, setup
- You can help with sales tasks: account research, competitive intel, forecast updates
- You understand the open context layer: skills, plugins, agents, workflows, apps — and teach users which to build when

WHAT YOU KNOW (answer confidently):
- Fivetran products: connectors, destinations, transformations, HVR, Connector SDK, Fivetran AI
- Fivetran setup, configuration, pricing tiers, best practices
- General data engineering: ELT, data warehouses, data lakes, schemas, SQL
- Sales methodology: MEDDPICC, BANT, pipeline management, forecasting
- General work advice, productivity, time management
- The user's profile data (name, city, role, challenge)

FIVETRAN KNOWLEDGE ACCESS: You now have access to Fivetran's internal knowledge base. When knowledge results are appended below, use them to answer accurately. Cite specific docs or sources when relevant. If the knowledge results contain the answer, use them confidently instead of saying "i don't have access."

WHAT YOU DON'T KNOW (be honest):
- HR policies, PTO balances, benefits details, compensation data
- Internal company financials, budget numbers, headcount specifics
- Internal Slack conversations, email content
- Competitor pricing or internal competitive intel

WHEN YOU CAN'T ANSWER:
- Be honest: "i don't have access to [specific thing] yet."
- Add: "i've logged this so the team can build it."
- If possible, suggest where they can find it: "try checking [tool/person]"
- Never make up data, numbers, or specifics you don't have

RULES:
- Keep responses under 3 sentences unless the user asks for detail
- If someone is venting, acknowledge first, then offer help
- If someone asks about a meeting, check if you have context and prep them
- If someone asks to message someone, confirm who and what before sending
- Always be on the user's side`;

    // Query Fivetran Knowledge for context
    let knowledgeContext = '';
    try {
      const sources = _getRelevantSources(message);
      console.log(`[knowledge] Querying sources: ${sources.join(', ')} for: "${message.substring(0, 50)}"`);
      const results = await queryFivetranKnowledge(message, sources, 3);
      if (results.length > 0) {
        knowledgeContext = '\n\nFIVETRAN KNOWLEDGE RESULTS (use these to answer the question accurately):\n' +
          results.map(r => `[${r.source}] ${r.title}\n${r.content}`).join('\n---\n');
        console.log(`[knowledge] Found ${results.length} results`);
      }
    } catch (e) {
      console.log('[knowledge] Query failed:', e.message);
    }

    // Build message history for context
    const messages = [];
    if (history?.length) {
      for (const h of history.slice(-10)) { // last 10 messages for context
        messages.push({ role: h.who === 'user' ? 'user' : 'assistant', content: h.text });
      }
    }
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: systemPrompt + knowledgeContext,
        messages,
      }),
    });

    const data = await response.json();
    if (data.content?.[0]?.text) {
      const reply = data.content[0].text;
      const canAnswer = _classifyCanAnswer(reply);
      const category = _classifyCategory(message);
      res.json({ ok: true, reply, canAnswer, category });
    } else {
      console.error('Claude API error:', JSON.stringify(data));
      res.json({ ok: false, reply: "hmm, something went wrong. try again?", canAnswer: false, category: 'unknown' });
    }
  } catch (e) {
    console.error('Chat error:', e.message);
    res.json({ ok: false, reply: "couldn't reach the ai right now. try again in a sec.", canAnswer: false, category: 'unknown' });
  }
});

// ── Classification helpers ──
function _classifyCanAnswer(reply) {
  const lower = reply.toLowerCase();
  const cantPhrases = [
    "i don't have access", "i can't", "not sure about that", "logged this",
    "don't have that info", "i don't know", "outside my knowledge",
    "can't answer that", "don't have visibility", "i'm not able to",
    "i haven't been connected", "no access to"
  ];
  return !cantPhrases.some(p => lower.includes(p));
}

function _classifyCategory(question) {
  const lower = question.toLowerCase();
  const fivetranTerms = ['fivetran', 'connector', 'destination', 'transformation', 'hvr', 'sdk', 'sync', 'pipeline', 'elt', 'warehouse', 'snowflake', 'bigquery', 'redshift', 'databricks', 'schema', 'data lake', 'sql'];
  const salesTerms = ['deal', 'pipeline', 'forecast', 'quota', 'account', 'prospect', 'meddpicc', 'bant', 'close', 'revenue', 'arr', 'churn', 'customer', 'lead', 'opportunity', 'salesforce', 'gong'];
  const personalTerms = ['feeling', 'stress', 'overwhelm', 'tired', 'anxiety', 'happy', 'sad', 'motivation', 'burnout', 'mental health', 'break', 'weekend'];
  const workTerms = ['meeting', 'calendar', 'email', 'slack', 'productivity', 'time', 'schedule', 'task', 'project', 'deadline', 'priority', 'focus'];

  if (fivetranTerms.some(t => lower.includes(t))) return 'fivetran';
  if (salesTerms.some(t => lower.includes(t))) return 'sales';
  if (personalTerms.some(t => lower.includes(t))) return 'personal';
  if (workTerms.some(t => lower.includes(t))) return 'work';
  return 'unknown';
}

// ── Feedback logging endpoint ──
app.post('/api/feedback', async (req, res) => {
  const feedback = req.body;
  feedback.serverTimestamp = new Date().toISOString();

  // Log to console
  const emoji = feedback.rating === 'up' ? '\u{1F44D}' : '\u{1F44E}';
  console.log(`${emoji} Feedback: "${feedback.question?.substring(0, 50)}..." \u2192 ${feedback.rating}${feedback.reason ? ` (${feedback.reason})` : ''}`);

  // Append to local JSON log
  const logPath = './feedback-log.json';
  let log = [];
  try { log = JSON.parse(fs.readFileSync(logPath, 'utf8')); } catch(e) {}
  log.push(feedback);
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));

  // TODO: Google Sheets integration
  // const { google } = require('googleapis');
  // const sheets = google.sheets({ version: 'v4', auth: authClient });
  // await sheets.spreadsheets.values.append({
  //   spreadsheetId: 'YOUR_SHEET_ID',
  //   range: 'Feedback!A:L',
  //   valueInputOption: 'USER_ENTERED',
  //   resource: { values: [[
  //     feedback.serverTimestamp, feedback.user, feedback.role,
  //     feedback.question, feedback.response, feedback.rating,
  //     feedback.reason, feedback.canAnswer, feedback.category,
  //     feedback.focusArea, feedback.sessionId, feedback.questionCount
  //   ]] },
  // });

  res.json({ ok: true });
});

// ── Shared clipboard between app and extension ──
let buddyClipboard = [];
// Each item: { id, type, title, content, context (account name, person name, etc), timestamp, source ('chat'|'insight'|'task') }

// App saves content to clipboard
app.post('/api/clipboard/save', (req, res) => {
  const item = req.body;
  item.id = item.id || Date.now().toString(36);
  item.timestamp = item.timestamp || new Date().toISOString();
  // Keep max 20 items, newest first
  buddyClipboard.unshift(item);
  if (buddyClipboard.length > 20) buddyClipboard.pop();
  console.log(`📋 Clipboard: saved "${item.title}" (${item.source})`);
  res.json({ ok: true, id: item.id });
});

// Extension pulls clipboard items relevant to current page
app.post('/api/clipboard/get', (req, res) => {
  const { pageContext } = req.body;

  // Get active tasks/insights that are always relevant
  const activeTasks = _getActiveTasks();

  // Filter clipboard items by page context relevance
  let relevant = [];
  if (pageContext) {
    const pageTitle = (pageContext.title || '').toLowerCase();
    const pageUrl = (pageContext.url || '').toLowerCase();

    relevant = buddyClipboard.filter(item => {
      const ctx = (item.context || '').toLowerCase();
      const title = (item.title || '').toLowerCase();
      // Match if the clipboard item's context matches anything on the page
      if (ctx && pageTitle && (pageTitle.includes(ctx) || ctx.includes(pageTitle.split(' ')[0]))) return true;
      if (ctx && pageUrl && pageUrl.includes(ctx.replace(/\s/g, ''))) return true;
      return false;
    });
  }

  // If no page-specific items, show recent clipboard items (last 3)
  const recentItems = relevant.length === 0 ? buddyClipboard.slice(0, 3) : [];

  res.json({
    ok: true,
    relevant,       // items matching this page
    recent: recentItems,  // recent items if nothing matches
    tasks: activeTasks,   // always-on tasks/insights
  });
});

// Clear clipboard
app.post('/api/clipboard/clear', (req, res) => {
  buddyClipboard = [];
  res.json({ ok: true });
});

function _getActiveTasks() {
  // Return time-sensitive items from mock data
  // In production this would query real calendar, slack, email
  const tasks = [];

  // Check for upcoming meetings (mock)
  try {
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();
    // Simulate: if it's near a meeting time, show it
    tasks.push({
      type: 'meeting',
      title: 'Next meeting',
      content: 'Check your buddy app for meeting prep and agenda.',
      icon: '📅',
    });
  } catch(e) {}

  return tasks;
}

// ── Context enrichment cache ──
const _contextCache = new Map(); // key: "platform:title" → { data, timestamp }
const CONTEXT_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// ── Context Bridge — enrich extension sidebar with real data ──
app.post('/api/context/enrich', async (req, res) => {
  const { platform, type, title, url, sender } = req.body;
  if (!platform) return res.json({ ok: false, error: 'missing platform' });

  // Check cache
  const cacheKey = `${platform}:${type}:${(title || '').substring(0, 50)}`;
  const cached = _contextCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CONTEXT_CACHE_TTL) {
    return res.json({ ok: true, platform, data: cached.data, cached: true });
  }

  try {
    // Route to appropriate Triage MCP sources based on platform
    let sources = [];
    let query = title || '';

    switch (platform) {
      case 'salesforce':
        sources = ['gongio', 'salesforce'];
        query = `${title} account opportunity deal`;
        break;
      case 'gmail':
        sources = ['salesforce', 'gongio'];
        query = sender ? `${sender} ${title}` : title;
        break;
      case 'linkedin':
        sources = ['salesforce'];
        query = `${title} contact account`;
        break;
      case 'gong':
        sources = ['gongio', 'salesforce'];
        query = `${title} call`;
        break;
      default:
        sources = ['slab', 'fivetran_public_docs'];
        break;
    }

    // Query Triage MCP
    console.log(`[context/enrich] ${platform}/${type}: querying ${sources.join(', ')} for "${query.substring(0, 50)}"`);
    const results = await queryFivetranKnowledge(query, sources, 5);
    console.log(`[context/enrich] Got ${results.length} results`);

    if (!ANTHROPIC_KEY || results.length === 0) {
      return res.json({ ok: true, platform, data: null, sources: sources });
    }

    // Feed results to Claude for structured extraction
    const structurePrompt = _getContextStructurePrompt(platform, type, title, sender);
    const knowledgeText = results.map(r => `[${r.source}] ${r.title}\n${r.content}`).join('\n---\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: structurePrompt,
        messages: [{ role: 'user', content: `Context for: ${title}\n\nKnowledge results:\n${knowledgeText}` }],
      }),
    });

    const data = await response.json();
    let enrichedData = null;

    if (data.content?.[0]?.text) {
      try {
        enrichedData = _parseJsonResponse(data.content[0].text);
      } catch (e) {
        // Claude didn't return valid JSON, use raw text
        enrichedData = { summary: data.content[0].text };
      }
    }

    // Cache the result
    if (enrichedData) {
      _contextCache.set(cacheKey, { data: enrichedData, timestamp: Date.now() });
    }

    res.json({
      ok: true,
      platform,
      data: enrichedData,
      sources: results.map(r => ({ source: r.source, title: r.title, url: r.url })),
    });
  } catch (e) {
    console.error('[context/enrich] Error:', e.message);
    res.json({ ok: false, error: e.message });
  }
});

// Strip markdown code fences from Claude responses
function _parseJsonResponse(text) {
  let cleaned = text.trim();
  // Remove ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  return JSON.parse(cleaned);
}

function _getContextStructurePrompt(platform, type, title, sender) {
  const base = 'You are a data extraction assistant. Return ONLY valid JSON, no markdown, no explanation.';

  switch (platform) {
    case 'salesforce':
      return `${base}
Extract from the knowledge results and return JSON with these fields:
{
  "account": "account name",
  "stage": "deal stage",
  "amount": "deal amount",
  "closeDate": "close date",
  "owner": "opp owner",
  "lastCallTitle": "most recent call title",
  "lastCallDate": "call date",
  "meddpicc": {
    "Metrics": "value or empty string",
    "Economic Buyer": "value or empty string",
    "Decision Criteria": "value or empty string",
    "Decision Process": "value or empty string",
    "Identify Pain": "value or empty string",
    "Champion": "value or empty string",
    "Paper Process": "value or empty string",
    "Competition": "value or empty string"
  },
  "nextSteps": "next steps text",
  "context": "1-2 sentence summary of the account situation"
}
Use only information from the provided sources. If a field has no data, set it to empty string.`;

    case 'gmail':
      return `${base}
Extract CRM context about the email sender/recipient and return JSON:
{
  "account": "company name",
  "contactName": "person name",
  "contactTitle": "job title",
  "stage": "deal stage if any",
  "amount": "deal amount if any",
  "lastActivity": "most recent interaction",
  "context": "1-2 sentence summary of relationship",
  "suggestedDrafts": [
    { "title": "draft title", "body": "suggested email body (2-3 sentences)" }
  ]
}`;

    case 'linkedin':
      return `${base}
Check if this person is in the CRM and return JSON:
{
  "found": true or false,
  "contactName": "full name",
  "contactTitle": "job title",
  "company": "company name",
  "account": "matched account name or null",
  "stage": "deal stage or null",
  "lastActivity": "most recent interaction or null",
  "context": "1-2 sentence summary"
}`;

    case 'gong':
      return `${base}
Extract call summary and return JSON:
{
  "callTitle": "call title",
  "callDate": "date",
  "duration": "duration",
  "participants": ["name1", "name2"],
  "meddpicc": {
    "Metrics": "value or empty string",
    "Economic Buyer": "value or empty string",
    "Decision Criteria": "value or empty string",
    "Decision Process": "value or empty string",
    "Identify Pain": "value or empty string",
    "Champion": "value or empty string",
    "Paper Process": "value or empty string",
    "Competition": "value or empty string"
  },
  "keyMoments": [
    { "timestamp": "time", "text": "what was said", "type": "objection|insight|action" }
  ],
  "nextSteps": "agreed next steps",
  "context": "1-2 sentence call summary"
}`;

    default:
      return `${base}
Summarize the relevant information and return JSON:
{
  "title": "page or topic title",
  "context": "2-3 sentence summary of relevant information",
  "keyPoints": ["point 1", "point 2"],
  "relatedLinks": [{ "title": "link title", "url": "url" }]
}`;
  }
}

// ── Salesforce field extraction from Gong calls ──
app.post('/api/sf/extract-fields', async (req, res) => {
  const { accountName, oppName } = req.body;
  if (!accountName) return res.json({ ok: false, error: 'missing accountName' });

  try {
    // Query Gong for recent calls with this account
    console.log(`[sf/extract] Querying Gong for calls with "${accountName}"`);
    const gongResults = await queryFivetranKnowledge(
      `${accountName} call meeting`, ['gongio'], 5
    );

    if (gongResults.length === 0) {
      return res.json({ ok: false, error: `no Gong calls found for ${accountName}` });
    }

    console.log(`[sf/extract] Found ${gongResults.length} Gong results for ${accountName}`);
    const gongText = gongResults.map(r => `[${r.source}] ${r.title}\n${r.content}`).join('\n---\n');

    // Also query Salesforce for existing account context
    const sfResults = await queryFivetranKnowledge(
      `${accountName} account opportunity`, ['salesforce'], 3
    );
    const sfText = sfResults.map(r => `[${r.source}] ${r.title}\n${r.content}`).join('\n---\n');

    if (!ANTHROPIC_KEY) {
      return res.json({ ok: false, error: 'AI not configured' });
    }

    const extractPrompt = `You are a Salesforce data extraction assistant. Given Gong call transcripts and Salesforce data for the account "${accountName}", extract values for every Salesforce opportunity field.

Return ONLY valid JSON with this exact structure:
{
  "callTitle": "the call title",
  "callDate": "date of the call",
  "attendees": ["person1", "person2"],
  "fields": {
    "Opportunity Name": "Expansion - [topic from call]",
    "Pre-Qualification Sources": "source systems mentioned (e.g., ServiceNow, Snowflake)",
    "Pre-Qualification Destinations": "destination systems mentioned (e.g., Snowflake, BigQuery)",
    "Pre-Qualification Business Challenge": "the business problem they described",
    "Pre-Qualification Notes": "key discovery notes from the call",
    "Products Being Pitched": "Fivetran Saas",
    "Next Steps": "agreed next steps from the call",
    "Disco Meeting Date": "date of the call in MM/DD/YYYY format",
    "Disco Meeting Contacts": "names of external attendees",
    "Champion Identified": "internal champion name and title if mentioned",
    "Budget Available?": "yes/no/unknown based on discussion",
    "Identified Pain": "the pain points they described",
    "Fivetran Use Case": "what they want to use Fivetran for",
    "Economic Buyer Identified": "economic buyer if mentioned",
    "Metrics": "quantifiable metrics mentioned (cost savings, time, headcount)",
    "Competitor": "any competitors mentioned",
    "Notes": "comprehensive call notes - key discussion points, decisions, concerns",
    "SE/SA Notes": "technical discussion points, architecture details, integration requirements"
  }
}

Only include fields where you have actual information from the call. Use empty string for fields with no data. Be thorough in extracting Notes — this is the primary summary field.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: extractPrompt,
        messages: [{
          role: 'user',
          content: `Gong call data for ${accountName}:\n${gongText}\n\nSalesforce data:\n${sfText}`,
        }],
      }),
    });

    const data = await response.json();
    if (data.content?.[0]?.text) {
      try {
        const extracted = _parseJsonResponse(data.content[0].text);
        console.log(`[sf/extract] Extracted ${Object.keys(extracted.fields || {}).length} fields for ${accountName}`);
        res.json({ ok: true, ...extracted });
      } catch (e) {
        console.error('[sf/extract] Parse error:', e.message, 'Raw:', data.content[0].text.substring(0, 200));
        res.json({ ok: false, error: 'failed to parse extraction' });
      }
    } else {
      res.json({ ok: false, error: 'no response from AI' });
    }
  } catch (e) {
    console.error('[sf/extract] Error:', e.message);
    res.json({ ok: false, error: e.message });
  }
});

// ── Gong call polling — check if transcript is ready ──
app.get('/api/gong/poll', async (req, res) => {
  const { account } = req.query;
  if (!account) return res.json({ ok: false, error: 'missing account param' });

  try {
    const results = await queryFivetranKnowledge(
      `${account} call meeting recent`, ['gongio'], 3
    );

    if (results.length === 0) {
      return res.json({ ok: true, ready: false, message: `no calls found for ${account}` });
    }

    // Return the most recent call data
    const latestCall = results[0];
    res.json({
      ok: true,
      ready: true,
      callTitle: latestCall.title,
      content: latestCall.content,
      url: latestCall.url,
    });
  } catch (e) {
    console.error('[gong/poll] Error:', e.message);
    res.json({ ok: false, error: e.message });
  }
});

// ── Meeting Prep — enrich with Gong + Zendesk + Salesforce ──
app.post('/api/meeting-prep', async (req, res) => {
  const { title, attendees, account } = req.body;
  if (!title) return res.json({ ok: false, error: 'missing title' });

  const searchTerm = account || title;
  console.log(`[meeting-prep] Enriching: "${title}" (account: ${searchTerm})`);

  try {
    // Query all sources in parallel
    const [gongResults, zendeskResults, sfResults] = await Promise.all([
      queryFivetranKnowledge(`${searchTerm} call meeting`, ['gongio'], 5).catch(() => []),
      queryFivetranKnowledge(`${searchTerm} ticket support issue`, ['zendesk_new'], 5).catch(() => []),
      queryFivetranKnowledge(`${searchTerm} account opportunity`, ['salesforce'], 3).catch(() => []),
    ]);

    console.log(`[meeting-prep] Gong: ${gongResults.length}, Zendesk: ${zendeskResults.length}, SF: ${sfResults.length}`);

    // Use Claude to synthesize into meeting prep
    if (!ANTHROPIC_KEY) {
      return res.json({
        ok: true,
        prep: {
          gongCalls: gongResults.map(r => ({ title: r.title, url: r.url, snippet: (r.content || '').substring(0, 200) })),
          tickets: zendeskResults.map(r => ({ title: r.title, url: r.url, snippet: (r.content || '').substring(0, 200) })),
          account: sfResults.map(r => ({ title: r.title, snippet: (r.content || '').substring(0, 200) })),
          summary: null,
        }
      });
    }

    const allContext = [
      ...gongResults.map(r => `[GONG CALL] ${r.title}\n${(r.content || '').substring(0, 500)}`),
      ...zendeskResults.map(r => `[ZENDESK TICKET] ${r.title}\n${(r.content || '').substring(0, 500)}`),
      ...sfResults.map(r => `[SALESFORCE] ${r.title}\n${(r.content || '').substring(0, 500)}`),
    ].join('\n\n---\n\n');

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{ role: 'user', content: `You are preparing someone for a meeting titled "${title}".
Based on this context from Gong calls, Zendesk tickets, and Salesforce, create a concise meeting prep briefing.

${allContext}

Return JSON only:
{
  "context": "1-2 sentence strategic summary of this account/relationship",
  "callHistory": "what's been discussed in recent calls (key themes, concerns, asks)",
  "openTickets": "any active support issues they should know about (or 'none found')",
  "competitorMentions": "any competitors mentioned in calls (or 'none detected')",
  "theyWant": "what this person/account likely wants to discuss",
  "youShould": "what the Fivetran rep should bring up or be prepared for",
  "risk": "any churn risk, escalation, or concern signals (or 'none detected')"
}` }],
      }),
    });

    const claudeData = await claudeRes.json();
    const text = claudeData.content?.[0]?.text || '';

    // Parse JSON from Claude response
    let prep;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      prep = jsonMatch ? JSON.parse(jsonMatch[0]) : { context: text };
    } catch (e) {
      prep = { context: text };
    }

    // Attach raw sources for reference
    prep.sources = {
      gongCalls: gongResults.map(r => ({ title: r.title, url: r.url })),
      tickets: zendeskResults.map(r => ({ title: r.title, url: r.url })),
    };

    res.json({ ok: true, prep });
  } catch (e) {
    console.error('[meeting-prep] Error:', e.message);
    res.json({ ok: false, error: e.message });
  }
});

// ── Salesforce opp finder ──
app.post('/api/sf/find-opp', async (req, res) => {
  const { accountName } = req.body;
  if (!accountName) return res.json({ ok: false, error: 'missing accountName' });

  try {
    const results = await queryFivetranKnowledge(
      `${accountName} opportunity expansion open`, ['salesforce'], 5
    );

    const opps = results
      .filter(r => r.title?.toLowerCase().includes(accountName.toLowerCase()) ||
                   r.content?.toLowerCase().includes(accountName.toLowerCase()))
      .map(r => ({
        title: r.title,
        url: r.url,
        content: r.content?.substring(0, 200),
      }));

    res.json({ ok: true, found: opps.length > 0, opps });
  } catch (e) {
    console.error('[sf/find-opp] Error:', e.message);
    res.json({ ok: false, error: e.message });
  }
});

// ── Live transcript analysis ──
let _callTranscript = '';
let _callTriggersSent = new Set();

app.post('/api/call/transcript', async (req, res) => {
  const { chunk } = req.body;
  _callTranscript += ' ' + (chunk || '');

  if (!ANTHROPIC_KEY) return res.json({ ok: false, triggers: [] });

  try {
    // Quick knowledge lookup on latest chunk (non-blocking, best-effort)
    let transcriptKnowledge = '';
    try {
      const kbResults = await queryFivetranKnowledge(chunk || '', ['fivetran_public_docs'], 2);
      if (kbResults.length > 0) {
        transcriptKnowledge = '\n\nRELEVANT FIVETRAN KNOWLEDGE (use to make response_cards more accurate):\n' +
          kbResults.map(r => `[${r.source}] ${r.title}\n${r.content}`).join('\n---\n');
        console.log(`[knowledge/transcript] Found ${kbResults.length} results for chunk`);
      }
    } catch (e) {
      console.log('[knowledge/transcript] Query failed:', e.message);
    }

    const analysisRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: `You are a real-time sales call copilot for a Fivetran sales rep. You analyze transcript chunks and surface helpful information the rep can use RIGHT NOW in the conversation. Return JSON only.

YOU ARE A FIVETRAN EXPERT. You know:
- Fivetran is an automated data movement platform with 600+ pre-built connectors
- It syncs data from SaaS apps (Salesforce, HubSpot, Marketo, etc.), databases (Postgres, MySQL, SQL Server, Oracle, MongoDB), files, and events into warehouses (Snowflake, BigQuery, Redshift, Databricks)
- Zero-maintenance pipelines — set up once, Fivetran handles schema changes, API updates, and incremental syncing automatically
- Key features: automated schema migration, log-based CDC for databases, HVR for high-volume real-time replication, Fivetran AI for natural language data queries, Connector SDK for custom connectors, transformations (dbt integration)
- Pricing: usage-based on Monthly Active Rows (MAR). Free tier available. Standard, Enterprise, and Business Critical tiers.
- Competitors: Airbyte (open source, requires maintenance), Stitch (acquired by Talend, limited connectors), Matillion (ELT + transformation, not pure data movement), Informatica (legacy, complex), Talend (on-prem heavy), custom scripts (most common competitor)
- Key differentiators: fully managed (no infra to maintain), fastest time-to-value, most connectors, automatic schema handling, SOC2/HIPAA/GDPR compliant

WHEN YOU DETECT SOMETHING IN THE TRANSCRIPT, surface a helpful card:

Trigger types and what to surface:
- "competitor": Specific competitive positioning. If Airbyte → "Airbyte requires engineering maintenance. Fivetran is fully managed — zero pipeline babysitting." If custom scripts → "Custom pipelines break when APIs change. Fivetran auto-adapts to schema changes."
- "objection": Direct response to the concern with evidence. Pricing objection → explain MAR model and ROI. Security → mention SOC2, HIPAA compliance. Complexity → emphasize 5-minute setup.
- "technical": Actual technical answer they can say on the call. "How do you handle schema changes?" → "Fivetran automatically detects and propagates schema changes — new columns, type changes, table additions — without any manual intervention."
- "pricing": Explain the pricing model clearly. "Usage-based on Monthly Active Rows. You only pay for rows that actually change. Free tier to start, scales with usage."
- "use_case": When someone describes a data problem → explain how Fivetran solves it specifically
- "question": When a prospect asks a direct question → provide the answer the rep can say

Return format:
{
  "triggers": [
    {
      "type": "technical",
      "keyword": "schema changes",
      "quote": "what happens when our source schema changes",
      "response_card": "Fivetran automatically detects and propagates schema changes — new columns, type changes, table additions — no manual intervention. You can also set up alerts for schema drift if you want visibility."
    }
  ]
}

RULES:
- Only trigger on genuinely useful moments — not every sentence
- response_card should be something the rep can literally SAY on the call or copy/paste
- Keep response_card to 2-4 sentences max
- Be specific to Fivetran, not generic
- If nothing notable in this chunk, return: { "triggers": [] }
- Only return triggers for NEW topics, not things already covered` + transcriptKnowledge,
        messages: [{ role: 'user', content: `Transcript chunk: "${chunk}"\n\nFull conversation context (last 500 chars): "${_callTranscript.slice(-500)}"` }],
      }),
    });

    const data = await analysisRes.json();
    console.log('[transcript] API response:', JSON.stringify(data).substring(0, 500));
    const text = data.content?.[0]?.text || '{"triggers":[]}';
    console.log('[transcript] Extracted text:', text.substring(0, 300));

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] || '{"triggers":[]}');
    } catch (e) {
      parsed = { triggers: [] };
    }

    // Filter out duplicates
    const newTriggers = (parsed.triggers || []).filter(t => {
      const key = `${t.type}:${t.keyword}`;
      if (_callTriggersSent.has(key)) return false;
      _callTriggersSent.add(key);
      return true;
    });

    res.json({ ok: true, triggers: newTriggers });
  } catch (e) {
    console.error('Transcript analysis error:', e.message);
    res.json({ ok: false, triggers: [] });
  }
});

// ── Post-call summary ──
app.post('/api/call/summary', async (req, res) => {
  const { transcript } = req.body;

  if (!ANTHROPIC_KEY || !transcript) return res.json({ ok: false });

  try {
    const summaryRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are a sales call analyst. Generate a structured post-call summary in this exact format. All lowercase, concise.

## call summary
[2-3 sentence overview of what was discussed]

## key topics
- [topic 1]
- [topic 2]
- [topic 3]

## objections raised
- [objection 1 + how it was handled]

## action items
- [ ] [action 1 — who owns it]
- [ ] [action 2 — who owns it]

## meddpicc update
- metrics: [what was discussed]
- economic buyer: [identified? who?]
- decision criteria: [what matters to them]
- decision process: [next steps in their process]
- paper process: [legal/procurement status]
- implicate pain: [core pain points]
- champion: [who's advocating internally]

## suggested follow-up email
[draft a brief follow-up email based on the call]`,
        messages: [{ role: 'user', content: `Full call transcript:\n\n${transcript.substring(0, 8000)}` }],
      }),
    });

    const data = await summaryRes.json();
    const summary = data.content?.[0]?.text || 'could not generate summary.';

    // Save to clipboard automatically
    const clipboardItem = {
      id: 'call-' + Date.now().toString(36),
      type: 'call-summary',
      title: 'Post-call summary',
      content: summary,
      context: '',
      source: 'call',
      timestamp: new Date().toISOString(),
    };
    if (typeof buddyClipboard !== 'undefined') {
      buddyClipboard.unshift(clipboardItem);
    }

    res.json({ ok: true, summary });
  } catch (e) {
    console.error('Summary error:', e.message);
    res.json({ ok: false, summary: 'error generating summary.' });
  }
});

// ── Reset call state ──
app.post('/api/call/end', (req, res) => {
  _callTranscript = '';
  _callTriggersSent.clear();
  res.json({ ok: true });
});

// ═══ Petition Easter Egg ═══
let _petitionSignatures = []; // In-memory for now, persists per deploy

app.post('/api/petition/sign', express.json(), (req, res) => {
  const name = (req.body.name || '').trim().substring(0, 60);
  if (!name) return res.json({ ok: false });
  // Prevent duplicates
  if (!_petitionSignatures.find(s => s.name.toLowerCase() === name.toLowerCase())) {
    _petitionSignatures.unshift({ name, signed: new Date().toISOString() });
  }
  res.json({ ok: true, count: _petitionSignatures.length });
});

app.get('/api/petition/signatures', (req, res) => {
  res.json({ signatures: _petitionSignatures, count: _petitionSignatures.length });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🤖 Buddy Backend on :${PORT}`);
  console.log(`   Slack: ${SLACK_TOKEN ? '✅ Bot token loaded' : '❌ No token'}`);
  console.log(`   AI: ${ANTHROPIC_KEY ? '✅ Claude API ready' : '❌ No key'}\n`);
});
