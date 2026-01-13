import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStateContext, Paper } from '../context/StateContext';
import { useNavigate } from 'react-router-dom';

const EXAM_TERM_MAPPING: { [key: string]: string[] } = {
    'WA1': ['CA1', 'WA1'],
    'WA2': ['CA2', 'WA2', 'SA1'],
    'EYE': ['WA3', 'SA2', 'Prelim']
};

interface Milestone {
    id: string; // "P4-WA1"
    level: string;
    exam: string; // "WA1"
    date: string; // YYYY-MM-DD
    title: string;
    terms: string[];
    papers: Paper[];
    stats: {
        total: number;
        done: number;
        pct: number;
        subjects: { [key: string]: { total: number, done: number } };
    };
    isPast: boolean;
    isNext: boolean;
}

export const ExamPlan = () => {
    const { papers, trackerData, examPlannerSettings, setExamPlannerSettings, saveData } = useStateContext();
    // const navigate = useNavigate(); // Unused
    const nextMilestoneRef = useRef<HTMLDivElement>(null);

    const [editingId, setEditingId] = useState<string | null>(null);

    // 1. Construct Timeline Data
    const timeline = useMemo(() => {
        const levels = ['P4', 'P5', 'P6'];
        const exams = ['WA1', 'WA2', 'EYE'];
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        let foundNext = false;
        const result: Milestone[] = [];

        levels.forEach(level => {
            exams.forEach(exam => {
                const settings = examPlannerSettings[level] || {};
                const dateStr = settings[exam] || '';
                const dateObj = dateStr ? new Date(dateStr) : null;
                const terms = EXAM_TERM_MAPPING[exam] || [];

                // Filter papers for this milestone
                const milestonePapers = papers.filter(p =>
                    (p.level || 'P4') === level &&
                    terms.includes(p.term)
                ).sort((a, b) => b.year - a.year);

                // Stats
                const total = milestonePapers.length;
                const done = milestonePapers.filter(p => trackerData[p.file_path]?.completed).length;

                const subjStats: Record<string, { total: number; done: number }> = {};
                ['Maths', 'Science', 'English'].forEach(s => {
                    const sp = milestonePapers.filter(p => (p.subject || 'Maths') === s);
                    subjStats[s] = {
                        total: sp.length,
                        done: sp.filter(p => trackerData[p.file_path]?.completed).length
                    };
                });

                const isPast = dateObj ? dateObj < now : false;
                let isNext = false;

                if (!isPast && !foundNext && dateObj) {
                    isNext = true;
                    foundNext = true;
                }

                result.push({
                    id: `${level}-${exam}`,
                    level,
                    exam,
                    date: dateStr,
                    title: `${level} ${exam === 'EYE' ? (level === 'P6' ? 'PSLE' : 'End Year Exam') : exam}`,
                    terms,
                    papers: milestonePapers,
                    stats: {
                        total,
                        done,
                        pct: total > 0 ? (done / total) * 100 : 0,
                        subjects: subjStats
                    },
                    isPast,
                    isNext
                });
            });
        });

        // If no "next" found (all past or no dates), maybe default to first or last?
        return result;
    }, [papers, trackerData, examPlannerSettings]);

    // Scroll to next
    useEffect(() => {
        if (nextMilestoneRef.current) {
            nextMilestoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    const handleDateChange = (level: string, exam: string, val: string) => {
        const newSettings = JSON.parse(JSON.stringify(examPlannerSettings));
        if (!newSettings[level]) newSettings[level] = {};
        newSettings[level][exam] = val;
        setExamPlannerSettings(newSettings);
    };

    const handleSave = async () => {
        setEditingId(null);
        await saveData();
    };

    return (
        <div id="exam-view" className="view-pane" style={{ overflowY: 'auto', padding: '20px 20px 100px 20px', maxWidth: '800px', margin: '0 auto' }}>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>🎓 Your Exam Journey</h1>
                <p style={{ opacity: 0.7 }}>Track your progress from P4 to PSLE</p>
            </div>

            <div className="timeline-container" style={{ position: 'relative', paddingLeft: '30px' }}>
                {/* Vertical Line */}
                <div style={{
                    position: 'absolute',
                    left: '14px',
                    top: '20px',
                    bottom: '0',
                    width: '4px',
                    background: 'var(--md-sys-color-outline-variant)',
                    borderRadius: '2px'
                }} />

                {timeline.map((item) => {
                    const daysLeft = item.date ? Math.ceil((new Date(item.date).getTime() - new Date().setHours(0, 0, 0, 0)) / (86400000)) : null;
                    const isEditing = editingId === item.id;

                    return (
                        <div
                            key={item.id}
                            ref={item.isNext ? nextMilestoneRef : null}
                            style={{
                                marginBottom: '40px',
                                position: 'relative',
                                opacity: item.isPast ? 0.7 : 1,
                                filter: item.isPast ? 'grayscale(0.5)' : 'none'
                            }}
                        >
                            {/* Dot */}
                            <div style={{
                                position: 'absolute',
                                left: '-23px',
                                top: '20px',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: item.isNext ? 'var(--md-sys-color-primary)' : (item.stats.pct >= 100 ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-surface-variant)'),
                                border: `4px solid var(--md-sys-color-surface)`,
                                zIndex: 2,
                                boxShadow: item.isNext ? '0 0 0 4px var(--md-sys-color-tertiary-container)' : 'none'
                            }} />

                            {/* Card */}
                            <div style={{
                                background: item.isNext ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-surface-container)',
                                padding: '20px',
                                borderRadius: '16px',
                                border: item.isNext ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--md-sys-color-outline-variant)',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.3rem', color: item.isNext ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)' }}>{item.title}</h2>

                                        {!isEditing ? (
                                            <div
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', cursor: 'pointer', opacity: 0.8 }}
                                                onClick={() => setEditingId(item.id)}
                                                title="Click to edit date"
                                            >
                                                <span style={{ fontSize: '0.9rem', color: item.isNext ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)' }}>
                                                    {item.date ? new Date(item.date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Set Date'}
                                                </span>
                                                <span style={{ fontSize: '0.8rem' }}>✏️</span>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                <input
                                                    type="date"
                                                    value={item.date}
                                                    onChange={(e) => handleDateChange(item.level, item.exam, e.target.value)}
                                                    style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'var(--md-sys-color-surface-container-high)', color: 'var(--md-sys-color-on-surface)' }}
                                                />
                                                <button onClick={handleSave} style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'var(--md-sys-color-success)', color: 'var(--md-sys-color-on-success)', cursor: 'pointer' }}>Save</button>
                                            </div>
                                        )}
                                    </div>

                                    {daysLeft !== null && (
                                        <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.1)', padding: '8px 12px', borderRadius: '12px' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1, color: item.isNext ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)' }}>{daysLeft}</div>
                                            <div style={{ fontSize: '0.7rem', color: item.isNext ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)' }}>{daysLeft === 1 ? 'Day Left' : 'Days Left'}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Stats Bar */}
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                        <span style={{ color: item.isNext ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)' }}>Progress</span>
                                        <span style={{ color: item.isNext ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)' }}>{Math.round(item.stats.pct)}% ({item.stats.done}/{item.stats.total})</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--md-sys-color-surface-variant)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${item.stats.pct}%`, height: '100%', background: item.isNext ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-success)', transition: 'width 0.5s' }} />
                                    </div>
                                </div>

                                {/* Subjects Breakdown */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                    {Object.entries(item.stats.subjects).map(([subj, data]: [string, any]) => (
                                        <div key={subj} style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7, color: item.isNext ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)' }}>{subj}</div>
                                            <div style={{ fontWeight: 600, color: item.isNext ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)' }}>{data.done}/{data.total}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
