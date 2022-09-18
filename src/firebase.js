import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
} from "firebase/firestore";
import { useState } from "react";

// Context Providers

// Import the functions you need from the SDKs you need

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCL6ypPUn_4iEzyvYceBzkhmvsCjtNHOU4",
  authDomain: "todo-fcf0a.firebaseapp.com",
  projectId: "todo-fcf0a",
  storageBucket: "todo-fcf0a.appspot.com",
  messagingSenderId: "314166667151",
  appId: "1:314166667151:web:b57b0ee69ada8208fc0dfa",
  measurementId: "G-4LD91TMJYL",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

const SignInWithGoogle = async () => {
  try {
    const date = new Date();
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: user.displayName,
        authProvider: "google",
        email: user.email,
        picture: user.photoURL,
        registered: new Date(),
      });
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};
const logout = () => {
  signOut(auth);
};

export { auth, db, SignInWithGoogle, logout };
