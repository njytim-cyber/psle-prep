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
        const paperId = encodeURIComponent(paper.file_path);
        navigate(`/paper/${paperId}`);
    };

    return (
        <div
            onClick={handleClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--md-sys-color-surface-container)',
                marginBottom: '8px',
                borderRadius: '8px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                cursor: 'pointer',
                transition: 'background 0.2s',
                width: '100%',
                boxSizing: 'border-box'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--md-sys-color-surface-container)'}
        >
            {/* Left Info */}
            <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: completed ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-surface)',
                    marginBottom: '4px',
                    textDecoration: completed ? 'line-through' : 'none',
                    opacity: completed ? 0.7 : 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {paper.title}
                </div>

                {/* Minimal Meta Data */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', overflow: 'hidden', fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--md-sys-color-primary)', whiteSpace: 'nowrap' }}>{paper.school}</span>
                    <span>•</span>
                    <span style={{ whiteSpace: 'nowrap' }}>{paper.year}</span>
                    <span>•</span>
                    <span style={{
                        display: 'inline-block',
                        padding: '0 4px',
                        borderRadius: '4px',
                        background: 'var(--md-sys-color-secondary-container)',
                        color: 'var(--md-sys-color-on-secondary-container)',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}>
                        {paper.term}
                    </span>
                    <span>•</span>
                    <span>{paper.subject || 'Maths'}</span>
                </div>
            </div>

            {/* Right Action */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete?.(e);
                }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: completed ? 'var(--md-sys-color-primary)' : 'transparent',
                    border: `2px solid ${completed ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
                    color: completed ? 'var(--md-sys-color-on-primary)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                title={completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
                {completed && <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>✓</span>}
            </div>
        </div>
    );
};
