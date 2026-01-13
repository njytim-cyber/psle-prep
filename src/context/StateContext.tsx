import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { papers as initialPapers } from '../data/papers';
import { DEFAULT_EXAM_SETTINGS, AVATARS } from '../data/constants';

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
}

const StateContext = createContext<StateContextType | null>(null);

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
            console.log("Data saved successfully");
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
            saveNotes
        }}>
            {children}
        </StateContext.Provider>
    );
};
