// api.js - Shared backend communication

let currentUser = null;

async function callBackend(endpoint, method = 'GET', body = null) {
    // Wait for Firebase to be initialized
    if (!auth || !isInitialized) {
        throw new Error('Firebase not initialized yet. Please wait...');
    }
    
    let token = null;
    if (currentUser) {
        token = await currentUser.getIdToken();
    }

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || `HTTP ${response.status}`);
        }
        return data;
    } catch (error) {
        throw error;
    }
}

function handleAuthStateChange(user) {
    if (user) {
        currentUser = user;
        showPage('app');
        console.log('User authenticated! UID:', user.uid);
    } else {
        currentUser = null;
        const currentPage = document.querySelector('.page.active');
        if (currentPage && currentPage.id !== 'page-signup') {
            showPage('signin');
        }
    }
}