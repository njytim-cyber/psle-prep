// --- Generic UI Helpers ---

export function toggleDropdown(key, filterState) {
    const el = document.getElementById(`ms-${key}`);
    const wasOpen = el.classList.contains('open');
    // Close all first
    document.querySelectorAll('.multi-select').forEach(e => e.classList.remove('open'));
    if (!wasOpen) {
        el.classList.add('open');
        // Focus search if exists
        const search = el.querySelector('.dropdown-search');
        if (search) setTimeout(() => search.focus(), 50);
    }
}

export function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}
