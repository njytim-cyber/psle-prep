import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Analytics } from './pages/Analytics';
import { ExamPlan } from './pages/ExamPlan';
import { XpSystem } from './pages/XpSystem';
import { PdfView } from './pages/PdfView';

import { LoginOverlay } from './components/auth/LoginOverlay';
import { useAuth } from './context/AuthContext';

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--md-sys-color-surface)'
            }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <BrowserRouter>
                <LoginOverlay />
            </BrowserRouter>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="exam" element={<ExamPlan />} />
                    <Route path="xp" element={<XpSystem />} />
                    <Route path="paper/*" element={<PdfView />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
