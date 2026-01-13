import React, { useMemo } from 'react';
import { useStateContext } from '../context/StateContext';
import { useAuth } from '../context/AuthContext';
import { PomodoroTimer } from '../components/study/PomodoroTimer';
import { WeeklyChallenges } from '../components/gamification/WeeklyChallenges';
import { Leaderboard } from '../components/gamification/Leaderboard';
import { SeasonalEvents } from '../components/gamification/SeasonalEvents';
import { ShareButton } from '../components/social/ShareButton';
import { StreakCounter } from '../components/ui/StreakCounter';
import { useToast } from '../components/effects/Toast';

export const StudyHub = () => {
    const { trackerData, xpStats, totalCompleted, userAvatar, papers } = useStateContext();
    const { user } = useAuth();
    const { showToast } = useToast();

    // Calculate weekly completed (papers completed in last 7 days)
    const weeklyCompleted = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        return Object.values(trackerData).filter(item => {
            if (!item.completed || !item.date) return false;
            const completedDate = new Date(item.date);
            return completedDate >= oneWeekAgo;
        }).length;
    }, [trackerData]);

    // Calculate streak (consecutive days with completions)
    const streak = useMemo(() => {
        const completedDates = new Set(
            Object.values(trackerData)
                .filter(item => item.completed && item.date)
                .map(item => new Date(item.date!).toDateString())
        );

        let count = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);

            if (completedDates.has(checkDate.toDateString())) {
                count++;
            } else if (i > 0) {
                break;
            }
        }

        return count;
    }, [trackerData]);

    const handlePomodoroComplete = () => {
        showToast('Pomodoro complete! Take a break 🍅', '⏰', 'success');
    };

    return (
        <div id="study-hub-view" className="view-pane view-enter" style={{
            overflowY: 'auto',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <div>
                        <h1 style={{
                            margin: 0,
                            font: 'var(--md-sys-typescale-headline-large)',
                            color: 'var(--md-sys-color-on-surface)'
                        }}>
                            Study Hub
                        </h1>
                        <p style={{
                            margin: '4px 0 0',
                            font: 'var(--md-sys-typescale-body-medium)',
                            color: 'var(--md-sys-color-on-surface-variant)'
                        }}>
                            Your focus zone, challenges & achievements
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <StreakCounter streak={streak} />
                        <ShareButton
                            totalCompleted={totalCompleted}
                            level={xpStats.overall.lvl}
                            streak={streak}
                        />
                    </div>
                </div>

                {/* Main Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '24px'
                }}>
                    {/* Pomodoro Timer */}
                    <div>
                        <PomodoroTimer onSessionComplete={handlePomodoroComplete} />
                    </div>

                    {/* Weekly Challenges */}
                    <div>
                        <WeeklyChallenges
                            totalCompleted={totalCompleted}
                            weeklyCompleted={weeklyCompleted}
                        />
                    </div>

                    {/* Leaderboard */}
                    <div>
                        <Leaderboard
                            currentUserName={user?.displayName || 'You'}
                            currentUserAvatar={userAvatar || 'Felix'}
                            currentUserPapers={totalCompleted}
                            currentUserXp={xpStats.overall.lvl * 500 + Math.round(xpStats.overall.progress)}
                        />
                    </div>

                    {/* Seasonal Events */}
                    <div>
                        <SeasonalEvents />
                    </div>
                </div>

                {/* Keyboard Shortcut Hint */}
                <div style={{
                    marginTop: '32px',
                    textAlign: 'center',
                    font: 'var(--md-sys-typescale-body-small)',
                    color: 'var(--md-sys-color-on-surface-variant)'
                }}>
                    Press <kbd style={{
                        background: 'var(--md-sys-color-surface-variant)',
                        padding: '2px 8px',
                        borderRadius: 'var(--md-sys-shape-corner-small)',
                        fontFamily: 'monospace'
                    }}>?</kbd> for keyboard shortcuts
                </div>
            </div>
        </div>
    );
};
