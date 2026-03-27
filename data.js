// ════════════════════════════════════════════════════════
// FIVETRAN AI — ROLE DATA
// All roles, focus areas, and action cards by category
// ════════════════════════════════════════════════════════

const ROLE_DATA = {
  sales: {
    name: 'Sales',
    icon: '💼',
    desc: 'Your deals, your accounts, your calls — not the forecast spreadsheet',
    subroles: ['Account Executive', 'BDR/SDR', 'Solutions Engineer', 'Enterprise AE', 'Sales Manager', 'CSM'],
    focusAreas: [
      {
        id: 'my-deals', name: 'My Deals', icon: '💰',
        desc: 'Your pipeline, your opps, your close plan',
        actions: [
          { title: 'Show my open pipeline this quarter', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], top: true },
          { title: 'Which of my deals haven\'t been updated in ___ days?', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], template: [{slot: 'days', placeholder: '14', options: ['7','14','21','30']}], top: true },
          { title: 'What\'s blocking my ___ deal?', category: 'question', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], template: [{slot: 'account name', placeholder: 'e.g. Okta, Amplify Life'}], top: true },
          { title: 'Push MEDDPICC + next steps to Salesforce from my last call', category: 'action', type: 'act', meta: 'Gong + Salesforce', tags: ['gong','salesforce'], top: true },
          { title: 'Generate a close plan for ___', category: 'generator', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], template: [{slot: 'deal/account', placeholder: 'e.g. Okta expansion'}] },
        ]
      },
      {
        id: 'my-accounts', name: 'My Accounts', icon: '🏢',
        desc: 'Deep context on the accounts you own',
        actions: [
          { title: 'Full account brief for ___', category: 'question', type: 'ask', meta: 'Salesforce + Gong + Zendesk', tags: ['salesforce','gong','zendesk'], template: [{slot: 'account name', placeholder: 'e.g. Okta'}], top: true },
          { title: 'What are customers at ___ saying about us?', category: 'question', type: 'ask', meta: 'Gong + Zendesk', tags: ['gong','zendesk'], template: [{slot: 'account', placeholder: 'e.g. USAA'}], top: true },
          { title: 'Open support tickets for ___', category: 'question', type: 'ask', meta: 'Zendesk', tags: ['zendesk'], template: [{slot: 'account', placeholder: 'e.g. Amplify Life'}], top: true },
          { title: 'Which competitors came up in calls with ___?', category: 'question', type: 'ask', meta: 'Gong', tags: ['gong'], template: [{slot: 'account', placeholder: 'e.g. Okta'}] },
          { title: 'Enrich ___ with latest firmographic data', category: 'action', type: 'act', meta: 'Salesforce + Clearbit', tags: ['salesforce'], template: [{slot: 'account or list', placeholder: 'account name or paste list'}] },
        ]
      },
      {
        id: 'my-calls', name: 'My Calls', icon: '🎧',
        desc: 'Prep for upcoming, review past, follow up',
        actions: [
          { title: 'Prep me for my call with ___', category: 'question', type: 'ask', meta: 'Salesforce + Gong + Zendesk', tags: ['salesforce','gong','zendesk'], template: [{slot: 'account or person', placeholder: 'e.g. Tyler at Amplify Life'}], top: true },
          { title: 'What happened in my last call with ___?', category: 'question', type: 'ask', meta: 'Gong', tags: ['gong'], template: [{slot: 'account', placeholder: 'e.g. Okta'}], top: true },
          { title: 'Draft a follow-up email from my ___ call', category: 'generator', type: 'ask', meta: 'Gong + Salesforce', tags: ['gong','salesforce'], template: [{slot: 'account', placeholder: 'e.g. USAA discovery call'}], top: true },
          { title: 'What objections came up and how should I handle them?', category: 'question', type: 'ask', meta: 'Gong', tags: ['gong'], top: true },
          { title: 'Auto-fill Salesforce after every Gong call', category: 'automation', type: 'auto', meta: 'Gong + Salesforce', tags: ['gong','salesforce'] },
        ]
      },
      {
        id: 'prospecting', name: 'Prospecting', icon: '🎯',
        desc: 'Find new accounts, research targets, build outreach',
        actions: [
          { title: 'Which accounts in my territory haven\'t been contacted?', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], top: true },
          { title: 'What are customers saying about ___?', category: 'question', type: 'ask', meta: 'Gong + Zendesk', tags: ['gong','zendesk'], template: [{slot: 'topic, competitor, or feature', placeholder: 'e.g. Airbyte, connector SDK, pricing'}], top: true },
          { title: 'Draft a cold email to ___ at ___', category: 'generator', type: 'ask', meta: 'Salesforce + LinkedIn', tags: ['salesforce'], template: [{slot: 'person', placeholder: 'e.g. VP of Data'}, {slot: 'company', placeholder: 'e.g. Stripe'}] },
          { title: 'Enrich my prospect spreadsheet', category: 'action', type: 'act', meta: 'Salesforce', tags: ['salesforce'], top: true },
        ]
      },
      {
        id: 'learn-find', name: 'Learn & Find', icon: '🔍',
        desc: 'Internal knowledge, product info, competitive intel',
        actions: [
          { title: 'How does ___ work?', category: 'question', type: 'ask', meta: 'Slab + Docs', tags: ['slab','docs'], template: [{slot: 'product, feature, or process', placeholder: 'e.g. connector SDK, HVR migration'}], top: true },
          { title: 'What tables does the ___ connector sync?', category: 'question', type: 'ask', meta: 'Fivetran schema API', tags: ['fivetran'], template: [{slot: 'connector', placeholder: 'e.g. Salesforce, HubSpot'}], top: true },
          { title: 'Find customer evidence for ___', category: 'question', type: 'ask', meta: 'Gong + Zendesk + Salesforce', tags: ['gong','zendesk','salesforce'], template: [{slot: 'feature or use case', placeholder: 'e.g. real-time sync, security compliance'}] },
          { title: 'What\'s the competitive positioning against ___?', category: 'question', type: 'ask', meta: 'Slab + Gong', tags: ['slab','gong'], template: [{slot: 'competitor', placeholder: 'e.g. Airbyte, Stitch, Matillion'}] },
          { title: 'Search internal knowledge for ___', category: 'question', type: 'ask', meta: 'Slab + Docs', tags: ['slab','docs'], template: [{slot: 'anything', placeholder: 'type your question'}] },
        ]
      },
      {
        id: 'outbounding', name: 'Outbounding', icon: '📧',
        desc: 'Prospecting, sequences, cold outreach, territory mining',
        actions: [
          { title: 'Which accounts in my territory have never been contacted?', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Show me companies matching our ICP that are not in Salesforce yet', category: 'question', type: 'ask', meta: 'Clearbit + Salesforce', tags: ['clearbit','salesforce'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Which inbound leads have not been followed up within 24 hours?', category: 'question', type: 'ask', meta: 'Salesforce + Marketo', tags: ['salesforce','marketo'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Auto-add high-intent accounts to my outbound sequence weekly', category: 'automation', type: 'auto', meta: 'Bombora + Outreach + Salesforce', tags: ['bombora','outreach','salesforce'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Enrich all new leads with firmographic and technographic data', category: 'action', type: 'act', meta: 'Clearbit + Salesforce', tags: ['clearbit','salesforce'], multi: true, semantic: false, top: false, rising: true },
          { title: 'Generate personalized cold outreach email for a target account', category: 'generator', type: 'ask', meta: 'Salesforce + Clearbit + LinkedIn', tags: ['salesforce','clearbit','linkedin'], multi: true, semantic: true, top: true, rising: true },
        ]
      },
      {
        id: 'forecast-pipeline', name: 'Forecast & Pipeline', icon: '📊',
        desc: 'Quota tracking, commit deals, pipeline coverage, deal velocity',
        actions: [
          { title: 'What is my current forecast vs quota this quarter?', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Which commit deals have had no activity in 14+ days?', category: 'question', type: 'ask', meta: 'Salesforce + Outreach', tags: ['salesforce','outreach'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Show me deals that slipped from last quarter and are still open', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Push forecast summary to my manager in Slack every Monday', category: 'automation', type: 'auto', meta: 'Salesforce + Slack', tags: ['salesforce','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate pipeline coverage report with commit, best case, and upside', category: 'generator', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: false, top: true, rising: false },
        ]
      },
      {
        id: 'account-research', name: 'Account Research', icon: '🔍',
        desc: 'Account intel, stakeholder mapping, competitive intel, buying signals',
        actions: [
          { title: 'Which accounts are showing intent signals this week?', category: 'question', type: 'ask', meta: 'Bombora + Salesforce', tags: ['bombora','salesforce'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Which accounts had a champion leave in the last 60 days?', category: 'question', type: 'ask', meta: 'Salesforce + LinkedIn', tags: ['salesforce','linkedin'], multi: true, semantic: true, top: false, rising: true },
          { title: 'What competitors are showing up in my deals and what is our win rate?', category: 'question', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Generate a full account dossier with org chart, tech stack, and news', category: 'generator', type: 'ask', meta: 'Salesforce + Clearbit + LinkedIn', tags: ['salesforce','clearbit','linkedin'], multi: true, semantic: true, top: true, rising: true },
          { title: 'Daily alert when a target account publishes a job posting or press release', category: 'automation', type: 'auto', meta: 'LinkedIn + Salesforce', tags: ['linkedin','salesforce'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'email-comms', name: 'Email & Comms', icon: '✉️',
        desc: 'Follow-up drafts, intro emails, proposals, meeting recaps',
        actions: [
          { title: 'Draft a follow-up email based on my last Gong call with this account', category: 'generator', type: 'ask', meta: 'Gong + Salesforce', tags: ['gong','salesforce'], multi: true, semantic: true, top: true, rising: true },
          { title: 'Generate an executive intro email for a multi-threaded deal', category: 'generator', type: 'ask', meta: 'Salesforce + LinkedIn', tags: ['salesforce','linkedin'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Which deals have no follow-up email sent within 48 hours of last meeting?', category: 'question', type: 'ask', meta: 'Outreach + Gong + Salesforce', tags: ['outreach','gong','salesforce'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Draft a proposal summary email pulling in deal terms and ROI', category: 'generator', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], multi: true, semantic: true, top: false, rising: true },
          { title: 'Auto-send meeting recap to attendees after every Gong call', category: 'automation', type: 'auto', meta: 'Gong + Outreach', tags: ['gong','outreach'], multi: true, semantic: true, top: true, rising: false },
        ]
      },
      {
        id: 'meeting-prep', name: 'Meeting Prep', icon: '📋',
        desc: 'Call prep, agenda generation, talking points, previous call summary',
        actions: [
          { title: 'Summarize the last 3 Gong calls for this account', category: 'question', type: 'ask', meta: 'Gong', tags: ['gong'], multi: false, semantic: true, top: true, rising: false },
          { title: 'What open support tickets does this account have right now?', category: 'question', type: 'ask', meta: 'Zendesk + Salesforce', tags: ['zendesk','salesforce'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate a call prep doc with account context, risks, and talking points', category: 'generator', type: 'ask', meta: 'Salesforce + Gong + Zendesk', tags: ['salesforce','gong','zendesk'], multi: true, semantic: true, top: true, rising: true },
          { title: 'What objections came up in the last call and how should I address them?', category: 'question', type: 'ask', meta: 'Gong', tags: ['gong'], multi: false, semantic: true, top: true, rising: false },
          { title: 'Generate a meeting agenda based on deal stage and open items', category: 'generator', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'deal-progression', name: 'Deal Progression', icon: '🚀',
        desc: 'Next steps, blockers, multi-threading, close plans',
        actions: [
          { title: 'Which of my deals are single-threaded and at risk?', category: 'question', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], multi: true, semantic: true, top: true, rising: true },
          { title: 'What are the top blockers across my open pipeline right now?', category: 'question', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Push deal next steps into Salesforce after each Gong call', category: 'action', type: 'act', meta: 'Gong + Salesforce', tags: ['gong','salesforce'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Generate a mutual close plan for a late-stage deal', category: 'generator', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], multi: true, semantic: true, top: true, rising: true },
          { title: 'Flag deals stuck in the same stage for 3+ weeks to Slack', category: 'automation', type: 'auto', meta: 'Salesforce + Slack', tags: ['salesforce','slack'], multi: true, semantic: false, top: true, rising: false },
        ]
      },
    ]
  },

  product: {
    name: 'Product',
    icon: '🎯',
    desc: 'Your features, your customers, your roadmap — powered by Fivetran AI',
    subroles: ['Product Manager', 'Product Lead', 'Product Analyst', 'Technical PM'],
    focusAreas: [
      {
        id: 'my-features', name: 'My Features', icon: '🧩',
        desc: 'Usage, adoption, and customer feedback for features you own',
        actions: [
          { title: 'How is ___ being adopted since launch?', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'feature', placeholder: 'e.g. connector SDK, HVR, transformations'}], top: true },
          { title: 'What are customers saying about ___ on calls and tickets?', category: 'question', type: 'ask', meta: 'Gong + Zendesk (semantic)', tags: ['gong','zendesk'], template: [{slot: 'feature or product area', placeholder: 'e.g. schema drift, real-time sync'}], top: true },
          { title: 'How many customers are using ___ this ___?', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'feature', placeholder: 'e.g. transformations'}, {slot: 'time range', placeholder: 'month', options: ['week','month','quarter']}], top: true },
          { title: 'Are there new support tickets related to ___?', category: 'question', type: 'ask', meta: 'Zendesk (semantic)', tags: ['zendesk'], template: [{slot: 'recent release or feature', placeholder: 'e.g. v2 sync engine'}], top: true },
          { title: 'Feature usage correlated with renewal and expansion for ___', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL) + Salesforce', tags: ['fivetran-ai','salesforce'], template: [{slot: 'feature', placeholder: 'e.g. HVR, Connector SDK'}] },
          { title: 'Alert me when support tickets spike for ___', category: 'automation', type: 'auto', meta: 'Zendesk + Slack', tags: ['zendesk','slack'], template: [{slot: 'feature or connector', placeholder: 'e.g. Oracle CDC'}] },
        ]
      },
      {
        id: 'customer-voice', name: 'Customer Voice', icon: '🎤',
        desc: 'What customers are actually saying — from calls, tickets, and feedback',
        actions: [
          { title: 'Top customer pain themes in the last ___', category: 'question', type: 'ask', meta: 'Zendesk + Gong (semantic + AISQL)', tags: ['zendesk','gong','fivetran-ai'], template: [{slot: 'time range', placeholder: '30 days', options: ['7 days','30 days','this quarter']}], top: true },
          { title: 'Find customer evidence for ___ (calls + tickets + Jira)', category: 'question', type: 'ask', meta: 'Gong + Zendesk + Jira', tags: ['gong','zendesk','jira'], template: [{slot: 'feature request or pain point', placeholder: 'e.g. real-time sync, better error messages'}], top: true },
          { title: 'What ARR is behind customers asking for ___?', category: 'question', type: 'ask', meta: 'Gong + Zendesk + Salesforce', tags: ['gong','zendesk','salesforce'], template: [{slot: 'feature', placeholder: 'e.g. connector SDK improvements'}], top: true },
          { title: 'Which accounts are showing churn signals?', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL) + Zendesk + Salesforce', tags: ['fivetran-ai','zendesk','salesforce'], top: true },
          { title: 'What are customers saying about ___ vs competitors?', category: 'question', type: 'ask', meta: 'Gong (semantic)', tags: ['gong'], template: [{slot: 'competitor or topic', placeholder: 'e.g. Airbyte, pricing, ease of use'}] },
          { title: 'Generate a customer pain summary for my area', category: 'generator', type: 'ask', meta: 'Zendesk + Gong + Salesforce', tags: ['zendesk','gong','salesforce'], top: true },
        ]
      },
      {
        id: 'my-roadmap', name: 'My Roadmap', icon: '🗺️',
        desc: 'PRDs, business cases, prioritization evidence',
        actions: [
          { title: 'Build a business case for ___ with customer quotes and ARR', category: 'generator', type: 'ask', meta: 'Gong + Zendesk + Salesforce', tags: ['gong','zendesk','salesforce'], template: [{slot: 'feature or initiative', placeholder: 'e.g. real-time connectors, Iceberg support'}], top: true },
          { title: 'Review my PRD for ___', category: 'generator', type: 'ask', meta: 'PRD Framework', tags: ['prd'], template: [{slot: 'paste PRD or describe feature', placeholder: 'paste or describe your PRD'}], top: true },
          { title: 'Generate user stories for ___', category: 'generator', type: 'ask', meta: 'Gherkin format', tags: ['user-stories'], template: [{slot: 'feature or requirements', placeholder: 'describe the feature'}], top: true },
          { title: 'Which backlog items have been stuck 6+ months?', category: 'question', type: 'ask', meta: 'Jira', tags: ['jira'], top: true },
          { title: 'What are competitors shipping that we\'re missing?', category: 'question', type: 'ask', meta: 'Gong (semantic) + Slab', tags: ['gong','slab'], top: true },
          { title: 'How much R&D effort went into ___ this quarter?', category: 'question', type: 'ask', meta: 'Jira + Fivetran AI', tags: ['jira','fivetran-ai'], template: [{slot: 'team or product area', placeholder: 'e.g. SaaS Connectors, Growth'}] },
        ]
      },
      {
        id: 'my-metrics', name: 'My Metrics', icon: '📊',
        desc: 'ARR, churn, setup success, adoption — the numbers you own',
        actions: [
          { title: 'What\'s the ARR breakdown for ___?', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'product area', placeholder: 'e.g. databases, SaaS connectors, HVR'}], top: true },
          { title: 'Show ___ trend over the last ___', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'metric', placeholder: 'e.g. setup success rate, churn, MAR'}, {slot: 'time range', placeholder: '6 months', options: ['30 days','3 months','6 months','1 year']}], top: true },
          { title: 'Compare ___ across ___', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'metric', placeholder: 'e.g. activation rate'}, {slot: 'segments', placeholder: 'e.g. customer tiers, regions, product lines'}], top: true },
          { title: 'What changed in revenue for ___ this month?', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'product or segment', placeholder: 'e.g. database connectors, enterprise'}] },
          { title: 'Investigate churn for ___', category: 'question', type: 'ask', meta: 'Fivetran AI + Zendesk + Gong + Salesforce', tags: ['fivetran-ai','zendesk','gong','salesforce'], template: [{slot: 'account or segment', placeholder: 'e.g. Acme Corp, mid-market'}] },
          { title: 'Generate a QBR metrics summary for my product area', category: 'generator', type: 'ask', meta: 'Fivetran AI (AISQL) + Jira', tags: ['fivetran-ai','jira'], top: true },
        ]
      },
      {
        id: 'data-explore', name: 'Data & Explore', icon: '🔍',
        desc: 'Query anything — warehouse data, schemas, internal knowledge',
        actions: [
          { title: 'Run a query: ___', category: 'action', type: 'act', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'question in plain English or SQL', placeholder: 'e.g. weekly active connectors by type'}], top: true },
          { title: 'Find the right tables for ___', category: 'question', type: 'ask', meta: 'Fivetran AI (catalog)', tags: ['fivetran-ai'], template: [{slot: 'what you want to analyze', placeholder: 'e.g. customer usage, revenue by product'}], top: true },
          { title: 'How does ___ work internally?', category: 'question', type: 'ask', meta: 'Slab + Docs', tags: ['slab','docs'], template: [{slot: 'system or process', placeholder: 'e.g. sync scheduling, pricing engine'}], top: true },
          { title: 'Search internal knowledge for ___', category: 'question', type: 'ask', meta: 'Slab + Docs + Jira', tags: ['slab','docs','jira'], template: [{slot: 'anything', placeholder: 'type your question'}] },
          { title: 'Create a Fivetran-branded deck about ___', category: 'generator', type: 'ask', meta: 'Google Slides', tags: ['slides'], template: [{slot: 'topic', placeholder: 'e.g. Q1 product review, feature launch'}] },
          { title: 'File my expense report from receipts', category: 'action', type: 'act', meta: 'Coupa', tags: ['coupa'] },
        ]
      },
    ]
  },

  engineering: {
    name: 'Engineering',
    icon: '⚙️',
    desc: 'Your code, your services, your sprint — powered by Fivetran AI',
    subroles: ['Software Engineer', 'SRE', 'Engineering Manager', 'Staff Engineer'],
    focusAreas: [
      {
        id: 'my-code', name: 'My Code', icon: '💻',
        desc: 'Your PRs, reviews, deploys, and code quality',
        actions: [
          { title: 'Show my open PRs and who needs to review them', category: 'question', type: 'ask', meta: 'GitHub', tags: ['github'], top: true },
          { title: 'PRs waiting for my review right now', category: 'question', type: 'ask', meta: 'GitHub', tags: ['github'], top: true },
          { title: 'Did my last deploy to ___ break anything?', category: 'question', type: 'ask', meta: 'GitHub + Fivetran AI', tags: ['github','fivetran-ai'], template: [{slot: 'service/branch', placeholder: 'e.g. connector-sdk, main'}], top: true },
          { title: 'Show deployment history for ___ in the last ___', category: 'question', type: 'ask', meta: 'GitHub + Fivetran AI', tags: ['github','fivetran-ai'], template: [{slot: 'service', placeholder: 'e.g. sync-engine'}, {slot: 'time range', placeholder: '7 days', options: ['24 hours','7 days','30 days','this quarter']}] },
          { title: 'Draft a PR description for ___', category: 'generator', type: 'ask', meta: 'GitHub', tags: ['github'], template: [{slot: 'branch or PR URL', placeholder: 'e.g. feature/new-auth'}], top: true },
          { title: 'Write tests for ___', category: 'generator', type: 'ask', meta: 'GitHub', tags: ['github'], template: [{slot: 'function or file', placeholder: 'e.g. syncEngine.handleRetry()'}] },
          { title: 'Review this PR and suggest improvements: ___', category: 'generator', type: 'ask', meta: 'GitHub', tags: ['github'], template: [{slot: 'PR URL or number', placeholder: 'e.g. #4521'}] },
          { title: 'Notify me when my PR ___ gets reviewed', category: 'automation', type: 'auto', meta: 'GitHub + Slack', tags: ['github','slack'], template: [{slot: 'PR number', placeholder: 'e.g. #4521'}] },
        ]
      },
      {
        id: 'my-tickets', name: 'My Tickets', icon: '🎫',
        desc: 'Your Jira backlog, blockers, and sprint work',
        actions: [
          { title: 'Show my open Jira tickets sorted by due date', category: 'question', type: 'ask', meta: 'Jira', tags: ['jira'], top: true },
          { title: 'Which of my tickets are overdue or stale?', category: 'question', type: 'ask', meta: 'Jira', tags: ['jira'], top: true },
          { title: 'What\'s blocking me right now?', category: 'question', type: 'ask', meta: 'Jira', tags: ['jira'], top: true },
          { title: 'Summarize ticket ___ with full context', category: 'question', type: 'ask', meta: 'Jira + Zendesk + Slack', tags: ['jira','zendesk','slack'], template: [{slot: 'ticket ID', placeholder: 'e.g. CONN-1234'}], top: true },
          { title: 'Create a ticket for ___', category: 'action', type: 'act', meta: 'Jira', tags: ['jira'], template: [{slot: 'what needs to be done', placeholder: 'describe the bug or task'}] },
          { title: 'Update ___ with a comment', category: 'action', type: 'act', meta: 'Jira', tags: ['jira'], template: [{slot: 'ticket ID', placeholder: 'e.g. CONN-1234'}] },
          { title: 'How much scope crept into my current sprint?', category: 'question', type: 'ask', meta: 'Jira + Fivetran AI', tags: ['jira','fivetran-ai'] },
          { title: 'Generate my standup update from yesterday\'s activity', category: 'generator', type: 'ask', meta: 'Jira + GitHub + Slack', tags: ['jira','github','slack'], top: true },
        ]
      },
      {
        id: 'connector-health', name: 'Connector Health', icon: '🔌',
        desc: 'Failures, sync performance, customer impact — for connectors you own',
        actions: [
          { title: 'Which connectors have the highest failure rate in the last ___?', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'time range', placeholder: '7 days', options: ['24 hours','7 days','30 days','this quarter']}], top: true },
          { title: 'Show sync failures for ___ broken down by error type', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'connector', placeholder: 'e.g. PostgreSQL, Salesforce, HVR'}], top: true },
          { title: 'How is ___ performing compared to last month?', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'connector or service', placeholder: 'e.g. MySQL, Oracle CDC'}], top: true },
          { title: 'Which customers are most affected by ___ failures?', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL) + Salesforce', tags: ['fivetran-ai','salesforce'], template: [{slot: 'connector', placeholder: 'e.g. Snowflake destination'}], top: true },
          { title: 'Sync duration trends for ___ by customer tier', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'connector', placeholder: 'e.g. BigQuery destination'}] },
          { title: 'What tables/columns does the ___ connector sync?', category: 'question', type: 'ask', meta: 'Fivetran Schema API', tags: ['fivetran'], template: [{slot: 'connector', placeholder: 'e.g. Salesforce, Jira, HubSpot'}] },
          { title: 'Compare failure rates: ___ vs ___', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'connector A', placeholder: 'e.g. PostgreSQL'}, {slot: 'connector B', placeholder: 'e.g. MySQL'}] },
          { title: 'Auto-create Jira bug when ___ failure rate exceeds ___', category: 'automation', type: 'auto', meta: 'Fivetran AI + Jira', tags: ['fivetran-ai','jira'], template: [{slot: 'connector', placeholder: 'e.g. Oracle'}, {slot: 'threshold', placeholder: 'e.g. 5%'}] },
          { title: 'Generate a connector reliability scorecard for ___', category: 'generator', type: 'ask', meta: 'Fivetran AI (AISQL) + Zendesk', tags: ['fivetran-ai','zendesk'], template: [{slot: 'connector or team', placeholder: 'e.g. Database connectors'}] },
        ]
      },
      {
        id: 'customer-impact', name: 'Customer Impact', icon: '👥',
        desc: 'What customers are experiencing — tickets, calls, complaints',
        actions: [
          { title: 'What are customers saying about ___ on support?', category: 'question', type: 'ask', meta: 'Zendesk (semantic search)', tags: ['zendesk'], template: [{slot: 'connector, feature, or topic', placeholder: 'e.g. HVR migration, connector SDK, CDC'}], top: true },
          { title: 'Top support themes in the last ___', category: 'question', type: 'ask', meta: 'Zendesk (AISQL + semantic)', tags: ['zendesk','fivetran-ai'], template: [{slot: 'time range', placeholder: '30 days', options: ['7 days','30 days','this quarter']}], top: true },
          { title: 'Summarize Zendesk ticket ___', category: 'question', type: 'ask', meta: 'Zendesk', tags: ['zendesk'], template: [{slot: 'ticket number', placeholder: 'e.g. 361721'}], top: true },
          { title: 'What did customers say about ___ on Gong calls?', category: 'question', type: 'ask', meta: 'Gong (semantic search)', tags: ['gong'], template: [{slot: 'topic', placeholder: 'e.g. performance, reliability, Airbyte'}], top: true },
          { title: 'Are there support tickets related to ___?', category: 'question', type: 'ask', meta: 'Zendesk (semantic search)', tags: ['zendesk'], template: [{slot: 'bug, feature, or error', placeholder: 'e.g. connection timeout, schema drift'}] },
          { title: 'Which enterprise accounts have open P1/P2 tickets?', category: 'question', type: 'ask', meta: 'Zendesk + Salesforce (AISQL)', tags: ['zendesk','salesforce','fivetran-ai'], top: true },
          { title: 'Customer evidence for ___ (calls + tickets + Jira)', category: 'question', type: 'ask', meta: 'Gong + Zendesk + Jira', tags: ['gong','zendesk','jira'], template: [{slot: 'feature or pain point', placeholder: 'e.g. real-time sync, schema changes'}] },
          { title: 'How often is ___ mentioned as a competitor?', category: 'question', type: 'ask', meta: 'Gong (semantic search)', tags: ['gong'], template: [{slot: 'competitor', placeholder: 'e.g. Airbyte, Stitch, dbt'}] },
        ]
      },
      {
        id: 'my-oncall', name: 'My On-Call', icon: '🚨',
        desc: 'Incidents, blast radius, root cause — when you\'re on the hook',
        actions: [
          { title: 'Am I on-call right now? What\'s open?', category: 'question', type: 'ask', meta: 'PagerDuty', tags: ['pagerduty'], top: true },
          { title: 'Which customers are in the blast radius of ___?', category: 'question', type: 'ask', meta: 'Fivetran AI + Salesforce', tags: ['fivetran-ai','salesforce'], template: [{slot: 'incident or outage', placeholder: 'e.g. Postgres sync outage, INC-4521'}], top: true },
          { title: 'What changed in the ___ before ___ started?', category: 'question', type: 'ask', meta: 'GitHub + Fivetran AI', tags: ['github','fivetran-ai'], template: [{slot: 'time window', placeholder: '24 hours', options: ['1 hour','6 hours','24 hours']}, {slot: 'the incident', placeholder: 'e.g. latency spike, sync failures'}], top: true },
          { title: 'All P1 incidents in the last ___ with resolution time', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'time range', placeholder: '90 days', options: ['30 days','90 days','6 months']}] },
          { title: 'Draft a customer comms update for ___', category: 'generator', type: 'ask', meta: 'PagerDuty + Salesforce', tags: ['pagerduty','salesforce'], template: [{slot: 'incident', placeholder: 'e.g. the Postgres outage'}] },
          { title: 'Generate a post-incident review doc for ___', category: 'generator', type: 'ask', meta: 'PagerDuty + GitHub + Fivetran AI', tags: ['pagerduty','github','fivetran-ai'], template: [{slot: 'incident', placeholder: 'describe what happened'}] },
          { title: 'Auto-alert CSMs when enterprise accounts are affected', category: 'automation', type: 'auto', meta: 'Fivetran AI + Salesforce + Slack', tags: ['fivetran-ai','salesforce','slack'] },
        ]
      },
      {
        id: 'data-explore', name: 'Data & Explore', icon: '📊',
        desc: 'Query anything — BigQuery, warehouse data, internal metrics',
        actions: [
          { title: 'Run a query: ___', category: 'action', type: 'act', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'question in plain English or SQL', placeholder: 'e.g. show weekly connector failures by type'}], top: true },
          { title: 'Find the right tables to analyze ___', category: 'question', type: 'ask', meta: 'Fivetran AI (catalog)', tags: ['fivetran-ai'], template: [{slot: 'what you want to analyze', placeholder: 'e.g. pipeline throughput, customer usage'}], top: true },
          { title: 'Show ___ trend over the last ___', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'metric', placeholder: 'e.g. sync failures, MAR, error rate'}, {slot: 'time range', placeholder: '30 days', options: ['7 days','30 days','90 days','6 months']}], top: true },
          { title: 'Compare ___ across ___', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'metric', placeholder: 'e.g. failure rate, sync duration'}, {slot: 'dimension', placeholder: 'e.g. connector types, regions, customer tiers'}], top: true },
          { title: 'What schemas are available for ___?', category: 'question', type: 'ask', meta: 'Fivetran AI (catalog)', tags: ['fivetran-ai'], template: [{slot: 'domain', placeholder: 'e.g. support, pipeline, revenue, product usage'}] },
          { title: 'Explain how ___ tables join together', category: 'question', type: 'ask', meta: 'Fivetran AI (catalog)', tags: ['fivetran-ai'], template: [{slot: 'schema or domain', placeholder: 'e.g. Salesforce, Zendesk, transforms_bi'}] },
          { title: 'What metrics should I use for ___?', category: 'question', type: 'ask', meta: 'Fivetran AI (catalog + Slab)', tags: ['fivetran-ai','slab'], template: [{slot: 'analysis goal', placeholder: 'e.g. connector reliability, customer health'}] },
          { title: 'Show me outliers in ___ for the last ___', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'metric', placeholder: 'e.g. sync duration, error count'}, {slot: 'time range', placeholder: '7 days', options: ['24 hours','7 days','30 days']}] },
        ]
      },
      {
        id: 'learn-build', name: 'Learn & Build', icon: '🛠️',
        desc: 'Internal docs, schemas, how things work, SDK guides',
        actions: [
          { title: 'How does ___ work internally?', category: 'question', type: 'ask', meta: 'Slab + Fivetran Docs', tags: ['slab','docs'], template: [{slot: 'system or feature', placeholder: 'e.g. sync scheduling, CDC pipeline, HVR'}], top: true },
          { title: 'What docs should I read before working on ___?', category: 'question', type: 'ask', meta: 'Slab + Fivetran Docs', tags: ['slab','docs'], template: [{slot: 'feature or area', placeholder: 'e.g. connector SDK, Oracle setup, schema drift'}], top: true },
          { title: 'Build a custom connector for ___', category: 'generator', type: 'ask', meta: 'Connector SDK', tags: ['fivetran'], template: [{slot: 'data source', placeholder: 'e.g. internal API, custom database'}], top: true },
          { title: 'What\'s the setup process for ___ connector?', category: 'question', type: 'ask', meta: 'Fivetran Docs', tags: ['docs'], template: [{slot: 'connector', placeholder: 'e.g. PostgreSQL, Snowflake, BigQuery'}] },
          { title: 'Search internal knowledge for ___', category: 'question', type: 'ask', meta: 'Slab + Fivetran Docs + Jira', tags: ['slab','docs','jira'], template: [{slot: 'anything', placeholder: 'type your question'}], top: true },
          { title: 'What Fivetran design system components should I use for ___?', category: 'question', type: 'ask', meta: 'Design System', tags: ['design-system'], template: [{slot: 'UI element', placeholder: 'e.g. data table, filter bar, status badge'}] },
          { title: 'How do I deploy an internal app at Fivetran?', category: 'question', type: 'ask', meta: 'Slab', tags: ['slab'] },
          { title: 'File my expense report from receipts', category: 'action', type: 'act', meta: 'Coupa', tags: ['coupa'] },
        ]
      },
    ]
  },

  marketing: {
    name: 'Marketing',
    icon: '📣',
    desc: 'Your campaigns, your content, your audience — not the org dashboard',
    subroles: ['Demand Gen', 'Content Marketing', 'Product Marketing', 'Field Marketing', 'Marketing Ops', 'Brand'],
    focusAreas: [
      {
        id: 'my-campaigns', name: 'My Campaigns', icon: '🎯',
        desc: 'Track the specific campaigns you\'re running right now',
        actions: [
          { title: 'How is my ___ campaign performing?', category: 'question', type: 'ask', meta: 'Marketo + Salesforce', tags: ['marketo','salesforce'], template: [{slot: 'campaign name', placeholder: 'e.g. Spring Webinar, SDK Launch Email'}], top: true },
          { title: 'How many leads from my ___ converted to opps?', category: 'question', type: 'ask', meta: 'Marketo + Salesforce', tags: ['marketo','salesforce'], template: [{slot: 'campaign', placeholder: 'campaign name'}], top: true },
          { title: 'Registration / sign-up count for my ___ this week', category: 'question', type: 'ask', meta: 'Marketo', tags: ['marketo'], template: [{slot: 'event or campaign', placeholder: 'e.g. NYC Dinner, Webinar'}], top: true },
          { title: 'A/B test results for my ___ experiment', category: 'question', type: 'ask', meta: 'Marketo + GA4', tags: ['marketo','ga4'], template: [{slot: 'test name', placeholder: 'e.g. subject line test, CTA variant'}], top: true },
          { title: 'Alert me when my ___ hits ___ registrations', category: 'automation', type: 'auto', meta: 'Marketo + Slack', tags: ['marketo','slack'], template: [{slot: 'campaign', placeholder: 'campaign name'}, {slot: 'target', placeholder: '100'}] },
        ]
      },
      {
        id: 'my-content', name: 'My Content', icon: '✍️',
        desc: 'How the content YOU wrote is performing',
        actions: [
          { title: 'How is my ___ blog post doing?', category: 'question', type: 'ask', meta: 'GA4', tags: ['ga4'], template: [{slot: 'post title or URL', placeholder: 'e.g. Connector SDK Deep Dive'}], top: true },
          { title: 'Which of my recent posts drove the most form fills?', category: 'question', type: 'ask', meta: 'GA4 + Marketo', tags: ['ga4','marketo'], top: true },
          { title: 'Traffic trend for my ___ landing page since launch', category: 'question', type: 'ask', meta: 'GA4', tags: ['ga4'], template: [{slot: 'page', placeholder: 'page URL or name'}], top: true },
          { title: 'What are customers actually saying about ___ on Gong calls? Help me write about it.', category: 'question', type: 'ask', meta: 'Gong', tags: ['gong'], template: [{slot: 'topic', placeholder: 'e.g. reverse ETL, connector SDK, data lakes'}], top: true },
          { title: 'Draft a blog post about ___ using real customer language from Gong', category: 'generator', type: 'ask', meta: 'Gong + Fivetran Docs', tags: ['gong'], template: [{slot: 'topic', placeholder: 'e.g. why companies switch from Airbyte'}] },
        ]
      },
      {
        id: 'my-audience', name: 'My Audience', icon: '👥',
        desc: 'Who should you be targeting based on real signals',
        actions: [
          { title: 'Which accounts in ___ segment are showing intent signals this week?', category: 'question', type: 'ask', meta: 'Bombora + Salesforce', tags: ['bombora','salesforce'], template: [{slot: 'segment', placeholder: 'e.g. Enterprise, Mid-Market, Data Teams'}], top: true },
          { title: 'Build an invite list for my ___ event from accounts with open opps', category: 'action', type: 'act', meta: 'Salesforce', tags: ['salesforce'], template: [{slot: 'event', placeholder: 'e.g. NYC Dinner, Summit'}], top: true },
          { title: 'Which companies visit our ___ page but haven\'t converted?', category: 'question', type: 'ask', meta: 'GA4 + Clearbit', tags: ['ga4','clearbit'], template: [{slot: 'page', placeholder: 'e.g. pricing, connectors, vs-airbyte'}], top: true },
          { title: 'Find lookalike accounts to our best ___ customers', category: 'question', type: 'ask', meta: 'Salesforce + Clearbit + AISQL', tags: ['salesforce','clearbit','aisql'], template: [{slot: 'segment or product', placeholder: 'e.g. HVR, database connectors'}], top: true },
        ]
      },
      {
        id: 'competitive', name: 'Competitive', icon: '⚔️',
        desc: 'What prospects and customers say about competitors',
        actions: [
          { title: 'What are prospects saying about ___ on recent calls?', category: 'question', type: 'ask', meta: 'Gong', tags: ['gong'], template: [{slot: 'competitor', placeholder: 'e.g. Airbyte, Stitch, Matillion'}], top: true },
          { title: 'How often is ___ coming up in competitive deals this quarter?', category: 'question', type: 'ask', meta: 'Gong + Salesforce + AISQL', tags: ['gong','salesforce','aisql'], template: [{slot: 'competitor', placeholder: 'competitor name'}], top: true },
          { title: 'Win/loss reasons against ___ from closed deals', category: 'question', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], template: [{slot: 'competitor', placeholder: 'competitor name'}], top: true },
          { title: 'Draft competitive messaging against ___ using real objections from Gong', category: 'generator', type: 'ask', meta: 'Gong + Salesforce', tags: ['gong','salesforce'], template: [{slot: 'competitor', placeholder: 'competitor name'}] },
        ]
      },
      {
        id: 'create', name: 'Create', icon: '🎨',
        desc: 'Write emails, build decks, craft messaging with real data',
        actions: [
          { title: 'Draft an email sequence for ___ campaign', category: 'generator', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], template: [{slot: 'campaign or audience', placeholder: 'e.g. connector SDK launch, enterprise re-engagement'}], top: true },
          { title: 'Write product launch copy for ___ using customer pain points', category: 'generator', type: 'ask', meta: 'Gong + Zendesk', tags: ['gong','zendesk'], template: [{slot: 'product/feature', placeholder: 'e.g. Activations, Connector SDK'}], top: true },
          { title: 'Build a customer evidence slide for ___ from real quotes', category: 'generator', type: 'ask', meta: 'Gong + Salesforce', tags: ['gong','salesforce'], template: [{slot: 'product or use case', placeholder: 'e.g. data lake connectors'}], top: true },
          { title: 'How many customers use ___? Help me size the opportunity.', category: 'question', type: 'ask', meta: 'AISQL + Salesforce', tags: ['aisql','salesforce'], template: [{slot: 'connector or feature', placeholder: 'e.g. Salesforce connector, HVR'}], top: true },
        ]
      },
    ]
  },

  support: {
    name: 'Support',
    icon: '🎧',
    desc: 'Your queue, your customers, your shift — powered by Fivetran AI',
    subroles: ['Support Engineer', 'Support Manager', 'Support Lead', 'TAM'],
    focusAreas: [
      {
        id: 'my-queue', name: 'My Queue', icon: '📥',
        desc: 'Your assigned tickets, SLA status, what needs attention now',
        actions: [
          { title: 'Show my open tickets sorted by SLA urgency', category: 'question', type: 'ask', meta: 'Zendesk + Fivetran AI', tags: ['zendesk','fivetran-ai'], top: true },
          { title: 'Which of my tickets are about to breach SLA?', category: 'question', type: 'ask', meta: 'Zendesk', tags: ['zendesk'], top: true },
          { title: 'Summarize ticket ___ with full history', category: 'question', type: 'ask', meta: 'Zendesk + Fivetran AI', tags: ['zendesk','fivetran-ai'], template: [{slot: 'ticket number', placeholder: 'e.g. 361721'}], top: true },
          { title: 'What\'s the full account context for ___?', category: 'question', type: 'ask', meta: 'Salesforce + Zendesk + Gong', tags: ['salesforce','zendesk','gong'], template: [{slot: 'customer name', placeholder: 'e.g. Okta, Amplify Life'}], top: true },
          { title: 'Has ___ had this issue before?', category: 'question', type: 'ask', meta: 'Zendesk (semantic)', tags: ['zendesk'], template: [{slot: 'customer or issue', placeholder: 'e.g. Okta sync timeout'}], top: true },
          { title: 'Generate a triage summary for the start of my shift', category: 'generator', type: 'ask', meta: 'Zendesk', tags: ['zendesk'], top: true },
        ]
      },
      {
        id: 'troubleshoot', name: 'Troubleshoot', icon: '🔧',
        desc: 'Debug connector issues, find similar cases, check known issues',
        actions: [
          { title: 'Debug why ___ is failing for ___', category: 'question', type: 'ask', meta: 'Fivetran AI + Zendesk + Docs', tags: ['fivetran-ai','zendesk','docs'], template: [{slot: 'connector', placeholder: 'e.g. PostgreSQL CDC, Oracle'}, {slot: 'customer (optional)', placeholder: 'e.g. Acme Corp'}], top: true },
          { title: 'Find similar resolved tickets for ___', category: 'question', type: 'ask', meta: 'Zendesk (semantic)', tags: ['zendesk'], template: [{slot: 'issue description', placeholder: 'e.g. schema drift after migration'}], top: true },
          { title: 'Is ___ a known issue? Check Jira and recent tickets', category: 'question', type: 'ask', meta: 'Jira + Zendesk (semantic)', tags: ['jira','zendesk'], template: [{slot: 'error or symptom', placeholder: 'e.g. connection refused, null pointer in sync'}], top: true },
          { title: 'What does the docs say about ___ setup?', category: 'question', type: 'ask', meta: 'Fivetran Docs', tags: ['docs'], template: [{slot: 'connector or feature', placeholder: 'e.g. Snowflake destination, SSH tunnel'}], top: true },
          { title: 'Show sync failure patterns for ___ in the last ___', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'connector', placeholder: 'e.g. MySQL'}, {slot: 'time range', placeholder: '7 days', options: ['24 hours','7 days','30 days']}] },
          { title: 'Draft a response for ticket ___ based on similar resolutions', category: 'generator', type: 'ask', meta: 'Zendesk (semantic)', tags: ['zendesk'], template: [{slot: 'ticket number', placeholder: 'e.g. 361721'}] },
        ]
      },
      {
        id: 'customer-context', name: 'Customer Context', icon: '👤',
        desc: 'Full picture of a customer — tickets, calls, account health, ARR',
        actions: [
          { title: 'Full customer profile for ___', category: 'question', type: 'ask', meta: 'Salesforce + Zendesk + Gong', tags: ['salesforce','zendesk','gong'], template: [{slot: 'account name', placeholder: 'e.g. Okta'}], top: true },
          { title: 'All tickets for ___ in the last ___', category: 'question', type: 'ask', meta: 'Zendesk + Fivetran AI', tags: ['zendesk','fivetran-ai'], template: [{slot: 'account', placeholder: 'e.g. USAA'}, {slot: 'time range', placeholder: '90 days', options: ['30 days','90 days','6 months','1 year']}], top: true },
          { title: 'What did ___ say on their last Gong call?', category: 'question', type: 'ask', meta: 'Gong (semantic)', tags: ['gong'], template: [{slot: 'customer', placeholder: 'e.g. Amplify Life'}] },
          { title: 'Is ___ a churn risk? Check all signals', category: 'question', type: 'ask', meta: 'Zendesk + Salesforce + Fivetran AI', tags: ['zendesk','salesforce','fivetran-ai'], template: [{slot: 'account', placeholder: 'e.g. Acme Corp'}], top: true },
          { title: 'Who at Fivetran owns the relationship with ___?', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], template: [{slot: 'account', placeholder: 'e.g. Stripe'}] },
          { title: 'Auto-notify account owner when ___ files a P1', category: 'automation', type: 'auto', meta: 'Zendesk + Salesforce + Slack', tags: ['zendesk','salesforce','slack'], template: [{slot: 'account or tier', placeholder: 'e.g. enterprise accounts'}] },
        ]
      },
      {
        id: 'escalations', name: 'Escalations', icon: '🔺',
        desc: 'Active escalations, patterns, when to escalate to engineering',
        actions: [
          { title: 'Show all active escalations and their status', category: 'question', type: 'ask', meta: 'Zendesk + Jira', tags: ['zendesk','jira'], top: true },
          { title: 'Should I escalate ___? Check if engineering knows about it', category: 'question', type: 'ask', meta: 'Zendesk + Jira (semantic)', tags: ['zendesk','jira'], template: [{slot: 'issue', placeholder: 'describe the problem'}], top: true },
          { title: 'Create a Jira bug for ___ from ticket ___', category: 'action', type: 'act', meta: 'Jira + Zendesk', tags: ['jira','zendesk'], template: [{slot: 'issue description', placeholder: 'e.g. CDC replication lag'}, {slot: 'ticket number', placeholder: 'e.g. 361721'}], top: true },
          { title: 'Accounts with 2+ escalations in the last ___', category: 'question', type: 'ask', meta: 'Zendesk + Salesforce + Fivetran AI', tags: ['zendesk','salesforce','fivetran-ai'], template: [{slot: 'time range', placeholder: '90 days', options: ['30 days','90 days','6 months']}] },
          { title: 'Generate an escalation summary for the weekly review', category: 'generator', type: 'ask', meta: 'Zendesk + Jira + Salesforce', tags: ['zendesk','jira','salesforce'] },
        ]
      },
      {
        id: 'support-data', name: 'Data & Trends', icon: '📊',
        desc: 'Ticket volume, themes, CSAT, SLA metrics — for your area',
        actions: [
          { title: 'Top issue themes in the last ___', category: 'question', type: 'ask', meta: 'Zendesk + Fivetran AI (semantic + AISQL)', tags: ['zendesk','fivetran-ai'], template: [{slot: 'time range', placeholder: '30 days', options: ['7 days','30 days','this quarter']}], top: true },
          { title: 'Ticket volume trend for ___ connectors', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'connector type or category', placeholder: 'e.g. database, SaaS, file'}], top: true },
          { title: 'Which connectors generate the most tickets per customer?', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL) + Zendesk', tags: ['fivetran-ai','zendesk'], top: true },
          { title: 'CSAT breakdown by ___ this ___', category: 'question', type: 'ask', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'dimension', placeholder: 'e.g. connector, priority, team'}, {slot: 'time range', placeholder: 'quarter', options: ['month','quarter','year']}] },
          { title: 'Run a query: ___', category: 'action', type: 'act', meta: 'Fivetran AI (AISQL)', tags: ['fivetran-ai'], template: [{slot: 'question in plain English', placeholder: 'e.g. average resolution time by priority this month'}] },
          { title: 'Search internal knowledge for ___', category: 'question', type: 'ask', meta: 'Slab + Docs', tags: ['slab','docs'], template: [{slot: 'anything', placeholder: 'type your question'}] },
        ]
      },
    ]
  },

  hr: {
    name: 'HR / People',
    icon: '👥',
    desc: 'Headcount, retention, recruiting, engagement, comp, onboarding',
    subroles: ['HRBP', 'People Ops', 'Recruiter', 'Talent Lead', 'HR Director'],
    focusAreas: [
      {
        id: 'headcount-planning', name: 'Headcount & Planning', icon: '📋',
        desc: 'Plan vs actuals, open roles, contractor mix',
        actions: [
          { title: 'Headcount by department, level, and location vs approved plan', category: 'question', type: 'ask', meta: 'HRIS + Finance', tags: ['hris','finance'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Which departments are over or under approved headcount?', category: 'question', type: 'ask', meta: 'HRIS + Finance', tags: ['hris','finance'], multi: true, semantic: false, top: true, rising: false },
          { title: 'What percentage of our workforce is contractor vs FTE by team?', category: 'question', type: 'ask', meta: 'HRIS', tags: ['hris'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Push monthly headcount actuals vs plan report to Finance', category: 'automation', type: 'auto', meta: 'HRIS + Finance + Slack', tags: ['hris','finance','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate a headcount planning summary for the next quarter', category: 'generator', type: 'ask', meta: 'HRIS + Finance + ATS', tags: ['hris','finance','ats'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'retention-risk', name: 'Retention & Risk', icon: '🚪',
        desc: 'Flight risk, attrition patterns, manager impact',
        actions: [
          { title: 'Who is showing flight risk signals right now?', category: 'question', type: 'ask', meta: 'HRIS + Culture Amp', tags: ['hris','culture-amp'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Attrition rate by department, level, and tenure cohort', category: 'question', type: 'ask', meta: 'HRIS', tags: ['hris'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Which managers have the highest attrition this year?', category: 'question', type: 'ask', meta: 'HRIS', tags: ['hris'], multi: false, semantic: true, top: true, rising: false },
          { title: 'Push flight risk scores to each HRBP weekly', category: 'automation', type: 'auto', meta: 'HRIS + Culture Amp + Slack', tags: ['hris','culture-amp','slack'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Generate a retention risk briefing for the leadership team', category: 'generator', type: 'ask', meta: 'HRIS + Culture Amp', tags: ['hris','culture-amp'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'recruiting-pipeline', name: 'Recruiting Pipeline', icon: '🎯',
        desc: 'Time-to-fill, offer rates, sourcing quality',
        actions: [
          { title: 'Average time-to-fill by role level and department', category: 'question', type: 'ask', meta: 'ATS', tags: ['ats'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Which sourcing channels produce the highest quality hires?', category: 'question', type: 'ask', meta: 'ATS + HRIS', tags: ['ats','hris'], multi: true, semantic: true, top: true, rising: false },
          { title: 'What is our offer acceptance rate by role and team this quarter?', category: 'question', type: 'ask', meta: 'ATS', tags: ['ats'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Flag candidates stuck in interview stage for 2+ weeks', category: 'automation', type: 'auto', meta: 'ATS + Slack', tags: ['ats','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate a weekly recruiting pipeline report for hiring managers', category: 'generator', type: 'ask', meta: 'ATS', tags: ['ats'], multi: false, semantic: false, top: false, rising: true },
        ]
      },
      {
        id: 'engagement', name: 'Engagement', icon: '❤️',
        desc: 'Survey scores, themes, team health',
        actions: [
          { title: 'Engagement scores by team, level, and tenure from last survey', category: 'question', type: 'ask', meta: 'Culture Amp', tags: ['culture-amp'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Top themes in open-text survey responses this cycle', category: 'question', type: 'ask', meta: 'Culture Amp', tags: ['culture-amp'], multi: false, semantic: true, top: true, rising: false },
          { title: 'Correlate engagement scores with voluntary attrition by team', category: 'question', type: 'ask', meta: 'Culture Amp + HRIS', tags: ['culture-amp','hris'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Alert HRBPs when a team engagement score drops below threshold', category: 'automation', type: 'auto', meta: 'Culture Amp + Slack', tags: ['culture-amp','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate an engagement insights report with themes and action items', category: 'generator', type: 'ask', meta: 'Culture Amp + HRIS', tags: ['culture-amp','hris'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'compensation', name: 'Compensation', icon: '💰',
        desc: 'Band analysis, equity gaps, market benchmarks',
        actions: [
          { title: 'Compensation distribution by level, gender, and tenure', category: 'question', type: 'ask', meta: 'HRIS + Finance', tags: ['hris','finance'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Which employees are outside their salary band?', category: 'question', type: 'ask', meta: 'HRIS + Finance', tags: ['hris','finance'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Are there pay equity gaps by gender or ethnicity at any level?', category: 'question', type: 'ask', meta: 'HRIS + Finance', tags: ['hris','finance'], multi: true, semantic: true, top: true, rising: true },
          { title: 'Flag high performers compensated below band midpoint', category: 'automation', type: 'auto', meta: 'HRIS + Finance', tags: ['hris','finance'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Generate a compensation review summary for the next cycle', category: 'generator', type: 'ask', meta: 'HRIS + Finance', tags: ['hris','finance'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'onboarding', name: 'Onboarding', icon: '🎓',
        desc: 'New hire ramp, 90-day check-ins, buddy assignments',
        actions: [
          { title: 'Which new hires are past 30 days and have not completed onboarding?', category: 'question', type: 'ask', meta: 'HRIS', tags: ['hris'], multi: false, semantic: false, top: true, rising: false },
          { title: 'What is the average time to productivity by role and team?', category: 'question', type: 'ask', meta: 'HRIS', tags: ['hris'], multi: false, semantic: true, top: true, rising: false },
          { title: 'Which new hires do not have a buddy assigned yet?', category: 'question', type: 'ask', meta: 'HRIS', tags: ['hris'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Auto-send 90-day check-in survey to new hires and their managers', category: 'automation', type: 'auto', meta: 'HRIS + Culture Amp', tags: ['hris','culture-amp'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate an onboarding health report for the People team', category: 'generator', type: 'ask', meta: 'HRIS + Culture Amp', tags: ['hris','culture-amp'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
    ]
  },

  finance: {
    name: 'Finance',
    icon: '💵',
    desc: 'Revenue, costs, SaaS metrics, unit economics, planning',
    subroles: ['FP&A Analyst', 'Finance Manager', 'Controller', 'CFO'],
    focusAreas: [
      {
        id: 'revenue-tracking', name: 'Revenue Tracking', icon: '📈',
        desc: 'ARR, MRR, NRR, churn, forecast vs budget',
        actions: [
          { title: 'ARR, MRR, and net revenue retention trends for last 8 quarters', category: 'question', type: 'ask', meta: 'Salesforce + Billing', tags: ['salesforce','billing'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Current revenue forecast vs budget this quarter', category: 'question', type: 'ask', meta: 'Salesforce + Finance', tags: ['salesforce','finance'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Revenue concentration risk — top 10 customers as percent of ARR', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: false, top: true, rising: true },
          { title: 'Push weekly revenue actuals vs forecast to finance Slack', category: 'automation', type: 'auto', meta: 'Salesforce + Billing + Slack', tags: ['salesforce','billing','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate a revenue waterfall showing new, expansion, contraction, and churn', category: 'generator', type: 'ask', meta: 'Salesforce + Billing', tags: ['salesforce','billing'], multi: true, semantic: true, top: true, rising: false },
        ]
      },
      {
        id: 'cost-budget', name: 'Cost & Budget', icon: '💸',
        desc: 'Department spend, vendor costs, budget variance',
        actions: [
          { title: 'Total spend by department vs budget this quarter', category: 'question', type: 'ask', meta: 'Finance + HRIS', tags: ['finance','hris'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Cloud infrastructure cost trend vs revenue growth', category: 'question', type: 'ask', meta: 'AWS + Finance', tags: ['aws','finance'], multi: true, semantic: true, top: false, rising: true },
          { title: 'Which budget categories are exceeding 110% of plan?', category: 'question', type: 'ask', meta: 'Finance', tags: ['finance'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Flag budget categories exceeding threshold automatically', category: 'automation', type: 'auto', meta: 'Finance + Slack', tags: ['finance','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate a variance analysis report for the monthly close', category: 'generator', type: 'ask', meta: 'Finance', tags: ['finance'], multi: false, semantic: true, top: true, rising: false },
        ]
      },
      {
        id: 'saas-vendors', name: 'SaaS & Vendors', icon: '🔧',
        desc: 'Tool utilization, contract renewals, consolidation',
        actions: [
          { title: 'Which SaaS tools have less than 50% of seats active?', category: 'question', type: 'ask', meta: 'Finance + Okta', tags: ['finance','okta'], multi: true, semantic: true, top: true, rising: false },
          { title: 'All software contracts expiring in the next 90 days', category: 'question', type: 'ask', meta: 'Finance', tags: ['finance'], multi: false, semantic: false, top: true, rising: false },
          { title: 'What would consolidating overlapping tools save annually?', category: 'question', type: 'ask', meta: 'Finance + Okta', tags: ['finance','okta'], multi: true, semantic: true, top: false, rising: true },
          { title: 'Push SaaS renewal reminders 90 days before each expiry', category: 'automation', type: 'auto', meta: 'Finance + Slack', tags: ['finance','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate a SaaS optimization report with utilization and savings opportunities', category: 'generator', type: 'ask', meta: 'Finance + Okta', tags: ['finance','okta'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'board-reporting', name: 'Board & Reporting', icon: '📊',
        desc: 'Exec decks, financial close, metric summaries',
        actions: [
          { title: 'Are we on track to hit the board plan this quarter?', category: 'question', type: 'ask', meta: 'Salesforce + Finance', tags: ['salesforce','finance'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Build a board-ready financial summary deck', category: 'generator', type: 'ask', meta: 'Finance + Salesforce + HRIS', tags: ['finance','salesforce','hris'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Auto-generate monthly financial close summary', category: 'automation', type: 'auto', meta: 'Finance + Slack', tags: ['finance','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate an investor update with key metrics and narrative', category: 'generator', type: 'ask', meta: 'Finance + Salesforce + HRIS', tags: ['finance','salesforce','hris'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'unit-economics', name: 'Unit Economics', icon: '🧮',
        desc: 'CAC, LTV, payback, gross margin',
        actions: [
          { title: 'CAC, LTV, and payback period by segment and channel', category: 'question', type: 'ask', meta: 'Salesforce + Finance + Marketo', tags: ['salesforce','finance','marketo'], multi: true, semantic: true, top: true, rising: false },
          { title: 'How is our gross margin trending by customer segment?', category: 'question', type: 'ask', meta: 'Finance + Salesforce', tags: ['finance','salesforce'], multi: true, semantic: true, top: true, rising: false },
          { title: 'What is our burn multiple this quarter?', category: 'question', type: 'ask', meta: 'Finance', tags: ['finance'], multi: false, semantic: false, top: true, rising: true },
          { title: 'Generate a unit economics dashboard for the leadership review', category: 'generator', type: 'ask', meta: 'Finance + Salesforce + Marketo', tags: ['finance','salesforce','marketo'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'planning-modeling', name: 'Planning & Modeling', icon: '📋',
        desc: 'Scenario planning, headcount impact, forecasts',
        actions: [
          { title: 'What is the financial impact of adding 10 more heads next quarter?', category: 'question', type: 'ask', meta: 'Finance + HRIS', tags: ['finance','hris'], multi: true, semantic: true, top: true, rising: false },
          { title: 'If we hit 90% of pipeline, what does revenue look like?', category: 'question', type: 'ask', meta: 'Salesforce + Finance', tags: ['salesforce','finance'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Burn rate this quarter vs plan and runway at current spend', category: 'question', type: 'ask', meta: 'Finance', tags: ['finance'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Generate a scenario model with base, upside, and downside cases', category: 'generator', type: 'ask', meta: 'Finance + Salesforce', tags: ['finance','salesforce'], multi: true, semantic: true, top: true, rising: true },
        ]
      },
    ]
  },

  data: {
    name: 'Data & Analytics',
    icon: '📊',
    desc: 'Pipeline health, data quality, semantic layer, dashboards, self-serve',
    subroles: ['Analytics Engineer', 'Data Analyst', 'Data Engineer', 'Head of Data'],
    focusAreas: [
      {
        id: 'pipeline-health', name: 'Pipeline Health', icon: '🔄',
        desc: 'Sync failures, data freshness, schema changes',
        actions: [
          { title: 'Which pipelines have had sync failures in the last 24 hours?', category: 'question', type: 'ask', meta: 'Fivetran', tags: ['fivetran'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Data freshness by table and source for critical business metrics', category: 'question', type: 'ask', meta: 'Fivetran + Snowflake', tags: ['fivetran','snowflake'], multi: true, semantic: true, top: true, rising: false },
          { title: 'All tables that have not updated in more than 6 hours', category: 'question', type: 'ask', meta: 'Fivetran + Snowflake', tags: ['fivetran','snowflake'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Alert when any business-critical pipeline fails', category: 'automation', type: 'auto', meta: 'Fivetran + Slack', tags: ['fivetran','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Which schema changes happened upstream this week and what broke?', category: 'question', type: 'ask', meta: 'Fivetran + dbt', tags: ['fivetran','dbt'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'data-quality', name: 'Data Quality', icon: '✅',
        desc: 'Null rates, anomalies, broken models',
        actions: [
          { title: 'Tables with highest null rate in key business fields', category: 'question', type: 'ask', meta: 'Snowflake', tags: ['snowflake'], multi: false, semantic: true, top: true, rising: false },
          { title: 'Row count anomalies across source tables in the last 7 days', category: 'question', type: 'ask', meta: 'Snowflake', tags: ['snowflake'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Downstream models that broke after last schema change', category: 'question', type: 'ask', meta: 'dbt + Fivetran', tags: ['dbt','fivetran'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Auto-alert when critical table has greater than 5% null rate on key fields', category: 'automation', type: 'auto', meta: 'Snowflake + Slack', tags: ['snowflake','slack'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Generate a data quality scorecard for the weekly data team review', category: 'generator', type: 'ask', meta: 'Snowflake + dbt + Fivetran', tags: ['snowflake','dbt','fivetran'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'metrics-semantic', name: 'Metrics & Semantic', icon: '🧊',
        desc: 'Metric definitions, lineage, conflicts',
        actions: [
          { title: 'All metrics defined in our semantic layer and their owner', category: 'question', type: 'ask', meta: 'dbt + Looker', tags: ['dbt','looker'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Business metrics with conflicting definitions across teams', category: 'question', type: 'ask', meta: 'dbt + Looker + Tableau', tags: ['dbt','looker','tableau'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Full lineage for our ARR metric — every table and transform', category: 'question', type: 'ask', meta: 'dbt + Snowflake', tags: ['dbt','snowflake'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Auto-generate docs for undocumented dbt models', category: 'automation', type: 'auto', meta: 'dbt', tags: ['dbt'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Generate a metric catalog with definitions, owners, and lineage', category: 'generator', type: 'ask', meta: 'dbt + Looker + Tableau', tags: ['dbt','looker','tableau'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'dashboard-health', name: 'Dashboard Health', icon: '📺',
        desc: 'Usage, stale reports, broken charts',
        actions: [
          { title: 'Which dashboards are most viewed and by which teams?', category: 'question', type: 'ask', meta: 'Looker + Tableau', tags: ['looker','tableau'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Reports not viewed in 90+ days that could be retired', category: 'question', type: 'ask', meta: 'Looker + Tableau', tags: ['looker','tableau'], multi: true, semantic: false, top: true, rising: true },
          { title: 'Dashboards with broken charts from upstream schema changes', category: 'question', type: 'ask', meta: 'Looker + dbt + Fivetran', tags: ['looker','dbt','fivetran'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Auto-notify dashboard owners when upstream schema changes', category: 'automation', type: 'auto', meta: 'Fivetran + dbt + Slack', tags: ['fivetran','dbt','slack'], multi: true, semantic: false, top: true, rising: false },
        ]
      },
      {
        id: 'self-serve', name: 'Self-Serve', icon: '🙋',
        desc: 'Ad-hoc request load, common questions, enablement gaps',
        actions: [
          { title: 'Which teams make the most ad-hoc data requests?', category: 'question', type: 'ask', meta: 'Jira + Slack', tags: ['jira','slack'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Most common data questions asked in Slack by business teams', category: 'question', type: 'ask', meta: 'Slack', tags: ['slack'], multi: false, semantic: true, top: true, rising: false },
          { title: 'Which ad-hoc requests could be answered by existing dashboards?', category: 'question', type: 'ask', meta: 'Looker + Slack', tags: ['looker','slack'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Generate a self-serve enablement guide based on most common requests', category: 'generator', type: 'ask', meta: 'Slack + Looker + dbt', tags: ['slack','looker','dbt'], multi: true, semantic: true, top: false, rising: true },
          { title: 'Auto-respond to common Slack data questions with dashboard links', category: 'automation', type: 'auto', meta: 'Slack + Looker', tags: ['slack','looker'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'infrastructure', name: 'Infrastructure', icon: '⚡',
        desc: 'Compute costs, query performance, optimization',
        actions: [
          { title: 'Which queries are consuming the most warehouse credits?', category: 'question', type: 'ask', meta: 'Snowflake', tags: ['snowflake'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Warehouse utilization and auto-suspend efficiency', category: 'question', type: 'ask', meta: 'Snowflake', tags: ['snowflake'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Data warehouse cost trend vs data volume growth', category: 'question', type: 'ask', meta: 'Snowflake + Finance', tags: ['snowflake','finance'], multi: true, semantic: true, top: true, rising: true },
          { title: 'Alert when compute costs exceed daily threshold', category: 'automation', type: 'auto', meta: 'Snowflake + Slack', tags: ['snowflake','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate a cost optimization report with specific query recommendations', category: 'generator', type: 'ask', meta: 'Snowflake', tags: ['snowflake'], multi: false, semantic: true, top: false, rising: true },
        ]
      },
    ]
  },

  revops: {
    name: 'Revenue Operations',
    icon: '🔧',
    desc: 'CRM hygiene, sales process, territory, revenue reporting, tools',
    subroles: ['RevOps Analyst', 'RevOps Manager', 'Sales Ops', 'GTM Ops'],
    focusAreas: [
      {
        id: 'crm-hygiene', name: 'CRM Hygiene', icon: '🧹',
        desc: 'Missing fields, stale records, data quality',
        actions: [
          { title: 'Salesforce accounts missing key fields like ARR, segment, or owner', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Deals moved backwards in stage in the last 30 days', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: true, top: true, rising: false },
          { title: 'Contacts with bounced emails or invalid phone numbers', category: 'question', type: 'ask', meta: 'Salesforce + Outreach', tags: ['salesforce','outreach'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Auto-flag incomplete records to owning rep in Slack', category: 'automation', type: 'auto', meta: 'Salesforce + Slack', tags: ['salesforce','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Enrich all accounts missing industry, employee count, or revenue', category: 'action', type: 'act', meta: 'Salesforce + Clearbit', tags: ['salesforce','clearbit'], multi: true, semantic: false, top: true, rising: false },
        ]
      },
      {
        id: 'sales-process', name: 'Sales Process', icon: '🔄',
        desc: 'Conversion rates, cycle length, stage analysis',
        actions: [
          { title: 'Average sales cycle length by deal size and segment', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Stage conversion rates across the entire pipeline this quarter', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Which deal stages have the highest loss rate and why?', category: 'question', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Push stalled deals to rep Slack with update prompt weekly', category: 'automation', type: 'auto', meta: 'Salesforce + Slack', tags: ['salesforce','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate a sales process health report with bottleneck analysis', category: 'generator', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'territory-quota', name: 'Territory & Quota', icon: '🗺️',
        desc: 'Attainment, coverage, balance',
        actions: [
          { title: 'Quota attainment by rep, team, and region this quarter', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Pipeline coverage ratio by rep vs their quota', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Which territories are underserved based on TAM vs rep coverage?', category: 'question', type: 'ask', meta: 'Salesforce + Clearbit', tags: ['salesforce','clearbit'], multi: true, semantic: true, top: false, rising: true },
          { title: 'Push weekly quota attainment summary to sales leadership', category: 'automation', type: 'auto', meta: 'Salesforce + Slack', tags: ['salesforce','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate a territory rebalancing proposal based on performance data', category: 'generator', type: 'ask', meta: 'Salesforce + Clearbit', tags: ['salesforce','clearbit'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'revenue-reporting', name: 'Revenue Reporting', icon: '📊',
        desc: 'ARR movements, forecast accuracy, pipeline metrics',
        actions: [
          { title: 'New ARR, expansion, churn, and NRR this quarter', category: 'question', type: 'ask', meta: 'Salesforce + Billing', tags: ['salesforce','billing'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Revenue bridge from last quarter showing all movements', category: 'question', type: 'ask', meta: 'Salesforce + Billing', tags: ['salesforce','billing'], multi: true, semantic: true, top: true, rising: false },
          { title: 'How accurate has our forecast been vs actuals over the last 4 quarters?', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: true, top: true, rising: false },
          { title: 'Push daily revenue and pipeline metrics to RevOps Slack', category: 'automation', type: 'auto', meta: 'Salesforce + Slack', tags: ['salesforce','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate a board-ready revenue report with waterfall and commentary', category: 'generator', type: 'ask', meta: 'Salesforce + Billing + Finance', tags: ['salesforce','billing','finance'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'tool-stack', name: 'Tool Stack', icon: '🔌',
        desc: 'Utilization, overlap, integration health',
        actions: [
          { title: 'Which sales tools are being paid for but not used?', category: 'question', type: 'ask', meta: 'Okta + Finance', tags: ['okta','finance'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Time spent in each sales tool by rep and team', category: 'question', type: 'ask', meta: 'Salesforce + Outreach + Gong', tags: ['salesforce','outreach','gong'], multi: true, semantic: true, top: true, rising: false },
          { title: 'What would consolidating our tech stack save annually?', category: 'question', type: 'ask', meta: 'Finance + Okta', tags: ['finance','okta'], multi: true, semantic: true, top: false, rising: true },
          { title: 'Generate a tool stack audit with utilization scores and consolidation recs', category: 'generator', type: 'ask', meta: 'Okta + Finance + Salesforce', tags: ['okta','finance','salesforce'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'process-automation', name: 'Process Automation', icon: '⚙️',
        desc: 'Workflow gaps, manual tasks, efficiency opportunities',
        actions: [
          { title: 'Which manual processes are reps spending the most time on?', category: 'question', type: 'ask', meta: 'Salesforce + Gong + Outreach', tags: ['salesforce','gong','outreach'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Which Salesforce workflows have the highest failure rate?', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Auto-update deal stage based on Gong call disposition', category: 'automation', type: 'auto', meta: 'Gong + Salesforce', tags: ['gong','salesforce'], multi: true, semantic: true, top: true, rising: true },
          { title: 'Generate a process efficiency report with automation opportunities', category: 'generator', type: 'ask', meta: 'Salesforce + Gong + Outreach', tags: ['salesforce','gong','outreach'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
    ]
  },

  executive: {
    name: 'Executive',
    icon: '👔',
    desc: 'Company health, pipeline, org health, strategy, board prep',
    subroles: ['CEO', 'CRO', 'COO', 'VP', 'Director'],
    focusAreas: [
      {
        id: 'company-pulse', name: 'Company Pulse', icon: '🏢',
        desc: 'Full health dashboard, ARR, headcount, CSAT, burn',
        actions: [
          { title: 'Full company health dashboard — ARR, headcount, CSAT, burn, NRR', category: 'question', type: 'ask', meta: 'Salesforce + HRIS + Zendesk + Finance', tags: ['salesforce','hris','zendesk','finance'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Year-over-year growth rate across all key company metrics', category: 'question', type: 'ask', meta: 'Salesforce + Finance', tags: ['salesforce','finance'], multi: true, semantic: true, top: true, rising: false },
          { title: 'What are our top 3 risks and top 3 wins this quarter?', category: 'question', type: 'ask', meta: 'Salesforce + HRIS + Zendesk + Finance', tags: ['salesforce','hris','zendesk','finance'], multi: true, semantic: true, top: true, rising: true },
          { title: 'Auto-generate weekly company metrics digest to exec Slack', category: 'automation', type: 'auto', meta: 'Salesforce + HRIS + Finance + Zendesk + Slack', tags: ['salesforce','hris','finance','zendesk','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate a Monday morning briefing with key metrics and action items', category: 'generator', type: 'ask', meta: 'Salesforce + HRIS + Zendesk + Finance', tags: ['salesforce','hris','zendesk','finance'], multi: true, semantic: true, top: true, rising: true },
        ]
      },
      {
        id: 'revenue-pipeline', name: 'Revenue & Pipeline', icon: '💰',
        desc: 'Forecast, deal involvement, segment trends',
        actions: [
          { title: 'Are we on track to hit the number this quarter?', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: false, top: true, rising: false },
          { title: 'New ARR, expansion, churn, and net new in one view', category: 'question', type: 'ask', meta: 'Salesforce + Billing', tags: ['salesforce','billing'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Which deals need executive involvement to close this quarter?', category: 'question', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Pipeline coverage vs where we need to be by segment', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Generate a revenue forecast report with risk factors and upside', category: 'generator', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'org-health', name: 'Org Health', icon: '❤️',
        desc: 'Attrition, engagement, span of control',
        actions: [
          { title: 'Attrition rate by department and level across the company', category: 'question', type: 'ask', meta: 'HRIS', tags: ['hris'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Which departments have the lowest engagement scores?', category: 'question', type: 'ask', meta: 'Culture Amp', tags: ['culture-amp'], multi: false, semantic: false, top: true, rising: false },
          { title: 'Revenue per employee and how it has changed over 4 quarters', category: 'question', type: 'ask', meta: 'Finance + HRIS + Salesforce', tags: ['finance','hris','salesforce'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Push monthly org health summary to CEO and CHRO', category: 'automation', type: 'auto', meta: 'HRIS + Culture Amp + Slack', tags: ['hris','culture-amp','slack'], multi: true, semantic: false, top: true, rising: false },
          { title: 'Generate an org health report with retention, engagement, and span analysis', category: 'generator', type: 'ask', meta: 'HRIS + Culture Amp + Finance', tags: ['hris','culture-amp','finance'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'strategic-initiatives', name: 'Strategic Initiatives', icon: '🎯',
        desc: 'Initiative tracking, ROI, market opportunities',
        actions: [
          { title: 'Status of all active strategic initiatives and their KPIs', category: 'question', type: 'ask', meta: 'Jira + Salesforce + Finance', tags: ['jira','salesforce','finance'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Which initiatives are off track and what is the business impact?', category: 'question', type: 'ask', meta: 'Jira + Finance', tags: ['jira','finance'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Which markets should we double down on based on growth data?', category: 'question', type: 'ask', meta: 'Salesforce + Finance', tags: ['salesforce','finance'], multi: true, semantic: true, top: false, rising: true },
          { title: 'Generate a strategic initiative scorecard for the leadership review', category: 'generator', type: 'ask', meta: 'Jira + Salesforce + Finance', tags: ['jira','salesforce','finance'], multi: true, semantic: true, top: true, rising: false },
        ]
      },
      {
        id: 'board-prep', name: 'Board Prep', icon: '📋',
        desc: 'Deck generation, metric summaries, QBR prep',
        actions: [
          { title: 'Build a board-ready deck with performance, pipeline, and org health', category: 'generator', type: 'ask', meta: 'Salesforce + Finance + HRIS + Zendesk', tags: ['salesforce','finance','hris','zendesk'], multi: true, semantic: true, top: true, rising: false },
          { title: 'What questions is the board likely to ask based on current metrics?', category: 'question', type: 'ask', meta: 'Salesforce + Finance + HRIS', tags: ['salesforce','finance','hris'], multi: true, semantic: true, top: true, rising: true },
          { title: 'Generate a QBR prep doc with key metrics, wins, risks, and asks', category: 'generator', type: 'ask', meta: 'Salesforce + Finance + HRIS + Jira', tags: ['salesforce','finance','hris','jira'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Generate board meeting talking points with data-backed narratives', category: 'generator', type: 'ask', meta: 'Salesforce + Finance + HRIS', tags: ['salesforce','finance','hris'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
      {
        id: 'market-competitive', name: 'Market & Competitive', icon: '🌍',
        desc: 'Market positioning, win/loss trends, expansion targets',
        actions: [
          { title: 'What is our win rate by competitor and how is it trending?', category: 'question', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Which market segments are growing fastest for us?', category: 'question', type: 'ask', meta: 'Salesforce + Finance', tags: ['salesforce','finance'], multi: true, semantic: true, top: true, rising: false },
          { title: 'What messaging is winning in competitive deals?', category: 'question', type: 'ask', meta: 'Gong', tags: ['gong'], multi: false, semantic: true, top: false, rising: true },
          { title: 'Generate a competitive landscape briefing for the leadership team', category: 'generator', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], multi: true, semantic: true, top: true, rising: false },
          { title: 'Push weekly win/loss summary to exec Slack with competitor breakdown', category: 'automation', type: 'auto', meta: 'Salesforce + Gong + Slack', tags: ['salesforce','gong','slack'], multi: true, semantic: true, top: false, rising: true },
        ]
      },
    ]
  },

  alliances: {
    name: 'Alliances & Partnerships',
    icon: '🤝',
    desc: 'Partner pipeline, co-sell, marketplace, joint GTM',
    subroles: ['Partner Manager', 'Alliance Lead', 'Partner Engineer', 'Channel Manager', 'BD Lead'],
    focusAreas: [
      {
        id: 'partner-pipeline', name: 'Partner Pipeline', icon: '📊',
        desc: 'Co-sell deals, partner-sourced revenue, joint wins',
        actions: [
          { title: 'Show all co-sell deals with ___ this quarter', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], template: [{slot: 'partner', placeholder: 'e.g. Snowflake, Databricks, dbt'}], top: true },
          { title: 'Partner-sourced pipeline vs direct pipeline by quarter', category: 'question', type: 'ask', meta: 'Salesforce + AISQL', tags: ['salesforce','aisql'], multi: true, semantic: true, top: true },
          { title: 'Which partner co-sell deals are stuck in stage for 30+ days?', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], top: true },
          { title: 'Win rate comparison: partner-sourced vs direct deals', category: 'question', type: 'ask', meta: 'Salesforce + AISQL', tags: ['salesforce','aisql'], multi: true, semantic: true, top: true },
          { title: 'Generate a partner QBR deck for ___', category: 'generator', type: 'ask', meta: 'Salesforce + Gong + Slides', tags: ['salesforce','gong'], template: [{slot: 'partner name', placeholder: 'e.g. Snowflake'}] },
        ]
      },
      {
        id: 'partner-health', name: 'Partner Health', icon: '💚',
        desc: 'Engagement trends, declining activity, coverage gaps',
        actions: [
          { title: 'Which partners have declining co-sell activity vs last quarter?', category: 'question', type: 'ask', meta: 'Salesforce + AISQL', tags: ['salesforce','aisql'], multi: true, semantic: true, top: true },
          { title: 'What are ___ partners saying about us on Gong calls?', category: 'question', type: 'ask', meta: 'Gong', tags: ['gong'], template: [{slot: 'partner', placeholder: 'e.g. Snowflake'}], top: true },
          { title: 'Coverage gaps — accounts using ___ but not Fivetran', category: 'question', type: 'ask', meta: 'Salesforce + AISQL', tags: ['salesforce','aisql'], template: [{slot: 'partner tech', placeholder: 'e.g. Snowflake, Databricks'}], top: true },
          { title: 'Partner NPS and sentiment from recent calls', category: 'question', type: 'ask', meta: 'Gong', tags: ['gong'], multi: false, semantic: true, top: true },
          { title: 'Alert me when a key partner account goes dark for 3+ weeks', category: 'automation', type: 'auto', meta: 'Salesforce + Slack', tags: ['salesforce','slack'] },
        ]
      },
      {
        id: 'marketplace', name: 'Marketplace', icon: '🏪',
        desc: 'Marketplace sign-ups, conversions, partner connect',
        actions: [
          { title: 'How many sign-ups came through ___ Marketplace this month?', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], template: [{slot: 'marketplace', placeholder: 'AWS, Snowflake Partner Connect, Azure'}], top: true },
          { title: 'Marketplace sign-up to paid conversion rate by channel', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], multi: false, semantic: true, top: true },
          { title: 'Which marketplace listings drive the highest ACV deals?', category: 'question', type: 'ask', meta: 'Salesforce + AISQL', tags: ['salesforce','aisql'], multi: true, semantic: true, top: true },
          { title: 'Marketplace revenue attribution by partner and quarter', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], multi: false, semantic: true, top: true },
        ]
      },
      {
        id: 'joint-customers', name: 'Joint Customers', icon: '🔗',
        desc: 'Shared customers, tech overlap, expansion targets',
        actions: [
          { title: 'Which ___ customers are also Fivetran customers?', category: 'question', type: 'ask', meta: 'Salesforce + AISQL', tags: ['salesforce','aisql'], template: [{slot: 'partner', placeholder: 'e.g. Snowflake, dbt'}], top: true },
          { title: 'Joint customers NOT using ___ — upsell opportunity', category: 'question', type: 'ask', meta: 'Salesforce + AISQL', tags: ['salesforce','aisql'], template: [{slot: 'product/integration', placeholder: 'e.g. Transformations, Activations'}], top: true },
          { title: 'Which customers use ___ as their warehouse?', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], template: [{slot: 'warehouse', placeholder: 'Snowflake, Databricks, BigQuery, Redshift'}], top: true },
          { title: 'Prep me for my partner meeting with ___', category: 'question', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], template: [{slot: 'partner', placeholder: 'e.g. Databricks'}], top: true },
        ]
      },
    ]
  },

  it_security: {
    name: 'IT & Security',
    icon: '🔒',
    desc: 'Infrastructure, access, compliance, incidents, vendor management',
    subroles: ['IT Admin', 'Security Engineer', 'Security Analyst', 'IT Manager', 'Compliance Lead'],
    focusAreas: [
      {
        id: 'my-incidents', name: 'My Incidents', icon: '🚨',
        desc: 'Security incidents, alerts, response tracking',
        actions: [
          { title: 'Open security incidents assigned to me or my team', category: 'question', type: 'ask', meta: 'Jira', tags: ['jira'], top: true },
          { title: 'All P1/P2 security tickets in the last ___ days', category: 'question', type: 'ask', meta: 'Jira + AISQL', tags: ['jira','aisql'], template: [{slot: 'days', placeholder: '30', options: ['7','30','90']}], top: true },
          { title: 'Mean time to detect and resolve security incidents this quarter', category: 'question', type: 'ask', meta: 'Jira + AISQL', tags: ['jira','aisql'], multi: true, semantic: true, top: true },
          { title: 'Trending security alert types — what\'s spiking?', category: 'question', type: 'ask', meta: 'AISQL + PagerDuty', tags: ['aisql','pagerduty'], multi: true, semantic: true, top: true },
          { title: 'Generate an incident summary report for leadership', category: 'generator', type: 'ask', meta: 'Jira + AISQL', tags: ['jira','aisql'], multi: true, semantic: true },
        ]
      },
      {
        id: 'access-compliance', name: 'Access & Compliance', icon: '🔑',
        desc: 'Access reviews, SOC2, audit prep, policy compliance',
        actions: [
          { title: 'Which users have production database access?', category: 'question', type: 'ask', meta: 'Okta + AISQL', tags: ['okta','aisql'], multi: true, semantic: false, top: true },
          { title: 'Unused licenses by tool — Slack, Zoom, GitHub, Figma', category: 'question', type: 'ask', meta: 'AISQL + Okta', tags: ['aisql','okta'], multi: true, semantic: false, top: true },
          { title: 'SOC2-relevant Jira tickets completed this quarter', category: 'question', type: 'ask', meta: 'Jira', tags: ['jira'], top: true },
          { title: 'Users who haven\'t completed security training', category: 'question', type: 'ask', meta: 'HRIS + Okta', tags: ['hris','okta'], multi: true, semantic: false, top: true },
          { title: 'Generate a quarterly access review report', category: 'generator', type: 'ask', meta: 'Okta + AISQL', tags: ['okta','aisql'], multi: true, semantic: true },
        ]
      },
      {
        id: 'vendor-tools', name: 'Vendor & Tools', icon: '🛠️',
        desc: 'Vendor management, tool adoption, spend',
        actions: [
          { title: 'Which tools have the lowest adoption across the org?', category: 'question', type: 'ask', meta: 'AISQL + Okta', tags: ['aisql','okta'], multi: true, semantic: true, top: true },
          { title: 'Tool spend by vendor this quarter vs last', category: 'question', type: 'ask', meta: 'AISQL + Finance', tags: ['aisql','finance'], multi: true, semantic: false, top: true },
          { title: 'Which vendors handle PII and when were they last reviewed?', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], multi: false, semantic: true, top: true },
          { title: 'Overlap analysis — which tools have redundant functionality?', category: 'question', type: 'ask', meta: 'AISQL + Okta', tags: ['aisql','okta'], multi: true, semantic: true, top: true },
          { title: 'Auto-flag when a new SaaS vendor is added without security review', category: 'automation', type: 'auto', meta: 'Okta + Slack', tags: ['okta','slack'] },
        ]
      },
      {
        id: 'infra-health', name: 'Infra Health', icon: '🖥️',
        desc: 'System uptime, service health, capacity',
        actions: [
          { title: 'Internal service SLA compliance this quarter', category: 'question', type: 'ask', meta: 'AISQL + DataDog', tags: ['aisql','datadog'], multi: true, semantic: false, top: true },
          { title: 'Which internal services had the most downtime this month?', category: 'question', type: 'ask', meta: 'AISQL + PagerDuty', tags: ['aisql','pagerduty'], multi: true, semantic: true, top: true },
          { title: 'Cloud cost breakdown by team and service', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], multi: false, semantic: false, top: true },
          { title: 'Alert me when any internal service P99 latency exceeds ___ms', category: 'automation', type: 'auto', meta: 'DataDog + Slack', tags: ['datadog','slack'], template: [{slot: 'threshold', placeholder: '500', options: ['200','500','1000','2000']}] },
        ]
      },
    ]
  },

  legal: {
    name: 'Legal',
    icon: '⚖️',
    desc: 'Contracts, compliance, privacy, procurement, risk',
    subroles: ['Legal Counsel', 'Contracts Manager', 'Privacy Lead', 'Compliance Analyst', 'Legal Ops'],
    focusAreas: [
      {
        id: 'my-contracts', name: 'My Contracts', icon: '📄',
        desc: 'Contract status, renewals, terms, NDAs',
        actions: [
          { title: 'Enterprise contracts expiring in the next ___ days', category: 'question', type: 'ask', meta: 'Salesforce + AISQL', tags: ['salesforce','aisql'], template: [{slot: 'days', placeholder: '90', options: ['30','60','90','180']}], top: true },
          { title: 'Do we have an NDA with ___?', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], template: [{slot: 'company', placeholder: 'e.g. Okta'}], top: true },
          { title: 'Average time from legal review request to signed contract', category: 'question', type: 'ask', meta: 'Jira + Salesforce + AISQL', tags: ['jira','salesforce','aisql'], multi: true, semantic: true, top: true },
          { title: 'Open legal review requests by priority and age', category: 'question', type: 'ask', meta: 'Jira', tags: ['jira'], top: true },
          { title: 'Alert me when a contract review has been pending 5+ business days', category: 'automation', type: 'auto', meta: 'Jira + Slack', tags: ['jira','slack'], top: true },
        ]
      },
      {
        id: 'privacy-data', name: 'Privacy & Data', icon: '🛡️',
        desc: 'PII tracking, data flows, GDPR/CCPA compliance',
        actions: [
          { title: 'Which connectors handle PII and where does that data land?', category: 'question', type: 'ask', meta: 'Fivetran Schema + AISQL', tags: ['aisql'], multi: true, semantic: true, top: true },
          { title: 'Data subject access requests open and their status', category: 'question', type: 'ask', meta: 'Jira', tags: ['jira'], top: true },
          { title: 'Which customers have DPA agreements in place?', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], top: true },
          { title: 'PII data flow mapping across our connector ecosystem', category: 'question', type: 'ask', meta: 'AISQL + Fivetran Schema', tags: ['aisql'], multi: true, semantic: true, top: true },
        ]
      },
      {
        id: 'risk-litigation', name: 'Risk & Disputes', icon: '⚠️',
        desc: 'Customer disputes, escalations, account history',
        actions: [
          { title: 'Full account history for ___ — all communications, tickets, calls', category: 'question', type: 'ask', meta: 'Salesforce + Zendesk + Gong', tags: ['salesforce','zendesk','gong'], template: [{slot: 'account', placeholder: 'e.g. Acme Corp'}], top: true },
          { title: 'Customers with open disputes or credit requests', category: 'question', type: 'ask', meta: 'Salesforce + Zendesk + AISQL', tags: ['salesforce','zendesk','aisql'], multi: true, semantic: true, top: true },
          { title: 'Escalation history for ___ over the past year', category: 'question', type: 'ask', meta: 'Zendesk + Jira', tags: ['zendesk','jira'], template: [{slot: 'account', placeholder: 'e.g. Okta'}], top: true },
          { title: 'Generate a risk briefing for ___ including all touchpoints', category: 'generator', type: 'ask', meta: 'Salesforce + Zendesk + Gong + Jira', tags: ['salesforce','zendesk','gong','jira'], template: [{slot: 'account', placeholder: 'account name'}] },
        ]
      },
      {
        id: 'procurement', name: 'Procurement Review', icon: '🏷️',
        desc: 'Vendor contracts, spend approval, compliance',
        actions: [
          { title: 'Vendor contracts up for renewal in the next quarter', category: 'question', type: 'ask', meta: 'AISQL + Finance', tags: ['aisql','finance'], multi: true, semantic: false, top: true },
          { title: 'Total spend by vendor category this fiscal year', category: 'question', type: 'ask', meta: 'AISQL + Finance', tags: ['aisql','finance'], multi: true, semantic: false, top: true },
          { title: 'Which vendor agreements lack standard security clauses?', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], multi: false, semantic: true, top: true },
          { title: 'Generate a procurement compliance summary for audit', category: 'generator', type: 'ask', meta: 'AISQL + Finance', tags: ['aisql','finance'], multi: true, semantic: true },
        ]
      },
    ]
  },

  internal_ops: {
    name: 'Internal Operations',
    icon: '⚙️',
    desc: 'Process improvement, cross-functional projects, tooling, reporting',
    subroles: ['Ops Manager', 'Business Analyst', 'Program Manager', 'Systems Admin', 'Ops Lead'],
    focusAreas: [
      {
        id: 'process-metrics', name: 'Process Metrics', icon: '📈',
        desc: 'Bottlenecks, cycle times, efficiency trends',
        actions: [
          { title: 'Average lead-to-close time by segment and quarter', category: 'question', type: 'ask', meta: 'Salesforce + AISQL', tags: ['salesforce','aisql'], multi: true, semantic: true, top: true },
          { title: 'Where are deals getting stuck the longest in the pipeline?', category: 'question', type: 'ask', meta: 'Salesforce + AISQL', tags: ['salesforce','aisql'], multi: true, semantic: true, top: true },
          { title: 'Support ticket resolution time by priority and team', category: 'question', type: 'ask', meta: 'Zendesk + AISQL', tags: ['zendesk','aisql'], multi: true, semantic: false, top: true },
          { title: 'Handoff time between teams for ___', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], template: [{slot: 'process', placeholder: 'e.g. sales-to-CS, support-to-eng, lead-to-opp'}], top: true },
          { title: 'Generate a process efficiency report with bottleneck analysis', category: 'generator', type: 'ask', meta: 'Salesforce + Zendesk + AISQL', tags: ['salesforce','zendesk','aisql'], multi: true, semantic: true },
        ]
      },
      {
        id: 'cross-team', name: 'Cross-Team Health', icon: '🔄',
        desc: 'Org-wide dashboards, team comparisons, alignment',
        actions: [
          { title: 'Key metrics dashboard across Sales, Support, Engineering, and Product', category: 'question', type: 'ask', meta: 'Salesforce + Zendesk + Jira + AISQL', tags: ['salesforce','zendesk','jira','aisql'], multi: true, semantic: true, top: true },
          { title: 'Which teams have the most overdue Jira tickets?', category: 'question', type: 'ask', meta: 'Jira + AISQL', tags: ['jira','aisql'], multi: true, semantic: false, top: true },
          { title: 'Meeting load analysis — which teams spend the most time in meetings?', category: 'question', type: 'ask', meta: 'Google Calendar + AISQL', tags: ['aisql'], multi: false, semantic: true, top: true },
          { title: 'OKR progress by team this quarter', category: 'question', type: 'ask', meta: 'Jira + AISQL', tags: ['jira','aisql'], multi: true, semantic: true, top: true },
        ]
      },
      {
        id: 'tool-adoption', name: 'Tool Adoption', icon: '🧰',
        desc: 'Which tools are being used, by whom, and how much',
        actions: [
          { title: 'Internal tool adoption rates by department', category: 'question', type: 'ask', meta: 'AISQL + Okta', tags: ['aisql','okta'], multi: true, semantic: true, top: true },
          { title: 'Which tools have the lowest ROI based on spend vs usage?', category: 'question', type: 'ask', meta: 'AISQL + Finance', tags: ['aisql','finance'], multi: true, semantic: true, top: true },
          { title: 'New hire tool adoption — how quickly do they ramp?', category: 'question', type: 'ask', meta: 'AISQL + HRIS + Okta', tags: ['aisql','hris','okta'], multi: true, semantic: true, top: true },
          { title: 'Triage adoption by department — who\'s using AI and who isn\'t?', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], multi: false, semantic: true, top: true },
        ]
      },
      {
        id: 'planning-reporting', name: 'Planning & Reporting', icon: '📊',
        desc: 'Quarterly planning, budget tracking, exec reporting',
        actions: [
          { title: 'Budget vs actuals by department this quarter', category: 'question', type: 'ask', meta: 'AISQL + Finance', tags: ['aisql','finance'], multi: true, semantic: false, top: true },
          { title: 'Headcount plan vs actual by team', category: 'question', type: 'ask', meta: 'HRIS + Finance + AISQL', tags: ['hris','finance','aisql'], multi: true, semantic: false, top: true },
          { title: 'Build a weekly ops report for leadership', category: 'generator', type: 'ask', meta: 'Salesforce + Zendesk + Jira + AISQL', tags: ['salesforce','zendesk','jira','aisql'], multi: true, semantic: true, top: true },
          { title: 'What changed week-over-week across our core business metrics?', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], multi: false, semantic: true, top: true },
        ]
      },
    ]
  },

  systems_engineering: {
    name: 'Systems Engineering',
    icon: '🖧',
    desc: 'Infrastructure, deployment, CI/CD, monitoring, platform reliability',
    subroles: ['Platform Engineer', 'SRE', 'DevOps Engineer', 'Infra Lead', 'Systems Architect'],
    focusAreas: [
      {
        id: 'my-services', name: 'My Services', icon: '🔧',
        desc: 'Services you own — health, latency, errors',
        actions: [
          { title: 'Health check on ___ — latency, error rate, throughput', category: 'question', type: 'ask', meta: 'DataDog + AISQL', tags: ['datadog','aisql'], template: [{slot: 'service name', placeholder: 'e.g. connector-service, sync-worker'}], top: true },
          { title: 'Which of my services have degraded in the last 24 hours?', category: 'question', type: 'ask', meta: 'DataDog + AISQL', tags: ['datadog','aisql'], multi: true, semantic: true, top: true },
          { title: 'Service dependency map for ___', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], template: [{slot: 'service', placeholder: 'service name'}], top: true },
          { title: 'Alert me when ___ p99 latency exceeds ___ms', category: 'automation', type: 'auto', meta: 'DataDog + Slack', tags: ['datadog','slack'], template: [{slot: 'service', placeholder: 'service name'}, {slot: 'threshold', placeholder: '500'}], top: true },
          { title: 'What\'s the cloud cost for ___ this month vs last?', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], template: [{slot: 'service', placeholder: 'service name'}] },
        ]
      },
      {
        id: 'deployments', name: 'Deployments', icon: '🚀',
        desc: 'Deploy frequency, rollbacks, build health',
        actions: [
          { title: 'Deployment frequency and rollback rate this ___', category: 'question', type: 'ask', meta: 'GitHub + AISQL', tags: ['github','aisql'], template: [{slot: 'period', placeholder: 'week', options: ['week','month','quarter']}], top: true },
          { title: 'My recent deployments — did any cause regressions?', category: 'question', type: 'ask', meta: 'GitHub + DataDog + AISQL', tags: ['github','datadog','aisql'], multi: true, semantic: true, top: true },
          { title: 'Average build time by repo — which are slowest?', category: 'question', type: 'ask', meta: 'GitHub + AISQL', tags: ['github','aisql'], multi: true, semantic: false, top: true },
          { title: 'Change failure rate by team this quarter', category: 'question', type: 'ask', meta: 'GitHub + AISQL', tags: ['github','aisql'], multi: true, semantic: true, top: true },
        ]
      },
      {
        id: 'on-call', name: 'On-Call', icon: '📟',
        desc: 'Pages, alert fatigue, incident response',
        actions: [
          { title: 'Who\'s been paged the most this month and for what?', category: 'question', type: 'ask', meta: 'PagerDuty + AISQL', tags: ['pagerduty','aisql'], multi: true, semantic: true, top: true },
          { title: 'Top 10 noisiest alerts — which should be tuned or muted?', category: 'question', type: 'ask', meta: 'PagerDuty + AISQL', tags: ['pagerduty','aisql'], multi: true, semantic: true, top: true },
          { title: 'MTTR trend for production incidents this quarter', category: 'question', type: 'ask', meta: 'Jira + PagerDuty + AISQL', tags: ['jira','pagerduty','aisql'], multi: true, semantic: true, top: true },
          { title: 'Generate a post-incident review for incident ___', category: 'generator', type: 'ask', meta: 'Jira + PagerDuty + Slack', tags: ['jira','pagerduty','slack'], template: [{slot: 'incident ID or name', placeholder: 'e.g. INC-1234'}], top: true },
        ]
      },
      {
        id: 'capacity', name: 'Capacity & Cost', icon: '💾',
        desc: 'Storage growth, compute scaling, cost optimization',
        actions: [
          { title: 'Storage growth projection for the next quarter', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], multi: false, semantic: true, top: true },
          { title: 'Cloud cost per request by service — where are we overspending?', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], multi: false, semantic: true, top: true },
          { title: 'Which services have the most idle capacity?', category: 'question', type: 'ask', meta: 'AISQL + DataDog', tags: ['aisql','datadog'], multi: true, semantic: true, top: true },
          { title: 'Compute utilization by team and environment', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], multi: false, semantic: false, top: true },
          { title: 'Generate a monthly infra cost report with optimization recommendations', category: 'generator', type: 'ask', meta: 'AISQL', tags: ['aisql'], multi: false, semantic: true },
        ]
      },
    ]
  },

  customer_solutions: {
    name: 'Customer Solutions Group',
    icon: '🎯',
    desc: 'Implementation, onboarding, technical success, customer health',
    subroles: ['Solutions Architect', 'Implementation Engineer', 'CSM', 'Technical Account Manager', 'Onboarding Lead'],
    focusAreas: [
      {
        id: 'my-customers', name: 'My Customers', icon: '👤',
        desc: 'Health, usage, risk for your assigned accounts',
        actions: [
          { title: 'Customer health scorecard for ___', category: 'question', type: 'ask', meta: 'Salesforce + Zendesk + AISQL', tags: ['salesforce','zendesk','aisql'], template: [{slot: 'account', placeholder: 'e.g. Okta'}], top: true },
          { title: 'Which of my customers have declining connector usage?', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], multi: false, semantic: true, top: true },
          { title: 'Open support tickets across all my accounts by priority', category: 'question', type: 'ask', meta: 'Zendesk + Salesforce', tags: ['zendesk','salesforce'], multi: true, semantic: false, top: true },
          { title: 'Which customers haven\'t been contacted in ___ days?', category: 'question', type: 'ask', meta: 'Salesforce + Gong', tags: ['salesforce','gong'], template: [{slot: 'days', placeholder: '30', options: ['14','30','60']}], top: true },
          { title: 'Auto-alert me when a customer\'s sync failure rate spikes', category: 'automation', type: 'auto', meta: 'AISQL + Slack', tags: ['aisql','slack'] },
        ]
      },
      {
        id: 'onboarding', name: 'Onboarding', icon: '🏗️',
        desc: 'Implementation progress, time-to-value, blockers',
        actions: [
          { title: 'Which customers are in onboarding and what stage?', category: 'question', type: 'ask', meta: 'Salesforce + Jira', tags: ['salesforce','jira'], multi: true, semantic: false, top: true },
          { title: 'Average time-to-first-sync by connector type', category: 'question', type: 'ask', meta: 'AISQL', tags: ['aisql'], multi: false, semantic: true, top: true },
          { title: 'Which onboarding implementations are behind schedule?', category: 'question', type: 'ask', meta: 'Jira + Salesforce', tags: ['jira','salesforce'], multi: true, semantic: true, top: true },
          { title: 'Common onboarding blockers this quarter', category: 'question', type: 'ask', meta: 'Jira + Zendesk + AISQL', tags: ['jira','zendesk','aisql'], multi: true, semantic: true, top: true },
        ]
      },
      {
        id: 'renewals-expansion', name: 'Renewals & Expansion', icon: '📈',
        desc: 'Upcoming renewals, expansion signals, churn risk',
        actions: [
          { title: 'My renewals coming up in the next ___ days', category: 'question', type: 'ask', meta: 'Salesforce', tags: ['salesforce'], template: [{slot: 'days', placeholder: '90', options: ['30','60','90']}], top: true },
          { title: 'Which of my accounts show expansion signals?', category: 'question', type: 'ask', meta: 'AISQL + Salesforce', tags: ['aisql','salesforce'], multi: true, semantic: true, top: true },
          { title: 'Churn risk analysis for ___ — usage trends, sentiment, tickets', category: 'question', type: 'ask', meta: 'AISQL + Zendesk + Gong + Salesforce', tags: ['aisql','zendesk','gong','salesforce'], template: [{slot: 'account', placeholder: 'e.g. Amplify Life'}], top: true },
          { title: 'What did ___ say on their last Gong call about renewal?', category: 'question', type: 'ask', meta: 'Gong', tags: ['gong'], template: [{slot: 'account', placeholder: 'account name'}], top: true },
        ]
      },
    ]
  },
};

// ════════════════════════════════════════════════════════
// SOURCE TAG COLORS
// ════════════════════════════════════════════════════════

const TAG_COLORS = {
  salesforce: { bg: '#dbeafe', text: '#1e40af', label: 'Salesforce' },
  amplitude: { bg: '#ccfbf1', text: '#0d7377', label: 'Amplitude' },
  gong: { bg: '#fce7e7', text: '#c0392b', label: 'Gong' },
  zendesk: { bg: '#fff3e0', text: '#e65100', label: 'Zendesk' },
  jira: { bg: '#ede9fe', text: '#6d28d9', label: 'Jira' },
  github: { bg: '#f3f4f6', text: '#374151', label: 'GitHub' },
  slack: { bg: '#fce4ec', text: '#c2185b', label: 'Slack' },
  marketo: { bg: '#e8f5e9', text: '#2e7d32', label: 'Marketo' },
  ga4: { bg: '#e8f5e9', text: '#2e7d32', label: 'GA4' },
  clearbit: { bg: '#dbeafe', text: '#1e40af', label: 'Clearbit' },
  snowflake: { bg: '#e0f2fe', text: '#0369a1', label: 'Snowflake' },
  dbt: { bg: '#fef3c7', text: '#92400e', label: 'dbt' },
  looker: { bg: '#fee2e2', text: '#991b1b', label: 'Looker' },
  tableau: { bg: '#fee2e2', text: '#991b1b', label: 'Tableau' },
  bombora: { bg: '#ede9fe', text: '#6d28d9', label: 'Bombora' },
  pagerduty: { bg: '#fee2e2', text: '#991b1b', label: 'PagerDuty' },
  datadog: { bg: '#ede9fe', text: '#6d28d9', label: 'DataDog' },
  hris: { bg: '#f3f4f6', text: '#374151', label: 'HRIS' },
  finance: { bg: '#ccfbf1', text: '#0d7377', label: 'Finance' },
  ats: { bg: '#ede9fe', text: '#6d28d9', label: 'ATS' },
  'culture-amp': { bg: '#fce4ec', text: '#c2185b', label: 'Culture Amp' },
  billing: { bg: '#ccfbf1', text: '#0d7377', label: 'Billing' },
  okta: { bg: '#dbeafe', text: '#1e40af', label: 'Okta' },
  aisql: { bg: '#d1fae5', text: '#065f46', label: 'Fivetran AI' },
  'fivetran-schema': { bg: '#d1fae5', text: '#065f46', label: 'Fivetran Schema' },
  fivetran: { bg: '#dbeafe', text: '#1565c0', label: 'Fivetran' },
  outreach: { bg: '#ede9fe', text: '#6d28d9', label: 'Outreach' },
  gainsight: { bg: '#e8f5e9', text: '#2e7d32', label: 'Gainsight' },
  linkedin: { bg: '#dbeafe', text: '#1e40af', label: 'LinkedIn' },
  aws: { bg: '#fff3e0', text: '#e65100', label: 'AWS' },
  'google-ads': { bg: '#e8f5e9', text: '#2e7d32', label: 'Google Ads' },
  'semantic-layer': { bg: '#7c3aed', text: '#ffffff', label: 'Semantic Layer' },
  workday: { bg: '#dbeafe', text: '#0066CC', label: 'Workday' },
  hr: { bg: '#fce4ec', text: '#E91E63', label: 'HR' },
  coupa: { bg: '#e3f2fd', text: '#2196F3', label: 'Coupa' },
  navan: { bg: '#e0f7fa', text: '#00BCD4', label: 'Navan' },
  it: { bg: '#eceff1', text: '#607D8B', label: 'IT' },
  office: { bg: '#f1f8e9', text: '#8BC34A', label: 'Office' },
  internal: { bg: '#f5f5f5', text: '#9E9E9E', label: 'Internal' },
  lms: { bg: '#fff3e0', text: '#FF9800', label: 'LMS' },
  highspot: { bg: '#fbe9e7', text: '#FF5722', label: 'Highspot' },
  lattice: { bg: '#ede7f6', text: '#673AB7', label: 'Lattice' },
  fidelity: { bg: '#e8f5e9', text: '#4CAF50', label: 'Fidelity' },
  carta: { bg: '#e8eaf6', text: '#3F51B5', label: 'Carta' },
  'google-calendar': { bg: '#e3f2fd', text: '#4285F4', label: 'Google Calendar' },
};

// ════════════════════════════════════════════════════════
// ACTION TYPE STYLES (backward compat)
// ════════════════════════════════════════════════════════

const TYPE_STYLES = {
  ask: { bg: '#EEEDFE', border: '#AFA9EC', label: 'Question' },
  auto: { bg: '#E1F5EE', border: '#5DCAA5', label: 'Automation' },
  act: { bg: '#FCEBEB', border: '#F09595', label: 'Action' },
};

// ════════════════════════════════════════════════════════
// CATEGORY STYLES (new)
// ════════════════════════════════════════════════════════

const CATEGORY_STYLES = {
  question: { icon: '❓', label: 'Question', bg: '#EEEDFE', text: '#9DBF10' },
  automation: { icon: '⚡', label: 'Automation', bg: '#E1F5EE', text: '#10b981' },
  action: { icon: '🎯', label: 'Action', bg: '#FCEBEB', text: '#ef4444' },
  generator: { icon: '✨', label: 'Generate', bg: '#FEF3C7', text: '#d97706' },
};

// ════════════════════════════════════════════════════════
// EMPLOYEE HELP — Universal questions every employee can ask
// ════════════════════════════════════════════════════════

const EMPLOYEE_HELP = {
  label: 'Company',
  icon: '🏢',
  description: 'company info, policies, HR, IT',
  categories: [
    {
      id: 'time-off',
      name: 'Time Off & Leave',
      icon: '🏖️',
      actions: [
        { title: 'Submit a time off request', category: 'action', type: 'act', meta: 'Workday', tags: ['Workday'], top: true },
        { title: 'Check my PTO balance', category: 'question', type: 'ask', meta: 'Workday', tags: ['Workday'], top: true },
        { title: 'What are our company holidays this year?', category: 'question', type: 'ask', meta: 'HR Portal', tags: ['HR'] },
        { title: "What's our parental leave policy?", category: 'question', type: 'ask', meta: 'HR Portal', tags: ['HR'] },
        { title: 'How do I request a leave of absence?', category: 'question', type: 'ask', meta: 'HR Portal', tags: ['HR'] },
      ]
    },
    {
      id: 'comp-benefits',
      name: 'Compensation & Benefits',
      icon: '💰',
      actions: [
        { title: "What's my comp plan?", category: 'question', type: 'ask', meta: 'Workday + Finance', tags: ['Workday', 'Finance'], top: true },
        { title: 'When is open enrollment?', category: 'question', type: 'ask', meta: 'HR Portal', tags: ['HR'] },
        { title: 'How do I set up or change my 401k?', category: 'question', type: 'ask', meta: 'Fidelity + HR', tags: ['HR'] },
        { title: "What's our equity vesting schedule?", category: 'question', type: 'ask', meta: 'Carta + HR', tags: ['HR'] },
        { title: 'How do I update my tax withholdings?', category: 'question', type: 'ask', meta: 'Workday', tags: ['Workday'] },
      ]
    },
    {
      id: 'expenses-travel',
      name: 'Expenses & Travel',
      icon: '✈️',
      actions: [
        { title: 'How do I submit an expense report?', category: 'question', type: 'ask', meta: 'Coupa', tags: ['Coupa'], top: true },
        { title: "What's our travel policy?", category: 'question', type: 'ask', meta: 'HR Portal', tags: ['HR'] },
        { title: "What's the per diem for client dinners?", category: 'question', type: 'ask', meta: 'Finance', tags: ['Finance'] },
        { title: 'How do I book a flight or hotel?', category: 'question', type: 'ask', meta: 'Navan', tags: ['Navan'] },
        { title: 'Submit an expense report now', category: 'action', type: 'act', meta: 'Coupa', tags: ['Coupa'] },
      ]
    },
    {
      id: 'it-access',
      name: 'IT & Access',
      icon: '🔐',
      actions: [
        { title: "What's the office WiFi password?", category: 'question', type: 'ask', meta: 'IT', tags: ['IT'], top: true },
        { title: 'How do I reset my password?', category: 'question', type: 'ask', meta: 'Okta', tags: ['Okta'] },
        { title: 'How do I get access to a new tool?', category: 'question', type: 'ask', meta: 'IT + Okta', tags: ['IT', 'Okta'] },
        { title: 'How do I set up VPN?', category: 'question', type: 'ask', meta: 'IT', tags: ['IT'] },
        { title: 'Request access to a system', category: 'action', type: 'act', meta: 'IT', tags: ['IT'] },
      ]
    },
    {
      id: 'company-info',
      name: 'Company Info',
      icon: '🏢',
      actions: [
        { title: 'When is the next all-hands?', category: 'question', type: 'ask', meta: 'Google Calendar', tags: ['Google Calendar'], top: true },
        { title: 'Where do I find the org chart?', category: 'question', type: 'ask', meta: 'Workday', tags: ['Workday'] },
        { title: 'Who do I talk to about X?', category: 'question', type: 'ask', meta: 'Slack + Workday', tags: ['Slack', 'Workday'] },
        { title: "What's our company mission and values?", category: 'question', type: 'ask', meta: 'Internal', tags: ['Internal'] },
        { title: 'Where are the office supplies / snacks?', category: 'question', type: 'ask', meta: 'Office', tags: ['Office'] },
      ]
    },
    {
      id: 'growth',
      name: 'Onboarding & Growth',
      icon: '📈',
      actions: [
        { title: 'Where is the employee handbook?', category: 'question', type: 'ask', meta: 'HR Portal', tags: ['HR'], top: true },
        { title: 'How do performance reviews work?', category: 'question', type: 'ask', meta: 'HR + Lattice', tags: ['HR', 'Lattice'] },
        { title: "What's the promotion process?", category: 'question', type: 'ask', meta: 'HR + Lattice', tags: ['HR', 'Lattice'] },
        { title: 'How do I find a mentor?', category: 'question', type: 'ask', meta: 'HR', tags: ['HR'] },
        { title: 'What enablement courses are available?', category: 'question', type: 'ask', meta: 'LMS + Highspot', tags: ['LMS', 'Highspot'] },
      ]
    },
  ]
};

// ════════════════════════════════════════════════════════
// COMPANY TASKS — Tasks pushed by managers, HR, compliance
// ════════════════════════════════════════════════════════

const COMPANY_TASKS = [
  {
    id: 'cert-1',
    title: 'Complete Product Certification: Fivetran Fundamentals',
    source: 'enablement',
    pushedBy: 'Sales Enablement',
    dueDate: '2026-03-28',
    urgency: 'high',
    category: 'enablement',
    link: '#',
    buddyMsg: "hey, your fivetran fundamentals cert is due friday. want me to block 30 min for it?",
  },
  {
    id: 'security-1',
    title: 'Annual Security Awareness Training',
    source: 'compliance',
    pushedBy: 'IT Security',
    dueDate: '2026-03-30',
    urgency: 'medium',
    category: 'compliance',
    link: '#',
    buddyMsg: "security training is due end of month. it's about 20 min — want to knock it out now?",
  },
  {
    id: 'forecast-1',
    title: 'Submit Q1 Forecast Update',
    source: 'manager',
    pushedBy: 'VP Sales',
    dueDate: '2026-03-25',
    urgency: 'high',
    category: 'task',
    link: '#',
    buddyMsg: "your vp wants forecast updates by tomorrow. want me to pull your current numbers?",
  },
  {
    id: 'okr-1',
    title: 'Q1 OKR: Achieve 120% Pipeline Coverage',
    source: 'company',
    pushedBy: 'Company',
    progress: 85,
    target: 120,
    category: 'okr',
    buddyMsg: "you're at 85% of your pipeline coverage target. 35% to go — want to see which accounts to focus on?",
  },
  {
    id: 'enablement-2',
    title: 'Watch: New MCP Product Demo Recording',
    source: 'enablement',
    pushedBy: 'Product Marketing',
    dueDate: '2026-04-01',
    urgency: 'low',
    category: 'enablement',
    link: '#',
    buddyMsg: "product marketing posted a new mcp demo. 15 min watch — could be useful for your USAA deal.",
  },
  {
    id: 'hr-1',
    title: 'Complete Manager Feedback Survey',
    source: 'hr',
    pushedBy: 'People Ops',
    dueDate: '2026-03-26',
    urgency: 'medium',
    category: 'compliance',
    link: '#',
    buddyMsg: "people ops needs your manager feedback survey by wednesday. takes about 5 min.",
  },
];

// ════════════════════════════════════════════════════════
// KNOWLEDGE ACTIONS — Task-oriented queries against real knowledge sources
// Organized by what the user is trying to DO, not by source
// ════════════════════════════════════════════════════════

const KNOWLEDGE_SOURCE_COLORS = {
  gongio:                      { label: 'Gong',        color: '#E8634A' },
  salesforce:                  { label: 'Salesforce',   color: '#5A67D8' },
  slab:                        { label: 'Slab',         color: '#D4941A' },
  fivetran_public_docs:        { label: 'Public Docs',  color: '#2A9D8F' },
  zendesk_new:                 { label: 'Zendesk',      color: '#C44569' },
  jira:                        { label: 'Jira',         color: '#9DBF10' },
  github:                      { label: 'GitHub',       color: '#5C4F3D' },
  product_requirements_documents: { label: 'PRDs',      color: '#D4941A' },
};

const KNOWLEDGE_ACTIONS = {
  categories: [
    {
      id: 'call-prep',
      name: 'Call Prep',
      icon: '\uD83C\uDF99\uFE0F',
      description: 'Get ready for your next meeting',
      actions: [
        {
          id: 'kn-last-call',
          title: 'What happened on the last call with ___?',
          fields: [{ key: 'account', placeholder: 'account name', required: true }],
          sources: ['gongio', 'salesforce'],
          query: (fields) => `summarize the last call with ${fields.account}. what was discussed, what were the key takeaways, and what are the next steps?`,
        },
        {
          id: 'kn-account-history',
          title: 'Give me the full history on ___',
          fields: [{ key: 'account', placeholder: 'account name', required: true }],
          sources: ['salesforce', 'gongio', 'zendesk_new'],
          query: (fields) => `what is the full history of our relationship with ${fields.account}? include deal status, recent calls, support tickets, and any key contacts.`,
        },
        {
          id: 'kn-stakeholders',
          title: 'Who are the key contacts at ___?',
          fields: [{ key: 'account', placeholder: 'account name', required: true }],
          sources: ['salesforce', 'gongio'],
          query: (fields) => `who are the key contacts and stakeholders at ${fields.account}? include their roles, last interaction, and any notes.`,
        },
        {
          id: 'kn-objections',
          title: 'What objections came up with ___?',
          fields: [{ key: 'account', placeholder: 'account name', required: true }],
          sources: ['gongio'],
          query: (fields) => `what objections or concerns did ${fields.account} raise in recent calls? how were they handled?`,
        },
        {
          id: 'kn-support-issues',
          title: 'Any open support issues for ___?',
          fields: [{ key: 'account', placeholder: 'account name', required: true }],
          sources: ['zendesk_new', 'jira'],
          query: (fields) => `what are the recent or open support tickets for ${fields.account}? any unresolved issues I should know about before a call?`,
        },
      ],
    },
    {
      id: 'competitive',
      name: 'Competitive Intel',
      icon: '\u2694\uFE0F',
      description: 'Know your competition',
      actions: [
        {
          id: 'kn-vs-competitor',
          title: 'How do we position against ___?',
          fields: [{ key: 'competitor', placeholder: 'competitor name (e.g. Airbyte)', required: true }],
          sources: ['slab', 'fivetran_public_docs'],
          query: (fields) => `what is our competitive positioning against ${fields.competitor}? include key differentiators, messaging, and common objections.`,
        },
        {
          id: 'kn-battlecard',
          title: 'Pull up the battlecard for ___',
          fields: [{ key: 'competitor', placeholder: 'competitor name', required: true }],
          sources: ['slab'],
          query: (fields) => `find the battlecard or competitive analysis for ${fields.competitor}. include win themes, weaknesses to exploit, and customer proof points.`,
        },
        {
          id: 'kn-win-stories',
          title: 'Deals we won against ___',
          fields: [{ key: 'competitor', placeholder: 'competitor name', required: true }],
          sources: ['gongio', 'salesforce'],
          query: (fields) => `what deals have we won against ${fields.competitor}? what were the key reasons we won?`,
        },
        {
          id: 'kn-competitor-mentions',
          title: 'Recent calls mentioning ___',
          fields: [{ key: 'competitor', placeholder: 'competitor name', required: true }],
          sources: ['gongio'],
          query: (fields) => `find recent Gong calls where ${fields.competitor} was mentioned. what were prospects saying about them?`,
        },
        {
          id: 'kn-competitive-landscape',
          title: 'Full competitive landscape overview',
          fields: [],
          sources: ['slab', 'fivetran_public_docs'],
          query: () => `give me an overview of the competitive landscape for Fivetran. who are the main competitors and how do we position against each?`,
        },
      ],
    },
    {
      id: 'product-knowledge',
      name: 'Product Knowledge',
      icon: '\uD83D\uDCDA',
      description: 'Know your product inside out',
      actions: [
        {
          id: 'kn-connector-info',
          title: 'Tell me about the ___ connector',
          fields: [{ key: 'connector', placeholder: 'connector name (e.g. Salesforce, Postgres)', required: true }],
          sources: ['fivetran_public_docs'],
          query: (fields) => `what does the ${fields.connector} connector do? how does it work, what data does it sync, and what are the setup requirements?`,
        },
        {
          id: 'kn-feature-explain',
          title: 'Explain ___ to a customer',
          fields: [{ key: 'feature', placeholder: 'feature name (e.g. HVR, transformations, data lakes)', required: true }],
          sources: ['fivetran_public_docs', 'slab'],
          query: (fields) => `explain ${fields.feature} in a way I can describe it to a customer. include the value prop, how it works, and use cases.`,
        },
        {
          id: 'kn-pricing',
          title: 'How does pricing work for ___?',
          fields: [{ key: 'product', placeholder: 'product area (e.g. data lakes, HVR, standard)', required: true }],
          sources: ['fivetran_public_docs', 'slab'],
          query: (fields) => `how does Fivetran pricing work for ${fields.product}? include the pricing model, tiers, and what customers typically pay.`,
        },
        {
          id: 'kn-roadmap',
          title: "What's on the roadmap for ___?",
          fields: [{ key: 'area', placeholder: 'product area', required: true }],
          sources: ['slab', 'product_requirements_documents', 'jira'],
          query: (fields) => `what is on the roadmap for ${fields.area}? what features are coming and when?`,
        },
        {
          id: 'kn-known-issues',
          title: 'Known issues with ___',
          fields: [{ key: 'connector', placeholder: 'connector or feature name', required: true }],
          sources: ['jira', 'zendesk_new'],
          query: (fields) => `what are the known issues or common problems with ${fields.connector}? include any workarounds.`,
        },
        {
          id: 'kn-use-cases',
          title: 'Best use cases for ___',
          fields: [{ key: 'product', placeholder: 'product or feature', required: true }],
          sources: ['slab', 'fivetran_public_docs', 'gongio'],
          query: (fields) => `what are the best use cases for ${fields.product}? include customer examples if available.`,
        },
      ],
    },
    {
      id: 'internal',
      name: 'Internal Lookup',
      icon: '\uD83C\uDFE2',
      description: 'Find people, processes, and docs',
      actions: [
        {
          id: 'kn-who-owns',
          title: 'Who owns ___?',
          fields: [{ key: 'thing', placeholder: 'product area, program, or team', required: true }],
          sources: ['slab'],
          query: (fields) => `who owns or manages ${fields.thing} at Fivetran? include their name, email, and role.`,
        },
        {
          id: 'kn-team-info',
          title: 'Tell me about the ___ team',
          fields: [{ key: 'team', placeholder: 'team name', required: true }],
          sources: ['slab'],
          query: (fields) => `tell me about the ${fields.team} team at Fivetran. who's on it, what do they own, and how do they work?`,
        },
        {
          id: 'kn-process',
          title: 'How does ___ work internally?',
          fields: [{ key: 'process', placeholder: 'process (e.g. deal desk, security review, POC)', required: true }],
          sources: ['slab'],
          query: (fields) => `how does the ${fields.process} process work at Fivetran? what are the steps and who's involved?`,
        },
        {
          id: 'kn-messaging',
          title: 'Messaging and positioning for ___',
          fields: [{ key: 'topic', placeholder: 'product or use case', required: true }],
          sources: ['slab'],
          query: (fields) => `what is the official messaging and positioning for ${fields.topic}? include key talking points and value props.`,
        },
        {
          id: 'kn-enablement',
          title: 'Find enablement materials for ___',
          fields: [{ key: 'topic', placeholder: 'topic or product area', required: true }],
          sources: ['slab', 'fivetran_public_docs'],
          query: (fields) => `find training, enablement, or learning materials about ${fields.topic}. include links to relevant docs, recordings, or resources.`,
        },
      ],
    },
    {
      id: 'customer-intel',
      name: 'Customer Intelligence',
      icon: '\uD83D\uDD0D',
      description: 'Deep dive on any account',
      actions: [
        {
          id: 'kn-customer-health',
          title: 'How is ___ doing overall?',
          fields: [{ key: 'account', placeholder: 'account name', required: true }],
          sources: ['salesforce', 'zendesk_new', 'gongio'],
          query: (fields) => `give me a health check on ${fields.account}. include deal status, recent support tickets, call sentiment, and any risks.`,
        },
        {
          id: 'kn-customer-usage',
          title: 'What is ___ using Fivetran for?',
          fields: [{ key: 'account', placeholder: 'account name', required: true }],
          sources: ['salesforce', 'gongio'],
          query: (fields) => `what is ${fields.account} using Fivetran for? what connectors and destinations are they using or interested in?`,
        },
        {
          id: 'kn-expansion-opp',
          title: 'Expansion opportunities at ___',
          fields: [{ key: 'account', placeholder: 'account name', required: true }],
          sources: ['salesforce', 'gongio'],
          query: (fields) => `what expansion opportunities exist at ${fields.account}? have they mentioned new use cases, teams, or data sources in recent calls?`,
        },
        {
          id: 'kn-customer-feedback',
          title: 'What has ___ been saying about us?',
          fields: [{ key: 'account', placeholder: 'account name', required: true }],
          sources: ['gongio', 'zendesk_new'],
          query: (fields) => `what has ${fields.account} been saying about Fivetran in recent calls and support interactions? any praise or complaints?`,
        },
        {
          id: 'kn-similar-customers',
          title: 'Customers similar to ___',
          fields: [{ key: 'account', placeholder: 'account name or industry', required: true }],
          sources: ['salesforce', 'gongio'],
          query: (fields) => `find customers similar to ${fields.account}. same industry, similar size, or similar use cases. include any case studies or references.`,
        },
      ],
    },
  ],
};
