import React, { useState } from 'react';
import { ChevronRight, Filter } from 'lucide-react';
import { Filters } from '../../context/StateContext';

interface FilterPanelProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    uniqueSubjects: string[];
    uniqueTerms: string[];
    uniqueLevels: string[];
    uniqueYears: number[];
    uniqueSchools: string[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
    filters,
    setFilters,
    uniqueSubjects,
    uniqueTerms,
    uniqueLevels,
    uniqueYears,
    uniqueSchools
}) => {
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
    const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
    const [schoolSearch, setSchoolSearch] = useState('');

    const toggleFilter = (type: 'subject' | 'term' | 'level' | 'year' | 'school', value: string | number) => {
        setFilters(prev => {
            const current = prev[type] as (string | number)[];
            const exists = current.includes(value as never);
            return {
                ...prev,
                [type]: exists
                    ? current.filter(v => v !== value)
                    : [...current, value]
            };
        });
    };

    const FilterButton: React.FC<{
        selected: boolean;
        onClick: () => void;
        children: React.ReactNode;
        style?: React.CSSProperties;
    }> = ({ selected, onClick, children, style }) => (
        <button
            onClick={onClick}
            style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid var(--md-sys-color-outline)',
                background: selected ? 'var(--md-sys-color-primary-container)' : 'transparent',
                color: selected ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                ...style
            }}
        >
            {children}
        </button>
    );

    return (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
            <div
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--md-sys-color-tertiary)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={14} /> FILTERS
                </div>
                <ChevronRight
                    size={14}
                    style={{
                        transform: isFiltersExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                    }}
                />
            </div>

            {isFiltersExpanded && (
                <>
                    {/* Subject Filter */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.8 }}>Subject</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {uniqueSubjects.map(s => (
                                <FilterButton
                                    key={s}
                                    selected={filters.subject.includes(s)}
                                    onClick={() => toggleFilter('subject', s)}
                                >
                                    {s}
                                </FilterButton>
                            ))}
                        </div>
                    </div>

                    {/* Term Filter */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.8 }}>Term</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                            {uniqueTerms.map(t => (
                                <FilterButton
                                    key={t}
                                    selected={filters.term.includes(t)}
                                    onClick={() => toggleFilter('term', t)}
                                    style={{ padding: '4px 6px', textAlign: 'center' }}
                                >
                                    {t}
                                </FilterButton>
                            ))}
                        </div>
                    </div>

                    {/* Level Filter */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.8 }}>Level</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {uniqueLevels.map(l => (
                                <FilterButton
                                    key={l}
                                    selected={filters.level.includes(l)}
                                    onClick={() => toggleFilter('level', l)}
                                >
                                    {l}
                                </FilterButton>
                            ))}
                        </div>
                    </div>

                    {/* Year Filter */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.8 }}>Year</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {uniqueYears.map(y => (
                                <FilterButton
                                    key={y}
                                    selected={filters.year.includes(y)}
                                    onClick={() => toggleFilter('year', y)}
                                >
                                    {y}
                                </FilterButton>
                            ))}
                        </div>
                    </div>

                    {/* School Filter */}
                    <div style={{ marginBottom: '16px', position: 'relative' }}>
                        <div style={{ fontSize: '0.8rem', marginBottom: '8px', opacity: 0.8 }}>School</div>
                        <button
                            onClick={() => setIsSchoolDropdownOpen(!isSchoolDropdownOpen)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '12px',
                                border: '1px solid var(--md-sys-color-outline)',
                                background: 'var(--md-sys-color-surface-container-high)',
                                color: 'var(--md-sys-color-on-surface)',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                textAlign: 'left'
                            }}
                        >
                            <span style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginRight: '8px'
                            }}>
                                {filters.school.length === 0
                                    ? 'All Schools'
                                    : filters.school.length === 1
                                        ? filters.school[0]
                                        : `${filters.school.length} Schools selected`}
                            </span>
                            <ChevronRight size={16} style={{
                                transform: isSchoolDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                                flexShrink: 0
                            }} />
                        </button>

                        {isSchoolDropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                marginTop: '4px',
                                background: 'var(--md-sys-color-surface-container-highest)',
                                border: '1px solid var(--md-sys-color-outline-variant)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                padding: '12px',
                                zIndex: 100
                            }}>
                                <input
                                    type="text"
                                    placeholder="Search schools..."
                                    value={schoolSearch}
                                    onChange={(e) => setSchoolSearch(e.target.value)}
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        marginBottom: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--md-sys-color-outline)',
                                        background: 'var(--md-sys-color-surface)',
                                        color: 'var(--md-sys-color-on-surface)',
                                        fontSize: '0.8rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    paddingRight: '4px'
                                }}>
                                    {uniqueSchools
                                        .filter(s => s.toLowerCase().includes(schoolSearch.toLowerCase()))
                                        .map(s => {
                                            const isSelected = filters.school.includes(s);
                                            return (
                                                <button
                                                    key={s}
                                                    onClick={() => toggleFilter('school', s)}
                                                    style={{
                                                        padding: '8px 10px',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        background: isSelected ? 'var(--md-sys-color-primary-container)' : 'transparent',
                                                        color: isSelected ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        width: '100%',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}
                                                    title={s}
                                                >
                                                    <div style={{
                                                        width: '14px',
                                                        height: '14px',
                                                        borderRadius: '3px',
                                                        border: `1.5px solid ${isSelected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
                                                        background: isSelected ? 'var(--md-sys-color-primary)' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        {isSelected && (
                                                            <div style={{
                                                                width: '6px',
                                                                height: '6px',
                                                                background: 'white',
                                                                borderRadius: '1px'
                                                            }} />
                                                        )}
                                                    </div>
                                                    {s}
                                                </button>
                                            );
                                        })}
                                    {uniqueSchools.filter(s => s.toLowerCase().includes(schoolSearch.toLowerCase())).length === 0 && (
                                        <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem', opacity: 0.6 }}>
                                            No schools found
                                        </div>
                                    )}
                                </div>
                                {filters.school.length > 0 && (
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, school: [] }))}
                                        style={{
                                            marginTop: '8px',
                                            width: '100%',
                                            padding: '6px',
                                            background: 'transparent',
                                            border: '1px solid var(--md-sys-color-outline-variant)',
                                            color: 'var(--md-sys-color-primary)',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Clear selection
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
