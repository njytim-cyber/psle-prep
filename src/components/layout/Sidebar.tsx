import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart2,
    Calendar,
    Award,
    ChevronLeft,
    ChevronRight,
    Search,
    BookOpen,
    Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStateContext } from '../../context/StateContext';
import { Avatar } from '../ui/Avatar';
import { AVATARS } from '../../data/constants';

export const Sidebar = () => {
    const { user, signInWithGoogle, signOut } = useAuth();
    const {
        papers,
        trackerData,
        userAvatar,
        setUserAvatar,
        saveData,
        xpStats,
        filters,
        setFilters
    } = useStateContext();
    const location = useLocation();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [avatarModalOpen, setAvatarModalOpen] = useState(false);

    // Filter State Helpers
    // We derive unique values from 'papers' to populate dropdowns
    const uniqueSubjects = ['Maths', 'Science', 'English'];
    const uniqueLevels = ['P4']; // Could be derived: [...new Set(papers.map(p => p.level || 'P4'))]
    const uniqueTerms = ['CA1', 'CA2', 'WA1', 'WA2', 'WA3', 'SA1', 'SA2', 'Prelim'];

    const toggleFilter = (type: 'subject' | 'term' | 'level', value: string) => {
        setFilters(prev => {
            const current = prev[type];
            const exists = current.includes(value);
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
                            <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
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
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--md-sys-color-tertiary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={14} /> FILTERS
                        </div>

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
        </div>
    );
};
