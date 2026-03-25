(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  //  Vibetran Buddy — Content Script (Sidebar Rewrite)
  //  Shadow-DOM isolated sidebar with smart context, insert system,
  //  and micro-interactions.
  // ═══════════════════════════════════════════════════════════════

  const BUDDY_SERVER = 'http://localhost:3001';
  const BUDDY_SERVER_ALT = 'http://localhost:3000';
  const SIDEBAR_WIDTH = 320;
  const TRANSITION_MS = 300;

  // Toggle this to render mock data without a running server
  const useMockData = false;

  // ── State ──
  let sidebarOpen = false;
  let shadowRoot = null;
  let hostEl = null;
  let fabEl = null;
  let currentContext = null;
  let serverBase = BUDDY_SERVER;
  let toastTimeout = null;

  // ══════════════════════════════════════════════════════════════
  //  MOCK DATA
  // ══════════════════════════════════════════════════════════════

  const MOCK = {
    opportunity: {
      account: 'Acme Corp',
      oppName: 'Acme Corp — Enterprise Platform',
      stage: 'Negotiation',
      amount: '$185,000',
      closeDate: '2026-04-18',
      owner: 'Sarah Chen',
      lastCallDate: '2026-03-21',
      lastCallTitle: 'Technical deep-dive with Acme engineering',
      meddpicc: {
        'Metrics': 'Targeting 40% reduction in manual data entry; expects $2.1M annual savings from automation.',
        'Economic Buyer': 'VP Engineering — Dana Reeves (met in last call, positive signal).',
        'Decision Criteria': 'SOC2 compliance, sub-200ms API latency, SSO integration, on-prem option.',
        'Decision Process': '1) Technical eval (complete) 2) Security review (in progress) 3) CFO sign-off 4) Legal.',
        'Paper Process': 'MSA redline expected next week. Legal contact: Mark Tuft.',
        'Identified Pain': 'Engineering team losing 15hrs/week on manual CRM sync. Integration failures causing customer churn.',
        'Champion': 'Jordan Kessler (Sr. Director Eng) — actively selling internally, shared our ROI deck with CFO.',
        'Competition': 'Evaluating Competitor X (weaker on API). Incumbent is manual spreadsheets.',
      },
      nextSteps: 'Send updated SOW with on-prem pricing by EOD Friday. Schedule CFO intro call next week.',
    },
    gmailAccount: {
      account: 'Acme Corp',
      oppStage: 'Negotiation',
      oppAmount: '$185,000',
      closeDate: '2026-04-18',
      champion: 'Jordan Kessler',
      lastActivity: 'Technical deep-dive call (Mar 21)',
    },
    emailDrafts: [
      {
        label: 'Follow-up: SOW & Pricing',
        text: 'Hi Jordan,\n\nGreat connecting on Thursday. As discussed, I\'ve attached the updated SOW with on-prem pricing options.\n\nKey changes from our conversation:\n- Added on-prem deployment option (Section 3.2)\n- Updated SLA to 99.95% uptime guarantee\n- Included dedicated CSM for first 12 months\n\nWould love to get 30 min with Dana to walk through the commercial terms. Do you have any time next Tuesday or Wednesday?\n\nBest,\nSarah',
      },
      {
        label: 'Intro: CFO Meeting Request',
        text: 'Hi Jordan,\n\nAs we move toward finalizing the partnership, I\'d love to schedule a brief call with your CFO to discuss the business impact and investment structure.\n\nI can prepare a tailored ROI analysis based on the metrics we\'ve been tracking. Would a 20-minute slot work sometime next week?\n\nThanks,\nSarah',
      },
    ],
    replyDrafts: [
      {
        label: 'Acknowledge & Confirm',
        text: 'Thanks for sending this over. I\'ve reviewed the details and everything looks aligned with our last conversation. I\'ll have the updated document back to you by end of week.',
      },
      {
        label: 'Request Clarification',
        text: 'Thanks for the update. A couple of quick questions before I loop in our team:\n\n1. Can you clarify the timeline for the security review?\n2. Is the budget allocation confirmed for Q2?\n\nHappy to jump on a quick call if easier.',
      },
    ],
    gongSummary: {
      title: 'Technical Deep-Dive — Acme Corp',
      date: '2026-03-21',
      duration: '47 min',
      participants: ['Sarah Chen (Vibetran)', 'Jordan Kessler (Acme)', 'Dana Reeves (Acme)', 'Raj Patel (Acme Eng)'],
      meddpicc: {
        'Metrics': '40% reduction in manual data entry confirmed by Raj; $2.1M projected savings.',
        'Economic Buyer': 'Dana Reeves engaged — asked about pricing and ROI timeline.',
        'Decision Criteria': 'SOC2 (must-have), API latency <200ms, SSO, on-prem option (new ask).',
        'Identified Pain': 'Integration failures causing 3-4 customer escalations per month.',
        'Champion': 'Jordan actively pushing internally — mentioned sharing ROI deck with CFO.',
        'Competition': 'Competitor X mentioned briefly — Raj said their API was "clunky".',
        'Next Steps': 'Send updated SOW with on-prem pricing by Friday. CFO intro next week.',
      },
      moments: [
        { time: '3:42',  text: 'Jordan confirmed budget is allocated for Q2' },
        { time: '12:15', text: 'Dana asked about on-prem deployment — new requirement' },
        { time: '18:30', text: 'Raj described integration pain — "losing 15 hours a week"' },
        { time: '28:05', text: 'Competitor X mentioned — Raj called their API "clunky"' },
        { time: '35:20', text: 'Dana asked about ROI timeline — "CFO wants to see 12-month payback"' },
        { time: '41:00', text: 'Jordan offered to set up CFO intro call next week' },
      ],
    },
    linkedinContact: {
      found: true,
      name: 'Jordan Kessler',
      title: 'Sr. Director of Engineering',
      company: 'Acme Corp',
      oppName: 'Acme Corp — Enterprise Platform',
      oppStage: 'Negotiation',
      lastActivity: 'Technical deep-dive call (Mar 21)',
      notes: 'Champion. Actively selling internally. Shared ROI deck with CFO.',
    },
    linkedinNew: {
      found: false,
      name: null,
    },
  };

  // ══════════════════════════════════════════════════════════════
  //  PAGE CONTEXT DETECTION
  // ══════════════════════════════════════════════════════════════

  function detectPageContext() {
    const url = window.location.href;
    const title = document.title;
    const host = window.location.hostname;

    if (host.includes('salesforce.com') || host.includes('lightning.force.com') || host.includes('force.com')) {
      let type = 'page';
      if (url.includes('/Account/') || url.includes('/001')) type = 'account';
      else if (url.includes('/Opportunity/') || url.includes('/006')) type = 'opportunity';
      else if (url.includes('/Contact/') || url.includes('/003')) type = 'contact';
      else if (url.includes('/Lead/') || url.includes('/00Q')) type = 'lead';
      const recordName = document.querySelector(
        '.slds-page-header__title, .entityNameTitle, h1.pageDescription, [data-aura-class="forceOutputLookup"] a'
      )?.textContent?.trim() || title;
      return { platform: 'salesforce', type, title: recordName, url };
    }

    if (host.includes('mail.google.com')) {
      const isComposing = !!document.querySelector('[role="dialog"]') || !!document.querySelector('.nH .aO');
      const subject = document.querySelector('h2.hP')?.textContent?.trim();
      const sender = document.querySelector('.gD')?.getAttribute('email');
      return {
        platform: 'gmail',
        type: isComposing ? 'compose' : subject ? 'reading' : 'inbox',
        title: subject || title,
        url,
        sender,
      };
    }

    if (host.includes('app.slack.com')) {
      const channelName = document.querySelector('[data-qa="channel_name"]')?.textContent?.trim();
      return { platform: 'slack', type: 'channel', title: channelName || title, url };
    }

    if (host.includes('linkedin.com')) {
      const isProfile = url.includes('/in/');
      const name = isProfile ? document.querySelector('h1')?.textContent?.trim() : null;
      return { platform: 'linkedin', type: isProfile ? 'profile' : 'feed', title: name || title, url };
    }

    if (host.includes('meet.google.com')) {
      return { platform: 'meet', type: 'call', title: title.replace(' - Google Meet', ''), url };
    }

    if (host.includes('gong.io')) {
      return { platform: 'gong', type: 'call', title, url };
    }

    if (host.includes('calendar.google.com')) {
      return { platform: 'calendar', type: 'calendar', title, url };
    }

    if (host.includes('outreach.io')) {
      return { platform: 'outreach', type: 'sequence', title, url };
    }

    return { platform: 'other', type: 'generic', title, url };
  }

  // ══════════════════════════════════════════════════════════════
  //  SERVER COMMUNICATION
  // ══════════════════════════════════════════════════════════════

  async function serverFetch(path, body) {
    const urls = [serverBase + path, (serverBase === BUDDY_SERVER ? BUDDY_SERVER_ALT : BUDDY_SERVER) + path];
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          // Remember which server worked
          serverBase = url.replace(path, '');
          return await res.json();
        }
      } catch (_) { /* try next */ }
    }
    return null;
  }

  async function fetchBuddyContext(pageContext) {
    if (useMockData) return getMockContextData(pageContext);

    // Try real context enrichment first
    try {
      const enriched = await serverFetch('/api/context/enrich', pageContext);
      if (enriched?.ok && enriched?.data) {
        return { ok: true, enriched: enriched.data, sources: enriched.sources, context: pageContext };
      }
    } catch (e) {
      console.log('[buddy] Context enrichment failed, trying clipboard fallback');
    }

    // Fallback to clipboard data
    const data = await serverFetch('/api/clipboard/get', { pageContext });
    if (data?.ok) return { ...data, context: pageContext };

    // Final fallback: mock data
    return getMockContextData(pageContext);
  }

  function getMockContextData(ctx) {
    // Return platform-appropriate mock data
    return { ok: true, context: ctx, usedMock: true };
  }

  // ══════════════════════════════════════════════════════════════
  //  HELPERS
  // ══════════════════════════════════════════════════════════════

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getPlatformIcon(platform) {
    const icons = {
      salesforce: '\u2601\uFE0F',
      gmail: '\uD83D\uDCE7',
      slack: '\uD83D\uDCAC',
      linkedin: '\uD83D\uDD17',
      meet: '\uD83D\uDCDE',
      gong: '\uD83C\uDF99\uFE0F',
      calendar: '\uD83D\uDCC5',
      outreach: '\uD83D\uDCE4',
      other: '\uD83C\uDF10',
    };
    return icons[platform] || '\uD83C\uDF10';
  }

  function getTimeAgo(timestamp) {
    if (!timestamp) return '';
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  // ══════════════════════════════════════════════════════════════
  //  INSERT SYSTEM
  // ══════════════════════════════════════════════════════════════

  // ── Tier 1: Copy to clipboard ──

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('\u2713 Copied', 'success');
      return true;
    } catch (_) {
      // Fallback: execCommand
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast('\u2713 Copied', 'success');
      return true;
    }
  }

  // ── Tier 2: Insert into Salesforce field ──

  function insertIntoSalesforceField(fieldLabel, text) {
    // Strategy: find a label/span containing the field name, then locate its associated input
    const normalizedLabel = fieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Try multiple strategies to find the right field
    const strategies = [
      // Strategy 1: label elements
      () => {
        const labels = document.querySelectorAll('label, .slds-form-element__label, span.test-id__field-label');
        for (const lbl of labels) {
          const lblText = lbl.textContent?.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          if (lblText === normalizedLabel || lblText.includes(normalizedLabel)) {
            // Find associated input
            const forAttr = lbl.getAttribute('for');
            if (forAttr) {
              const input = document.getElementById(forAttr);
              if (input) return input;
            }
            // Look for input/textarea in sibling or parent
            const container = lbl.closest('.slds-form-element, .forcePageBlockItem, [data-target-selection-name]');
            if (container) {
              const field = container.querySelector('input, textarea, [contenteditable="true"]');
              if (field) return field;
            }
          }
        }
        return null;
      },
      // Strategy 2: data attributes
      () => {
        const el = document.querySelector(`[data-target-selection-name*="${fieldLabel}"] input, [data-target-selection-name*="${fieldLabel}"] textarea`);
        return el;
      },
      // Strategy 3: placeholder matching
      () => {
        const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
        for (const inp of inputs) {
          if (inp.placeholder.toLowerCase().includes(normalizedLabel)) return inp;
        }
        return null;
      },
    ];

    for (const strategy of strategies) {
      try {
        const field = strategy();
        if (field) {
          setFieldValue(field, text);
          glowElement(field);
          showToast('\u2713 Inserted', 'success');
          return true;
        }
      } catch (_) { /* try next */ }
    }

    // Fallback to clipboard
    copyToClipboard(text);
    showToast('Field not found \u2014 copied to clipboard', 'info');
    return false;
  }

  // ── Tier 2: Insert into Gmail compose ──

  function insertIntoGmailCompose(text) {
    // Find active compose body
    const composeSelectors = [
      'div[aria-label="Message Body"][contenteditable="true"]',
      'div.Am.Al.editable[contenteditable="true"]',
      'div[role="textbox"][contenteditable="true"]',
      'div.editable[contenteditable="true"]',
    ];

    for (const sel of composeSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        // Insert at cursor position or append
        el.focus();
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          // Check if cursor is inside the compose area
          if (el.contains(range.startContainer)) {
            range.deleteContents();
            const lines = text.split('\n');
            const frag = document.createDocumentFragment();
            lines.forEach((line, i) => {
              frag.appendChild(document.createTextNode(line));
              if (i < lines.length - 1) frag.appendChild(document.createElement('br'));
            });
            range.insertNode(frag);
            // Move cursor to end of inserted text
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            appendToElement(el, text);
          }
        } else {
          appendToElement(el, text);
        }
        // Dispatch input event for Gmail to register the change
        el.dispatchEvent(new Event('input', { bubbles: true }));
        glowElement(el);
        showToast('\u2713 Inserted', 'success');
        return true;
      }
    }

    // Fallback
    copyToClipboard(text);
    showToast('Compose area not found \u2014 copied to clipboard', 'info');
    return false;
  }

  function appendToElement(el, text) {
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      el.appendChild(document.createTextNode(line));
      if (i < lines.length - 1) el.appendChild(document.createElement('br'));
    });
  }

  function setFieldValue(field, text) {
    if (field.contentEditable === 'true') {
      field.focus();
      field.textContent = text;
      field.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(field, text);
      } else {
        field.value = text;
      }
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function glowElement(el) {
    const prev = el.style.cssText;
    el.style.cssText += ';animation: none; box-shadow: 0 0 0 0 rgba(200,240,49,0.5); transition: box-shadow 0.3s;';
    requestAnimationFrame(() => {
      el.style.boxShadow = '0 0 12px 4px rgba(200,240,49,0.35)';
      setTimeout(() => {
        el.style.boxShadow = '';
        el.style.cssText = prev;
      }, 800);
    });
  }

  // ── Toast Notification ──

  function showToast(message, type = 'success') {
    if (!shadowRoot) return;
    let toast = shadowRoot.querySelector('.vt-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'vt-toast';
      shadowRoot.appendChild(toast);
    }
    clearTimeout(toastTimeout);
    toast.className = `vt-toast vt-toast-${type}`;
    toast.textContent = message;
    // Trigger reflow for re-animation
    void toast.offsetWidth;
    toast.classList.add('vt-toast-show');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('vt-toast-show');
    }, 2000);
  }

  // ══════════════════════════════════════════════════════════════
  //  FAB (Floating Action Button)
  // ══════════════════════════════════════════════════════════════

  function createFAB() {
    if (fabEl) return;
    fabEl = document.createElement('div');
    fabEl.id = 'vibetran-fab';
    fabEl.setAttribute('style', `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483646;
      cursor: pointer;
      transition: all 0.25s ease;
      opacity: 1;
    `);
    fabEl.innerHTML = `
      <div id="vibetran-fab-inner" style="
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #FAF3E0;
        color: #2C2418;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(44,36,24,0.2);
        position: relative;
        transition: transform 0.2s;
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke-linecap="round"/>
        </svg>
        <span id="vibetran-badge" style="
          position: absolute;
          top: -3px;
          right: -3px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #C8F031;
          display: none;
          border: 2px solid #FAF3E0;
        "></span>
      </div>
    `;

    // Hover effect
    fabEl.addEventListener('mouseenter', () => {
      const inner = fabEl.querySelector('#vibetran-fab-inner');
      if (inner) inner.style.transform = 'scale(1.1)';
    });
    fabEl.addEventListener('mouseleave', () => {
      const inner = fabEl.querySelector('#vibetran-fab-inner');
      if (inner) inner.style.transform = 'scale(1)';
    });

    // Breathing animation via inline style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes vibetranBreathe {
        0%, 100% { box-shadow: 0 4px 20px rgba(44,36,24,0.2); }
        50% { box-shadow: 0 4px 24px rgba(44,36,24,0.3); }
      }
      #vibetran-fab-inner { animation: vibetranBreathe 3s ease-in-out infinite; }
      #vibetran-fab.vibetran-fab-listening #vibetran-fab-inner {
        background: #2A9D8F !important;
        color: white !important;
      }
      @keyframes vibetranPulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(1.4); opacity: 0; }
      }
      .vibetran-fab-pulse-ring {
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 2px solid #2A9D8F;
        animation: vibetranPulse 2s ease infinite;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);

    fabEl.addEventListener('click', () => {
      if (sidebarOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    document.body.appendChild(fabEl);
  }

  function updateFABVisibility() {
    if (!fabEl) return;
    fabEl.style.display = sidebarOpen ? 'none' : 'block';
  }

  function showFABBadge(count) {
    const badge = document.getElementById('vibetran-badge');
    if (!badge) return;
    if (count > 0) {
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  SIDEBAR CREATION (Shadow DOM)
  // ══════════════════════════════════════════════════════════════

  function createSidebarHost() {
    if (hostEl) return;

    hostEl = document.createElement('div');
    hostEl.id = 'vibetran-sidebar-host';
    hostEl.style.cssText = 'position:fixed;top:0;right:0;width:0;height:0;z-index:2147483647;';
    document.body.appendChild(hostEl);

    shadowRoot = hostEl.attachShadow({ mode: 'open' });

    // Load sidebar CSS into shadow DOM
    const cssUrl = chrome.runtime?.getURL?.('sidebar.css');
    if (cssUrl) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssUrl;
      shadowRoot.appendChild(link);
    }

    // Build sidebar skeleton
    const sidebar = document.createElement('div');
    sidebar.className = 'vt-sidebar';
    sidebar.id = 'vt-sidebar';
    sidebar.innerHTML = `
      <div class="vt-header">
        <span class="vt-logo"><span class="vt-logo-dot"></span> vibetran</span>
        <button class="vt-close-btn" id="vt-close" title="Close sidebar">\u00D7</button>
      </div>
      <div class="vt-context-bar" id="vt-context-bar">
        <span class="vt-context-platform" id="vt-ctx-platform"></span>
        <span class="vt-context-title" id="vt-ctx-title"></span>
      </div>
      <div class="vt-body" id="vt-body">
        <div class="vt-loading">
          <div class="vt-loading-dot"></div>
          <div class="vt-loading-dot"></div>
          <div class="vt-loading-dot"></div>
        </div>
      </div>
      <div class="vt-input-wrap">
        <input type="text" class="vt-input" id="vt-input" placeholder="ask buddy anything\u2026" />
      </div>
    `;
    shadowRoot.appendChild(sidebar);

    // Close button
    shadowRoot.getElementById('vt-close').addEventListener('click', closeSidebar);

    // Input handler
    const input = shadowRoot.getElementById('vt-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        askBuddy(input.value.trim());
        input.value = '';
      }
    });
  }

  // ── Smooth page margin transition ──

  function setupPageTransition() {
    if (!document.documentElement.style.transition.includes('margin-right')) {
      document.documentElement.style.transition = `margin-right ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  OPEN / CLOSE SIDEBAR
  // ══════════════════════════════════════════════════════════════

  async function openSidebar() {
    if (sidebarOpen) return;
    sidebarOpen = true;

    createSidebarHost();
    setupPageTransition();

    currentContext = detectPageContext();

    // Update context bar
    const ctxPlatform = shadowRoot.getElementById('vt-ctx-platform');
    const ctxTitle = shadowRoot.getElementById('vt-ctx-title');
    if (ctxPlatform) ctxPlatform.textContent = `${getPlatformIcon(currentContext.platform)} ${currentContext.platform}`;
    if (ctxTitle) ctxTitle.textContent = (currentContext.title || 'this page').substring(0, 60);

    // Show loading
    const body = shadowRoot.getElementById('vt-body');
    if (body) {
      body.innerHTML = `
        <div class="vt-loading">
          <div class="vt-loading-dot"></div>
          <div class="vt-loading-dot"></div>
          <div class="vt-loading-dot"></div>
        </div>
      `;
    }

    // Open with animation
    const sidebar = shadowRoot.getElementById('vt-sidebar');
    requestAnimationFrame(() => {
      sidebar.classList.add('vt-open');
      document.documentElement.style.marginRight = SIDEBAR_WIDTH + 'px';
      updateFABVisibility();
    });

    // Fetch and render context
    const data = await fetchBuddyContext(currentContext);
    renderContextView(currentContext, data);
  }

  function closeSidebar() {
    if (!sidebarOpen) return;
    sidebarOpen = false;

    const sidebar = shadowRoot?.getElementById('vt-sidebar');
    if (sidebar) sidebar.classList.remove('vt-open');

    document.documentElement.style.marginRight = '0px';
    updateFABVisibility();
  }

  function toggleSidebar() {
    if (sidebarOpen) closeSidebar();
    else openSidebar();
  }

  // ══════════════════════════════════════════════════════════════
  //  SMART CONTEXT RENDERING
  // ══════════════════════════════════════════════════════════════

  function renderContextView(ctx, data) {
    const body = shadowRoot?.getElementById('vt-body');
    if (!body) return;

    // Use enriched data from server, or fall back to mock
    const enriched = data?.enriched || null;
    const usedMock = data?.usedMock || false;

    switch (ctx.platform) {
      case 'salesforce':
        renderSalesforceView(body, ctx, data, enriched);
        break;
      case 'gmail':
        if (ctx.type === 'compose') renderGmailComposeView(body, ctx, data, enriched);
        else if (ctx.type === 'reading') renderGmailReadingView(body, ctx, data, enriched);
        else renderFallbackView(body, ctx, data, enriched);
        break;
      case 'gong':
        renderGongView(body, ctx, data, enriched);
        break;
      case 'linkedin':
        if (ctx.type === 'profile') renderLinkedInView(body, ctx, data, enriched);
        else renderFallbackView(body, ctx, data, enriched);
        break;
      case 'meet':
        renderMeetView(body, ctx, data);
        break;
      default:
        renderFallbackView(body, ctx, data, enriched);
    }

    // Add sources footer if we have real data
    if (data?.sources?.length && !usedMock) {
      const sourceNames = [...new Set(data.sources.map(s => s.source))].join(', ');
      const footer = document.createElement('div');
      footer.style.cssText = 'padding:8px 14px;font-size:0.6rem;color:#B5AA98;text-align:center;border-top:1px solid rgba(181,170,152,0.15);margin-top:8px;';
      footer.textContent = `Sources: ${sourceNames}`;
      body.appendChild(footer);
    }

    bindAllButtons(body);
  }

  // ── Salesforce Opportunity View ──

  function renderSalesforceView(body, ctx, data, enriched) {
    const opp = enriched || MOCK.opportunity;
    const m = opp.meddpicc || {};

    let html = '';

    // Recent call card
    html += `
      <div class="vt-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:0.72rem;font-weight:700;color:#2A9D8F;">\uD83C\uDF99\uFE0F Recent Call</span>
          <span style="font-size:0.65rem;color:#B5AA98;">${escapeHtml(opp.lastCallDate)}</span>
        </div>
        <div style="font-size:0.82rem;font-weight:600;color:#2C2418;margin-bottom:4px;">${escapeHtml(opp.lastCallTitle)}</div>
        <div style="font-size:0.72rem;color:#8A7E6B;">${escapeHtml(opp.account)} &middot; ${escapeHtml(opp.stage)} &middot; ${escapeHtml(opp.amount)}</div>
      </div>
    `;

    // MEDDPICC fields
    html += `<div class="vt-section-label">MEDDPICC</div>`;
    html += `<div class="vt-card" style="padding:6px 14px;">`;
    for (const [label, value] of Object.entries(m)) {
      const safeValue = escapeHtml(value);
      html += `
        <div class="vt-field-row">
          <span class="vt-field-label">${escapeHtml(label)}</span>
          <span class="vt-field-value">${safeValue || '<span class="vt-field-empty">Not captured</span>'}</span>
          <div class="vt-field-actions">
            <button class="vt-btn vt-btn-insert" data-action="insert-sf" data-label="${escapeHtml(label)}" data-text="${safeValue}">Insert \u25B8</button>
            <button class="vt-btn" data-action="copy" data-text="${safeValue}">\uD83D\uDCCB</button>
          </div>
        </div>
      `;
    }
    html += `</div>`;

    // Next Steps
    html += `<div class="vt-section-label">Next Steps</div>`;
    html += `
      <div class="vt-draft-card">
        <div class="vt-draft-text">${escapeHtml(opp.nextSteps)}</div>
        <div class="vt-draft-actions">
          <button class="vt-btn vt-btn-insert" data-action="insert-sf" data-label="Next Steps" data-text="${escapeHtml(opp.nextSteps)}">Insert \u25B8</button>
          <button class="vt-btn" data-action="copy" data-text="${escapeHtml(opp.nextSteps)}">\uD83D\uDCCB Copy</button>
        </div>
      </div>
    `;

    // Quick Actions
    html += `
      <div class="vt-actions-row">
        <button class="vt-action-btn" data-action="quick" data-type="log-call"><span class="vt-action-icon">\uD83D\uDCDE</span> Log call</button>
        <button class="vt-action-btn" data-action="quick" data-type="update-stage"><span class="vt-action-icon">\uD83D\uDD04</span> Update stage</button>
        <button class="vt-action-btn" data-action="quick" data-type="draft-followup"><span class="vt-action-icon">\u270F\uFE0F</span> Draft follow-up</button>
      </div>
    `;

    body.innerHTML = html;
  }

  // ── Gmail Compose View ──

  function renderGmailComposeView(body, ctx, data, enriched) {
    const acct = enriched || MOCK.gmailAccount;
    const drafts = enriched?.suggestedDrafts || MOCK.emailDrafts;

    let html = '';

    // Account context card
    html += `
      <div class="vt-account-card">
        <div class="vt-account-name">\uD83C\uDFE2 About ${escapeHtml(acct.account)}</div>
        <div class="vt-account-meta">
          <strong>Opportunity:</strong> ${escapeHtml(acct.oppStage)} &middot; ${escapeHtml(acct.oppAmount)}<br/>
          <strong>Close Date:</strong> ${escapeHtml(acct.closeDate)}<br/>
          <strong>Champion:</strong> ${escapeHtml(acct.champion)}<br/>
          <strong>Last Activity:</strong> ${escapeHtml(acct.lastActivity)}
        </div>
      </div>
    `;

    // Suggested drafts
    html += `<div class="vt-section-label">Suggested Drafts</div>`;
    for (const draft of drafts) {
      const safeText = escapeHtml(draft.text);
      html += `
        <div class="vt-draft-card">
          <div class="vt-draft-label">${escapeHtml(draft.label)}</div>
          <div class="vt-draft-text">${safeText.replace(/\n/g, '<br>')}</div>
          <div class="vt-draft-actions">
            <button class="vt-btn vt-btn-insert" data-action="insert-gmail" data-text="${safeText}">Insert \u25B8</button>
            <button class="vt-btn" data-action="copy" data-text="${safeText}">\uD83D\uDCCB Copy</button>
          </div>
        </div>
      `;
    }

    body.innerHTML = html;
  }

  // ── Gmail Reading View ──

  function renderGmailReadingView(body, ctx, data, enriched) {
    const acct = enriched || MOCK.gmailAccount;
    const replies = enriched?.suggestedDrafts || MOCK.replyDrafts;

    let html = '';

    // Account context
    html += `
      <div class="vt-account-card">
        <div class="vt-account-name">\uD83C\uDFE2 ${escapeHtml(acct.account)}</div>
        <div class="vt-account-meta">
          <strong>Stage:</strong> ${escapeHtml(acct.oppStage)} &middot; ${escapeHtml(acct.oppAmount)}<br/>
          <strong>Champion:</strong> ${escapeHtml(acct.champion)}<br/>
          <strong>Last:</strong> ${escapeHtml(acct.lastActivity)}
        </div>
      </div>
    `;

    // Suggested replies
    html += `<div class="vt-section-label">Suggested Replies</div>`;
    for (const reply of replies) {
      const safeText = escapeHtml(reply.text);
      html += `
        <div class="vt-draft-card">
          <div class="vt-draft-label">${escapeHtml(reply.label)}</div>
          <div class="vt-draft-text">${safeText.replace(/\n/g, '<br>')}</div>
          <div class="vt-draft-actions">
            <button class="vt-btn vt-btn-insert" data-action="insert-gmail" data-text="${safeText}">Insert \u25B8</button>
            <button class="vt-btn" data-action="copy" data-text="${safeText}">\uD83D\uDCCB Copy</button>
          </div>
        </div>
      `;
    }

    // Log to Salesforce action
    html += `
      <div class="vt-actions-row">
        <button class="vt-action-btn" data-action="quick" data-type="log-to-sf"><span class="vt-action-icon">\u2601\uFE0F</span> Log to Salesforce</button>
      </div>
    `;

    body.innerHTML = html;
  }

  // ── Gong Call Recording View ──

  function renderGongView(body, ctx, data, enriched) {
    const g = enriched || MOCK.gongSummary;

    let html = '';

    // Call header card
    html += `
      <div class="vt-card">
        <div style="font-size:0.82rem;font-weight:700;color:#2C2418;margin-bottom:4px;">${escapeHtml(g.title)}</div>
        <div style="font-size:0.72rem;color:#8A7E6B;">${escapeHtml(g.date)} &middot; ${escapeHtml(g.duration)} &middot; ${g.participants.length} participants</div>
      </div>
    `;

    // MEDDPICC summary
    html += `<div class="vt-section-label">MEDDPICC Summary</div>`;
    html += `<div class="vt-card" style="padding:6px 14px;">`;
    for (const [label, value] of Object.entries(g.meddpicc)) {
      const safeValue = escapeHtml(value);
      html += `
        <div class="vt-field-row">
          <span class="vt-field-label">${escapeHtml(label)}</span>
          <span class="vt-field-value">${safeValue}</span>
          <div class="vt-field-actions">
            <button class="vt-btn" data-action="copy" data-text="${safeValue}">\uD83D\uDCCB</button>
          </div>
        </div>
      `;
    }
    html += `</div>`;

    // Key Moments
    html += `<div class="vt-section-label">Key Moments</div>`;
    html += `<div class="vt-card">`;
    for (const moment of g.moments) {
      html += `
        <div class="vt-moment-row">
          <span class="vt-moment-time">${escapeHtml(moment.time)}</span>
          <span class="vt-moment-text">${escapeHtml(moment.text)}</span>
        </div>
      `;
    }
    html += `</div>`;

    // Actions
    html += `
      <div class="vt-actions-row">
        <button class="vt-action-btn" data-action="quick" data-type="push-to-sf"><span class="vt-action-icon">\u2601\uFE0F</span> Push to Salesforce</button>
        <button class="vt-action-btn" data-action="quick" data-type="draft-followup"><span class="vt-action-icon">\u270F\uFE0F</span> Draft follow-up</button>
      </div>
    `;

    body.innerHTML = html;
  }

  // ── LinkedIn Profile View ──

  function renderLinkedInView(body, ctx, data, enriched) {
    // Decide if contact exists in CRM
    const contact = enriched || (ctx.title ? MOCK.linkedinContact : MOCK.linkedinNew);
    const found = contact.found !== undefined ? contact.found : true;

    let html = '';

    if (found) {
      html += `
        <div class="vt-account-card">
          <span class="vt-crm-tag vt-crm-tag-found">\u2713 In CRM</span>
          <div class="vt-account-name">${escapeHtml(contact.name)}</div>
          <div class="vt-account-meta">
            <strong>Title:</strong> ${escapeHtml(contact.title)}<br/>
            <strong>Company:</strong> ${escapeHtml(contact.company)}<br/>
            <strong>Opportunity:</strong> ${escapeHtml(contact.oppName)} (${escapeHtml(contact.oppStage)})<br/>
            <strong>Last Activity:</strong> ${escapeHtml(contact.lastActivity)}<br/>
            <strong>Notes:</strong> ${escapeHtml(contact.notes)}
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="vt-account-card">
          <span class="vt-crm-tag vt-crm-tag-new">New Contact</span>
          <div class="vt-account-name">${escapeHtml(ctx.title || 'Unknown')}</div>
          <div class="vt-account-meta">Not yet in your CRM.</div>
        </div>
      `;
    }

    // Actions
    html += `
      <div class="vt-actions-row">
        <button class="vt-action-btn" data-action="quick" data-type="draft-connection"><span class="vt-action-icon">\u270F\uFE0F</span> Draft connection note</button>
        <button class="vt-action-btn" data-action="quick" data-type="research-account"><span class="vt-action-icon">\uD83D\uDD0D</span> Research account</button>
      </div>
    `;

    body.innerHTML = html;
  }

  // ── Google Meet (live call) View ──

  function renderMeetView(body, ctx, data) {
    let html = '';

    html += `
      <div class="vt-card" style="border-left:3px solid #2A9D8F;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span class="vt-live-dot"></span>
          <span style="font-size:0.72rem;font-weight:700;color:#2A9D8F;">Live Call</span>
        </div>
        <div style="font-size:0.82rem;font-weight:600;color:#2C2418;">${escapeHtml(ctx.title || 'Google Meet')}</div>
        <div style="font-size:0.72rem;color:#8A7E6B;margin-top:4px;">Listening for context triggers\u2026</div>
      </div>
    `;

    html += `<div class="vt-section-label" id="vt-triggers-label" style="display:none;">Live Triggers</div>`;
    html += `<div id="vt-triggers-container"></div>`;

    html += `<div class="vt-section-label" id="vt-summary-label" style="display:none;">Post-Call Summary</div>`;
    html += `<div id="vt-summary-container"></div>`;

    body.innerHTML = html;
  }

  // ── Fallback / Unknown Site View ──

  function renderFallbackView(body, ctx, data, enriched) {
    let html = '';

    // Hero
    html += `
      <div class="vt-fallback-hero">
        <div class="vt-fallback-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="vt-fallback-title">Hey there</div>
        <div class="vt-fallback-sub">Ask me anything, or use the quick actions below.</div>
        <div class="vt-quick-btns">
          <button class="vt-action-btn" data-action="quick" data-type="recent"><span class="vt-action-icon">\uD83D\uDD52</span> Recent</button>
          <button class="vt-action-btn" data-action="quick" data-type="draft-email"><span class="vt-action-icon">\u270F\uFE0F</span> Draft email</button>
          <button class="vt-action-btn" data-action="quick" data-type="lookup-account"><span class="vt-action-icon">\uD83D\uDD0D</span> Look up account</button>
        </div>
      </div>
    `;

    // Check for selected text that might match a known account
    const selectedText = window.getSelection()?.toString()?.trim();
    if (selectedText && selectedText.length > 2 && selectedText.length < 60) {
      html += `
        <div class="vt-card" style="border-left:3px solid #C8F031;">
          <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#8A7E6B;margin-bottom:4px;">Selected Text</div>
          <div style="font-size:0.78rem;color:#2C2418;margin-bottom:8px;">"${escapeHtml(selectedText.substring(0, 80))}"</div>
          <button class="vt-action-btn" data-action="quick" data-type="lookup-selected" data-text="${escapeHtml(selectedText)}"><span class="vt-action-icon">\uD83D\uDD0D</span> Look up</button>
        </div>
      `;
    }

    body.innerHTML = html;
  }

  // ══════════════════════════════════════════════════════════════
  //  BUTTON EVENT BINDING
  // ══════════════════════════════════════════════════════════════

  function bindAllButtons(container) {
    // Copy buttons
    container.querySelectorAll('[data-action="copy"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const text = decodeHtmlEntities(btn.getAttribute('data-text') || '');
        await copyToClipboard(text);
        // Flash green
        btn.classList.add('vt-btn-success');
        const prevText = btn.textContent;
        btn.textContent = '\u2713';
        setTimeout(() => {
          btn.classList.remove('vt-btn-success');
          btn.textContent = prevText;
        }, 1500);
      });
    });

    // Salesforce insert buttons
    container.querySelectorAll('[data-action="insert-sf"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const label = decodeHtmlEntities(btn.getAttribute('data-label') || '');
        const text = decodeHtmlEntities(btn.getAttribute('data-text') || '');
        insertIntoSalesforceField(label, text);
        // Flash
        btn.classList.add('vt-btn-success');
        const prevText = btn.textContent;
        btn.textContent = '\u2713 Inserted';
        setTimeout(() => {
          btn.classList.remove('vt-btn-success');
          btn.textContent = prevText;
        }, 1500);
      });
    });

    // Gmail insert buttons
    container.querySelectorAll('[data-action="insert-gmail"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = decodeHtmlEntities(btn.getAttribute('data-text') || '');
        insertIntoGmailCompose(text);
        btn.classList.add('vt-btn-success');
        const prevText = btn.textContent;
        btn.textContent = '\u2713 Inserted';
        setTimeout(() => {
          btn.classList.remove('vt-btn-success');
          btn.textContent = prevText;
        }, 1500);
      });
    });

    // Quick action buttons
    container.querySelectorAll('[data-action="quick"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.getAttribute('data-type');
        handleQuickAction(type, btn);
      });
    });
  }

  function decodeHtmlEntities(text) {
    const el = document.createElement('textarea');
    el.innerHTML = text;
    return el.value;
  }

  async function handleQuickAction(type, btn) {
    switch (type) {
      case 'log-call':
        showToast('Opening call log\u2026', 'info');
        break;
      case 'update-stage':
        showToast('Opening stage update\u2026', 'info');
        break;
      case 'draft-followup':
        showToast('Drafting follow-up\u2026', 'info');
        askBuddy('Draft a follow-up email for this opportunity based on the latest call.');
        break;
      case 'push-to-sf': {
        showToast('Pushing to Salesforce\u2026', 'info');
        // Simulate push
        btn.disabled = true;
        btn.style.opacity = '0.6';
        setTimeout(() => {
          showToast('\u2713 Pushed to Salesforce', 'success');
          btn.disabled = false;
          btn.style.opacity = '1';
        }, 1500);
        break;
      }
      case 'log-to-sf':
        showToast('Logging email to Salesforce\u2026', 'info');
        break;
      case 'draft-connection':
        askBuddy('Draft a LinkedIn connection note for this person based on their profile and any CRM data.');
        break;
      case 'research-account':
        askBuddy('Research this person\'s company and give me a brief account overview.');
        break;
      case 'recent':
        askBuddy('Show me recent activity across my deals.');
        break;
      case 'draft-email':
        askBuddy('Help me draft an email.');
        break;
      case 'lookup-account':
        askBuddy('Look up an account for me.');
        break;
      case 'lookup-selected': {
        const text = btn.getAttribute('data-text');
        askBuddy(`Look up "${text}" in our CRM and give me context.`);
        break;
      }
      default:
        showToast('Action coming soon', 'info');
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  ASK BUDDY (inline chat)
  // ══════════════════════════════════════════════════════════════

  async function askBuddy(question) {
    const body = shadowRoot?.getElementById('vt-body');
    if (!body) return;

    // User message
    const userMsg = document.createElement('div');
    userMsg.className = 'vt-chat-msg vt-chat-user';
    userMsg.textContent = question;
    body.appendChild(userMsg);

    // Thinking message
    const thinkingMsg = document.createElement('div');
    thinkingMsg.className = 'vt-chat-msg vt-chat-buddy';
    thinkingMsg.textContent = 'thinking\u2026';
    thinkingMsg.id = 'vt-thinking';
    body.appendChild(thinkingMsg);
    body.scrollTop = body.scrollHeight;

    if (useMockData) {
      // Simulate response
      setTimeout(() => {
        const t = shadowRoot?.getElementById('vt-thinking');
        if (t) {
          t.id = '';
          t.textContent = 'I\'d be happy to help with that. Let me pull up the relevant context from your CRM and recent calls. (This is a mock response \u2014 connect to the server for real AI answers.)';
        }
        body.scrollTop = body.scrollHeight;
      }, 1200);
      return;
    }

    try {
      const data = await serverFetch('/api/chat', {
        message: question,
        profile: { userName: 'User' },
        role: 'Sales',
        history: [],
      });
      const thinking = shadowRoot?.getElementById('vt-thinking');
      if (thinking) {
        thinking.id = '';
        thinking.textContent = data?.reply || 'hmm, couldn\'t get an answer.';
      }
    } catch (_) {
      const thinking = shadowRoot?.getElementById('vt-thinking');
      if (thinking) {
        thinking.id = '';
        thinking.textContent = 'can\'t reach buddy right now.';
      }
    }
    body.scrollTop = body.scrollHeight;
  }

  // ══════════════════════════════════════════════════════════════
  //  CALL LISTENING (Google Meet)
  //  Preserved from original with sidebar integration
  // ══════════════════════════════════════════════════════════════

  let _callActive = false;
  let _transcriptBuffer = '';
  let _transcriptHistory = [];
  let _lastTranscriptSend = 0;
  let _callObserver = null;
  let _triggerCards = [];
  let _lastCaptionText = '';
  let _callPeriodicCheck = null;

  function startCallListener() {
    if (_callActive) return;
    _callActive = true;
    _transcriptBuffer = '';
    _transcriptHistory = [];
    _triggerCards = [];

    console.log('[vibetran] Call listener started');

    // Update FAB to show listening state
    updateFABListening(true);

    // Watch for caption elements via MutationObserver
    _callObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const captionText = extractCaptionText(node);
            if (captionText) {
              _transcriptBuffer += ' ' + captionText;
              _transcriptHistory.push({
                text: captionText,
                timestamp: Date.now(),
              });
            }
          }
        }
      }

      // Send buffer to server every 5 seconds
      if (Date.now() - _lastTranscriptSend > 5000 && _transcriptBuffer.trim()) {
        sendTranscriptChunk(_transcriptBuffer.trim());
        _transcriptBuffer = '';
        _lastTranscriptSend = Date.now();
      }
    });

    _callObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Periodic caption scan — multiple strategies for Meet's changing DOM
    _callPeriodicCheck = setInterval(() => {
      let captionText = '';

      const strategies = [
        // Strategy 1: Known Google Meet caption selectors
        () => {
          const els = document.querySelectorAll('.a4cQT, .iOzk7, .TBMuR, [jscontroller="D1tHje"]');
          return [...els].map(e => e.textContent?.trim()).filter(t => t && t.length > 2).join(' ');
        },
        // Strategy 2: elements with data-speaker-id
        () => {
          const els = document.querySelectorAll('[data-speaker-id]');
          return [...els].map(e => e.textContent?.trim()).filter(t => t && t.length > 2).join(' ');
        },
        // Strategy 3: Scan bottom 30% of page for text containers that change
        () => {
          const viewH = window.innerHeight;
          const cutoff = viewH * 0.65;
          const allDivs = document.querySelectorAll('div[class], span[class]');
          const bottomTexts = [];
          for (const div of allDivs) {
            const rect = div.getBoundingClientRect();
            if (rect.top > cutoff && rect.height > 15 && rect.height < 200) {
              const t = div.textContent?.trim();
              if (t && t.length > 10 && t.length < 500 && t.includes(' ') && !t.includes('Present') && !t.includes('Mute')) {
                bottomTexts.push(t);
              }
            }
          }
          return bottomTexts.join(' ');
        },
      ];

      for (const strategy of strategies) {
        try {
          captionText = strategy();
          if (captionText && captionText.length > 5) break;
        } catch (_) { /* try next */ }
      }

      if (captionText && captionText !== _lastCaptionText && captionText.length > 5) {
        console.log('[vibetran] Caption captured:', captionText.substring(0, 80));
        _lastCaptionText = captionText;
        _transcriptBuffer += ' ' + captionText;
        _transcriptHistory.push({ text: captionText, timestamp: Date.now() });
      }

      // Send buffer to server every 5 seconds
      if (Date.now() - _lastTranscriptSend > 5000 && _transcriptBuffer.trim()) {
        console.log('[vibetran] Sending transcript chunk:', _transcriptBuffer.trim().substring(0, 60));
        sendTranscriptChunk(_transcriptBuffer.trim());
        _transcriptBuffer = '';
        _lastTranscriptSend = Date.now();
      }
    }, 2000);
  }

  function extractCaptionText(node) {
    const selectors = ['.TBMuR', '.iOzk7', '[data-speaker-id]', 'span'];
    for (const sel of selectors) {
      const el = node.matches?.(sel) ? node : node.querySelector?.(sel);
      if (el?.textContent?.trim()) {
        return el.textContent.trim();
      }
    }
    if (node.textContent?.trim()?.length > 3 && node.textContent.trim().length < 500) {
      return node.textContent.trim();
    }
    return null;
  }

  function stopCallListener() {
    _callActive = false;
    _callObserver?.disconnect();
    _callObserver = null;
    if (_callPeriodicCheck) clearInterval(_callPeriodicCheck);
    _callPeriodicCheck = null;
    updateFABListening(false);
    console.log('[vibetran] Call listener stopped');

    if (_transcriptHistory.length > 0) {
      generatePostCallSummary();
    }
  }

  function updateFABListening(isListening) {
    if (!fabEl) return;
    if (isListening) {
      fabEl.classList.add('vibetran-fab-listening');
      const inner = fabEl.querySelector('#vibetran-fab-inner');
      if (inner && !inner.querySelector('.vibetran-fab-pulse-ring')) {
        const ring = document.createElement('div');
        ring.className = 'vibetran-fab-pulse-ring';
        inner.appendChild(ring);
      }
    } else {
      fabEl.classList.remove('vibetran-fab-listening');
      fabEl.querySelector('.vibetran-fab-pulse-ring')?.remove();
    }
  }

  async function sendTranscriptChunk(chunk) {
    if (useMockData) return; // Skip in mock mode

    try {
      const data = await serverFetch('/api/call/transcript', { chunk });

      if (data?.ok && data.triggers?.length > 0) {
        data.triggers.forEach(trigger => {
          _triggerCards.push(trigger);
          showTriggerCardInSidebar(trigger);
        });
        showFABBadge(_triggerCards.length);
      }
    } catch (_) {
      console.log('[vibetran] Could not send transcript chunk');
    }
  }

  function showTriggerCardInSidebar(trigger) {
    if (!shadowRoot) return;

    const container = shadowRoot.getElementById('vt-triggers-container');
    const label = shadowRoot.getElementById('vt-triggers-label');
    if (!container) return;
    if (label) label.style.display = 'flex';

    const typeIcons = {
      competitor: '\u2694\uFE0F',
      objection: '\uD83D\uDEE1\uFE0F',
      pricing: '\uD83D\uDCB0',
      technical: '\uD83D\uDD27',
      champion: '\u2B50',
      blocker: '\uD83D\uDEAB',
      next_step: '\u27A1\uFE0F',
    };

    const typeColors = {
      competitor: '#E8634A',
      objection: '#D4941A',
      pricing: '#2A9D8F',
      technical: '#5A67D8',
      champion: '#C8F031',
      blocker: '#E8634A',
      next_step: '#2A9D8F',
    };

    const card = document.createElement('div');
    card.className = 'vt-trigger-card';
    card.style.borderLeftColor = typeColors[trigger.type] || '#8A7E6B';
    const safeResponse = escapeHtml(trigger.response_card || '');
    card.innerHTML = `
      <div class="vt-trigger-header">
        <span style="font-size:0.9rem;">${typeIcons[trigger.type] || '\uD83D\uDCA1'}</span>
        <span class="vt-trigger-type">${escapeHtml(trigger.type)}</span>
        <span class="vt-trigger-keyword">${escapeHtml(trigger.keyword || '')}</span>
      </div>
      ${trigger.quote ? `<div class="vt-trigger-quote">"${escapeHtml(trigger.quote)}"</div>` : ''}
      <div class="vt-trigger-response">${safeResponse}</div>
      <button class="vt-btn" data-action="copy" data-text="${safeResponse}">\uD83D\uDCCB Copy</button>
    `;

    container.insertBefore(card, container.firstChild);

    // Bind copy button
    card.querySelector('[data-action="copy"]')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const text = decodeHtmlEntities(e.currentTarget.getAttribute('data-text') || '');
      await copyToClipboard(text);
      e.currentTarget.classList.add('vt-btn-success');
      e.currentTarget.textContent = '\u2713';
      setTimeout(() => {
        e.currentTarget.classList.remove('vt-btn-success');
        e.currentTarget.textContent = '\uD83D\uDCCB Copy';
      }, 1500);
    });

    // Scroll to show card
    const body = shadowRoot.getElementById('vt-body');
    if (body) body.scrollTop = 0;
  }

  async function generatePostCallSummary() {
    const fullTranscript = _transcriptHistory.map(t => t.text).join(' ');
    if (fullTranscript.length < 50) return;

    if (useMockData) {
      // Show mock summary in sidebar
      if (!sidebarOpen) openSidebar();
      setTimeout(() => {
        const summaryContainer = shadowRoot?.getElementById('vt-summary-container');
        const summaryLabel = shadowRoot?.getElementById('vt-summary-label');
        if (summaryContainer && summaryLabel) {
          summaryLabel.style.display = 'flex';
          summaryContainer.innerHTML = `
            <div class="vt-call-summary">
              <div class="vt-call-summary-content">Call ended. Transcript captured (${_transcriptHistory.length} segments).\n\nConnect to the server for AI-generated post-call summary with MEDDPICC extraction.</div>
              <div class="vt-call-summary-actions">
                <button class="vt-btn" data-action="copy" data-text="Call summary placeholder">\uD83D\uDCCB Copy all</button>
              </div>
            </div>
          `;
          bindAllButtons(summaryContainer);
        }
      }, 500);
      return;
    }

    try {
      const data = await serverFetch('/api/call/summary', { transcript: fullTranscript });

      if (data?.ok && data.summary) {
        if (!sidebarOpen) openSidebar();

        setTimeout(() => {
          const summaryContainer = shadowRoot?.getElementById('vt-summary-container');
          const summaryLabel = shadowRoot?.getElementById('vt-summary-label');
          if (summaryContainer && summaryLabel) {
            summaryLabel.style.display = 'flex';
            const safeSummary = escapeHtml(data.summary);
            summaryContainer.innerHTML = `
              <div class="vt-call-summary">
                <div class="vt-call-summary-content">${safeSummary.replace(/\n/g, '<br>')}</div>
                <div class="vt-call-summary-actions">
                  <button class="vt-btn" data-action="copy" data-text="${safeSummary}">\uD83D\uDCCB Copy all</button>
                  <button class="vt-action-btn" data-action="quick" data-type="push-to-sf"><span class="vt-action-icon">\u2601\uFE0F</span> Push to SF</button>
                </div>
              </div>
            `;
            bindAllButtons(summaryContainer);
          }
        }, 500);
      }

      serverFetch('/api/call/end', {});
    } catch (_) {
      console.log('[vibetran] Could not generate post-call summary');
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  INIT & LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  async function checkContext() {
    console.log('[vibetran] checkContext running on', window.location.hostname);

    createFAB();
    console.log('[vibetran] FAB created');

    const ctx = detectPageContext();
    console.log('[vibetran] Page context:', ctx.platform, ctx.type);

    // On known work pages, show badge
    if (ctx.platform !== 'other') {
      showFABBadge(1);
      try {
        chrome.runtime?.sendMessage({ type: 'SET_BADGE', count: 1 }).catch(() => {});
      } catch (_) { /* extension context may be invalidated */ }
    }

    // On generic pages, make FAB more subtle
    if (ctx.platform === 'other' && fabEl) {
      fabEl.style.opacity = '0.5';
      fabEl.addEventListener('mouseenter', () => { fabEl.style.opacity = '1'; });
      fabEl.addEventListener('mouseleave', () => {
        if (!sidebarOpen) fabEl.style.opacity = '0.5';
      });
    }

    // Google Meet call detection
    if (ctx.platform === 'meet') {
      if (fabEl) fabEl.style.opacity = '1';

      // Start listening after a delay to let the call load
      setTimeout(() => {
        startCallListener();
      }, 3000);

      // Detect when call ends → queue autopilot
      const meetTitle = ctx.title;
      const checkCallEnd = setInterval(() => {
        if (!window.location.hostname.includes('meet.google.com')) {
          clearInterval(checkCallEnd);
          stopCallListener();
          // Queue post-call Salesforce automation
          queuePostCallAutomation(meetTitle);
        }
      }, 5000);
    }

    // Check for pending autopilot fill (from a previous navigation)
    if (ctx.platform === 'salesforce') {
      checkForPendingFill();
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  SALESFORCE AUTOPILOT ENGINE
  //  Post-call: extract fields from Gong → fill SF opp automatically
  // ══════════════════════════════════════════════════════════════

  // Track pending post-call automations
  let _pendingAutomations = []; // [{ accountName, callEndTime }]
  let _automationInterval = null;

  // Called when a Google Meet call ends — queue the account for automation
  function queuePostCallAutomation(meetingTitle) {
    // Extract account name from meeting title (e.g., "USAA / Fivetran Sync" → "USAA")
    const accountName = meetingTitle?.split(/[\/\-–—]/)?.[0]?.trim();
    if (!accountName || accountName.length < 2) return;

    console.log(`[autopilot] Queued post-call automation for: ${accountName}`);
    _pendingAutomations.push({ accountName, callEndTime: Date.now() });
    showToast(`Call ended — I'll update Salesforce for ${accountName} when Gong is ready`, 'info');

    // Start polling if not already running
    if (!_automationInterval) {
      _automationInterval = setInterval(checkPendingAutomations, 2 * 60 * 60 * 1000); // every 2 hours
      // Also do a first check after 30 min (Gong processing time)
      setTimeout(checkPendingAutomations, 30 * 60 * 1000);
    }
  }

  async function checkPendingAutomations() {
    if (_pendingAutomations.length === 0) {
      clearInterval(_automationInterval);
      _automationInterval = null;
      return;
    }

    for (let i = _pendingAutomations.length - 1; i >= 0; i--) {
      const auto = _pendingAutomations[i];
      // Skip if older than 24 hours
      if (Date.now() - auto.callEndTime > 24 * 60 * 60 * 1000) {
        _pendingAutomations.splice(i, 1);
        continue;
      }

      try {
        // Check if Gong transcript is ready
        const pollRes = await fetch(`${serverBase}/api/gong/poll?account=${encodeURIComponent(auto.accountName)}`);
        const pollData = await pollRes.json();

        if (pollData?.ok && pollData?.ready) {
          console.log(`[autopilot] Gong transcript ready for ${auto.accountName}`);
          _pendingAutomations.splice(i, 1);

          // Extract SF fields from the call
          const extractRes = await fetch(`${serverBase}/api/sf/extract-fields`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountName: auto.accountName }),
          });
          const extractData = await extractRes.json();

          if (extractData?.ok && extractData?.fields) {
            // Run the full automation
            await runPostCallAutomation(auto.accountName, extractData);
          } else {
            showToast(`Couldn't extract fields for ${auto.accountName}`, 'error');
          }
        }
      } catch (e) {
        console.log(`[autopilot] Poll failed for ${auto.accountName}:`, e.message);
      }
    }
  }

  async function runPostCallAutomation(accountName, extractData) {
    const fields = extractData.fields || {};
    console.log(`[autopilot] Running automation for ${accountName} with ${Object.keys(fields).length} fields`);

    // Check if we're already on a Salesforce opp page for this account
    const ctx = detectPageContext();
    const isOnSfOpp = ctx.platform === 'salesforce' &&
      (ctx.type === 'opportunity' || ctx.type === 'account') &&
      ctx.title?.toLowerCase().includes(accountName.toLowerCase());

    if (isOnSfOpp) {
      // Already on the right page — just fill fields
      await fillSalesforceFields(fields);
      return;
    }

    // Try to find an existing opp first
    try {
      const findRes = await fetch(`${serverBase}/api/sf/find-opp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName }),
      });
      const findData = await findRes.json();

      if (findData?.found && findData?.opps?.length > 0 && findData.opps[0].url) {
        // Navigate to existing opp
        showToast(`Found existing opp for ${accountName} — opening...`, 'info');
        window.location.href = findData.opps[0].url;
        // Fields will be filled after page load via checkForPendingFill
        localStorage.setItem('buddy_pending_fill', JSON.stringify({ accountName, fields, timestamp: Date.now() }));
        return;
      }
    } catch (e) {
      console.log('[autopilot] find-opp failed:', e.message);
    }

    // No existing opp — check if we're on a Contact page to create one
    if (ctx.platform === 'salesforce' && ctx.type === 'contact') {
      await clickCreateExpansionOpp(fields);
    } else {
      // Store fields for later and notify user
      localStorage.setItem('buddy_pending_fill', JSON.stringify({ accountName, fields, timestamp: Date.now() }));
      showToast(`Ready to fill ${accountName} opp — navigate to their Salesforce page`, 'info');
    }
  }

  async function clickCreateExpansionOpp(fields) {
    // Find and click "Create Expansion Opportunity" button
    const buttons = document.querySelectorAll('button, a, [role="button"]');
    let createBtn = null;
    for (const btn of buttons) {
      if (btn.textContent?.includes('Create Expansion Opportunity')) {
        createBtn = btn;
        break;
      }
    }

    if (!createBtn) {
      showToast('Could not find "Create Expansion Opportunity" button', 'error');
      return;
    }

    createBtn.click();
    showToast('Opening expansion opportunity form...', 'info');

    // Wait for modal to appear
    await waitForElement('[role="dialog"], .modal-container, .slds-modal', 5000);
    await delay(500); // Let modal fully render

    // Fill the modal fields
    await fillModalFields(fields);
  }

  async function fillModalFields(fields) {
    const modal = document.querySelector('[role="dialog"], .modal-container, .slds-modal');
    if (!modal) {
      showToast('Modal not found — fill manually', 'error');
      return;
    }

    let filled = 0;
    const fieldMap = {
      'Opportunity Name': fields['Opportunity Name'],
      'Pre-Qualification Sources': fields['Pre-Qualification Sources'],
      'Pre-Qualification Destinations': fields['Pre-Qualification Destinations'],
      'Pre-Qualification Business Challenge': fields['Pre-Qualification Business Challenge'],
      'Pre-Qualification Notes': fields['Pre-Qualification Notes'],
      'Next Steps': fields['Next Steps'],
      'Disco Meeting Date': fields['Disco Meeting Date'],
      'Disco Meeting Contacts': fields['Disco Meeting Contacts'],
    };

    for (const [label, value] of Object.entries(fieldMap)) {
      if (!value) continue;
      try {
        const input = findModalFieldByLabel(modal, label);
        if (input) {
          setInputValue(input, value);
          filled++;
        }
      } catch (e) {
        console.log(`[autopilot] Failed to fill "${label}":`, e.message);
      }
    }

    // Handle Products Being Pitched dual-list — always select "Fivetran Saas"
    try {
      const listItems = modal.querySelectorAll('[role="option"], option, .slds-dueling-list__options li');
      for (const item of listItems) {
        if (item.textContent?.includes('Fivetran Saas')) {
          item.click();
          await delay(200);
          // Click the move-right arrow
          const moveBtn = modal.querySelector('[title="Move selection to Chosen"], .slds-button_icon-container[title*="right"], button[aria-label*="right"], button[aria-label*="Move"]');
          if (moveBtn) moveBtn.click();
          filled++;
          break;
        }
      }
    } catch (e) {
      console.log('[autopilot] Products Being Pitched selection failed:', e.message);
    }

    // Click Save
    await delay(300);
    const saveBtn = modal.querySelector('button[title="Save"], button.slds-button_brand');
    if (!saveBtn) {
      // Try finding Save button by text
      const allBtns = modal.querySelectorAll('button');
      for (const btn of allBtns) {
        if (btn.textContent?.trim() === 'Save') {
          btn.click();
          filled++;
          break;
        }
      }
    } else {
      saveBtn.click();
    }

    showToast(`Filled ${filled} fields and saved expansion opp`, 'success');
    console.log(`[autopilot] Filled ${filled} fields, clicked Save`);
  }

  function findModalFieldByLabel(modal, labelText) {
    // Strategy 1: find <label> with matching text, then associated input
    const labels = modal.querySelectorAll('label, .slds-form-element__label');
    for (const label of labels) {
      if (label.textContent?.trim().includes(labelText)) {
        // Check for 'for' attribute
        const forId = label.getAttribute('for');
        if (forId) {
          const input = modal.querySelector(`#${CSS.escape(forId)}`);
          if (input) return input;
        }
        // Check sibling/parent for input
        const container = label.closest('.slds-form-element, .form-element, [class*="form"]');
        if (container) {
          const input = container.querySelector('input, textarea, select');
          if (input) return input;
        }
      }
    }
    // Strategy 2: find input by placeholder or aria-label
    const inputs = modal.querySelectorAll('input, textarea');
    for (const input of inputs) {
      if (input.placeholder?.includes(labelText) || input.getAttribute('aria-label')?.includes(labelText)) {
        return input;
      }
    }
    return null;
  }

  function setInputValue(input, value) {
    if (input.tagName === 'SELECT') {
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (input.isContentEditable || input.getAttribute('contenteditable') === 'true') {
      input.textContent = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // Native input/textarea
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, value);
      } else {
        input.value = value;
      }
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  async function fillSalesforceFields(fields) {
    let filled = 0;
    for (const [label, value] of Object.entries(fields)) {
      if (!value || typeof value !== 'string') continue;
      try {
        insertIntoSalesforceField(label, value);
        filled++;
        await delay(200); // Brief pause between fields
      } catch (e) {
        console.log(`[autopilot] Failed to fill "${label}":`, e.message);
      }
    }
    showToast(`Filled ${filled} fields on this opp`, 'success');
  }

  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => { observer.disconnect(); resolve(null); }, timeout);
    });
  }

  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // Check for pending fill on page load (when navigated from autopilot)
  function checkForPendingFill() {
    try {
      const pending = localStorage.getItem('buddy_pending_fill');
      if (!pending) return;

      const data = JSON.parse(pending);
      // Only process if recent (within 5 minutes)
      if (Date.now() - data.timestamp > 5 * 60 * 1000) {
        localStorage.removeItem('buddy_pending_fill');
        return;
      }

      const ctx = detectPageContext();
      if (ctx.platform === 'salesforce' && ctx.title?.toLowerCase().includes(data.accountName.toLowerCase())) {
        localStorage.removeItem('buddy_pending_fill');
        console.log(`[autopilot] Found pending fill for ${data.accountName}`);
        setTimeout(() => fillSalesforceFields(data.fields), 2000); // Wait for SF page to fully load
      }
    } catch (e) {
      console.log('[autopilot] checkForPendingFill error:', e.message);
    }
  }

  // Listen for toggle messages from background script
  try {
    chrome.runtime?.onMessage?.addListener((msg) => {
      if (msg.type === 'TOGGLE_PANEL') toggleSidebar();
    });
  } catch (_) { /* context may be invalidated */ }

  // Init — wait a beat for page to settle
  setTimeout(checkContext, 1500);

  // Re-check on URL changes (for SPAs like Salesforce, Gmail)
  let lastUrl = window.location.href;
  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      // Close sidebar on navigation
      if (sidebarOpen) closeSidebar();
      showFABBadge(0);
      setTimeout(checkContext, 1000);
    }
  });

  if (document.body) {
    urlObserver.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      urlObserver.observe(document.body, { childList: true, subtree: true });
    });
  }

})();
