// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAmkqrZst5N2kceaRG30EzQ-35N1c28N7w",
  authDomain: "stocksaas-ea94b.firebaseapp.com",
  projectId: "stocksaas-ea94b",
  storageBucket: "stocksaas-ea94b.firebasestorage.app",
  messagingSenderId: "1094509471741",
  appId: "1:1094509471741:web:76400bc894e5ecd10c9b94",
  measurementId: "G-BX9JXT156S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);