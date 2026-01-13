import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselItem {
    id: string;
    content: React.ReactNode;
}

interface CarouselProps {
    items: CarouselItem[];
    showNavigation?: boolean;
}

export const Carousel: React.FC<CarouselProps> = ({
    items,
    showNavigation = true
}) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const goNext = () => setActiveIndex(i => (i + 1) % items.length);
    const goPrev = () => setActiveIndex(i => (i - 1 + items.length) % items.length);

    if (items.length === 0) return null;

    return (
        <div style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Slides container */}
            <div style={{
                display: 'flex',
                transition: 'transform var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-emphasized)',
                transform: `translateX(-${activeIndex * 100}%)`
            }}>
                {items.map(item => (
                    <div
                        key={item.id}
                        style={{
                            flex: '0 0 100%',
                            minWidth: '100%'
                        }}
                    >
                        {item.content}
                    </div>
                ))}
            </div>

            {/* Navigation */}
            {showNavigation && items.length > 1 && (
                <>
                    <button
                        onClick={goPrev}
                        style={{
                            position: 'absolute',
                            left: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: 'none',
                            background: 'var(--md-sys-color-surface-container-high)',
                            color: 'var(--md-sys-color-on-surface)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.8
                        }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={goNext}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: 'none',
                            background: 'var(--md-sys-color-surface-container-high)',
                            color: 'var(--md-sys-color-on-surface)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.8
                        }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Dots */}
            {items.length > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '12px'
                }}>
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            style={{
                                width: idx === activeIndex ? '20px' : '8px',
                                height: '8px',
                                borderRadius: 'var(--md-sys-shape-corner-full)',
                                border: 'none',
                                background: idx === activeIndex
                                    ? 'var(--md-sys-color-primary)'
                                    : 'var(--md-sys-color-surface-variant)',
                                cursor: 'pointer',
                                transition: 'all var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard)'
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
