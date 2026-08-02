


import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-f7f9a.firebaseapp.com",
  projectId: "interviewiq-f7f9a",
  storageBucket: "interviewiq-f7f9a.firebasestorage.app",
  messagingSenderId: "1094170577371",
  appId: "1:1094170577371:web:9c7d4c18977f3d18c83ffe"
};

const app = initializeApp(firebaseConfig);
 const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}