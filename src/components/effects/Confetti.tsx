import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
    id: number;
    x: number;
    color: string;
    delay: number;
    rotation: number;
}

interface ConfettiProps {
    trigger: boolean;
    onComplete?: () => void;
}

const COLORS = [
    '#FFD700', // Gold
    '#FF6B6B', // Coral
    '#4ECDC4', // Teal
    '#A78BFA', // Purple
    '#60D297', // Green
    '#FF8C42', // Orange
    '#45B7D1', // Sky Blue
];

export const Confetti: React.FC<ConfettiProps> = ({ trigger, onComplete }) => {
    const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (trigger && !isActive) {
            setIsActive(true);
            const newPieces: ConfettiPiece[] = [];

            for (let i = 0; i < 50; i++) {
                newPieces.push({
                    id: i,
                    x: Math.random() * 100,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    delay: Math.random() * 0.5,
                    rotation: Math.random() * 360,
                });
            }
            setPieces(newPieces);

            setTimeout(() => {
                setIsActive(false);
                setPieces([]);
                onComplete?.();
            }, 3000);
        }
    }, [trigger, isActive, onComplete]);

    if (!isActive || pieces.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 10000,
            overflow: 'hidden'
        }}>
            {pieces.map(piece => (
                <div
                    key={piece.id}
                    style={{
                        position: 'absolute',
                        left: `${piece.x}%`,
                        top: '-20px',
                        width: '10px',
                        height: '10px',
                        backgroundColor: piece.color,
                        borderRadius: piece.id % 2 === 0 ? '50%' : '2px',
                        transform: `rotate(${piece.rotation}deg)`,
                        animation: `confetti-fall 2.5s ease-out ${piece.delay}s forwards`
                    }}
                />
            ))}
            <style>{`
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(0) rotate(0deg) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(720deg) scale(0.5);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};
