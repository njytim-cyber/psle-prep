import { getPapers, getTrackerData } from './state.js';
import ViewManager from './view-manager.js';
import { toggleDropdown, debounce } from './ui.js';

// --- Filter State ---
let filterState = {
    subject: [],
    level: [],
    year: [],
    term: [],
    school: [],
    status: [],
    notes: []
};
let filterStateChange = false;

// --- Indexing Service ---
const Indexer = {
    bySubject: {},
    byLevel: {},
    byYear: {},
    bySchool: {},
    byTerm: {},

    init(papers) {
        this.bySubject = {};
        this.byLevel = {};
        this.byYear = {};
        this.bySchool = {};
        this.byTerm = {};

        papers.forEach((p, idx) => {
            const s = p.subject || "Maths";
            if (!this.bySubject[s]) this.bySubject[s] = new Set();
            this.bySubject[s].add(idx);

            const l = p.level || "P4";
            if (!this.byLevel[l]) this.byLevel[l] = new Set();
            this.byLevel[l].add(idx);

            const y = String(p.year);
            if (!this.byYear[y]) this.byYear[y] = new Set();
            this.byYear[y].add(idx);

            const sch = p.school || "Unknown";
            if (!this.bySchool[sch]) this.bySchool[sch] = new Set();
            this.bySchool[sch].add(idx);

            const t = p.term || "Unknown";
            if (!this.byTerm[t]) this.byTerm[t] = new Set();
            this.byTerm[t].add(idx);
        });
        console.log("Indexing Complete", Object.keys(this.bySchool).length, "schools indexed.");
    },

    filter(criteria) {
        const allPapers = getPapers();
        const trackerData = getTrackerData();
        const isCompleted = (url) => trackerData[url] && trackerData[url].date;
        const hasUserNotes = (url) => trackerData[url] && trackerData[url].notes && trackerData[url].notes.trim().length > 0;

        let candidates = null;

        const getUnion = (categoryMap, selectedValues) => {
            const result = new Set();
            selectedValues.forEach(val => {
                if (categoryMap[val]) {
                    for (const idx of categoryMap[val]) result.add(idx);
                }
            });
            return result;
        };

        if (criteria.subject && criteria.subject.length > 0) {
            candidates = getUnion(this.bySubject, criteria.subject);
        }

        if (criteria.level && criteria.level.length > 0) {
            const levelSet = getUnion(this.byLevel, criteria.level);
            if (candidates === null) candidates = levelSet;
            else candidates = new Set([...candidates].filter(x => levelSet.has(x)));
        }

        if (criteria.year && criteria.year.length > 0) {
            const yearSet = getUnion(this.byYear, criteria.year.map(String));
            if (candidates === null) candidates = yearSet;
            else candidates = new Set([...candidates].filter(x => yearSet.has(x)));
        }

        if (criteria.term && criteria.term.length > 0) {
            const termSet = getUnion(this.byTerm, criteria.term);
            if (candidates === null) candidates = termSet;
            else candidates = new Set([...candidates].filter(x => termSet.has(x)));
        }

        if (criteria.school && criteria.school.length > 0) {
            const schoolSet = getUnion(this.bySchool, criteria.school);
            if (candidates === null) candidates = schoolSet;
            else candidates = new Set([...candidates].filter(x => schoolSet.has(x)));
        }

        const checkDynamic = (idx) => {
            const p = allPapers[idx];
            if (criteria.status && criteria.status.length > 0) {
                const isDone = isCompleted(p.url);
                const statusStr = isDone ? 'done' : 'todo';
                if (!criteria.status.includes(statusStr)) return false;
            }
            if (criteria.notes && criteria.notes.length > 0) {
                const hasNotes = hasUserNotes(p.url);
                const noteStr = hasNotes ? 'yes' : 'no';
                if (!criteria.notes.includes(noteStr)) return false;
            }
            return true;
        };

        let resultIndices = [];
        if (candidates === null) {
            for (let i = 0; i < allPapers.length; i++) {
                if (checkDynamic(i)) resultIndices.push(i);
            }
        } else {
            for (const i of candidates) {
                if (checkDynamic(i)) resultIndices.push(i);
            }
        }

        return resultIndices.map(i => allPapers[i]);
    }
};

// --- Rendering State ---
let currentBucketedData = {};
let renderedCounts = {};
const BATCH_SIZE = 20;

export function initFilterSystem() {
    Indexer.init(getPapers());
    populateFilters();
    renderList();

    // Attach scroll listeners dynamically
    ['Maths', 'Science', 'English'].forEach(subj => {
        const container = document.getElementById(`list-container-${subj}`);
        if (container) {
            // Remove old listener if any (hard to do without reference, but init should only run once)
            container.onscroll = () => { // Simple override
                if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
                    appendItems(subj);
                }
            };
        }
    });
}

export function populateFilters() {
    const allPapers = getPapers();
    if (allPapers.length === 0) return;

    const subjects = [...new Set(allPapers.map(p => p.subject || "Maths"))].sort();
    const levels = [...new Set(allPapers.map(p => p.level || "P4"))].sort();
    const years = [...new Set(allPapers.map(p => p.year))].sort().reverse();
    const schools = [...new Set(allPapers.map(p => p.school))].sort();
    const terms = [...new Set(allPapers.map(p => p.term))].sort();

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
        createMultiSelect('filter-school', '🏫 School', toObj(schools), 'school', true);
    }
}

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

export function renderList() {
    const criteria = {
        subject: filterState.subject.length > 0 ? filterState.subject : null,
        level: filterState.level.length > 0 ? filterState.level : null,
        year: filterState.year.length > 0 ? filterState.year : null,
        school: filterState.school.length > 0 ? filterState.school : null,
        term: filterState.term.length > 0 ? filterState.term : null,
        status: filterState.status.length > 0 ? filterState.status : null,
        notes: filterState.notes.length > 0 ? filterState.notes : null
    };

    const listEl = document.getElementById('paper-list');
    listEl.innerHTML = '';

    const filtered = Indexer.filter(criteria);
    console.log("RenderList: Filtered papers count:", filtered.length);
    const trackerData = getTrackerData();
    const isCompleted = (url) => trackerData[url] && trackerData[url].date;

    if (filtered.length === 0) {
        document.getElementById('filter-stats-count').innerText = `No papers found`;
        listEl.innerHTML = '<div style="text-align:center; padding: 50px; opacity:0.5; font-size: 1.2rem;">No papers found for these filters! 🕵️</div>';
        return;
    }

    document.getElementById('filter-stats-count').innerText = `Found ${filtered.length} papers`;

    const subjects = ['Maths', 'Science', 'English'];
    currentBucketedData = { 'Maths': [], 'Science': [], 'English': [] };
    renderedCounts = { 'Maths': 0, 'Science': 0, 'English': 0 };

    filtered.forEach(p => {
        const s = p.subject || 'Maths';
        if (currentBucketedData[s]) currentBucketedData[s].push(p);
        else currentBucketedData['Maths'].push(p);
    });

    const columnsHtml = subjects.map(subj => {
        const papers = currentBucketedData[subj];
        papers.sort((a, b) => (b.year || 0) - (a.year || 0));

        const total = papers.length;
        const done = papers.filter(p => isCompleted(p.url)).length;
        const pct = total > 0 ? (done / total) * 100 : 0;
        const colors = { 'Maths': '#3b82f6', 'Science': '#10b981', 'English': '#f43f5e' };

        return `
            <div class="exam-subject-card" style="background: rgba(30, 41, 59, 0.5); border-radius: 12px; padding: 15px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; max-height: 80vh;">
                <div style="margin-bottom: 15px; flex-shrink: 0;">
                    <h2 style="margin:0; font-size: 1.5rem; color: #f1f5f9; display:flex; align-items:center; justify-content:space-between;">
                        ${subj}
                        <span style="font-size:0.9rem; color:#94a3b8; font-weight:400;">${done} / ${total}</span>
                    </h2>
                    <div class="subject-progress" style="background:rgba(255,255,255,0.1); height:4px; border-radius:2px; margin-top:10px; width:100%;">
                         <div class="subject-progress-bar" style="width:${pct}%; background:${colors[subj]}; height:100%; border-radius:2px; transition:width 1s;"></div>
                    </div>
                </div>
                <div id="list-container-${subj}" class="custom-scrollbar" style="overflow-y: auto; padding-right: 5px; flex: 1;">
                </div>
            </div>
        `;
    }).join('');

    listEl.innerHTML = `
        <div class="responsive-grid" style="align-items: flex-start;">
            ${columnsHtml}
        </div>
        `;

    subjects.forEach(subj => {
        appendItems(subj);
        // Re-attach listeners because innerHTML wiped them out
        const container = document.getElementById(`list-container-${subj}`);
        if (container) {
            container.onscroll = () => {
                if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
                    appendItems(subj);
                }
            };
        }
    });

    if (filterStateChange) {
        ViewManager.show('results');
        filterStateChange = false;
    }
}

export function appendItems(subject) {
    const container = document.getElementById(`list-container-${subject}`);
    if (!container) return;

    const allItems = currentBucketedData[subject];
    const currentCount = renderedCounts[subject];
    if (currentCount >= allItems.length) return;

    const nextBatch = allItems.slice(currentCount, currentCount + BATCH_SIZE);
    const trackerData = getTrackerData();
    const isCompleted = (url) => trackerData[url] && trackerData[url].date;
    const hasUserNotes = (url) => trackerData[url] && trackerData[url].notes && trackerData[url].notes.trim().length > 0;


    const batchHtml = nextBatch.map(p => {
        const isDone = isCompleted(p.url);
        const tooltipText = isDone ? `Completed on ${trackerData[p.url].date}` : `Click to open`;

        // onclick="loadPaper..." needs to be global or handled here.
        // We'll use a data attribute and delegate? 
        // No, simplest is to call global wrapper 'loadPaper' which we will expose.
        // OR better: use event delegation on the container.

        return `
                <div data-paper-url="${p.url}" onclick="loadPaper('${p.url}')" title="${tooltipText}" style="font-size:0.9rem; padding:10px; background:rgba(0,0,0,0.2); border-radius:6px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; transition: background 0.2s;">
                    <div style="flex:1; display: flex; align-items: center; gap: 8px; overflow: hidden; pointer-events: none;">
                        <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            ${p.year} ${p.school} ${p.term}
                        </span>
                        ${hasUserNotes(p.url) ? '<span style="font-size:0.8rem;" title="Has Notes">📝</span>' : ''}
                    </div>
                    ${isDone ? '<span style="color:#10b981; font-weight:bold; pointer-events: none;">✓</span>' : '<span style="color:#fbbf24; pointer-events: none;">▶</span>'}
                </div>
            `;
    }).join('');

    container.insertAdjacentHTML('beforeend', batchHtml);
    renderedCounts[subject] += nextBatch.length;
}

// --- Interaction Exports ---

export function toggleOption(key, value) {
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

export function filterAction(key, action) {
    filterStateChange = true;
    const allPapers = getPapers();
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

export function filterDropdownOptions(input) {
    // We import debounce, so we need to use it.
    // However, the original code assigned properties to the input element (input.debouncedFilter)
    // We can do that here too.
    if (!input.debouncedFilter) {
        input.debouncedFilter = debounce((val) => {
            const container = input.closest('.options-container');
            const items = container.querySelectorAll('.option-item');
            const filter = val.toLowerCase();

            items.forEach(item => {
                const text = item.querySelector('span').innerText.toLowerCase();
                if (text.includes(filter)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        }, 300);
    }
    input.debouncedFilter(input.value);
}

function updateFilterLabel(key) {
    const count = filterState[key].length;
    const el = document.getElementById(`label-${key}`);
    const defaultLabels = { subject: '📖 Subject', level: '📚 Level', year: '📅 Year', term: '🎓 Term', school: '🏫 School', status: '🚥 Status', notes: '📝 Notes' };

    if (el) {
        if (count === 0) {
            el.innerText = defaultLabels[key];
            el.style.color = '#94a3b8';
        } else {
            el.innerText = `${defaultLabels[key]}: ${count}`;
            el.style.color = '#fbbf24';
        }
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

// Analytics Integration
// We listen for the custom event dispatched by analytics.js
document.addEventListener('analytics-filter', (e) => {
    const { term, subject, level } = e.detail;
    // Clear all filters first
    filterState.subject = [];
    filterState.level = [];
    filterState.term = [];
    filterState.status = [];
    filterState.notes = [];
    filterState.school = [];

    if (subject !== 'All') filterState.subject = [subject];
    if (level !== 'All') filterState.level = [level];

    filterState.term = [term];
    filterState.status = ['todo'];

    // Update labels
    ['subject', 'level', 'term', 'status', 'notes', 'school'].forEach(key => {
        updateFilterLabel(key);
        refreshOptionsUI(key);
    });

    renderList();
});

export const getFilterState = () => filterState;
export const setFilterState = (fs) => { filterState = fs; };

