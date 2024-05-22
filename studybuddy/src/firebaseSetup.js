import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore'; 

import serviceAccount from './serviceKey.json';



try {
  firebase.initializeApp(serviceAccount);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore(); 
export default firebase;
