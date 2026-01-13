import React from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
    rank: number;
    name: string;
    avatar: string;
    papersCompleted: number;
    xp: number;
    isCurrentUser?: boolean;
}

interface LeaderboardProps {
    currentUserName: string;
    currentUserAvatar: string;
    currentUserPapers: number;
    currentUserXp: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
    currentUserName,
    currentUserAvatar,
    currentUserPapers,
    currentUserXp
}) => {
    // Generate mock leaderboard with current user
    const mockLeaders: LeaderboardEntry[] = [
        { rank: 1, name: 'Sophia L.', avatar: 'Aneka', papersCompleted: 127, xp: 12500 },
        { rank: 2, name: 'Ethan K.', avatar: 'Liam', papersCompleted: 115, xp: 11200 },
        { rank: 3, name: 'Emma T.', avatar: 'Willow', papersCompleted: 98, xp: 9800 },
        { rank: 4, name: 'Ryan C.', avatar: 'Felix', papersCompleted: 89, xp: 8900 },
        { rank: 5, name: 'Chloe W.', avatar: 'Callie', papersCompleted: 82, xp: 8200 },
    ];

    // Find where current user would rank
    const userRank = mockLeaders.filter(l => l.xp > currentUserXp).length + 1;

    // Insert current user into leaderboard if they're in top 10
    const allEntries: LeaderboardEntry[] = [
        ...mockLeaders,
        {
            rank: userRank,
            name: currentUserName || 'You',
            avatar: currentUserAvatar || 'Felix',
            papersCompleted: currentUserPapers,
            xp: currentUserXp,
            isCurrentUser: true
        }
    ].sort((a, b) => b.xp - a.xp).map((e, i) => ({ ...e, rank: i + 1 })).slice(0, 6);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy size={18} style={{ color: '#FFD700' }} />;
            case 2: return <Medal size={18} style={{ color: '#C0C0C0' }} />;
            case 3: return <Award size={18} style={{ color: '#CD7F32' }} />;
            default: return <span style={{ width: 18, textAlign: 'center' }}>{rank}</span>;
        }
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
                <TrendingUp size={20} /> Leaderboard
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {allEntries.map(entry => (
                    <div
                        key={entry.rank + entry.name}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: entry.isCurrentUser
                                ? 'var(--md-sys-color-primary-container)'
                                : 'var(--md-sys-color-surface-container-high)',
                            borderRadius: 'var(--md-sys-shape-corner-large)',
                            border: entry.isCurrentUser
                                ? '2px solid var(--md-sys-color-primary)'
                                : 'none'
                        }}
                    >
                        {/* Rank */}
                        <div style={{
                            width: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            font: 'var(--md-sys-typescale-label-large)',
                            fontWeight: 700,
                            color: 'var(--md-sys-color-on-surface-variant)'
                        }}>
                            {getRankIcon(entry.rank)}
                        </div>

                        {/* Avatar */}
                        <img
                            src={`/avatars/${entry.avatar}.png`}
                            alt={entry.name}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'var(--md-sys-color-surface-variant)'
                            }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/avatars/Felix.png';
                            }}
                        />

                        {/* Name */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                font: 'var(--md-sys-typescale-label-large)',
                                color: entry.isCurrentUser
                                    ? 'var(--md-sys-color-on-primary-container)'
                                    : 'var(--md-sys-color-on-surface)'
                            }}>
                                {entry.name} {entry.isCurrentUser && '(You)'}
                            </div>
                            <div style={{
                                font: 'var(--md-sys-typescale-body-small)',
                                color: entry.isCurrentUser
                                    ? 'var(--md-sys-color-on-primary-container)'
                                    : 'var(--md-sys-color-on-surface-variant)',
                                opacity: 0.8
                            }}>
                                {entry.papersCompleted} papers
                            </div>
                        </div>

                        {/* XP */}
                        <div style={{
                            font: 'var(--md-sys-typescale-label-large)',
                            color: 'var(--md-sys-color-tertiary)',
                            fontWeight: 600
                        }}>
                            {entry.xp.toLocaleString()} XP
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: '16px',
                textAlign: 'center',
                font: 'var(--md-sys-typescale-body-small)',
                color: 'var(--md-sys-color-on-surface-variant)',
                opacity: 0.7
            }}>
                Updated weekly • Keep practicing to climb! 🚀
            </div>
        </div>
    );
};
