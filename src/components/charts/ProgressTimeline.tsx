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
    const today = new Date();
    const firstDate = milestones[0]?.date || today;
    const lastDate = milestones[milestones.length - 1]?.date || today;
    const totalDuration = lastDate.getTime() - firstDate.getTime();
    const todayPosition = totalDuration > 0
        ? Math.min(100, Math.max(0, ((today.getTime() - firstDate.getTime()) / totalDuration) * 100))
        : 0;

    // Chart dimensions
    const width = 800;
    const height = 300;
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Scale functions
    const xScale = (idx: number) => padding.left + (idx / (progressData.length - 1)) * chartWidth;
    const yScale = (pct: number) => padding.top + chartHeight - (pct / 100) * chartHeight;

    // Build SVG paths
    const targetPath = progressData.map((d, i) =>
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.targetPct)}`
    ).join(' ');

    const actualPath = progressData.map((d, i) =>
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.actualPct)}`
    ).join(' ');

    // Calculate overall progress
    const overallProgress = useMemo(() => {
        const totalPapers = papers.filter(p => ['P4', 'P5', 'P6'].includes(p.level || 'P4')).length;
        const completedPapers = papers.filter(p =>
            ['P4', 'P5', 'P6'].includes(p.level || 'P4') && trackerData[p.file_path]?.completed
        ).length;
        return totalPapers > 0 ? (completedPapers / totalPapers) * 100 : 0;
    }, [papers, trackerData]);

    const todayX = padding.left + (todayPosition / 100) * chartWidth;

    return (
        <div style={{
            background: 'var(--md-sys-color-surface-container)',
            borderRadius: 'var(--md-sys-shape-corner-extra-large)',
            padding: '24px',
            overflow: 'hidden'
        }}>
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
                        Progress towards 100% completion
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

                {/* Milestone dots and labels */}
                {progressData.map((d, i) => (
                    <g key={i}>
                        {/* Target dot */}
                        <circle
                            cx={xScale(i)}
                            cy={yScale(d.targetPct)}
                            r="4"
                            fill="var(--md-sys-color-outline)"
                        />
                        {/* Actual dot */}
                        <circle
                            cx={xScale(i)}
                            cy={yScale(d.actualPct)}
                            r="6"
                            fill="var(--md-sys-color-primary)"
                            stroke="var(--md-sys-color-surface)"
                            strokeWidth="2"
                        />
                        {/* Label */}
                        <text
                            x={xScale(i)}
                            y={height - padding.bottom + 20}
                            fill="var(--md-sys-color-on-surface-variant)"
                            fontSize="11"
                            textAnchor="middle"
                            transform={`rotate(-30, ${xScale(i)}, ${height - padding.bottom + 20})`}
                        >
                            {d.label}
                        </text>
                    </g>
                ))}

                {/* Today marker */}
                <line
                    x1={todayX}
                    y1={padding.top}
                    x2={todayX}
                    y2={height - padding.bottom}
                    stroke="var(--md-sys-color-tertiary)"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                />
                <rect
                    x={todayX - 28}
                    y={padding.top - 25}
                    width="56"
                    height="20"
                    rx="10"
                    fill="var(--md-sys-color-tertiary)"
                />
                <text
                    x={todayX}
                    y={padding.top - 12}
                    fill="var(--md-sys-color-on-tertiary)"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                >
                    TODAY
                </text>
            </svg>

            {/* Legend */}
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
