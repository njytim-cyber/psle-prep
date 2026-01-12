// --- View Manager ---
const ViewManager = {
    views: ['results', 'pdf', 'analytics', 'exam', 'xp'],
    active: 'results',

    init() {
        // Set initial state
        this.show('results');
    },

    show(viewName) {
        if (!this.views.includes(viewName)) return;
        this.active = viewName;

        // 1. Hide all views strictly
        this.views.forEach(v => {
            const el = document.getElementById(`${v}-view`);
            if (el) {
                el.classList.add('hidden');
                el.style.setProperty('display', 'none', 'important'); // Double safety
            }
        });

        // 2. Show target view
        const target = document.getElementById(`${viewName}-view`);
        if (target) {
            target.classList.remove('hidden');
            const displayType = (viewName === 'pdf') ? 'flex' : 'block';
            target.style.setProperty('display', displayType, 'important');
        }
    },

    is(viewName) {
        return this.active === viewName;
    }
};

export default ViewManager;
