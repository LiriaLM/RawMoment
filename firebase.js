
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCuKf-yv9pLpqmwMycvTv8HKQhaTEnvjcs",
  authDomain: "fb-app-tutorial-963b7.firebaseapp.com",
  projectId: "fb-app-tutorial-963b7",
  storageBucket: "fb-app-tutorial-963b7.appspot.com",
  messagingSenderId: "787200378780",
  appId: "1:787200378780:web:7155b4e057ad09ff3c6a59",
  measurementId: "G-TJ2SB4H8Q4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializamos Autenticacion
export const auth = getAuth(app);

// Inicializamos Firestore
export const db = getFirestore(app)

// Inicializamos Storage
export const storage = getStorage(app)

