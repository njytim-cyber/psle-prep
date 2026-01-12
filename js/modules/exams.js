import {
    getExamPlannerSettings, getSelectedExamGoal, getPapers, getTrackerData,
    setExamPlannerSettings, save
} from './state.js';

// --- Exam Planner Logic ---

const EXAM_TERM_MAPPING = {
    'WA1': ['CA1', 'WA1'],
    'WA2': ['CA2', 'WA2', 'SA1'],
    'EYE': ['WA3', 'SA2', 'Prelim']
};

export function getActiveExamInfo(level = 'P4') {
    const now = new Date();
    const milestones = ['WA1', 'WA2', 'EYE'];
    const settings = getExamPlannerSettings()[level] || getExamPlannerSettings()['P4'];

    // Priority: Manual selection
    let activeMilestone = getSelectedExamGoal();

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

export function calculateExamPrepStats(examPlanFilter = 'due', activeLevel = 'P4') {
    const level = activeLevel;
    const examInfo = getActiveExamInfo(level);
    const subjects = ['Maths', 'Science', 'English'];
    const allPapers = getPapers();
    const trackerData = getTrackerData();
    const isCompleted = (url) => trackerData[url] && trackerData[url].date;

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

export function renderExamPlanMain(container, examPlanFilter = 'due', activeLevel = 'P4') {
    const level = activeLevel;
    const examInfo = getActiveExamInfo(level);
    const targetDate = new Date(examInfo.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const subjects = ['Maths', 'Science', 'English'];
    const allPapers = getPapers();
    const trackerData = getTrackerData();
    const isCompleted = (url) => trackerData[url] && trackerData[url].date;

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
            displayPapers = goalPapers;
        } else {
            done = allSubjectPapers.filter(p => isCompleted(p.url)).length;
            total = allSubjectPapers.length;
            displayPapers = allSubjectPapers;
        }

        const pct = total > 0 ? (done / total) * 100 : 0;

        // Generate list html
        const listHtml = displayPapers.map(p => {
            const comp = isCompleted(p.url);
            return `
                <div onclick="window.loadPaper('${p.url}')" style="background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; margin-bottom:5px; font-size:0.9rem; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" class="paper-item-exam">
                    <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-right:10px;">${p.year} ${p.school} ${p.term}</div>
                    <div>${comp ? '✅' : '⬜'}</div>
                </div>
             `;
        }).join('');

        return `
            <div vocab="subject" class="exam-subject-card" data-subject="${s}" style="background:rgba(0,0,0,0.2); border-radius:12px; padding:15px;">
               <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                   <h3 style="margin:0; font-size:1.1rem; color:#f1f5f9;">${s}</h3>
                   <span class="lvl-badge" style="background:#475569; padding:2px 8px; border-radius:12px; font-size:0.7rem;">Lvl ?</span>
               </div>
               <div style="font-size:2rem; font-weight:700; margin-bottom:5px; color:${done >= total ? '#10b981' : '#fbbf24'};">
                   ${Math.round(pct)}%
               </div>
               <div style="font-size:0.8rem; opacity:0.7; margin-bottom:15px;">
                   ${done} / ${total} goals
               </div>
               <div class="paper-list">
                   ${listHtml}
               </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div style="background:#1e293b; border-radius:16px; padding:25px; box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:20px;">
                <div>
                   <h1 style="margin:0; font-size:1.8rem;">🎯 Exam Plan: ${level} ${examInfo.milestone}</h1>
                   <p style="margin:5px 0 0; opacity:0.7;">Target Date: ${new Date(examInfo.date).toLocaleDateString()}</p>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:2.5rem; font-weight:800; color:#fbbf24; line-height:1;">${daysLeft}</div>
                    <div style="font-size:0.9rem; opacity:0.7;">Days Left</div>
                </div>
            </div>

            <!-- Controls -->
             <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
                <button id="btn-exam-dates" style="background:#334155; border:none; color:white; padding:8px 12px; border-radius:8px; cursor:pointer;">⚙️ Edit Dates</button>
                <div class="toggle-group">
                    <button class="toggle-btn ${examPlanFilter === 'due' ? 'active' : ''}" data-filter="due">Due Now</button>
                    <button class="toggle-btn ${examPlanFilter === 'all' ? 'active' : ''}" data-filter="all">All Scope</button>
                </div>
             </div>

            <div class="exam-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:15px;">
                ${subjectStats}
            </div>
        </div>
    `;

    // Attach listeners
    container.querySelector('#btn-exam-dates').onclick = () => {
        // Dispatch event to open modal
        document.dispatchEvent(new CustomEvent('open-exam-modal'));
    };
    container.querySelectorAll('.toggle-group .toggle-btn').forEach(btn => {
        btn.onclick = () => {
            document.dispatchEvent(new CustomEvent('set-exam-filter', { detail: btn.dataset.filter }));
        };
    });
}

// Modal Logic Helpers
export async function saveExamDates(level, wa1, wa2, eye) {
    const settings = getExamPlannerSettings();
    if (!settings[level]) settings[level] = {};
    settings[level].WA1 = wa1;
    settings[level].WA2 = wa2;
    settings[level].EYE = eye;

    setExamPlannerSettings(settings);
    await save();
}
