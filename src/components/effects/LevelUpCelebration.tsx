import React, { useEffect, useState } from 'react';

interface LevelUpCelebrationProps {
    show: boolean;
    newLevel: number;
    onClose: () => void;
}

const LEVEL_TITLES = [
    "Novice Scholar", "Paper Chaser", "Book Worm", "Smart Cookie", "Question Seeker",
    "Answer Finder", "Math Explorer", "Problem Solver", "Deep Thinker", "Bronze Brain",
    "Logic Learner", "Concept Keeper", "Formula Fan", "Equation Expert", "Syllabus Surfer",
    "Silver Scholar", "Distinction Dreamer", "High Achiever", "Top Scorer", "Gold Genius",
    "Platinum Pro", "Math Wizard", "Calculation King", "Logic Lord", "Diamond Mind",
    "Master Mind", "Grandmaster", "Legend", "Mythic Scholar", "Divine Mathematician"
];

export const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({ show, newLevel, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
        }
    }, [show]);

    if (!isVisible) return null;

    const title = LEVEL_TITLES[Math.min(newLevel - 1, LEVEL_TITLES.length - 1)] || "Scholar";

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.85)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fadeIn 0.3s ease'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    textAlign: 'center',
                    animation: 'levelUpBounce 0.6s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    fontSize: '6rem',
                    marginBottom: '20px',
                    animation: 'trophyFloat 2s ease-in-out infinite'
                }}>
                    🏆
                </div>
                <div style={{
                    fontSize: '1.2rem',
                    color: 'var(--md-sys-color-tertiary)',
                    fontWeight: 600,
                    letterSpacing: '4px',
                    marginBottom: '10px'
                }}>
                    LEVEL UP!
                </div>
                <div style={{
                    fontSize: '4rem',
                    fontWeight: 800,
                    color: 'var(--md-sys-color-primary)',
                    marginBottom: '10px'
                }}>
                    Level {newLevel}
                </div>
                <div style={{
                    fontSize: '1.5rem',
                    color: 'var(--md-sys-color-on-surface)',
                    opacity: 0.9,
                    marginBottom: '30px'
                }}>
                    {title}
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'var(--md-sys-color-primary)',
                        color: 'var(--md-sys-color-on-primary)',
                        border: 'none',
                        padding: '14px 40px',
                        borderRadius: '100px',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}
                >
                    Continue 🚀
                </button>
            </div>

            <style>{`
                @keyframes levelUpBounce {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes trophyFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};
