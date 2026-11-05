/**
 * ============================================================================
 * Campus Event Registration & Management System
 * Core Client-Side Logic & State Management
 * ============================================================================
 */

// --- 1. DOM Query Helpers ---
const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => document.querySelectorAll(selector);
const $ = qs; // Backwards-compatible alias

// --- 2. Storage Helpers (with in-memory fallback) ---
function getStorage(key, defaultValue) {
  try {
    const storedValue = JSON.parse(localStorage.getItem(key));
    return storedValue == null ? defaultValue : storedValue;
  } catch (error) {
    window.__memoryStorage = window.__memoryStorage || {};
    return window.__memoryStorage[key] !== undefined ? window.__memoryStorage[key] : defaultValue;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    window.__memoryStorage = window.__memoryStorage || {};
    window.__memoryStorage[key] = value;
  }
}

// Backwards-compatible storage aliases
const LS = getStorage;
const SV = setStorage;

// --- 3. Utility Functions ---
function escapeHtml(string) {
  if (string == null) return '';
  return String(string).replace(/[&<>"']/g, (char) => {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entityMap[char];
  });
}
const esc = escapeHtml;

function downloadFile(fileName, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadLink.href);
}

function formatDisplayDate(dateString) {
  if (!dateString) return 'To be announced';
  const parsedDate = new Date(`${dateString}T00:00:00`);
  return isNaN(parsedDate.getTime())
    ? dateString
    : parsedDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
}

function formatDisplayTime(timeString) {
  if (!timeString) return 'To be announced';
  const [hoursRaw, minutesRaw] = timeString.split(':').map(Number);
  const hour = hoursRaw % 12 || 12;
  const minutes = String(minutesRaw || 0).padStart(2, '0');
  const period = hoursRaw < 12 ? 'AM' : 'PM';
  return `${hour}:${minutes} ${period}`;
}

// --- 4. Application Constants ---
const ADMIN_PIN = '1234';
const ORGANIZER_PIN = '2222';
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON = MONTH_NAMES;

const EVENT_CATEGORIES = [
  { t: 'Fest', c: '#f26a21', d: 'Big campus celebrations' },
  { t: 'Workshop', c: '#2b2b2e', d: 'Hands-on learning sessions' },
  { t: 'Seminar', c: '#0f766e', d: 'Talks and guest lectures' },
  { t: 'Club activity', c: '#3b5bdb', d: 'Meetups and club events' },
  { t: 'Sports meet', c: '#2f9e44', d: 'Matches and tournaments' }
];
const TYPES = EVENT_CATEGORIES;

const NAVIGATION_TABS = {
  guest: [['events', 'Events']],
  student: [
    ['events', 'Events'],
    ['tickets', 'My tickets']
  ],
  organizer: [
    ['events', 'Events'],
    ['org', 'Organizer']
  ],
  admin: [
    ['events', 'Events'],
    ['admin', 'Admin']
  ]
};
const TABS = NAVIGATION_TABS;

// --- 5. Catalog Seed & Demo Events ---
const SEED_EVENTS = [
  {
    id: 'e1',
    name: 'TechFest 2026',
    type: 'Fest',
    club: 'Tech Club',
    date: '2026-10-24',
    deadline: '2026-10-20',
    venue: 'Main Auditorium',
    seats: 120,
    fee: 0,
    team: false,
    upi: '',
    desc: 'Two days of hackathon, robotics demos and project showcases.'
  },
  {
    id: 'e2',
    name: 'Web Dev Workshop',
    type: 'Workshop',
    club: 'Coding Club',
    date: '2026-10-14',
    deadline: '2026-10-12',
    venue: 'Lab 3, CSE Block',
    seats: 40,
    fee: 100,
    team: false,
    upi: 'codingclub@upi',
    desc: 'Build and deploy your first JavaScript site in one afternoon. Bring a laptop.'
  },
  {
    id: 'e3',
    name: 'Inter-Branch Cricket',
    type: 'Sports meet',
    club: 'Sports Committee',
    date: '2026-11-02',
    deadline: '2026-10-28',
    venue: 'College Ground',
    seats: 16,
    fee: 200,
    team: true,
    upi: 'sports@upi',
    desc: 'Knockout tournament. Teams of 5 to 11 players.'
  },
  {
    id: 'e4',
    name: 'Cyber Safety Seminar',
    type: 'Seminar',
    club: 'Faculty Cell',
    date: '2026-10-16',
    deadline: '2026-10-15',
    venue: 'Seminar Hall 2',
    seats: 80,
    fee: 0,
    team: false,
    upi: '',
    desc: 'Staying safe online: phishing, passwords and privacy.'
  }
];

const createDemoEvents = (type, list) =>
  list.map((item, index) => ({
    id: 'd' + type[0].toLowerCase() + index,
    name: item[0],
    type: type,
    club: item[1],
    date: item[2],
    deadline: item[3],
    venue: item[4],
    seats: item[5],
    fee: item[6],
    team: Boolean(item[7]),
    upi: item[6] ? 'club@upi' : '',
    desc: item[8]
  }));

const DEMO_EVENTS = createDemoEvents('Fest', [
  ['Cultural Night', 'Cultural Club', '2026-10-30', '2026-10-26', 'Open Air Theatre', 300, 0, 0, 'Music, dance and drama performances by students.'],
  ['Fusion Dance Battle', 'Dance Society', '2026-11-04', '2026-10-31', 'Main Auditorium', 60, 100, 1, 'Team dance competition with live judging.'],
  ['Battle of Bands', 'Music Club', '2026-11-07', '2026-11-03', 'Open Air Theatre', 24, 150, 1, 'Bands compete for the campus title.'],
  ['Food Carnival', 'Student Council', '2026-11-10', '2026-11-07', 'Central Lawn', 500, 0, 0, 'Stalls, games and live music all evening.'],
  ['Hackathon 24', 'Tech Club', '2026-11-14', '2026-11-09', 'Innovation Lab', 90, 200, 1, 'Build a working prototype in 24 hours.'],
  ['Fashion Show', 'Fashion Club', '2026-11-18', '2026-11-14', 'Main Auditorium', 40, 100, 1, 'Themed ramp walk with student designers.'],
  ['Art Exhibition', 'Fine Arts Society', '2026-11-21', '2026-11-18', 'Gallery Hall', 150, 0, 0, 'Paintings, sketches and sculptures by students.'],
  ['Entrepreneurship Summit', 'E-Cell', '2026-11-25', '2026-11-21', 'Seminar Hall 1', 120, 50, 0, 'Pitch contest and talks by young founders.'],
  ['Annual Day Gala', 'Student Council', '2026-12-05', '2026-11-30', 'Main Auditorium', 400, 0, 0, 'Awards, performances and a closing show.']
]).concat(
  createDemoEvents('Workshop', [
    ['Python for Beginners', 'Coding Club', '2026-10-12', '2026-10-09', 'Lab 2, CSE Block', 40, 100, 0, 'Write your first programs step by step.'],
    ['UI/UX Design Basics', 'Design Club', '2026-10-15', '2026-10-12', 'Lab 4', 35, 150, 0, 'Wireframes, colour and layout using free tools.'],
    ['Git and GitHub', 'Coding Club', '2026-10-19', '2026-10-16', 'Lab 3, CSE Block', 45, 0, 0, 'Version control for team projects.'],
    ['Arduino Basics', 'Robotics Club', '2026-10-22', '2026-10-19', 'Electronics Lab', 30, 250, 0, 'Build and program a simple sensor circuit.'],
    ['Public Speaking', 'Literary Society', '2026-10-27', '2026-10-23', 'Seminar Hall 2', 50, 0, 0, 'Speak with confidence and handle questions.'],
    ['Photography Walk', 'Photo Club', '2026-11-01', '2026-10-28', 'Campus Gardens', 25, 100, 0, 'Composition and light, shot on your phone or camera.'],
    ['Resume and LinkedIn', 'Placement Cell', '2026-11-06', '2026-11-03', 'Seminar Hall 1', 100, 0, 0, 'Build a resume recruiters actually read.'],
    ['Data Analysis with Excel', 'Analytics Club', '2026-11-12', '2026-11-09', 'Lab 5', 40, 100, 0, 'Clean data, pivot tables and charts.'],
    ['Intro to Machine Learning', 'AI Club', '2026-11-19', '2026-11-15', 'Lab 1, CSE Block', 35, 200, 0, 'Train and test your first model.']
  ])
);

// Populate default times for events without explicit time
const defaultTimeSlots = ['10:00', '14:00', '09:30', '11:00', '16:00'];
SEED_EVENTS.concat(DEMO_EVENTS).forEach((event, index) => {
  if (!event.time) {
    event.time = defaultTimeSlots[index % defaultTimeSlots.length];
  }
});

function getAllPublishedEvents() {
  const approvedEvents = getStorage('approved', []);
  return SEED_EVENTS.concat(DEMO_EVENTS, approvedEvents);
}

function getEventById(eventId) {
  return getAllPublishedEvents().find((item) => item.id === eventId);
}

// Backwards-compatible aliases
const allEvents = getAllPublishedEvents;
const getEv = getEventById;

// --- 5.1. Event Feedback Storage & Rating Helpers ---
const SEED_FEEDBACK = [
  {
    id: 'FB-SEED-1',
    eid: 'e1',
    ename: 'TechFest 2026',
    name: 'Aarav Sharma',
    rating: 5,
    suggestion: 'Incredible hackathon arrangements! Would love even more industry mentoring sessions next year.',
    at: '2026-10-25T14:30:00.000Z'
  },
  {
    id: 'FB-SEED-2',
    eid: 'e1',
    ename: 'TechFest 2026',
    name: 'Sneha Patel',
    rating: 4,
    suggestion: 'Great projects on display. The robotics track was especially impressive.',
    at: '2026-10-25T17:15:00.000Z'
  },
  {
    id: 'FB-SEED-3',
    eid: 'e2',
    ename: 'Web Dev Workshop',
    name: 'Rohan Verma',
    rating: 5,
    suggestion: 'Hands-on coding was super helpful! Built my first real website in one afternoon.',
    at: '2026-10-15T11:20:00.000Z'
  },
  {
    id: 'FB-SEED-4',
    eid: 'e2',
    ename: 'Web Dev Workshop',
    name: 'Priya Nair',
    rating: 5,
    suggestion: 'Clear explanations and friendly mentors. Please conduct an advanced workshop next semester!',
    at: '2026-10-15T12:00:00.000Z'
  },
  {
    id: 'FB-SEED-5',
    eid: 'e3',
    ename: 'Inter-Branch Cricket',
    name: 'Karan Singh',
    rating: 4,
    suggestion: 'High-energy tournament and well-refereed matches.',
    at: '2026-11-03T18:00:00.000Z'
  },
  {
    id: 'FB-SEED-6',
    eid: 'e4',
    ename: 'Cyber Safety Seminar',
    name: 'Ananya Gupta',
    rating: 5,
    suggestion: 'Eye-opening case studies on cybersecurity, phishing prevention and personal data privacy.',
    at: '2026-10-17T09:45:00.000Z'
  }
];

function getAllFeedback() {
  const stored = getStorage('event_feedback', null);
  if (stored === null) {
    setStorage('event_feedback', SEED_FEEDBACK);
    return SEED_FEEDBACK;
  }
  return stored;
}

function saveFeedback(feedbackList) {
  setStorage('event_feedback', feedbackList);
}

function getEventFeedback(eventId) {
  return getAllFeedback().filter((item) => item.eid === eventId);
}

function getEventAverageRating(eventId) {
  const list = getEventFeedback(eventId);
  if (!list.length) {
    return { score: 0, count: 0, display: 'New' };
  }
  const sum = list.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
  const avg = sum / list.length;
  return {
    score: avg,
    count: list.length,
    display: `${avg.toFixed(1)} (${list.length})`
  };
}

function renderStars(rating) {
  const rounded = Math.round(Number(rating) || 0);
  let str = '';
  for (let i = 1; i <= 5; i++) {
    str += i <= rounded ? '★' : '☆';
  }
  return str;
}

// --- 6. Application State ---
let currentSession = getStorage('session', null);
let activeLoginRole = 'student';
let loginRedirectNote = '';
let pendingRegistrationId = null;
let currentCategoryFilter = '';

const getUserRole = () => (currentSession ? currentSession.role : 'guest');
const role = getUserRole;

// --- 7. Authentication & Navigation ---
function applyAuth() {
  const userRole = getUserRole();
  const tabs = NAVIGATION_TABS[userRole] || NAVIGATION_TABS.guest;

  const navElement = qs('#nav');
  if (navElement) {
    navElement.innerHTML = tabs
      .map((tab) => `<button type="button" data-v="${tab[0]}">${escapeHtml(tab[1])}</button>`)
      .join('');
  }

  const authElement = qs('#auth');
  if (authElement) {
    if (currentSession) {
      authElement.innerHTML = `
        <span class="who" title="${escapeHtml(currentSession.name)}">
          ${escapeHtml(currentSession.name)} <small>${escapeHtml(currentSession.role)}</small>
        </span>
        <button type="button" class="btn sm sec" onclick="doLogout()">Log out</button>
      `;
    } else {
      authElement.innerHTML = `
        <button type="button" class="btn sm" onclick="loginFromHeader()">Log in</button>
      `;
    }
  }
}

function loginFromHeader() {
  pendingRegistrationId = null;
  loginRedirectNote = '';
  openLogin('student');
}

function openLogin(targetRole = 'student') {
  activeLoginRole = targetRole;

  const roleOptions = [
    ['student', 'Student'],
    ['organizer', 'Organizer'],
    ['admin', 'Admin']
  ];

  const roleForms = {
    student: `
      <label for="l_name">Full name</label>
      <input id="l_name" autocomplete="name" placeholder="e.g. John Doe">
      <div class="row">
        <div>
          <label for="l_reg">Registration number</label>
          <input id="l_reg" placeholder="e.g. 12001234">
        </div>
        <div>
          <label for="l_roll">Roll number</label>
          <input id="l_roll" placeholder="e.g. 42">
        </div>
      </div>
    `,
    organizer: `
      <label for="l_club">Club or department</label>
      <input id="l_club" placeholder="e.g. Coding Club">
      <label for="l_pin">Organizer PIN</label>
      <input id="l_pin" type="password" inputmode="numeric" autocomplete="off" placeholder="Enter PIN">
      <p class="mut">Demo PIN: <strong>2222</strong></p>
    `,
    admin: `
      <label for="l_pin">Admin PIN</label>
      <input id="l_pin" type="password" inputmode="numeric" autocomplete="off" placeholder="Enter PIN">
      <p class="mut">Demo PIN: <strong>1234</strong></p>
    `
  };

  const currentRoleForm = roleForms[activeLoginRole] || roleForms.student;

  const modalHtml = `
    <h2 style="margin-top: 0;">Log in</h2>
    ${loginRedirectNote ? `<p class="mut">${escapeHtml(loginRedirectNote)}</p>` : ''}
    <div class="seg" role="tablist">
      ${roleOptions
        .map(
          ([roleKey, roleLabel]) => `
          <button type="button" class="${roleKey === activeLoginRole ? 'on' : ''}" onclick="openLogin('${roleKey}')">
            ${roleLabel}
          </button>
        `
        )
        .join('')}
    </div>
    <form class="f" id="lf" novalidate>
      ${currentRoleForm}
      <div id="l_err"></div>
      <p style="margin-top: 16px;">
        <button class="btn" style="width: 100%;" type="submit">Log in</button>
      </p>
    </form>
  `;

  openModal(modalHtml);

  const loginForm = qs('#lf');
  if (loginForm) {
    loginForm.onsubmit = (event) => {
      event.preventDefault();
      doLogin();
    };
  }
}

function doLogin() {
  const getInputValue = (id) => (qs('#' + id) ? qs('#' + id).value.trim() : '');
  const validationErrors = [];
  let userSession = null;

  if (activeLoginRole === 'student') {
    const fullName = getInputValue('l_name');
    const registrationNo = getInputValue('l_reg').toUpperCase();
    const rollNo = getInputValue('l_roll').toUpperCase();

    if (!/^[A-Za-z][A-Za-z .'-]{2,}$/.test(fullName)) {
      validationErrors.push('Enter your full name (letters only, at least 3 characters).');
    }
    if (!/^[A-Z0-9\/-]{5,20}$/.test(registrationNo)) {
      validationErrors.push('Registration number must be 5 to 20 letters or digits.');
    }
    if (!/^[A-Z0-9\/-]{1,20}$/.test(rollNo)) {
      validationErrors.push('Enter a valid roll number.');
    }
    if (registrationNo && registrationNo === rollNo) {
      validationErrors.push('Registration number and roll number must be different.');
    }

    userSession = {
      role: 'student',
      name: fullName,
      reg: registrationNo,
      roll: rollNo
    };
  } else if (activeLoginRole === 'organizer') {
    const clubName = getInputValue('l_club');
    const pin = getInputValue('l_pin');

    if (clubName.length < 2) {
      validationErrors.push('Enter your club or department name.');
    }
    if (pin !== ORGANIZER_PIN) {
      validationErrors.push('Invalid organizer PIN (Demo: 2222).');
    }

    userSession = {
      role: 'organizer',
      name: clubName,
      club: clubName
    };
  } else {
    const pin = getInputValue('l_pin');

    if (pin !== ADMIN_PIN) {
      validationErrors.push('Invalid admin PIN (Demo: 1234).');
    }

    userSession = {
      role: 'admin',
      name: 'Campus Administrator'
    };
  }

  const errorContainer = qs('#l_err');
  if (validationErrors.length) {
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="err">
          ${validationErrors.map(escapeHtml).join('<br>')}
        </div>
      `;
    }
    return;
  }

  const pendingEventToRegister = pendingRegistrationId;
  currentSession = userSession;
  setStorage('session', currentSession);

  closeModal();
  applyAuth();

  if (currentSession.role === 'student' && pendingEventToRegister) {
    show('events');
    openReg(pendingEventToRegister);
  } else if (currentSession.role === 'organizer') {
    show('org');
  } else if (currentSession.role === 'admin') {
    show('admin');
  } else {
    show('events');
  }
}

function doLogout() {
  currentSession = null;
  setStorage('session', null);
  pendingRegistrationId = null;
  applyAuth();
  show('events');
}

// --- 8. View Navigation Routing ---
function show(viewName) {
  const currentRole = getUserRole();
  const allowedViews = ['events', 'detail'].concat((NAVIGATION_TABS[currentRole] || []).map((tab) => tab[0]));

  const targetView = allowedViews.includes(viewName) ? viewName : 'events';

  const viewIds = ['events', 'detail', 'tickets', 'org', 'admin'];
  viewIds.forEach((viewKey) => {
    const sectionElement = qs('#v-' + viewKey);
    if (sectionElement) {
      sectionElement.classList.toggle('hide', viewKey !== targetView);
    }
  });

  qsa('#nav button').forEach((button) => {
    const buttonTarget = button.dataset.v;
    button.classList.toggle('on', buttonTarget === (targetView === 'detail' ? 'events' : targetView));
  });

  if (targetView === 'events') renderEvents();
  if (targetView === 'tickets') renderMine();
  if (targetView === 'admin') renderAdmin();
  if (targetView === 'org') renderOrg();
}

const navContainer = qs('#nav');
if (navContainer) {
  navContainer.onclick = (event) => {
    const targetView = event.target.dataset.v;
    if (targetView) {
      show(targetView);
      navContainer.classList.remove('mobile-open');
      const mb = document.getElementById('menuBtn');
      if (mb) mb.setAttribute('aria-expanded', 'false');
    }
  };
}

// --- 9. Modal System ---
function openModal(htmlContent) {
  const modalBody = qs('#mbody');
  const modalElement = qs('#modal');
  if (modalBody && modalElement) {
    modalBody.innerHTML = htmlContent;
    modalElement.classList.add('open');
    modalElement.setAttribute('aria-hidden', 'false');
  }
}

function closeModal() {
  const modalElement = qs('#modal');
  if (modalElement) {
    modalElement.classList.remove('open');
    modalElement.setAttribute('aria-hidden', 'true');
  }
  pendingRegistrationId = null;
}

const modalCloseBtn = qs('#mx');
if (modalCloseBtn) {
  modalCloseBtn.onclick = closeModal;
}

const modalBackdrop = qs('#modal');
if (modalBackdrop) {
  modalBackdrop.onclick = (event) => {
    if (event.target.id === 'modal') {
      closeModal();
    }
  };
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

// --- 10. Event Cards & Catalog View ---
function createEventCardHtml(eventItem, registrations, categoryColor) {
  const registeredCount = registrations.filter((reg) => reg.eid === eventItem.id).length;
  const seatsRemaining = eventItem.seats - registeredCount;
  const isRegistrationClosed = new Date(`${eventItem.deadline}T23:59:59`) < new Date();
  const isEventFull = seatsRemaining <= 0;
  const parsedEventDate = new Date(`${eventItem.date}T00:00:00`);

  const dayNumber = parsedEventDate.getDate();
  const monthAbbr = MONTH_NAMES[parsedEventDate.getMonth()] || '';

  const registerBtnLabel = isRegistrationClosed
    ? 'Registration closed'
    : isEventFull
    ? 'Event full'
    : 'Register';

  const avgRating = getEventAverageRating(eventItem.id);
  const ratingBadgeHtml = avgRating.count
    ? `<span class="tag rating-tag" title="Average Rating: ${avgRating.score.toFixed(1)} out of 5 (${avgRating.count} review${avgRating.count > 1 ? 's' : ''})"><span style="color:var(--gold);">★</span> ${avgRating.score.toFixed(1)} <small style="font-size:0.75rem; opacity:0.8;">(${avgRating.count})</small></span>`
    : `<span class="tag rating-tag" title="No reviews yet"><span style="color:var(--gold);">★</span> New</span>`;

  return `
    <article class="ev" style="--tc: ${categoryColor};" onclick="showEvent('${eventItem.id}')">
      <div class="date">
        <b>${dayNumber}</b>
        <span>${monthAbbr}</span>
      </div>
      <div class="in">
        <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
          <span class="tag ${eventItem.fee ? 'paid' : 'free'}">
            ${eventItem.fee ? '₹' + eventItem.fee : 'Free'}
          </span>
          ${eventItem.team ? '<span class="tag">Team</span>' : ''}
          ${ratingBadgeHtml}
        </div>
        <h3>
          <button type="button" class="lnk">${escapeHtml(eventItem.name)}</button>
        </h3>
        <p class="mut">
          ${escapeHtml(eventItem.club)} · ${escapeHtml(eventItem.venue)}<br>
          ${Math.max(seatsRemaining, 0)} of ${eventItem.seats} seats left · register by ${escapeHtml(eventItem.deadline)}
        </p>
        <p class="mut">${escapeHtml(eventItem.desc)}</p>
        <div style="display: flex; gap: 8px; align-items: center; margin-top: auto; padding-top: 6px;">
          <button
            type="button"
            class="btn sm"
            ${isRegistrationClosed || isEventFull ? 'disabled' : ''}
            onclick="event.stopPropagation(); openReg('${eventItem.id}')"
          >
            ${registerBtnLabel}
          </button>
          <button
            type="button"
            class="btn sm btn--outline"
            onclick="event.stopPropagation(); openFeedbackModal('${eventItem.id}')"
            title="Give feedback for this event"
          >
            ★ Feedback
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderEvents() {
  const searchInput = qs('#q');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const registrations = getStorage('regs', []);

  const allFilteredEvents = getAllPublishedEvents()
    .filter((event) => {
      const searchableContent = `${event.name} ${event.club} ${event.venue} ${event.desc}`.toLowerCase();
      return searchableContent.includes(query);
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  // Render Category Filter Chips
  const chipsContainer = qs('#chips');
  if (chipsContainer) {
    const chipFilters = [{ t: '', n: 'All' }].concat(EVENT_CATEGORIES.map((cat) => ({ t: cat.t, n: cat.t })));

    chipsContainer.innerHTML = chipFilters
      .map((chip) => {
        const count = chip.t
          ? allFilteredEvents.filter((item) => item.type === chip.t).length
          : allFilteredEvents.length;
        const isActive = currentCategoryFilter === chip.t ? 'on' : '';
        return `
          <button type="button" class="chip ${isActive}" onclick="setType('${chip.t}')">
            ${chip.n} <span>${count}</span>
          </button>
        `;
      })
      .join('');
  }

  // Render Categorized Event Lists
  const eventsListContainer = qs('#evList');
  if (!eventsListContainer) return;

  const visibleCategories = EVENT_CATEGORIES.filter(
    (cat) => !currentCategoryFilter || cat.t === currentCategoryFilter
  );

  const sectionsHtml = visibleCategories
    .map((category) => {
      const categoryEvents = allFilteredEvents.filter((item) => item.type === category.t);
      if (!categoryEvents.length) return '';

      const isSingleCategoryView = currentCategoryFilter === category.t;

      return `
        <section class="group" style="--tc: ${category.c};">
          <div class="ghead">
            <h2>${category.t}</h2>
            <p class="mut">${category.d} · ${categoryEvents.length} event${categoryEvents.length > 1 ? 's' : ''}</p>
          </div>
          ${
            isSingleCategoryView
              ? `<div class="grid">${categoryEvents.map((e) => createEventCardHtml(e, registrations, category.c)).join('')}</div>`
              : `
                <div class="rowbox">
                  <button type="button" class="arr l" aria-label="Scroll left" onclick="scrollRow(this, -1)">&lsaquo;</button>
                  <div class="rowx">${categoryEvents.map((e) => createEventCardHtml(e, registrations, category.c)).join('')}</div>
                  <button type="button" class="arr r" aria-label="Scroll right" onclick="scrollRow(this, 1)">&rsaquo;</button>
                </div>
              `
          }
        </section>
      `;
    })
    .join('');

  eventsListContainer.innerHTML =
    sectionsHtml ||
    '<p class="empty">No events match your search query. Try clearing the search box or selecting another category.</p>';
  requestAnimationFrame(initCarousels);
}

// --- Carousel Arrow Visibility -------------------------------------------
// Tracks active cleanup handles so they are removed before each re-render.
let _carouselCleanups = [];

/**
 * Update the left/right arrow visibility for a single .rowx scroll container.
 * Arrows are hidden with display:none (not just invisible) so they are
 * completely removed from the layout when they serve no purpose.
 * A tolerance of 2 px guards against sub-pixel / floating-point scroll drift.
 */
function updateArrows(rowx) {
  const TOLERANCE = 2;
  const box = rowx.closest('.rowbox');
  if (!box) return;

  const atStart  = rowx.scrollLeft <= TOLERANCE;
  const atEnd    = rowx.scrollLeft + rowx.clientWidth >= rowx.scrollWidth - TOLERANCE;
  const canScroll = rowx.scrollWidth > rowx.clientWidth + TOLERANCE;

  const leftBtn  = box.querySelector('.arr.l');
  const rightBtn = box.querySelector('.arr.r');

  if (leftBtn)  leftBtn.style.display  = (canScroll && !atStart) ? '' : 'none';
  if (rightBtn) rightBtn.style.display = (canScroll && !atEnd)   ? '' : 'none';
}

function syncArrows() {
  document.querySelectorAll('.rowx').forEach(updateArrows);
}

/**
 * Attach scroll listeners and a ResizeObserver to every .rowx in the page.
 * Cleanup callbacks are stored so they can be torn down before the next render.
 */
function initCarousels() {
  // Tear down previous listeners / observers first.
  _carouselCleanups.forEach((fn) => fn());
  _carouselCleanups = [];

  const allRowx = document.querySelectorAll('.rowx');
  if (!allRowx.length) return;

  // Initial pass: set correct visibility immediately after render.
  allRowx.forEach(updateArrows);

  // Per-container scroll listener.
  allRowx.forEach((rowx) => {
    const onScroll = () => updateArrows(rowx);
    rowx.addEventListener('scroll', onScroll, { passive: true });
    _carouselCleanups.push(() => rowx.removeEventListener('scroll', onScroll));
  });

  // ResizeObserver fires when the container or its content changes size
  // (viewport resize, orientation change, dynamic card additions).
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => allRowx.forEach(updateArrows));
    allRowx.forEach((rowx) => ro.observe(rowx));
    _carouselCleanups.push(() => ro.disconnect());
  } else {
    // Fallback for browsers without ResizeObserver.
    const onResize = () => allRowx.forEach(updateArrows);
    window.addEventListener('resize', onResize);
    _carouselCleanups.push(() => window.removeEventListener('resize', onResize));
  }
}

// Stable window-resize handler for when the events view is already visible
// (e.g. user resizes without triggering a re-render).
window.addEventListener('resize', syncArrows);

function setType(categoryType) {
  currentCategoryFilter = categoryType;
  renderEvents();
}

function scrollRow(buttonElement, direction) {
  const scrollContainer = buttonElement.parentElement.querySelector('.rowx');
  if (scrollContainer) {
    scrollContainer.scrollBy({
      left: direction * scrollContainer.clientWidth * 0.8,
      behavior: 'smooth'
    });
    // Arrow visibility is updated by the scroll event listener in initCarousels.
  }
}

const searchInputElement = qs('#q');
if (searchInputElement) {
  searchInputElement.oninput = renderEvents;
}

// Backwards-compatible aliases
const card = createEventCardHtml;

// --- 11. Event Details View ---
function showEvent(eventId, skipPushState = false) {
  renderDetail(eventId);
  show('detail');
  window.scrollTo(0, 0);

  if (!skipPushState) {
    try {
      history.pushState({ e: eventId }, '', '#event-' + eventId);
    } catch (error) {
      // Ignore pushState restrictions in restricted browser environments
    }
  }
}

window.addEventListener('popstate', (event) => {
  if (event.state && event.state.e) {
    showEvent(event.state.e, true);
  } else {
    show('events');
  }
});

function goBack() {
  if (history.state && history.state.e) {
    history.back();
  } else {
    show('events');
  }
}

function renderDetail(eventId) {
  const eventItem = getEventById(eventId);
  const detailContainer = qs('#v-detail');
  if (!detailContainer) return;

  if (!eventItem) {
    detailContainer.innerHTML = '<p class="empty">The requested event was not found.</p>';
    return;
  }

  const categoryMeta = EVENT_CATEGORIES.find((cat) => cat.t === eventItem.type) || { c: '#f26a21' };
  const registrations = getStorage('regs', []);
  const registeredCount = registrations.filter((reg) => reg.eid === eventId).length;
  const seatsRemaining = Math.max(eventItem.seats - registeredCount, 0);
  const fillPercentage = Math.min(100, Math.round((registeredCount / eventItem.seats) * 100));

  const deadlineDate = new Date(`${eventItem.deadline}T23:59:59`);
  const isRegistrationClosed = deadlineDate < new Date();
  const isEventFull = seatsRemaining <= 0;
  const daysUntilDeadline = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));

  let deadlineStatusMessage = `${daysUntilDeadline} days left to register`;
  if (isRegistrationClosed) {
    deadlineStatusMessage = 'Registration is closed';
  } else if (isEventFull) {
    deadlineStatusMessage = 'This event is full';
  } else if (daysUntilDeadline <= 1) {
    deadlineStatusMessage = 'Registration closes today';
  }

  const avgRating = getEventAverageRating(eventId);
  const eventFeedbackList = getEventFeedback(eventId).sort((a, b) => b.at.localeCompare(a.at));

  const relatedEvents = getAllPublishedEvents()
    .filter((item) => item.type === eventItem.type && item.id !== eventId)
    .slice(0, 3);

  detailContainer.innerHTML = `
    <p>
      <button type="button" class="btn sec sm" onclick="goBack()">← Back to events</button>
    </p>

    <div class="dhero" style="--tc: ${categoryMeta.c};">
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: var(--s2);">
        <span class="tag">${escapeHtml(eventItem.type)}</span>
        <span class="tag ${eventItem.fee ? 'paid' : 'free'}">${eventItem.fee ? '₹' + eventItem.fee : 'Free'}</span>
        ${eventItem.team ? '<span class="tag">Team event</span>' : ''}
        <span class="tag rating-tag">
          ★ ${avgRating.count ? avgRating.score.toFixed(1) + ' / 5 (' + avgRating.count + ' review' + (avgRating.count > 1 ? 's' : '') + ')' : 'No ratings yet'}
        </span>
      </div>
      <h2>${escapeHtml(eventItem.name)}</h2>
      <p>Hosted by ${escapeHtml(eventItem.club)}</p>
    </div>

    <div class="dgrid">
      <div class="dmain">
        <div class="panel">
          <h2>About this event</h2>
          <p>${escapeHtml(eventItem.desc) || 'Detailed guidelines will be shared by the event coordinator.'}</p>
        </div>

        <div class="panel">
          <h2>Event details</h2>
          <dl class="dl">
            <dt>Date</dt>
            <dd>${formatDisplayDate(eventItem.date)}</dd>
            <dt>Start time</dt>
            <dd>${formatDisplayTime(eventItem.time)}</dd>
            <dt>Venue</dt>
            <dd>${escapeHtml(eventItem.venue)}</dd>
            <dt>Organizer</dt>
            <dd>${escapeHtml(eventItem.club)}</dd>
            <dt>Type</dt>
            <dd>${escapeHtml(eventItem.type)}${eventItem.team ? ' (team entry)' : ' (individual entry)'}</dd>
            <dt>Fee</dt>
            <dd>${eventItem.fee ? '₹' + eventItem.fee + ' per ' + (eventItem.team ? 'team' : 'person') : 'Free'}</dd>
            <dt>Register by</dt>
            <dd>${formatDisplayDate(eventItem.deadline)}</dd>
          </dl>
        </div>

        <div class="panel">
          <h2>How registration works</h2>
          <ol class="steps">
            <li>Fill in your name, registration number, roll number, university email, and mobile number.</li>
            ${
              eventItem.fee
                ? '<li>Scan the UPI QR code to complete payment and enter your transaction ID. The organizing team verifies it.</li>'
                : ''
            }
            <li>Generate your printable event ticket with dynamic QR code authentication.</li>
            <li>Present the ticket on your phone or in print at the entrance gate.</li>
          </ol>
        </div>

        <div class="panel">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
            <div>
              <h2 style="margin: 0; padding-bottom: 0; border-bottom: none;">Student Reviews & Suggestions</h2>
              <p class="mut" style="margin: 4px 0 0;">
                ${
                  avgRating.count
                    ? `Average Rating: <strong style="color:var(--gold); font-size:1.05rem;">★ ${avgRating.score.toFixed(1)}</strong> out of 5 · ${avgRating.count} student review${avgRating.count > 1 ? 's' : ''}`
                    : 'No student reviews yet. Be the first to share your thoughts!'
                }
              </p>
            </div>
            <button type="button" class="btn sm" onclick="openFeedbackModal('${eventItem.id}')">★ Give Feedback</button>
          </div>

          ${
            eventFeedbackList.length
              ? `
            <div class="feedback-grid">
              ${eventFeedbackList
                .map(
                  (fb) => `
                <div class="feedback-card">
                  <div class="feedback-header">
                    <span class="feedback-author">${escapeHtml(fb.name)}</span>
                    <span class="feedback-stars" title="${fb.rating} of 5 stars">${renderStars(fb.rating)}</span>
                  </div>
                  ${fb.suggestion ? `<p class="feedback-body">${escapeHtml(fb.suggestion)}</p>` : ''}
                  <span class="feedback-time">${formatDisplayDate(fb.at.slice(0, 10))}</span>
                </div>
              `
                )
                .join('')}
            </div>
          `
              : '<p class="empty" style="padding: 24px;">No feedback submitted for this event yet.</p>'
          }
        </div>

        ${
          relatedEvents.length
            ? `
          <div class="panel">
            <h2>More ${escapeHtml(eventItem.type)} events</h2>
            <div class="rels">
              ${relatedEvents
                .map(
                  (relItem) => `
                <button type="button" class="rel" onclick="showEvent('${relItem.id}')">
                  <b>${escapeHtml(relItem.name)}</b>
                  <span>${escapeHtml(relItem.date)} · ${escapeHtml(relItem.venue)}</span>
                </button>
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }
      </div>

      <aside class="dside panel">
        <h2>Registration Status</h2>
        <p class="big">${seatsRemaining} <small>of ${eventItem.seats} seats left</small></p>
        <div class="bar2" role="progressbar" aria-valuenow="${fillPercentage}" aria-valuemin="0" aria-valuemax="100">
          <i style="width: ${fillPercentage}%;"></i>
        </div>
        <p class="mut">${escapeHtml(deadlineStatusMessage)}</p>
        <p>
          <button
            type="button"
            class="btn"
            style="width: 100%;"
            ${isRegistrationClosed || isEventFull ? 'disabled' : ''}
            onclick="openReg('${eventItem.id}')"
          >
            ${
              isRegistrationClosed
                ? 'Registration closed'
                : isEventFull
                ? 'Event full'
                : eventItem.fee
                ? 'Register and pay ₹' + eventItem.fee
                : 'Register now'
            }
          </button>
        </p>
        <p style="margin: 10px 0 0;">
          <button
            type="button"
            class="btn btn--outline sm"
            style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;"
            onclick="openFeedbackModal('${eventItem.id}')"
          >
            <span style="color:var(--gold);">★</span> Give Feedback
          </button>
        </p>
        <p style="display: flex; gap: 8px; margin-top: 10px;">
          <button type="button" class="btn sec sm" style="flex: 1;" onclick="addCal('${eventItem.id}')">Add to calendar</button>
          <button type="button" class="btn sec sm" style="flex: 1;" onclick="copyLink(this)">Copy link</button>
        </p>
      </aside>
    </div>
  `;
}

function addCal(eventId) {
  const eventItem = getEventById(eventId);
  if (!eventItem) return;

  const escapeIcsText = (str) => String(str || '').replace(/[\\,;]/g, '\\$&');
  const [hour = '10', min = '00'] = (eventItem.time || '10:00').split(':');

  const startTimestamp = `${eventItem.date.replace(/-/g, '')}T${hour.padStart(2, '0')}${min.padStart(2, '0')}00`;
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LPU Campus Events System//EN',
    'BEGIN:VEVENT',
    `UID:${eventItem.id}@lpu-events`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART:${startTimestamp}`,
    `SUMMARY:${escapeIcsText(eventItem.name)}`,
    `LOCATION:${escapeIcsText(eventItem.venue)}`,
    `DESCRIPTION:${escapeIcsText(eventItem.desc)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  downloadFile(`${eventItem.id}.ics`, icsLines.join('\r\n'), 'text/calendar');
}

function copyLink(buttonElement) {
  const currentUrl = window.location.href;
  const handleSuccess = () => {
    const originalText = buttonElement.textContent;
    buttonElement.textContent = 'Link copied!';
    setTimeout(() => {
      buttonElement.textContent = originalText;
    }, 1500);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(currentUrl).then(handleSuccess, () => {
      buttonElement.textContent = 'Copy failed';
    });
  } else {
    buttonElement.textContent = 'Copy not supported';
  }
}

// --- 12. Student Event Registration ---
function openReg(eventId) {
  const eventItem = getEventById(eventId);
  if (!eventItem) return;

  if (!currentSession) {
    pendingRegistrationId = eventId;
    loginRedirectNote = 'Please log in as a student to register for events.';
    openLogin('student');
    return;
  }

  if (currentSession.role !== 'student') {
    openModal(`
      <h2 style="margin-top: 0;">Students Only</h2>
      <p>Only students can register for events. Please log out and sign in with your student credentials.</p>
    `);
    return;
  }

  const modalContent = `
    <h2 style="margin-top: 0;">Register for ${escapeHtml(eventItem.name)}</h2>
    <form class="f" id="rf" novalidate>
      <label for="r_name">Full name</label>
      <input id="r_name" value="${escapeHtml(currentSession.name)}" readonly>

      <div class="row">
        <div>
          <label for="r_reg">Registration number</label>
          <input id="r_reg" value="${escapeHtml(currentSession.reg)}" readonly>
        </div>
        <div>
          <label for="r_roll">Roll number</label>
          <input id="r_roll" value="${escapeHtml(currentSession.roll)}" readonly>
        </div>
        <div>
          <label for="r_mail">University email</label>
          <input id="r_mail" type="email" autocomplete="email" placeholder="student@lpu.in">
        </div>
        <div>
          <label for="r_ph">Phone (10 digits)</label>
          <input id="r_ph" inputmode="numeric" maxlength="10" placeholder="e.g. 9876543210">
        </div>
        <div>
          <label for="r_br">Branch (optional)</label>
          <input id="r_br" placeholder="e.g. CSE / ECE">
        </div>
        <div>
          <label for="r_yr">Year (optional)</label>
          <select id="r_yr">
            <option value="">Select Year</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
          </select>
        </div>
      </div>

      ${
        eventItem.team
          ? `
        <div class="row">
          <div>
            <label for="r_tn">Team name</label>
            <input id="r_tn" placeholder="e.g. Code Knights">
          </div>
          <div>
            <label for="r_ts">Team size (2-11)</label>
            <input id="r_ts" type="number" min="2" max="11" value="2">
          </div>
        </div>
      `
          : ''
      }

      ${
        eventItem.fee
          ? `
        <div class="panel" style="margin-top: 14px; text-align: center;">
          <b>Pay ₹${eventItem.fee} to ${escapeHtml(eventItem.upi || 'the organizer')}</b>
          <div class="qr" id="payqr" style="display: flex; justify-content: center; margin: 10px 0;"></div>
          <label for="r_tx" style="text-align: left;">Payment Transaction / UTR ID</label>
          <input id="r_tx" placeholder="12-digit UPI reference ID">
        </div>
      `
          : ''
      }

      <div id="r_err"></div>
      <p style="margin-top: 16px;">
        <button class="btn" style="width: 100%;" type="submit">
          ${eventItem.fee ? 'Submit Registration & Payment' : 'Complete Registration'}
        </button>
      </p>
    </form>
  `;

  openModal(modalContent);

  if (eventItem.fee && window.QRCode) {
    const upiUri = `upi://pay?pa=${eventItem.upi}&pn=${encodeURIComponent(eventItem.name)}&am=${eventItem.fee}&cu=INR`;
    new QRCode(qs('#payqr'), {
      text: upiUri,
      width: 150,
      height: 150
    });
  }

  const registrationForm = qs('#rf');
  if (registrationForm) {
    registrationForm.onsubmit = (event) => {
      event.preventDefault();
      submitReg(eventItem);
    };
  }
}

function submitReg(eventItem) {
  const getInputValue = (id) => (qs('#' + id) ? qs('#' + id).value.trim() : '');
  const validationErrors = [];
  const existingRegistrations = getStorage('regs', []);

  const fullName = getInputValue('r_name');
  const registrationNo = getInputValue('r_reg').toUpperCase();
  const rollNo = getInputValue('r_roll').toUpperCase();
  const email = getInputValue('r_mail');
  const phone = getInputValue('r_ph');
  const branch = getInputValue('r_br');
  const year = getInputValue('r_yr');
  const teamName = getInputValue('r_tn');
  const teamSize = getInputValue('r_ts');
  const transactionId = getInputValue('r_tx');

  if (!/^[A-Za-z][A-Za-z .'-]{2,}$/.test(fullName)) {
    validationErrors.push('Enter your full name (letters only, at least 3 characters).');
  }
  if (!/^[A-Z0-9\/-]{5,20}$/.test(registrationNo)) {
    validationErrors.push('Registration number must be 5 to 20 letters or digits.');
  }
  if (!/^[A-Z0-9\/-]{1,20}$/.test(rollNo)) {
    validationErrors.push('Enter a valid roll number.');
  }
  if (registrationNo && registrationNo === rollNo) {
    validationErrors.push('Registration number and roll number must be different.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    validationErrors.push('Enter a valid email address.');
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    validationErrors.push('Phone must be a valid 10-digit number starting with 6, 7, 8, or 9.');
  }
  if (eventItem.team) {
    const sizeNumber = Number(teamSize);
    if (!(sizeNumber >= 2 && sizeNumber <= 11)) {
      validationErrors.push('Team size must be between 2 and 11 members.');
    }
  }
  if (eventItem.fee && transactionId.length < 8) {
    validationErrors.push('Enter the payment transaction ID / UTR reference (at least 8 characters).');
  }
  if (existingRegistrations.some((r) => r.eid === eventItem.id && r.reg === registrationNo)) {
    validationErrors.push('This registration number is already registered for this event.');
  }
  if (existingRegistrations.filter((r) => r.eid === eventItem.id).length >= eventItem.seats) {
    validationErrors.push('Sorry, all seats for this event are fully booked.');
  }
  if (new Date(`${eventItem.deadline}T23:59:59`) < new Date()) {
    validationErrors.push('Registration for this event has already closed.');
  }

  const errorContainer = qs('#r_err');
  if (validationErrors.length) {
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="err">
          ${validationErrors.map(escapeHtml).join('<br>')}
        </div>
      `;
    }
    return;
  }

  const generatedTicketId = `REG-${eventItem.id.toUpperCase().slice(0, 4)}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;

  const newRegistration = {
    rid: generatedTicketId,
    eid: eventItem.id,
    ename: eventItem.name,
    name: fullName,
    reg: registrationNo,
    roll: rollNo,
    email: email,
    phone: phone,
    branch: branch,
    year: year,
    team: eventItem.team ? teamName : '',
    size: eventItem.team ? teamSize : '',
    tx: transactionId,
    status: eventItem.fee ? 'Payment pending' : 'Confirmed',
    attended: false,
    at: new Date().toISOString()
  };

  existingRegistrations.push(newRegistration);
  setStorage('regs', existingRegistrations);

  renderEvents();

  const detailViewElement = qs('#v-detail');
  if (detailViewElement && !detailViewElement.classList.contains('hide')) {
    renderDetail(eventItem.id);
  }

  showTicket(newRegistration.rid, true);
}

// --- 13. Ticket Display & QR Code Generation ---
function showTicket(ticketId, isFreshRegistration = false) {
  const registrations = getStorage('regs', []);
  const registrationRecord = registrations.find((item) => item.rid === ticketId);
  if (!registrationRecord) return;

  const eventItem = getEventById(registrationRecord.eid) || { date: '', venue: '' };

  const modalHtml = `
    ${
      isFreshRegistration
        ? '<div class="msg">Registration successful! Your official admission ticket is generated below.</div>'
        : ''
    }
    <div class="ticket" id="ticketBox">
      <div class="top">
        <small style="color: var(--acc); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Lovely Professional University</small>
        <br>
        <b style="font-size: 1.15rem;">${escapeHtml(registrationRecord.ename)}</b>
        <br>
        <span style="font-size: 0.88rem; color: #ececf0;">
          ${escapeHtml(eventItem.date)} · ${escapeHtml(eventItem.venue)}
        </span>
      </div>
      <div class="bd">
        <b style="font-size: 1.15rem; display: block; margin-bottom: 2px;">${escapeHtml(registrationRecord.name)}</b>
        <span class="mut">Reg: ${escapeHtml(registrationRecord.reg)} · Roll: ${escapeHtml(registrationRecord.roll)}</span>
        ${
          registrationRecord.team
            ? `<br><span class="mut">Team: ${escapeHtml(registrationRecord.team)} (${escapeHtml(registrationRecord.size)} members)</span>`
            : ''
        }
        <div class="qr" id="tqr"></div>
        <b style="letter-spacing: 1px; font-size: 1rem;">${escapeHtml(registrationRecord.rid)}</b>
        <br>
        <span class="tag ${registrationRecord.status === 'Confirmed' ? 'free' : 'paid'}" style="margin-top: 6px;">
          ${escapeHtml(registrationRecord.status)}
        </span>
      </div>
    </div>
    <p style="text-align: center; margin-top: 14px;">
      <button type="button" class="btn" onclick="window.print()">Print / Save Ticket as PDF</button>
    </p>
  `;

  openModal(modalHtml);

  const qrPayload = `${registrationRecord.rid}|${registrationRecord.name}|${registrationRecord.reg}|${registrationRecord.ename}`;
  const qrContainer = qs('#tqr');

  if (qrContainer) {
    if (window.QRCode) {
      new QRCode(qrContainer, {
        text: qrPayload,
        width: 140,
        height: 140
      });
    } else {
      qrContainer.textContent = '[QR code requires active internet connection to load library]';
    }
  }
}

function renderMine() {
  const registrations = getStorage('regs', []).filter((reg) => currentSession && reg.reg === currentSession.reg);
  const myTicketsContainer = qs('#myRegs');
  if (!myTicketsContainer) return;

  if (registrations.length) {
    myTicketsContainer.innerHTML = `
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Attendee</th>
              <th>Ticket ID</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${registrations
              .map(
                (reg) => `
              <tr>
                <td><strong>${escapeHtml(reg.ename)}</strong></td>
                <td>${escapeHtml(reg.name)}</td>
                <td><code>${escapeHtml(reg.rid)}</code></td>
                <td>
                  <span class="tag ${reg.status === 'Confirmed' ? 'free' : 'paid'}">
                    ${escapeHtml(reg.status)}
                  </span>
                </td>
                <td>
                  <button type="button" class="btn sm sec" onclick="showTicket('${reg.rid}')">View Ticket</button>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    myTicketsContainer.innerHTML = `
      <p class="empty">You have not registered for any events yet. Explore the Events tab to find upcoming campus activities.</p>
    `;
  }
}

// --- 13.1. Event Feedback Modal & Submission Logic ---
let currentFeedbackRating = 5;

const RATING_DESCRIPTIONS = {
  1: '1 · Poor',
  2: '2 · Fair',
  3: '3 · Good',
  4: '4 · Very Good',
  5: '5 · Excellent'
};

function setModalRating(val) {
  currentFeedbackRating = Math.max(1, Math.min(5, Number(val) || 5));
  const hiddenInput = qs('#fb_rating');
  if (hiddenInput) hiddenInput.value = currentFeedbackRating;

  qsa('.star-btn').forEach((btn) => {
    const starNum = Number(btn.dataset.star);
    btn.classList.toggle('active', starNum <= currentFeedbackRating);
  });

  const labelEl = qs('#fb_rating_label');
  if (labelEl) {
    labelEl.textContent = RATING_DESCRIPTIONS[currentFeedbackRating] || `${currentFeedbackRating} Stars`;
  }
}

function openFeedbackModal(eventId) {
  const eventItem = getEventById(eventId);
  if (!eventItem) return;

  const defaultName = currentSession && currentSession.role === 'student' ? currentSession.name : '';
  currentFeedbackRating = 5;

  const modalHtml = `
    <h2 style="margin-top: 0;">Give Event Feedback</h2>
    <p class="mut" style="margin-top: -8px; margin-bottom: 18px;">
      Share your experience and review for <strong>${escapeHtml(eventItem.name)}</strong>
    </p>

    <form class="f" id="fbForm" novalidate>
      <label for="fb_name">Student Name</label>
      <input id="fb_name" type="text" placeholder="Enter your full name" value="${escapeHtml(defaultName)}">

      <label>Rating (1 to 5 Stars)</label>
      <input type="hidden" id="fb_rating" value="5">
      <div class="star-rating-select" role="radiogroup" aria-label="Rate from 1 to 5 stars">
        ${[1, 2, 3, 4, 5]
          .map(
            (num) => `
          <button
            type="button"
            class="star-btn ${num <= 5 ? 'active' : ''}"
            data-star="${num}"
            onclick="setModalRating(${num})"
            aria-label="${num} star${num > 1 ? 's' : ''}"
          >★</button>
        `
          )
          .join('')}
        <span class="star-label" id="fb_rating_label">5 · Excellent</span>
      </div>

      <label for="fb_sugg">Suggestions & Comments</label>
      <textarea id="fb_sugg" rows="4" placeholder="What did you enjoy most? What could the organizing team improve?"></textarea>

      <div id="fb_err"></div>

      <p style="margin-top: 20px;">
        <button class="btn" style="width: 100%;" type="submit">Submit Feedback</button>
      </p>
    </form>
  `;

  openModal(modalHtml);

  const form = qs('#fbForm');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      submitFeedback(eventItem);
    };
  }
}

function submitFeedback(eventItem) {
  const nameInput = qs('#fb_name');
  const suggInput = qs('#fb_sugg');
  const ratingInput = qs('#fb_rating');
  const errContainer = qs('#fb_err');

  const studentName = nameInput ? nameInput.value.trim() : '';
  const suggestions = suggInput ? suggInput.value.trim() : '';
  const rating = ratingInput ? Number(ratingInput.value) : 5;

  const errors = [];
  if (!studentName || studentName.length < 2) {
    errors.push('Please enter your name (at least 2 characters).');
  }
  if (!rating || rating < 1 || rating > 5) {
    errors.push('Please choose a star rating from 1 to 5.');
  }

  if (errors.length) {
    if (errContainer) {
      errContainer.innerHTML = `<div class="err">${errors.map(escapeHtml).join('<br>')}</div>`;
    }
    return;
  }

  const newFeedback = {
    id: 'FB-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
    eid: eventItem.id,
    ename: eventItem.name,
    name: studentName,
    rating: rating,
    suggestion: suggestions,
    at: new Date().toISOString()
  };

  const list = getAllFeedback();
  list.unshift(newFeedback);
  saveFeedback(list);

  openModal(`
    <div style="text-align: center; padding: 14px 8px;">
      <div style="font-size: 2.8rem; color: var(--gold); line-height: 1; margin-bottom: 12px;">★</div>
      <h2 style="margin: 0 0 8px;">Thank You for Your Feedback!</h2>
      <p class="mut" style="margin-bottom: 22px;">
        Your review and rating for <strong>${escapeHtml(eventItem.name)}</strong> have been submitted successfully.
      </p>
      <button type="button" class="btn" onclick="closeModal()">Close</button>
    </div>
  `);

  renderEvents();

  const detailEl = qs('#v-detail');
  if (detailEl && !detailEl.classList.contains('hide')) {
    renderDetail(eventItem.id);
  }

  const adminEl = qs('#v-admin');
  if (adminEl && !adminEl.classList.contains('hide')) {
    renderAdmin();
  }
}

// --- 14. Organizer Dashboard ---
const organizerForm = qs('#orgForm');
if (organizerForm) {
  organizerForm.onsubmit = (event) => {
    event.preventDefault();
    const getInputValue = (id) => (qs('#' + id) ? qs('#' + id).value.trim() : '');
    const validationErrors = [];

    const eventName = getInputValue('o_name');
    const eventType = getInputValue('o_type');
    const clubName = getInputValue('o_club');
    const eventDate = getInputValue('o_date');
    const deadline = getInputValue('o_dead');
    const venue = getInputValue('o_venue');
    const time = getInputValue('o_time');
    const seatsLimit = Number(getInputValue('o_seats'));
    const feeAmount = Number(getInputValue('o_fee')) || 0;
    const isTeamEvent = getInputValue('o_team') === '1';
    const upiId = getInputValue('o_upi');
    const description = getInputValue('o_desc');

    if (eventName.length < 3) {
      validationErrors.push('Enter a descriptive event name (at least 3 characters).');
    }
    if (!clubName) {
      validationErrors.push('Enter the organizing club or department name.');
    }
    if (!eventDate || !deadline) {
      validationErrors.push('Choose both the event date and registration deadline.');
    } else if (deadline > eventDate) {
      validationErrors.push('The registration deadline cannot be after the event date.');
    }
    if (!venue) {
      validationErrors.push('Enter the campus venue location.');
    }
    if (!(seatsLimit >= 1)) {
      validationErrors.push('Seat limit must be at least 1.');
    }
    if (feeAmount > 0 && !/^[\w.-]+@[\w]+$/.test(upiId)) {
      validationErrors.push('Enter a valid UPI ID (e.g. clubname@upi) for paid event registration.');
    }

    const errorContainer = qs('#o_err');
    if (validationErrors.length) {
      if (errorContainer) {
        errorContainer.innerHTML = `
          <div class="err">
            ${validationErrors.map(escapeHtml).join('<br>')}
          </div>
        `;
      }
      return;
    }

    const proposedEvent = {
      id: 'u' + Date.now().toString(36),
      name: eventName,
      type: eventType,
      club: clubName,
      date: eventDate,
      deadline: deadline,
      venue: venue,
      time: time,
      seats: seatsLimit,
      fee: feeAmount,
      team: isTeamEvent,
      upi: upiId,
      desc: description
    };

    const pendingList = getStorage('pending', []);
    pendingList.push(proposedEvent);
    setStorage('pending', pendingList);

    if (errorContainer) errorContainer.innerHTML = '';
    organizerForm.reset();
    renderOrg();

    const outputContainer = qs('#o_out');
    if (outputContainer) {
      outputContainer.innerHTML = `
        <div class="msg">Event proposal submitted successfully! Download the request JSON file and send it to the campus administrator.</div>
        <button type="button" class="btn sec" id="dl">Download Event Request File (.json)</button>
      `;

      const downloadButton = qs('#dl');
      if (downloadButton) {
        downloadButton.onclick = () => {
          downloadFile(
            `event-request-${proposedEvent.id}.json`,
            JSON.stringify(proposedEvent, null, 2),
            'application/json'
          );
        };
      }
    }
  };
}

function renderOrg() {
  const clubInput = qs('#o_club');
  if (clubInput) {
    clubInput.value = currentSession && currentSession.club ? currentSession.club : '';
    clubInput.readOnly = true;
  }

  const pendingRequests = getStorage('pending', []).map((item) => [item, 'Waiting']);
  const approvedRequests = getStorage('approved', []).map((item) => [item, 'Approved']);

  const mySubmissions = pendingRequests
    .concat(approvedRequests)
    .filter(([item]) => currentSession && item.club === currentSession.club);

  const listContainer = qs('#o_list');
  if (listContainer) {
    if (mySubmissions.length) {
      listContainer.innerHTML = `
        <h2 style="margin-top: 20px;">Your Event Proposals</h2>
        ${mySubmissions
          .map(
            ([eventItem, statusLabel]) => `
          <div style="border-bottom: 1px solid var(--bd); padding: 8px 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
            <div>
              <strong>${escapeHtml(eventItem.name)}</strong>
              <span class="mut" style="margin-left: 8px;">${escapeHtml(eventItem.date)}</span>
            </div>
            <span class="tag ${statusLabel === 'Approved' ? 'free' : 'paid'}">
              ${statusLabel === 'Approved' ? 'Approved' : 'Waiting for approval'}
            </span>
          </div>
        `
          )
          .join('')}
      `;
    } else {
      listContainer.innerHTML = '';
    }
  }
}

// --- 15. Admin Dashboard ---
function renderAdmin() {
  const isAdminActive = Boolean(currentSession && currentSession.role === 'admin');
  const adminPanelContainer = qs('#aPanel');
  if (adminPanelContainer) {
    adminPanelContainer.classList.toggle('hide', !isAdminActive);
  }

  if (!isAdminActive) return;

  // Render Pending Approvals
  const pendingEvents = getStorage('pending', []);
  const pendingListContainer = qs('#pend');
  if (pendingListContainer) {
    if (pendingEvents.length) {
      pendingListContainer.innerHTML = pendingEvents
        .map(
          (eventItem, index) => `
        <div style="border-bottom: 1px solid var(--bd); padding: 12px 0;">
          <strong>${escapeHtml(eventItem.name)}</strong>
          <span class="mut" style="display: block; margin: 2px 0 8px;">
            ${escapeHtml(eventItem.type)} · ${escapeHtml(eventItem.date)} · ${escapeHtml(eventItem.venue)} · ${eventItem.seats} seats · ${eventItem.fee ? '₹' + eventItem.fee : 'Free'}
          </span>
          <button type="button" class="btn sm" onclick="decide(${index}, true)">Approve Event</button>
          <button type="button" class="btn sm bad" onclick="decide(${index}, false)">Reject</button>
        </div>
      `
        )
        .join('');
    } else {
      pendingListContainer.innerHTML = '<p class="mut">No events are waiting for approval at this time.</p>';
    }
  }

  // Render Registrations Table
  const registrations = getStorage('regs', []);
  const regTableContainer = qs('#regTable');
  if (regTableContainer) {
    if (registrations.length) {
      regTableContainer.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Event</th>
              <th>Student Name</th>
              <th>Reg / Roll</th>
              <th>Contact</th>
              <th>Payment Status</th>
              <th>Attended</th>
            </tr>
          </thead>
          <tbody>
            ${registrations
              .map(
                (reg, index) => `
              <tr>
                <td><code>${escapeHtml(reg.rid)}</code></td>
                <td><strong>${escapeHtml(reg.ename)}</strong></td>
                <td>${escapeHtml(reg.name)}</td>
                <td>${escapeHtml(reg.reg)} / ${escapeHtml(reg.roll)}</td>
                <td>${escapeHtml(reg.phone)}</td>
                <td>
                  <span class="tag ${reg.status === 'Confirmed' ? 'free' : 'paid'}">
                    ${escapeHtml(reg.status)}
                  </span>
                  ${
                    reg.status !== 'Confirmed'
                      ? `<button type="button" class="btn sm sec" style="margin-left: 4px;" onclick="verify(${index})">Verify</button>`
                      : ''
                  }
                </td>
                <td style="text-align: center;">
                  <input
                    type="checkbox"
                    aria-label="Mark attendance for ${escapeHtml(reg.name)}"
                    ${reg.attended ? 'checked' : ''}
                    onchange="attend(${index}, this.checked)"
                  >
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else {
      regTableContainer.innerHTML = '<p class="mut">No attendee registrations recorded yet.</p>';
    }
  }

  // Render Event Feedback Management
  renderAdminFeedback();
}

function renderAdminFeedback() {
  const allFeedback = getAllFeedback();
  const filterSelect = qs('#fbEventFilter');
  const selectedEventId = filterSelect ? filterSelect.value : '';

  // Populate event dropdown with all events
  if (filterSelect) {
    const currentVal = filterSelect.value;
    const events = getAllPublishedEvents();
    filterSelect.innerHTML =
      `<option value="">All Events (${allFeedback.length})</option>` +
      events
        .map((e) => {
          const count = allFeedback.filter((fb) => fb.eid === e.id).length;
          return `<option value="${e.id}" ${currentVal === e.id ? 'selected' : ''}>${escapeHtml(e.name)} (${count})</option>`;
        })
        .join('');
  }

  const filteredList = selectedEventId
    ? allFeedback.filter((fb) => fb.eid === selectedEventId)
    : allFeedback;

  // Render stats
  const statsContainer = qs('#fbAdminStats');
  if (statsContainer) {
    const totalCount = allFeedback.length;
    const avgScore = totalCount
      ? (allFeedback.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) / totalCount).toFixed(1)
      : '0.0';

    // Calculate top rated event
    const eventAverages = getAllPublishedEvents()
      .map((e) => {
        const stats = getEventAverageRating(e.id);
        return { event: e, ...stats };
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.score - a.score);

    const topEventText = eventAverages.length
      ? `${escapeHtml(eventAverages[0].event.name)} (★ ${eventAverages[0].score.toFixed(1)})`
      : 'None yet';

    statsContainer.innerHTML = `
      <div class="fb-stat-grid">
        <div class="fb-stat-pill">
          <span class="fb-stat-num">${totalCount}</span>
          <span class="fb-stat-title">Total Feedback Submissions</span>
        </div>
        <div class="fb-stat-pill">
          <span class="fb-stat-num">★ ${avgScore} <small style="font-size:0.9rem; color:var(--text-3);">/ 5</small></span>
          <span class="fb-stat-title">Campus Average Rating</span>
        </div>
        <div class="fb-stat-pill">
          <span class="fb-stat-num" style="font-size: 1.15rem; word-break: break-word;">${topEventText}</span>
          <span class="fb-stat-title">Top Rated Event</span>
        </div>
      </div>
    `;
  }

  // Render table
  const tableContainer = qs('#fbTable');
  if (tableContainer) {
    if (filteredList.length) {
      tableContainer.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Student Name</th>
              <th>Rating</th>
              <th>Suggestions / Comments</th>
              <th>Submitted Date</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            ${filteredList
              .map(
                (fb) => `
              <tr>
                <td><strong>${escapeHtml(fb.ename)}</strong></td>
                <td>${escapeHtml(fb.name)}</td>
                <td>
                  <span style="color:var(--gold); letter-spacing:1px; white-space:nowrap;">${renderStars(fb.rating)}</span>
                  <span class="muted-text" style="font-size:0.8rem; margin-left:4px;">(${fb.rating}/5)</span>
                </td>
                <td style="max-width:320px; line-height:1.4;">${escapeHtml(fb.suggestion || '—')}</td>
                <td style="white-space:nowrap;">${formatDisplayDate(fb.at.slice(0, 10))}</td>
                <td>
                  <button type="button" class="btn sm bad" onclick="deleteFeedback('${fb.id}')">Delete</button>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else {
      tableContainer.innerHTML = '<p class="mut" style="padding:16px 0;">No feedback entries found for this selection.</p>';
    }
  }
}

function deleteFeedback(feedbackId) {
  if (!confirm('Are you sure you want to delete this student feedback?')) return;
  const list = getAllFeedback().filter((item) => item.id !== feedbackId);
  saveFeedback(list);
  renderAdmin();
  renderEvents();
  const detailEl = qs('#v-detail');
  if (detailEl && !detailEl.classList.contains('hide') && history.state && history.state.e) {
    renderDetail(history.state.e);
  }
}

function decide(index, isApproved) {
  const pendingEvents = getStorage('pending', []);
  const [targetEvent] = pendingEvents.splice(index, 1);
  setStorage('pending', pendingEvents);

  if (isApproved && targetEvent) {
    const approvedEvents = getStorage('approved', []);
    approvedEvents.push(targetEvent);
    setStorage('approved', approvedEvents);
  }

  renderAdmin();
  renderEvents();
}

function verify(index) {
  const registrations = getStorage('regs', []);
  if (registrations[index]) {
    registrations[index].status = 'Confirmed';
    setStorage('regs', registrations);
    renderAdmin();
  }
}

function attend(index, isChecked) {
  const registrations = getStorage('regs', []);
  if (registrations[index]) {
    registrations[index].attended = Boolean(isChecked);
    setStorage('regs', registrations);
  }
}

// Admin: Import JSON Request
const importBtn = qs('#impBtn');
if (importBtn) {
  importBtn.onclick = () => {
    const importInput = qs('#imp');
    const msgElement = qs('#impMsg');
    if (!importInput) return;

    try {
      const parsedData = JSON.parse(importInput.value.trim());
      if (!parsedData.name || !parsedData.date || !parsedData.deadline || !parsedData.seats) {
        throw new Error('Incomplete event schema');
      }

      const pendingEvents = getStorage('pending', []);
      pendingEvents.push(parsedData);
      setStorage('pending', pendingEvents);

      importInput.value = '';
      if (msgElement) {
        msgElement.textContent = 'Event request successfully imported.';
        msgElement.style.color = 'var(--ok)';
      }
      renderAdmin();
    } catch (error) {
      if (msgElement) {
        msgElement.textContent = 'Invalid event request JSON format.';
        msgElement.style.color = 'var(--bad)';
      }
    }
  };
}

// Admin: Export CSV
const exportCsvBtn = qs('#csv');
if (exportCsvBtn) {
  exportCsvBtn.onclick = () => {
    const registrations = getStorage('regs', []);
    const csvHeaders = [
      'rid',
      'ename',
      'name',
      'reg',
      'roll',
      'email',
      'phone',
      'branch',
      'year',
      'team',
      'size',
      'tx',
      'status',
      'attended',
      'at'
    ];

    const escapeCsvField = (fieldValue) => {
      const safeString = String(fieldValue == null ? '' : fieldValue);
      return `"${safeString.replace(/"/g, '""')}"`;
    };

    const csvContent = [
      csvHeaders.join(','),
      ...registrations.map((row) => csvHeaders.map((fieldKey) => escapeCsvField(row[fieldKey])).join(','))
    ].join('\r\n');

    downloadFile('campus-event-registrations.csv', csvContent, 'text/csv');
  };
}

// Admin: Export Feedback CSV
const exportFbCsvBtn = qs('#exportFbCsv');
if (exportFbCsvBtn) {
  exportFbCsvBtn.onclick = () => {
    const feedbackList = getAllFeedback();
    const csvHeaders = ['id', 'eid', 'ename', 'name', 'rating', 'suggestion', 'at'];
    const escapeCsv = (val) => `"${String(val == null ? '' : val).replace(/"/g, '""')}"`;
    const csvContent = [
      csvHeaders.join(','),
      ...feedbackList.map((row) => csvHeaders.map((k) => escapeCsv(row[k])).join(','))
    ].join('\r\n');
    downloadFile('campus-event-feedback.csv', csvContent, 'text/csv');
  };
}

// --- 16. Window Global Exports (ensures inline event handlers work seamlessly) ---
window.doLogout = doLogout;
window.loginFromHeader = loginFromHeader;
window.openLogin = openLogin;
window.doLogin = doLogin;
window.show = show;
window.setType = setType;
window.scrollRow = scrollRow;
window.syncArrows = syncArrows;
window.showEvent = showEvent;
window.goBack = goBack;
window.addCal = addCal;
window.copyLink = copyLink;
window.openReg = openReg;
window.showTicket = showTicket;
window.decide = decide;
window.verify = verify;
window.attend = attend;
window.toggleTheme = toggleTheme;
window.openFeedbackModal = openFeedbackModal;
window.setModalRating = setModalRating;
window.submitFeedback = submitFeedback;
window.deleteFeedback = deleteFeedback;
window.renderAdminFeedback = renderAdminFeedback;

// --- 17. Application Initialization ---
let appInitialized = false;
function initApp() {
  if (appInitialized) return;
  appInitialized = true;
  applyAuth();
  show('events');
  const evListEl = document.getElementById('evList');
  if (evListEl && window.ResizeObserver) {
    new ResizeObserver(syncArrows).observe(evListEl);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


// --- 18. Cinematic Header: add .scrolled class on scroll ---
(function () {
  const hdr = document.getElementById('site-header');
  if (!hdr) return;
  const toggle = () => hdr.classList.toggle('scrolled', window.scrollY > 10);
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
})();


// --- 19. Theme Toggle (Dark / Light mode) ---
let _themeToggling = false;
function toggleTheme() {
  if (_themeToggling) return;
  _themeToggling = true;
  setTimeout(() => { _themeToggling = false; }, 200);

  const shouldBeLight = !document.body.classList.contains('light-mode');
  if (shouldBeLight) {
    document.body.classList.add('light-mode');
    document.documentElement.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
    document.documentElement.classList.remove('light-mode');
  }

  try {
    localStorage.setItem('lpu-theme', shouldBeLight ? 'light' : 'dark');
  } catch (e) {
    // Storage access might be restricted
  }

  const btn = document.getElementById('themeToggle');
  if (btn) {
    const label = shouldBeLight ? 'Switch to dark mode' : 'Switch to light mode';
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }
}
window.toggleTheme = toggleTheme;

(function initThemeToggle() {
  // Restore saved preference immediately
  try {
    const saved = localStorage.getItem('lpu-theme');
    if (saved === 'light') {
      document.body.classList.add('light-mode');
      document.documentElement.classList.add('light-mode');
    }
  } catch (e) {
    // Storage access might be restricted
  }

  function attachToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    const isLight = document.body.classList.contains('light-mode');
    const label = isLight ? 'Switch to dark mode' : 'Switch to light mode';
    btn.setAttribute('aria-label', label);
    btn.title = label;

    // Use idempotent property assignment so handler cannot be attached twice
    btn.onclick = toggleTheme;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachToggle);
  } else {
    attachToggle();
  }
})();

// Mobile Hamburger Menu Toggle
(function initMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  if (!menuBtn || !nav) return;

  menuBtn.onclick = function (e) {
    e.stopPropagation();
    const isOpen = nav.classList.toggle('mobile-open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  };

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
      nav.classList.remove('mobile-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
})();
