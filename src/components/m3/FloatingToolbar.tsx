import React from 'react';
import { ZoomIn, ZoomOut, Bookmark, StickyNote, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FloatingToolbarProps {
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onBookmark?: () => void;
    onNotes?: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
    onZoomIn,
    onZoomOut,
    onBookmark,
    onNotes
}) => {
    const navigate = useNavigate();

    const tools = [
        { icon: <ChevronLeft size={20} />, onClick: () => navigate(-1), label: 'Back' },
        { icon: <ZoomOut size={20} />, onClick: onZoomOut, label: 'Zoom Out' },
        { icon: <ZoomIn size={20} />, onClick: onZoomIn, label: 'Zoom In' },
        { icon: <Bookmark size={20} />, onClick: onBookmark, label: 'Bookmark' },
        { icon: <StickyNote size={20} />, onClick: onNotes, label: 'Notes' },
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
            padding: '8px',
            background: 'var(--md-sys-color-surface-container-high)',
            borderRadius: 'var(--md-sys-shape-corner-extra-large)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            zIndex: 100
        }}>
            {tools.map((tool, idx) => (
                <button
                    key={idx}
                    onClick={tool.onClick}
                    title={tool.label}
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--md-sys-shape-corner-large)',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--md-sys-color-on-surface)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--md-sys-color-surface-container-highest)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    {tool.icon}
                </button>
            ))}
        </div>
    );
};
