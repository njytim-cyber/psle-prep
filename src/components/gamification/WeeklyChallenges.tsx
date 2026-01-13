import React, { useMemo } from 'react';
import { Flame, Trophy, Target, Zap } from 'lucide-react';

interface WeeklyChallengesProps {
    totalCompleted: number;
    weeklyCompleted: number;
}

interface Challenge {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    icon: React.ReactNode;
    xpReward: number;
}

export const WeeklyChallenges: React.FC<WeeklyChallengesProps> = ({
    totalCompleted,
    weeklyCompleted
}) => {
    const challenges = useMemo<Challenge[]>(() => {
        // Calculate current week's progress
        return [
            {
                id: 'weekly-5',
                title: 'Warm Up',
                description: 'Complete 5 papers this week',
                target: 5,
                current: Math.min(weeklyCompleted, 5),
                icon: <Target size={20} />,
                xpReward: 50
            },
            {
                id: 'weekly-10',
                title: 'Getting Serious',
                description: 'Complete 10 papers this week',
                target: 10,
                current: Math.min(weeklyCompleted, 10),
                icon: <Flame size={20} />,
                xpReward: 100
            },
            {
                id: 'weekly-15',
                title: 'Power Week',
                description: 'Complete 15 papers this week',
                target: 15,
                current: Math.min(weeklyCompleted, 15),
                icon: <Zap size={20} />,
                xpReward: 200
            },
            {
                id: 'weekly-20',
                title: 'Champion',
                description: 'Complete 20 papers this week',
                target: 20,
                current: Math.min(weeklyCompleted, 20),
                icon: <Trophy size={20} />,
                xpReward: 500
            }
        ];
    }, [weeklyCompleted]);

    return (
        <div style={{
            background: 'var(--md-sys-color-surface-container)',
            borderRadius: 'var(--md-sys-shape-corner-extra-large)',
            padding: '20px'
        }}>
            <h3 style={{
                margin: '0 0 16px',
                font: 'var(--md-sys-typescale-title-medium)',
                color: 'var(--md-sys-color-on-surface)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                🎯 Weekly Challenges
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {challenges.map(challenge => {
                    const isComplete = challenge.current >= challenge.target;
                    const progress = (challenge.current / challenge.target) * 100;

                    return (
                        <div
                            key={challenge.id}
                            style={{
                                background: isComplete
                                    ? 'var(--md-sys-color-primary-container)'
                                    : 'var(--md-sys-color-surface-container-high)',
                                borderRadius: 'var(--md-sys-shape-corner-large)',
                                padding: '16px',
                                transition: 'all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard)'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '8px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: isComplete
                                            ? 'var(--md-sys-color-primary)'
                                            : 'var(--md-sys-color-surface-variant)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isComplete
                                            ? 'var(--md-sys-color-on-primary)'
                                            : 'var(--md-sys-color-on-surface-variant)'
                                    }}>
                                        {isComplete ? '✓' : challenge.icon}
                                    </div>
                                    <div>
                                        <div style={{
                                            font: 'var(--md-sys-typescale-label-large)',
                                            color: isComplete
                                                ? 'var(--md-sys-color-on-primary-container)'
                                                : 'var(--md-sys-color-on-surface)'
                                        }}>
                                            {challenge.title}
                                        </div>
                                        <div style={{
                                            font: 'var(--md-sys-typescale-body-small)',
                                            color: isComplete
                                                ? 'var(--md-sys-color-on-primary-container)'
                                                : 'var(--md-sys-color-on-surface-variant)',
                                            opacity: 0.8
                                        }}>
                                            {challenge.description}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    font: 'var(--md-sys-typescale-label-medium)',
                                    color: 'var(--md-sys-color-tertiary)',
                                    fontWeight: 600
                                }}>
                                    +{challenge.xpReward} XP
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div style={{
                                height: '6px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: 'var(--md-sys-shape-corner-full)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${progress}%`,
                                    height: '100%',
                                    background: isComplete
                                        ? 'var(--md-sys-color-primary)'
                                        : 'var(--md-sys-color-tertiary)',
                                    borderRadius: 'var(--md-sys-shape-corner-full)',
                                    transition: 'width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized)'
                                }} />
                            </div>

                            <div style={{
                                marginTop: '6px',
                                font: 'var(--md-sys-typescale-label-small)',
                                color: isComplete
                                    ? 'var(--md-sys-color-on-primary-container)'
                                    : 'var(--md-sys-color-on-surface-variant)',
                                textAlign: 'right',
                                opacity: 0.8
                            }}>
                                {challenge.current}/{challenge.target}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
