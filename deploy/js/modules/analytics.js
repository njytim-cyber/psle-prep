import { getPapers, getTrackerData } from './state.js';
import ViewManager from './view-manager.js';
// Note: Circular dependency with list-manager?
// Analytics allows filtering which calls renderList. 
// We will need to pass the list rendering function or trigger it.
// For now, let's keep it pure UI updates, but the 'applyTermFilter' action needs to talk to the list manager.

let analyticsSubject = 'All';
let analyticsLevel = 'All';
let displayMode = 'percent'; // 'percent' or 'count'
const TERM_ORDER = ['CA1', 'CA2', 'WA1', 'WA2', 'WA3', 'SA1', 'SA2', 'Prelim'];

export function initAnalytics() {
    const allPapers = getPapers();
    const subjects = ['All', ...new Set(allPapers.map(p => p.subject || 'Maths'))];
    const levels = ['All', ...new Set(allPapers.map(p => p.level || 'P4'))].sort();

    const subjectToggle = document.getElementById('subject-toggle');
    subjectToggle.innerHTML = subjects.map(s =>
        `<button class="toggle-btn ${s === analyticsSubject ? 'active' : ''}" data-subject="${s}">${s}</button>`
    ).join('');

    // Event delegation for subject toggle
    subjectToggle.querySelectorAll('button').forEach(btn => {
        btn.onclick = () => setSubject(btn.dataset.subject);
    });

    const levelToggle = document.getElementById('level-toggle');
    levelToggle.innerHTML = levels.map(l =>
        `<button class="toggle-btn ${l === analyticsLevel ? 'active' : ''}" data-level="${l}">${l}</button>`
    ).join('');

    // Event delegation for level toggle
    levelToggle.querySelectorAll('button').forEach(btn => {
        btn.onclick = () => setLevel(btn.dataset.level);
    });

    // Make sure setDisplayMode is attached to buttons in html? They are hardcoded in html usually, 
    // or we can attach listeners here if we id them.
    // The HTML has onclick="setDisplayMode(...)". Functional export needed.
    // But since modules have their own scope, window.setDisplayMode won't work unless we expose it.
    // Better to attach listeners in `app.js` or here. 
    // For this refactor, we will attach listeners dynamically in initAnalytics or assume `app.js` exposes global handlers if we must,
    // OR we change the HTML to not use inline handlers. 
    // Recommendation: Rewrite HTML inline handlers to IDs and attach here.
    // But modifying generic HTML handlers is tedious.
    // We will attach to window in `app.js` for compatibility, OR we attach to elements here.

    // Let's attach to the existing elements in the DOM if possible.
    // The HTML is: <button class="toggle-btn active" onclick="setDisplayMode('percent')">%</button>
    // We can't easily change the onclick attribute without parsing HTML.
    // We'll expose these functions to the module scope and let `app.js` attach them to window.

    renderAnalytics();
}

export function setSubject(subject) {
    analyticsSubject = subject;
    document.querySelectorAll('#subject-toggle .toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === subject);
    });
    renderAnalytics();
}

export function setLevel(level) {
    analyticsLevel = level;
    document.querySelectorAll('#level-toggle .toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === level);
    });
    renderAnalytics();
}

export function setDisplayMode(mode) {
    displayMode = mode;
    document.querySelectorAll('.toggle-group .toggle-btn').forEach(btn => {
        if (btn.innerText === '%' && mode === 'percent') btn.classList.add('active');
        else if (btn.innerText === 'Count' && mode === 'count') btn.classList.add('active');
        else btn.classList.remove('active');
    });
    renderAnalytics();
}

function renderAnalytics() {
    const allPapers = getPapers();
    const trackerData = getTrackerData();
    const isCompleted = (url) => trackerData[url] && trackerData[url].date;

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

        // We use a data attribute for the click handler
        termCards += `
                    <div class="term-card" data-term="${term}" title="Show incomplete ${term} papers">
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

    const gridEl = document.getElementById('analytics-grid');
    gridEl.innerHTML = gridHtml;

    // Add click listeners to cards
    gridEl.querySelectorAll('.term-card').forEach(card => {
        card.onclick = () => {
            // Dispatch a custom event or callback? 
            // We can't import 'applyTermFilter' from list-manager due to circular dep if list-manager imports this.
            // We will emit a custom DOM event 'analytics-filter'
            const event = new CustomEvent('analytics-filter', {
                detail: {
                    term: card.dataset.term,
                    subject: analyticsSubject,
                    level: analyticsLevel
                }
            });
            document.dispatchEvent(event);
        };
    });
}
