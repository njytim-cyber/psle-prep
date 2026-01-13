import React, { useMemo } from 'react';
import { useStateContext } from '../context/StateContext';
import { PaperCard } from '../components/ui/PaperCard';

export const Home = () => {
    const { papers, trackerData, markComplete, filters } = useStateContext();

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
        <div id="results-view" className="view-pane" style={{ overflowY: 'auto' }}>
            <div id="filter-stats-count" style={{ padding: '10px 0', margin: '0 auto', maxWidth: '1200px', fontSize: '1.1rem', fontWeight: 600, color: '#fbbf24', opacity: 0.9, textAlign: 'left' }}>
                Found {filteredPapers.length} papers {filters.subject.length > 0 && `in ${filters.subject.join(', ')}`}
            </div>
            <div id="paper-list">
                {filteredPapers.map((paper, idx) => {
                    const isCompleted = trackerData[paper.file_path]?.completed;
                    return (
                        <PaperCard
                            key={idx}
                            paper={paper}
                            completed={isCompleted}
                            onToggleComplete={() => markComplete(paper.file_path, !isCompleted)}
                        />
                    );
                })}
                {filteredPapers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
                        <h3>No papers found matching your filters.</h3>
                        <p>Try clearing some filters in the sidebar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
