import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';

const TIPS = [
    { emoji: '📚', text: "Practice makes perfect! Try to complete at least one paper today." },
    { emoji: '⏰', text: "Set a timer for 1 hour of focused practice - you'll be amazed!" },
    { emoji: '✍️', text: "Write down tricky questions to review later." },
    { emoji: '🎯', text: "Focus on your weakest topics first for maximum improvement." },
    { emoji: '😴', text: "Get enough sleep! A rested brain learns better." },
    { emoji: '💪', text: "Consistency beats intensity. Small daily progress adds up!" },
    { emoji: '🧠', text: "After solving, try explaining the answer to someone else." },
    { emoji: '📝', text: "Read questions twice before answering." },
    { emoji: '🔄', text: "Review your mistakes - they're your best teachers!" },
    { emoji: '🌟', text: "Believe in yourself! You've got this!" },
    { emoji: '🎮', text: "Take short breaks every 45 minutes to stay fresh." },
    { emoji: '📊', text: "Track your progress to see how far you've come!" },
];

const ENCOURAGEMENTS = [
    "You're doing great! 🌟",
    "Keep up the amazing work! 💪",
    "Future PSLE star! ⭐",
    "One step closer to success! 🚀",
    "Champions practice every day! 🏆",
];

export const DailyTip: React.FC = () => {
    const [tipIndex, setTipIndex] = useState(0);
    const [encouragement, setEncouragement] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Use date to get a consistent "daily" tip
        const today = new Date().toDateString();
        const hash = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        setTipIndex(hash % TIPS.length);
        setEncouragement(ENCOURAGEMENTS[hash % ENCOURAGEMENTS.length]);
    }, []);

    const refreshTip = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setTipIndex(prev => (prev + 1) % TIPS.length);
            setIsAnimating(false);
        }, 200);
    };

    const tip = TIPS[tipIndex];

    return (
        <div style={{
            background: 'var(--md-sys-color-tertiary-container)',
            borderRadius: '24px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px',
                color: 'var(--md-sys-color-on-tertiary-container)'
            }}>
                <Lightbulb size={20} style={{ color: 'var(--md-sys-color-tertiary)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                    TIP OF THE DAY
                </span>
                <button
                    onClick={refreshTip}
                    style={{
                        marginLeft: 'auto',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--md-sys-color-tertiary)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        transition: 'transform 0.2s'
                    }}
                    title="Get another tip"
                >
                    <RefreshCw size={16} style={{
                        transform: isAnimating ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                    }} />
                </button>
            </div>

            <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                color: 'var(--md-sys-color-on-tertiary-container)',
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating ? 'translateY(10px)' : 'translateY(0)',
                transition: 'all 0.2s ease'
            }}>
                <span style={{ fontSize: '1.5rem' }}>{tip.emoji}</span>
                <p style={{ margin: 0, lineHeight: 1.5, fontSize: '0.95rem' }}>
                    {tip.text}
                </p>
            </div>

            <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.85rem',
                color: 'var(--md-sys-color-tertiary)',
                fontWeight: 600
            }}>
                {encouragement}
            </div>
        </div>
    );
};
