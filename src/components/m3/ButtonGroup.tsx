import React from 'react';

interface ButtonGroupProps {
    options: string[];
    selected: string;
    onChange: (value: string) => void;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
    options,
    selected,
    onChange
}) => {
    return (
        <div style={{
            display: 'inline-flex',
            borderRadius: 'var(--md-sys-shape-corner-full)',
            overflow: 'hidden',
            border: '1px solid var(--md-sys-color-outline)'
        }}>
            {options.map((option, idx) => {
                const isSelected = selected === option;
                const isFirst = idx === 0;
                const isLast = idx === options.length - 1;

                return (
                    <button
                        key={option}
                        onClick={() => onChange(option)}
                        style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderLeft: isFirst ? 'none' : '1px solid var(--md-sys-color-outline)',
                            background: isSelected
                                ? 'var(--md-sys-color-primary)'
                                : 'transparent',
                            color: isSelected
                                ? 'var(--md-sys-color-on-primary)'
                                : 'var(--md-sys-color-on-surface)',
                            font: 'var(--md-sys-typescale-label-large)',
                            cursor: 'pointer',
                            transition: 'all var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard)'
                        }}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    );
};
