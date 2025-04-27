import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyAdRmpL8XB1uz-DLbKII0w75yBwe1s7D4A",
  authDomain: "whatapp-d6d8a.firebaseapp.com",
  projectId: "whatapp-d6d8a",
  storageBucket: "whatapp-d6d8a.firebasestorage.app",
  messagingSenderId: "66051827717",
  appId: "1:66051827717:web:22f4afc64d4740692d146c",
  measurementId: "G-Z3W735JYDS"
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
