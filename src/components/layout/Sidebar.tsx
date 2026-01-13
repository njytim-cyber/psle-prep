import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart2,
    Calendar,
    Award,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStateContext } from '../../context/StateContext';
import { Avatar } from '../ui/Avatar';

export const Sidebar = () => {
    const { user, signInWithGoogle } = useAuth();
    const {
        papers,
        userAvatar,
        setUserAvatar,
        saveData,
        xpStats,
        filters,
        setFilters
    } = useStateContext();

    // UI State
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
    const [schoolSearch, setSchoolSearch] = useState('');
    const location = useLocation();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [avatarModalOpen, setAvatarModalOpen] = useState(false);
    const [xpModalOpen, setXpModalOpen] = useState(false);

    const uniqueLevels = Array.from(new Set(papers.map(p => p.level || 'P4'))).sort();
    const uniqueTerms = ['CA1', 'CA2', 'WA1', 'WA2', 'WA3', 'SA1', 'SA2', 'Prelim'];
    const uniqueYears = Array.from(new Set(papers.map(p => p.year))).sort((a, b) => b - a);
    const uniqueSchools = Array.from(new Set(papers.map(p => p.school))).sort();
    const uniqueSubjects = Array.from(new Set(papers.map(p => p.subject || 'Maths'))).sort();

    const toggleFilter = (type: 'subject' | 'term' | 'level' | 'year' | 'school', value: string | number) => {
        setFilters(prev => {
            const current = prev[type] as (string | number)[];
            const exists = current.includes(value as never);
            return {
                ...prev,
                [type]: exists
                    ? current.filter(v => v !== value)
                    : [...current, value]
            };
        });
    };

    const handleAvatarSelect = (id: string) => {
        setUserAvatar(id);
        saveData(); // Trigger save immediately
        setAvatarModalOpen(false);
    };

    return (
        <div id="sidebar" className={isCollapsed ? 'collapsed' : ''} style={{
            width: isCollapsed ? '80px' : '320px',
            transition: 'width 0.3s ease',
            background: 'var(--md-sys-color-surface-container-low)',
            borderRight: '1px solid var(--md-sys-color-outline-variant)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'relative',
            zIndex: 50
        }}>

            {/* Header / Brand */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--md-sys-color-outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {!isCollapsed && (
                    <h1 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--md-sys-color-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BookOpen size={24} />
                        PSLE Prep
                    </h1>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--md-sys-color-on-surface-variant)', cursor: 'pointer', padding: 4 }}
                >
                    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </button>
            </div>

            {/* Profile Section */}
            <div style={{ padding: isCollapsed ? '16px 8px' : '24px' }}>
                {user ? (
                    <div
                        style={{
                            background: 'var(--md-sys-color-surface-container)',
                            borderRadius: '16px',
                            padding: isCollapsed ? '12px' : '16px',
                            cursor: 'pointer',
                            textAlign: isCollapsed ? 'center' : 'left'
                        }}
                        onClick={() => setAvatarModalOpen(true)}
                        title="Change Avatar"
                    >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <Avatar avatarId={userAvatar} size={isCollapsed ? 32 : 48} />
                            {!isCollapsed && (
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user.displayName || 'Scholar'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                        Lvl {xpStats.overall.lvl} • {Math.round(xpStats.overall.progress)} XP
                                    </div>
                                </div>
                            )}
                        </div>
                        {!isCollapsed && (
                            <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '5px', overflow: 'hidden', cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); setXpModalOpen(true); }}
                                title="View XP Details"
                            >
                                <div style={{ width: `${xpStats.overall.pct}%`, background: 'var(--md-sys-color-tertiary)', height: '100%' }} />
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        className="btn-action"
                        onClick={signInWithGoogle}
                        style={{ width: '100%', padding: '10px', fontSize: isCollapsed ? '0.7rem' : '0.9rem' }}
                    >
                        {isCollapsed ? 'Login' : 'Sign In'}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '0 12px' }}>
                {[
                    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Papers' },
                    { to: '/analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
                    { to: '/exam', icon: <Calendar size={20} />, label: 'Exam Plan' },
                    { to: '/xp', icon: <Award size={20} />, label: 'Achievements' },
                ].map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            marginBottom: '4px',
                            textDecoration: 'none',
                            color: isActive ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)',
                            background: isActive ? 'var(--md-sys-color-secondary-container)' : 'transparent',
                            justifyContent: isCollapsed ? 'center' : 'flex-start'
                        })}
                        title={isCollapsed ? link.label : ''}
                    >
                        {link.icon}
                        {!isCollapsed && <span>{link.label}</span>}
                    </NavLink>
                ))}

                {/* Filters - Only visible on Home and when expanded */}
                {!isCollapsed && location.pathname === '/' && (
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
                        <div
                            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                            style={{
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: 'var(--md-sys-color-tertiary)',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                userSelect: 'none'
                            }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Filter size={14} /> FILTERS
                            </div>
                            <ChevronRight size={14} style={{ transform: isFiltersExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </div>

                        {isFiltersExpanded && (
                            <>
                                {/* Subject Filter */}
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.8 }}>Subject</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {uniqueSubjects.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => toggleFilter('subject', s)}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--md-sys-color-outline)',
                                                    background: filters.subject.includes(s) ? 'var(--md-sys-color-primary-container)' : 'transparent',
                                                    color: filters.subject.includes(s) ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Term Filter */}
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.8 }}>Term</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                                        {uniqueTerms.map(t => (
                                            <button
                                                key={t}
                                                onClick={() => toggleFilter('term', t)}
                                                style={{
                                                    padding: '4px 6px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--md-sys-color-outline)',
                                                    background: filters.term.includes(t) ? 'var(--md-sys-color-primary-container)' : 'transparent',
                                                    color: filters.term.includes(t) ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Level Filter */}
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.8 }}>Level</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {uniqueLevels.map(l => (
                                            <button
                                                key={l}
                                                onClick={() => toggleFilter('level', l)}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--md-sys-color-outline)',
                                                    background: filters.level.includes(l) ? 'var(--md-sys-color-primary-container)' : 'transparent',
                                                    color: filters.level.includes(l) ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Year Filter */}
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.8 }}>Year</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {uniqueYears.map(y => (
                                            <button
                                                key={y}
                                                onClick={() => toggleFilter('year', y)}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--md-sys-color-outline)',
                                                    background: filters.year.includes(y) ? 'var(--md-sys-color-primary-container)' : 'transparent',
                                                    color: filters.year.includes(y) ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {y}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* School Filter */}
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.8 }}>School</div>
                                    <input
                                        type="text"
                                        placeholder="Search schools..."
                                        value={schoolSearch}
                                        onChange={(e) => setSchoolSearch(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            marginBottom: '8px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--md-sys-color-outline)',
                                            background: 'var(--md-sys-color-surface-container-high)',
                                            color: 'var(--md-sys-color-on-surface)',
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                                        {uniqueSchools
                                            .filter(s => s.toLowerCase().includes(schoolSearch.toLowerCase()))
                                            .map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => toggleFilter('school', s)}
                                                    style={{
                                                        padding: '6px 10px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        background: filters.school.includes(s) ? 'var(--md-sys-color-primary-container)' : 'transparent',
                                                        color: filters.school.includes(s) ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        width: '100%',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                    title={s}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                )}
            </nav>

            {/* Avatar Selection Modal */}
            {avatarModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.7)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} onClick={() => setAvatarModalOpen(false)}>
                    <div
                        style={{
                            background: 'var(--md-sys-color-surface-container)',
                            padding: '24px',
                            borderRadius: '24px',
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ marginTop: 0 }}>Choose Your Avatar</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                            gap: '12px',
                            overflowY: 'auto',
                            padding: '10px'
                        }}>
                            {Array.from({ length: 64 }).map((_, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Avatar
                                        avatarId={idx.toString()}
                                        size={60}
                                        highlight={userAvatar === idx.toString()}
                                        onClick={() => handleAvatarSelect(idx.toString())}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            style={{
                                marginTop: '20px',
                                padding: '12px',
                                background: 'transparent',
                                border: '1px solid var(--md-sys-color-outline)',
                                color: 'var(--md-sys-color-on-surface)',
                                borderRadius: '12px',
                                cursor: 'pointer'
                            }}
                            onClick={() => setAvatarModalOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* XP Explainer Modal */}
            {xpModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.7)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} onClick={() => setXpModalOpen(false)}>
                    <div
                        style={{
                            background: 'var(--md-sys-color-surface-container)',
                            padding: '24px',
                            borderRadius: '24px',
                            maxWidth: '400px',
                            width: '90%',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                            border: '1px solid var(--md-sys-color-outline-variant)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ marginTop: 0, color: 'var(--md-sys-color-on-surface)' }}>XP System</h2>
                        <div style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            <p>Earn XP by completing papers to level up your avatar!</p>

                            <h4 style={{ margin: '16px 0 8px', color: 'var(--md-sys-color-tertiary)' }}>Rewards</h4>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                <li><strong>120 XP</strong> - Prelim / Final Exam</li>
                                <li><strong>100 XP</strong> - SA1 / SA2</li>
                                <li><strong>50 XP</strong> - WA / CA</li>
                                <li><strong>30 XP</strong> - Practice Papers</li>
                            </ul>

                            <h4 style={{ margin: '16px 0 8px', color: 'var(--md-sys-color-tertiary)' }}>Bonuses</h4>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                <li><strong>1.5x XP</strong> - Complete 2 papers of the same subject in one day!</li>
                            </ul>

                            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--md-sys-color-secondary-container)', borderRadius: '12px', color: 'var(--md-sys-color-on-secondary-container)' }}>
                                <strong>Current Level:</strong> {xpStats.overall.lvl}<br />
                                <strong>Progress:</strong> {Math.round(xpStats.overall.progress)} / 500 XP
                            </div>
                        </div>

                        <button
                            style={{
                                marginTop: '20px',
                                padding: '10px',
                                background: 'var(--md-sys-color-primary)',
                                border: 'none',
                                color: 'var(--md-sys-color-on-primary)',
                                borderRadius: '100px',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                            onClick={() => setXpModalOpen(false)}
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
