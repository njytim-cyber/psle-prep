import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { StateProvider } from './context/StateContext'
import { ToastProvider } from './components/effects/Toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <StateProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </StateProvider>
        </AuthProvider>
    </React.StrictMode>,
)

