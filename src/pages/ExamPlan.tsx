import React, { useState, useMemo } from 'react';
import { useStateContext, Paper } from '../context/StateContext';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaperCard } from '../components/ui/PaperCard';

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
    const navigate = useNavigate();

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

    const globalCta = useMemo(() => {
        const nextMilestone = timeline.find(m => m.isNext) || timeline.find(m => !m.isPast) || timeline[0];
        return nextMilestone?.cta || [];
    }, [timeline]);

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

    return (
        <div id="exam-view" className="view-pane" style={{ overflowY: 'auto' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '8px' }}>🎓 Your Exam Journey</h1>
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
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--md-sys-color-primary)' }}>{activeItem.title}</div>
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

                {/* CALL TO ACTION - Target Papers (Always visible for current focus) */}
                <div style={{
                    marginBottom: '30px',
                    background: 'var(--md-sys-color-secondary-container)',
                    padding: '24px',
                    borderRadius: '24px',
                    color: 'var(--md-sys-color-on-secondary-container)'
                }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🚀 High Priority Tasks
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {globalCta.map(paper => (
                            <PaperCard
                                key={paper.file_path}
                                paper={paper}
                                completed={trackerData[paper.file_path]?.completed}
                                onToggleComplete={() => markComplete(paper.file_path, !trackerData[paper.file_path]?.completed)}
                            />
                        ))}
                        {globalCta.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '30px', opacity: 0.8 }}>
                                🎉 No pending tasks! You're all caught up.
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Card (Milestone specific) */}
                <div style={{
                    background: 'var(--md-sys-color-surface-container-high)',
                    borderRadius: '24px',
                    padding: '30px',
                    border: '1px solid var(--md-sys-color-outline-variant)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>

                    {/* Content Breakdown Header */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Progress Breakdown</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Track your completion across subjects.</p>
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
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px',
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
                                                    <PaperCard
                                                        key={p.file_path}
                                                        paper={p}
                                                        completed={done}
                                                        onToggleComplete={() => markComplete(p.file_path, !done)}
                                                    />
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
