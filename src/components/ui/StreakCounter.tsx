import React from 'react';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
    streak: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ streak }) => {
    if (streak < 2) return null;

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--md-sys-color-error-container)',
            color: 'var(--md-sys-color-on-error-container)',
            padding: '6px 12px',
            borderRadius: '100px',
            fontSize: '0.85rem',
            fontWeight: 600
        }}>
            <Flame
                size={18}
                style={{
                    color: 'var(--md-sys-color-error)',
                    animation: 'flameFlicker 0.5s ease-in-out infinite alternate'
                }}
            />
            <span>{streak} day streak!</span>
            <style>{`
                @keyframes flameFlicker {
                    0% { transform: scale(1) rotate(-5deg); }
                    100% { transform: scale(1.1) rotate(5deg); }
                }
            `}</style>
        </div>
    );
};
