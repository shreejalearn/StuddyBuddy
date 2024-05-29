import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-yw2Y-ErogauUgrZaLMwHn_xXsnyE-JE",
  authDomain: "study-buddy-6f0b9.firebaseapp.com",
  databaseURL: "https://study-buddy-6f0b9-default-rtdb.firebaseio.com",
  projectId: "study-buddy-6f0b9",
  storageBucket: "study-buddy-6f0b9.appspot.com",
  messagingSenderId: "151813698029",
  appId: "1:151813698029:web:c56a9a38c43ea51c8537e4",
  measurementId: "G-SV2TV5PPPV"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, auth };