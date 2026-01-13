import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const LoginOverlay = () => {
    const { user, loading, signInWithGoogle } = useAuth();

    if (loading || user) return null; // Don't show if loading or already logged in

    return (
        <div id="login-overlay">
            <div className="entry-card">
                <h1 className="entry-title">PSLE Prep</h1>
                <p className="entry-subtitle">Master your exams with localized practice papers and smart tracking.</p>
                <button className="btn-google-login" onClick={signInWithGoogle}>
                    <svg width="24" height="24" viewBox="0 0 18 18">
                        <path
                            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                            fill="#4285f4" />
                        <path
                            d="M9 18c2.43 0 4.467-.806 5.956-2.184L12.048 13.56c-.813.545-1.854.867-3.048.867-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                            fill="#34a853" />
                        <path
                            d="M3.964 10.716a5.41 5.41 0 01-.282-1.716c0-.6.101-1.185.282-1.716V4.952H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.048l3.007-2.332z"
                            fill="#fbbc05" />
                        <path
                            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.46 0 2.403 2.015.957 4.952l3.007 2.332c.708-2.127 2.692-3.711 5.036-3.711z"
                            fill="#ea4335" />
                    </svg>
                    Sign in with Google
                </button>
                <p style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.6 }}>Your progress is synced automatically to the cloud.</p>
            </div>
        </div>
    );
};
