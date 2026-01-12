import { getTrackerData, getPapers } from './state.js';

// --- XP Logic ---
const XP_WEIGHTS = {
    'SA1': 100, 'SA2': 100, 'Prelim': 120, 'Final Exam': 120,
    'WA1': 50, 'WA2': 50, 'WA3': 50, 'CA1': 50, 'CA2': 50
};
const DEFAULT_XP = 30;

export function getXPForPaper(paper) {
    if (!paper) return 0;
    const term = paper.term || '';
    return XP_WEIGHTS[term] || DEFAULT_XP;
}

export function calculateXPState() {
    let totalXP = 0;
    const subjectXP = { 'Maths': 0, 'Science': 0, 'English': 0 };
    const trackerData = getTrackerData();
    const allPapers = getPapers();

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
