import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDL0yQIAK8qoIPWPS_7-B69DOCXwds_a2I",
    authDomain: "harmonair-ap.firebaseapp.com",
    projectId: "harmonair-ap",
    storageBucket: "harmonair-ap.appspot.com",
    messagingSenderId: "313211243492",
    appId: "1:313211243492:web:c4e3795cf7d4c56a6515f1",
    measurementId: "G-PK98LYXY8G",
  };

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, uploadBytes, getDownloadURL };
