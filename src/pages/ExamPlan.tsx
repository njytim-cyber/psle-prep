import React, { useState, useMemo } from 'react';
import { useStateContext, Paper } from '../context/StateContext';
import { useNavigate } from 'react-router-dom';

const EXAM_TERM_MAPPING: { [key: string]: string[] } = {
    'WA1': ['CA1', 'WA1'],
    'WA2': ['CA2', 'WA2', 'SA1'],
    'EYE': ['WA3', 'SA2', 'Prelim']
};

export const ExamPlan = () => {
    const { papers, trackerData, examPlannerSettings, setExamPlannerSettings } = useStateContext();
    const navigate = useNavigate();

    // Local state
    const [activeLevel, setActiveLevel] = useState('P4');
    const [filterMode, setFilterMode] = useState<'due' | 'all'>('due');
    const [editingDates, setEditingDates] = useState(false);

    // Determine Active Milestone
    const examInfo = useMemo(() => {
        const now = new Date();
        const milestones = ['WA1', 'WA2', 'EYE'];
        const settings = examPlannerSettings[activeLevel] || examPlannerSettings['P4']; // Default to P4 if missing

        // Find next future milestone
        let active = 'EYE';
        for (const m of milestones) {
            // Check if date string exists and is in future
            if (settings[m] && new Date(settings[m]) >= now) {
                active = m;
                break;
            }
        }
        return {
            milestone: active,
            date: settings[active],
            terms: EXAM_TERM_MAPPING[active] || []
        };
    }, [examPlannerSettings, activeLevel]);

    const daysLeft = useMemo(() => {
        const target = new Date(examInfo.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = target.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }, [examInfo]);

    // Group Papers by Subject
    const subjects = ['Maths', 'Science', 'English'];

    // Helper
    const isCompleted = (filePath: string) => !!trackerData[filePath]?.completed;

    const subjectStats = subjects.map(s => {
        const relevantPapers = papers.filter(p =>
            (p.subject || 'Maths') === s &&
            (p.level || 'P4') === activeLevel &&
            examInfo.terms.includes(p.term)
        );
        // Sort descending by year
        relevantPapers.sort((a, b) => b.year - a.year);

        let displayPapers: Paper[] = [];
        let total = 0;
        let done = 0;

        if (filterMode === 'due') {
            // Goal: Top 2 recent papers
            const targetCount = 2;
            displayPapers = relevantPapers.slice(0, targetCount);
            // "Goal" logic from legacy: 1st paper counts as the goal? 
            // Legacy: done = goalPapers.length > 0 && isCompleted(goalPapers[0].url) ? 1 : 0; total = 1;
            // Let's stick to legacy logic: Goal is to do the LATEST paper.
            total = 1;
            done = relevantPapers.length > 0 && isCompleted(relevantPapers[0].file_path) ? 1 : 0;
        } else {
            // All scope
            displayPapers = relevantPapers;
            total = relevantPapers.length;
            done = relevantPapers.filter(p => isCompleted(p.file_path)).length;
        }

        const pct = total > 0 ? (done / total) * 100 : 0;

        return { subject: s, displayPapers, total, done, pct };
    });

    const handleDateChange = (milestone: string, val: string) => {
        const newSettings = JSON.parse(JSON.stringify(examPlannerSettings));
        if (!newSettings[activeLevel]) newSettings[activeLevel] = {};
        newSettings[activeLevel][milestone] = val;
        setExamPlannerSettings(newSettings);
        // Note: Save is triggered manually or we should expose save fn to context. 
        // ideally useEffect on change or manual save. StateContext has saveData which saves everything.
        // We will trigger saveData on close of edit mode? Or just let auto-save work?
        // Current StateContext doesn't auto-save on state change (it requires manual call).
        // Let's assume user saves manually or we add a save button.
    };

    return (
        <div id="exam-view" className="view-pane" style={{ overflowY: 'auto', padding: '20px' }}>

            {/* Header Card */}
            <div style={{ background: '#1e293b', borderRadius: '16px', padding: '25px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>🎯 Exam Plan: {activeLevel} {examInfo.milestone}</h1>
                        <p style={{ margin: '5px 0 0', opacity: 0.7 }}>Target Date: {new Date(examInfo.date).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>{daysLeft}</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Days Left</div>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        className="btn-action"
                        style={{ background: '#334155', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '8px' }}
                        onClick={() => setEditingDates(!editingDates)}
                    >
                        {editingDates ? 'Done' : '⚙️ Edit Dates'}
                    </button>

                    <div className="toggle-group">
                        <button className={`toggle-btn ${filterMode === 'due' ? 'active' : ''}`} onClick={() => setFilterMode('due')}>Due Now</button>
                        <button className={`toggle-btn ${filterMode === 'all' ? 'active' : ''}`} onClick={() => setFilterMode('all')}>All Scope</button>
                    </div>
                </div>

                {/* Date Editor */}
                {editingDates && (
                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <h3>Edit Exam Dates ({activeLevel})</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {['WA1', 'WA2', 'EYE'].map(m => (
                                <div key={m}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.7 }}>{m} Date</label>
                                    <input
                                        type="date"
                                        value={examPlannerSettings[activeLevel]?.[m] || ''}
                                        onChange={(e) => handleDateChange(m, e.target.value)}
                                        style={{ background: '#334155', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', width: '100%' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Grid */}
            <div className="exam-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                {subjectStats.map(stat => (
                    <div key={stat.subject} className="exam-subject-card" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f1f5f9' }}>{stat.subject}</h3>
                            <span className="lvl-badge" style={{ background: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem' }}>Lvl ?</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '5px', color: stat.done >= stat.total ? '#10b981' : '#fbbf24' }}>
                            {Math.round(stat.pct)}%
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '15px' }}>
                            {stat.done} / {stat.total} goals
                        </div>
                        <div className="paper-list">
                            {stat.displayPapers.map(p => {
                                const done = isCompleted(p.file_path);
                                return (
                                    <div
                                        key={p.file_path}
                                        onClick={() => navigate(`/paper/${encodeURIComponent(p.file_path)}`)}
                                        style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px', marginBottom: '5px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                    >
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '10px' }}>
                                            {p.year} {p.school} {p.term}
                                        </div>
                                        <div>{done ? '✅' : '⬜'}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};
