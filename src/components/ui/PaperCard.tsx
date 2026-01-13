import React from 'react';
import { Paper } from '../../context/StateContext';
import { useNavigate } from 'react-router-dom';

interface PaperCardProps {
    paper: Paper;
    completed?: boolean;
    onToggleComplete?: (e: React.MouseEvent) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, completed, onToggleComplete }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // Navigate to PDF view
        // encode URL or use ID if available. 
        // Using encodeURIComponent on the relative file path as ID for now
        const paperId = encodeURIComponent(paper.file_path);
        navigate(`/paper/${paperId}`);
    };

    return (
        <div className={`paper-card ${completed ? 'completed' : ''}`} onClick={handleClick}>
            <div style={{ flex: 1 }}>
                <div className="paper-title">{paper.title}</div>
                <div className="badges">
                    <span className="badge bg-level">{paper.level}</span>
                    <span className="badge bg-school">{paper.school}</span>
                    <span className="badge bg-year">{paper.year}</span>
                    <span className="badge bg-term">{paper.term}</span>
                    <span className="badge bg-subject">{paper.subject}</span>
                </div>
            </div>
            <button
                className="check-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete && onToggleComplete(e);
                }}
            >
                <span className="checked-icon">✓</span>
            </button>
        </div>
    );
};
