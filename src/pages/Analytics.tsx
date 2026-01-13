import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/StateContext';
import { ProgressTimeline } from '../components/charts/ProgressTimeline';

const TERM_ORDER = ['CA1', 'CA2', 'WA1', 'WA2', 'WA3', 'SA1', 'SA2', 'Prelim'];

export const Analytics = () => {
    const { papers, trackerData, setFilters } = useStateContext();
    const navigate = useNavigate();

    // Local UI State
    const [subject, setSubject] = useState('All');
    const [level, setLevel] = useState('All');
    const [displayMode, setDisplayMode] = useState<'percent' | 'count'>('percent');

    // Derived Data
    const uniqueSubjects = useMemo(() =>
        ['All', ...new Set(papers.map(p => p.subject || 'Maths'))].sort(),
        [papers]);

    const uniqueLevels = useMemo(() =>
        ['All', ...new Set(papers.map(p => p.level || 'P4'))].sort(),
        [papers]);

    const filteredPapers = useMemo(() => {
        return papers.filter(p =>
            (subject === 'All' || (p.subject || 'Maths') === subject) &&
            (level === 'All' || (p.level || 'P4') === level)
        );
    }, [papers, subject, level]);

    const isCompleted = (url: string) => !!trackerData[url]?.completed;

    // Drill Down Handler
    const handleDrillDown = (term: string) => {
        // Reset filters first
        setFilters({
            subject: subject === 'All' ? [] : [subject],
            term: [term],
            level: level === 'All' ? [] : [level],
            year: [],
            school: [],
            sort: 'year_desc'
        });
        navigate('/');
    };

    const handleSubjectSummaryClick = (subj: string) => {
        setFilters({
            subject: [subj],
            term: [],
            level: [],
            year: [],
            school: [],
            sort: 'year_desc'
        });
        navigate('/');
    }

    // Summary Stats
    const totalPapers = filteredPapers.length;
    const completedCount = filteredPapers.filter(p => isCompleted(p.file_path)).length;
    const percentComplete = totalPapers > 0 ? Math.round((completedCount / totalPapers) * 100) : 0;

    return (
        <div id="analytics-view" className="view-pane view-enter" style={{ overflowY: 'auto', padding: '20px' }}>
            <div className="analytics-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Progress Timeline Visualization */}
                <div style={{ marginBottom: '32px' }}>
                    <ProgressTimeline />
                </div>

                <div className="analytics-header">
                    <h2>📊 Analytics Dashboard</h2>
                    {/* Close button not needed as we have sidebar navigation */}
                </div>

                <div className="analytics-controls">
                    {/* Subject Toggle */}
                    <div className="toggle-group">
                        {uniqueSubjects.map(s => (
                            <button
                                key={s}
                                className={`toggle-btn ${subject === s ? 'active' : ''}`}
                                onClick={() => setSubject(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Level Toggle */}
                    <div className="toggle-group" style={{ marginLeft: 10 }}>
                        {uniqueLevels.map(l => (
                            <button
                                key={l}
                                className={`toggle-btn ${level === l ? 'active' : ''}`}
                                onClick={() => setLevel(l)}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    {/* Mode Toggle */}
                    <div className="toggle-group" style={{ marginLeft: 10 }}>
                        <button className={`toggle-btn ${displayMode === 'percent' ? 'active' : ''}`} onClick={() => setDisplayMode('percent')}>%</button>
                        <button className={`toggle-btn ${displayMode === 'count' ? 'active' : ''}`} onClick={() => setDisplayMode('count')}>Count</button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="summary-stats" id="summary-stats">
                    <div className="summary-card">
                        <div className="value">{completedCount}/{totalPapers}</div>
                        <div className="label">Total Papers</div>
                    </div>
                    <div className="summary-card">
                        <div className="value">{percentComplete}%</div>
                        <div className="label">Completion</div>
                    </div>
                    {/* By Subject (only if All selected) */}
                    {subject === 'All' && uniqueSubjects.filter(s => s !== 'All').map(s => {
                        const subPapers = papers.filter(p => (p.subject || 'Maths') === s);
                        const subDone = subPapers.filter(p => isCompleted(p.file_path)).length;
                        const subPct = subPapers.length > 0 ? Math.round((subDone / subPapers.length) * 100) : 0;
                        return (
                            <div className="summary-card" key={s} onClick={() => handleSubjectSummaryClick(s)} style={{ cursor: 'pointer' }}>
                                <div className="value">
                                    {displayMode === 'percent' ? `${subPct}%` : `${subDone}/${subPapers.length}`}
                                </div>
                                <div className="label">{s}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Term Grid */}
                <div className="analytics-grid">
                    <div className="subject-section">
                        <div className="subject-title">
                            {subject === 'Maths' ? '🔢' : subject === 'Science' ? '🔬' : subject === 'English' ? '📚' : '📊'} {' '}
                            {subject === 'All' ? 'All Subjects' : subject} by Term
                        </div>
                        <div className="term-grid">
                            {TERM_ORDER.map(term => {
                                const termPapers = filteredPapers.filter(p => p.term === term);
                                const tTotal = termPapers.length;
                                const tDone = termPapers.filter(p => isCompleted(p.file_path)).length;
                                const tPct = tTotal > 0 ? Math.round((tDone / tTotal) * 100) : 0;

                                let colorClass = 'low';
                                if (tPct >= 75) colorClass = 'high';
                                else if (tPct >= 40) colorClass = 'medium';

                                return (
                                    <div
                                        className="term-card"
                                        key={term}
                                        title={`Show ${term} papers`}
                                        onClick={() => handleDrillDown(term)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="term-name">{term}</div>
                                        <div className={`term-value ${tTotal > 0 ? colorClass : ''}`}>
                                            {tTotal > 0
                                                ? (displayMode === 'percent' ? `${tPct}%` : `${tDone}/${tTotal}`)
                                                : '-'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
