import React from 'react';
import { Avatar } from '../ui/Avatar';

interface AvatarModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAvatarId: string | undefined;
    onSelect: (id: string) => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
    isOpen,
    onClose,
    currentAvatarId,
    onSelect
}) => {
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.7)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onClick={onClose}
        >
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
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                        gap: '12px',
                        overflowY: 'auto',
                        padding: '10px'
                    }}
                >
                    {Array.from({ length: 64 }).map((_, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'center' }}>
                            <Avatar
                                avatarId={idx.toString()}
                                size={60}
                                highlight={currentAvatarId === idx.toString()}
                                onClick={() => onSelect(idx.toString())}
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
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};
