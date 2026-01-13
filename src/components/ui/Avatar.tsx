import React from 'react';

interface AvatarProps {
    avatarId: string | undefined;
    size?: number; // Size in px
    className?: string;
    onClick?: () => void;
    highlight?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ avatarId, size = 40, className = '', onClick, highlight = false }) => {
    // Determine Sprite Position
    // The sprite sheet is avatars.webp. It's an 8x8 grid (64 avatars).
    // Assuming avatarId is an index "0", "1", ... "63" or undefined.

    // If no avatar set, use default (first one or a '?' placeholder).
    // Let's assume ID 0 is default if undefined, or handle specifically.
    const id = parseInt(avatarId || '0', 10);
    const validId = isNaN(id) ? 0 : Math.max(0, Math.min(63, id));

    const row = Math.floor(validId / 8);
    const col = validId % 8;

    // Calculate background position percentage
    // For N frames, position is calculated as: pos = index * 100 / (N - 1)
    // Here we have 8 columns and 8 rows.
    const xPos = (col * 100) / 7;
    const yPos = (row * 100) / 7;

    return (
        <div
            className={`avatar-component ${className}`}
            onClick={onClick}
            style={{
                width: size,
                height: size,
                backgroundImage: `url('/avatars.webp')`,
                backgroundSize: '800% 800%', // 8 cols/rows => 800%
                backgroundPosition: `${xPos}% ${yPos}%`,
                borderRadius: '50%',
                border: highlight ? '2px solid #fbbf24' : '2px solid white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                transform: highlight ? 'scale(1.1)' : 'none',
                flexShrink: 0
            }}
        />
    );
};
