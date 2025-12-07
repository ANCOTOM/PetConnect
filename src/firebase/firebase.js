import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6ENkS_VW-X92kLHwKn9q7UkVJZIhzYes",
  authDomain: "petconnect-ea714.firebaseapp.com",
  projectId: "petconnect-ea714",
  storageBucket: "petconnect-ea714.firebasestorage.app",
  messagingSenderId: "970752210932",
  appId: "1:970752210932:web:913876c50c2875e2066ba1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

