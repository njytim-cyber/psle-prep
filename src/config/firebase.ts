import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBfgkN6Omek66GTwB75wMPxr-KvCnOMN1I",
    authDomain: "psle-prep.firebaseapp.com",
    projectId: "psle-prep",
    storageBucket: "psle-prep.firebasestorage.app",
    messagingSenderId: "883312014769",
    appId: "1:883312014769:web:b845c3cc48c164f23df990",
    measurementId: "G-WXBHDL7RKB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
