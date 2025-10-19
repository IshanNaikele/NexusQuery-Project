// config.js - Firebase configuration and initialization

const API_BASE_URL = 'http://localhost:8000';
let firebaseConfig = {};
let app, auth;
let API_URL = API_BASE_URL;
let isInitialized = false;

async function loadConfigAndInitialize() {
    try {
        console.log('Loading Firebase config from backend...');
        
        const response = await fetch(`${API_BASE_URL}/config`);
        if (!response.ok) throw new Error('Failed to fetch config');
        
        const configData = await response.json();
        console.log('Config loaded:', configData);
        
        firebaseConfig = {
            apiKey: configData.apiKey,
            authDomain: configData.authDomain,
            projectId: configData.projectId,
        };
        
        API_URL = configData.API_URL || API_BASE_URL;
        
        // Initialize Firebase
        app = firebase.initializeApp(firebaseConfig);
        auth = app.auth();
        
        console.log('Firebase initialized successfully');
        isInitialized = true;
        
        // Setup auth state listener
        if (typeof handleAuthStateChange !== 'undefined') {
            auth.onAuthStateChanged(handleAuthStateChange);
            console.log('Auth state listener set up');
        }
        
    } catch (error) {
        console.error('Config initialization failed:', error.message);
        alert('Failed to initialize app. Check backend /config endpoint.');
    }
}

// Start initialization immediately
loadConfigAndInitialize();