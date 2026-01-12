import { auth, db } from './firebase-init.js';

// --- Global State ---
let allPapers = typeof window.papers !== 'undefined' ? window.papers : [];
let trackerData = {}; // Will be loaded from cloud or local storage
let userAvatar = undefined; // undefined = not set, -1 = Google Photo, 0+ = Avatar Index
let examPlanFilter = 'due'; // 'all' or 'due'
let dataLoaded = false;
let isSyncLocked = false;
let currentUrl = null;

// Default Settings
export const DEFAULT_EXAM_SETTINGS = {
    'P4': { 'WA1': '2026-03-01', 'WA2': '2026-05-01', 'EYE': '2026-11-01' },
    'P5': { 'WA1': '2027-03-01', 'WA2': '2027-05-01', 'EYE': '2027-11-01' },
    'P6': { 'WA1': '2028-03-01', 'WA2': '2028-05-01', 'EYE': '2028-11-01' }
};

let examPlannerSettings = JSON.parse(JSON.stringify(DEFAULT_EXAM_SETTINGS));
let selectedExamGoal = null;

// Avatars
export const AVATARS = [
    "Felix", "Aneka", "Callie", "Liam", "Midnight", "Pepper", "Toby", "Willow",
    "Astra", "Boji", "Coco", "Dino", "Echo", "Finn", "Gigi", "Hugo",
    "Izzy", "Jax", "Koda", "Lulu", "Mochi", "Nala", "Ove", "Puddles",
    "Quill", "Rojo", "Siku", "Taco", "Una", "Vivi", "Wren", "Xena",
    "Yuki", "Zorro", "Ace", "Bean", "Cleo", "Dash", "Enzo", "Fifi",
    "Gus", "Hazel", "Iggy", "Jojo", "Kai", "Lola", "Milo", "Nico",
    "Otto", "Pip", "Rex", "Sia", "Titi", "Uzi", "Vada", "Wally",
    "Xylia", "Yoda", "Zia", "Alpha", "Beta", "Gamma", "Delta", "Epsilon"
];

// --- Getters & Setters ---

// Papers
export const getPapers = () => allPapers;
export const setPapers = (papers) => { allPapers = papers; };

// Tracker Data
export const getTrackerData = () => trackerData;
export const setTrackerData = (data) => { trackerData = data; };
export const updateTrackerItem = (url, data) => {
    if (!trackerData[url]) trackerData[url] = {};
    trackerData[url] = { ...trackerData[url], ...data };
};
export const getTrackerItem = (url) => trackerData[url];

// Avatar
export const getUserAvatar = () => userAvatar;
export const setUserAvatar = (avatar) => { userAvatar = avatar; };

// Exam Settings
export const getExamPlannerSettings = () => examPlannerSettings;
export const setExamPlannerSettings = (settings) => { examPlannerSettings = settings; };
export const getExamPlanFilter = () => examPlanFilter;
export const setExamPlanFilter = (filter) => { examPlanFilter = filter; };

export const getSelectedExamGoal = () => selectedExamGoal;
export const setSelectedExamGoal = (goal) => { selectedExamGoal = goal; };

// Flags
export const isDataLoaded = () => dataLoaded;
export const setDataLoaded = (val) => { dataLoaded = val; };
export const getIsSyncLocked = () => isSyncLocked;
export const setIsSyncLocked = (val) => { isSyncLocked = val; };

export const getCurrentUrl = () => currentUrl;
export const setCurrentUrl = (url) => { currentUrl = url; };

// --- Sync Logic ---

export async function save(callbacks = {}) {
    const { onSyncStart, onSyncSuccess, onSyncError, onUpdateUI } = callbacks;

    if (!dataLoaded) {
        console.warn("Save blocked: Cloud data not yet loaded.");
        return;
    }

    if (isSyncLocked) {
        console.warn("Save blocked: Sync is locked due to load error.");
        if (onSyncError) onSyncError('offline');
        return;
    }

    // Clean up empty entries
    for (const key in trackerData) {
        if (!trackerData[key].date && (!trackerData[key].notes || !trackerData[key].notes.trim())) {
            delete trackerData[key];
        }
    }

    // Optimistic UI Update
    if (onUpdateUI) onUpdateUI();

    // Push to Cloud if logged in
    if (auth && auth.currentUser) {
        try {
            if (onSyncStart) onSyncStart();

            await db.collection('users').doc(auth.currentUser.uid).set({
                trackerData: trackerData,
                userAvatar: userAvatar,
                examPlannerSettings: examPlannerSettings,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            if (onSyncSuccess) onSyncSuccess();
        } catch (e) {
            console.error("Cloud save failed:", e);
            if (onSyncError) onSyncError(e);
        }
    }
}
