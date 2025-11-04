// Configuration Firebase
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "ryo-store.firebaseapp.com",
    projectId: "ryo-store",
    storageBucket: "ryo-store.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Références Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export des références
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseStorage = storage;
