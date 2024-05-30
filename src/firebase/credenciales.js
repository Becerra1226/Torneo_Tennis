import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: "AIzaSyDJktQZR4iMZFTBQQun_QhhCOxHh2_wdE4",
  authDomain: "torneo-tennis.firebaseapp.com",
  projectId: "torneo-tennis",
  storageBucket: "torneo-tennis.appspot.com",
  messagingSenderId: "867691035832",
  appId: "1:867691035832:web:0c01e3f625caa6685a884d",
  measurementId: "G-E26LCNVK0C"
};
const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp;