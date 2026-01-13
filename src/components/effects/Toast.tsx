import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
    id: number;
    message: string;
    emoji: string;
    type: 'success' | 'info' | 'celebration';
}

interface ToastContextType {
    showToast: (message: string, emoji?: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, emoji = '✨', type: Toast['type'] = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, emoji, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const getBackgroundColor = (type: Toast['type']) => {
        switch (type) {
            case 'celebration': return 'var(--md-sys-color-tertiary-container)';
            case 'info': return 'var(--md-sys-color-secondary-container)';
            default: return 'var(--md-sys-color-primary-container)';
        }
    };

    const getTextColor = (type: Toast['type']) => {
        switch (type) {
            case 'celebration': return 'var(--md-sys-color-on-tertiary-container)';
            case 'info': return 'var(--md-sys-color-on-secondary-container)';
            default: return 'var(--md-sys-color-on-primary-container)';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9998,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                pointerEvents: 'none'
            }}>
                {toasts.map((toast, index) => (
                    <div
                        key={toast.id}
                        style={{
                            background: getBackgroundColor(toast.type),
                            color: getTextColor(toast.type),
                            padding: '16px 24px',
                            borderRadius: '16px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            animation: `toastSlideIn 0.3s ease ${index * 0.1}s both`,
                            pointerEvents: 'auto'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>{toast.emoji}</span>
                        {toast.message}
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes toastSlideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
