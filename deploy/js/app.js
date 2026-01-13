import { auth, db } from './modules/firebase-init.js';
import {
    getPapers, setPapers, getTrackerData, setTrackerData,
    getUserAvatar, setUserAvatar, getExamPlannerSettings, setExamPlannerSettings,
    save, updateTrackerItem, isDataLoaded, setDataLoaded, setIsSyncLocked
} from './modules/state.js';
import ViewManager from './modules/view-manager.js';
import { initFilterSystem, renderList, filterAction, toggleOption, filterDropdownOptions } from './modules/list-manager.js';
import { toggleDropdown } from './modules/ui.js';
import { initAnalytics, setSubject, setLevel, setDisplayMode } from './modules/analytics.js';
import { calculateXPState } from './modules/xp.js';
import { calculateExamPrepStats, renderExamPlanMain, saveExamDates } from './modules/exams.js';
import { loadPaper, toggleNotes, saveNotes, handleMainMark, updateMainButton } from './modules/pdf-viewer.js';

// --- Config / Constants ---
const ENCOURAGING_MESSAGES = [
    { title: "🎉 Great Job!", sub: "You're making incredible progress!" },
    { title: "🚀 You Smashed It!", sub: "Another one bites the dust!" },
    { title: "🌟 Absolute Legend!", sub: "Your hard work is paying off!" },
    { title: "🔥 On Fire!", sub: "You're unstoppable today!" },
    { title: "🏆 Winner Winner!", sub: "Leveling up like a pro!" },
    { title: "🦁 Roar!", sub: "You've got the heart of a lion!" },
    { title: "🧠 Mastermind!", sub: "That paper didn't stand a chance!" },
    { title: "⚡ Lightning!", sub: "Finish fast, learn more!" }
];

// --- App Init ---

async function init() {
    // Iframe Detection
    if (window.self !== window.top) {
        document.body.classList.add('is-iframe');
    }

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.multi-select')) {
            document.querySelectorAll('.multi-select').forEach(el => el.classList.remove('open'));
        }
    });

    // Load papers data dynamically
    try {
        const module = await import('./data/papers.js');
        console.log("App: Loaded papers module", module.papers.length);
        setPapers(module.papers);
        renderApp();
    } catch (e) {
        console.error("Failed to load papers:", e);
        // Handle error (maybe show retry button)
    }
}

function renderApp() {
    initFilterSystem(); // Populates filters and renders list
    updateStats();
}

// --- Auth & Data Loading ---

if (auth) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Signed In
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('sidebar').style.display = 'flex';
            document.getElementById('main-view').style.display = 'flex';
            document.getElementById('profile-container').style.display = 'flex';
            document.getElementById('user-photo').src = user.photoURL || 'avatars.webp';
            document.getElementById('user-name').innerText = user.displayName;

            loadUserData();
        } else {
            // Signed Out
            document.getElementById('login-overlay').style.display = 'flex';
            document.getElementById('sidebar').style.display = 'none';
            document.getElementById('main-view').style.display = 'none';
            document.getElementById('profile-container').style.display = 'none';
        }
    });
}

async function loadUserData() {
    if (!auth || !auth.currentUser) return;
    const uid = auth.currentUser.uid;
    showSyncing();

    try {
        const doc = await db.collection('users').doc(uid).get();
        let cloudTracker = {};
        let cloudAvatar = 0;
        let cloudExamSettings = null;

        if (doc.exists) {
            const data = doc.data();
            cloudTracker = data.trackerData || data.tracker || {};
            cloudAvatar = data.userAvatar;
            cloudExamSettings = data.examPlannerSettings || null;
        }

        // Merge
        setTrackerData({ ...cloudTracker, ...getTrackerData() });
        if (cloudAvatar !== undefined) setUserAvatar(cloudAvatar);
        if (cloudExamSettings) setExamPlannerSettings({ ...getExamPlannerSettings(), ...cloudExamSettings });

        setDataLoaded(true);
        showSynced();

        // Updates
        updateStats();
        renderList(); // from list-manager (re-render with checks)
        loadSidebarProfile();

        // Avatar check
        if (getUserAvatar() === undefined) {
            setUserAvatar(-1);
            updateAvatarDisplay(-1);
            setTimeout(openAvatarModal, 500);
        } else {
            updateAvatarDisplay(getUserAvatar());
        }

        // Welcome Summary
        if (!sessionStorage.getItem('welcome_shown')) {
            showWelcomeSummary();
            sessionStorage.setItem('welcome_shown', 'true');
        }

    } catch (e) {
        console.error(e);
        setDataLoaded(true);
        setIsSyncLocked(true);
        document.getElementById('sync-status').innerText = 'Offline Mode ☁️';
    }
}

// --- Sync UI ---
function showSyncing() {
    let el = document.getElementById('sync-indicator');
    if (!el) {
        // Create if missing (though app.js usually expects it created dynamically)
        // Actually current app.js created it.
        return;
    }
    el = document.getElementById('sync-status'); // Sidebar indicator
    if (el) el.innerText = 'Syncing...';
}

function showSynced() {
    const el = document.getElementById('sync-status');
    if (el) el.innerText = '✅ Synced';
}

function showSyncError() {
    const el = document.getElementById('sync-status');
    if (el) el.innerText = '❌ Error';
}

// --- Global Handlers (Attached to Window for HTML onclick compatibility) ---

window.loginGoogle = function () {
    try {
        if (!auth) {
            alert("Firebase Auth not initialized!");
            return;
        }
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(e => alert("Login failed: " + e.message));
    } catch (err) {
        alert("Error: " + err.message);
    }
};

window.openAvatarModal = function () {
    const modal = document.getElementById('avatar-modal');
    const grid = document.getElementById('avatar-grid');
    grid.innerHTML = '';

    // Google Photo
    if (auth.currentUser && auth.currentUser.photoURL) {
        const gDiv = document.createElement('div');
        gDiv.className = `avatar-option ${getUserAvatar() === -1 ? 'selected' : ''}`;
        gDiv.onclick = () => window.setAvatar(-1);
        gDiv.innerHTML = `<img src="${auth.currentUser.photoURL}" style="width:100%; border-radius:50%;">`;
        grid.appendChild(gDiv);
    }

    // Presets
    const AVATARS = [
        "Felix", "Aneka", "Callie", "Liam", "Midnight", "Pepper", "Toby", "Willow",
        "Astra", "Boji", "Coco", "Dino", "Echo", "Finn", "Gigi", "Hugo",
        "Izzy", "Jax", "Koda", "Lulu", "Mochi", "Nala", "Ove", "Puddles",
        "Quill", "Rojo", "Siku", "Taco", "Una", "Vivi", "Wren", "Xena",
        "Yuki", "Zorro", "Ace", "Bean", "Cleo", "Dash", "Enzo", "Fifi",
        "Gus", "Hazel", "Iggy", "Jojo", "Kai", "Lola", "Milo", "Nico",
        "Otto", "Pip", "Rex", "Sia", "Titi", "Uzi", "Vada", "Wally",
        "Xylia", "Yoda", "Zia", "Alpha", "Beta", "Gamma", "Delta", "Epsilon"
    ];

    AVATARS.forEach((name, i) => {
        const div = document.createElement('div');
        div.className = `avatar-option ${getUserAvatar() === i ? 'selected' : ''}`;
        div.onclick = () => window.setAvatar(i);
        const posX = (i % 8) * (100 / 7);
        const posY = Math.floor(i / 8) * (100 / 7);
        div.style.backgroundPosition = `${posX}% ${posY}%`;
        div.title = name;
        grid.appendChild(div);
    });

    modal.classList.add('show');
};

window.setAvatar = function (idx) {
    setUserAvatar(idx);
    updateAvatarDisplay(idx);
    document.getElementById('avatar-modal').classList.remove('show');
    save();
    if (idx >= 0) confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
};

window.closeAvatarModal = function (e) {
    if (e.target.id === 'avatar-modal') e.target.classList.remove('show');
};

window.switchView = function (viewName) {
    ViewManager.show(viewName);
};

window.openAnalytics = function () {
    ViewManager.show('analytics');
    initAnalytics(); // Re-render logic
};

window.showExamPlanView = function () {
    ViewManager.show('exam');
    const container = document.getElementById('exam-view-container'); // Check correct ID from HTML
    // HTML has: id="exam-view" containing id="exam-view-container"
    // exams.js renders into container
    const inner = document.getElementById('exam-view-container');
    if (inner) renderExamPlanMain(inner);
};

window.showXPView = function () {
    ViewManager.show('xp');
    // Implement render XP View if needed, or just static
};

// Functions from PDF Viewer
window.handleMainMark = handleMainMark;
window.toggleNotes = toggleNotes;
window.saveNotes = saveNotes;
window.loadPaper = loadPaper;

// Functions from List Manager / UI
window.toggleDropdown = toggleDropdown;
window.filterAction = filterAction;
window.toggleOption = toggleOption;
window.filterDropdownOptions = filterDropdownOptions;

// Functions from Analytics
window.setSubject = setSubject;
window.setLevel = setLevel;
window.setDisplayMode = setDisplayMode; // Used in analytics view

// Functions for Modal
let pendingCompletion = null;
const dateInput = document.getElementById('completion-date');
const modal = document.getElementById('modal');

// Event Listener for Modal Open
document.addEventListener('open-completion-modal', (e) => {
    pendingCompletion = e.detail; // URL
    dateInput.valueAsDate = new Date();
    const msg = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
    document.getElementById('modal-congrats').innerText = msg.title;
    document.getElementById('modal-subtext').innerText = msg.sub + " When did you finish this?";
    modal.style.display = 'flex';
});

window.saveCompletion = function () {
    if (!pendingCompletion || !dateInput.value) return;
    updateTrackerItem(pendingCompletion, { date: dateInput.value });
    save({
        onSyncSuccess: () => {
            modal.style.display = 'none';
            triggerConfetti();
        }
    });
    // Force UI Refresh
    updateStats();
    renderList();
    updateMainButton(); // If viewing PDF
    modal.style.display = 'none';
    pendingCompletion = null;
    triggerConfetti();
};

window.closeModal = function () {
    modal.style.display = 'none';
    pendingCompletion = null;
};


// Helpers
function updateStats() {
    const doneCount = Object.values(getTrackerData()).filter(d => d.date).length;
    const total = getPapers().length;
    const percentage = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    const completedEl = document.getElementById('completed-stat');
    const percentEl = document.getElementById('percent-stat');
    const examPrepEl = document.getElementById('exam-prep-stat');

    if (completedEl) completedEl.innerText = doneCount;
    if (percentEl) percentEl.innerText = `${percentage}%`;
    if (examPrepEl) examPrepEl.innerText = `${calculateExamPrepStats()}%`;

    // XP
    const xpState = calculateXPState();
    const prefix = 'profile';
    const lvlBadge = document.getElementById(`${prefix}-level-badge`);
    const xpText = document.getElementById(`${prefix}-xp-text`);
    const xpFill = document.getElementById(`${prefix}-xp-fill`);

    if (lvlBadge) lvlBadge.innerText = `Lvl ${xpState.overall.lvl}`;
    if (xpText) xpText.innerText = `${xpState.overall.progress} / 500 XP`;
    if (xpFill) xpFill.style.width = `${xpState.overall.pct}%`;
}

function updateAvatarDisplay(idx) {
    const el = document.getElementById('user-photo');
    if (!el) return;

    // We import AVATARS? No need for name here.
    if (idx === -1 || idx === undefined) {
        if (auth.currentUser && auth.currentUser.photoURL) {
            el.style.backgroundImage = `url('${auth.currentUser.photoURL}')`;
            el.style.backgroundSize = 'cover';
        }
    } else {
        el.style.backgroundImage = "url('avatars.webp')";
        el.style.backgroundSize = '800% 800%';
        const posX = (idx % 8) * (100 / 7);
        const posY = Math.floor(idx / 8) * (100 / 7);
        el.style.backgroundPosition = `${posX}% ${posY}%`;
    }
}

function loadSidebarProfile() {
    const label = document.getElementById('notes-header-label');
    const displayName = auth.currentUser ? auth.currentUser.displayName : 'Guest';
    if (label) label.innerText = `📝 ${displayName}'s Field Notes`;
}

function triggerConfetti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#f43f5e', '#10b981', '#fbbf24']
    });
}

function showWelcomeSummary() {
    // ... logic for welcome summary ...
    // Using simple version for brevity as logic was largely copied
    if (!auth.currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    const trackerData = getTrackerData();
    let todayCount = 0;

    for (const url in trackerData) {
        if (trackerData[url].date === today) todayCount++;
    }

    document.getElementById('welcome-today-count').innerText = todayCount;
    const name = auth.currentUser.displayName ? auth.currentUser.displayName.split(' ')[0] : 'there';
    document.getElementById('welcome-title').innerText = `Welcome back, ${name}! 👋`;
    document.getElementById('welcome-modal').classList.add('show');
}
window.closeWelcomeModal = function () {
    document.getElementById('welcome-modal').classList.remove('show');
};

// Run Init
window.addEventListener('DOMContentLoaded', init);

export default init;
