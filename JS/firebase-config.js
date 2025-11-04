// Configuration Firebase pour Ryo-Store
const firebaseConfig = {
    apiKey: "AIzaSyDalvc2P4NoRvx3ooXK0ul5FEpTsE_izIE",
    authDomain: "ryo-store-f3486.firebaseapp.com",
    projectId: "ryo-store-f3486",
    storageBucket: "ryo-store-f3486.firebasestorage.app",
    messagingSenderId: "281230253203",
    appId: "1:281230253203:web:32dd3cf92c8890e5994166"
};

// Initialiser Firebase avec la version compat (v9)
// Note: Ta config utilise les modules ES6, mais pour la compatibilité navigateur on utilise la version compat

// Solution 1: Version Compat (Recommandée pour ton projet)
if (typeof firebase === 'undefined') {
    // Charger Firebase depuis CDN
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
    document.head.appendChild(script);
    
    script.onload = () => {
        const authScript = document.createElement('script');
        authScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js';
        document.head.appendChild(authScript);
        
        authScript.onload = () => {
            const firestoreScript = document.createElement('script');
            firestoreScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';
            document.head.appendChild(firestoreScript);
            
            firestoreScript.onload = () => {
                const storageScript = document.createElement('script');
                storageScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js';
                document.head.appendChild(storageScript);
                
                storageScript.onload = () => {
                    // Initialiser Firebase après chargement de tous les scripts
                    firebase.initializeApp(firebaseConfig);
                    
                    // Références Firebase
                    window.firebaseAuth = firebase.auth();
                    window.firebaseDb = firebase.firestore();
                    window.firebaseStorage = firebase.storage();
                    
                    console.log('Firebase initialisé avec succès!');
                };
            };
        };
    };
} else {
    // Firebase déjà chargé
    firebase.initializeApp(firebaseConfig);
    window.firebaseAuth = firebase.auth();
    window.firebaseDb = firebase.firestore();
    window.firebaseStorage = firebase.storage();
}

// Solution Alternative: Version Modules ES6 (si tu utilises un bundler)
/*
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const app = initializeApp(firebaseConfig);

// Initialiser les services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exporter pour utilisation globale
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseStorage = storage;

export { auth, db, storage };
*/

// Gestion des erreurs de chargement
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'SCRIPT' && e.target.src.includes('firebase')) {
        console.error('Erreur chargement Firebase:', e.error);
        alert('Erreur de chargement de Firebase. Vérifie ta connexion internet.');
    }
});

// Vérifier que Firebase est bien initialisé
function checkFirebaseInitialization() {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        console.log('✅ Firebase est initialisé');
        return true;
    } else {
        console.log('❌ Firebase non initialisé');
        return false;
    }
}

// Exporter la configuration pour d'autres usages
window.firebaseConfig = firebaseConfig;
