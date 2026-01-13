import React from 'react';
import { useStateContext } from '../context/StateContext';
import { PaperCard } from '../components/ui/PaperCard';

export const Home = () => {
    const { papers, trackerData, markComplete } = useStateContext();

    return (
        <div id="results-view" className="view-pane" style={{ overflowY: 'auto' }}>
            <div id="filter-stats-count" style={{ padding: '10px 0', margin: '0 auto', maxWidth: '1200px', fontSize: '1.1rem', fontWeight: 600, color: '#fbbf24', opacity: 0.9, textAlign: 'left' }}>
                Found {papers.length} papers
            </div>
            <div id="paper-list">
                {papers.map((paper, idx) => {
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
            </div>
        </div>
    );
};
