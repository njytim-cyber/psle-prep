import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useStateContext } from '../context/StateContext';

export const XpSystem = () => {
    const { xpStats } = useStateContext();
    const [showExplainer, setShowExplainer] = useState(false);

    return (
        <div id="xp-view" className="view-pane" style={{ overflowY: 'auto', padding: '20px', position: 'relative' }}>
            {/* Info Button */}
            <button
                onClick={() => setShowExplainer(true)}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
            >
                <HelpCircle size={20} />
                <span style={{ fontSize: '0.9rem' }}>How it works</span>
            </button>

            <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🏆</div>
                <h1 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--md-sys-color-primary)' }}>Level {xpStats.overall.lvl}</h1>
                <p style={{ opacity: 0.7, fontSize: '1.2rem' }}>Master Scholar</p>

                {/* Overall Progress */}
                <div style={{ maxWidth: '400px', margin: '20px auto', background: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${xpStats.overall.pct}%`, background: 'var(--md-sys-color-tertiary)', height: '100%' }}></div>
                </div>
                <p style={{ fontFamily: 'monospace' }}>{Math.round(xpStats.overall.progress)} / 500 XP to next level</p>
            </div>

            <div className="xp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                {Object.entries(xpStats.subjects).map(([subj, info]) => (
                    <div key={subj} className="xp-card" style={{ background: 'var(--md-sys-color-surface-container)', padding: '24px', borderRadius: '24px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', opacity: 0.9 }}>{subj}</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--md-sys-color-tertiary)' }}>Lvl {info.lvl}</div>
                        <div style={{ margin: '15px 0', background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${info.pct}%`, background: 'var(--md-sys-color-tertiary)', height: '100%' }}></div>
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{Math.round(info.progress)} XP to next</div>
                    </div>
                ))}
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
                    justifyContent: 'center'
                }} onClick={() => setShowExplainer(false)}>
                    <div
                        style={{
                            background: 'var(--md-sys-color-surface-container)',
                            padding: '32px',
                            borderRadius: '28px',
                            maxWidth: '600px',
                            width: '90%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            position: 'relative',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowExplainer(false)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--md-sys-color-on-surface)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ color: 'var(--md-sys-color-primary)', marginTop: 0 }}>How XP Works</h2>

                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📑 Paper Completion</h3>
                            <ul style={{ paddingLeft: '20px', opacity: 0.8, lineHeight: '1.6' }}>
                                <li><strong>Major Exams (SA1, SA2, Prelim):</strong> 100 - 120 XP</li>
                                <li><strong>Minor Tests (WA, CA):</strong> 50 XP</li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>🔥 Daily Streak Bonus</h3>
                            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
                                Complete <strong>2 papers</strong> of the same subject in one day to get a <strong>1.5x XP Multiplier</strong> on the second paper!
                            </p>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>🆙 Leveling Up</h3>
                            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
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
                                    padding: '10px 24px',
                                    borderRadius: '20px',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
