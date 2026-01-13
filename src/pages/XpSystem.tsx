import React, { useMemo } from 'react';
import { useStateContext } from '../context/StateContext';

const XP_WEIGHTS: { [key: string]: number } = {
    'SA1': 100, 'SA2': 100, 'Prelim': 120, 'Final Exam': 120,
    'WA1': 50, 'WA2': 50, 'WA3': 50, 'CA1': 50, 'CA2': 50
};
const DEFAULT_XP = 30;

export const XpSystem = () => {
    const { papers, trackerData } = useStateContext();

    const xpStats = useMemo(() => {
        let totalXP = 0;
        const subjectXP: { [key: string]: number } = { 'Maths': 0, 'Science': 0, 'English': 0 };
        const dailySubjectCompletions: { [date: string]: { [subj: string]: number } } = {};

        for (const filePath in trackerData) {
            const item = trackerData[filePath];
            if (item.date && item.completed) {
                let paper = papers.find(p => p.file_path === filePath);
                // Fallback for mock papers if not found in list (shouldn't happen often)
                const subj = paper?.subject || 'Maths';
                const term = paper?.term || '';

                // Streak Logic
                const date = item.date;
                if (!dailySubjectCompletions[date]) dailySubjectCompletions[date] = {};
                if (!dailySubjectCompletions[date][subj]) dailySubjectCompletions[date][subj] = 0;
                dailySubjectCompletions[date][subj]++;

                let xp = XP_WEIGHTS[term] || DEFAULT_XP;

                // Bonus for 2nd paper in same subject same day
                if (dailySubjectCompletions[date][subj] === 2) {
                    xp = Math.round(xp * 1.5);
                }

                totalXP += xp;
                if (subjectXP[subj] !== undefined) subjectXP[subj] += xp;
            }
        }

        const getLevelInfo = (xp: number) => {
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

    }, [papers, trackerData]);

    return (
        <div id="xp-view" className="view-pane" style={{ overflowY: 'auto', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🏆</div>
                <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Level {xpStats.overall.lvl}</h1>
                <p style={{ opacity: 0.7 }}>Master Scholar</p>

                {/* Overall Progress */}
                <div style={{ maxWidth: '400px', margin: '20px auto', background: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${xpStats.overall.pct}%`, background: '#fbbf24', height: '100%' }}></div>
                </div>
                <p>{Math.round(xpStats.overall.progress)} / 500 XP to next level</p>
            </div>

            <div className="xp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                {Object.entries(xpStats.subjects).map(([subj, info]) => (
                    <div key={subj} className="xp-card" style={{ background: 'var(--md-sys-color-surface-container)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>{subj}</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>Lvl {info.lvl}</div>
                        <div style={{ margin: '15px 0', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${info.pct}%`, background: '#fbbf24', height: '100%' }}></div>
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{Math.round(info.progress)} XP to next</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
