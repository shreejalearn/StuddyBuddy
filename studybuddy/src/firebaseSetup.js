import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import serviceAccount from './serviceKey.json'; // Import service account JSON directly

// Your Firebase configuration (can be obtained from Firebase Console)
const firebaseConfig = {
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export Firebase authentication and firestore
export const auth = firebase.auth();
export const firestore = firebase.firestore(); 

// Export the Firebase app instance
export default firebase;
