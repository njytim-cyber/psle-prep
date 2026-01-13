import React, { useState, useMemo } from 'react';
import { useStateContext, Paper } from '../context/StateContext';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const EXAM_TERM_MAPPING: { [key: string]: string[] } = {
    'WA1': ['CA1', 'WA1'],
    'WA2': ['CA2', 'WA2', 'SA1'],
    'EYE': ['WA3', 'SA2', 'Prelim']
};

interface Milestone {
    id: string;
    level: string;
    exam: string;
    date: string;
    title: string;
    terms: string[];
    papers: Paper[];
    stats: {
        total: number;
        done: number;
        pct: number;
        subjects: { [key: string]: { total: number, done: number } };
    };
    cta: Paper[];
    isPast: boolean;
    isNext: boolean;
}

export const ExamPlan = () => {
    const { papers, trackerData, examPlannerSettings, setExamPlannerSettings, saveData, markComplete } = useStateContext();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAll, setShowAll] = useState(false);

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
                const cta: Paper[] = [];

                ['Maths', 'Science', 'English'].forEach(s => {
                    const sp = milestonePapers.filter(p => (p.subject || 'Maths') === s);
                    subjStats[s] = {
                        total: sp.length,
                        done: sp.filter(p => trackerData[p.file_path]?.completed).length
                    };

                    // Pick top uncompleted paper for CTA
                    const pending = sp.find(p => !trackerData[p.file_path]?.completed);
                    if (pending) cta.push(pending);
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
                    cta,
                    isPast,
                    isNext
                });
            });
        });

        return result;
    }, [papers, trackerData, examPlannerSettings]);

    // Set initial index to next milestone
    const [prevTimeline, setPrevTimeline] = useState(timeline);
    if (timeline !== prevTimeline) {
        setPrevTimeline(timeline);
        const nextIdx = timeline.findIndex(m => m.isNext);
        if (nextIdx !== -1) setCurrentIndex(nextIdx);
    }

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

    const activeItem = timeline[currentIndex];
    if (!activeItem) return null;

    const daysLeft = activeItem.date ? Math.ceil((new Date(activeItem.date).getTime() - new Date().setHours(0, 0, 0, 0)) / (86400000)) : null;

    return (
        <div id="exam-view" className="view-pane" style={{ overflowY: 'auto', padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>🎓 Your Exam Journey</h1>
                <p style={{ opacity: 0.7 }}>Personalized roadmap to {activeItem.level === 'P6' ? 'PSLE' : 'success'}</p>
            </div>

            {/* Carousel Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
                <button
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    style={{
                        background: 'var(--md-sys-color-surface-container)',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '12px',
                        cursor: currentIndex === 0 ? 'default' : 'pointer',
                        opacity: currentIndex === 0 ? 0.3 : 1,
                        color: 'var(--md-sys-color-on-surface)'
                    }}
                >
                    <ChevronLeft size={24} />
                </button>

                <div style={{ textAlign: 'center', minWidth: '200px' }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Current Milestone</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{activeItem.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '8px' }}>
                        {timeline.map((_, i) => (
                            <div key={i} style={{
                                width: i === currentIndex ? '20px' : '6px',
                                height: '6px',
                                borderRadius: '3px',
                                background: i === currentIndex ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline-variant)',
                                transition: 'all 0.3s'
                            }} />
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setCurrentIndex(Math.min(timeline.length - 1, currentIndex + 1))}
                    disabled={currentIndex === timeline.length - 1}
                    style={{
                        background: 'var(--md-sys-color-surface-container)',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '12px',
                        cursor: currentIndex === timeline.length - 1 ? 'default' : 'pointer',
                        opacity: currentIndex === timeline.length - 1 ? 0.3 : 1,
                        color: 'var(--md-sys-color-on-surface)'
                    }}
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Main Content Card */}
            <div style={{
                background: 'var(--md-sys-color-surface-container-high)',
                borderRadius: '24px',
                padding: '30px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                {/* Milestone Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🎯 Focus Status</h2>
                            {activeItem.isNext && <span style={{ background: 'var(--md-sys-color-tertiary-container)', color: 'var(--md-sys-color-on-tertiary-container)', padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700 }}>NEXT UP</span>}
                        </div>

                        {editingId === activeItem.id ? (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <input
                                    type="date"
                                    value={activeItem.date}
                                    onChange={(e) => handleDateChange(activeItem.level, activeItem.exam, e.target.value)}
                                    style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--md-sys-color-outline)', background: 'var(--md-sys-color-surface)', color: 'var(--md-sys-color-on-surface)' }}
                                />
                                <button onClick={handleSave} style={{ background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', border: 'none', padding: '6px 15px', borderRadius: '8px', cursor: 'pointer' }}>Set Date</button>
                            </div>
                        ) : (
                            <div onClick={() => setEditingId(activeItem.id)} style={{ marginTop: '8px', opacity: 0.8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={16} />
                                <span>{activeItem.date ? new Date(activeItem.date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Set Date'}</span>
                                <span style={{ fontSize: '0.8rem' }}>✏️</span>
                            </div>
                        )}
                    </div>

                    {daysLeft !== null && (
                        <div style={{ background: 'var(--md-sys-color-secondary-container)', padding: '10px 20px', borderRadius: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--md-sys-color-on-secondary-container)' }}>{daysLeft}</div>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600 }}>Days Left</div>
                        </div>
                    )}
                </div>

                {/* Progress Visual */}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                        <span>Overall Milestone Progress</span>
                        <span style={{ fontWeight: 700 }}>{Math.round(activeItem.stats.pct)}% ({activeItem.stats.done}/{activeItem.stats.total})</span>
                    </div>
                    <div style={{ height: '12px', background: 'var(--md-sys-color-surface-variant)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${activeItem.stats.pct}%`, height: '100%', background: 'var(--md-sys-color-primary)', transition: 'width 0.8s ease' }} />
                    </div>
                </div>

                {/* CALL TO ACTION - Target Papers */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', opacity: 0.9 }}>📋 High Priority Tasks</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        {activeItem.cta.map(paper => (
                            <div key={paper.file_path} style={{
                                background: 'var(--md-sys-color-surface-container-highest)',
                                padding: '15px',
                                borderRadius: '16px',
                                border: '1px solid var(--md-sys-color-outline-variant)',
                                position: 'relative'
                            }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--md-sys-color-tertiary)', fontWeight: 700, marginBottom: '5px' }}>{paper.subject.toUpperCase()}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', lineHeight: 1.3 }}>{paper.school} ({paper.year})</div>
                                <Link
                                    to={`/view/${encodeURIComponent(paper.file_path)}`}
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        padding: '8px',
                                        background: 'var(--md-sys-color-primary)',
                                        color: 'var(--md-sys-color-on-primary)',
                                        textDecoration: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                    }}
                                >
                                    Solve Now
                                </Link>
                            </div>
                        ))}
                        {activeItem.cta.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', background: 'var(--md-sys-color-surface-container)', borderRadius: '16px', opacity: 0.7 }}>
                                🎉 All high priority papers for this milestone are done!
                            </div>
                        )}
                    </div>
                </div>

                {/* Expand All Papers Toggle */}
                <div style={{ borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: '20px' }}>
                    <div
                        onClick={() => setShowAll(!showAll)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
                    >
                        <span style={{ fontWeight: 600, opacity: 0.8 }}>Full Breakdown ({activeItem.papers.length} Papers)</span>
                        <span style={{ background: 'var(--md-sys-color-surface-variant)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>
                            {showAll ? 'Hide All' : 'Show All'}
                        </span>
                    </div>

                    {showAll && (
                        <div style={{
                            marginTop: '20px',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '20px',
                            animation: 'fadeIn 0.3s ease'
                        }}>
                            {['Maths', 'English', 'Science'].map(subj => (
                                <div key={subj}>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        color: 'var(--md-sys-color-primary)',
                                        marginBottom: '10px',
                                        borderBottom: '2px solid var(--md-sys-color-primary-container)',
                                        paddingBottom: '4px'
                                    }}>
                                        {subj}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {activeItem.papers.filter(p => (p.subject || 'Maths') === subj).map(p => {
                                            const done = trackerData[p.file_path]?.completed;
                                            return (
                                                <div key={p.file_path} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', opacity: done ? 0.6 : 1 }}>
                                                    <div onClick={() => markComplete(p.file_path, !done)} style={{ cursor: 'pointer', flexShrink: 0 }}>
                                                        {done ? <CheckCircle2 size={16} color="var(--md-sys-color-success)" /> : <Circle size={16} />}
                                                    </div>
                                                    <Link to={`/view/${encodeURIComponent(p.file_path)}`} style={{ textDecoration: 'none', color: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {p.year} {p.school}
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
