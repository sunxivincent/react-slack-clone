import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";


var config = {
  apiKey: "AIzaSyCVtx_FYSniLUJGZRuWRily0K_CP6x7ZNk",
  authDomain: "react-slack-learning.firebaseapp.com",
  databaseURL: "https://react-slack-learning.firebaseio.com",
  projectId: "react-slack-learning",
  storageBucket: "react-slack-learning.appspot.com",
  messagingSenderId: "722537731090",
  appId: "1:722537731090:web:539adddcec664080"
};

firebase.initializeApp(config);

export default firebase;