import React from 'react';

interface XpModalProps {
    isOpen: boolean;
    onClose: () => void;
    xpStats: {
        overall: { lvl: number; progress: number; pct: number };
    };
}

export const XpModal: React.FC<XpModalProps> = ({
    isOpen,
    onClose,
    xpStats
}) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.7)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--md-sys-color-surface-container)',
                    padding: '24px',
                    borderRadius: '24px',
                    maxWidth: '400px',
                    width: '90%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    border: '1px solid var(--md-sys-color-outline-variant)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <h2 style={{ marginTop: 0, color: 'var(--md-sys-color-on-surface)' }}>XP System</h2>
                <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    <p>Earn XP by completing papers to level up your avatar!</p>

                    <h4 style={{ margin: '16px 0 8px', color: 'var(--md-sys-color-tertiary)' }}>Rewards</h4>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li><strong>120 XP</strong> - Prelim / Final Exam</li>
                        <li><strong>100 XP</strong> - SA1 / SA2</li>
                        <li><strong>50 XP</strong> - WA / CA</li>
                        <li><strong>30 XP</strong> - Practice Papers</li>
                    </ul>

                    <h4 style={{ margin: '16px 0 8px', color: 'var(--md-sys-color-tertiary)' }}>Bonuses</h4>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li><strong>1.5x XP</strong> - Complete 2 papers of the same subject in one day!</li>
                    </ul>

                    <div style={{
                        marginTop: '20px',
                        padding: '12px',
                        background: 'var(--md-sys-color-secondary-container)',
                        borderRadius: '12px',
                        color: 'var(--md-sys-color-on-secondary-container)'
                    }}>
                        <strong>Current Level:</strong> {xpStats.overall.lvl}<br />
                        <strong>Progress:</strong> {Math.round(xpStats.overall.progress)} / 500 XP
                    </div>
                </div>

                <button
                    style={{
                        marginTop: '20px',
                        padding: '10px',
                        background: 'var(--md-sys-color-primary)',
                        border: 'none',
                        color: 'var(--md-sys-color-on-primary)',
                        borderRadius: '100px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                    onClick={onClose}
                >
                    Got it!
                </button>
            </div>
        </div>
    );
};
