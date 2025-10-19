// app.js - Main application dashboard

function displayUserInfo() {
    if (currentUser) {
        const userInfo = document.getElementById('user-info');
        userInfo.textContent = `Logged in as: ${currentUser.email}`;
    }
}

setInterval(() => {
    if (document.getElementById('page-app') && document.getElementById('page-app').classList.contains('active')) {
        displayUserInfo();
    }
}, 500);

async function checkBackendStatus() {
    const messageEl = document.getElementById('app-message');
    messageEl.textContent = 'Checking backend connection...';
    messageEl.className = 'message-display info';
    
    try {
        const status = await callBackend('/auth/status');
        messageEl.textContent = 'Backend is connected and running successfully!';
        messageEl.className = 'message-display success';
        console.log('Status:', status);
        
        setTimeout(() => {
            messageEl.textContent = '';
            messageEl.className = 'message-display';
        }, 5000);
    } catch (error) {
        messageEl.textContent = 'Unable to connect to backend. Please check if the server is running.';
        messageEl.className = 'message-display error';
    }
}

async function checkBackendQuery() {
    const messageEl = document.getElementById('app-message');
    messageEl.textContent = 'Running your query...';
    messageEl.className = 'message-display info';
    
    try {
        const result = await callBackend('/api/query');
        messageEl.textContent = 'Query executed successfully! Check console for details.';
        messageEl.className = 'message-display success';
        console.log('Query Result:', result);
        
        setTimeout(() => {
            messageEl.textContent = '';
            messageEl.className = 'message-display';
        }, 5000);
    } catch (error) {
        messageEl.textContent = 'Query failed. Please try again or check your connection.';
        messageEl.className = 'message-display error';
    }
}

async function handleLogout() {
    const messageEl = document.getElementById('app-message');
    messageEl.textContent = 'Logging you out...';
    messageEl.className = 'message-display info';
    
    try {
        await callBackend('/auth/logout', 'POST');
        await auth.signOut();
        messageEl.textContent = 'Logged out successfully!';
        messageEl.className = 'message-display success';
        setTimeout(() => {
            showPage('signin');
        }, 1000);
    } catch (error) {
        messageEl.textContent = 'Logout failed. Please try again.';
        messageEl.className = 'message-display error';
    }
}

window.checkBackendStatus = checkBackendStatus;
window.checkBackendQuery = checkBackendQuery;
window.handleLogout = handleLogout;