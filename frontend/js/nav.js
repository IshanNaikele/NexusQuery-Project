// nav.js - Multi-page navigation

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    const pageElement = document.getElementById(`page-${pageName}`);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    // Clear form inputs when switching pages
    clearFormInputs();
    
    // Clear all messages
    clearAllMessages();
}

function clearFormInputs() {
    document.querySelectorAll('input[type="email"], input[type="password"]').forEach(input => {
        input.value = '';
    });
}

function clearAllMessages() {
    ['signin', 'signup', 'app'].forEach(pageId => {
        if (typeof clearMessage !== 'undefined') {
            clearMessage(pageId);
        }
    });
}

window.showPage = showPage;