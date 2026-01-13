import React, { useMemo } from 'react';
import { useStateContext } from '../../context/StateContext';

interface Milestone {
    label: string;
    level: string;
    exam: string;
    date: Date;
    targetPct: number;
}

export const ProgressTimeline: React.FC = () => {
    const { papers, trackerData, examPlannerSettings } = useStateContext();

    // Build milestone timeline
    const milestones = useMemo<Milestone[]>(() => {
        const levels = ['P4', 'P5', 'P6'];
        const exams = ['WA1', 'WA2', 'EYE'];
        const result: Milestone[] = [];

        let idx = 0;
        const totalMilestones = levels.length * exams.length;

        levels.forEach(level => {
            exams.forEach(exam => {
                const dateStr = examPlannerSettings?.[level]?.[exam] || '';
                const date = dateStr ? new Date(dateStr) : new Date();
                result.push({
                    label: `${level} ${exam}`,
                    level,
                    exam,
                    date,
                    targetPct: ((idx + 1) / totalMilestones) * 100
                });
                idx++;
            });
        });

        return result.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [examPlannerSettings]);

    // Calculate actual progress at each milestone
    const progressData = useMemo(() => {
        return milestones.map(m => {
            // Define which terms map to each exam
            const EXAM_TERM_MAPPING: Record<string, string[]> = {
                'WA1': ['CA1', 'WA1'],
                'WA2': ['CA2', 'WA2', 'SA1'],
                'EYE': ['WA3', 'SA2', 'Prelim']
            };

            const relevantTerms = EXAM_TERM_MAPPING[m.exam] || [];

            // Get papers for this level and exam terms
            const milestonePapers = papers.filter(p =>
                p.level === m.level && relevantTerms.includes(p.term)
            );

            const completed = milestonePapers.filter(p =>
                trackerData[p.file_path]?.completed
            ).length;

            const total = milestonePapers.length;
            const pct = total > 0 ? (completed / total) * 100 : 0;

            return {
                ...m,
                completed,
                total,
                actualPct: pct
            };
        });
    }, [milestones, papers, trackerData]);

    // Find today's position on the timeline
    // Start from Jan 1, 2026
    const startDate = new Date('2026-01-01');
    const today = new Date();

    // End date is the last milestone date or today, whichever is later
    const lastMilestoneDate = milestones[milestones.length - 1]?.date || today;
    const endDate = lastMilestoneDate > today ? lastMilestoneDate : today;

    const totalDuration = endDate.getTime() - startDate.getTime();

    // If today is before start date (unlikely), clamp to 0. 
    // If today is after end date, clamp to 100.
    const todayPosition = totalDuration > 0
        ? Math.min(100, Math.max(0, ((today.getTime() - startDate.getTime()) / totalDuration) * 100))
        : 0;

    // Chart dimensions
    const width = 800;
    const height = 300;
    const padding = { top: 40, right: 60, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Scale functions
    // X scale based on time
    const xScale = (date: Date) => {
        const time = date.getTime();
        const start = startDate.getTime();
        const duration = totalDuration;
        const pct = duration > 0 ? (time - start) / duration : 0;
        return padding.left + pct * chartWidth;
    };

    const yScale = (pct: number) => padding.top + chartHeight - (pct / 100) * chartHeight;

    // Build SVG paths
    const targetPath = milestones.length > 0 ? (
        `M ${padding.left} ${yScale(0)} ` + // Start at 0,0 (approx Jan 1)
        milestones.map(m => `L ${xScale(m.date)} ${yScale(m.targetPct)}`).join(' ')
    ) : '';

    // Actual path needs to be a step line or direct? Let's keep direct but maybe add intermediate points if we had historical data.
    // For now, we only have 'current' completion for each milestone.
    // To visualize 'actual' progress over time properly, we'd need historical snapshots.
    // Since we don't have that, we plot the 'current status' points at the milestone dates.
    // This is a bit weird because we are plotting 'current completion' at 'future dates'.
    // A better interpretation for "Actual":
    // Plot points at today's X for each milestone component? No.
    // Let's plot the "Current Actual" at "Today" for the overall?
    // Or, as implemented before: Plot "Available/Done" ratio for that bucket at the bucket's date.
    // This shows "When we reach Date X, we expect Y% done. Currently we have Z% done of that bucket."

    const actualPath = milestones.length > 0 ? (
        `M ${padding.left} ${yScale(0)} ` +
        progressData.map(m => `L ${xScale(m.date)} ${yScale(m.actualPct)}`).join(' ')
    ) : '';

    // Calculate overall progress
    const overallProgress = useMemo(() => {
        const totalPapers = papers.filter(p => ['P4', 'P5', 'P6'].includes(p.level || 'P4')).length;
        const completedPapers = papers.filter(p =>
            ['P4', 'P5', 'P6'].includes(p.level || 'P4') && trackerData[p.file_path]?.completed
        ).length;
        return totalPapers > 0 ? (completedPapers / totalPapers) * 100 : 0;
    }, [papers, trackerData]);

    const todayX = xScale(today);

    // Tooltip state
    const [hoveredData, setHoveredData] = React.useState<any | null>(null);

    return (
        <div style={{
            background: 'var(--md-sys-color-surface-container)',
            borderRadius: 'var(--md-sys-shape-corner-extra-large)',
            padding: '24px',
            overflow: 'hidden',
            position: 'relative' // for tooltip context if needed
        }}>
            {/* Header ... */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <div>
                    <h3 style={{
                        margin: 0,
                        font: 'var(--md-sys-typescale-title-large)',
                        color: 'var(--md-sys-color-on-surface)'
                    }}>
                        Your PSLE Journey
                    </h3>
                    <p style={{
                        margin: '4px 0 0',
                        font: 'var(--md-sys-typescale-body-medium)',
                        color: 'var(--md-sys-color-on-surface-variant)'
                    }}>
                        Starting Jan 2026 • Target: PSLE 2028
                    </p>
                </div>
                <div style={{
                    background: 'var(--md-sys-color-primary-container)',
                    padding: '12px 20px',
                    borderRadius: 'var(--md-sys-shape-corner-large)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        font: 'var(--md-sys-typescale-headline-medium)',
                        color: 'var(--md-sys-color-on-primary-container)',
                        fontWeight: 700
                    }}>
                        {Math.round(overallProgress)}%
                    </div>
                    <div style={{
                        font: 'var(--md-sys-typescale-label-small)',
                        color: 'var(--md-sys-color-on-primary-container)',
                        opacity: 0.8
                    }}>
                        Overall
                    </div>
                </div>
            </div>

            <svg
                width="100%"
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={{ overflow: 'visible' }}
            >
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(pct => (
                    <g key={pct}>
                        <line
                            x1={padding.left}
                            y1={yScale(pct)}
                            x2={width - padding.right}
                            y2={yScale(pct)}
                            stroke="var(--md-sys-color-outline-variant)"
                            strokeWidth="1"
                            strokeDasharray={pct === 0 || pct === 100 ? "0" : "4"}
                        />
                        <text
                            x={padding.left - 10}
                            y={yScale(pct)}
                            fill="var(--md-sys-color-on-surface-variant)"
                            fontSize="12"
                            textAnchor="end"
                            dominantBaseline="middle"
                        >
                            {pct}%
                        </text>
                    </g>
                ))}

                {/* Date Axis (approximate years) */}
                {[new Date('2026-01-01'), new Date('2027-01-01'), new Date('2028-01-01')].map(d => {
                    const x = xScale(d);
                    if (x >= padding.left && x <= width - padding.right) {
                        return (
                            <g key={d.toISOString()}>
                                <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom}
                                    stroke="var(--md-sys-color-outline-variant)" strokeOpacity="0.5" strokeDasharray="2 2" />
                                <text x={x} y={height - padding.bottom + 20} textAnchor="middle" fontSize="11" fill="var(--md-sys-color-on-surface-variant)">
                                    {d.getFullYear()}
                                </text>
                            </g>
                        );
                    }
                    return null;
                })}

                {/* Target line (expected progress) */}
                <path
                    d={targetPath}
                    fill="none"
                    stroke="var(--md-sys-color-outline)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                />

                {/* Actual progress line */}
                <path
                    d={actualPath}
                    fill="none"
                    stroke="var(--md-sys-color-primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Today marker */}
                {todayX >= padding.left && todayX <= width - padding.right && (
                    <g>
                        <line
                            x1={todayX}
                            y1={padding.top}
                            x2={todayX}
                            y2={height - padding.bottom}
                            stroke="var(--md-sys-color-tertiary)"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                        />
                        <text
                            x={todayX}
                            y={padding.top - 10}
                            fill="var(--md-sys-color-tertiary)"
                            fontSize="11"
                            fontWeight="600"
                            textAnchor="middle"
                        >
                            TODAY
                        </text>
                    </g>
                )}

                {/* Milestone dots and hover target */}
                {progressData.map((d, i) => (
                    <g key={i}>
                        {/* Target dot */}
                        <circle
                            cx={xScale(d.date)}
                            cy={yScale(d.targetPct)}
                            r="4"
                            fill="var(--md-sys-color-outline)"
                        />
                        {/* Actual dot */}
                        <circle
                            cx={xScale(d.date)}
                            cy={yScale(d.actualPct)}
                            r="6"
                            fill="var(--md-sys-color-primary)"
                            stroke="var(--md-sys-color-surface)"
                            strokeWidth="2"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredData({ ...d, x: rect.left, y: rect.top });
                            }}
                            onMouseLeave={() => setHoveredData(null)}
                        />
                    </g>
                ))}
            </svg>

            {/* Tooltip Overlay */}
            {hoveredData && (
                <div style={{
                    position: 'fixed',
                    left: hoveredData.x,
                    top: hoveredData.y - 120,
                    transform: 'translateX(-50%)',
                    background: 'var(--md-sys-color-inverse-surface)',
                    color: 'var(--md-sys-color-inverse-on-surface)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    fontSize: '0.8rem',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    minWidth: '150px'
                }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>{hoveredData.label}</div>
                    <div style={{ opacity: 0.9 }}>{hoveredData.date.toLocaleDateString()}</div>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Progress:</span>
                        <span style={{ fontWeight: 600 }}>{Math.round(hoveredData.actualPct)}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.8 }}>
                        <span>Target:</span>
                        <span>{Math.round(hoveredData.targetPct)}%</span>
                    </div>
                    <div style={{ marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '4px' }}>
                        {hoveredData.completed}/{hoveredData.total} papers
                    </div>
                    {/* Triangle pointer */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid var(--md-sys-color-inverse-surface)'
                    }} />
                </div>
            )}

            {/* Legend ... same as before */}
            <div style={{
                display: 'flex',
                gap: '24px',
                justifyContent: 'center',
                marginTop: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '24px',
                        height: '3px',
                        background: 'var(--md-sys-color-primary)',
                        borderRadius: '2px'
                    }} />
                    <span style={{ font: 'var(--md-sys-typescale-label-medium)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        Your Progress
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '24px',
                        height: '2px',
                        background: 'var(--md-sys-color-outline)',
                        borderRadius: '2px',
                        backgroundImage: 'repeating-linear-gradient(90deg, var(--md-sys-color-outline) 0 6px, transparent 6px 10px)'
                    }} />
                    <span style={{ font: 'var(--md-sys-typescale-label-medium)', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        Expected
                    </span>
                </div>
            </div>
        </div>
    );
};
