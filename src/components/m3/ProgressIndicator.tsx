import React from 'react';

interface ProgressIndicatorProps {
    value?: number; // 0-100, undefined = indeterminate
    size?: 'small' | 'medium' | 'large';
    variant?: 'linear' | 'circular';
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    value,
    size = 'medium',
    variant = 'linear'
}) => {
    const isIndeterminate = value === undefined;

    const sizes = {
        small: { height: 4, circleSize: 24, strokeWidth: 3 },
        medium: { height: 6, circleSize: 40, strokeWidth: 4 },
        large: { height: 8, circleSize: 56, strokeWidth: 5 }
    };

    const s = sizes[size];

    if (variant === 'circular') {
        const radius = (s.circleSize - s.strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = isIndeterminate ? circumference * 0.75 : circumference * (1 - (value || 0) / 100);

        return (
            <svg
                width={s.circleSize}
                height={s.circleSize}
                style={{
                    animation: isIndeterminate ? 'spin 1.4s linear infinite' : 'none'
                }}
            >
                {/* Track */}
                <circle
                    cx={s.circleSize / 2}
                    cy={s.circleSize / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--md-sys-color-surface-container-highest)"
                    strokeWidth={s.strokeWidth}
                />
                {/* Progress */}
                <circle
                    cx={s.circleSize / 2}
                    cy={s.circleSize / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--md-sys-color-primary)"
                    strokeWidth={s.strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center',
                        transition: isIndeterminate ? 'none' : 'stroke-dashoffset var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard)'
                    }}
                />
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </svg>
        );
    }

    // Linear variant
    return (
        <div style={{
            width: '100%',
            height: s.height,
            background: 'var(--md-sys-color-surface-container-highest)',
            borderRadius: 'var(--md-sys-shape-corner-full)',
            overflow: 'hidden'
        }}>
            <div style={{
                width: isIndeterminate ? '30%' : `${value}%`,
                height: '100%',
                background: 'var(--md-sys-color-primary)',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                transition: isIndeterminate ? 'none' : 'width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard)',
                animation: isIndeterminate ? 'indeterminate 1.5s ease-in-out infinite' : 'none'
            }} />
            {isIndeterminate && (
                <style>{`
                    @keyframes indeterminate {
                        0% { margin-left: -30%; }
                        100% { margin-left: 100%; }
                    }
                `}</style>
            )}
        </div>
    );
};
