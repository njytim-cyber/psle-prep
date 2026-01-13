import React, { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { SHORTCUTS } from '../../hooks/useKeyboardShortcuts';

export const ShortcutsHelpModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleShow = () => setIsOpen(true);
        document.addEventListener('show-shortcuts-help', handleShow);
        return () => document.removeEventListener('show-shortcuts-help', handleShow);
    }, []);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.8)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fadeIn var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized-decelerate)'
            }}
            onClick={() => setIsOpen(false)}
        >
            <div
                style={{
                    background: 'var(--md-sys-color-surface-container)',
                    borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                    padding: '24px 32px',
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    animation: 'levelUpBounce var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-emphasized-decelerate)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                }}>
                    <h2 style={{
                        margin: 0,
                        font: 'var(--md-sys-typescale-title-large)',
                        color: 'var(--md-sys-color-on-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <Keyboard size={24} /> Keyboard Shortcuts
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--md-sys-color-on-surface)',
                            cursor: 'pointer',
                            padding: '8px'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {SHORTCUTS.map(category => (
                    <div key={category.category} style={{ marginBottom: '20px' }}>
                        <h3 style={{
                            font: 'var(--md-sys-typescale-label-large)',
                            color: 'var(--md-sys-color-tertiary)',
                            marginBottom: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {category.category}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {category.shortcuts.map((shortcut, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 12px',
                                        background: 'var(--md-sys-color-surface-container-high)',
                                        borderRadius: 'var(--md-sys-shape-corner-medium)'
                                    }}
                                >
                                    <span style={{
                                        font: 'var(--md-sys-typescale-body-medium)',
                                        color: 'var(--md-sys-color-on-surface)'
                                    }}>
                                        {shortcut.description}
                                    </span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {shortcut.keys.map((key, i) => (
                                            <React.Fragment key={key}>
                                                <kbd style={{
                                                    background: 'var(--md-sys-color-surface-variant)',
                                                    color: 'var(--md-sys-color-on-surface-variant)',
                                                    padding: '4px 8px',
                                                    borderRadius: 'var(--md-sys-shape-corner-small)',
                                                    font: 'var(--md-sys-typescale-label-medium)',
                                                    fontFamily: 'monospace',
                                                    minWidth: '28px',
                                                    textAlign: 'center'
                                                }}>
                                                    {key}
                                                </kbd>
                                                {i < shortcut.keys.length - 1 && (
                                                    <span style={{
                                                        color: 'var(--md-sys-color-on-surface-variant)',
                                                        alignSelf: 'center'
                                                    }}>+</span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div style={{
                    marginTop: '16px',
                    textAlign: 'center',
                    font: 'var(--md-sys-typescale-body-small)',
                    color: 'var(--md-sys-color-on-surface-variant)'
                }}>
                    Press <kbd style={{
                        background: 'var(--md-sys-color-surface-variant)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontFamily: 'monospace'
                    }}>?</kbd> anytime to see this help
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes levelUpBounce {
                    0% { transform: scale(0.95); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
