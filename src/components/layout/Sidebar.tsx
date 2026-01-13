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
    Timer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStateContext } from '../../context/StateContext';
import { Avatar } from '../ui/Avatar';
import { AvatarModal } from '../modals/AvatarModal';
import { XpModal } from '../modals/XpModal';
import { FilterPanel } from '../filters/FilterPanel';

export const Sidebar = () => {
    const { user, signInWithGoogle } = useAuth();
    const {
        papers,
        userAvatar,
        setUserAvatar,
        saveData,
        xpStats,
        filters,
        setFilters,
        milestoneStats,
        totalCompleted
    } = useStateContext();

    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [avatarModalOpen, setAvatarModalOpen] = useState(false);
    const [xpModalOpen, setXpModalOpen] = useState(false);

    // Derived filter options
    const uniqueLevels = Array.from(new Set(papers.map(p => p.level || 'P4'))).sort();
    const uniqueTerms = ['CA1', 'CA2', 'WA1', 'WA2', 'WA3', 'SA1', 'SA2', 'Prelim'];
    const uniqueYears = Array.from(new Set(papers.map(p => p.year))).sort((a, b) => b - a);
    const uniqueSchools = Array.from(new Set(papers.map(p => p.school))).sort();
    const uniqueSubjects = Array.from(new Set(papers.map(p => p.subject || 'Maths'))).sort();

    const handleAvatarSelect = (id: string) => {
        setUserAvatar(id);
        saveData();
        setAvatarModalOpen(false);
    };

    const navLinks = [
        { to: '/', icon: <LayoutDashboard size={20} />, label: 'Papers' },
        { to: '/analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
        { to: '/exam', icon: <Calendar size={20} />, label: 'Exam Plan' },
        { to: '/study', icon: <Timer size={20} />, label: 'Study Hub' },
        { to: '/xp', icon: <Award size={20} />, label: 'Achievements' },
    ];

    return (
        <div
            id="sidebar"
            className={isCollapsed ? 'collapsed' : ''}
            style={{
                width: isCollapsed ? '80px' : '320px',
                transition: 'width 0.3s ease',
                background: 'var(--md-sys-color-surface-container-low)',
                borderRight: '1px solid var(--md-sys-color-outline-variant)',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                position: 'relative',
                zIndex: 50
            }}
        >
            {/* Header / Brand */}
            <div style={{
                padding: '24px',
                borderBottom: '1px solid var(--md-sys-color-outline-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {!isCollapsed && (
                    <h1 style={{
                        margin: 0,
                        fontSize: '1.2rem',
                        color: 'var(--md-sys-color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <BookOpen size={24} />
                        PSLE Prep
                    </h1>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        cursor: 'pointer',
                        padding: 4
                    }}
                >
                    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </button>
            </div>

            {/* Profile Section */}
            <div style={{
                padding: isCollapsed ? '16px 8px' : '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {user ? (
                    <>
                        {/* User Profile Card */}
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
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center',
                                justifyContent: isCollapsed ? 'center' : 'flex-start'
                            }}>
                                <Avatar avatarId={userAvatar} size={isCollapsed ? 32 : 48} />
                                {!isCollapsed && (
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {user.displayName || 'Scholar'}
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--md-sys-color-on-surface-variant)'
                                        }}>
                                            Lvl {xpStats.overall.lvl} • {Math.round(xpStats.overall.progress)} XP
                                        </div>
                                    </div>
                                )}
                            </div>
                            {!isCollapsed && (
                                <div
                                    style={{
                                        marginTop: '12px',
                                        background: 'rgba(255,255,255,0.1)',
                                        height: '10px',
                                        borderRadius: '5px',
                                        overflow: 'hidden',
                                        cursor: 'pointer'
                                    }}
                                    onClick={(e) => { e.stopPropagation(); setXpModalOpen(true); }}
                                    title="View XP Details"
                                >
                                    <div style={{
                                        width: `${xpStats.overall.pct}%`,
                                        background: 'var(--md-sys-color-tertiary)',
                                        height: '100%'
                                    }} />
                                </div>
                            )}
                        </div>

                        {/* Milestone Progress Card */}
                        {!isCollapsed && milestoneStats && (
                            <NavLink to="/exam" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{
                                    background: 'var(--md-sys-color-primary-container)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    color: 'var(--md-sys-color-on-primary-container)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    border: '1px solid var(--md-sys-color-outline-variant)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        opacity: 0.9
                                    }}>
                                        <span>Current Focus</span>
                                        <span>{Math.round(milestoneStats.pct)}%</span>
                                    </div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                                        {milestoneStats.title}
                                    </div>
                                    <div style={{
                                        height: '8px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${milestoneStats.pct}%`,
                                            background: 'var(--md-sys-color-primary)',
                                            height: '100%'
                                        }} />
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                        {milestoneStats.done} / {milestoneStats.total} papers completed
                                    </div>
                                </div>
                            </NavLink>
                        )}

                        {/* Papers Done Card */}
                        {!isCollapsed && (
                            <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{
                                    background: 'var(--md-sys-color-secondary-container)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    color: 'var(--md-sys-color-on-secondary-container)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    border: '1px solid var(--md-sys-color-outline-variant)'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.9 }}>
                                            Total Papers Done
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                                            {totalCompleted}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        padding: '10px',
                                        borderRadius: '12px'
                                    }}>
                                        <Award size={24} />
                                    </div>
                                </div>
                            </NavLink>
                        )}
                    </>
                ) : (
                    <button
                        className="btn-action"
                        onClick={signInWithGoogle}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: isCollapsed ? '0.7rem' : '0.9rem'
                        }}
                    >
                        {isCollapsed ? 'Login' : 'Sign In'}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
                {navLinks.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            marginBottom: '4px',
                            textDecoration: 'none',
                            color: isActive
                                ? 'var(--md-sys-color-on-secondary-container)'
                                : 'var(--md-sys-color-on-surface-variant)',
                            background: isActive
                                ? 'var(--md-sys-color-secondary-container)'
                                : 'transparent',
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
                    <FilterPanel
                        filters={filters}
                        setFilters={setFilters}
                        uniqueSubjects={uniqueSubjects}
                        uniqueTerms={uniqueTerms}
                        uniqueLevels={uniqueLevels}
                        uniqueYears={uniqueYears}
                        uniqueSchools={uniqueSchools}
                    />
                )}
            </nav>

            {/* Modals */}
            <AvatarModal
                isOpen={avatarModalOpen}
                onClose={() => setAvatarModalOpen(false)}
                currentAvatarId={userAvatar}
                onSelect={handleAvatarSelect}
            />
            <XpModal
                isOpen={xpModalOpen}
                onClose={() => setXpModalOpen(false)}
                xpStats={xpStats}
            />
        </div>
    );
};
