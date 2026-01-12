        // --- Firebase Configuration (REPLACE WITH YOUR KEYS) ---
        const firebaseConfig = {
            apiKey: "AIzaSyBfgkN6Omek66GTwB75wMPxr-KvCnOMN1I",
            authDomain: "psle-prep.firebaseapp.com",
            projectId: "psle-prep",
            storageBucket: "psle-prep.firebasestorage.app",
            messagingSenderId: "883312014769",
            appId: "1:883312014769:web:b845c3cc48c164f23df990",
            measurementId: "G-WXBHDL7RKB"
        };

        // Initialize Firebase
        let firebaseApp, auth, db;
        try {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
        } catch (e) {
            console.error("Firebase initialization failed:", e);
        }

        // --- Data & State ---
        let allPapers = typeof papers !== 'undefined' ? papers : [];
        let isCloudSynced = false;
        let dataLoaded = false; // Flag to prevent saving empty data over cloud data
        let isSyncLocked = false; // Flag to permanently block saving if load failed dangerously

        // User & Avatar Data
        // User & Avatar Data
        let trackerData = {}; // Will be loaded from cloud or local storage
        let userAvatar = undefined; // undefined = not set, -1 = Google Photo, 0+ = Avatar Index
        const avatars = [
            "Felix", "Aneka", "Callie", "Liam", "Midnight", "Pepper", "Toby", "Willow",
            "Astra", "Boji", "Coco", "Dino", "Echo", "Finn", "Gigi", "Hugo",
            "Izzy", "Jax", "Koda", "Lulu", "Mochi", "Nala", "Ove", "Puddles",
            "Quill", "Rojo", "Siku", "Taco", "Una", "Vivi", "Wren", "Xena",
            "Yuki", "Zorro", "Ace", "Bean", "Cleo", "Dash", "Enzo", "Fifi",
            "Gus", "Hazel", "Iggy", "Jojo", "Kai", "Lola", "Milo", "Nico",
            "Otto", "Pip", "Rex", "Sia", "Titi", "Uzi", "Vada", "Wally",
            "Xylia", "Yoda", "Zia", "Alpha", "Beta", "Gamma", "Delta", "Epsilon"
        ];
        let examPlanFilter = 'due'; // 'all' or 'due'
        let activeMilestone = 'PSLE'; // Default
        let examPlannerSettings = {
            'P4': { 'WA1': '2026-03-01', 'WA2': '2026-05-01', 'EYE': '2026-11-01' },
            'P5': { 'WA1': '2027-03-01', 'WA2': '2027-05-01', 'EYE': '2027-11-01' },
            'P6': { 'WA1': '2028-03-01', 'WA2': '2028-05-01', 'EYE': '2028-11-01' }
        };

        const EXAM_TERM_MAPPING = {
            'WA1': ['CA1', 'WA1'],
            'WA2': ['CA2', 'WA2', 'SA1'],
            'EYE': ['WA3', 'SA2', 'Prelim']
        };
        let selectedExamGoal = null; // null = auto, or 'WA1', 'WA2', 'EYE'
        let currentUrl = null;
        let filterStateChange = false; // Flag to track explicit user filter interactions

        // Multi-select state
        let filterState = {
            subject: [],
            level: [],
            year: [],
            term: [],
            school: [],
            status: [],
            notes: []
        };

        // --- Elements ---
        const listEl = document.getElementById('paper-list');
        const viewerEl = document.getElementById('pdf-viewer');
        const notesPane = document.getElementById('notes-pane');
        const notesInput = document.getElementById('notes-input');
        const emptyEl = document.getElementById('empty-screen');
        const toolbarEl = document.getElementById('top-toolbar');
        const modal = document.getElementById('modal');
        const dateInput = document.getElementById('completion-date');

        // --- init ---
        function init() {
            // Iframe Detection
            if (window.self !== window.top) {
                document.body.classList.add('is-iframe');
            }

            // Close dropdowns on outside click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.multi-select')) {
                    document.querySelectorAll('.multi-select').forEach(el => el.classList.remove('open'));
                }
            });

            // Wait for papers data if needed
            const waitForData = setInterval(() => {
                if (typeof papers !== 'undefined' && papers.length > 0) {
                    allPapers = papers;
                    clearInterval(waitForData);
                    renderApp();
                } else if (allPapers.length > 0) {
                    clearInterval(waitForData);
                    renderApp();
                }
            }, 500);

            setTimeout(() => { if (listEl.children.length === 0) renderApp(); }, 2000);
        }

        // --- View Manager ---
        const ViewManager = {
            views: ['results', 'pdf', 'analytics', 'exam', 'xp'],
            active: 'results',

            init() {
                // Set initial state
                this.show('results');
            },

            show(viewName) {
                if (!this.views.includes(viewName)) return;
                this.active = viewName;

                // 1. Hide all views strictly
                this.views.forEach(v => {
                    const el = document.getElementById(`${v}-view`);
                    if (el) {
                        el.classList.add('hidden');
                        el.style.setProperty('display', 'none', 'important'); // Double safety
                    }
                });

                // 2. Show target view
                const target = document.getElementById(`${viewName}-view`);
                if (target) {
                    target.classList.remove('hidden');
                    const displayType = (viewName === 'pdf') ? 'flex' : 'block';
                    target.style.setProperty('display', displayType, 'important');
                }
            },

            is(viewName) {
                return this.active === viewName;
            }
        };

        // Legacy compatibility wrapper
        function switchView(viewName) {
            ViewManager.show(viewName);
        }

        // --- XP Logic ---
        const XP_WEIGHTS = {
            'SA1': 100, 'SA2': 100, 'Prelim': 120, 'Final Exam': 120,
            'WA1': 50, 'WA2': 50, 'WA3': 50, 'CA1': 50, 'CA2': 50
        };
        const DEFAULT_XP = 30;

        function getXPForPaper(paper) {
            if (!paper) return 0;
            const term = paper.term || '';
            return XP_WEIGHTS[term] || DEFAULT_XP;
        }

        function calculateXPState() {
            let totalXP = 0;
            const subjectXP = { 'Maths': 0, 'Science': 0, 'English': 0 };

            // Group completions by date and subject for stretch logic
            const dailySubjectCompletions = {};

            for (const url in trackerData) {
                if (trackerData[url].date) {
                    let paper = allPapers.find(p => p.url === url);

                    // Fallback for missing/deleted papers (Legacy Support)
                    if (!paper) {
                        // Create a dummy paper object so we still award XP
                        paper = { subject: 'Maths', term: 'Unknown' };
                    }

                    if (paper) {
                        const date = trackerData[url].date;
                        const subj = paper.subject || 'Maths';

                        if (!dailySubjectCompletions[date]) dailySubjectCompletions[date] = {};
                        if (!dailySubjectCompletions[date][subj]) dailySubjectCompletions[date][subj] = 0;
                        dailySubjectCompletions[date][subj]++;

                        let xp = getXPForPaper(paper);
                        if (dailySubjectCompletions[date][subj] === 2) {
                            xp = Math.round(xp * 1.5);
                        }

                        totalXP += xp;
                        // For unknown papers defaulting to Maths, we just add to Maths XP for now
                        // or whichever subject we defaulted to.
                        if (subjectXP[subj] !== undefined) subjectXP[subj] += xp;
                    }
                }
            }

            const getLevelInfo = (xp) => {
                const lvl = Math.floor(xp / 500) + 1;
                const progress = xp % 500;
                return { lvl, progress, pct: (progress / 500) * 100 };
            };

            return {
                overall: getLevelInfo(totalXP),
                subjects: {
                    Maths: getLevelInfo(subjectXP['Maths']),
                    Science: getLevelInfo(subjectXP['Science']),
                    English: getLevelInfo(subjectXP['English'])
                }
            };
        }

        function renderApp() {
            populateFilters();
            renderList();
            updateStats();
        }

        // --- Multi-Select Filters ---
        function createMultiSelect(id, label, options, stateKey, searchable = false) {
            const container = document.getElementById(id);
            const searchHtml = searchable ? `
                <div class="search-container" onclick="event.stopPropagation()">
                    <input type="text" class="dropdown-search" placeholder="Search..." oninput="filterDropdownOptions(this)">
                </div>
            ` : '';

            container.innerHTML = `
                <div class="multi-select" id="ms-${stateKey}">
                    <div class="select-box" onclick="toggleDropdown('${stateKey}')">
                        <span id="label-${stateKey}">${label}</span>
                        <span class="arrow">▼</span>
                    </div>
                    <div class="options-container">
                        ${searchHtml}
                        <div class="select-actions">
                            <span class="action-link" onclick="filterAction('${stateKey}', 'all')">All</span>
                            <span class="action-link" onclick="filterAction('${stateKey}', 'none')">None</span>
                        </div>
                        <div class="options-list">
                            ${options.map(opt => `
                                <div class="option-item" data-val="${opt.value}" onclick="toggleOption('${stateKey}', '${opt.value}')">
                                    <input type="checkbox" ${filterState[stateKey].includes(opt.value) ? 'checked' : ''} readonly>
                                    <span>${opt.label}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        function filterDropdownOptions(input) {
            const filter = input.value.toLowerCase();
            const container = input.closest('.options-container');
            const items = container.querySelectorAll('.option-item');

            items.forEach(item => {
                const text = item.querySelector('span').innerText.toLowerCase();
                if (text.includes(filter)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        }

        function toggleDropdown(key) {
            const el = document.getElementById(`ms-${key}`);
            const wasOpen = el.classList.contains('open');
            // Close all first
            document.querySelectorAll('.multi-select').forEach(e => e.classList.remove('open'));
            if (!wasOpen) {
                el.classList.add('open');
                // Focus search if exists
                const search = el.querySelector('.dropdown-search');
                if (search) setTimeout(() => search.focus(), 50);
            }
        }

        function toggleOption(key, value) {
            filterStateChange = true;
            const idx = filterState[key].indexOf(value);
            if (idx === -1) {
                filterState[key].push(value);
            } else {
                filterState[key].splice(idx, 1);
            }
            updateFilterLabel(key);
            renderList();
            refreshOptionsUI(key);
        }

        function filterAction(key, action) {
            filterStateChange = true;
            let allVals = [];
            if (key === 'subject') allVals = [...new Set(allPapers.map(p => p.subject || "Maths"))];
            if (key === 'level') allVals = [...new Set(allPapers.map(p => p.level || "P4"))];
            if (key === 'year') allVals = [...new Set(allPapers.map(p => p.year))].map(String);
            if (key === 'term') allVals = [...new Set(allPapers.map(p => p.term))];
            if (key === 'school') allVals = [...new Set(allPapers.map(p => p.school))];
            if (key === 'status') allVals = ['todo', 'done'];
            if (key === 'notes') allVals = ['yes', 'no'];

            if (action === 'all') {
                filterState[key] = allVals;
            } else {
                filterState[key] = [];
            }
            updateFilterLabel(key);
            refreshOptionsUI(key);
            renderList();
        }

        function updateFilterLabel(key) {
            const count = filterState[key].length;
            const el = document.getElementById(`label-${key}`);
            const defaultLabels = { subject: '📖 Subject', level: '📚 Level', year: '📅 Year', term: '🎓 Term', school: '🏫 School', status: '🚥 Status', notes: '📝 Notes' };

            if (count === 0) {
                el.innerText = defaultLabels[key];
                el.style.color = '#94a3b8';
            } else {
                el.innerText = `${defaultLabels[key]}: ${count}`;
                el.style.color = '#fbbf24';
            }
        }

        function refreshOptionsUI(key) {
            const container = document.getElementById(`ms-${key}`);
            if (!container) return;
            const items = container.querySelectorAll('.option-item');
            items.forEach(item => {
                const val = item.getAttribute('data-val');
                const cb = item.querySelector('input');
                if (cb) cb.checked = filterState[key].includes(val);
                item.classList.toggle('selected', filterState[key].includes(val));
            });
        }

        function populateFilters() {
            // Get data options
            const subjects = [...new Set(allPapers.map(p => p.subject || "Maths"))].sort();
            const levels = [...new Set(allPapers.map(p => p.level || "P4"))].sort();
            const years = [...new Set(allPapers.map(p => p.year))].sort().reverse();
            const schools = [...new Set(allPapers.map(p => p.school))].sort();
            const terms = [...new Set(allPapers.map(p => p.term))].sort();

            // Build Status Options manually
            const statusOpts = [{ value: 'todo', label: 'To Do' }, { value: 'done', label: 'Completed' }];
            const notesOpts = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];

            const toObj = (arr) => arr.map(x => ({ value: x, label: x }));

            if (document.getElementById('filter-level').innerHTML === "") {
                createMultiSelect('filter-level', '📚 Level', toObj(levels), 'level');
                createMultiSelect('filter-term', '🎓 Term', toObj(terms), 'term');
                createMultiSelect('filter-year', '📅 Year', toObj(years), 'year');
                createMultiSelect('filter-subject', '📖 Subject', toObj(subjects), 'subject');
                createMultiSelect('filter-status', '🚥 Status', statusOpts, 'status');
                createMultiSelect('filter-notes', '📝 Notes', notesOpts, 'notes');
                // Create School Filter with Search Enabled
                createMultiSelect('filter-school', '🏫 School', toObj(schools), 'school', true);
            }
        }


        // --- Core Render Logic ---
        function renderList() {
            const selectedSubjects = filterState.subject.length > 0 ? filterState.subject : null;
            const selectedLevels = filterState.level.length > 0 ? filterState.level : null;
            const selectedYears = filterState.year.length > 0 ? filterState.year : null;
            const selectedSchools = filterState.school.length > 0 ? filterState.school : null;
            const selectedTerms = filterState.term.length > 0 ? filterState.term : null;
            const selectedStatus = filterState.status.length > 0 ? filterState.status : null;
            const selectedNotes = filterState.notes.length > 0 ? filterState.notes : null;

            listEl.innerHTML = '';

            const filtered = allPapers.filter(p => {
                const pSubject = p.subject || "Maths";
                if (selectedSubjects && !selectedSubjects.includes(pSubject)) return false;

                const pLevel = p.level || "P4";
                if (selectedLevels && !selectedLevels.includes(pLevel)) return false;

                if (selectedYears && !selectedYears.includes(p.year) && !selectedYears.includes(String(p.year))) return false;

                if (selectedSchools && !selectedSchools.includes(p.school)) return false;
                if (selectedTerms && !selectedTerms.includes(p.term)) return false;

                const isDone = isCompleted(p.url);
                if (selectedStatus) {
                    const statusStr = isDone ? 'done' : 'todo';
                    if (!selectedStatus.includes(statusStr)) return false;
                }

                if (selectedNotes) {
                    const hasNotes = hasUserNotes(p.url);
                    const noteStr = hasNotes ? 'yes' : 'no';
                    if (!selectedNotes.includes(noteStr)) return false;
                }

                return true;
            });

            if (filtered.length === 0) {
                document.getElementById('filter-stats-display').innerText = `No papers found`;
                listEl.innerHTML = '<div style="text-align:center; padding: 50px; opacity:0.5; font-size: 1.2rem;">No papers found for these filters! 🕵️</div>';
                return;
            }

            document.getElementById('filter-stats-display').innerText = `Found ${filtered.length} papers`;

            // Bucket by subject
            const subjects = ['Maths', 'Science', 'English'];
            const bucketed = { 'Maths': [], 'Science': [], 'English': [] };

            filtered.forEach(p => {
                const s = p.subject || 'Maths';
                if (bucketed[s]) bucketed[s].push(p);
                else bucketed['Maths'].push(p); // Fallback
            });

            // Render Grid
            // map subjects to columns
            const columnsHtml = subjects.map(subj => {
                const papers = bucketed[subj];
                const total = papers.length;
                const done = papers.filter(p => isCompleted(p.url)).length;
                const pct = total > 0 ? (done / total) * 100 : 0;
                const colors = { 'Maths': '#3b82f6', 'Science': '#10b981', 'English': '#f43f5e' };

                // Sort papers: Not fully requested but good UX: by year desc, then term
                papers.sort((a, b) => (b.year || 0) - (a.year || 0));

                // Generate list
                const listHtml = papers.map(p => {
                    const isDone = isCompleted(p.url);
                    const tooltipText = isDone ? `Completed on ${trackerData[p.url].date}` : `Click to open`;

                    return `
                <div onclick="loadPaper('${p.url}')" title="${tooltipText}" style="font-size:0.9rem; padding:10px; background:rgba(0,0,0,0.2); border-radius:6px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; transition: background 0.2s;">
                    <div style="flex:1; display: flex; align-items: center; gap: 8px; overflow: hidden;">
                        <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            ${p.year} ${p.school} ${p.term}
                        </span>
                        ${hasUserNotes(p.url) ? '<span style="font-size:0.8rem;" title="Has Notes">📝</span>' : ''}
                    </div>
                    ${isDone ? '<span style="color:#10b981; font-weight:bold;">✓</span>' : '<span style="color:#fbbf24;">▶</span>'}
                </div>
            `;
                }).join('');

                return `
            <div class="exam-subject-card" style="background: rgba(30, 41, 59, 0.5); border-radius: 12px; padding: 15px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="margin-bottom: 15px;">
                    <h2 style="margin:0; font-size: 1.5rem; color: #f1f5f9; display:flex; align-items:center; justify-content:space-between;">
                        ${subj}
                        <span style="font-size:0.9rem; color:#94a3b8; font-weight:400;">${done} / ${total}</span>
                    </h2>
                    <div class="subject-progress" style="background:rgba(255,255,255,0.1); height:4px; border-radius:2px; margin-top:10px; width:100%;">
                         <div class="subject-progress-bar" style="width:${pct}%; background:${colors[subj]}; height:100%; border-radius:2px; transition:width 1s;"></div>
                    </div>
                </div>
                <!-- Scrollable List Container -->
                <div class="custom-scrollbar" style="max-height: 400px; overflow-y: auto; padding-right: 5px;">
                    ${listHtml}
                </div>
            </div>
        `;
            }).join('');

            listEl.innerHTML = `
        <div class="responsive-grid">
            ${columnsHtml}
        </div>
    `;

            // REMOVED: Auto-switch logic.
            // renderList is now pure rendering.
            // View switching happens only on user interaction (filter click, nav click, load).

            if (filterStateChange) {
                // If user explicitly changed a filter, make sure we show results
                ViewManager.show('results');
                filterStateChange = false;
            }
        }
        }

        function isCompleted(url) {
            return trackerData[url] && trackerData[url].date;
        }

        function hasUserNotes(url) {
            return trackerData[url] && trackerData[url].notes && trackerData[url].notes.trim().length > 0;
        }

        function getActiveExamInfo(level = 'P4') {
            const now = new Date();
            const milestones = ['WA1', 'WA2', 'EYE'];
            const settings = examPlannerSettings[level] || examPlannerSettings['P4'];

            // Priority: Manual selection
            let activeMilestone = selectedExamGoal;

            // Fallback: Find the first milestone that is in the future
            if (!activeMilestone) {
                activeMilestone = 'EYE';
                for (const m of milestones) {
                    if (new Date(settings[m]) >= now) {
                        activeMilestone = m;
                        break;
                    }
                }
            }

            return {
                milestone: activeMilestone,
                date: settings[activeMilestone],
                terms: EXAM_TERM_MAPPING[activeMilestone]
            };
        }

        function getActiveLevel() {
            if (filterState.level && filterState.level.length > 0) {
                const lvl = filterState.level[0];
                if (['P4', 'P5', 'P6'].includes(lvl)) return lvl;
            }
            return 'P4'; // Default
        }

        function calculateExamPrepStats() {
            const level = getActiveLevel();
            const examInfo = getActiveExamInfo(level);
            const subjects = ['Maths', 'Science', 'English'];
            let totalDone = 0;
            let totalGoal = 0;

            subjects.forEach(s => {
                const examPapers = allPapers.filter(p =>
                    (p.subject || 'Maths') === s &&
                    (p.level || 'P4') === level &&
                    examInfo.terms.includes(p.term)
                );
                examPapers.sort((a, b) => (b.year || 0) - (a.year || 0));

                if (examPlanFilter === 'due') {
                    const goalPapers = examPapers.slice(0, 1); // Goal is 1 paper
                    totalDone += goalPapers.filter(p => isCompleted(p.url)).length;
                    totalGoal += 1;
                } else {
                    totalDone += examPapers.filter(p => isCompleted(p.url)).length;
                    totalGoal += examPapers.length;
                }
            });

            return totalGoal > 0 ? Math.round((totalDone / totalGoal) * 100) : 0;
        }

        function updateStats() {
            const doneCount = Object.values(trackerData).filter(d => d.date).length;
            const total = allPapers.length;
            const percentage = total === 0 ? 0 : Math.round((doneCount / total) * 100);

            const completedEl = document.getElementById('completed-stat');
            const percentEl = document.getElementById('percent-stat');
            const examPrepEl = document.getElementById('exam-prep-stat');

            if (completedEl) completedEl.innerText = doneCount;
            if (percentEl) percentEl.innerText = `${percentage}%`;
            if (examPrepEl) examPrepEl.innerText = `${calculateExamPrepStats()}%`;

            // XP System Updates
            const xpState = calculateXPState();

            // Update Profile Side XP (Using the consolidated prefix)
            const prefix = 'profile';
            const lvlBadge = document.getElementById(`${prefix}-level-badge`);
            const xpText = document.getElementById(`${prefix}-xp-text`);
            const xpFill = document.getElementById(`${prefix}-xp-fill`);

            if (lvlBadge) lvlBadge.innerText = `Lvl ${xpState.overall.lvl}`;
            if (xpText) xpText.innerText = `${xpState.overall.progress} / 500 XP`;
            if (xpFill) xpFill.style.width = `${xpState.overall.pct}%`;

            // Update Subject Levels in Exam Plan if visible
            const examView = document.getElementById('exam-view-container');
            if (examView && examView.style.display === 'block') {
                for (const subj in xpState.subjects) {
                    const badge = examView.querySelector(`.exam-subject-card[data-subject="${subj}"] .lvl-badge`);
                    if (badge) {
                        badge.innerText = `Lvl ${xpState.subjects[subj].lvl}`;
                    }
                }
            }
        }

        // --- Interaction ---
        function loadPaper(paperOrUrl) {
            let paper;
            if (typeof paperOrUrl === 'string') {
                paper = allPapers.find(p => p.url === paperOrUrl);
            } else {
                paper = paperOrUrl;
            }

            if (!paper) return;
            currentUrl = paper.url;

            // Switch to PDF View
            switchView('pdf');

            // Hide Exam Plan if visible (handled by switchView)
            // const examView = document.getElementById('exam-view-container');
            // if (examView) examView.style.display = 'none';

            renderList(); // Update active state

            // emptyEl.style.display = 'none'; // Removed
            // toolbarEl.style.display = 'flex';
            // viewerEl.style.display = 'block';
            // notesPane.style.display = 'flex';
            // Handled by switchView('pdf') which makes #pdf-view flex

            // Ensure components inside pdf-view are visible? They are static now.

            document.getElementById('notes-pane').classList.remove('collapsed'); // Reset notes pane state?
            document.getElementById('notes-pane').style.height = '120px'; // Default open

            document.getElementById('current-title').innerText = paper.title;
            document.getElementById('current-details').innerText = `${paper.subject || 'Maths'} | ${paper.level || 'P4'} | ${paper.year} | ${paper.term} | ${paper.school}`;

            // Priority: PDF Link (Remote) > File Path (Local) > Source URL (Page)
            let targetUrl = paper.pdf_link || paper.file_path || paper.url;

            // Guard against empty URL, relative paths often pointing to app, or index.html
            // If it doesn't end in .pdf and isn't a google docs link, it's suspicious.
            // Also explicitly check for recursive app loading.
            const isSelfLink = targetUrl.includes(window.location.hostname) && (targetUrl.includes('index.html') || targetUrl.endsWith('/') || targetUrl.endsWith('.php'));
            const isRelative = targetUrl === './' || targetUrl === '/' || targetUrl.startsWith('./');

            if (!targetUrl || targetUrl.trim() === '' || isSelfLink || isRelative) {
                viewerEl.removeAttribute('srcdoc');
                viewerEl.src = ''; // Clear src
                alert("No PDF document found for this paper. Link might be broken or leads back to the app.");
                return;
            }

            // Use Google Docs Viewer for remote PDFs to bypass X-Frame-Options
            if (paper.pdf_link) {
                viewerEl.removeAttribute('srcdoc');
                viewerEl.src = `https://docs.google.com/viewer?url=${encodeURIComponent(paper.pdf_link)}&embedded=true`;
            } else {
                // Local file or direct URL
                viewerEl.removeAttribute('srcdoc');
                viewerEl.src = targetUrl;
            }

            document.getElementById('open-btn').href = targetUrl;

            // Notes
            const savedData = trackerData[currentUrl] || {};
            notesInput.value = savedData.notes || '';

            updateMainButton();
        }

        function updateMainButton() {
            const btn = document.getElementById('mark-btn');
            const isDone = isCompleted(currentUrl);
            if (isDone) {
                btn.innerText = "Completed ✓";
                btn.classList.add('done');
            } else {
                btn.innerText = "⭐ Mark Complete";
                btn.classList.remove('done');
            }
        }

        function toggleNotes() {
            const pane = document.getElementById('notes-pane');
            const icon = document.querySelector('.toggle-icon');
            if (pane.style.height === '30px') {
                pane.style.height = '120px';
                pane.classList.remove('collapsed');
                icon.style.transform = 'rotate(0deg)';

            } else {
                pane.style.height = '30px';
                pane.classList.add('collapsed');
                icon.style.transform = 'rotate(180deg)';
            }
        }

        function saveNotes() {
            if (!currentUrl) return;
            if (!trackerData[currentUrl]) trackerData[currentUrl] = {};

            trackerData[currentUrl].notes = notesInput.value;
            save();
            renderList();
        }

        function handleCheck(e, url) {
            e.stopPropagation();
            if (isCompleted(url)) {
                // Unmark
                if (confirm('Mark this paper as incomplete?')) {
                    if (trackerData[url]) delete trackerData[url].date; // Keep notes
                    save();
                }
            } else {
                // Mark
                openModal(url);
            }
        }

        function handleMainMark() {
            if (!currentUrl) return;
            if (isCompleted(currentUrl)) return; // Already done
            openModal(currentUrl);
        }

        // --- Modal & Saving ---
        let pending = null;

        const ENCOURAGING_MESSAGES = [
            { title: "🎉 Great Job!", sub: "You're making incredible progress!" },
            { title: "🚀 You Smashed It!", sub: "Another one bites the dust!" },
            { title: "🌟 Absolute Legend!", sub: "Your hard work is paying off!" },
            { title: "🔥 On Fire!", sub: "You're unstoppable today!" },
            { title: "🏆 Winner Winner!", sub: "Leveling up like a pro!" },
            { title: "🦁 Roar!", sub: "You've got the heart of a lion!" },
            { title: "🧠 Mastermind!", sub: "That paper didn't stand a chance!" },
            { title: "⚡ Lightning!", sub: "Finish fast, learn more!" }
        ];

        function openModal(url) {
            pending = url;
            dateInput.valueAsDate = new Date();

            // Random message
            const msg = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
            document.getElementById('modal-congrats').innerText = msg.title;
            document.getElementById('modal-subtext').innerText = msg.sub + " When did you finish this?";

            modal.style.display = 'flex';
        }

        function closeModal() {
            modal.style.display = 'none';
            pending = null;
        }

        function saveCompletion() {
            if (!pending || !dateInput.value) return;
            if (!trackerData[pending]) trackerData[pending] = {};

            trackerData[pending].date = dateInput.value;
            save(); // Handles stats and cloud
            closeModal();
            triggerConfetti();
        }

        async function save() {
            if (!dataLoaded) {
                console.warn("Save blocked: Cloud data not yet loaded.");
                return;
            }

            if (isSyncLocked) {
                console.warn("Save blocked: Sync is locked due to load error.");
                // User doesn't need to see "Sync Locked", just show "Saved Locally" or similar if we implemented local save,
                // but since we blocked it, maybe just show "Offline"
                document.getElementById('sync-status').innerText = 'Offline ☁️';
                return;
            }

            // Clean up empty entries
            for (const key in trackerData) {
                if (!trackerData[key].date && (!trackerData[key].notes || !trackerData[key].notes.trim())) {
                    delete trackerData[key];
                }
            }

            // Optimistic UI Update (Immediate response)
            updateStats();
            renderList();
            if (currentUrl) updateMainButton();

            // Push to Cloud if logged in
            if (auth && auth.currentUser) {
                try {
                    document.getElementById('sync-status').innerText = "Syncing...";
                    await db.collection('users').doc(auth.currentUser.uid).set({
                        trackerData: trackerData, // Standardized key
                        userAvatar: userAvatar,
                        examPlannerSettings: examPlannerSettings,
                        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    document.getElementById('sync-status').innerText = ""; // Hide text on success per user request
                } catch (e) {
                    console.error("Cloud save failed:", e);
                    document.getElementById('sync-status').innerText = "Sync Failed ❌";
                }
            }
            // Removed LocalStorage Fallback per request

        }

        function triggerConfetti() {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#f43f5e', '#10b981', '#fbbf24']
            });
        }

        // --- Analytics ---
        let analyticsSubject = 'All';
        let analyticsLevel = 'All';
        let displayMode = 'percent'; // 'percent' or 'count'
        const TERM_ORDER = ['CA1', 'CA2', 'WA1', 'WA2', 'WA3', 'SA1', 'SA2', 'Prelim'];

        function openAnalytics() {
            switchView('analytics');
            initAnalytics();
        }

        function closeAnalytics() {
            switchView('results');
        }

        function initAnalytics() {
            const subjects = ['All', ...new Set(allPapers.map(p => p.subject || 'Maths'))];
            const levels = ['All', ...new Set(allPapers.map(p => p.level || 'P4'))].sort();

            const subjectToggle = document.getElementById('subject-toggle');
            subjectToggle.innerHTML = subjects.map(s =>
                `<button class="toggle-btn ${s === analyticsSubject ? 'active' : ''}" onclick="setSubject('${s}')">${s}</button>`
            ).join('');

            const levelToggle = document.getElementById('level-toggle');
            levelToggle.innerHTML = levels.map(l =>
                `<button class="toggle-btn ${l === analyticsLevel ? 'active' : ''}" onclick="setLevel('${l}')">${l}</button>`
            ).join('');

            renderAnalytics();
        }

        function setSubject(subject) {
            analyticsSubject = subject;
            document.querySelectorAll('#subject-toggle .toggle-btn').forEach(btn => {
                btn.classList.toggle('active', btn.innerText === subject);
            });
            renderAnalytics();
        }

        function setLevel(level) {
            analyticsLevel = level;
            document.querySelectorAll('#level-toggle .toggle-btn').forEach(btn => {
                btn.classList.toggle('active', btn.innerText === level);
            });
            renderAnalytics();
        }

        function setDisplayMode(mode) {
            displayMode = mode;
            document.querySelectorAll('.toggle-group .toggle-btn').forEach(btn => {
                if (btn.innerText === '%' && mode === 'percent') btn.classList.add('active');
                else if (btn.innerText === 'Count' && mode === 'count') btn.classList.add('active');
                else btn.classList.remove('active');
            });
            renderAnalytics();
        }

        // --- Auth & Cloud Logic ---
        function loginGoogle() {
            try {
                if (!auth) {
                    alert("Firebase Auth not initialized! Check console.");
                    console.error("Auth object is", auth);
                    return;
                }
                const provider = new firebase.auth.GoogleAuthProvider();
                auth.signInWithPopup(provider).catch(e => {
                    console.error("Login failed:", e);
                    alert("Login failed: " + e.message);
                });
            } catch (err) {
                alert("Critical Error: " + err.message);
                console.error(err);
            }
        }


        if (auth) {
            auth.onAuthStateChanged(async (user) => {
                const loginBtn = document.getElementById('auth-section');
                const profileSec = document.getElementById('profile-container');
                const guestSec = document.getElementById('guest-profile');

                if (user) {
                    // User is signed in.
                    document.getElementById('login-overlay').style.display = 'none';
                    document.getElementById('sidebar').style.display = 'flex';
                    document.getElementById('main-view').style.display = 'flex';

                    document.getElementById('profile-container').style.display = 'flex';
                    document.getElementById('user-photo').src = user.photoURL || 'avatars.png';
                    document.getElementById('user-name').innerText = user.displayName;

                    loadUserData(); // Fetch from Firestore
                } else {
                    // User is signed out.
                    document.getElementById('login-overlay').style.display = 'flex';
                    document.getElementById('sidebar').style.display = 'none';
                    document.getElementById('main-view').style.display = 'none';
                    document.getElementById('profile-container').style.display = 'none';
                }
            });

            async function loadUserData() {
                if (!auth || !auth.currentUser) return;
                const uid = auth.currentUser.uid;

                // document.getElementById('sync-status').innerText = 'Fetching Cloud Data...'; // Removed
                try {
                    const doc = await db.collection('users').doc(uid).get();
                    let cloudTracker = {};
                    let cloudAvatar = 0;
                    let cloudExamSettings = null;

                    if (doc.exists) {
                        const data = doc.data();
                        cloudTracker = data.trackerData || data.tracker || {};
                        cloudAvatar = data.userAvatar; // undefined if not present
                        cloudExamSettings = data.examPlannerSettings || null;
                    }

                    // Legacy migration logic removed per request.

                    // MERGE STRATEGY: Keep local changes if they exist (optimistic updates), overlay cloud data
                    trackerData = { ...cloudTracker, ...trackerData };
                    userAvatar = cloudAvatar; // Use cloud avatar, or default if not set
                    if (cloudExamSettings) {
                        examPlannerSettings = { ...examPlannerSettings, ...cloudExamSettings };
                    }

                    dataLoaded = true; // Mark data as loaded to allow saving
                    document.getElementById('sync-status').innerText = ''; // Hide text on success


                    // --- SPECIAL RESTORATION FOR EVAN ---
                    if (auth.currentUser.email === 'evanngjianen@gmail.com') {
                        /*
                           Hardcoded restoration for Evan's known 15 papers
                           if the cloud tracker seems empty ( < 5 papers).
                        */
                        if (Object.keys(trackerData).length < 5) {
                            console.log("Restoring Evan's Data...");
                            const evanRestored = {
                                "https://www.testpapersfree.com/show.php?testpaperid=89535": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89534": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89533": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89532": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89531": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89530": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89529": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89528": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89527": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89526": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89525": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89524": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89523": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89522": { "date": "2025-12-25", "notes": "Great progress!" },
                                "https://www.testpapersfree.com/show.php?testpaperid=89521": { "date": "2025-12-25", "notes": "Great progress!" }
                            };
                            trackerData = { ...trackerData, ...evanRestored };
                            userAvatar = 3; // Fixed avatar for Evan (Liam)
                            await save();
                            alert("Welcome back Evan! Your 15 papers are restored.");
                        }
                    }



                    updateStats();
                    renderList();
                    loadSidebarProfile(); // Update notes header with user name

                    // Post-Load: Prompt for avatar if not set
                    if (userAvatar === undefined) {
                        // Default to Google Photo (-1) initially, but show modal to let them choose
                        userAvatar = -1;
                        updateAvatarDisplay(-1);
                        setTimeout(openAvatarModal, 500); // Slight delay for effect
                    } else {
                        updateAvatarDisplay(userAvatar);
                    }

                    // --- Welcome Summary Trigger ---
                    if (!sessionStorage.getItem('welcome_shown')) {
                        showWelcomeSummary();
                        sessionStorage.setItem('welcome_shown', 'true');
                    }
                } catch (e) {
                    console.error(e);
                    // Even if cloud load fails (offline/error), allow app to work but BLOCK SAVING
                    dataLoaded = true;
                    isSyncLocked = true;
                    document.getElementById('sync-status').innerText = 'Offline Mode ☁️';
                }
            }
        }

        // --- Avatar & User Logic ---
        function loadSidebarProfile() {
            const label = document.getElementById('notes-header-label');
            const displayName = auth.currentUser ? auth.currentUser.displayName : 'Guest';
            if (label) label.innerText = `📝 ${displayName}'s Field Notes`;
            updateStats();
        }

        // --- Welcome Summary Logic ---
        function showWelcomeSummary() {
            if (!auth.currentUser) return;

            const today = new Date().toISOString().split('T')[0];
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            let todayCount = 0;
            let weekCount = 0;
            const todaySubjects = new Set();

            for (const url in trackerData) {
                const completionDate = trackerData[url].date;
                if (!completionDate) continue;

                if (completionDate === today) {
                    todayCount++;
                    const paper = allPapers.find(p => p.url === url);
                    if (paper) todaySubjects.add(paper.subject || 'Maths');
                }
                if (new Date(completionDate) >= oneWeekAgo) weekCount++;
            }

            document.getElementById('welcome-today-count').innerText = todayCount;
            document.getElementById('welcome-week-count').innerText = weekCount;

            const name = auth.currentUser.displayName ? auth.currentUser.displayName.split(' ')[0] : 'there';
            document.getElementById('welcome-title').innerText = `Welcome back, ${name}! 👋`;

            // Daily Goal Progress
            const totalSubjects = 3; // Maths, Science, English
            const subjectsDone = todaySubjects.size;
            const dailyGoalText = subjectsDone >= totalSubjects
                ? "🚀 Daily Goal Smashed! Time for some stretch goals? ⭐"
                : `You've covered ${subjectsDone}/${totalSubjects} subjects today. Keep going!`;

            document.getElementById('welcome-subtext').innerText = dailyGoalText;

            // Milestone
            const level = getActiveLevel();
            const examInfo = getActiveExamInfo(level);
            const targetDate = new Date(examInfo.date);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const daysLeft = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));

            if (examInfo) {
                document.getElementById('welcome-milestone-label').innerText = `${level} ${examInfo.milestone}`;
                document.getElementById('welcome-milestone-days').innerText = `${daysLeft} days to go!`;
                document.getElementById('welcome-milestone-box').style.display = 'flex';
            } else {
                document.getElementById('welcome-milestone-box').style.display = 'none';
            }

            document.getElementById('welcome-modal').classList.add('show');
        }

        function closeWelcomeModal() {
            document.getElementById('welcome-modal').classList.remove('show');
        }

        function updateAvatarDisplay(idx) {
            const el = document.getElementById('user-photo');
            if (idx === -1 || idx === undefined) {
                // Use Google Photo
                if (auth.currentUser && auth.currentUser.photoURL) {
                    el.style.backgroundImage = `url('${auth.currentUser.photoURL}')`;
                    el.style.backgroundSize = 'cover';
                }
                // Fallback for guest/no-auth removed per request
            } else {
                el.style.backgroundImage = "url('avatars.png')";
                el.style.backgroundSize = '800% 800%';
                const posX = (idx % 8) * (100 / 7);
                const posY = Math.floor(idx / 8) * (100 / 7);
                el.style.backgroundPosition = `${posX}% ${posY}%`;
            }
        }

        function openAvatarModal() {
            const modal = document.getElementById('avatar-modal');
            const grid = document.getElementById('avatar-grid');
            grid.innerHTML = '';

            // Option 1: Google Photo
            if (auth.currentUser && auth.currentUser.photoURL) {
                const gDiv = document.createElement('div');
                gDiv.className = `avatar-option ${userAvatar === -1 ? 'selected' : ''}`;
                gDiv.onclick = () => setAvatar(-1);
                gDiv.innerHTML = `<img src="${auth.currentUser.photoURL}" style="width:100%; border-radius:50%;">`;
                grid.appendChild(gDiv);
            }

            // Option 2: Presets
            avatars.forEach((name, i) => {
                const div = document.createElement('div');
                div.className = `avatar-option ${userAvatar === i ? 'selected' : ''}`;
                div.onclick = () => setAvatar(i);

                // For an 8x8 grid, 100/7 is used for background-position percentage
                const posX = (i % 8) * (100 / 7);
                const posY = Math.floor(i / 8) * (100 / 7);
                div.style.backgroundPosition = `${posX}% ${posY}%`;
                div.title = name;
                grid.appendChild(div);
            });

            modal.classList.add('show');
        }

        function setAvatar(idx) {
            userAvatar = idx;
            updateAvatarDisplay(idx);
            document.getElementById('avatar-modal').classList.remove('show');
            save(); // Save to Firestore

            // Trigger confetti if they choose a new character
            if (idx >= 0) confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
        }

        function closeAvatarModal(e) {
            if (e.target.id === 'avatar-modal') {
                e.target.classList.remove('show');
            }
        }

        // Init User Data on Load (Now handled by onAuthStateChanged)
        // setTimeout(loadUserData, 100);


        function renderAnalytics() {
            let filteredPapers = allPapers;
            if (analyticsSubject !== 'All') {
                filteredPapers = filteredPapers.filter(p => (p.subject || 'Maths') === analyticsSubject);
            }
            if (analyticsLevel !== 'All') {
                filteredPapers = filteredPapers.filter(p => (p.level || 'P4') === analyticsLevel);
            }

            // Summary stats
            const totalAll = filteredPapers.length;
            const completedAll = filteredPapers.filter(p => isCompleted(p.url)).length;
            const percentAll = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

            // By subject totals (only shown when 'All' selected)
            let subjectCards = '';
            if (analyticsSubject === 'All') {
                const subjects = [...new Set(allPapers.map(p => p.subject || 'Maths'))].sort();
                subjectCards = subjects.map(s => {
                    const papers = allPapers.filter(p => (p.subject || 'Maths') === s);
                    const done = papers.filter(p => isCompleted(p.url)).length;
                    const pct = papers.length > 0 ? Math.round((done / papers.length) * 100) : 0;
                    return `
                        <div class="summary-card">
                            <div class="value">${displayMode === 'percent' ? pct + '%' : done + '/' + papers.length}</div>
                            <div class="label">${s}</div>
                        </div>
                    `;
                }).join('');
            }

            document.getElementById('summary-stats').innerHTML = `
                <div class="summary-card">
                    <div class="value">${completedAll}/${totalAll}</div>
                    <div class="label">Total Papers</div>
                </div>
                <div class="summary-card">
                    <div class="value">${percentAll}%</div>
                    <div class="label">Completion</div>
                </div>
                ${subjectCards}
            `;

            // Term grid
            const subjectEmoji = { 'Maths': '🔢', 'Science': '🔬', 'English': '📚' };
            let gridHtml = '';

            let termCards = '';
            TERM_ORDER.forEach(term => {
                const termPapers = filteredPapers.filter(p => p.term === term);
                const total = termPapers.length;
                const completed = termPapers.filter(p => isCompleted(p.url)).length;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                let colorClass = 'low';
                if (percent >= 75) colorClass = 'high';
                else if (percent >= 40) colorClass = 'medium';

                const displayValue = displayMode === 'percent'
                    ? `${percent}%`
                    : `${completed}/${total}`;

                termCards += `
                    <div class="term-card" onclick="applyTermFilter('${term}')" title="Show incomplete ${term} papers">
                        <div class="term-name">${term}</div>
                        <div class="term-value ${total > 0 ? colorClass : ''}">${total > 0 ? displayValue : '-'}</div>
                    </div>
                `;
            });

            const label = analyticsSubject === 'All' ? 'All Subjects' : analyticsSubject;
            gridHtml = `
                <div class="subject-section">
                    <div class="subject-title">${subjectEmoji[analyticsSubject] || '📊'} ${label} by Term</div>
                    <div class="term-grid">${termCards}</div>
                </div>
            `;

            document.getElementById('analytics-grid').innerHTML = gridHtml;
        }

        function applyTermFilter(term) {
            // Close analytics
            closeAnalytics(); // switches to results

            // Clear all filters first
            filterState.subject = [];
            filterState.level = [];
            filterState.term = [];
            filterState.status = [];
            filterState.notes = [];
            filterState.school = [];

            // Apply subject filter if not 'All'
            if (analyticsSubject !== 'All') {
                filterState.subject = [analyticsSubject];
            }

            // Apply level filter if not 'All'
            if (analyticsLevel !== 'All') {
                filterState.level = [analyticsLevel];
            }

            // Apply term filter
            filterState.term = [term];

            // Set status to 'todo' (show incomplete papers)
            filterState.status = ['todo'];

            // Update all filter UI labels
            ['subject', 'level', 'term', 'status', 'notes', 'school'].forEach(key => {
                updateFilterLabel(key);
                refreshOptionsUI(key);
            });

            // Re-render the paper list
            renderList();
        }



        // --- Exam Planner (Mar 2, 2026) ---
        // --- Exam Plan View (Main Pane) ---
        function showExamPlanView() {
            console.log("Opening Exam Plan View");
            try {
                switchView('exam');
                const examView = document.getElementById('exam-view');
                // Always refresh to show current milestone
                renderExamPlanMain(examView);
            } catch (e) {
                console.error("Error showing exam plan:", e);
                alert("Error opening exam plan: " + e.message);
            }
        }

        let modalExamLevel = 'P4';

        function openExamDatesModal() {
            modalExamLevel = 'P4'; // Reset to P4 or current
            updateExamModalUI();
            document.getElementById('exam-dates-modal').style.display = 'flex';
        }

        function switchExamModalLevel(lvl) {
            modalExamLevel = lvl;
            const btns = document.querySelectorAll('#exam-level-toggle .toggle-btn');
            btns.forEach(b => b.classList.toggle('active', b.innerText === lvl));
            updateExamModalUI();
        }

        function updateExamModalUI() {
            const settings = examPlannerSettings[modalExamLevel];
            document.getElementById('modal-date-wa1').value = settings.WA1;
            document.getElementById('modal-date-wa2').value = settings.WA2;
            document.getElementById('modal-date-eye').value = settings.EYE;

            // Goal toggle in modal
            const btns = document.querySelectorAll('#modal-goal-toggle .toggle-btn');
            btns.forEach(b => {
                const goal = b.innerText === 'Auto' ? null : b.innerText;
                b.classList.toggle('active', selectedExamGoal === goal);
            });
        }

        function closeExamDatesModal() {
            document.getElementById('exam-dates-modal').style.display = 'none';
        }

        async function saveExamDates() {
            examPlannerSettings[modalExamLevel].WA1 = document.getElementById('modal-date-wa1').value;
            examPlannerSettings[modalExamLevel].WA2 = document.getElementById('modal-date-wa2').value;
            examPlannerSettings[modalExamLevel].EYE = document.getElementById('modal-date-eye').value;

            await save();
            closeExamDatesModal();
            renderExamPlanMain(document.getElementById('exam-view'));
        }

        function setExamPlanFilter(filter) {
            examPlanFilter = filter;
            const container = document.getElementById('exam-view');
            if (container) renderExamPlanMain(container);
        }

        function setExamGoal(goal) {
            selectedExamGoal = goal;
            const container = document.getElementById('exam-view');
            if (container) renderExamPlanMain(container);
            updateStats(); // Update sidebar stat too
        }

        function renderExamPlanMain(container) {
            const level = getActiveLevel();
            const examInfo = getActiveExamInfo(level);
            const targetDate = new Date(examInfo.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = targetDate - today;
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const subjects = ['Maths', 'Science', 'English'];
            const subjectStats = subjects.map(s => {
                const allSubjectPapers = allPapers.filter(p =>
                    (p.subject || 'Maths') === s &&
                    (p.level || 'P4') === level &&
                    examInfo.terms.includes(p.term)
                );
                // Sort by year desc
                allSubjectPapers.sort((a, b) => (b.year || 0) - (a.year || 0));

                let displayPapers;
                let total;
                let done;

                if (examPlanFilter === 'due') {
                    const targetCount = 2;
                    const goalPapers = allSubjectPapers.slice(0, targetCount);
                    // Goal achievement is based on the 1st paper
                    done = goalPapers.length > 0 && isCompleted(goalPapers[0].url) ? 1 : 0;
                    total = 1;
                    displayPapers = goalPapers; // Show both stable
                } else {
                    done = allSubjectPapers.filter(p => isCompleted(p.url)).length;
                    total = allSubjectPapers.length;
                    displayPapers = allSubjectPapers;
                }

                return { subject: s, done, total, papers: displayPapers };
            });

            const totalDone = subjectStats.reduce((acc, s) => acc + s.done, 0);
            const totalGoal = subjectStats.reduce((acc, s) => acc + s.total, 0);
            const overallPct = totalGoal > 0 ? Math.round((totalDone / totalGoal) * 100) : 0;

            container.innerHTML = `
                <div style="max-width:1200px; margin:0 auto;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:30px;">
                        <div>
                            <div style="display:flex; align-items:center; gap:15px;">
                                <h1 style="margin:0; font-size:2.5rem; color:#fbbf24;">🗓️ Exams</h1>
                            </div>
                            <div style="display:flex; align-items:center; gap:10px; margin-top:5px;">
                                <p style="opacity:0.7; font-size:1.1rem; margin:0;">${level} ${examInfo.milestone} (${targetDate.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })})</p>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:15px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <div style="background:rgba(251,191,36,0.1); border:1px solid #fbbf24; padding:10px 15px; border-radius:12px; text-align:center; min-width:100px; height: 80px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
                                    <div style="font-size:1.5rem; font-weight:800; color:#fbbf24;">${daysLeft}</div>
                                    <div style="font-size:0.6rem; text-transform:uppercase; color:#94a3b8; font-weight:700;">Days Left</div>
                                </div>
                                <div style="background:rgba(16,185,129,0.1); border:1px solid #10b981; padding:10px 15px; border-radius:12px; text-align:center; min-width:100px; height: 80px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;">
                                    <div style="font-size:1.5rem; font-weight:800; color:#10b981;">${overallPct}%</div>
                                    <div style="font-size:0.6rem; text-transform:uppercase; color:#94a3b8; font-weight:700;">Completion</div>
                                </div>
                            </div>
                            
                            <!-- Controls Column -->
                            <div style="display:flex; flex-direction:column; justify-content:space-between; height: 80px;">
                                <!-- All/Due Toggle -->
                                <div class="toggle-group" style="background:#1e293b; border:1px solid #334155; width: 100%; justify-content: center; height: 34px;">
                                    <button class="toggle-btn ${examPlanFilter === 'all' ? 'active' : ''}" style="padding:0 15px;" onclick="setExamPlanFilter('all')">All</button>
                                    <button class="toggle-btn ${examPlanFilter === 'due' ? 'active' : ''}" style="padding:0 15px;" onclick="setExamPlanFilter('due')">Due</button>
                                </div>
                                
                                <!-- Dates/Goals Button -->
                                <button class="btn-action" onclick="openExamDatesModal()" style="background:rgba(251,191,36,0.1); border:1px solid #fbbf24; color:#fbbf24; padding:0 8px; font-size:0.8rem; border-radius:12px; cursor:pointer; height: 34px; font-weight: 600; width: 100%;">Dates / Goals</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="responsive-grid">
                        ${subjectStats.map(stat => {
                const pct = stat.total > 0 ? (stat.done / stat.total) * 100 : 0;
                const colors = { 'Maths': '#3b82f6', 'Science': '#10b981', 'English': '#f43f5e' };
                return `
                                <div class="exam-subject-card" data-subject="${stat.subject}">
                                    <h2>
                                        ${stat.subject}
                                        <span class="lvl-badge">Lvl 1</span>
                                    </h2>
                                    <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-top:5px;">
                                        <span>Progress</span>
                                        <span>${stat.done} / ${stat.total}</span>
                                    </div>
                                    <div class="subject-progress">
                                        <div class="subject-progress-fill" style="width:${pct}%; background:${colors[stat.subject]}"></div>
                                    </div>
                                    <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px; max-height:400px; overflow-y:auto; padding-right:5px;">
                                        ${stat.papers.length > 0 ? stat.papers.map((p, idx) => {
                    const isDone = isCompleted(p.url);
                    const isStretch = examPlanFilter === 'due' && idx === 1;
                    const stretchPill = isStretch ? `<span style="background:#818cf8; color:white; font-size:0.6rem; padding:1px 4px; border-radius:4px; margin-left:5px; font-weight:800;">STRETCH</span>` : '';
                    const star = (isStretch && isDone) ? `<span style="color:#fbbf24; margin-left:4px;">⭐</span>` : '';

                    const tooltipText = isDone ? `Completed on ${trackerData[p.url].date}` : `Due in ${daysLeft} days`;

                    return `
                                            <div onclick="loadPaper('${p.url}')" title="${tooltipText}" style="font-size:0.85rem; padding:8px; background:rgba(0,0,0,0.2); border-radius:6px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                                                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">
                                                    ${p.year} ${p.school} ${stretchPill} ${star}
                                                </span>
                                                ${isDone ? '<span style="color:#10b981; font-weight:bold;">✓</span>' : '<span style="color:#fbbf24;">▶</span>'}
                                            </div>
                                        `;
                }).join('') : '<div style="font-size:0.8rem; opacity:0.5; text-align:center; padding:10px;">Nothing due! 🎉</div>'}
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
             `;
        }

        // --- XP View Logic ---
        function showXPView() {
            renderXPViewMain();
            switchView('xp');
        }

        function renderXPViewMain() {
            const container = document.getElementById('xp-view-container');
            const xpState = calculateXPState();

            container.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <h1 style="color: #fbbf24; font-size: 1.8rem; margin: 0;">🚀 Mastery & XP System</h1>
                    <p style="opacity: 0.8; font-size: 0.9rem;">Track your growth across all subjects and level up!</p>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                    <!-- Level Card -->
                    <div style="background: #1e1b4b; border: 1px solid #4f46e5; border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px;">
                        <div style="background: #fbbf24; color: #1e1b4b; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 800;">
                            ${xpState.overall.lvl}
                        </div>
                        <div>
                            <div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.6; font-weight: 700;">Overall Level</div>
                            <div style="font-size: 1.1rem; font-weight: 700;">Rank: Master Aspirant</div>
                        </div>
                    </div>

                    <!-- XP Progress Card -->
                    <div style="background: #1e1b4b; border: 1px solid #4f46e5; border-radius: 12px; padding: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.85rem;">
                            <span style="font-weight: 700;">XP Progress</span>
                            <span style="color: #fbbf24; font-weight: 700;">${xpState.overall.progress} / 500 XP</span>
                        </div>
                        <div style="height: 8px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; background: linear-gradient(90deg, #4f46e5, #fbbf24); width: ${xpState.overall.pct}%"></div>
                        </div>
                        <p style="font-size: 0.7rem; opacity: 0.6; margin-top: 5px;">${500 - xpState.overall.progress} more XP to Level ${xpState.overall.lvl + 1}!</p>
                    </div>
                </div>

                <h3 style="color: #fbbf24; margin-bottom: 10px; font-size: 1rem;">📖 How to Earn XP</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 25px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="font-size: 1.1rem; margin-bottom: 5px;">📝</div>
                        <div style="font-weight: 700; margin-bottom: 3px; font-size: 0.85rem;">Daily Practice</div>
                        <div style="font-size: 0.75rem; opacity: 0.7;">Complete any paper: <b>30 XP</b></div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="font-size: 1.1rem; margin-bottom: 5px;">🎯</div>
                        <div style="font-weight: 700; margin-bottom: 3px; font-size: 0.85rem;">Daily Stretch</div>
                        <div style="font-size: 0.75rem; opacity: 0.7;">2nd paper of subject: <b>1.5x XP!</b></div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="font-size: 1.1rem; margin-bottom: 5px;">🏆</div>
                        <div style="font-weight: 700; margin-bottom: 3px; font-size: 0.85rem;">Big Exams</div>
                        <div style="font-size: 0.75rem; opacity: 0.7;">SA1, SA2, Prelims: <b>100-120 XP</b></div>
                    </div>
                </div>

                <h3 style="color: #fbbf24; margin-bottom: 10px; font-size: 1rem;">📊 Subject Mastery</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    ${Object.keys(xpState.subjects).map(s => {
                const subj = xpState.subjects[s];
                const colors = { 'Maths': '#3b82f6', 'Science': '#10b981', 'English': '#f43f5e' };
                return `
                            <div style="background: #1e1b4b; border: 1px solid ${colors[s]}; border-radius: 10px; padding: 12px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <span style="font-weight: 700; font-size: 0.9rem;">${s}</span>
                                    <span style="background: ${colors[s]}; color: white; padding: 1px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 700;">Lvl ${subj.lvl}</span>
                                </div>
                                <div style="height: 6px; background: rgba(0,0,0,0.3); border-radius: 3px; overflow: hidden; margin-bottom: 5px;">
                                    <div style="height: 100%; background: ${colors[s]}; width: ${subj.pct}%"></div>
                                </div>
                                <div style="font-size: 0.7rem; opacity: 0.6; text-align: right;">${subj.progress} / 500</div>
                            </div>
                        `;
            }).join('')}
                </div>

                <div style="margin-top: 30px; text-align: center; opacity: 0.6; font-size: 0.75rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
                    Level thresholds are every 500 XP. Keep reaching your Daily & Stretch goals! 🦁
                </div>
            `;
        }

        // Old function kept for reference but unused (or needs removal)
        function renderExamPlan() {
            // NO-OP as we moved to Main View
        }


        // --- Contribution Graph Logic ---
        function renderContributionGraph(containerId, monthsBack) {
            const container = document.getElementById(containerId);
            if (!container) return;

            container.innerHTML = '';

            // Wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'contrib-wrapper';

            // Top Labels (Months)
            const monthsLabelRow = document.createElement('div');
            monthsLabelRow.className = 'contrib-months-label';

            // Main Container (Days + Grid)
            const mainCont = document.createElement('div');
            mainCont.className = 'contrib-container';

            // Day Labels (Mon/Wed/Fri)
            const daysLabelCol = document.createElement('div');
            daysLabelCol.className = 'contrib-days-label';
            daysLabelCol.innerHTML = '<div></div><div>Mon</div><div></div><div>Wed</div><div></div><div>Fri</div><div></div>';
            mainCont.appendChild(daysLabelCol);

            // The Grid
            const grid = document.createElement('div');
            grid.className = 'contrib-grid';
            mainCont.appendChild(grid);

            // Data Logic
            const today = new Date();
            const year2026 = 2026;
            const startMonth2026 = 0; // Jan
            const endMonthWindow = 7; // Aug (0-indexed)

            let startDate;

            // Fixed Logic: Start Jan 2026.
            // Rolling Logic: If today is beyond June 2026 (first 6 month window), roll forward.
            // Actually, user requested: "starting from jan, we should show jan-jun, and when we reach july 2026, it should push one month forward (feb-jul)"
            // Window size = 6 months.

            const windowSize = 6;
            const baseStart = new Date(year2026, 0, 1); // Jan 1 2026

            // Calculate "ideal" start date: Today minus (WindowSize - 1) months
            // e.g. If Today is July (Month 6), Ideal Start is Feb (Month 1).
            const idealStart = new Date(today.getFullYear(), today.getMonth() - (windowSize - 1), 1);

            // Use the later of BaseStart or IdealStart
            startDate = idealStart > baseStart ? idealStart : baseStart;

            const endDate = new Date(startDate);
            endDate.setMonth(startDate.getMonth() + windowSize);
            endDate.setDate(0); // Last day of the window

            // Align start to Sunday (0)
            const dayOfWeek = startDate.getDay();
            const daysToSubtract = dayOfWeek; // 0 if Sunday
            startDate.setDate(startDate.getDate() - daysToSubtract);

            // Generate map
            const dateCount = {};
            for (const url in trackerData) {
                const date = trackerData[url].date;
                if (date) {
                    if (!dateCount[date]) dateCount[date] = 0;
                    dateCount[date]++;
                }
            }

            const oneDay = 24 * 60 * 60 * 1000;
            let current = new Date(startDate);
            let currentMonth = -1;

            while (current <= endDate) {
                // Month Labels Logic
                // If it's the first week of a new month, add label
                // Position approximated by flex gap
                if (current.getMonth() !== currentMonth) {
                    currentMonth = current.getMonth();
                    const monthName = current.toLocaleString('default', { month: 'short' });
                    const monthLabel = document.createElement('div');
                    monthLabel.innerText = monthName;
                    // Dynamic width calc is hard, keeping approx
                    monthLabel.style.width = '45px';
                    monthsLabelRow.appendChild(monthLabel);
                }

                const weekCol = document.createElement('div');
                weekCol.className = 'contrib-column';

                for (let i = 0; i < 7; i++) {
                    const dateStr = current.toISOString().split('T')[0];
                    const count = dateCount[dateStr] || 0;

                    const dayEl = document.createElement('div');
                    dayEl.className = 'contrib-day';

                    if (current > today) {
                        dayEl.classList.add('empty-future');
                    } else {
                        dayEl.dataset.date = dateStr;
                        // Color styling
                        if (count === 0) dayEl.classList.add('l0');
                        else if (count === 1) dayEl.classList.add('l1');
                        else if (count === 2) dayEl.classList.add('l2');
                        else if (count === 3) dayEl.classList.add('l3');
                        else dayEl.classList.add('l4'); // 4+

                        // Native Title Tooltip fallback + custom hover
                        const niceDate = current.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' });
                        dayEl.title = `${count} papers on ${niceDate}`;
                    }

                    weekCol.appendChild(dayEl);
                    current.setDate(current.getDate() + 1);
                }
                grid.appendChild(weekCol);
            }

            // Legend
            const legend = document.createElement('div');
            legend.className = 'contrib-legend';
            legend.innerHTML = `
                <span>Less</span>
                <div class="contrib-day l0"></div>
                <div class="contrib-day l1"></div>
                <div class="contrib-day l2"></div>
                <div class="contrib-day l3"></div>
                <div class="contrib-day l4"></div>
                <span>More</span>
            `;

            wrapper.appendChild(monthsLabelRow);
            wrapper.appendChild(mainCont);
            wrapper.appendChild(legend);
            container.appendChild(wrapper);
        }

        // --- Init & Updates ---
        // Hook into existing functions
        const originalUpdateStats = updateStats;
        updateStats = function () {
            originalUpdateStats();
            renderContributionGraph('sidebar-contrib', 6);
        };

        function updateUserName() {
            const currentName = userPreferences.name || "Tim";
            const newName = prompt("Enter your new display name:", currentName);
            if (newName && newName.trim().length > 0) {
                userPreferences.name = newName.trim();
                saveUserData(); // Presumes this function exists and saves to localStorage/Firestore

                // Update UI immediately
                const nameEl = document.getElementById('user-name');
                if (nameEl) nameEl.innerText = userPreferences.name;

                // If not saved to cloud in saveUserData, might need explicit call
                if (currentUser) {
                    db.collection('users').doc(currentUser.uid).set({
                        name: userPreferences.name
                    }, { merge: true });
                }
            }
        }

        // Call init() 
        init();
