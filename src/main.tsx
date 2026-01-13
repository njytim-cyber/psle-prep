import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { StateProvider } from './context/StateContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <StateProvider>
                <App />
            </StateProvider>
        </AuthProvider>
    </React.StrictMode>,
)
