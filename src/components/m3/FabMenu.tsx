import React, { useState } from 'react';
import { Plus, X, Timer, Share2, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FabAction {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color?: string;
}

export const FabMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const actions: FabAction[] = [
        {
            icon: <Timer size={20} />,
            label: 'Start Timer',
            onClick: () => navigate('/study')
        },
        {
            icon: <BarChart2 size={20} />,
            label: 'Analytics',
            onClick: () => navigate('/analytics')
        },
        {
            icon: <Share2 size={20} />,
            label: 'Share',
            onClick: () => {
                if (navigator.share) {
                    navigator.share({ title: 'PSLE Prep', url: window.location.origin });
                }
            }
        },
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column-reverse',
            alignItems: 'center',
            gap: '12px'
        }}>
            {/* Action buttons */}
            {isOpen && actions.map((action, idx) => (
                <button
                    key={idx}
                    onClick={() => { action.onClick(); setIsOpen(false); }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 20px',
                        background: 'var(--md-sys-color-surface-container-high)',
                        color: 'var(--md-sys-color-on-surface)',
                        border: 'none',
                        borderRadius: 'var(--md-sys-shape-corner-full)',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        animation: `fabSlideIn var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate) ${idx * 50}ms both`,
                        font: 'var(--md-sys-typescale-label-large)'
                    }}
                >
                    {action.icon}
                    {action.label}
                </button>
            ))}

            {/* Main FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--md-sys-shape-corner-large)',
                    border: 'none',
                    background: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                    transition: 'transform var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard)',
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
                }}
            >
                {isOpen ? <X size={24} /> : <Plus size={24} />}
            </button>

            <style>{`
                @keyframes fabSlideIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};
