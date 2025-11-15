import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCXDL6yff9OjnI2rN5SSxs1DMljRShY8hI",
  authDomain: "capstonefinals-4isb.firebaseapp.com",
  projectId: "capstonefinals-4isb",
  storageBucket: "capstonefinals-4isb.appspot.com",
  messagingSenderId: "878447653307",
  appId: "1:878447653307:web:f11a7e6967bf4d15a9549e",
  measurementId: "G-QRY7VXJ5PS",
};
const firebaseConfig2 = {
  apiKey: "AIzaSyCEvU-bYAl_oLvANqXCkBa122y716TQfn4",
  authDomain: "becariostest.firebaseapp.com",
  databaseURL: "https://becariostest-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "becariostest",
  storageBucket: "becariostest.appspot.com",
  messagingSenderId: "932077773845",
  appId: "1:932077773845:web:86f253ff1c7cfa832ada1c",
  measurementId: "G-CZDR3J85R4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const app2 = initializeApp(firebaseConfig2, "App2");
const storage = getStorage(app2);

export { app, db, auth, storage };
