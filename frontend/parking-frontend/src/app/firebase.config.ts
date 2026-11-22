// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXuQl87fGZrfFpVUJw_Qv7JYlxdqtzG80",
  authDomain: "green-route-finder-be0e5.firebaseapp.com",
  projectId: "green-route-finder-be0e5",
  storageBucket: "green-route-finder-be0e5.firebasestorage.app",
  messagingSenderId: "573843550357",
  appId: "1:573843550357:web:4184d4c108b22883e22b9c",
  measurementId: "G-L4QYV7PM9W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);