import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Analytics } from './pages/Analytics';
import { ExamPlan } from './pages/ExamPlan';
import { XpSystem } from './pages/XpSystem';
import { PdfView } from './pages/PdfView';

import { LoginOverlay } from './components/auth/LoginOverlay';

function App() {
    return (
        <BrowserRouter>
            <LoginOverlay />
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
