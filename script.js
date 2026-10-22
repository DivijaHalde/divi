/**
 * A. P. Shah Institute of Technology, Thane
 * Faculty Ranking & Evaluation System - Academic Year 2026-27
 * Frontend Application Engine (Vanilla JS, Full-Stack Connected with Local Resilience)
 */

(function () {
  'use strict';

  // Constants
  const LOGO = 'logo.png';
  const ACADEMIC_YEAR = '2026-27';
  const COLLEGE_NAME = 'A. P. Shah Institute of Technology';
  const COLLEGE_SUB = 'Approved by AICTE, New Delhi & Govt. of Maharashtra · Affiliated to University of Mumbai';
  const COLLEGE_ADDR = 'Survey No. 12, 13, Opp. Hypercity Mall, Kasarvadavali, Ghodbunder Road, Thane (W) 400615, Maharashtra';
  const COLLEGE_CONTACT = 'Mob: 7738305400 · principal@apsit.org.in · www.apsit.edu.in';

  const YEARS = {
    2: ['Second Year', [3, 4]],
    3: ['Third Year', [5, 6]],
    4: ['Fourth Year', [7, 8]]
  };

  const STREAMS = ['AIML', 'IT', 'COMPS'];
  const CLASSES = ['A', 'B', 'C'];
  const PARAMETERS = [
    'Teaching Quality',
    'Student Feedback',
    'Subject Knowledge',
    'Availability',
    'Punctuality & Discipline'
  ];

  const PARAM_DESCS = [
    'Clarity, structure and delivery of lectures',
    'Responsiveness and openness to student input',
    'Depth, technical accuracy and practical relevance of content',
    'Accessibility for doubt-solving, mentoring and guidance',
    'Adherence to lecture schedule, punctuality and professional class conduct'
  ];

  const PARAM_ICONS = ['👩‍🏫', '💬', '📚', '🕒', '✅'];

  const DEFAULT_FACULTY = {
    AIML: ['Dr. Meera Nair', 'Prof. Rohan Shah', 'Prof. Anita Desai', 'Dr. Karan Mehta'],
    IT: ['Dr. Sunil Patil', 'Prof. Neha Kulkarni', 'Prof. Vikram Joshi', 'Dr. Pooja Iyer'],
    COMPS: ['Dr. Arjun Rao', 'Prof. Sneha Pawar', 'Prof. Imran Khan', 'Dr. Kavita Menon']
  };

  const DEFAULT_SUBJECTS = {
    AIML: [
      'Discrete Maths', 'Python for AI', 'Data Structures', 'Probability',
      'Machine Learning', 'Linear Algebra', 'Database Systems', 'Computer Networks'
    ],
    IT: [
      'Discrete Maths', 'Web Technologies', 'Data Structures', 'Digital Logic',
      'Operating Systems', 'Java Programming', 'Database Systems', 'Computer Networks'
    ],
    COMPS: [
      'Discrete Maths', 'Computer Graphics', 'Data Structures', 'Microprocessors',
      'Algorithms', 'Software Engg', 'Database Systems', 'Computer Networks'
    ]
  };

  // State
  let STATE = {
    role: null,          // 'admin' | 'faculty' | 'student' | null
    user: null,          // { username, name, role } | null
    token: null,         // JWT token
    page: 'home',        // 'home' | 'dashboard' | 'login'
    loginRole: 'admin',  // 'admin' | 'faculty' | 'student'
    year: 2,             // Selected Academic Year tab (2 = Second Year, 3 = Third, 4 = Fourth)
    adminFilters: { st: '', sem: '', cl: '' },
    studentFilters: { st: 'AIML', sem: '3', cl: 'A' },
    studentRatings: {},  // temporary ratings form state: { [key]: { scores: [0,0,0,0,0], comment: '' } }
    backendOnline: false,
    serverSummary: null
  };

  // Storage Helper
  const storage = {
    get: (k) => {
      try {
        const item = localStorage.getItem(k);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        return null;
      }
    },
    set: (k, v) => {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {}
    },
    del: (k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    }
  };

  // Load saved session if available
  const savedSession = storage.get('apsit_session');
  if (savedSession && savedSession.token && savedSession.user) {
    STATE.token = savedSession.token;
    STATE.user = savedSession.user;
    STATE.role = savedSession.user.role;
  }

  // Local Seed Generator (guarantees standalone operation if backend is offline)
  function createSeedDatabase() {
    let seedRand = 42;
    const pseudoRand = () => {
      seedRand = (seedRand * 9301 + 49297) % 233280;
      return seedRand / 233280;
    };

    const biasProfiles = [4.82, 3.70, 2.15, 3.45];
    const assignments = [];
    const ratings = [];
    const appeared = [];
    let nextId = 1;

    const commentsPool = {
      high: [
        'Outstanding lecture delivery with real-world industry case studies.',
        'Explains complex algorithms with crystal clarity. Highly motivating mentor.',
        'Always punctual, well-prepared, and very supportive during practical labs.',
        'Exceptional subject depth and highly approachable for doubts after class.'
      ],
      mid: [
        'Good coverage of syllabus topics and clear explanations on whiteboard.',
        'Practical sessions are insightful, additional tutorial problems would help.',
        'Paced well, maintains good classroom discipline.',
        'Punctual and approachable for doubt clarification.'
      ],
      low: [
        'Needs better pacing in lectures; moves too fast through proofs.',
        'Would appreciate more interaction and doubt-solving during tutorials.',
        'Lab assistance and practical explanations need significant improvement.',
        'Punctuality and accessibility after lecture hours should be enhanced.'
      ]
    };

    STREAMS.forEach((stream) => {
      [3, 4].forEach((sem) => {
        CLASSES.forEach((cls, cIdx) => {
          const classMappings = [0, 1, 2, 3].map((i) => ({
            id: nextId++,
            st: stream,
            sem,
            cl: cls,
            f: DEFAULT_FACULTY[stream][(i + cIdx) % 4],
            s: DEFAULT_SUBJECTS[stream][(sem - 3) * 4 + i]
          }));
          assignments.push(...classMappings);

          const studentCount = 8 + Math.floor(pseudoRand() * 5); // 8-12 per class
          for (let k = 0; k < studentCount; k++) {
            appeared.push({ st: stream, sem, cl: cls });

            classMappings.forEach((m) => {
              const facIndex = DEFAULT_FACULTY[stream].indexOf(m.f);
              const baseBias = biasProfiles[facIndex];
              const scores = PARAMETERS.map(() => {
                const delta = (pseudoRand() - 0.5) * 1.0;
                return Math.max(1, Math.min(5, Math.round(baseBias + delta)));
              });

              let comment = '';
              if (pseudoRand() < 0.35) {
                const pool = facIndex === 0 ? commentsPool.high : (facIndex === 2 ? commentsPool.low : commentsPool.mid);
                comment = pool[Math.floor(pseudoRand() * pool.length)];
              }

              ratings.push({
                st: stream,
                sem,
                cl: cls,
                f: m.f,
                sub: m.s,
                sc: scores,
                c: comment,
                createdAt: new Date(Date.now() - Math.floor(pseudoRand() * 20 * 86400000)).toISOString()
              });
            });
          }
        });
      });
    });

    return { assignments, ratings, appeared, nextId };
  }

  // Active in-memory/localStorage DB
  let localDB = storage.get('apsit_frs_db') || createSeedDatabase();
  function saveLocalDB() {
    storage.set('apsit_frs_db', localDB);
  }

  // Submitted subject keys for the current browser (avoids duplicates)
  function getDoneKeys() {
    return storage.get('apsit_frs_done') || [];
  }
  function markKeyDone(k) {
    const list = getDoneKeys();
    if (!list.includes(k)) {
      list.push(k);
      storage.set('apsit_frs_done', list);
    }
  }

  // Utilities
  const makeKey = (m) => [m.st, m.sem, m.cl, m.f, m.s || m.sub].join('|');
  const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
  const fx = (n) => (typeof n === 'number' && !isNaN(n) ? n.toFixed(2) : '0.00');
  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const stars = (score) => {
    const rounded = Math.round(score);
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
  };

  // Safe encoding for onclick strings
  window.__apsitDecode = (str) => decodeURIComponent(str);

  // Status mapping
  function getPerformanceStatus(overall) {
    if (overall < 2.5) {
      return { label: 'Warning', badgeClass: 'badge-warning', type: 'warning' };
    }
    if (overall > 4.5) {
      return { label: 'Appreciation', badgeClass: 'badge-success', type: 'appreciation' };
    }
    return { label: 'Satisfactory', badgeClass: 'badge-neutral', type: 'satisfactory' };
  }

  // Get active ratings matching assigned faculty
  function getActiveRatings() {
    const validKeys = new Set(localDB.assignments.map(makeKey));
    return localDB.ratings.filter((r) => validKeys.has(makeKey(r)));
  }

  // Faculty distinct names
  function getFacultyNames() {
    return [...new Set(localDB.assignments.map((m) => m.f))].sort();
  }

  // Aggregate ratings for Admin and Faculty views
  function aggregateRatings(ratingsList) {
    const map = {};
    ratingsList.forEach((r) => {
      if (!map[r.f]) {
        map[r.f] = {
          name: r.f,
          count: 0,
          paramTotals: [0, 0, 0, 0, 0],
          classes: new Set(),
          subjects: new Set(),
          comments: []
        };
      }
      const entry = map[r.f];
      entry.count++;
      r.sc.forEach((v, idx) => {
        entry.paramTotals[idx] += v;
      });
      entry.classes.add(`${r.st} Sem ${r.sem} (${r.cl})`);
      entry.subjects.add(r.sub);
      if (r.c) {
        entry.comments.push({ text: r.c, subject: r.sub, classInfo: `${r.st} ${r.cl}` });
      }
    });

    return Object.values(map)
      .map((entry) => {
        const paramAvgs = entry.paramTotals.map((tot) => tot / entry.count);
        const overall = avg(paramAvgs);
        return {
          name: entry.name,
          count: entry.count,
          paramAvgs,
          overall,
          classes: [...entry.classes],
          subjects: [...entry.subjects],
          comments: entry.comments
        };
      })
      .sort((a, b) => b.overall - a.overall);
  }

  // ==========================================
  // API CLIENT (Connects to Node.js backend with local fallback)
  // ==========================================
  async function apiCall(endpoint, method = 'GET', body = null) {
    if (!STATE.token && !['/api/health', '/api/auth/login', '/api/stats/summary', '/api/faculty/assignments', '/api/faculty/names'].includes(endpoint)) {
      return localApiHandler(endpoint, method, body);
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (STATE.token) {
        headers['Authorization'] = `Bearer ${STATE.token}`;
      }
      const res = await fetch(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      STATE.backendOnline = true;
      return await res.json();
    } catch (err) {
      if (err.message && err.message.includes('401')) {
        // Token expired
        signOut();
        throw err;
      }
      return localApiHandler(endpoint, method, body);
    }
  }

  // Local simulated handler if backend is offline or file:// protocol
  function localApiHandler(endpoint, method, body) {
    if (endpoint === '/api/auth/login') {
      const { role, username, password } = body;
      const lower = String(username).trim().toLowerCase();
      let ok = false;
      let displayName = username;

      if (role === 'admin') {
        ok = (lower === 'hod' && password === 'hod123') || (lower === 'cohod' && password === 'cohod123');
        displayName = lower === 'hod' ? 'HOD Computer Engineering' : 'Co-HOD Computer Engineering';
      } else if (role === 'faculty') {
        const facList = getFacultyNames();
        const found = facList.find((f) => f.toLowerCase() === lower);
        ok = Boolean(found && password === 'faculty123');
        if (found) displayName = found;
      } else if (role === 'student') {
        ok = Boolean(username && (password === '123456' || password === 'student123'));
        displayName = `Student ${username}`;
      }

      if (!ok) {
        return Promise.reject(new Error('Incorrect username or password.'));
      }

      const dummyToken = 'local_jwt_' + btoa(JSON.stringify({ username, role, name: displayName, time: Date.now() }));
      return Promise.resolve({
        token: dummyToken,
        user: { username, role, name: displayName }
      });
    }

    if (endpoint === '/api/stats/summary') {
      const activeFaculty = getFacultyNames();
      const activeRatings = getActiveRatings();
      return Promise.resolve({
        academicYear: ACADEMIC_YEAR,
        studentsAppeared: localDB.appeared.length,
        ratingsReceived: activeRatings.length,
        facultyAssigned: activeFaculty.length
      });
    }

    if (endpoint === '/api/faculty/assignments') {
      return Promise.resolve({ assignments: localDB.assignments });
    }

    return Promise.resolve({});
  }

  // Sync data from backend server when online
  async function syncBackendData() {
    try {
      const healthRes = await fetch('/api/health').then((r) => r.ok ? r.json() : null).catch(() => null);
      if (!healthRes) return;
      STATE.backendOnline = true;

      // Sync assignments
      const assignRes = await fetch('/api/faculty/assignments').then((r) => r.ok ? r.json() : null).catch(() => null);
      if (assignRes && assignRes.assignments && assignRes.assignments.length) {
        localDB.assignments = assignRes.assignments;
      }

      // Sync ratings based on role
      if (STATE.token) {
        const ratingsRes = await fetch('/api/ratings', {
          headers: { 'Authorization': `Bearer ${STATE.token}` }
        }).then((r) => r.ok ? r.json() : null).catch(() => null);

        if (ratingsRes) {
          if (STATE.role === 'admin' && ratingsRes.ratings) {
            localDB.ratings = ratingsRes.ratings;
            if (ratingsRes.appeared) localDB.appeared = ratingsRes.appeared;
          } else if (STATE.role === 'faculty' && ratingsRes.ratings) {
            const facName = (STATE.user.name || STATE.user.username).toLowerCase();
            localDB.ratings = localDB.ratings.filter((r) => r.f.toLowerCase() !== facName).concat(ratingsRes.ratings);
          }
        }
      }

      // Sync summary stats
      const summaryRes = await fetch('/api/stats/summary').then((r) => r.ok ? r.json() : null).catch(() => null);
      if (summaryRes) {
        STATE.serverSummary = summaryRes;
      }

      saveLocalDB();
      render();
    } catch (e) {}
  }

  // ==========================================
  // THEME MANAGEMENT (Light / Dark)
  // ==========================================
  function initTheme() {
    const saved = localStorage.getItem('apsit_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('apsit_theme', next);
    renderHeaderNav();
  }

  // ==========================================
  // RENDERING ENGINE
  // ==========================================
  const appEl = document.getElementById('app');
  const whoEl = document.getElementById('who');

  function renderHeaderNav() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const themeBtn = `<button class="theme-toggle-btn" title="Toggle Light/Dark Theme" onclick="window.apsitToggleTheme()">${isDark ? '☀️' : '🌙'}</button>`;

    let navHtml = `
      <button class="btn-header" onclick="window.apsitNavigate('home')">🏠 Home</button>
      ${themeBtn}
    `;

    if (STATE.user) {
      let roleIcon = '🛡️';
      if (STATE.role === 'faculty') roleIcon = '👩‍🏫';
      if (STATE.role === 'student') roleIcon = '🧑‍🎓';

      navHtml = `
        <button class="btn-header" onclick="window.apsitNavigate('home')">🏠 Home</button>
        <button class="btn-header" onclick="window.apsitNavigate('dashboard')">📋 Dashboard</button>
        <span class="user-tag">${roleIcon} ${esc(STATE.user.name || STATE.user.username)}</span>
        <button class="btn-danger btn-sm" onclick="window.apsitSignOut()">Sign out</button>
        ${themeBtn}
      `;
    } else {
      navHtml += `<button class="btn-danger btn-sm" onclick="window.apsitNavigate('login')">Log in</button>`;
    }

    whoEl.innerHTML = navHtml;
  }

  function render() {
    renderHeaderNav();

    if (STATE.page === 'home') {
      renderHomePage();
      return;
    }

    if (STATE.page === 'login' || !STATE.role) {
      renderLoginPage();
      return;
    }

    // Role-specific Dashboards
    if (STATE.role === 'admin') {
      renderAdminDashboard();
    } else if (STATE.role === 'faculty') {
      renderFacultyDashboard();
    } else if (STATE.role === 'student') {
      renderStudentDashboard();
    }
  }

  // ==========================================
  // 1. HOME PAGE (Public Overview)
  // ==========================================
  function renderHomePage() {
    const activeFaculty = getFacultyNames();
    const activeRatings = getActiveRatings();
    const totalAppeared = STATE.serverSummary ? STATE.serverSummary.studentsAppeared : localDB.appeared.length;
    const totalRatings = STATE.serverSummary ? STATE.serverSummary.ratingsReceived : activeRatings.length;
    const totalFacultyCount = STATE.serverSummary ? STATE.serverSummary.facultyAssigned : activeFaculty.length;

    appEl.innerHTML = `
      <div class="login-grid">
        <div class="hero-box">
          <img class="hero-logo" src="${LOGO}" alt="APSIT Logo">
          <h2>Welcome to the Faculty Evaluation Portal</h2>
          <p>
            A. P. Shah Institute of Technology's transparent, 100% anonymous evaluation system.
            Empowering students to provide constructive feedback while recognizing teaching excellence.
          </p>
          <div>
            <button class="btn-danger" onclick="window.apsitNavigate('${STATE.user ? 'dashboard' : 'login'}')">
              ${STATE.user ? 'Open Dashboard' : 'Log in to Portal'}
            </button>
          </div>
        </div>

        <div class="card" style="margin-bottom:0; display:flex; flex-direction:column; justify-content:center;">
          <h3>📊 Live Academic Year Stats</h3>
          <p class="mu" style="color:var(--mu); font-size:13.5px;">
            Official evaluations for Academic Year <strong>${ACADEMIC_YEAR}</strong>. Second Year (Sem 3 &amp; 4) is fully operational.
          </p>
          <div class="stats-grid" style="margin-bottom:0; grid-template-columns:1fr 1fr;">
            <div class="stat-card">
              <div class="stat-icon">🧑‍🎓</div>
              <div class="stat-content">
                <b>${totalAppeared}</b>
                <span>Students Appeared</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-content">
                <b>${totalRatings}</b>
                <span>Ratings Received</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">👩‍🏫</div>
              <div class="stat-content">
                <b>${totalFacultyCount}</b>
                <span>Faculty Assigned</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-content">
                <b>${ACADEMIC_YEAR}</b>
                <span>Academic Year</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Evaluation Parameters -->
      <div class="card" style="margin-top:20px;">
        <h3>📋 The 5 Core Evaluation Parameters</h3>
        <p style="color:var(--mu);">Each faculty member is evaluated on a 1 to 5 star scale across 5 balanced dimensions:</p>
        <div class="criteria-grid">
          ${PARAMETERS.map((p, idx) => `
            <div class="criteria-item">
              <b>${PARAM_ICONS[idx]} ${p}</b>
              <span>${PARAM_DESCS[idx]}</span>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:14px; padding-top:14px; border-top:1px solid var(--bd);">
          <span class="badge badge-warning">Below 2.5: Formal Warning Letter</span>
          <span class="badge badge-neutral" style="margin:0 6px;">2.5 to 4.5: Satisfactory</span>
          <span class="badge badge-success">Above 4.5: Letter of Appreciation</span>
        </div>
        <p style="color:var(--mu); font-size:13px; margin-top:10px;">
          📌 <em>Note: Each automated letter is permanently attached to that faculty member's profile. Both the HOD and the faculty member can view and print/save it as a PDF at any time.</em>
        </p>
      </div>

      <!-- Academic Structure -->
      <div class="card">
        <h3>🏫 Academic Structure (AY ${ACADEMIC_YEAR})</h3>
        <div class="criteria-grid">
          <div class="criteria-item">
            <b>Odd Semesters</b>
            <span>Sem 1, Sem 3, Sem 5, Sem 7</span>
          </div>
          <div class="criteria-item">
            <b>Even Semesters</b>
            <span>Sem 2, Sem 4, Sem 6, Sem 8</span>
          </div>
          <div class="criteria-item">
            <b>Streams Available</b>
            <span>${STREAMS.join(', ')}</span>
          </div>
          <div class="criteria-item">
            <b>Class Divisions</b>
            <span>Division A, Division B, Division C</span>
          </div>
          <div class="criteria-item">
            <b>Operational Status</b>
            <span>Second Year (Sem 3 &amp; 4): <strong style="color:var(--success);">Active</strong><br>Third &amp; Fourth: Visible (Upcoming)</span>
          </div>
        </div>
      </div>

      <!-- Who Sees What (Access Control) -->
      <div class="card">
        <h3>🔐 Who Sees What (Role-Based Privacy)</h3>
        <div class="criteria-grid">
          <div class="criteria-item">
            <b>🛡️ Admin (HOD / Co-HOD)</b>
            <span>Departmental rankings, per-parameter analytics, letters issued, and faculty-subject allocation.</span>
          </div>
          <div class="criteria-item">
            <b>👩‍🏫 Faculty Member</b>
            <span>Strictly their own performance scores, parameter breakdown, classes taught, and anonymous student comments. Never sees peers' data.</span>
          </div>
          <div class="criteria-item">
            <b>🧑‍🎓 Student</b>
            <span>Rates each assigned teacher for their enrolled stream, semester &amp; class. 100% anonymous; zero identity metadata saved.</span>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // 2. LOGIN PAGE (Role Tabs, No Demo Credentials on UI)
  // ==========================================
  function renderLoginPage() {
    const facultyNames = getFacultyNames();

    appEl.innerHTML = `
      <div class="login-grid">
        <div class="hero-box">
          <img class="hero-logo" src="${LOGO}" alt="APSIT Logo">
          <h2>Rate teaching. Recognise excellence.</h2>
          <p>
            Welcome to the official Faculty Ranking &amp; Evaluation Portal of A. P. Shah Institute of Technology.
            Sign in with your designated role to proceed.
          </p>
        </div>

        <div class="card">
          <h2>Portal Sign In</h2>
          <p style="color:var(--mu); font-size:13.5px;">Select your role to access your dashboard:</p>
          
          <div class="role-switcher">
            <button class="role-btn ${STATE.loginRole === 'admin' ? 'active' : ''}" onclick="window.apsitSetLoginRole('admin')">
              <span class="role-icon">🛡️</span>
              Admin (HOD)
            </button>
            <button class="role-btn ${STATE.loginRole === 'faculty' ? 'active' : ''}" onclick="window.apsitSetLoginRole('faculty')">
              <span class="role-icon">👩‍🏫</span>
              Faculty
            </button>
            <button class="role-btn ${STATE.loginRole === 'student' ? 'active' : ''}" onclick="window.apsitSetLoginRole('student')">
              <span class="role-icon">🧑‍🎓</span>
              Student
            </button>
          </div>

          <form id="login-form" onsubmit="window.apsitHandleLogin(event)">
            ${STATE.loginRole === 'faculty' ? `
              <div style="margin-bottom:14px;">
                <label for="login-username">Faculty Name</label>
                <select id="login-username" required>
                  <option value="">-- Choose your name from list --</option>
                  ${facultyNames.map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join('')}
                </select>
              </div>
            ` : `
              <div style="margin-bottom:14px;">
                <label for="login-username">Username / Roll No.</label>
                <input id="login-username" type="text" autocomplete="username" placeholder="${STATE.loginRole === 'admin' ? 'Enter admin username' : 'Enter student Roll/PRN'}" required>
              </div>
            `}

            <div style="margin-bottom:18px;">
              <label for="login-password">Password</label>
              <input id="login-password" type="password" autocomplete="current-password" placeholder="Enter password" required>
            </div>

            <button type="submit" class="btn-danger" style="width:100%; padding:11px; font-size:15px;">
              Sign In
            </button>

            <div id="login-error" style="color:var(--danger); font-size:13.5px; margin-top:12px; font-weight:600; text-align:center;"></div>
          </form>
        </div>
      </div>
    `;
  }

  // ==========================================
  // ACADEMIC YEAR TABS HELPER
  // ==========================================
  function renderYearTabs() {
    return `
      <div class="tabs">
        ${[2, 3, 4].map((y) => {
          const isOperational = y === 2;
          const isSelected = STATE.year === y;
          return `
            <button class="tab ${isSelected ? 'active' : ''} ${!isOperational ? 'locked' : ''}" onclick="window.apsitSelectYear(${y})">
              ${YEARS[y][0]} ${!isOperational ? '🔒 (Not operational yet)' : '✅ (Operational)'}
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderLockedYearCard() {
    const yr = YEARS[STATE.year];
    return `
      <div class="card">
        <h3>🔒 ${yr[0]} (Sem ${yr[1].join(' &amp; Sem ')})</h3>
        <p style="color:var(--mu); font-size:14.5px; margin:10px 0;">
          This academic section is visible in the curriculum structure but is <strong>not operational yet</strong> for AY 2026-27.
          Official student evaluation forms and faculty ratings for Semesters ${yr[1].join(' and ')} will be activated in an upcoming evaluation phase.
        </p>
        <button class="btn-outline btn-sm" onclick="window.apsitSelectYear(2)">
          Switch to Second Year (Operational)
        </button>
      </div>
    `;
  }

  // ==========================================
  // 3. STUDENT DASHBOARD
  // ==========================================
  function renderStudentDashboard() {
    let html = renderYearTabs();

    if (STATE.year !== 2) {
      appEl.innerHTML = html + renderLockedYearCard();
      return;
    }

    const filters = STATE.studentFilters;
    const semOptions = [1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
      const oddEven = s % 2 === 1 ? 'Odd' : 'Even';
      const op = (s === 3 || s === 4) ? '' : ' - (not operational)';
      return `<option value="${s}" ${String(filters.sem) === String(s) ? 'selected' : ''}>Sem ${s} (${oddEven})${op}</option>`;
    }).join('');

    html += `
      <div class="card">
        <h3>📝 Student Faculty Evaluation Portal</h3>
        <p style="color:var(--mu); font-size:14px;">
          Select your Stream, Semester, and Class division below to evaluate your assigned teachers.
          <strong>100% Anonymous:</strong> No student name, roll number, or metadata is recorded with ratings.
        </p>

        <div class="form-row">
          <div>
            <label>Stream</label>
            <select onchange="window.apsitSetStudentFilter('st', this.value)">
              ${STREAMS.map((st) => `<option value="${st}" ${filters.st === st ? 'selected' : ''}>${st}</option>`).join('')}
            </select>
          </div>
          <div>
            <label>Semester</label>
            <select onchange="window.apsitSetStudentFilter('sem', this.value)">
              ${semOptions}
            </select>
          </div>
          <div>
            <label>Class Division</label>
            <select onchange="window.apsitSetStudentFilter('cl', this.value)">
              ${CLASSES.map((cl) => `<option value="${cl}" ${filters.cl === cl ? 'selected' : ''}>Class ${cl}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
    `;

    // Operational check for semester
    const currentSem = Number(filters.sem);
    if (currentSem !== 3 && currentSem !== 4) {
      html += `
        <div class="card">
          <h3>🔒 Semester ${currentSem} is not operational yet</h3>
          <p style="color:var(--mu);">
            Evaluations are currently active for Second Year (Semesters 3 &amp; 4). Please select Semester 3 or Semester 4 from the dropdown.
          </p>
        </div>
      `;
      appEl.innerHTML = html;
      return;
    }

    // Filter faculty assignments for this class
    const matchingAssignments = localDB.assignments.filter(
      (m) => m.st === filters.st && Number(m.sem) === currentSem && m.cl === filters.cl
    );

    if (matchingAssignments.length === 0) {
      html += `
        <div class="card">
          <p style="color:var(--mu);">No faculty mapped for ${esc(filters.st)}, Sem ${currentSem}, Class ${esc(filters.cl)}.</p>
        </div>
      `;
      appEl.innerHTML = html;
      return;
    }

    const doneList = getDoneKeys();

    html += `
      <div style="margin-bottom:14px;">
        <h3 style="font-size:18px;">Assigned Subjects for ${esc(filters.st)} · Sem ${currentSem} · Class ${esc(filters.cl)}</h3>
      </div>
    `;

    matchingAssignments.forEach((m, idx) => {
      const k = makeKey(m);
      const isDone = doneList.includes(k);
      const formState = STATE.studentRatings[k] || { scores: [0, 0, 0, 0, 0], comment: '' };

      html += `
        <div class="card" id="card-${idx}" data-key="${esc(k)}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
            <div>
              <h3 style="margin-bottom:4px; font-size:19px;">📖 ${esc(m.s)}</h3>
              <span style="font-size:15px; color:var(--tx-heading); font-weight:600;">Faculty: ${esc(m.f)}</span>
            </div>
            ${isDone ? `<span class="badge badge-success">✓ Evaluation Submitted · Thank you</span>` : `<span class="badge badge-neutral">Pending Rating</span>`}
          </div>

          ${isDone ? `
            <p style="color:var(--mu); font-size:13.5px; margin:0;">
              Your evaluation for this teacher has been anonymously recorded. Thank you for helping improve academic standards at APSIT.
            </p>
          ` : `
            <div style="margin-bottom:14px;">
              <p style="color:var(--mu); font-size:13px; margin-bottom:8px;">
                Rate all 5 parameters (1 to 5 stars are required for each parameter):
              </p>
              ${PARAMETERS.map((p, pIdx) => {
                const currentScore = formState.scores[pIdx];
                return `
                  <div class="star-rating-row">
                    <span class="param-name">${PARAM_ICONS[pIdx]} ${p}</span>
                    <div class="stars-interactive" data-pidx="${pIdx}">
                      ${[1, 2, 3, 4, 5].map((num) => `
                        <button type="button" class="${num <= currentScore ? 'active' : ''}" 
                                onclick="window.apsitSetRatingStar('${esc(k)}', ${pIdx}, ${num})">
                          ★
                        </button>
                      `).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="margin-top:12px;">
              <label for="comment-${idx}">Optional Constructive Feedback (Max 300 characters)</label>
              <textarea id="comment-${idx}" maxlength="300" placeholder="Share specific, constructive feedback about lecture delivery, clarity, or doubt solving..." 
                        oninput="window.apsitUpdateComment('${esc(k)}', this.value, ${idx})">${esc(formState.comment)}</textarea>
              <div class="char-counter" id="counter-${idx}">${formState.comment.length} / 300 characters</div>
            </div>

            <div style="margin-top:14px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
              <button class="btn-primary" onclick="window.apsitSubmitRating('${esc(k)}', ${idx})">
                Submit Anonymous Rating
              </button>
              <span id="err-${idx}" style="color:var(--danger); font-size:13.5px; font-weight:600;"></span>
            </div>
          `}
        </div>
      `;
    });

    appEl.innerHTML = html;
  }

  // ==========================================
  // 4. ADMIN DASHBOARD (HOD / Co-HOD)
  // ==========================================
  function renderAdminDashboard() {
    let html = renderYearTabs();

    if (STATE.year !== 2) {
      appEl.innerHTML = html + renderLockedYearCard();
      return;
    }

    const F = STATE.adminFilters;
    const filterSem = F.sem ? Number(F.sem) : null;

    // Filter condition
    const matchFilter = (item) => {
      if (F.st && item.st !== F.st) return false;
      if (filterSem && Number(item.sem) !== filterSem) return false;
      if (F.cl && item.cl !== F.cl) return false;
      return true;
    };

    const activeRatings = getActiveRatings().filter(matchFilter);
    const appearedList = localDB.appeared.filter(matchFilter);
    const assignedList = localDB.assignments.filter(matchFilter);
    const aggregated = aggregateRatings(activeRatings);

    // Calculate warnings & appreciations
    const warningsCount = aggregated.filter((o) => o.overall < 2.5).length;
    const appreciationsCount = aggregated.filter((o) => o.overall > 4.5).length;
    const avgRatedPerTeacher = aggregated.length ? (activeRatings.length / aggregated.length).toFixed(1) : '0';

    html += `
      <!-- Department Filters -->
      <div class="card">
        <h3>🔍 Evaluation Filters &amp; Academic Scope</h3>
        <div class="form-row">
          <div>
            <label>Stream</label>
            <select onchange="window.apsitSetAdminFilter('st', this.value)">
              <option value="">All Streams</option>
              ${STREAMS.map((st) => `<option value="${st}" ${F.st === st ? 'selected' : ''}>${st}</option>`).join('')}
            </select>
          </div>
          <div>
            <label>Semester</label>
            <select onchange="window.apsitSetAdminFilter('sem', this.value)">
              <option value="">All Operational Semesters</option>
              ${[1, 2, 3, 4, 5, 6, 7, 8].map((s) => `
                <option value="${s}" ${String(F.sem) === String(s) ? 'selected' : ''}>
                  Sem ${s} (${s % 2 === 1 ? 'Odd' : 'Even'})${s === 3 || s === 4 ? '' : ' - (not operational)'}
                </option>
              `).join('')}
            </select>
          </div>
          <div>
            <label>Class Division</label>
            <select onchange="window.apsitSetAdminFilter('cl', this.value)">
              <option value="">All Divisions</option>
              ${CLASSES.map((cl) => `<option value="${cl}" ${F.cl === cl ? 'selected' : ''}>Class ${cl}</option>`).join('')}
            </select>
          </div>
        </div>
        <p style="color:var(--mu); font-size:13px; margin:0;">
          💡 Filter by stream, semester, or class to inspect specific faculty cohorts, or select "All" for department-wide ranking.
        </p>
      </div>

      <!-- Analytics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🧑‍🎓</div>
          <div class="stat-content">
            <b>${appearedList.length}</b>
            <span>Students Appeared</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <b>${activeRatings.length}</b>
            <span>Total Ratings Received</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <b>${avgRatedPerTeacher}</b>
            <span>Avg Ratings per Teacher</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🚦</div>
          <div class="stat-content">
            <b>${warningsCount} / ${appreciationsCount}</b>
            <span>Warnings / Appreciations</span>
          </div>
        </div>
      </div>

      <!-- Evaluation Criteria Card -->
      <div class="card">
        <h3>📋 Evaluation Criteria &amp; Grading Thresholds</h3>
        <p style="color:var(--mu); font-size:13.5px; margin-bottom:12px;">
          Each student rates faculty from 1 to 5 stars on five parameters. The overall score is the average of the five parameter averages.
        </p>
        <div class="criteria-grid">
          ${PARAMETERS.map((p, idx) => `
            <div class="criteria-item">
              <b>${PARAM_ICONS[idx]} ${p}</b>
              <span>${PARAM_DESCS[idx]}</span>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:10px;">
          <span class="badge badge-warning">Score &lt; 2.5: Formal Warning Letter (1 month review)</span>
          <span class="badge badge-neutral" style="margin:0 6px;">Score 2.5 - 4.5: Satisfactory</span>
          <span class="badge badge-success">Score &gt; 4.5: Letter of Appreciation</span>
        </div>
      </div>

      <!-- Faculty Ranking Table -->
      <div class="card ov">
        <h3>🏆 Faculty Ranking &amp; Performance Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th class="rank-cell">Rank</th>
              <th>Faculty &amp; Subjects</th>
              <th>Students Rated</th>
              <th>Teaching Quality</th>
              <th>Student Feedback</th>
              <th>Subject Knowledge</th>
              <th>Availability</th>
              <th>Punctuality</th>
              <th>Overall Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${aggregated.length === 0 ? `
              <tr>
                <td colspan="11" style="text-align:center; color:var(--mu); padding:20px;">
                  ${F.sem && ![3, 4].includes(Number(F.sem)) ? `Semester ${F.sem} is not operational yet.` : 'No evaluation submissions found for this filter selection.'}
                </td>
              </tr>
            ` : aggregated.map((fac, idx) => {
              const statusObj = getPerformanceStatus(fac.overall);
              
              // Top 3 Medals (Gold, Silver, Bronze)
              let medalClass = 'rank-badge rank-badge-normal';
              let medalText = `#${idx + 1}`;
              if (idx === 0) {
                medalClass = 'rank-badge rank-badge-gold';
                medalText = '🥇 #1';
              } else if (idx === 1) {
                medalClass = 'rank-badge rank-badge-silver';
                medalText = '🥈 #2';
              } else if (idx === 2) {
                medalClass = 'rank-badge rank-badge-bronze';
                medalText = '🥉 #3';
              }

              const safeName = encodeURIComponent(fac.name);

              return `
                <tr>
                  <td class="rank-cell">
                    <span class="${medalClass}">${medalText}</span>
                  </td>
                  <td>
                    <strong style="font-size:14.5px;">${esc(fac.name)}</strong><br>
                    <span style="color:var(--mu); font-size:12px;">${fac.subjects.map(esc).join(', ')}</span>
                  </td>
                  <td><strong>${fac.count}</strong></td>
                  <td>${fx(fac.paramAvgs[0])}</td>
                  <td>${fx(fac.paramAvgs[1])}</td>
                  <td>${fx(fac.paramAvgs[2])}</td>
                  <td>${fx(fac.paramAvgs[3])}</td>
                  <td>${fx(fac.paramAvgs[4])}</td>
                  <td>
                    <strong>${fx(fac.overall)}</strong> 
                    <span class="star-static">${stars(fac.overall)}</span>
                  </td>
                  <td>
                    <span class="badge ${statusObj.badgeClass}">${statusObj.label}</span>
                  </td>
                  <td>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                      <button class="btn-outline btn-sm" onclick="window.apsitShowHistory('${safeName}')">History</button>
                      ${statusObj.type !== 'satisfactory' ? `
                        <button class="${statusObj.type === 'warning' ? 'btn-danger' : 'btn-primary'} btn-sm" onclick="window.apsitShowLetterModal('${safeName}')">
                          ${statusObj.type === 'warning' ? '⚠️ Warning Letter' : '🏅 Appreciation Letter'}
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Letters Issued Section -->
      ${renderLettersIssuedSection(aggregated)}

      <!-- Manage Faculty Section -->
      <div class="card ov">
        <h3>🛠️ Manage Faculty Assignments</h3>
        <p style="color:var(--mu); font-size:13.5px; margin-bottom:14px;">
          Assign teachers to specific subjects across Stream, Semester, and Class division. Changes instantly reflect on student dashboards.
        </p>

        <div style="background:var(--ac-light); padding:16px; border-radius:10px; margin-bottom:18px; border:1px solid var(--bd);">
          <h4 style="margin-top:0; font-size:15px;">➕ Assign New Faculty &amp; Subject</h4>
          <div class="form-row" style="margin-bottom:10px;">
            <div>
              <label>Stream</label>
              <select id="add-fac-st">
                ${STREAMS.map((st) => `<option value="${st}" ${F.st === st ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
            </div>
            <div>
              <label>Semester</label>
              <select id="add-fac-sem">
                <option value="3" ${String(F.sem) === '3' ? 'selected' : ''}>Sem 3 (Odd - Operational)</option>
                <option value="4" ${String(F.sem) === '4' ? 'selected' : ''}>Sem 4 (Even - Operational)</option>
              </select>
            </div>
            <div>
              <label>Class Division</label>
              <select id="add-fac-cl">
                ${CLASSES.map((cl) => `<option value="${cl}" ${F.cl === cl ? 'selected' : ''}>Class ${cl}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-row" style="align-items:flex-end;">
            <div>
              <label>Faculty Name</label>
              <input id="add-fac-name" type="text" placeholder="e.g. Prof. Priya Sharma">
            </div>
            <div>
              <label>Subject Name</label>
              <input id="add-fac-subject" type="text" placeholder="e.g. Operating Systems">
            </div>
            <div>
              <button class="btn-primary" style="width:100%;" onclick="window.apsitAddFaculty()">
                Assign Faculty
              </button>
            </div>
          </div>
          <span id="add-fac-msg" style="color:var(--danger); font-size:13px; font-weight:600;"></span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Stream</th>
              <th>Sem</th>
              <th>Class</th>
              <th>Faculty Name</th>
              <th>Subject</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${assignedList.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align:center; color:var(--mu); padding:16px;">
                  No faculty assignments found matching the selected filters.
                </td>
              </tr>
            ` : assignedList.map((m) => `
              <tr>
                <td><strong>${esc(m.st)}</strong></td>
                <td>Sem ${m.sem}</td>
                <td>Class ${esc(m.cl)}</td>
                <td><strong>${esc(m.f)}</strong></td>
                <td>${esc(m.s)}</td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="btn-outline btn-sm" onclick="window.apsitEditFacultyModal(${m.id})" title="Edit Semester, Subject, and Faculty">✏️ Edit Sem &amp; Subject</button>
                    <button class="btn-danger btn-sm" onclick="window.apsitDeleteFacultyModal(${m.id})">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    appEl.innerHTML = html;
  }

  // Letters Issued Section for Admin
  function renderLettersIssuedSection(aggregated) {
    const lettersList = aggregated
      .filter((o) => o.overall < 2.5 || o.overall > 4.5)
      .map((o) => ({
        faculty: o.name,
        html: generateLetterHTML(o.name, false)
      }))
      .filter((x) => Boolean(x.html));

    if (lettersList.length === 0) {
      return '';
    }

    return `
      <div class="card">
        <h3>📄 Departmental Letters Issued (Automated Review)</h3>
        <p style="color:var(--mu); font-size:13.5px; margin-bottom:16px;">
          Generated automatically according to official HOD thresholds. Letters are attached to the respective faculty profile and can be printed or saved as PDF.
        </p>
        ${lettersList.map((item) => `
          <div style="margin-bottom:30px;">
            <h4 class="attached-heading">Attached to ${esc(item.faculty)}</h4>
            ${item.html}
          </div>
        `).join('')}
      </div>
    `;
  }

  // ==========================================
  // 5. FACULTY DASHBOARD (Strictly Isolated & Private)
  // ==========================================
  function renderFacultyDashboard() {
    let html = renderYearTabs();

    if (STATE.year !== 2) {
      appEl.innerHTML = html + renderLockedYearCard();
      return;
    }

    const facName = STATE.user.name || STATE.user.username;
    const activeRatings = getActiveRatings().filter((r) => r.f.toLowerCase() === facName.toLowerCase());
    const agg = aggregateRatings(activeRatings)[0];

    if (!agg) {
      html += `
        <div class="card">
          <h2>👋 Welcome, ${esc(facName)}</h2>
          <p style="color:var(--mu);">No student evaluations have been recorded for your assigned classes yet.</p>
        </div>
      `;
      appEl.innerHTML = html;
      return;
    }

    const statusObj = getPerformanceStatus(agg.overall);
    let bandLabel = 'Satisfactory';
    if (agg.overall > 4.5) bandLabel = 'Outstanding';
    else if (agg.overall >= 3.5) bandLabel = 'Strong';
    else if (agg.overall < 2.5) bandLabel = 'Needs Improvement';

    const letterHtml = generateLetterHTML(facName, false);

    html += `
      <div class="card">
        <h2>👋 Welcome, ${esc(facName)}</h2>
        <p style="color:var(--mu); font-size:14px; margin:0;">
          Confidential Faculty Portal: You can view <strong>only your own performance metrics</strong>. Peer rankings and department comparisons remain strictly confidential.
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <b>${fx(agg.overall)} / 5.0</b>
            <span>Overall Score ${stars(agg.overall)}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🧑‍🎓</div>
          <div class="stat-content">
            <b>${agg.count}</b>
            <span>Students Who Rated You</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <b>${bandLabel}</b>
            <span>Performance Status</span>
          </div>
        </div>
      </div>

      <!-- Attached Automated Letter (if Warning or Appreciation) -->
      ${letterHtml ? `
        <div class="card">
          <h4 class="attached-heading">
            ${agg.overall < 2.5 
              ? 'Attached to your profile: Warning Letter' 
              : 'Attached to your profile: Letter of Appreciation'}
          </h4>
          <p style="color:var(--mu); font-size:13.5px;">
            Issued by the Head of Department based on AY 2026-27 student evaluations.
          </p>
          ${letterHtml}
        </div>
      ` : ''}

      <!-- Parameter Breakdown -->
      <div class="card">
        <h3>📊 Parameter Breakdown</h3>
        <p style="color:var(--mu); font-size:13px; margin-bottom:14px;">
          Averages calculated from ${agg.count} anonymous responses:
        </p>
        ${PARAMETERS.map((p, idx) => {
          const score = agg.paramAvgs[idx];
          const pct = Math.min(100, (score / 5) * 100);
          return `
            <div style="margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between; font-weight:600; font-size:14px;">
                <span>${PARAM_ICONS[idx]} ${p}</span>
                <span>${fx(score)} / 5.00</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${pct}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Classes Taught & Anonymous Comments -->
      <div class="card">
        <h3>📚 Your Teaching Allocations</h3>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px;">
          ${agg.classes.map((c) => `<span class="badge badge-neutral">${esc(c)}</span>`).join('')}
        </div>

        <h3 style="border-top:1px solid var(--bd); padding-top:16px;">💬 Anonymous Student Comments</h3>
        ${agg.comments.length === 0 ? `
          <p style="color:var(--mu);">No qualitative feedback entered by students yet.</p>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${agg.comments.slice(0, 30).map((cmt) => `
              <div style="background:var(--ac-light); border-left:4px solid var(--ac); padding:10px 14px; border-radius:6px;">
                <p style="margin:0; font-size:14px;">“${esc(cmt.text)}”</p>
                <small style="color:var(--mu); display:block; margin-top:4px;">Subject: ${esc(cmt.subject)} (${esc(cmt.classInfo)})</small>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    appEl.innerHTML = html;
  }

  // ==========================================
  // 6. AUTOMATED LETTERS (Warning & Appreciation)
  // ==========================================
  function generateLetterHTML(facultyName, inModal = false) {
    const activeRatings = getActiveRatings().filter((r) => r.f.toLowerCase() === facultyName.toLowerCase());
    const agg = aggregateRatings(activeRatings)[0];
    if (!agg || (agg.overall >= 2.5 && agg.overall <= 4.5)) {
      return '';
    }

    const isWarning = agg.overall < 2.5;
    const formattedDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const stream = activeRatings[0] ? activeRatings[0].st : 'Computer Engineering';
    const deptMap = {
      AIML: 'Department of Artificial Intelligence & Machine Learning',
      IT: 'Department of Information Technology',
      COMPS: 'Department of Computer Engineering'
    };
    const deptName = deptMap[stream] || 'Department of Computer Engineering';

    return `
      <div class="letter-wrapper ${isWarning ? 'letter-warning' : 'letter-appreciation'}">
        <div class="letter-header">
          <img class="letter-logo" src="${LOGO}" alt="APSIT Logo">
          <h2 class="letter-college-title">${COLLEGE_NAME}</h2>
          <div class="letter-college-sub">
            ${COLLEGE_SUB}<br>
            ${COLLEGE_ADDR}<br>
            ${COLLEGE_CONTACT}
          </div>
        </div>

        <div class="letter-meta">
          <div>
            <strong>Ref:</strong> APSIT/EVAL/${isWarning ? 'WARN' : 'APPR'}/${ACADEMIC_YEAR.replace('-', '')}/${Math.floor(1000 + Math.random() * 9000)}<br>
            <strong>Date:</strong> ${formattedDate}
          </div>
          <div style="text-align:right;">
            <strong>Academic Year:</strong> ${ACADEMIC_YEAR}<br>
            <strong>Status:</strong> ${isWarning ? '<span style="color:#b91c1c; font-weight:700;">Needs Immediate Improvement</span>' : '<span style="color:#15803d; font-weight:700;">Commendable Excellence</span>'}
          </div>
        </div>

        <div style="margin-bottom:14px; font-size:14.5px;">
          To,<br>
          <strong>${esc(facultyName)}</strong><br>
          ${deptName}<br>
          A. P. Shah Institute of Technology, Thane
        </div>

        <h3 class="letter-title">
          ${isWarning ? '⚠️ Formal Warning Letter' : '🏅 Letter of Appreciation'}
        </h3>

        <p style="margin-bottom:12px; font-weight:bold; font-size:14.5px;">
          Subject: ${isWarning 
            ? 'Mandatory improvement required in teaching quality, student interaction, and availability' 
            : 'Commendation for outstanding teaching performance and student mentorship'}
        </p>

        <div class="letter-body">
          <p>Dear ${esc(facultyName)},</p>
          ${isWarning ? `
            <p>
              Following the conclusion of student evaluations for Academic Year <strong>${ACADEMIC_YEAR}</strong>, 
              compiled from <strong>${agg.count}</strong> anonymous student responses, your overall performance rating stands at 
              <strong style="color:#b91c1c; font-size:16px;">${fx(agg.overall)} / 5.00</strong>.
            </p>
            <p>
              As this evaluation falls critically below the departmental quality benchmark of <strong>2.50</strong>, 
              this letter serves as a formal notice. You are hereby advised to take immediate remedial measures to improve your 
              <strong>teaching quality, responsiveness to student feedback, class discipline, and academic availability</strong> 
              within <strong>one month</strong> from the date of this letter.
            </p>
            <p>
              A formal review of your academic engagement and student feedback will be conducted by the Departmental Academic Committee 
              at the end of this one-month period. The department remains dedicated to assisting you through peer mentoring, 
              pedagogical workshops, and institutional resources.
            </p>
          ` : `
            <p>
              It gives us immense pleasure to convey that, based on official student evaluations for Academic Year <strong>${ACADEMIC_YEAR}</strong> 
              compiled from <strong>${agg.count}</strong> anonymous student responses, you have achieved an exceptional performance rating of 
              <strong style="color:#15803d; font-size:16px;">${fx(agg.overall)} / 5.00</strong>.
            </p>
            <p>
              This outstanding rating places you well above the department's distinction threshold of <strong>4.50</strong>. 
              On behalf of the Management and the Academic Council of A. P. Shah Institute of Technology, 
              we commend your exemplary dedication, technical depth, punctuality, and inspiring commitment to our students.
            </p>
            <p>
              Your relentless efforts significantly elevate the teaching-learning atmosphere of our institution. 
              We look forward to your continued leadership in academic excellence.
            </p>
          `}
        </div>

        <div class="letter-signature-block">
          <div class="letter-signature">
            <div style="font-family:'Brush Script MT', cursive, sans-serif; font-size:22px; color:#1e293b; margin-bottom:4px;">
              Prof. &amp; Head
            </div>
            <strong>Head of Department</strong><br>
            <span style="font-size:12.5px; color:#64748b;">${deptName}</span><br>
            <span style="font-size:11.5px; color:#64748b;">A. P. Shah Institute of Technology, Thane</span>
          </div>
        </div>

        <div class="letter-actions no-print">
          <button class="btn-primary btn-sm" onclick="window.print()">
            🖨️ Print / Save as PDF
          </button>
          ${inModal ? `
            <button class="btn-outline btn-sm" onclick="window.apsitCloseModal()">
              Close Window
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // ==========================================
  // 7. MODALS (History, Letter, Edit Faculty, Delete Faculty)
  // ==========================================
  function showModal(contentHtml) {
    const existing = document.getElementById('active-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'active-modal';
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    };

    overlay.innerHTML = `
      <div class="modal-content" onclick="event.stopPropagation()">
        ${contentHtml}
      </div>
    `;

    document.body.appendChild(overlay);
  }

  function closeModal() {
    const existing = document.getElementById('active-modal');
    if (existing) existing.remove();
  }

  // Show History Modal
  function showHistory(encodedName) {
    const facName = decodeURIComponent(encodedName);
    const activeRatings = getActiveRatings().filter((r) => r.f.toLowerCase() === facName.toLowerCase());
    const agg = aggregateRatings(activeRatings)[0];

    if (!agg) {
      alert('No evaluation records available for ' + facName);
      return;
    }

    const modalHtml = `
      <div class="modal-header">
        <h3>Evaluation History: ${esc(facName)}</h3>
        <button class="close-btn" onclick="window.apsitCloseModal()">&times;</button>
      </div>
      <p style="color:var(--mu); font-size:13.5px; margin-bottom:14px;">
        Aggregated from <strong>${agg.count}</strong> anonymous student submissions across: ${agg.classes.map(esc).join(', ')}.
      </p>

      <h4 style="margin-top:0;">Parameter Performance</h4>
      ${PARAMETERS.map((p, idx) => {
        const score = agg.paramAvgs[idx];
        const pct = Math.min(100, (score / 5) * 100);
        return `
          <div style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; font-size:13.5px; font-weight:600;">
              <span>${PARAM_ICONS[idx]} ${p}</span>
              <span>${fx(score)} / 5.00</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('')}

      <h4 style="margin-top:18px; border-top:1px solid var(--bd); padding-top:14px;">Anonymous Student Comments</h4>
      ${agg.comments.length === 0 ? `
        <p style="color:var(--mu); font-size:13.5px;">No comments provided by students.</p>
      ` : `
        <div style="max-height:220px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
          ${agg.comments.map((cmt) => `
            <div style="background:var(--ac-light); border-left:3px solid var(--ac); padding:8px 12px; border-radius:6px; font-size:13.5px;">
              “${esc(cmt.text)}”
              <small style="color:var(--mu); display:block; margin-top:3px;">Subject: ${esc(cmt.subject)} (${esc(cmt.classInfo)})</small>
            </div>
          `).join('')}
        </div>
      `}

      <div style="margin-top:20px; text-align:right;">
        <button class="btn-outline btn-sm" onclick="window.apsitCloseModal()">Close</button>
      </div>
    `;

    showModal(modalHtml);
  }

  // Show Letter Modal
  function showLetterModal(encodedName) {
    const facName = decodeURIComponent(encodedName);
    const letterHtml = generateLetterHTML(facName, true);
    if (!letterHtml) {
      alert('This faculty member has a satisfactory rating (between 2.5 and 4.5); no letter generated.');
      return;
    }
    showModal(letterHtml);
  }

  // Edit Faculty & Subject Modal (HOD Access)
  function editFacultyModal(id) {
    const mapping = localDB.assignments.find((x) => x.id === id);
    if (!mapping) return;

    const modalHtml = `
      <div class="modal-header">
        <h3>✏️ Edit Faculty &amp; Subject Allocation</h3>
        <button class="close-btn" onclick="window.apsitCloseModal()">&times;</button>
      </div>

      <div class="form-row">
        <div>
          <label for="edit-fac-sem">Semester</label>
          <select id="edit-fac-sem">
            <option value="3" ${Number(mapping.sem) === 3 ? 'selected' : ''}>Sem 3 (Odd Semester - Operational)</option>
            <option value="4" ${Number(mapping.sem) === 4 ? 'selected' : ''}>Sem 4 (Even Semester - Operational)</option>
            <option value="1" ${Number(mapping.sem) === 1 ? 'selected' : ''}>Sem 1 (Odd)</option>
            <option value="2" ${Number(mapping.sem) === 2 ? 'selected' : ''}>Sem 2 (Even)</option>
            <option value="5" ${Number(mapping.sem) === 5 ? 'selected' : ''}>Sem 5 (Odd)</option>
            <option value="6" ${Number(mapping.sem) === 6 ? 'selected' : ''}>Sem 6 (Even)</option>
            <option value="7" ${Number(mapping.sem) === 7 ? 'selected' : ''}>Sem 7 (Odd)</option>
            <option value="8" ${Number(mapping.sem) === 8 ? 'selected' : ''}>Sem 8 (Even)</option>
          </select>
        </div>
        <div>
          <label for="edit-fac-cl">Class Division</label>
          <select id="edit-fac-cl">
            ${CLASSES.map((c) => `<option value="${c}" ${mapping.cl === c ? 'selected' : ''}>Class ${c}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="margin-bottom:14px;">
        <label for="edit-fac-subject">Subject Name</label>
        <input id="edit-fac-subject" type="text" value="${esc(mapping.s)}" placeholder="Enter subject name">
      </div>

      <div style="margin-bottom:14px;">
        <label for="edit-fac-name">Faculty Name</label>
        <input id="edit-fac-name" type="text" value="${esc(mapping.f)}" placeholder="Enter faculty name">
      </div>

      <div style="margin-bottom:16px;">
        <label for="edit-fac-st">Stream</label>
        <select id="edit-fac-st">
          ${STREAMS.map((st) => `<option value="${st}" ${mapping.st === st ? 'selected' : ''}>${st}</option>`).join('')}
        </select>
      </div>

      <p style="color:var(--mu); font-size:12.5px; margin-bottom:16px;">
        ℹ️ <strong>Note for HOD:</strong> Updating the <strong>Semester</strong> or <strong>Subject</strong> will instantly reflect across student evaluation forms and ranking dashboards. Historical evaluations will automatically migrate to the updated subject and semester.
      </p>

      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn-outline btn-sm" onclick="window.apsitCloseModal()">Cancel</button>
        <button class="btn-primary btn-sm" onclick="window.apsitSaveFacultyEdit(${id})">Save Changes</button>
      </div>
    `;

    showModal(modalHtml);
  }

  // Save Faculty & Subject Edit (HOD)
  async function saveFacultyEdit(id) {
    const semEl = document.getElementById('edit-fac-sem');
    const subjEl = document.getElementById('edit-fac-subject');
    const nameEl = document.getElementById('edit-fac-name');
    const clEl = document.getElementById('edit-fac-cl');
    const stEl = document.getElementById('edit-fac-st');
    if (!semEl || !subjEl || !nameEl) return;

    const newSem = Number(semEl.value);
    const newSubj = subjEl.value.trim();
    const newName = nameEl.value.trim();
    const newCl = clEl ? clEl.value : 'A';
    const newSt = stEl ? stEl.value : 'AIML';

    if (!newSubj || !newName) {
      alert('Subject name and Faculty name cannot be empty.');
      return;
    }

    const mapping = localDB.assignments.find((x) => x.id === id);
    if (!mapping) return;

    const oldKey = makeKey(mapping);

    // Update historical ratings to follow semester and subject changes
    localDB.ratings.forEach((r) => {
      if (makeKey(r) === oldKey) {
        r.f = newName;
        r.sub = newSubj;
        r.sem = newSem;
        r.cl = newCl;
        r.st = newSt;
      }
    });

    mapping.f = newName;
    mapping.s = newSubj;
    mapping.sem = newSem;
    mapping.cl = newCl;
    mapping.st = newSt;

    saveLocalDB();

    // Sync with backend API
    try {
      await apiCall(`/api/faculty/${id}`, 'PUT', {
        f: newName,
        s: newSubj,
        sem: newSem,
        cl: newCl,
        st: newSt
      });
    } catch (err) {
      console.warn('Backend sync notice:', err.message);
    }

    closeModal();
    render();
  }

  // Delete Faculty Modal
  function deleteFacultyModal(id) {
    const mapping = localDB.assignments.find((x) => x.id === id);
    if (!mapping) return;

    const modalHtml = `
      <div class="modal-header">
        <h3>Remove Faculty Assignment?</h3>
        <button class="close-btn" onclick="window.apsitCloseModal()">&times;</button>
      </div>
      <p style="color:var(--tx-heading); font-size:14.5px;">
        Are you sure you want to remove <strong>${esc(mapping.f)}</strong> from teaching <strong>${esc(mapping.s)}</strong> (${mapping.st}, Sem ${mapping.sem}, Class ${mapping.cl})?
      </p>
      <p style="color:var(--danger); font-size:13px;">
        This will remove the teacher from current class rankings and from the student evaluation list.
      </p>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button class="btn-outline btn-sm" onclick="window.apsitCloseModal()">Cancel</button>
        <button class="btn-danger btn-sm" onclick="window.apsitConfirmDeleteFaculty(${id})">Delete Assignment</button>
      </div>
    `;

    showModal(modalHtml);
  }

  async function confirmDeleteFaculty(id) {
    try {
      await apiCall(`/api/faculty/${id}`, 'DELETE');
    } catch (err) {
      console.warn('Backend sync notice:', err.message);
    }
    localDB.assignments = localDB.assignments.filter((m) => m.id !== id);
    saveLocalDB();
    closeModal();
    render();
  }

  // Add Faculty to current Selection
  async function addFaculty() {
    const stEl = document.getElementById('add-fac-st');
    const semEl = document.getElementById('add-fac-sem');
    const clEl = document.getElementById('add-fac-cl');
    const nameInput = document.getElementById('add-fac-name');
    const subjInput = document.getElementById('add-fac-subject');
    const msgEl = document.getElementById('add-fac-msg');
    if (!nameInput || !subjInput) return;

    const f = nameInput.value.trim();
    const s = subjInput.value.trim();
    const st = stEl ? stEl.value : (STATE.adminFilters.st || 'AIML');
    const sem = semEl ? Number(semEl.value) : (Number(STATE.adminFilters.sem) || 3);
    const cl = clEl ? clEl.value : (STATE.adminFilters.cl || 'A');

    if (!f || !s) {
      if (msgEl) msgEl.textContent = 'Please enter both faculty name and subject name.';
      return;
    }

    const newAssignment = {
      id: localDB.nextId++,
      st,
      sem,
      cl,
      f,
      s
    };

    localDB.assignments.push(newAssignment);
    saveLocalDB();

    try {
      const res = await apiCall('/api/faculty', 'POST', { st, sem, cl, f, s });
      if (res && res.assignment) {
        newAssignment.id = res.assignment.id;
      }
    } catch (err) {
      console.warn('Backend sync notice:', err.message);
    }

    render();
  }

  // ==========================================
  // 8. EVENT HANDLERS & PUBLIC BRIDGE
  // ==========================================
  async function handleLogin(e) {
    e.preventDefault();
    const usernameEl = document.getElementById('login-username');
    const passwordEl = document.getElementById('login-password');
    const errorEl = document.getElementById('login-error');

    if (!usernameEl || !passwordEl) return;
    const username = usernameEl.value.trim();
    const password = passwordEl.value;

    if (!username || !password) {
      if (errorEl) errorEl.textContent = 'Please enter both username and password.';
      return;
    }

    try {
      if (errorEl) errorEl.textContent = '';
      const data = await apiCall('/api/auth/login', 'POST', {
        role: STATE.loginRole,
        username,
        password
      });

      STATE.token = data.token;
      STATE.user = data.user;
      STATE.role = data.user.role;
      STATE.page = 'dashboard';

      storage.set('apsit_session', { token: data.token, user: data.user });

      // Synchronize latest ratings/assignments from server
      await syncBackendData();

      render();
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message || 'Incorrect username or password.';
      }
    }
  }

  function signOut() {
    STATE.user = null;
    STATE.role = null;
    STATE.token = null;
    STATE.page = 'home';
    storage.del('apsit_session');
    render();
  }

  function navigate(page) {
    STATE.page = page;
    syncBackendData();
    render();
  }

  function setLoginRole(role) {
    STATE.loginRole = role;
    render();
  }

  function selectYear(y) {
    STATE.year = Number(y);
    render();
  }

  function setStudentFilter(field, val) {
    STATE.studentFilters[field] = val;
    render();
  }

  function setAdminFilter(field, val) {
    STATE.adminFilters[field] = val;
    render();
  }

  function setRatingStar(key, pIdx, starVal) {
    if (!STATE.studentRatings[key]) {
      STATE.studentRatings[key] = { scores: [0, 0, 0, 0, 0], comment: '' };
    }
    STATE.studentRatings[key].scores[pIdx] = Number(starVal);

    // Update UI dynamically
    const cardEl = document.querySelector(`[data-key="${key}"]`);
    if (cardEl) {
      const pRow = cardEl.querySelector(`.stars-interactive[data-pidx="${pIdx}"]`);
      if (pRow) {
        [...pRow.children].forEach((btn, idx) => {
          btn.classList.toggle('active', idx < starVal);
        });
      }
      const errEl = cardEl.querySelector('span[id^="err-"]');
      if (errEl) errEl.textContent = '';
    }
  }

  function updateComment(key, text, idx) {
    if (!STATE.studentRatings[key]) {
      STATE.studentRatings[key] = { scores: [0, 0, 0, 0, 0], comment: '' };
    }
    STATE.studentRatings[key].comment = text;
    const counter = document.getElementById(`counter-${idx}`);
    if (counter) {
      counter.textContent = `${text.length} / 300 characters`;
    }
  }

  async function submitRating(key, idx) {
    const errEl = document.getElementById(`err-${idx}`);
    const formState = STATE.studentRatings[key] || { scores: [0, 0, 0, 0, 0], comment: '' };

    // Validate all 5 stars are selected
    if (formState.scores.some((sc) => sc === 0)) {
      if (errEl) errEl.textContent = 'Please rate all 5 parameters (1 to 5 stars) before submitting.';
      return;
    }

    const [st, sem, cl, f, sub] = key.split('|');

    // 100% Anonymous rating record: ZERO student identity metadata stored
    const ratingObj = {
      st,
      sem: Number(sem),
      cl,
      f,
      sub,
      sc: [...formState.scores],
      c: formState.comment.trim().slice(0, 300),
      createdAt: new Date().toISOString()
    };

    try {
      // Post to backend API
      await apiCall('/api/ratings', 'POST', ratingObj);
    } catch (e) {
      // Offline fallback
    }

    // Save to localDB
    localDB.ratings.push(ratingObj);

    // Record one anonymous student appeared entry per student per class
    const appearedKey = `apsit_appeared_${st}_${sem}_${cl}`;
    if (!storage.get(appearedKey)) {
      localDB.appeared.push({ st, sem: Number(sem), cl });
      storage.set(appearedKey, true);
    }

    saveLocalDB();
    markKeyDone(key);

    // Re-render
    render();
  }

  // Attach functions to window for DOM event binding
  window.apsitNavigate = navigate;
  window.apsitSignOut = signOut;
  window.apsitSetLoginRole = setLoginRole;
  window.apsitHandleLogin = handleLogin;
  window.apsitSelectYear = selectYear;
  window.apsitSetStudentFilter = setStudentFilter;
  window.apsitSetAdminFilter = setAdminFilter;
  window.apsitSetRatingStar = setRatingStar;
  window.apsitUpdateComment = updateComment;
  window.apsitSubmitRating = submitRating;
  window.apsitToggleTheme = toggleTheme;
  window.apsitShowHistory = showHistory;
  window.apsitShowLetterModal = showLetterModal;
  window.apsitCloseModal = closeModal;
  window.apsitEditFacultyModal = editFacultyModal;
  window.apsitSaveFacultyEdit = saveFacultyEdit;
  window.apsitDeleteFacultyModal = deleteFacultyModal;
  window.apsitConfirmDeleteFaculty = confirmDeleteFaculty;
  window.apsitAddFaculty = addFaculty;

  // Initialize App
  initTheme();
  render();

  // Initial synchronization with backend
  syncBackendData();
})();
