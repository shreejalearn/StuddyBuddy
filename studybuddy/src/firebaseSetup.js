import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import serviceAccount from './serviceKey.json'; 

const firebaseConfig = {
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
};

try {
  firebase.initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore(); 

export default firebase;
