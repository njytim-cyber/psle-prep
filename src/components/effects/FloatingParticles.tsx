import React from 'react';

export const FloatingParticles: React.FC = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 6 + 2,
        left: Math.random() * 100,
        delay: Math.random() * 15,
        duration: Math.random() * 10 + 15,
        opacity: Math.random() * 0.3 + 0.1
    }));

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0
        }}>
            {particles.map(p => (
                <div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: `${p.left}%`,
                        bottom: '-20px',
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        borderRadius: '50%',
                        background: `var(--md-sys-color-tertiary)`,
                        opacity: p.opacity,
                        animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`
                    }}
                />
            ))}
            <style>{`
                @keyframes particleFloat {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.3;
                    }
                    90% {
                        opacity: 0.3;
                    }
                    100% {
                        transform: translateY(-100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};
