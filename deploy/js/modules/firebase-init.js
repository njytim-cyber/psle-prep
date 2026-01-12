// --- Firebase Configuration ---
// REPLACE WITH YOUR KEYS
const firebaseConfig = {
    apiKey: "AIzaSyBfgkN6Omek66GTwB75wMPxr-KvCnOMN1I",
    authDomain: "psle-prep.firebaseapp.com",
    projectId: "psle-prep",
    storageBucket: "psle-prep.firebasestorage.app",
    messagingSenderId: "883312014769",
    appId: "1:883312014769:web:b845c3cc48c164f23df990",
    measurementId: "G-WXBHDL7RKB"
};

// Initialize Firebase
let firebaseApp, auth, db;
try {
    // Determine if Firebase is loaded (it should be via script tags in index.html)
    // We are using the compat libraries so 'firebase' global exists
    if (typeof firebase !== 'undefined') {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
    } else {
        console.error("Firebase SDK not found. Make sure to load it in index.html");
    }
} catch (e) {
    console.error("Firebase initialization failed:", e);
}

export { auth, db, firebaseApp };
