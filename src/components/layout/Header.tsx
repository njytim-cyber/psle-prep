import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';
import { ShareButton } from '../social/ShareButton';

const CompactPomodoro = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<number | null>(null);

    const WORK_TIME = 25 * 60;

    // Simple format MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleComplete = useCallback(() => {
        setIsRunning(false);
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Session Complete! 🍅', { body: 'Take a break!' });
        }
        // Beep or sound?
    }, []);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = window.setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleComplete();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timeLeft, handleComplete]);

    const toggleTimer = () => {
        if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(WORK_TIME);
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--md-sys-color-surface-container-high)',
            padding: '8px 16px',
            borderRadius: 'var(--md-sys-shape-corner-full)',
            border: '1px solid var(--md-sys-color-outline-variant)'
        }}>
            <div style={{
                fontFamily: 'monospace',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: 'var(--md-sys-color-on-surface)',
                minWidth: '60px',
                textAlign: 'center'
            }}>
                {formatTime(timeLeft)}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={toggleTimer}
                    style={{
                        background: isRunning ? 'var(--md-sys-color-tertiary)' : 'var(--md-sys-color-primary)',
                        color: isRunning ? 'var(--md-sys-color-on-tertiary)' : 'var(--md-sys-color-on-primary)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                    title={isRunning ? "Pause" : "Start"}
                >
                    {isRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                    onClick={resetTimer}
                    style={{
                        background: 'transparent',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                    title="Reset"
                >
                    <RotateCcw size={16} />
                </button>
            </div>
        </div>
    );
};

import { useStateContext } from '../../context/StateContext';

export const Header = () => {
    const { totalCompleted, xpStats, trackerData } = useStateContext();

    // Calculate current streak (simplified logic for now, or just pass 0 if not tracked yet)
    // Assuming streak is not fully implemented in context yet, passing 0 or mock.
    // Actually, let's try to calculate simple streak or just leave it optional/0.
    const streak = 0;

    return (
        <div style={{
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '16px',
            background: 'var(--md-sys-color-surface)',
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
            zIndex: 10,
            position: 'sticky',
            top: 0
        }}>
            <CompactPomodoro />
            <div style={{ width: '1px', height: '24px', background: 'var(--md-sys-color-outline-variant)' }}></div>
            <ShareButton
                totalCompleted={totalCompleted}
                level={Math.floor(xpStats.overall.lvl)}
                streak={streak}
            />
        </div>
    );
};
