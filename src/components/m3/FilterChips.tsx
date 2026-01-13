import React from 'react';
import { X } from 'lucide-react';

interface FilterChipsProps {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
    label,
    options,
    selected,
    onChange
}) => {
    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const clearAll = () => onChange([]);

    return (
        <div style={{ marginBottom: '16px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
            }}>
                <span style={{
                    font: 'var(--md-sys-typescale-label-medium)',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {label}
                </span>
                {selected.length > 0 && (
                    <button
                        onClick={clearAll}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--md-sys-color-primary)',
                            font: 'var(--md-sys-typescale-label-small)',
                            cursor: 'pointer',
                            padding: '2px 6px'
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px'
            }}>
                {options.map(option => {
                    const isSelected = selected.includes(option);
                    return (
                        <button
                            key={option}
                            onClick={() => toggleOption(option)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                borderRadius: 'var(--md-sys-shape-corner-small)',
                                border: `1px solid ${isSelected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
                                background: isSelected ? 'var(--md-sys-color-primary-container)' : 'transparent',
                                color: isSelected ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface-variant)',
                                font: 'var(--md-sys-typescale-label-medium)',
                                cursor: 'pointer',
                                transition: 'all var(--md-sys-motion-duration-short3) var(--md-sys-motion-easing-standard)'
                            }}
                        >
                            {isSelected && <X size={12} />}
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
