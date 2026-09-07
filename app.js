// AppServiceDesk — view router

const STANDARDS = [
  'Data Analyst',
  'Data Technician',
  'Applied AI & Automation',
  'Multi-Channel Marketer',
  'Assistant Accountant',
  'Professional Accounting Technician',
  'Digital Support Technician',
  'Business Administrator',
  'Operations/Departmental Manager',
];

const CATEGORIES = [
  {
    id: 'learner-status',
    icon: '📋',
    title: 'Changes in Learner Status',
    desc: 'Request a change to a learner\'s current programme status, including withdrawals, breaks in learning, and transfers.',
  },
  {
    id: 'new-learner',
    icon: '🎓',
    title: 'New Learner Requests',
    desc: 'Submit a new learner enrolment request or raise a suitability concern within the first 30 days of a learner\'s programme.',
  },
  {
    id: 'curriculum',
    icon: '📚',
    title: 'Curriculum Requests',
    desc: 'Submit requests relating to learning content, delivery adjustments, or off-the-job training queries.',
  },
  {
    id: 'other',
    icon: '💬',
    title: 'Other',
    desc: 'Anything that doesn\'t fit the categories above. Provide as much detail as possible so we can route your request.',
  },
];

const NEW_LEARNER_TYPES = [
  {
    id: 'new-enrolment',
    icon: '📝',
    title: 'New Learner Enrolment',
    desc: 'Raise an enrolment request for a learner who is ready to begin their apprenticeship programme.',
  },
  {
    id: 'suitability-concern',
    icon: '⚠️',
    title: 'New Learner Suitability Concern',
    desc: 'Flag a concern about a learner\'s suitability within the first 30 days of their programme.',
  },
];

const SUITABILITY_TYPES = [
  {
    id: 'role-suitability',
    icon: '🔍',
    title: 'New Learner Suitability Concern: Role Suitability',
    desc: 'Raise a concern that the learner may not be suited to the role or apprenticeship standard they are enrolled on.',
  },
  {
    id: 'commitment-concern',
    icon: '📉',
    title: 'New Learner Suitability Concern: Commitment Concern',
    desc: 'Raise a concern about a learner\'s level of commitment or engagement with their programme.',
  },
];

const CURRICULUM_TYPES = [
  {
    id: 'technical-mentor',
    icon: '🧑‍🏫',
    title: 'Curriculum Requests: Technical Mentor Request',
    desc: 'Enlist support from a subject matter expert to assist a learner with technical aspects of their programme.',
  },
  {
    id: 'curriculum-feedback',
    icon: '💡',
    title: 'Curriculum Requests: Curriculum Feedback',
    desc: 'Submit feedback or suggestions to the curriculum and product team to help improve learning content and delivery.',
  },
  {
    id: 'platform-request',
    icon: '🖥️',
    title: 'Curriculum Requests: Platform Request',
    desc: 'Log a request relating to our bespoke LMS, including access, content, or feature requests.',
  },
  {
    id: 'system-support',
    icon: '🔧',
    title: 'Curriculum Requests: System Support',
    desc: 'Report a technical issue with the VLE or LMS so it can be investigated and resolved.',
  },
];

const LEARNER_STATUS_TYPES = [
  {
    id: 'achievement',
    icon: '🏆',
    title: 'Changes in Learner Status: Achievement',
    desc: 'Learner has successfully completed and achieved their qualification.',
  },
  {
    id: 'refer',
    icon: '❌',
    title: 'Changes in Learner Status: Refer (Fail)',
    desc: 'Learner has not met the required standard and needs to be referred.',
  },
  {
    id: 'gateway',
    icon: '🎯',
    title: 'Changes in Learner Status: Gateway to End Point Assessment',
    desc: 'Learner is ready to progress to their End Point Assessment.',
  },
  {
    id: 'bil',
    icon: '⏸️',
    title: 'Changes in Learner Status: Agreed Break in Learning (BIL)',
    desc: 'Request a temporary pause in a learner\'s programme.',
  },
  {
    id: 'rtl',
    icon: '▶️',
    title: 'Changes in Learner Status: Return to Learning (RTL)',
    desc: 'Learner is ready to return following an agreed Break in Learning.',
  },
  {
    id: 'withdrawal',
    icon: '🚪',
    title: 'Changes in Learner Status: Withdrawal',
    desc: 'Learner is to be withdrawn from their apprenticeship programme.',
  },
];

// ── Users & auth ──────────────────────────────

const USERS = [
  { username: 'LSC',     password: 'tess', displayName: 'LSC',     role: 'coach'   },
  { username: 'Manager', password: 'tess', displayName: 'Manager', role: 'manager' },
  { username: 'Admin',   password: 'tess', displayName: 'Admin',   role: 'admin'   },
];

function getCurrentUser() {
  const s = localStorage.getItem('asd_session');
  return s ? JSON.parse(s) : null;
}

function setCurrentUser(user) {
  localStorage.setItem('asd_session', JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem('asd_session');
}

let _loginCallback = null;
let _currentView = 'home';

function openLoginModal(callback) {
  _loginCallback = callback || null;
  const isSwitching = !!getCurrentUser();
  document.getElementById('loginModalTitle').textContent = isSwitching ? 'Switch User' : 'Sign In';
  document.getElementById('loginModalSubtitle').textContent = isSwitching ? 'Select an account to switch to.' : 'Select your account to continue.';
  document.getElementById('loginModal').hidden = false;
}

function closeLoginModal() {
  document.getElementById('loginModal').hidden = true;
  _loginCallback = null;
}

function requireLogin(fn) {
  if (getCurrentUser()) { fn(); }
  else { openLoginModal(fn); }
}

function updateHeader() {
  const user = getCurrentUser();
  const el = document.getElementById('headerActions');
  if (!user) {
    el.innerHTML = `<button class="header-btn" id="loginBtn">Login</button>`;
    document.getElementById('loginBtn').addEventListener('click', () => openLoginModal());
  } else {
    const isOnWorkflow = _currentView === 'workflow';
    const unreadCount = getUnreadQueueCount(user);
    const commentCount = getNewCommentCount(user);
    el.innerHTML = `
      <button class="header-btn header-btn--ghost" id="workflowBtn">${isOnWorkflow ? 'Main Menu' : 'My Workflow'}</button>
      <button class="header-btn header-btn--outline" id="switchUserBtn">Switch User</button>
      <button class="header-btn header-btn--outline" id="logoutBtn">Logout</button>
      <span class="header-user">&#128100; ${user.displayName}</span>
      <span class="header-notif ${unreadCount > 0 ? 'header-notif--active' : ''}" title="${unreadCount} unread ticket${unreadCount !== 1 ? 's' : ''}">
        <span class="header-notif-icon">⚡</span>
        ${unreadCount > 0 ? `<span class="header-notif-count">${unreadCount > 99 ? '99+' : unreadCount}</span>` : ''}
      </span>
      <span class="header-notif ${commentCount > 0 ? 'header-notif--active' : ''}" title="${commentCount} new message${commentCount !== 1 ? 's' : ''}">
        <span class="header-notif-icon">💬</span>
        ${commentCount > 0 ? `<span class="header-notif-count">${commentCount > 99 ? '99+' : commentCount}</span>` : ''}
      </span>`;
    document.getElementById('switchUserBtn').addEventListener('click', () => openLoginModal());
    document.getElementById('workflowBtn').addEventListener('click', isOnWorkflow ? renderHome : renderWorkflow);
    document.getElementById('logoutBtn').addEventListener('click', () => {
      clearCurrentUser();
      updateHeader();
      renderHome();
    });
  }
}

// ── Read / unread tracking ─────────────────────

function getReadMap() {
  return JSON.parse(localStorage.getItem('asd_read') || '{}');
}

function isTicketRead(ticketId, username) {
  return (getReadMap()[username] || []).includes(ticketId);
}

function markTicketRead(ticketId, username) {
  const map = getReadMap();
  if (!map[username]) map[username] = [];
  if (!map[username].includes(ticketId)) map[username].push(ticketId);
  localStorage.setItem('asd_read', JSON.stringify(map));
}

function markTicketUnread(ticketId, username) {
  const map = getReadMap();
  if (!map[username]) return;
  map[username] = map[username].filter(id => id !== ticketId);
  localStorage.setItem('asd_read', JSON.stringify(map));
}

function getUnreadQueueCount(user) {
  const tickets = JSON.parse(localStorage.getItem('asd_tickets') || '[]');
  const queue = user.role === 'admin'
    ? tickets
    : tickets.filter(t => t.assignedTo === user.username || (t.participants || []).includes(user.username));
  return queue.filter(t => !isTicketRead(t.id, user.username)).length;
}

function getCommentReadMap() {
  return JSON.parse(localStorage.getItem('asd_comment_read') || '{}');
}

function getSeenCommentCount(ticketId, username) {
  return ((getCommentReadMap()[username] || {})[ticketId]) ?? -1;
}

function markCommentsRead(ticketId, username, count) {
  const map = getCommentReadMap();
  if (!map[username]) map[username] = {};
  map[username][ticketId] = count;
  localStorage.setItem('asd_comment_read', JSON.stringify(map));
}

function hasNewComments(ticket, username) {
  if (!isTicketRead(ticket.id, username)) return false;
  const seen = getSeenCommentCount(ticket.id, username);
  return (ticket.comments || []).length > seen;
}

function getNewCommentCount(user) {
  const tickets = JSON.parse(localStorage.getItem('asd_tickets') || '[]');
  const visible = user.role === 'admin'
    ? tickets
    : tickets.filter(t =>
        t.assignedTo === user.username ||
        (t.participants || []).includes(user.username) ||
        t.createdBy === user.username);
  return visible.filter(t => hasNewComments(t, user.username)).length;
}

// ── Ticket helpers ─────────────────────────────

const TICKET_TYPE_LABELS = {
  'achievement':         'Achievement',
  'refer':               'Refer (Fail)',
  'gateway':             'Gateway to EPA',
  'bil':                 'Break in Learning',
  'rtl':                 'Return to Learning',
  'withdrawal':          'Withdrawal',
  'new-enrolment':       'New Learner Enrolment',
  'role-suitability':    'Role Suitability Concern',
  'commitment-concern':  'Commitment Concern',
  'technical-mentor':    'Technical Mentor Request',
  'curriculum-feedback': 'Curriculum Feedback',
  'platform-request':    'Platform Request',
  'system-support':      'System Support',
  'other':               'Other',
};

const STATUS_LABELS = {
  'open':            'Open',
  'in-progress':     'In Progress',
  'awaiting-review': 'Awaiting Review',
  'solved':          'Solved',
};

function generateTicketId() {
  const tickets = JSON.parse(localStorage.getItem('asd_tickets') || '[]');
  if (!tickets.length) return 'ASD-001';
  const nums = tickets
    .map(t => parseInt((t.id || '').replace('ASD-', ''), 10))
    .filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return 'ASD-' + String(max + 1).padStart(3, '0');
}

function saveTicket(data) {
  const user = getCurrentUser();
  const tickets = JSON.parse(localStorage.getItem('asd_tickets') || '[]');
  tickets.push({
    id: generateTicketId(),
    createdBy: user ? user.username : 'unknown',
    assignedTo: 'Manager',
    participants: [],
    comments: [],
    ...data,
    status: 'open',
  });
  localStorage.setItem('asd_tickets', JSON.stringify(tickets));
}

function getTicket(id) {
  return (JSON.parse(localStorage.getItem('asd_tickets') || '[]')).find(t => t.id === id) || null;
}

function updateTicket(id, updates) {
  const tickets = JSON.parse(localStorage.getItem('asd_tickets') || '[]');
  const idx = tickets.findIndex(t => t.id === id);
  if (idx === -1) return null;
  tickets[idx] = { ...tickets[idx], ...updates };
  localStorage.setItem('asd_tickets', JSON.stringify(tickets));
  return tickets[idx];
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${date} at ${time}`;
}

function renderTicketFields(ticket) {
  const rows = [];
  const add = (label, val) => { if (val) rows.push([label, val]); };

  add('Learner Name',   ticket.learnerName);
  add('Employer Name',  ticket.employerName);
  add('Standard',       ticket.standard);

  switch (ticket.type) {
    case 'achievement':       add('Outcome', ticket.outcome); break;
    case 'bil':               add('Last Day of Learning', formatDate(ticket.ldol));
                              add('Expected Return to Learning', formatDate(ticket.expectedRtl)); break;
    case 'rtl':               add('Actual Return to Learning', formatDate(ticket.actualRtl)); break;
    case 'withdrawal':        add('Last Day of Learning', formatDate(ticket.ldol));
                              add('Withdrawal Reason', ticket.withdrawalReason); break;
    case 'gateway':           add('OTJ Confirmed', 'Yes'); break;
    case 'new-enrolment':     add('Planned Start Date', formatDate(ticket.plannedStartDate)); break;
    case 'technical-mentor':  add('Area of Support', ticket.supportArea); break;
    case 'curriculum-feedback': add('Feedback Type', ticket.feedbackType); break;
    case 'platform-request':  add('Request Type', ticket.requestType); break;
    case 'system-support':    add('System Affected', ticket.systemAffected);
                              add('Issue Type', ticket.issueType); break;
    case 'other':             add('Subject', ticket.subject); break;
  }

  add('Details',          ticket.details);
  add('Additional Notes', ticket.notes);

  return rows.map(([label, val]) => `
    <div class="detail-row">
      <span class="detail-label">${label}</span>
      <span class="detail-value">${val}</span>
    </div>`).join('');
}

// ── Workflow view ──────────────────────────────

function renderWorkflow(tab, statusFilter) {
  tab = tab || 'queue';
  statusFilter = statusFilter || 'all';
  _currentView = 'workflow';
  updateHeader();
  const user = getCurrentUser();
  if (!user) { openLoginModal(() => renderWorkflow(tab, statusFilter)); return; }

  const isAdmin = user.role === 'admin';
  const demoHidden = localStorage.getItem('asd_demo_hidden') === 'true';
  let tickets = JSON.parse(localStorage.getItem('asd_tickets') || '[]');
  if (demoHidden) tickets = tickets.filter(t => !t._isDemo);

  const baseTickets = isAdmin
    ? tickets
    : tab === 'queue'
      ? tickets.filter(t => t.assignedTo === user.username || (t.participants || []).includes(user.username))
      : tickets.filter(t => t.createdBy === user.username);

  const statusCounts = {
    all:               baseTickets.length,
    'open':            baseTickets.filter(t => (t.status || 'open') === 'open').length,
    'in-progress':     baseTickets.filter(t => t.status === 'in-progress').length,
    'awaiting-review': baseTickets.filter(t => t.status === 'awaiting-review').length,
    'solved':          baseTickets.filter(t => t.status === 'solved').length,
  };

  const tabTickets = [...(statusFilter !== 'all' ? baseTickets.filter(t => t.status === statusFilter) : baseTickets)]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filterBtns = ['all', 'open', 'in-progress', 'awaiting-review', 'solved'].map(s => `
    <button class="filter-btn ${statusFilter === s ? 'filter-btn--active' : ''}" data-status="${s}">
      ${s === 'all' ? 'All' : STATUS_LABELS[s]}<span class="filter-count">${statusCounts[s]}</span>
    </button>`).join('');

  const colCount = isAdmin ? 7 : 6;
  const isQueueView = isAdmin || tab === 'queue';
  const rows = tabTickets.length ? tabTickets.map(t => {
    const unread = isQueueView && !isTicketRead(t.id, user.username);
    const newComment = hasNewComments(t, user.username);
    const highlight = unread || newComment;
    return `
    <tr class="ticket-row${highlight ? ' ticket-row--unread' : ''}" data-search="${[t.id, t.learnerName, t.employerName, t.createdBy].filter(Boolean).join(' ').toLowerCase()}">
      <td class="ticket-id ticket-id--link" data-id="${t.id}" data-origin="${isAdmin ? 'queue' : tab}">${t.id || '—'}</td>
      <td>${TICKET_TYPE_LABELS[t.type] || t.type || '—'}</td>
      <td>${t.learnerName || '—'}</td>
      ${isAdmin ? `<td>${t.createdBy || '—'}</td>` : ''}
      <td>${formatDateTime(t.createdAt)}</td>
      <td>${t.comments && t.comments.length ? formatDateTime(t.comments[t.comments.length - 1].createdAt) : '—'}</td>
      <td><span class="status-badge status-badge--${t.status || 'open'}">${STATUS_LABELS[t.status] || 'Open'}</span></td>
    </tr>`;
  }).join('') :
    `<tr><td colspan="${colCount}" class="ticket-empty">No tickets found.</td></tr>`;

  const tabsHTML = isAdmin ? '' : `
    <div class="workflow-tabs">
      <button class="tab-btn ${tab === 'queue' ? 'tab-btn--active' : ''}" data-tab="queue">Queue</button>
      <button class="tab-btn ${tab === 'requests' ? 'tab-btn--active' : ''}" data-tab="requests">Requests Made</button>
    </div>`;

  document.getElementById('view').innerHTML = `
    <section class="workflow-header">
      <h1 class="hero-title">My Workflow</h1>
      <p class="hero-subtitle">Welcome back, ${user.displayName}</p>
    </section>
    ${tabsHTML}
    <div class="search-bar">
      <input class="ticket-search" id="ticketSearch" type="search" placeholder="Search by ticket ID, learner name, employer or raised by…" />
    </div>
    <div class="filter-bar">${filterBtns}</div>
    <div class="ticket-table-wrap">
      <table class="ticket-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Type</th>
            <th>Learner Name</th>
            ${isAdmin ? '<th>Raised By</th>' : ''}
            <th>Date Raised</th>
            <th>Last Comment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="ticketTbody">${rows}</tbody>
      </table>
    </div>
    <div class="demo-controls">
      <button class="btn-demo" id="resetDemoBtn">&#8635; Reset demo data</button>
      <button class="btn-demo btn-demo--secondary" id="toggleDemoBtn">${demoHidden ? '&#128065; Show demo data' : '&#128065; Hide demo data'}</button>
    </div>`;

  if (!isAdmin) {
    document.querySelectorAll('.tab-btn').forEach(btn =>
      btn.addEventListener('click', () => renderWorkflow(btn.dataset.tab, statusFilter)));
  }
  document.querySelectorAll('.filter-btn').forEach(btn =>
    btn.addEventListener('click', () => renderWorkflow(tab, btn.dataset.status)));
  document.querySelectorAll('.ticket-id--link').forEach(cell =>
    cell.addEventListener('click', () => renderTicketDetail(cell.dataset.id, cell.dataset.origin)));

  document.getElementById('resetDemoBtn').addEventListener('click', () => {
    seedDemoData();
    renderWorkflow(tab, statusFilter);
  });
  document.getElementById('toggleDemoBtn').addEventListener('click', () => {
    localStorage.setItem('asd_demo_hidden', demoHidden ? 'false' : 'true');
    renderWorkflow(tab, statusFilter);
  });

  document.getElementById('ticketSearch').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    let anyVisible = false;
    document.querySelectorAll('#ticketTbody .ticket-row').forEach(row => {
      const match = !q || row.dataset.search.includes(q);
      row.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });
    let noResults = document.getElementById('noSearchResults');
    if (!anyVisible && q) {
      if (!noResults) {
        const tr = document.createElement('tr');
        tr.id = 'noSearchResults';
        tr.innerHTML = `<td colspan="${colCount}" class="ticket-empty">No tickets match your search.</td>`;
        document.getElementById('ticketTbody').appendChild(tr);
      }
    } else if (noResults) {
      noResults.remove();
    }
  });
}

// ── Demo data ──────────────────────────────────

function getDemoTickets() {
  const ref = new Date();
  const dt = (daysAgo, h = 9, m = 0) => {
    const d = new Date(ref);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const cm = (author, text, daysAgo, h = 10, m = 0) => ({ author, text, createdAt: dt(daysAgo, h, m) });

  return [
    // ── Gateway to EPA (LSC raises) ────────────
    { id:'ASD-001', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(175,9,15),
      type:'gateway', learnerName:'Emily Clarke', employerName:'Barclays Bank', standard:'Data Analyst', notes:'', gatewayConfirmed:true,
      comments:[
        cm('LSC','Emily has satisfied all OTJ requirements. Gateway form completed and uploaded. Please confirm receipt and next steps.',174,14,10),
        cm('Manager','Received and logged. EPA gateway confirmed. Please ensure all portfolio evidence is submitted before the EPA window opens.',172,11,30),
        cm('LSC','All evidence submitted and portfolios fully up to date. Emily is prepared and confident.',171,9,45),
      ]},
    { id:'ASD-002', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(160,10,0),
      type:'gateway', learnerName:'James Patel', employerName:'KPMG LLP', standard:'Assistant Accountant', notes:'', gatewayConfirmed:true,
      comments:[
        cm('LSC','James is ready for gateway. OTJ hours confirmed, gateway form uploaded.',159,15,20),
        cm('Manager','Confirmed. EPA has been scheduled. Great progress from James.',157,9,5),
      ]},
    { id:'ASD-003', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(148,8,30),
      type:'gateway', learnerName:'Sophie Williams', employerName:'NHS Digital', standard:'Digital Support Technician', notes:'Employer has signed off on gateway readiness.', gatewayConfirmed:true,
      comments:[
        cm('LSC','Sophie is ready for gateway. Employer has confirmed readiness. Gateway form uploaded to platform.',147,13,0),
        cm('Manager','All confirmed. EPA arranged for next month. Well done Sophie!',145,10,15),
      ]},
    { id:'ASD-004', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(140,9,45),
      type:'gateway', learnerName:'Marcus Johnson', employerName:'BT Group', standard:'Data Analyst', notes:'', gatewayConfirmed:true,
      comments:[
        cm('LSC','Marcus has cleared gateway. OTJ confirmed, form uploaded. He is well-prepared for EPA.',139,11,30),
        cm('Manager','All documentation looks good. EPA panel booked.',137,14,0),
        cm('LSC','Marcus has been notified. He is very pleased with the progress.',136,9,10),
      ]},
    { id:'ASD-005', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(135,11,0),
      type:'gateway', learnerName:'Chloe Bennett', employerName:'Amazon UK', standard:'Operations/Departmental Manager', notes:'', gatewayConfirmed:true,
      comments:[
        cm('LSC','Chloe is ready for gateway. All OTJ hours met. Gateway pack submitted.',134,16,0),
        cm('Manager','Received. Everything in order — EPA window confirmed.',133,9,30),
      ]},
    { id:'ASD-006', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(128,9,0),
      type:'gateway', learnerName:'Aidan Murphy', employerName:'Lloyds Banking Group', standard:'Professional Accounting Technician', notes:'', gatewayConfirmed:true,
      comments:[
        cm('LSC','Aidan has met all gateway requirements. Form and evidence uploaded.',127,10,45),
        cm('Manager','Confirmed — EPA scheduled. Please advise Aidan to review the EPA guidance document.',125,14,20),
      ]},
    { id:'ASD-007', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(120,10,30),
      type:'gateway', learnerName:'Zara Ahmed', employerName:'PwC UK', standard:'Business Administrator', notes:'', gatewayConfirmed:true,
      comments:[
        cm('LSC','Raising gateway for Zara Ahmed. All OTJ requirements satisfied, form completed and uploaded.',119,13,15),
        cm('Manager','All received. EPA arranged. Zara has been a brilliant learner throughout.',117,11,0),
      ]},
    { id:'ASD-008', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'awaiting-review', createdAt:dt(110,9,20),
      type:'gateway', learnerName:'Tom Fletcher', employerName:'HMRC', standard:'Data Technician', notes:'', gatewayConfirmed:true,
      comments:[
        cm('LSC','Tom has completed all OTJ hours and the gateway form is uploaded. Awaiting confirmation of EPA date.',109,14,0),
        cm('Manager','Received. We are arranging EPA assessors and will confirm the date within two weeks.',107,10,30),
      ]},
    { id:'ASD-009', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'in-progress', createdAt:dt(95,11,15),
      type:'gateway', learnerName:'Hannah Lewis', employerName:'Vodafone UK', standard:'Applied AI & Automation', notes:'Employer has flagged a minor scheduling concern for EPA.', gatewayConfirmed:true,
      comments:[
        cm('LSC','Hannah is gateway-ready. However, the employer has flagged scheduling constraints — please bear this in mind when arranging EPA.',94,15,0),
        cm('Manager','Noted. We will work with the employer. Can you request their available dates?',92,9,20),
        cm('LSC','Spoken to the employer — they are available from the first week of next month onwards.',90,13,45),
      ]},
    { id:'ASD-010', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'awaiting-review', createdAt:dt(85,9,0),
      type:'gateway', learnerName:'Kyle Roberts', employerName:'Network Rail', standard:'Digital Support Technician', notes:'', gatewayConfirmed:true,
      comments:[
        cm('LSC','Kyle has satisfied all gateway requirements. Form submitted. Awaiting EPA confirmation.',84,10,30),
        cm('Manager','Received. Reviewing available EPA slots — will update shortly.',82,14,0),
      ]},
    { id:'ASD-011', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'in-progress', createdAt:dt(75,10,0),
      type:'gateway', learnerName:'Amelia Scott', employerName:'Rolls-Royce', standard:'Data Analyst', notes:'', gatewayConfirmed:true,
      comments:[
        cm('LSC','Amelia has cleared gateway. All documentation uploaded. Please arrange EPA.',74,11,30),
        cm('Manager','EPA process underway. Will be in touch with dates imminently.',72,9,15),
      ]},
    { id:'ASD-012', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'open', createdAt:dt(65,9,30),
      type:'gateway', learnerName:'Rhys Davies', employerName:'John Lewis Partnership', standard:'Multi-Channel Marketer', notes:'', gatewayConfirmed:true,
      comments:[
        cm('LSC','Rhys is ready for gateway. OTJ confirmed and all forms uploaded. Please review at your earliest convenience.',64,13,0),
      ]},

    // ── Break in Learning (LSC raises) ─────────
    { id:'ASD-013', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(170,9,0),
      type:'bil', learnerName:'Jasmine Carter', employerName:'Siemens UK', standard:'Business Administrator',
      ldol:'2025-12-10', expectedRtl:'2026-02-10', notes:'Personal circumstances — learner is aware of the process.',
      comments:[
        cm('LSC','Jasmine will be commencing a break in learning from 10 December due to personal circumstances. Expected return is 10 February.',169,14,30),
        cm('Manager','Break in learning logged. Please maintain regular contact with Jasmine and confirm her return when due.',167,10,0),
        cm('LSC','Confirmed — I will check in with Jasmine monthly and raise an RTL ticket upon her return.',166,9,30),
      ]},
    { id:'ASD-014', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(155,11,0),
      type:'bil', learnerName:'Connor Hughes', employerName:'HSBC UK', standard:'Data Analyst',
      ldol:'2025-12-15', expectedRtl:'2026-03-01', notes:'',
      comments:[
        cm('LSC','Connor is commencing a break from 15 December — employer has agreed and documentation is in place.',154,15,0),
        cm('Manager','Noted. Please ensure the break in learning agreement is uploaded to the platform.',152,9,45),
      ]},
    { id:'ASD-015', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(143,9,15),
      type:'bil', learnerName:'Olivia King', employerName:'Accenture UK', standard:'Professional Accounting Technician',
      ldol:'2026-01-05', expectedRtl:'2026-03-05', notes:'Medical leave — employer is supportive.',
      comments:[
        cm('LSC','Olivia is going on a medically-advised break from 5 January. Employer is fully briefed and supportive.',142,10,30),
        cm('Manager','Recorded. Wishing Olivia a speedy recovery. Please flag any changes to the return date.',140,14,0),
      ]},
    { id:'ASD-016', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(132,9,0),
      type:'bil', learnerName:'Ben Taylor', employerName:'Capita PLC', standard:'Multi-Channel Marketer',
      ldol:'2026-01-20', expectedRtl:'2026-03-20', notes:'',
      comments:[
        cm('LSC','Ben has agreed a break from 20 January. Expected return is 20 March.',131,11,15),
        cm('Manager','Logged. Please confirm when Ben is ready to return so we can raise the RTL.',129,10,0),
      ]},
    { id:'ASD-017', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(118,10,0),
      type:'bil', learnerName:'Mia Wilson', employerName:'Transport for London', standard:'Digital Support Technician',
      ldol:'2026-02-01', expectedRtl:'2026-04-01', notes:'Family circumstances.',
      comments:[
        cm('LSC','Mia has requested a break from 1 February due to family commitments. All parties have agreed.',117,14,30),
        cm('Manager','Confirmed. Please stay in touch with Mia and the employer throughout the break.',115,9,10),
      ]},
    { id:'ASD-018', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(105,9,30),
      type:'bil', learnerName:'Jake Thompson', employerName:'Barclays Bank', standard:'Assistant Accountant',
      ldol:'2026-02-14', expectedRtl:'2026-04-14', notes:'',
      comments:[
        cm('LSC','Jake is taking a break from 14 February. He has been advised to remain engaged with learning materials where possible.',104,13,0),
        cm('Manager','Logged. Please ensure the BIL agreement is signed and on file.',102,10,45),
      ]},
    { id:'ASD-019', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'in-progress', createdAt:dt(88,9,0),
      type:'bil', learnerName:'Priya Sharma', employerName:'Deloitte UK', standard:'Operations/Departmental Manager',
      ldol:'2026-03-01', expectedRtl:'2026-05-01', notes:'Learner is moving teams internally.',
      comments:[
        cm('LSC','Priya is on a break from 1 March whilst her internal team move is completed. Expected return 1 May.',87,15,0),
        cm('Manager','Understood. Please confirm when the internal move is finalised so we can update the programme plan.',85,9,30),
        cm('LSC','Team move is expected to be confirmed by end of April — will update as soon as I have news.',83,11,0),
      ]},
    { id:'ASD-020', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'open', createdAt:dt(72,11,0),
      type:'bil', learnerName:"Daniel O'Brien", employerName:'Jaguar Land Rover', standard:'Applied AI & Automation',
      ldol:'2026-04-07', expectedRtl:'2026-06-07', notes:'',
      comments:[
        cm('LSC',"Daniel has commenced a break from 7 April. Employer is aware and supportive. Expected return is 7 June.",71,14,0),
      ]},

    // ── Return to Learning (LSC raises) ────────
    { id:'ASD-021', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(165,9,0),
      type:'rtl', learnerName:'Emily Clarke', employerName:'Barclays Bank', standard:'Data Analyst', actualRtl:'2026-02-10', notes:'',
      comments:[
        cm('LSC','Emily has returned to learning as of 10 February. She is motivated and ready to continue towards gateway.',164,10,30),
        cm('Manager','Welcome back Emily! Record updated. Please review outstanding activities and set updated targets.',162,14,0),
      ]},
    { id:'ASD-022', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(150,10,0),
      type:'rtl', learnerName:'Tom Fletcher', employerName:'HMRC', standard:'Data Technician', actualRtl:'2026-02-20', notes:'',
      comments:[
        cm('LSC','Tom has returned to learning from 20 February. He has been briefed on what he missed and is keen to catch up.',149,11,0),
        cm('Manager','Great news. Please ensure a review session is scheduled within the first two weeks of his return.',147,9,30),
      ]},
    { id:'ASD-023', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(138,9,30),
      type:'rtl', learnerName:'Aidan Murphy', employerName:'Lloyds Banking Group', standard:'Professional Accounting Technician', actualRtl:'2026-03-05', notes:'Aidan is fully recovered and eager to return.',
      comments:[
        cm('LSC','Aidan has returned from his break as of 5 March. He is in great spirits and ready to progress.',137,14,0),
        cm('Manager','Wonderful — welcome back Aidan! Programme plan updated. Please arrange an initial review this week.',135,10,15),
      ]},
    { id:'ASD-024', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(125,9,0),
      type:'rtl', learnerName:'Sophie Williams', employerName:'NHS Digital', standard:'Digital Support Technician', actualRtl:'2026-03-14', notes:'',
      comments:[
        cm('LSC','Sophie has returned to learning from 14 March. All is well and she is keen to proceed towards gateway.',124,13,0),
        cm('Manager','Confirmed — record updated. Sophie is on track for gateway later this quarter.',122,9,45),
      ]},
    { id:'ASD-025', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(112,10,30),
      type:'rtl', learnerName:'Ben Taylor', employerName:'Capita PLC', standard:'Multi-Channel Marketer', actualRtl:'2026-03-22', notes:'',
      comments:[
        cm('LSC','Ben has returned to learning as of 22 March — two days ahead of schedule.',111,15,0),
        cm('Manager','Excellent! Record updated. Please schedule a progress review within the next fortnight.',109,11,30),
      ]},
  ];
}

// tickets continued in getDemoTickets — append remaining 25
(function appendDemoTickets() {
  const _orig = getDemoTickets;
  getDemoTickets = function() {
    const ref = new Date();
    const dt = (daysAgo, h = 9, m = 0) => { const d = new Date(ref); d.setDate(d.getDate() - daysAgo); d.setHours(h, m, 0, 0); return d.toISOString(); };
    const cm = (author, text, daysAgo, h = 10, m = 0) => ({ author, text, createdAt: dt(daysAgo, h, m) });
    const rest = [
      // ── RTL continued ──────────────────────────
      { id:'ASD-026', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'in-progress', createdAt:dt(97,9,0),
        type:'rtl', learnerName:'Jasmine Carter', employerName:'Siemens UK', standard:'Business Administrator', actualRtl:'2026-04-02', notes:'',
        comments:[
          cm('LSC','Jasmine has returned to learning from 2 April. She is settling back in well.',96,10,0),
          cm('Manager','Good news. Record updated. Please confirm gateway timeline at the next review.',94,14,30),
        ]},
      { id:'ASD-027', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'in-progress', createdAt:dt(82,11,0),
        type:'rtl', learnerName:'Kyle Roberts', employerName:'Network Rail', standard:'Digital Support Technician', actualRtl:'2026-04-15', notes:'',
        comments:[
          cm('LSC','Kyle has returned to learning as of 15 April. He is motivated and eager to make up for lost time.',81,14,0),
          cm('Manager','Confirmed. Please review his outstanding activities with him this week.',79,9,0),
        ]},
      { id:'ASD-028', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'open', createdAt:dt(68,9,30),
        type:'rtl', learnerName:'Priya Sharma', employerName:'Deloitte UK', standard:'Operations/Departmental Manager', actualRtl:'2026-05-05', notes:"Priya's internal team move is now complete.",
        comments:[
          cm('LSC','Priya has returned to learning from 5 May following the completion of her internal move. She is keen to resume.',67,13,0),
        ]},

      // ── Withdrawal (LSC raises) ─────────────────
      { id:'ASD-029', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(158,9,0),
        type:'withdrawal', learnerName:'Connor Hughes', employerName:'HSBC UK', standard:'Data Analyst',
        ldol:'2025-12-19', withdrawalReason:'Employment ended / redundancy', notes:'Learner was made redundant and has accepted a new role outside of the programme.',
        comments:[
          cm('LSC','Regrettably Connor has been made redundant and will need to withdraw. LDOL is 19 December.',157,14,0),
          cm('Manager','Withdrawal initiated. Please ensure the employer and Connor receive confirmation letters and the signed form is returned.',155,10,30),
          cm('LSC','Signed withdrawal form received and uploaded. Connor has been signposted to support services.',153,9,15),
        ]},
      { id:'ASD-030', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(145,10,0),
        type:'withdrawal', learnerName:'Zara Ahmed', employerName:'PwC UK', standard:'Business Administrator',
        ldol:'2026-01-08', withdrawalReason:'Learner chose to leave', notes:'',
        comments:[
          cm('LSC','Zara has decided to leave the programme of her own accord. LDOL is 8 January.',144,11,30),
          cm('Manager','Withdrawal processed. Please return all signed documentation and ensure PwC are formally informed.',142,9,0),
        ]},
      { id:'ASD-031', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(133,9,45),
        type:'withdrawal', learnerName:'Hannah Lewis', employerName:'Vodafone UK', standard:'Applied AI & Automation',
        ldol:'2026-01-24', withdrawalReason:'Health reasons', notes:'Learner has been advised to take time out for health reasons.',
        comments:[
          cm('LSC','Hannah is withdrawing due to health reasons. Her doctor has advised she is unable to continue. LDOL is 24 January.',132,14,15),
          cm('Manager','We wish Hannah all the best. Withdrawal documentation has been processed.',130,10,0),
        ]},
      { id:'ASD-032', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'solved', createdAt:dt(122,9,0),
        type:'withdrawal', learnerName:'Marcus Johnson', employerName:'BT Group', standard:'Data Analyst',
        ldol:'2026-02-07', withdrawalReason:'Change of employer', notes:'',
        comments:[
          cm('LSC','Marcus is leaving BT Group and therefore needs to withdraw. LDOL is 7 February.',121,13,30),
          cm('Manager','Withdrawal processed. If Marcus secures a new employer please advise them to explore continuing the programme.',119,11,0),
        ]},
      { id:'ASD-033', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'in-progress', createdAt:dt(108,10,15),
        type:'withdrawal', learnerName:'Rhys Davies', employerName:'John Lewis Partnership', standard:'Multi-Channel Marketer',
        ldol:'2026-02-28', withdrawalReason:'Programme not meeting learner needs', notes:'Learner and employer have mutually agreed the programme is not the right fit.',
        comments:[
          cm('LSC','Rhys and his employer have mutually decided to withdraw. The programme is not aligned with his current role. LDOL is 28 February.',107,15,0),
          cm('Manager','Could you provide feedback on the specific concerns so we can review programme fit in similar cases?',105,9,30),
          cm('LSC','Feedback shared — primarily relates to the standard not reflecting day-to-day responsibilities in his position.',103,13,0),
        ]},
      { id:'ASD-034', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'awaiting-review', createdAt:dt(92,9,0),
        type:'withdrawal', learnerName:'Chloe Bennett', employerName:'Amazon UK', standard:'Operations/Departmental Manager',
        ldol:'2026-03-12', withdrawalReason:'Personal circumstances', notes:'',
        comments:[
          cm('LSC','Chloe has raised personal circumstances as the reason for withdrawal. LDOL is 12 March. I have signposted her to support services.',91,14,0),
          cm('Manager','Thank you. Please ensure she receives pastoral support. We will review withdrawal documentation this week.',89,10,15),
        ]},
      { id:'ASD-035', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'awaiting-review', createdAt:dt(78,11,0),
        type:'withdrawal', learnerName:'Jake Thompson', employerName:'Barclays Bank', standard:'Assistant Accountant',
        ldol:'2026-03-28', withdrawalReason:'Financial reasons', notes:'',
        comments:[
          cm('LSC','Jake is withdrawing due to financial pressures. LDOL is 28 March. Barclays have been informed.',77,13,0),
          cm('Manager','Withdrawal pending final sign-off. Please chase the signed withdrawal form from the employer.',75,9,45),
        ]},
      { id:'ASD-036', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'open', createdAt:dt(58,9,30),
        type:'withdrawal', learnerName:'Mia Wilson', employerName:'Transport for London', standard:'Digital Support Technician',
        ldol:'2026-04-22', withdrawalReason:'Relocation', notes:'Mia is relocating outside of the UK.',
        comments:[
          cm('LSC','Mia is withdrawing as she is relocating internationally. LDOL is 22 April. She has been brilliant and we wish her well.',57,14,30),
        ]},

      // ── Achievement (Manager raises → LSC reviews) ─
      { id:'ASD-037', _isDemo:true, createdBy:'Manager', assignedTo:'LSC', participants:[], status:'solved', createdAt:dt(142,9,0),
        type:'achievement', learnerName:'Olivia King', employerName:'Accenture UK', standard:'Professional Accounting Technician', outcome:'Distinction', notes:'EPA result confirmed by the awarding body.',
        comments:[
          cm('Manager','Pleased to confirm Olivia King has achieved her qualification with a Distinction. Please notify the learner and employer and arrange a celebration.',141,10,0),
          cm('LSC','Wonderful news! I have contacted Olivia and her line manager at Accenture. Both are absolutely delighted.',139,14,30),
        ]},
      { id:'ASD-038', _isDemo:true, createdBy:'Manager', assignedTo:'LSC', participants:[], status:'solved', createdAt:dt(129,10,0),
        type:'achievement', learnerName:"Daniel O'Brien", employerName:'Jaguar Land Rover', standard:'Applied AI & Automation', outcome:'Pass', notes:'',
        comments:[
          cm('Manager',"Daniel O'Brien has achieved a Pass in his Applied AI & Automation EPA. Please inform both Daniel and Jaguar Land Rover.",128,11,0),
          cm('LSC','Daniel is really pleased. Jaguar Land Rover are happy with the outcome. All notifications sent.',126,14,0),
        ]},
      { id:'ASD-039', _isDemo:true, createdBy:'Manager', assignedTo:'LSC', participants:[], status:'solved', createdAt:dt(115,9,30),
        type:'achievement', learnerName:'Emily Clarke', employerName:'Barclays Bank', standard:'Data Analyst', outcome:'Merit', notes:'',
        comments:[
          cm('Manager','Emily Clarke has achieved a Merit in her Data Analyst EPA. Please contact Barclays and Emily to share the result.',114,10,15),
          cm('LSC','Fantastic result — Emily is thrilled. Barclays have been notified and extended their congratulations.',112,13,0),
        ]},
      { id:'ASD-040', _isDemo:true, createdBy:'Manager', assignedTo:'LSC', participants:[], status:'solved', createdAt:dt(98,9,0),
        type:'achievement', learnerName:'James Patel', employerName:'KPMG LLP', standard:'Assistant Accountant', outcome:'Pass', notes:'',
        comments:[
          cm('Manager','James Patel has achieved a Pass in his Assistant Accountant EPA. Please liaise with KPMG and James to complete all achievement paperwork.',97,14,0),
          cm('LSC','Confirmed. James and KPMG have both been informed and are very happy. All documentation is being processed.',95,10,30),
        ]},
      { id:'ASD-041', _isDemo:true, createdBy:'Manager', assignedTo:'LSC', participants:[], status:'awaiting-review', createdAt:dt(80,10,0),
        type:'achievement', learnerName:'Sophie Williams', employerName:'NHS Digital', standard:'Digital Support Technician', outcome:'Distinction', notes:'Result pending final confirmation from awarding body.',
        comments:[
          cm('Manager','Provisional result for Sophie Williams is a Distinction — awaiting final confirmation from the awarding body. Please hold notification until confirmed.',79,11,30),
          cm('LSC','Understood. I will wait for final confirmation before contacting Sophie and NHS Digital.',77,9,0),
        ]},
      { id:'ASD-042', _isDemo:true, createdBy:'Manager', assignedTo:'LSC', participants:[], status:'open', createdAt:dt(55,9,0),
        type:'achievement', learnerName:'Amelia Scott', employerName:'Rolls-Royce', standard:'Data Analyst', outcome:'Merit', notes:'',
        comments:[
          cm('Manager','Amelia Scott has achieved a Merit. Please confirm with the learner and employer and initiate the achievement process.',54,14,0),
        ]},

      // ── Refer (Manager raises → LSC reviews) — UNREAD for LSC ─
      { id:'ASD-043', _isDemo:true, createdBy:'Manager', assignedTo:'LSC', participants:[], status:'open', createdAt:dt(12,9,0),
        type:'refer', learnerName:'Tom Fletcher', employerName:'HMRC', standard:'Data Technician', notes:'Learner was unable to demonstrate sufficient competency in the professional discussion element.',
        comments:[
          cm('Manager','Tom Fletcher has unfortunately been referred following his EPA. The assessor noted insufficient evidence in the professional discussion. Please arrange a debrief with Tom and his employer to agree a resit plan.',11,10,30),
        ]},
      { id:'ASD-044', _isDemo:true, createdBy:'Manager', assignedTo:'LSC', participants:[], status:'open', createdAt:dt(10,11,0),
        type:'refer', learnerName:'Jasmine Carter', employerName:'Siemens UK', standard:'Business Administrator', notes:'',
        comments:[
          cm('Manager','Jasmine Carter has been referred following her EPA. The portfolio element did not meet the required standard. Please meet with Jasmine and develop a targeted improvement plan ahead of her resit.',9,9,30),
        ]},
      { id:'ASD-045', _isDemo:true, createdBy:'Manager', assignedTo:'LSC', participants:[], status:'open', createdAt:dt(8,9,30),
        type:'refer', learnerName:'Marcus Johnson', employerName:'BT Group', standard:'Data Analyst', notes:'',
        comments:[
          cm('Manager',"Marcus Johnson's EPA result is a Refer. The assessor highlighted gaps in the case study component. Please arrange a call with Marcus this week to debrief and agree next steps.",7,14,0),
        ]},
      { id:'ASD-046', _isDemo:true, createdBy:'Manager', assignedTo:'LSC', participants:[], status:'open', createdAt:dt(6,10,0),
        type:'refer', learnerName:'Hannah Lewis', employerName:'Vodafone UK', standard:'Applied AI & Automation', notes:'',
        comments:[
          cm('Manager',"Hannah Lewis has received a Refer outcome. The assessor's feedback points to limited applied knowledge in the AI implementation section. Please review the feedback with Hannah and devise a resit strategy.",5,11,15),
        ]},

      // ── Curriculum Requests (LSC raises) — recent, some with new comments for Manager ─
      { id:'ASD-047', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'open', createdAt:dt(5,9,0),
        type:'technical-mentor', learnerName:'Priya Sharma', employerName:'Deloitte UK', standard:'Data Analyst',
        supportArea:'SQL and relational databases',
        details:'Priya is struggling with SQL joins and relational database concepts. She is falling behind on the technical modules and would benefit from one-to-one support from a technical mentor with a strong data background. Her employer has also flagged this as a priority.',
        comments:[
          cm('LSC','Please could we arrange a technical mentor for Priya Sharma as a priority? She is finding the SQL modules challenging and her employer has raised concerns about her progress.',4,13,0),
        ]},
      { id:'ASD-048', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'in-progress', createdAt:dt(4,10,30),
        type:'platform-request', learnerName:'Ben Taylor', employerName:'Capita PLC', standard:'Multi-Channel Marketer',
        requestType:'Access Issue',
        details:'Ben Taylor has been unable to access his learning modules on the platform since last Thursday. He has tried on multiple devices and browsers. This is impacting his ability to complete assignments ahead of his upcoming review.',
        comments:[
          cm('LSC','Ben has been locked out of the platform for several days. This is urgently impacting his learning. Please investigate and restore access as soon as possible.',3,14,0),
          cm('Manager','We are investigating. It appears to be linked to a recent account migration. We expect to resolve within 24 hours and will update you.',2,9,30),
        ]},
      { id:'ASD-049', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'in-progress', createdAt:dt(3,9,0),
        type:'system-support', systemAffected:'VLE', issueType:'Content Not Loading',
        details:'Multiple learners are reporting that video content within the VLE is not loading. The issue affects all modules in the Data Analyst pathway. Learners are using Chrome on Windows. Error shown is "Media playback failed". This is impacting scheduled learning sessions.',
        comments:[
          cm('LSC','Three of my learners cannot load any video content on the VLE — all on Chrome. This is blocking their scheduled sessions. Please investigate urgently.',2,15,0),
          cm('Manager','We have identified the issue — a CDN configuration update has affected media delivery. Our technical team is working on a fix. Estimated resolution: later today.',1,10,0),
        ]},
      { id:'ASD-050', _isDemo:true, createdBy:'LSC', assignedTo:'Manager', participants:[], status:'open', createdAt:dt(2,11,0),
        type:'curriculum-feedback', standard:'Applied AI & Automation', feedbackType:'Content Issue',
        details:'Several learners on the Applied AI & Automation standard have flagged that Module 4 (AI Ethics and Governance) feels very theoretical and disconnected from their day-to-day work. They are finding it difficult to apply the concepts in practice. It would be beneficial to include more practical case studies around responsible AI use in business settings.',
        comments:[
          cm('LSC','Feedback from multiple Applied AI & Automation learners — Module 4 content is too theoretical and assessment questions do not reflect the taught content well. Sharing for curriculum team review.',1,14,30),
          cm('Manager','Thank you for raising this — it is valuable insight. I will pass this to the curriculum team for the next content refresh cycle.',0,9,0),
        ]},
    ];
    return [..._orig(), ...rest];
  };
})();

function seedDemoData() {
  const tickets = getDemoTickets();
  const demoIds = new Set(tickets.map(t => t.id));

  // Replace demo tickets, preserve user-created ones
  const existing = JSON.parse(localStorage.getItem('asd_tickets') || '[]').filter(t => !t._isDemo);
  localStorage.setItem('asd_tickets', JSON.stringify([...existing, ...tickets]));

  // Build read state — strip old demo entries then re-add
  const readMap = JSON.parse(localStorage.getItem('asd_read') || '{}');
  const commentMap = JSON.parse(localStorage.getItem('asd_comment_read') || '{}');
  ['LSC','Manager','Admin'].forEach(u => {
    readMap[u] = (readMap[u] || []).filter(id => !demoIds.has(id));
    if (!commentMap[u]) commentMap[u] = {};
    demoIds.forEach(id => delete commentMap[u][id]);
  });

  const first42 = tickets.slice(0, 42).map(t => t.id);

  // LSC: read 001-042, and their own curriculum tickets 047-050
  readMap.LSC.push(...first42, 'ASD-047', 'ASD-048', 'ASD-049', 'ASD-050');
  // Manager: read 001-042, the Refer tickets they raised (043-046), and 048-050 (read, but 1 new comment each)
  readMap.Manager.push(...first42, 'ASD-043', 'ASD-044', 'ASD-045', 'ASD-046', 'ASD-048', 'ASD-049', 'ASD-050');
  // Admin: read 001-042
  readMap.Admin.push(...first42);

  ['LSC','Manager','Admin'].forEach(u => { readMap[u] = [...new Set(readMap[u])]; });
  localStorage.setItem('asd_read', JSON.stringify(readMap));

  // Comment seen counts
  tickets.forEach(t => {
    const n = (t.comments || []).length;
    if (first42.includes(t.id)) {
      commentMap.LSC[t.id] = n;
      commentMap.Manager[t.id] = n;
      commentMap.Admin[t.id] = n;
    } else if (['ASD-043','ASD-044','ASD-045','ASD-046'].includes(t.id)) {
      commentMap.Manager[t.id] = n; // Manager created these, seen all
    } else if (t.id === 'ASD-047') {
      commentMap.LSC[t.id] = n; // LSC created, seen all; Manager hasn't read it yet (⚡)
    } else if (['ASD-048','ASD-049','ASD-050'].includes(t.id)) {
      commentMap.LSC[t.id] = n;                       // LSC seen all
      commentMap.Manager[t.id] = n > 1 ? n - 1 : 0;  // Manager has 1 unseen comment (💬)
      commentMap.Admin[t.id] = n;
    }
  });
  localStorage.setItem('asd_comment_read', JSON.stringify(commentMap));
}

// ── Ticket detail view ─────────────────────────

function renderTicketDetail(ticketId, origin) {
  const ticket = getTicket(ticketId);
  if (!ticket) { renderWorkflow(origin); return; }
  const user = getCurrentUser();
  if (user) {
    markTicketRead(ticketId, user.username);
    markCommentsRead(ticketId, user.username, (ticket.comments || []).length);
  }
  _currentView = 'workflow';
  updateHeader();

  const canManage = user && (user.role === 'manager' || user.role === 'admin');

  const assigneeHTML = canManage
    ? `<select class="form-select" id="assigneeSelect">
        ${USERS.map(u => `<option value="${u.username}" ${ticket.assignedTo === u.username ? 'selected' : ''}>${u.displayName}</option>`).join('')}
       </select>`
    : `<p class="detail-value">${ticket.assignedTo || '—'}</p>`;

  const existingParticipants = ticket.participants || [];
  const participantChips = existingParticipants.length
    ? existingParticipants.map(p => `
        <span class="participant-chip">${p}
          <button class="participant-remove" data-name="${p}" title="Remove">&times;</button>
        </span>`).join('')
    : `<span class="detail-value-muted">No participants yet.</span>`;

  const availableToAdd = USERS.filter(u => !existingParticipants.includes(u.username));
  const addParticipantHTML = availableToAdd.length ? `
    <div class="participant-add-row">
      <select class="form-select form-select--sm" id="participantSelect">
        <option value="">Add participant…</option>
        ${availableToAdd.map(u => `<option value="${u.username}">${u.displayName}</option>`).join('')}
      </select>
      <button class="btn-sm" id="addParticipantBtn">Add</button>
    </div>` : '';

  const commentsHTML = (ticket.comments || []).length
    ? (ticket.comments || []).map(c => `
        <div class="comment">
          <div class="comment-meta">
            <span class="comment-author">${c.author}</span>
            <span class="comment-time">${formatDateTime(c.createdAt)}</span>
          </div>
          <div class="comment-body">${c.text}</div>
        </div>`).join('')
    : `<p class="no-comments">No comments yet.</p>`;

  const statusPanelHTML = canManage ? `
    <div class="detail-panel">
      <h3 class="detail-panel-title">Status</h3>
      <select class="form-select" id="statusSelect">
        ${Object.entries(STATUS_LABELS).map(([k, v]) => `<option value="${k}" ${ticket.status === k ? 'selected' : ''}>${v}</option>`).join('')}
      </select>
    </div>` : '';

  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to ${origin === 'queue' ? 'Queue' : 'Requests Made'}</button>
      ${user ? `<button class="btn-sm btn-sm--ghost" id="markUnreadBtn">Mark as unread</button>` : ''}
    </div>
    <div class="ticket-detail-header">
      <div class="ticket-detail-header-top">
        <span class="ticket-detail-id">${ticket.id}</span>
        <span class="status-badge status-badge--${ticket.status || 'open'}">${STATUS_LABELS[ticket.status] || 'Open'}</span>
        ${ticket._isDemo ? '<span class="test-data-badge">Test Data</span>' : ''}
      </div>
      <h1 class="ticket-detail-title">${TICKET_TYPE_LABELS[ticket.type] || ticket.type}</h1>
      <p class="ticket-detail-meta">Raised by <strong>${ticket.createdBy}</strong> · ${formatDateTime(ticket.createdAt)}</p>
    </div>
    <div class="ticket-detail-body">
      <div class="ticket-detail-main">
        <div class="detail-panel">
          <h3 class="detail-panel-title">Ticket Details</h3>
          ${renderTicketFields(ticket)}
        </div>
        <div class="detail-panel">
          <h3 class="detail-panel-title">Comments</h3>
          <div class="comments-list" id="commentsList">${commentsHTML}</div>
          ${user ? `
          <div class="comment-form">
            <textarea class="form-textarea" id="commentText" placeholder="Add a comment…"></textarea>
            <div class="form-actions">
              <button class="btn-submit" id="addCommentBtn">Post Comment</button>
            </div>
          </div>` : ''}
        </div>
      </div>
      <div class="ticket-detail-sidebar">
        <div class="detail-panel">
          <h3 class="detail-panel-title">Assignee</h3>
          ${assigneeHTML}
        </div>
        <div class="detail-panel">
          <h3 class="detail-panel-title">Participants</h3>
          <div class="participants-list">${participantChips}</div>
          ${addParticipantHTML}
        </div>
        ${statusPanelHTML}
      </div>
    </div>`;

  document.getElementById('backBtn').addEventListener('click', () => renderWorkflow(origin));

  if (user) {
    document.getElementById('addCommentBtn').addEventListener('click', () => {
      const text = document.getElementById('commentText').value.trim();
      if (!text) return;
      const fresh = getTicket(ticketId);
      const comments = [...(fresh.comments || []), { author: user.displayName, text, createdAt: new Date().toISOString() }];
      updateTicket(ticketId, { comments });
      renderTicketDetail(ticketId, origin);
    });
  }

  if (canManage) {
    document.getElementById('assigneeSelect').addEventListener('change', e =>
      updateTicket(ticketId, { assignedTo: e.target.value }));
    document.getElementById('statusSelect').addEventListener('change', e =>
      updateTicket(ticketId, { status: e.target.value }));
  }

  const addBtn = document.getElementById('addParticipantBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const val = document.getElementById('participantSelect').value;
      if (!val) return;
      const fresh = getTicket(ticketId);
      const participants = [...(fresh.participants || [])];
      if (!participants.includes(val)) participants.push(val);
      updateTicket(ticketId, { participants });
      renderTicketDetail(ticketId, origin);
    });
  }

  document.querySelectorAll('.participant-remove').forEach(btn =>
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const fresh = getTicket(ticketId);
      updateTicket(ticketId, { participants: (fresh.participants || []).filter(p => p !== name) });
      renderTicketDetail(ticketId, origin);
    }));

  const markUnreadBtn = document.getElementById('markUnreadBtn');
  if (markUnreadBtn) {
    markUnreadBtn.addEventListener('click', () => {
      markTicketUnread(ticketId, user.username);
      renderWorkflow(origin);
    });
  }
}

// ── Validation utilities ───────────────────────

function getFieldError(el) {
  if (el.type === 'checkbox') return 'This confirmation is required before submitting.';
  if (el.tagName === 'SELECT') return 'Please select an option.';
  if (el.type === 'date') return 'Please enter a date.';
  if (el.tagName === 'TEXTAREA') return 'Please provide details.';
  return 'This field is required.';
}

function validateField(el) {
  const isEmpty = el.type === 'checkbox' ? !el.checked : !el.value.trim();
  const errorEl = document.getElementById(el.id + 'Error');
  el.classList.toggle('is-error', isEmpty);
  if (errorEl) {
    errorEl.textContent = isEmpty ? getFieldError(el) : '';
    errorEl.hidden = !isEmpty;
  }
  return !isEmpty;
}

function validateForm() {
  const fields = document.querySelectorAll('#requestForm [required]');
  let valid = true;
  fields.forEach(el => { if (!validateField(el)) valid = false; });
  if (!valid) {
    const first = document.querySelector('#requestForm .is-error');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  return valid;
}

function attachValidation() {
  document.querySelectorAll('#requestForm [required]').forEach(el => {
    const err = document.createElement('p');
    err.className = 'form-error';
    err.id = el.id + 'Error';
    err.hidden = true;
    const anchor = el.type === 'checkbox' ? el.closest('.form-group') : el;
    anchor.insertAdjacentElement('afterend', err);
    el.addEventListener('input', () => validateField(el));
    el.addEventListener('change', () => validateField(el));
  });
}

// ── View router ────────────────────────────────

function cardHTML(item) {
  return `
    <button class="request-card" data-id="${item.id}">
      <div class="card-icon">${item.icon}</div>
      <h2 class="card-title">${item.title}</h2>
      <p class="card-desc">${item.desc}</p>
      <span class="card-cta">Raise a request &rarr;</span>
    </button>`;
}

function renderHome() {
  _currentView = 'home';
  updateHeader();
  document.getElementById('view').innerHTML = `
    <section class="hero">
      <h1 class="hero-title">How can we help?</h1>
      <p class="hero-subtitle">Select a category below to raise a new request.</p>
    </section>
    <section class="card-grid">
      ${CATEGORIES.map(cardHTML).join('')}
    </section>`;

  document.querySelector('.card-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.request-card');
    if (!card) return;
    if (card.dataset.id === 'learner-status') renderLearnerStatus();
    if (card.dataset.id === 'new-learner') renderNewLearner();
    if (card.dataset.id === 'curriculum') renderCurriculum();
    if (card.dataset.id === 'other') requireLogin(renderFormOther);
  });
}

function renderLearnerStatus() {
  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to main menu</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">Changes in Learner Status</h1>
      <p class="hero-subtitle">Select the type of status change you need to request.</p>
    </section>
    <section class="card-grid">
      ${LEARNER_STATUS_TYPES.map(cardHTML).join('')}
    </section>`;

  document.getElementById('backBtn').addEventListener('click', renderHome);

  document.querySelector('.card-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.request-card');
    if (!card) return;
    if (card.dataset.id === 'achievement') requireLogin(renderFormAchievement);
    if (card.dataset.id === 'refer') requireLogin(renderFormRefer);
    if (card.dataset.id === 'gateway') requireLogin(renderFormGateway);
    if (card.dataset.id === 'bil') requireLogin(renderFormBIL);
    if (card.dataset.id === 'rtl') requireLogin(renderFormRTL);
    if (card.dataset.id === 'withdrawal') requireLogin(renderFormWithdrawal);
  });
}

function renderNewLearner() {
  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to main menu</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">New Learner Requests</h1>
      <p class="hero-subtitle">Select the type of request you need to raise.</p>
    </section>
    <section class="card-grid">
      ${NEW_LEARNER_TYPES.map(cardHTML).join('')}
    </section>`;

  document.getElementById('backBtn').addEventListener('click', renderHome);

  document.querySelector('.card-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.request-card');
    if (!card) return;
    if (card.dataset.id === 'new-enrolment') requireLogin(renderFormNewEnrolment);
    if (card.dataset.id === 'suitability-concern') renderSuitabilityConcern();
  });
}

function renderSuitabilityConcern() {
  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to New Learner Requests</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">New Learner Suitability Concern</h1>
      <p class="hero-subtitle">Select the type of concern you need to raise.</p>
    </section>
    <section class="card-grid">
      ${SUITABILITY_TYPES.map(cardHTML).join('')}
    </section>`;

  document.getElementById('backBtn').addEventListener('click', renderNewLearner);

  document.querySelector('.card-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.request-card');
    if (!card) return;
    if (card.dataset.id === 'role-suitability') requireLogin(() => renderFormSuitability('role-suitability', 'New Learner Suitability Concern: Role Suitability'));
    if (card.dataset.id === 'commitment-concern') requireLogin(() => renderFormSuitability('commitment-concern', 'New Learner Suitability Concern: Commitment Concern'));
  });
}

function renderCurriculum() {
  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to main menu</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">Curriculum Requests</h1>
      <p class="hero-subtitle">Select the type of curriculum request you need to raise.</p>
    </section>
    <section class="card-grid">
      ${CURRICULUM_TYPES.map(cardHTML).join('')}
    </section>`;

  document.getElementById('backBtn').addEventListener('click', renderHome);

  document.querySelector('.card-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.request-card');
    if (!card) return;
    if (card.dataset.id === 'technical-mentor')    requireLogin(renderFormTechnicalMentor);
    if (card.dataset.id === 'curriculum-feedback') requireLogin(renderFormCurriculumFeedback);
    if (card.dataset.id === 'platform-request')    requireLogin(renderFormPlatformRequest);
    if (card.dataset.id === 'system-support')      requireLogin(renderFormSystemSupport);
  });
}

function renderFormTechnicalMentor() {
  const standardOptions = STANDARDS.map(s => `<option value="${s}">${s}</option>`).join('');

  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to Curriculum Requests</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">Curriculum Requests: Technical Mentor Request</h1>
      <p class="hero-subtitle">Complete the form below to raise this request.</p>
    </section>
    <form class="request-form" id="requestForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="learnerName">Learner Name</label>
        <input class="form-input" type="text" id="learnerName" name="learnerName" placeholder="Full name of the learner" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="employerName">Employer Name</label>
        <input class="form-input" type="text" id="employerName" name="employerName" placeholder="Name of the employer organisation" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="standard">Standard</label>
        <select class="form-select" id="standard" name="standard" required>
          <option value="" disabled selected>Select a standard</option>
          ${standardOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="supportArea">Topic / Area of Support</label>
        <input class="form-input" type="text" id="supportArea" name="supportArea" placeholder="e.g. SQL fundamentals, data visualisation, bookkeeping" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="details">Details</label>
        <p class="form-hint">Please describe the specific gaps or challenges the learner is facing and what you hope the technical mentor will help them achieve.</p>
        <textarea class="form-textarea form-textarea--tall" id="details" name="details" placeholder="Provide as much context as possible..." required></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">Submit Request</button>
      </div>
    </form>`;

  document.getElementById('backBtn').addEventListener('click', renderCurriculum);

  attachValidation();

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      type: 'technical-mentor',
      learnerName: document.getElementById('learnerName').value.trim(),
      employerName: document.getElementById('employerName').value.trim(),
      standard: document.getElementById('standard').value,
      supportArea: document.getElementById('supportArea').value.trim(),
      details: document.getElementById('details').value.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    saveTicket(data);
    renderConfirmation();
  });
}

function renderFormCurriculumFeedback() {
  const standardOptions = STANDARDS.map(s => `<option value="${s}">${s}</option>`).join('');

  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to Curriculum Requests</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">Curriculum Requests: Curriculum Feedback</h1>
      <p class="hero-subtitle">Complete the form below to raise this request.</p>
    </section>
    <form class="request-form" id="requestForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="standard">Standard</label>
        <select class="form-select" id="standard" name="standard" required>
          <option value="" disabled selected>Select a standard</option>
          ${standardOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="feedbackType">Feedback Type</label>
        <select class="form-select" id="feedbackType" name="feedbackType" required>
          <option value="" disabled selected>Select a type</option>
          <option value="Content Issue">Content Issue</option>
          <option value="Delivery Suggestion">Delivery Suggestion</option>
          <option value="Resource Request">Resource Request</option>
          <option value="Assessment Query">Assessment Query</option>
          <option value="General Feedback">General Feedback</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="details">Details</label>
        <p class="form-hint">Please be as specific as possible — include module names, session references, or examples where relevant so the curriculum team can act on your feedback effectively.</p>
        <textarea class="form-textarea form-textarea--tall" id="details" name="details" placeholder="Describe your feedback in detail..." required></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">Submit Request</button>
      </div>
    </form>`;

  document.getElementById('backBtn').addEventListener('click', renderCurriculum);

  attachValidation();

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      type: 'curriculum-feedback',
      standard: document.getElementById('standard').value,
      feedbackType: document.getElementById('feedbackType').value,
      details: document.getElementById('details').value.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    saveTicket(data);
    renderConfirmation();
  });
}

function renderFormPlatformRequest() {
  const standardOptions = STANDARDS.map(s => `<option value="${s}">${s}</option>`).join('');

  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to Curriculum Requests</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">Curriculum Requests: Platform Request</h1>
      <p class="hero-subtitle">Complete the form below to raise this request.</p>
    </section>
    <form class="request-form" id="requestForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="learnerName">Learner Name</label>
        <input class="form-input" type="text" id="learnerName" name="learnerName" placeholder="Full name of the learner" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="employerName">Employer Name</label>
        <input class="form-input" type="text" id="employerName" name="employerName" placeholder="Name of the employer organisation" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="standard">Standard</label>
        <select class="form-select" id="standard" name="standard" required>
          <option value="" disabled selected>Select a standard</option>
          ${standardOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="requestType">Request Type</label>
        <select class="form-select" id="requestType" name="requestType" required>
          <option value="" disabled selected>Select a type</option>
          <option value="Access Issue">Access Issue</option>
          <option value="Content Upload">Content Upload</option>
          <option value="Feature Request">Feature Request</option>
          <option value="User Account">User Account</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="details">Details</label>
        <p class="form-hint">Please provide sufficient detail so the team can understand and action your request, including any relevant learner or course information.</p>
        <textarea class="form-textarea form-textarea--tall" id="details" name="details" placeholder="Describe your request in detail..." required></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">Submit Request</button>
      </div>
    </form>`;

  document.getElementById('backBtn').addEventListener('click', renderCurriculum);

  attachValidation();

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      type: 'platform-request',
      learnerName: document.getElementById('learnerName').value.trim(),
      employerName: document.getElementById('employerName').value.trim(),
      standard: document.getElementById('standard').value,
      requestType: document.getElementById('requestType').value,
      details: document.getElementById('details').value.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    saveTicket(data);
    renderConfirmation();
  });
}

function renderFormSystemSupport() {
  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to Curriculum Requests</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">Curriculum Requests: System Support</h1>
      <p class="hero-subtitle">Complete the form below to raise this request.</p>
    </section>
    <form class="request-form" id="requestForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="systemAffected">System Affected</label>
        <select class="form-select" id="systemAffected" name="systemAffected" required>
          <option value="" disabled selected>Select a system</option>
          <option value="VLE">VLE</option>
          <option value="LMS">LMS</option>
          <option value="Both">Both</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="issueType">Issue Type</label>
        <select class="form-select" id="issueType" name="issueType" required>
          <option value="" disabled selected>Select an issue type</option>
          <option value="Login Problem">Login Problem</option>
          <option value="Content Not Loading">Content Not Loading</option>
          <option value="Feature Not Working">Feature Not Working</option>
          <option value="Performance Issue">Performance Issue</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="details">Details</label>
        <p class="form-hint">Please include a description of the issue, any error messages displayed, the browser you are using, and the steps taken before the problem occurred.</p>
        <textarea class="form-textarea form-textarea--tall" id="details" name="details" placeholder="Describe the issue in as much detail as possible..." required></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">Submit Request</button>
      </div>
    </form>`;

  document.getElementById('backBtn').addEventListener('click', renderCurriculum);

  attachValidation();

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      type: 'system-support',
      systemAffected: document.getElementById('systemAffected').value,
      issueType: document.getElementById('issueType').value,
      details: document.getElementById('details').value.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    saveTicket(data);
    renderConfirmation();
  });
}

function renderFormRefer() {
  const standardOptions = STANDARDS.map(s => `<option value="${s}">${s}</option>`).join('');

  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to Learner Status</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">Changes in Learner Status: Refer (Fail)</h1>
      <p class="hero-subtitle">Complete the form below to raise this request.</p>
    </section>
    <form class="request-form" id="requestForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="learnerName">Learner Name</label>
        <input class="form-input" type="text" id="learnerName" name="learnerName" placeholder="Full name of the learner" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="employerName">Employer Name</label>
        <input class="form-input" type="text" id="employerName" name="employerName" placeholder="Name of the employer organisation" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="standard">Standard</label>
        <select class="form-select" id="standard" name="standard" required>
          <option value="" disabled selected>Select a standard</option>
          ${standardOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="notes">Additional Notes</label>
        <textarea class="form-textarea" id="notes" name="notes" placeholder="Add any additional context or information here..."></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">Submit Request</button>
      </div>
    </form>`;

  document.getElementById('backBtn').addEventListener('click', renderLearnerStatus);

  attachValidation();

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      type: 'refer',
      learnerName: document.getElementById('learnerName').value.trim(),
      employerName: document.getElementById('employerName').value.trim(),
      standard: document.getElementById('standard').value,
      notes: document.getElementById('notes').value.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    saveTicket(data);
    renderConfirmation();
  });
}

function renderFormWithdrawal() {
  const standardOptions = STANDARDS.map(s => `<option value="${s}">${s}</option>`).join('');

  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to Learner Status</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">Changes in Learner Status: Withdrawal</h1>
      <p class="hero-subtitle">Complete the form below to raise this request.</p>
    </section>
    <form class="request-form" id="requestForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="learnerName">Learner Name</label>
        <input class="form-input" type="text" id="learnerName" name="learnerName" placeholder="Full name of the learner" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="employerName">Employer Name</label>
        <input class="form-input" type="text" id="employerName" name="employerName" placeholder="Name of the employer organisation" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="standard">Standard</label>
        <select class="form-select" id="standard" name="standard" required>
          <option value="" disabled selected>Select a standard</option>
          ${standardOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="ldol">Last Day of Learning (LDOL)</label>
        <input class="form-input" type="date" id="ldol" name="ldol" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="withdrawalReason">Withdrawal Reason</label>
        <select class="form-select" id="withdrawalReason" name="withdrawalReason" required>
          <option value="" disabled selected>Select a reason</option>
          <option value="Employment ended / redundancy">Employment ended / redundancy</option>
          <option value="Change of employer">Change of employer</option>
          <option value="Personal circumstances">Personal circumstances</option>
          <option value="Health reasons">Health reasons</option>
          <option value="Learner chose to leave">Learner chose to leave</option>
          <option value="Lack of employer support">Lack of employer support</option>
          <option value="Programme not meeting learner needs">Programme not meeting learner needs</option>
          <option value="Financial reasons">Financial reasons</option>
          <option value="Relocation">Relocation</option>
          <option value="Transfer to another provider">Transfer to another provider</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="notes">Additional Notes</label>
        <textarea class="form-textarea" id="notes" name="notes" placeholder="Add any additional context or information here..."></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">Submit Request</button>
      </div>
    </form>`;

  document.getElementById('backBtn').addEventListener('click', renderLearnerStatus);

  attachValidation();

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      type: 'withdrawal',
      learnerName: document.getElementById('learnerName').value.trim(),
      employerName: document.getElementById('employerName').value.trim(),
      standard: document.getElementById('standard').value,
      ldol: document.getElementById('ldol').value,
      withdrawalReason: document.getElementById('withdrawalReason').value,
      notes: document.getElementById('notes').value.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    saveTicket(data);
    renderConfirmation();
  });
}

function renderFormRTL() {
  const standardOptions = STANDARDS.map(s => `<option value="${s}">${s}</option>`).join('');

  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to Learner Status</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">Changes in Learner Status: Return to Learning (RTL)</h1>
      <p class="hero-subtitle">Complete the form below to raise this request.</p>
    </section>
    <form class="request-form" id="requestForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="learnerName">Learner Name</label>
        <input class="form-input" type="text" id="learnerName" name="learnerName" placeholder="Full name of the learner" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="employerName">Employer Name</label>
        <input class="form-input" type="text" id="employerName" name="employerName" placeholder="Name of the employer organisation" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="standard">Standard</label>
        <select class="form-select" id="standard" name="standard" required>
          <option value="" disabled selected>Select a standard</option>
          ${standardOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="actualRtl">Actual Return to Learning</label>
        <input class="form-input" type="date" id="actualRtl" name="actualRtl" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="notes">Additional Notes</label>
        <textarea class="form-textarea" id="notes" name="notes" placeholder="Add any additional context or information here..."></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">Submit Request</button>
      </div>
    </form>`;

  document.getElementById('backBtn').addEventListener('click', renderLearnerStatus);

  attachValidation();

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      type: 'rtl',
      learnerName: document.getElementById('learnerName').value.trim(),
      employerName: document.getElementById('employerName').value.trim(),
      standard: document.getElementById('standard').value,
      actualRtl: document.getElementById('actualRtl').value,
      notes: document.getElementById('notes').value.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    saveTicket(data);
    renderConfirmation();
  });
}

function renderFormBIL() {
  const standardOptions = STANDARDS.map(s => `<option value="${s}">${s}</option>`).join('');

  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to Learner Status</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">Changes in Learner Status: Agreed Break in Learning (BIL)</h1>
      <p class="hero-subtitle">Complete the form below to raise this request.</p>
    </section>
    <form class="request-form" id="requestForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="learnerName">Learner Name</label>
        <input class="form-input" type="text" id="learnerName" name="learnerName" placeholder="Full name of the learner" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="employerName">Employer Name</label>
        <input class="form-input" type="text" id="employerName" name="employerName" placeholder="Name of the employer organisation" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="standard">Standard</label>
        <select class="form-select" id="standard" name="standard" required>
          <option value="" disabled selected>Select a standard</option>
          ${standardOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="ldol">Last Day of Learning (LDOL)</label>
        <input class="form-input" type="date" id="ldol" name="ldol" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="expectedRtl">Expected Return to Learning</label>
        <input class="form-input" type="date" id="expectedRtl" name="expectedRtl" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="notes">Additional Notes</label>
        <textarea class="form-textarea" id="notes" name="notes" placeholder="Add any additional context or information here..."></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">Submit Request</button>
      </div>
    </form>`;

  document.getElementById('backBtn').addEventListener('click', renderLearnerStatus);

  attachValidation();

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      type: 'bil',
      learnerName: document.getElementById('learnerName').value.trim(),
      employerName: document.getElementById('employerName').value.trim(),
      standard: document.getElementById('standard').value,
      ldol: document.getElementById('ldol').value,
      expectedRtl: document.getElementById('expectedRtl').value,
      notes: document.getElementById('notes').value.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    saveTicket(data);
    renderConfirmation();
  });
}

function renderFormGateway() {
  const standardOptions = STANDARDS.map(s => `<option value="${s}">${s}</option>`).join('');

  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to Learner Status</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">Changes in Learner Status: Gateway to End Point Assessment</h1>
      <p class="hero-subtitle">Complete the form below to raise this request.</p>
    </section>
    <form class="request-form" id="requestForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="learnerName">Learner Name</label>
        <input class="form-input" type="text" id="learnerName" name="learnerName" placeholder="Full name of the learner" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="employerName">Employer Name</label>
        <input class="form-input" type="text" id="employerName" name="employerName" placeholder="Name of the employer organisation" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="standard">Standard</label>
        <select class="form-select" id="standard" name="standard" required>
          <option value="" disabled selected>Select a standard</option>
          ${standardOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="notes">Additional Notes</label>
        <textarea class="form-textarea" id="notes" name="notes" placeholder="Add any additional context or information here..."></textarea>
      </div>
      <div class="form-group">
        <label class="form-checkbox">
          <input type="checkbox" id="gatewayConfirm" name="gatewayConfirm" required />
          <span>I confirm the learner has satisfied the OTJ requirement and the gateway form has been completed and uploaded to the relevant section on the platform.</span>
        </label>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">Submit Request</button>
      </div>
    </form>`;

  document.getElementById('backBtn').addEventListener('click', renderLearnerStatus);

  attachValidation();

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      type: 'gateway',
      learnerName: document.getElementById('learnerName').value.trim(),
      employerName: document.getElementById('employerName').value.trim(),
      standard: document.getElementById('standard').value,
      notes: document.getElementById('notes').value.trim(),
      gatewayConfirmed: true,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    saveTicket(data);
    renderConfirmation();
  });
}

function renderFormAchievement() {
  const standardOptions = STANDARDS.map(s => `<option value="${s}">${s}</option>`).join('');

  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to Learner Status</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">Changes in Learner Status: Achievement</h1>
      <p class="hero-subtitle">Complete the form below to raise this request.</p>
    </section>
    <form class="request-form" id="requestForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="learnerName">Learner Name</label>
        <input class="form-input" type="text" id="learnerName" name="learnerName" placeholder="Full name of the learner" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="employerName">Employer Name</label>
        <input class="form-input" type="text" id="employerName" name="employerName" placeholder="Name of the employer organisation" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="standard">Standard</label>
        <select class="form-select" id="standard" name="standard" required>
          <option value="" disabled selected>Select a standard</option>
          ${standardOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="outcome">Outcome</label>
        <select class="form-select" id="outcome" name="outcome" required>
          <option value="" disabled selected>Select an outcome</option>
          <option value="Pass">Pass</option>
          <option value="Merit">Merit</option>
          <option value="Distinction">Distinction</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="notes">Additional Notes</label>
        <textarea class="form-textarea" id="notes" name="notes" placeholder="Add any additional context or information here..."></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">Submit Request</button>
      </div>
    </form>`;

  document.getElementById('backBtn').addEventListener('click', renderLearnerStatus);

  attachValidation();

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      type: 'achievement',
      learnerName: document.getElementById('learnerName').value.trim(),
      employerName: document.getElementById('employerName').value.trim(),
      standard: document.getElementById('standard').value,
      outcome: document.getElementById('outcome').value,
      notes: document.getElementById('notes').value.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    saveTicket(data);
    renderConfirmation();
  });
}

function renderFormNewEnrolment() {
  const standardOptions = STANDARDS.map(s => `<option value="${s}">${s}</option>`).join('');

  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to New Learner Requests</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">New Learner Enrolment</h1>
      <p class="hero-subtitle">Complete the form below to raise this request.</p>
    </section>
    <form class="request-form" id="requestForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="learnerName">Learner Name</label>
        <input class="form-input" type="text" id="learnerName" name="learnerName" placeholder="Full name of the learner" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="employerName">Employer Name</label>
        <input class="form-input" type="text" id="employerName" name="employerName" placeholder="Name of the employer organisation" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="standard">Standard</label>
        <select class="form-select" id="standard" name="standard" required>
          <option value="" disabled selected>Select a standard</option>
          ${standardOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="plannedStartDate">Planned Start Date</label>
        <input class="form-input" type="date" id="plannedStartDate" name="plannedStartDate" required />
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">Submit Request</button>
      </div>
    </form>`;

  document.getElementById('backBtn').addEventListener('click', renderNewLearner);

  attachValidation();

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      type: 'new-enrolment',
      learnerName: document.getElementById('learnerName').value.trim(),
      employerName: document.getElementById('employerName').value.trim(),
      standard: document.getElementById('standard').value,
      plannedStartDate: document.getElementById('plannedStartDate').value,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    saveTicket(data);
    renderConfirmation();
  });
}

function renderFormOther() {
  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to main menu</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">Other</h1>
      <p class="hero-subtitle">Use this form for anything that doesn't fit the other categories.</p>
    </section>
    <form class="request-form" id="requestForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="subject">Subject</label>
        <input class="form-input" type="text" id="subject" name="subject" placeholder="A brief title for your request" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="learnerName">Learner Name <span class="form-optional">(if applicable)</span></label>
        <input class="form-input" type="text" id="learnerName" name="learnerName" placeholder="Full name of the learner" />
      </div>
      <div class="form-group">
        <label class="form-label" for="employerName">Employer Name <span class="form-optional">(if applicable)</span></label>
        <input class="form-input" type="text" id="employerName" name="employerName" placeholder="Name of the employer organisation" />
      </div>
      <div class="form-group">
        <label class="form-label" for="details">Details</label>
        <p class="form-hint">Please provide as much detail as possible. The more context you give, the faster we can route and action your request.</p>
        <textarea class="form-textarea form-textarea--tall" id="details" name="details" placeholder="Describe your request in full..." required></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">Submit Request</button>
      </div>
    </form>`;

  document.getElementById('backBtn').addEventListener('click', renderHome);

  attachValidation();

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      type: 'other',
      subject: document.getElementById('subject').value.trim(),
      learnerName: document.getElementById('learnerName').value.trim(),
      employerName: document.getElementById('employerName').value.trim(),
      details: document.getElementById('details').value.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    saveTicket(data);
    renderConfirmation();
  });
}

function renderFormSuitability(type, title) {
  const standardOptions = STANDARDS.map(s => `<option value="${s}">${s}</option>`).join('');

  document.getElementById('view').innerHTML = `
    <div class="back-bar">
      <button class="back-btn" id="backBtn">&larr; Back to Suitability Concerns</button>
    </div>
    <section class="hero">
      <h1 class="hero-title">${title}</h1>
      <p class="hero-subtitle">Complete the form below to raise this request.</p>
    </section>
    <form class="request-form" id="requestForm" novalidate>
      <div class="form-group">
        <label class="form-label" for="learnerName">Learner Name</label>
        <input class="form-input" type="text" id="learnerName" name="learnerName" placeholder="Full name of the learner" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="employerName">Employer Name</label>
        <input class="form-input" type="text" id="employerName" name="employerName" placeholder="Name of the employer organisation" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="standard">Standard</label>
        <select class="form-select" id="standard" name="standard" required>
          <option value="" disabled selected>Select a standard</option>
          ${standardOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="details">Details</label>
        <p class="form-hint">Please provide sufficient detail to clearly describe the concern, including specific incidents, dates, and any steps already taken.</p>
        <textarea class="form-textarea form-textarea--tall" id="details" name="details" placeholder="Describe the concern in as much detail as possible..." required></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">Submit Request</button>
      </div>
    </form>`;

  document.getElementById('backBtn').addEventListener('click', renderSuitabilityConcern);

  attachValidation();

  document.getElementById('requestForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const data = {
      type,
      learnerName: document.getElementById('learnerName').value.trim(),
      employerName: document.getElementById('employerName').value.trim(),
      standard: document.getElementById('standard').value,
      details: document.getElementById('details').value.trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    saveTicket(data);
    renderConfirmation();
  });
}

function renderConfirmation() {
  document.getElementById('view').innerHTML = `
    <section class="hero confirmation">
      <div class="confirmation-icon">✅</div>
      <h1 class="hero-title">Request Submitted</h1>
      <p class="hero-subtitle">Your request has been logged and will be picked up by the team shortly.</p>
      <button class="btn-submit" id="homeBtn">Back to main menu</button>
    </section>`;

  document.getElementById('homeBtn').addEventListener('click', renderHome);
}

document.addEventListener('DOMContentLoaded', () => {
  if (!JSON.parse(localStorage.getItem('asd_tickets') || '[]').some(t => t._isDemo)) {
    seedDemoData();
  }
  updateHeader();
  renderHome();

  document.getElementById('userSelectList').addEventListener('click', (e) => {
    const btn = e.target.closest('.user-select-btn');
    if (!btn) return;
    const user = USERS.find(u => u.username === btn.dataset.username);
    if (!user) return;
    setCurrentUser(user);
    closeLoginModal();
    updateHeader();
    if (_loginCallback) { const cb = _loginCallback; _loginCallback = null; cb(); }
  });

  document.getElementById('homeLink').addEventListener('click', renderHome);
  document.getElementById('loginModalClose').addEventListener('click', closeLoginModal);
  document.getElementById('loginModal').addEventListener('click', (e) => {
    if (e.target.id === 'loginModal') closeLoginModal();
  });
});
