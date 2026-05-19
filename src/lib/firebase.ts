import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA0OIg841Vxivq1Id-ICfdm53MJ2UaxKo8",
  authDomain: "easy-done-1b4fc.firebaseapp.com",
  databaseURL: "https://easy-done-1b4fc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "easy-done-1b4fc",
  storageBucket: "easy-done-1b4fc.firebasestorage.app",
  messagingSenderId: "461802678479",
  appId: "1:461802678479:web:a3b0234d4bd443346f2fba",
  measurementId: "G-64T5GBFJS9"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
