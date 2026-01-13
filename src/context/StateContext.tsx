import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { papers as initialPapers } from '../data/papers';
import { DEFAULT_EXAM_SETTINGS } from '../data/constants';

export interface Paper {
    title: string;
    year: number;
    school: string;
    term: string;
    level: string;
    subject: string;
    url: string; // Original URL
    file_path: string; // Relative path to PDF
    pdf_link?: string;
}

export interface TrackerItem {
    completed?: boolean;
    notes?: string;
    date?: string;
    score?: number;
    // other specific fields
}

export interface TrackerData {
    [key: string]: TrackerItem;
}

export interface Filters {
    subject: string[];
    term: string[];
    level: string[];
    year: number[];
    school: string[];
    sort: 'year_desc' | 'year_asc' | 'school';
}

export interface XPStats {
    overall: { lvl: number; progress: number; pct: number };
    subjects: {
        Maths: { lvl: number; progress: number; pct: number };
        Science: { lvl: number; progress: number; pct: number };
        English: { lvl: number; progress: number; pct: number };
    };
}

const XP_WEIGHTS: { [key: string]: number } = {
    'SA1': 100, 'SA2': 100, 'Prelim': 120, 'Final Exam': 120,
    'WA1': 50, 'WA2': 50, 'WA3': 50, 'CA1': 50, 'CA2': 50
};
const DEFAULT_XP = 30;

interface StateContextType {
    papers: Paper[];
    trackerData: TrackerData;
    setTrackerData: React.Dispatch<React.SetStateAction<TrackerData>>;
    userAvatar: string | undefined;
    setUserAvatar: (avatar: string) => void;
    examPlannerSettings: any;
    setExamPlannerSettings: (settings: any) => void;
    saveData: () => Promise<void>;
    loadingData: boolean;
    markComplete: (paperId: string, completed: boolean) => void;
    saveNotes: (paperId: string, notes: string) => void;
    // New Fields
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    xpStats: XPStats;
}

const StateContext = createContext<StateContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useStateContext = () => {
    const context = useContext(StateContext);
    if (!context) throw new Error("useStateContext must be used within a StateProvider");
    return context;
};

export const StateProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [papers] = useState<Paper[]>(initialPapers);
    const [trackerData, setTrackerData] = useState<TrackerData>({});
    const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
    const [examPlannerSettings, setExamPlannerSettings] = useState(JSON.parse(JSON.stringify(DEFAULT_EXAM_SETTINGS)));
    const [loadingData, setLoadingData] = useState(true);

    // Global Filters
    const [filters, setFilters] = useState<Filters>({
        subject: [],
        term: [],
        level: [],
        year: [],
        school: [],
        sort: 'year_desc'
    });

    // Calculate XP Stats (Memoized)
    const xpStats = useMemo(() => {
        let totalXP = 0;
        const subjectXP: { [key: string]: number } = { 'Maths': 0, 'Science': 0, 'English': 0 };
        const dailySubjectCompletions: { [date: string]: { [subj: string]: number } } = {};

        for (const filePath in trackerData) {
            const item = trackerData[filePath];
            if (item.date && item.completed) {
                const paper = papers.find(p => p.file_path === filePath);
                // Fallback for mock papers if not found in list
                const subj = paper?.subject || 'Maths';
                const term = paper?.term || '';

                // Streak Logic
                const date = item.date;
                if (!dailySubjectCompletions[date]) dailySubjectCompletions[date] = {};
                if (!dailySubjectCompletions[date][subj]) dailySubjectCompletions[date][subj] = 0;
                dailySubjectCompletions[date][subj]++;

                let xp = XP_WEIGHTS[term] || DEFAULT_XP;

                // Bonus for 2nd paper in same subject same day
                if (dailySubjectCompletions[date][subj] === 2) {
                    xp = Math.round(xp * 1.5);
                }

                totalXP += xp;
                if (subjectXP[subj] !== undefined) subjectXP[subj] += xp;
            }
        }

        const getLevelInfo = (xp: number) => {
            const lvl = Math.floor(xp / 500) + 1;
            const progress = xp % 500;
            return { lvl, progress, pct: (progress / 500) * 100 };
        };

        return {
            overall: getLevelInfo(totalXP),
            subjects: {
                Maths: getLevelInfo(subjectXP['Maths']),
                Science: getLevelInfo(subjectXP['Science']),
                English: getLevelInfo(subjectXP['English'])
            }
        };

    }, [papers, trackerData]);


    // Load Data
    useEffect(() => {
        const loadUserData = async () => {
            if (!user) {
                setTrackerData({});
                setUserAvatar(undefined);
                setLoadingData(false);
                return;
            }

            setLoadingData(true);
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTrackerData(data.trackerData || {});
                    setUserAvatar(data.userAvatar);
                    if (data.examPlannerSettings) {
                        setExamPlannerSettings(data.examPlannerSettings);
                    }
                }
            } catch (error) {
                console.error("Failed to load user data:", error);
            } finally {
                setLoadingData(false);
            }
        };

        loadUserData();
    }, [user]);

    // Save Data
    const saveData = async () => {
        if (!user) return;
        try {
            // Clean up empty entries
            const cleanTrackerData: TrackerData = {};
            for (const key in trackerData) {
                const item = trackerData[key];
                // Keep if completed or has notes/date
                if (item.completed || (item.notes && item.notes.trim()) || item.date) {
                    cleanTrackerData[key] = item;
                }
            }

            await setDoc(doc(db, 'users', user.uid), {
                trackerData: cleanTrackerData,
                userAvatar,
                examPlannerSettings,
                lastUpdated: serverTimestamp()
            }, { merge: true });
            // console.log("Data saved successfully");
        } catch (error) {
            console.error("Save failed:", error);
        }
    };

    const markComplete = (paperId: string, completed: boolean) => {
        setTrackerData(prev => ({
            ...prev,
            [paperId]: {
                ...prev[paperId],
                completed,
                date: completed ? new Date().toISOString().split('T')[0] : undefined
            }
        }));
    };

    const saveNotes = (paperId: string, notes: string) => {
        setTrackerData(prev => ({
            ...prev,
            [paperId]: {
                ...prev[paperId],
                notes
            }
        }));
    };

    return (
        <StateContext.Provider value={{
            papers,
            trackerData,
            setTrackerData,
            userAvatar,
            setUserAvatar,
            examPlannerSettings,
            setExamPlannerSettings,
            saveData,
            loadingData,
            markComplete,
            saveNotes,
            filters,
            setFilters,
            xpStats
        }}>
            {children}
        </StateContext.Provider>
    );
};
