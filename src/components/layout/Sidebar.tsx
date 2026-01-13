import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStateContext } from '../../context/StateContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
    const { papers, trackerData, userAvatar } = useStateContext();
    const { user } = useAuth(); // We can display user name

    // Calculate stats
    const completedCount = Object.values(trackerData).filter(p => p.completed).length;
    const totalPapers = papers.length;
    const percentComplete = totalPapers > 0 ? Math.round((completedCount / totalPapers) * 100) : 0;

    return (
        <div id="sidebar">
            <div id="header">
                <h1>PSLE Prep</h1>

                {/* Profile Section */}
                {user ? (
                    <div id="profile-container" style={{ display: 'flex', marginTop: '16px' }}>
                        <div className="profile-left">
                            <div id="user-avatar-display" style={{
                                backgroundImage: userAvatar ? `url(/avatars.webp)` : `url(${user.photoURL})`,
                                // If using sprites, we need logic. For now assuming full images or sprite logic handled elsewhere.
                                // Legacy used sprites. I'll need to port sprite logic later.
                                backgroundPosition: '0 0' // Placeholder
                            }}></div>
                        </div>
                        <div className="profile-right" style={{ marginLeft: '12px' }}>
                            <div className="profile-header-row">
                                <span className="profile-name-text">{user.displayName || 'User'}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', opacity: 0.7 }}>
                        Guest
                    </div>
                )}

            </div>

            <nav id="nav-drawer" className="nav-drawer">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Home</span>
                </NavLink>
                <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📊</span>
                    <span className="nav-label">Analytics</span>
                </NavLink>
                <NavLink to="/exam" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">📅</span>
                    <span className="nav-label">Exam Plan</span>
                </NavLink>
                <NavLink to="/xp" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">🏆</span>
                    <span className="nav-label">Achievements</span>
                </NavLink>
            </nav>

            <div id="stats-grid">
                <div className="stat-card-mini">
                    <span className="stat-val-big">{completedCount}</span>
                    <span className="stat-label-mini">Done</span>
                </div>
                <div className="stat-card-mini">
                    <span className="stat-val-big">{percentComplete}%</span>
                    <span className="stat-label-mini">Complete</span>
                </div>
                <div className="stat-card-mini yellow-card">
                    <span className="stat-val-big">0%</span>
                    <span className="stat-label-mini">Exam Prep</span>
                </div>
            </div>

            <div id="filters" style={{ padding: '20px' }}>
                <p style={{ opacity: 0.5 }}>Filters Placeholder</p>
            </div>

            <div style={{ marginTop: 'auto', padding: '20px', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                Version 2.0 (React)
            </div>
        </div>
    );
};
