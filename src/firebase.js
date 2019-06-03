import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "learning-slack123.firebaseapp.com",
  databaseURL: "https://learning-slack123.firebaseio.com",
  projectId: "learning-slack123",
  storageBucket: "",
  messagingSenderId: "915993528062",
  appId: "1:915993528062:web:cd222661b675bed0"
};

firebase.initializeApp(firebaseConfig);

export default firebase;