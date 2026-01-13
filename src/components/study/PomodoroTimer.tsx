import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';

type TimerMode = 'work' | 'break';

interface PomodoroTimerProps {
    onSessionComplete?: () => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onSessionComplete }) => {
    const [mode, setMode] = useState<TimerMode>('work');
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [isRunning, setIsRunning] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const intervalRef = useRef<number | null>(null);

    const WORK_TIME = 25 * 60; // 25 minutes
    const BREAK_TIME = 5 * 60; // 5 minutes
    const LONG_BREAK_TIME = 15 * 60; // 15 minutes after 4 sessions

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = mode === 'work'
        ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
        : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

    const handleComplete = useCallback(() => {
        setIsRunning(false);

        if (mode === 'work') {
            const newSessions = sessionsCompleted + 1;
            setSessionsCompleted(newSessions);
            onSessionComplete?.();

            // Every 4 sessions, long break
            const breakTime = newSessions % 4 === 0 ? LONG_BREAK_TIME : BREAK_TIME;
            setMode('break');
            setTimeLeft(breakTime);

            // Notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Pomodoro Complete! 🍅', {
                    body: 'Time for a break!',
                    icon: '/favicon.ico'
                });
            }
        } else {
            setMode('work');
            setTimeLeft(WORK_TIME);

            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Break Over! 📚', {
                    body: 'Ready to focus again?',
                    icon: '/favicon.ico'
                });
            }
        }
    }, [mode, sessionsCompleted, onSessionComplete]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = window.setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleComplete();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
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
        setTimeLeft(mode === 'work' ? WORK_TIME : BREAK_TIME);
    };

    const switchMode = (newMode: TimerMode) => {
        setIsRunning(false);
        setMode(newMode);
        setTimeLeft(newMode === 'work' ? WORK_TIME : BREAK_TIME);
    };

    return (
        <div style={{
            background: mode === 'work'
                ? 'var(--md-sys-color-primary-container)'
                : 'var(--md-sys-color-tertiary-container)',
            borderRadius: 'var(--md-sys-shape-corner-extra-large)',
            padding: '24px',
            textAlign: 'center',
            transition: 'background var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard)'
        }}>
            {/* Mode Toggle */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '20px'
            }}>
                <button
                    onClick={() => switchMode('work')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: 'var(--md-sys-shape-corner-full)',
                        border: 'none',
                        background: mode === 'work'
                            ? 'var(--md-sys-color-primary)'
                            : 'transparent',
                        color: mode === 'work'
                            ? 'var(--md-sys-color-on-primary)'
                            : 'var(--md-sys-color-on-primary-container)',
                        font: 'var(--md-sys-typescale-label-large)',
                        cursor: 'pointer',
                        transition: 'all var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard)'
                    }}
                >
                    <BookOpen size={16} /> Focus
                </button>
                <button
                    onClick={() => switchMode('break')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: 'var(--md-sys-shape-corner-full)',
                        border: 'none',
                        background: mode === 'break'
                            ? 'var(--md-sys-color-tertiary)'
                            : 'transparent',
                        color: mode === 'break'
                            ? 'var(--md-sys-color-on-tertiary)'
                            : 'var(--md-sys-color-on-tertiary-container)',
                        font: 'var(--md-sys-typescale-label-large)',
                        cursor: 'pointer',
                        transition: 'all var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard)'
                    }}
                >
                    <Coffee size={16} /> Break
                </button>
            </div>

            {/* Timer Display */}
            <div style={{
                font: 'var(--md-sys-typescale-display-large)',
                fontWeight: 700,
                color: mode === 'work'
                    ? 'var(--md-sys-color-on-primary-container)'
                    : 'var(--md-sys-color-on-tertiary-container)',
                marginBottom: '16px',
                fontFamily: 'monospace'
            }}>
                {formatTime(timeLeft)}
            </div>

            {/* Progress Bar */}
            <div style={{
                height: '6px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                overflow: 'hidden',
                marginBottom: '20px'
            }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: mode === 'work'
                        ? 'var(--md-sys-color-primary)'
                        : 'var(--md-sys-color-tertiary)',
                    borderRadius: 'var(--md-sys-shape-corner-full)',
                    transition: 'width 1s linear'
                }} />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                    onClick={toggleTimer}
                    style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        border: 'none',
                        background: mode === 'work'
                            ? 'var(--md-sys-color-primary)'
                            : 'var(--md-sys-color-tertiary)',
                        color: mode === 'work'
                            ? 'var(--md-sys-color-on-primary)'
                            : 'var(--md-sys-color-on-tertiary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard)'
                    }}
                >
                    {isRunning ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                    onClick={resetTimer}
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(255,255,255,0.2)',
                        color: mode === 'work'
                            ? 'var(--md-sys-color-on-primary-container)'
                            : 'var(--md-sys-color-on-tertiary-container)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <RotateCcw size={18} />
                </button>
            </div>

            {/* Session Counter */}
            <div style={{
                marginTop: '16px',
                font: 'var(--md-sys-typescale-label-medium)',
                color: mode === 'work'
                    ? 'var(--md-sys-color-on-primary-container)'
                    : 'var(--md-sys-color-on-tertiary-container)',
                opacity: 0.8
            }}>
                🍅 {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed
            </div>
        </div>
    );
};
