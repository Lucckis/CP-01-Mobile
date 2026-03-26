import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtYfF4HOi_YidoCjcaOolKhqokeZtvrac",
  authDomain: "app-notas-64dd1.firebaseapp.com",
  projectId: "app-notas-64dd1",
  storageBucket: "app-notas-64dd1.firebasestorage.app",
  messagingSenderId: "366626800281",
  appId: "1:366626800281:web:e2a56c49b00cc342a46e08"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);