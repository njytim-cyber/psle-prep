import React, { useState, useMemo } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useStateContext } from '../context/StateContext';
import { useAuth } from '../context/AuthContext';
import { FloatingParticles } from '../components/effects/FloatingParticles';
import { MilestoneBadges } from '../components/ui/MilestoneBadges';
import { Leaderboard } from '../components/gamification/Leaderboard';
import { WeeklyChallenges } from '../components/gamification/WeeklyChallenges';
import { SeasonalEvents } from '../components/gamification/SeasonalEvents';

const LEVEL_TITLES = [
    "Novice Scholar", "Paper Chaser", "Book Worm", "Smart Cookie", "Question Seeker",
    "Answer Finder", "Math Explorer", "Problem Solver", "Deep Thinker", "Bronze Brain",
    "Logic Learner", "Concept Keeper", "Formula Fan", "Equation Expert", "Syllabus Surfer",
    "Silver Scholar", "Distinction Dreamer", "High Achiever", "Top Scorer", "Gold Genius",
    "Platinum Pro", "Math Wizard", "Calculation King", "Logic Lord", "Diamond Mind",
    "Master Mind", "Grandmaster", "Legend", "Mythic Scholar", "Divine Mathematician"
];

export const XpSystem = () => {
    const { user } = useAuth();
    const { xpStats, trackerData, papers, totalCompleted, userAvatar } = useStateContext();
    const [showExplainer, setShowExplainer] = useState(false);

    // Calculate subject counts for badges
    const subjectCounts = useMemo(() => {
        const counts: Record<string, number> = { Maths: 0, Science: 0, English: 0 };
        papers.forEach(p => {
            if (trackerData[p.file_path]?.completed) {
                const subj = p.subject || 'Maths';
                counts[subj] = (counts[subj] || 0) + 1;
            }
        });
        return counts;
    }, [papers, trackerData]);

    // Safe title lookup
    const currentLevel = Math.max(1, Math.min(30, xpStats.overall.lvl));
    const title = LEVEL_TITLES[currentLevel - 1] || "Scholar";

    return (
        <div id="xp-view" className="view-pane view-enter" style={{
            overflowY: 'auto',
            padding: '20px',
            position: 'relative'
        }}>
            {/* Floating Particles Background */}
            <FloatingParticles />

            {/* Info Button */}
            <button
                onClick={() => setShowExplainer(true)}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'var(--md-sys-color-surface-container)',
                    border: 'none',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--md-sys-shape-corner-full)',
                    transition: 'all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard)',
                    zIndex: 1
                }}
            >
                <HelpCircle size={18} />
                <span style={{ font: 'var(--md-sys-typescale-label-large)' }}>How it works</span>
            </button>

            {/* Main Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Hero Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '48px',
                    marginTop: '40px',
                    animation: 'slideUpFadeIn var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-emphasized-decelerate)'
                }}>
                    <div style={{
                        fontSize: '5rem',
                        marginBottom: '16px',
                        lineHeight: 1,
                        animation: 'trophyFloat 3s ease-in-out infinite'
                    }}>🏆</div>
                    <h1 style={{
                        margin: '0 0 8px 0',
                        font: 'var(--md-sys-typescale-display-medium)',
                        color: 'var(--md-sys-color-primary)',
                        lineHeight: 1.2
                    }}>Level {xpStats.overall.lvl}</h1>
                    <p style={{
                        opacity: 0.8,
                        font: 'var(--md-sys-typescale-title-large)',
                        margin: 0,
                        color: 'var(--md-sys-color-tertiary)'
                    }}>{title}</p>

                    {/* Overall Progress */}
                    <div style={{
                        maxWidth: '400px',
                        margin: '24px auto 12px',
                        background: 'var(--md-sys-color-surface-container)',
                        height: '12px',
                        borderRadius: 'var(--md-sys-shape-corner-full)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${xpStats.overall.pct}%`,
                            background: 'linear-gradient(90deg, var(--md-sys-color-tertiary), var(--md-sys-color-primary))',
                            height: '100%',
                            transition: 'width var(--md-sys-motion-duration-long2) var(--md-sys-motion-easing-emphasized)'
                        }}></div>
                    </div>
                    <p style={{ font: 'var(--md-sys-typescale-body-medium)', margin: 0, opacity: 0.8 }}>
                        {Math.round(xpStats.overall.progress)} / 500 XP to next level
                    </p>
                </div>

                {/* Subject Cards */}
                <div className="xp-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    maxWidth: '1000px',
                    margin: '0 auto 48px'
                }}>
                    {Object.entries(xpStats.subjects).map(([subj, info], idx) => (
                        <div
                            key={subj}
                            className="xp-card"
                            style={{
                                background: 'var(--md-sys-color-surface-container)',
                                padding: '24px',
                                borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                                textAlign: 'center',
                                border: '1px solid var(--md-sys-color-outline-variant)',
                                animation: `slideUpFadeIn var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-emphasized-decelerate) ${idx * 100}ms both`
                            }}
                        >
                            <h3 style={{ margin: '0 0 10px 0', font: 'var(--md-sys-typescale-title-medium)' }}>{subj}</h3>
                            <div style={{
                                font: 'var(--md-sys-typescale-display-small)',
                                fontWeight: 700,
                                color: 'var(--md-sys-color-tertiary)'
                            }}>Level {info.lvl}</div>
                            <div style={{
                                margin: '15px 0',
                                background: 'var(--md-sys-color-surface-container-high)',
                                height: '8px',
                                borderRadius: 'var(--md-sys-shape-corner-full)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${info.pct}%`,
                                    background: 'var(--md-sys-color-tertiary)',
                                    height: '100%',
                                    transition: 'width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard)'
                                }}></div>
                            </div>
                            <div style={{ font: 'var(--md-sys-typescale-body-small)', opacity: 0.6 }}>
                                {Math.round(500 - info.progress)} XP to next
                            </div>
                        </div>
                    ))}
                </div>

                {/* Milestone Badges */}
                <div style={{ maxWidth: '1000px', margin: '0 auto 48px' }}>
                    <MilestoneBadges totalCompleted={totalCompleted} subjectCounts={subjectCounts} />
                </div>

                {/* Engagement Section */}
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '24px'
                }}>
                    <div style={{ animation: 'slideUpFadeIn 0.3s ease-out 0.1s both' }}>
                        <Leaderboard
                            currentUserName={user?.displayName || 'Scholar'}
                            currentUserAvatar={userAvatar || '0'}
                            currentUserPapers={totalCompleted}
                            currentUserXp={Math.round(xpStats.overall.progress + (500 * (xpStats.overall.lvl - 1)))} // Estimate total XP or just pass progress
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'slideUpFadeIn 0.3s ease-out 0.2s both' }}>
                        <WeeklyChallenges
                            totalCompleted={totalCompleted}
                            weeklyCompleted={papers.filter(p => {
                                const data = trackerData[p.file_path];
                                if (!data?.completed || !data.date) return false;
                                const date = new Date(data.date);
                                const now = new Date();
                                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                return date >= oneWeekAgo;
                            }).length}
                        />
                        <SeasonalEvents />
                    </div>
                </div>
            </div>

            {/* Explainer Modal */}
            {showExplainer && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeIn var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate)'
                }} onClick={() => setShowExplainer(false)}>
                    <div
                        style={{
                            background: 'var(--md-sys-color-surface-container)',
                            padding: '32px',
                            borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                            maxWidth: '600px',
                            width: '90%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            position: 'relative',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            animation: 'levelUpBounce var(--md-sys-motion-duration-long2) var(--md-sys-motion-easing-emphasized-decelerate)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowExplainer(false)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--md-sys-color-on-surface)',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: 'var(--md-sys-shape-corner-full)'
                            }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ color: 'var(--md-sys-color-primary)', marginTop: 0, font: 'var(--md-sys-typescale-headline-medium)' }}>How XP Works</h2>

                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ font: 'var(--md-sys-typescale-title-medium)', marginBottom: '8px' }}>📑 Paper Completion</h3>
                            <ul style={{ paddingLeft: '20px', opacity: 0.8, lineHeight: '1.6', font: 'var(--md-sys-typescale-body-medium)' }}>
                                <li><strong>Major Exams (SA1, SA2, Prelim):</strong> 100 - 120 XP</li>
                                <li><strong>Minor Tests (WA, CA):</strong> 50 XP</li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ font: 'var(--md-sys-typescale-title-medium)', marginBottom: '8px' }}>🔥 Daily Streak Bonus</h3>
                            <p style={{ opacity: 0.8, lineHeight: '1.6', font: 'var(--md-sys-typescale-body-medium)' }}>
                                Complete <strong>2 papers</strong> of the same subject in one day to get a <strong>1.5x XP Multiplier</strong> on the second paper!
                            </p>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ font: 'var(--md-sys-typescale-title-medium)', marginBottom: '8px' }}>🆙 Leveling Up</h3>
                            <p style={{ opacity: 0.8, lineHeight: '1.6', font: 'var(--md-sys-typescale-body-medium)' }}>
                                You gain a new level every <strong>500 XP</strong>. Keep practicing to become a Master Scholar!
                            </p>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '32px' }}>
                            <button
                                onClick={() => setShowExplainer(false)}
                                style={{
                                    background: 'var(--md-sys-color-primary)',
                                    color: 'var(--md-sys-color-on-primary)',
                                    border: 'none',
                                    padding: '12px 32px',
                                    borderRadius: 'var(--md-sys-shape-corner-full)',
                                    font: 'var(--md-sys-typescale-label-large)',
                                    cursor: 'pointer',
                                    transition: 'transform var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard)'
                                }}
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes trophyFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes levelUpBounce {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

