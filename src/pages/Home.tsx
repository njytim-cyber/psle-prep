import React, { useMemo, useState, useCallback } from 'react';
import { useStateContext } from '../context/StateContext';
import { PaperCard } from '../components/ui/PaperCard';
import { DailyTip } from '../components/ui/DailyTip';
import { Confetti } from '../components/effects/Confetti';
import { GridSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/effects/Toast';
import { FabMenu } from '../components/m3/FabMenu';

const ENCOURAGEMENTS = [
    "Great job! 🎉",
    "You're on fire! 🔥",
    "Keep it up! 💪",
    "Excellent work! ⭐",
    "One step closer! 🚀",
    "Amazing progress! 🌟",
];

export const Home = () => {
    const { papers, trackerData, markComplete, filters, loadingData, papersLoading, papersError } = useStateContext();
    const { showToast } = useToast();
    const [showConfetti, setShowConfetti] = useState(false);

    const handleComplete = useCallback((paperId: string, isCompleted: boolean) => {
        markComplete(paperId, isCompleted);
        if (isCompleted) {
            setShowConfetti(true);
            const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
            showToast(msg, '🎯', 'celebration');
        }
    }, [markComplete, showToast]);

    const filteredPapers = useMemo(() => {
        return papers.filter(p => {
            // Subject Filter
            if (filters.subject.length > 0 && !filters.subject.includes(p.subject || 'Maths')) {
                return false;
            }
            // Term Filter
            if (filters.term.length > 0 && !filters.term.includes(p.term)) {
                return false;
            }
            // Level Filter
            if (filters.level.length > 0 && !filters.level.includes(p.level || 'P4')) {
                return false;
            }
            // Year Filter
            if (filters.year.length > 0 && !filters.year.includes(p.year)) {
                return false;
            }
            // School Filter
            if (filters.school.length > 0 && !filters.school.includes(p.school)) {
                return false;
            }
            return true;
        }).sort((a, b) => {
            // Basic Sorting
            if (filters.sort === 'year_desc') return b.year - a.year;
            if (filters.sort === 'year_asc') return a.year - b.year;
            if (filters.sort === 'school') return a.school.localeCompare(b.school);
            return 0;
        });
    }, [papers, filters]);

    return (
        <div id="results-view" className="view-pane view-enter" style={{ overflowY: 'auto', padding: '20px' }}>
            <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Daily Tip */}
                <div style={{ marginBottom: '24px' }}>
                    <DailyTip />
                </div>

                {/* Paper Count */}
                <div style={{
                    fontSize: 'var(--md-sys-typescale-title-medium)',
                    fontWeight: 600,
                    color: 'var(--md-sys-color-tertiary)',
                    marginBottom: '16px'
                }}>
                    Found {filteredPapers.length} papers
                </div>

                {/* Paper List with Loading State */}
                {loadingData || papersLoading ? (
                    <GridSkeleton count={6} />
                ) : papersError ? (
                    <div style={{ textAlign: 'center', color: 'red', marginTop: '40px' }}>
                        <h3>Error loading papers</h3>
                        <p>{papersError}</p>
                    </div>
                ) : (
                    <div id="paper-list" style={{ maxWidth: '1000px', paddingBottom: '40px' }}>
                        {filteredPapers.map((paper) => {
                            const isCompleted = trackerData[paper.file_path]?.completed;
                            return (
                                <PaperCard
                                    key={paper.file_path}
                                    paper={paper}
                                    completed={isCompleted}
                                    onToggleComplete={() => handleComplete(paper.file_path, !isCompleted)}
                                />
                            );
                        })}
                        {filteredPapers.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                color: 'var(--md-sys-color-on-surface-variant)'
                            }}>
                                <h3 style={{ font: 'var(--md-sys-typescale-headline-small)' }}>
                                    No papers found matching your filters.
                                </h3>
                                <p style={{ font: 'var(--md-sys-typescale-body-medium)' }}>
                                    Try clearing some filters in the sidebar.
                                </p>
                                <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '10px' }}>
                                    (Debug: {papers.length} total papers loaded. Active filters: {JSON.stringify(filters).length})
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <FabMenu />
        </div>
    );
};

