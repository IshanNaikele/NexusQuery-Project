function showMessage(pageId, message, type = 'info') {
    const messageElement = document.getElementById(`${pageId}-message`);
    if (!messageElement) {
        console.error(`Message element not found: ${pageId}-message`);
        return;
    }
    
    // Clear existing classes
    messageElement.className = 'message-display';
    
    // Add type class
    messageElement.classList.add(type);
    
    // Set message
    messageElement.textContent = message;
    
    // Auto-hide after 5 seconds for non-error messages
    if (type !== 'error') {
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'message-display';
        }, 5000);
    }
}

function clearMessage(pageId) {
    const messageElement = document.getElementById(`${pageId}-message`);
    if (messageElement) {
        messageElement.textContent = '';
        messageElement.className = 'message-display';
    }
}

// Make functions available globally immediately
window.showMessage = showMessage;
window.clearMessage = clearMessage;

// Also log to console for debugging
console.log('Logger.js loaded - showMessage and clearMessage are now available');