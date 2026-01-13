import React from 'react';
import { Award, CheckCircle, BookOpen, Star, Zap, Target, Trophy, Medal } from 'lucide-react';

interface Badge {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    earned: boolean;
}

interface MilestoneBadgesProps {
    totalCompleted: number;
    subjectCounts: Record<string, number>;
}

export const MilestoneBadges: React.FC<MilestoneBadgesProps> = ({ totalCompleted, subjectCounts }) => {
    const badges: Badge[] = [
        {
            id: 'first-paper',
            title: 'First Steps',
            description: 'Complete your first paper',
            icon: <BookOpen size={24} />,
            color: 'var(--md-sys-color-primary)',
            earned: totalCompleted >= 1
        },
        {
            id: 'starter',
            title: 'Starter',
            description: 'Complete 5 papers',
            icon: <Star size={24} />,
            color: 'var(--md-sys-color-secondary)',
            earned: totalCompleted >= 5
        },
        {
            id: 'dedicated',
            title: 'Dedicated',
            description: 'Complete 10 papers',
            icon: <Target size={24} />,
            color: 'var(--md-sys-color-tertiary)',
            earned: totalCompleted >= 10
        },
        {
            id: 'committed',
            title: 'Committed',
            description: 'Complete 25 papers',
            icon: <Zap size={24} />,
            color: '#FFD700',
            earned: totalCompleted >= 25
        },
        {
            id: 'champion',
            title: 'Champion',
            description: 'Complete 50 papers',
            icon: <Trophy size={24} />,
            color: '#FF6B6B',
            earned: totalCompleted >= 50
        },
        {
            id: 'legend',
            title: 'Legend',
            description: 'Complete 100 papers',
            icon: <Medal size={24} />,
            color: '#A78BFA',
            earned: totalCompleted >= 100
        },
        {
            id: 'math-master',
            title: 'Math Master',
            description: 'Complete 20 Maths papers',
            icon: <Award size={24} />,
            color: '#4ECDC4',
            earned: (subjectCounts['Maths'] || 0) >= 20
        },
        {
            id: 'all-rounder',
            title: 'All-Rounder',
            description: 'Complete papers in all subjects',
            icon: <CheckCircle size={24} />,
            color: '#60D297',
            earned: Object.values(subjectCounts).filter(c => c > 0).length >= 3
        }
    ];

    const earnedBadges = badges.filter(b => b.earned);
    const unearnedBadges = badges.filter(b => !b.earned);

    return (
        <div>
            {earnedBadges.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--md-sys-color-tertiary)',
                        marginBottom: '16px',
                        letterSpacing: '0.5px'
                    }}>
                        🏆 EARNED ({earnedBadges.length})
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {earnedBadges.map(badge => (
                            <div
                                key={badge.id}
                                style={{
                                    background: 'var(--md-sys-color-surface-container-high)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    border: `2px solid ${badge.color}`,
                                    minWidth: '200px'
                                }}
                                title={badge.description}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: badge.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    {badge.icon}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{badge.title}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{badge.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {unearnedBadges.length > 0 && (
                <div>
                    <h3 style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--md-sys-color-on-surface-variant)',
                        marginBottom: '16px',
                        opacity: 0.7,
                        letterSpacing: '0.5px'
                    }}>
                        🔒 LOCKED ({unearnedBadges.length})
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {unearnedBadges.map(badge => (
                            <div
                                key={badge.id}
                                style={{
                                    background: 'var(--md-sys-color-surface-container)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    opacity: 0.5,
                                    minWidth: '200px',
                                    filter: 'grayscale(100%)'
                                }}
                                title={badge.description}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'var(--md-sys-color-surface-variant)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--md-sys-color-on-surface-variant)'
                                }}>
                                    {badge.icon}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{badge.title}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{badge.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
