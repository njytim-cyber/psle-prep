import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '20px',
    borderRadius = '8px',
    style
}) => (
    <div style={{
        width,
        height,
        borderRadius,
        background: 'var(--md-sys-color-surface-container-high)',
        position: 'relative',
        overflow: 'hidden',
        ...style
    }}>
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            animation: 'skeletonShimmer 1.5s ease-in-out infinite'
        }}>
            <div style={{
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, var(--md-sys-color-surface-container-highest), transparent)',
                transform: 'skewX(-20deg)'
            }} />
        </div>
        <style>{`
            @keyframes skeletonShimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(200%); }
            }
        `}</style>
    </div>
);

export const PaperCardSkeleton: React.FC = () => (
    <div style={{
        background: 'var(--md-sys-color-surface-container)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="60%" height="20px" />
            <Skeleton width="24px" height="24px" borderRadius="50%" />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
            <Skeleton width="60px" height="24px" borderRadius="12px" />
            <Skeleton width="50px" height="24px" borderRadius="12px" />
            <Skeleton width="40px" height="24px" borderRadius="12px" />
        </div>
    </div>
);

export const GridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
    }}>
        {Array.from({ length: count }).map((_, i) => (
            <PaperCardSkeleton key={i} />
        ))}
    </div>
);
