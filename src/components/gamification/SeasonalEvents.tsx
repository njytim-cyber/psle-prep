import React, { useMemo } from 'react';
import { Snowflake, Sun, Flame, Gift, Calendar } from 'lucide-react';

interface SeasonalEvent {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    startDate: Date;
    endDate: Date;
    bonusXp: number;
    badgeColor: string;
}

interface SeasonalEventsProps {
    currentDate?: Date;
}

export const SeasonalEvents: React.FC<SeasonalEventsProps> = ({
    currentDate = new Date()
}) => {
    const events = useMemo<SeasonalEvent[]>(() => {
        const year = currentDate.getFullYear();
        return [
            {
                id: 'new-year',
                name: 'New Year Sprint',
                description: 'Start the year strong! 2x XP on all papers',
                icon: <Gift size={24} />,
                startDate: new Date(year, 0, 1),
                endDate: new Date(year, 0, 15),
                bonusXp: 2,
                badgeColor: '#FFD700'
            },
            {
                id: 'march-madness',
                name: 'March Madness',
                description: 'SA1 prep mode! Bonus XP for SA1 papers',
                icon: <Calendar size={24} />,
                startDate: new Date(year, 2, 1),
                endDate: new Date(year, 2, 31),
                bonusXp: 1.5,
                badgeColor: '#4ECDC4'
            },
            {
                id: 'summer-grind',
                name: 'Summer Grind',
                description: 'June holidays = study time! 1.5x XP',
                icon: <Sun size={24} />,
                startDate: new Date(year, 5, 1),
                endDate: new Date(year, 5, 30),
                bonusXp: 1.5,
                badgeColor: '#FF8C42'
            },
            {
                id: 'psle-crunch',
                name: 'PSLE Crunch',
                description: 'Final push! 3x XP on Prelim papers',
                icon: <Flame size={24} />,
                startDate: new Date(year, 8, 1),
                endDate: new Date(year, 9, 15),
                bonusXp: 3,
                badgeColor: '#FF6B6B'
            },
            {
                id: 'winter-review',
                name: 'Winter Review',
                description: 'Year-end revision with bonus XP',
                icon: <Snowflake size={24} />,
                startDate: new Date(year, 11, 1),
                endDate: new Date(year, 11, 31),
                bonusXp: 1.5,
                badgeColor: '#A78BFA'
            }
        ];
    }, [currentDate]);

    const activeEvent = events.find(e =>
        currentDate >= e.startDate && currentDate <= e.endDate
    );

    const upcomingEvents = events
        .filter(e => e.startDate > currentDate)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        .slice(0, 2);

    const formatDateRange = (start: Date, end: Date) => {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    };

    const daysUntil = (date: Date) => {
        const diff = date.getTime() - currentDate.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

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
                🎄 Seasonal Events
            </h3>

            {/* Active Event */}
            {activeEvent && (
                <div style={{
                    background: `linear-gradient(135deg, ${activeEvent.badgeColor}22, ${activeEvent.badgeColor}44)`,
                    border: `2px solid ${activeEvent.badgeColor}`,
                    borderRadius: 'var(--md-sys-shape-corner-large)',
                    padding: '20px',
                    marginBottom: '16px',
                    animation: 'pulse 2s ease-in-out infinite'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: activeEvent.badgeColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            {activeEvent.icon}
                        </div>
                        <div>
                            <div style={{
                                font: 'var(--md-sys-typescale-title-medium)',
                                color: 'var(--md-sys-color-on-surface)'
                            }}>
                                {activeEvent.name}
                            </div>
                            <div style={{
                                font: 'var(--md-sys-typescale-label-medium)',
                                color: activeEvent.badgeColor,
                                fontWeight: 600
                            }}>
                                🔥 ACTIVE NOW
                            </div>
                        </div>
                    </div>
                    <p style={{
                        margin: '0 0 8px',
                        font: 'var(--md-sys-typescale-body-medium)',
                        color: 'var(--md-sys-color-on-surface-variant)'
                    }}>
                        {activeEvent.description}
                    </p>
                    <div style={{
                        font: 'var(--md-sys-typescale-label-small)',
                        color: 'var(--md-sys-color-on-surface-variant)'
                    }}>
                        Ends {activeEvent.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                </div>
            )}

            {/* No Active Event */}
            {!activeEvent && (
                <div style={{
                    background: 'var(--md-sys-color-surface-container-high)',
                    borderRadius: 'var(--md-sys-shape-corner-large)',
                    padding: '20px',
                    marginBottom: '16px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        font: 'var(--md-sys-typescale-body-medium)',
                        color: 'var(--md-sys-color-on-surface-variant)'
                    }}>
                        No active event right now
                    </div>
                </div>
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
                <>
                    <div style={{
                        font: 'var(--md-sys-typescale-label-medium)',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        marginBottom: '8px'
                    }}>
                        Coming up:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {upcomingEvents.map(event => (
                            <div
                                key={event.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    background: 'var(--md-sys-color-surface-container-high)',
                                    borderRadius: 'var(--md-sys-shape-corner-medium)',
                                    opacity: 0.8
                                }}
                            >
                                <div style={{ color: event.badgeColor }}>
                                    {event.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ font: 'var(--md-sys-typescale-label-large)' }}>
                                        {event.name}
                                    </div>
                                    <div style={{
                                        font: 'var(--md-sys-typescale-body-small)',
                                        color: 'var(--md-sys-color-on-surface-variant)'
                                    }}>
                                        {formatDateRange(event.startDate, event.endDate)}
                                    </div>
                                </div>
                                <div style={{
                                    font: 'var(--md-sys-typescale-label-medium)',
                                    color: 'var(--md-sys-color-tertiary)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    in {daysUntil(event.startDate)} days
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.85; }
                }
            `}</style>
        </div>
    );
};
