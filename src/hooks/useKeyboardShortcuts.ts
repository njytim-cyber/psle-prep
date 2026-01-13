import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutHandlers {
    onToggleTimer?: () => void;
    onMarkComplete?: () => void;
}

export const useKeyboardShortcuts = (handlers?: ShortcutHandlers) => {
    const navigate = useNavigate();

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Ignore if typing in an input
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return;
        }

        // Navigation shortcuts (with Alt key)
        if (event.altKey) {
            switch (event.key.toLowerCase()) {
                case 'h':
                    event.preventDefault();
                    navigate('/');
                    break;
                case 'a':
                    event.preventDefault();
                    navigate('/analytics');
                    break;
                case 'e':
                    event.preventDefault();
                    navigate('/exam');
                    break;
                case 'x':
                    event.preventDefault();
                    navigate('/xp');
                    break;
            }
        }

        // Action shortcuts (without modifiers)
        switch (event.key) {
            case '?':
                // Show shortcuts help (handled by parent)
                event.preventDefault();
                document.dispatchEvent(new CustomEvent('show-shortcuts-help'));
                break;
            case 'p':
                // Toggle pomodoro
                if (!event.ctrlKey && !event.altKey && handlers?.onToggleTimer) {
                    event.preventDefault();
                    handlers.onToggleTimer();
                }
                break;
            case ' ':
                // Mark complete (space)
                if (handlers?.onMarkComplete) {
                    event.preventDefault();
                    handlers.onMarkComplete();
                }
                break;
        }
    }, [navigate, handlers]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};

// Shortcut definitions for help modal
export const SHORTCUTS = [
    {
        category: 'Navigation', shortcuts: [
            { keys: ['Alt', 'H'], description: 'Go to Home' },
            { keys: ['Alt', 'A'], description: 'Go to Analytics' },
            { keys: ['Alt', 'E'], description: 'Go to Exam Plan' },
            { keys: ['Alt', 'X'], description: 'Go to XP System' },
        ]
    },
    {
        category: 'Actions', shortcuts: [
            { keys: ['P'], description: 'Toggle Pomodoro Timer' },
            { keys: ['Space'], description: 'Mark paper complete (when viewing)' },
            { keys: ['?'], description: 'Show keyboard shortcuts' },
        ]
    }
];
