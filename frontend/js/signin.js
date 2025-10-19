async function handleGoogleSignIn() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
    } catch (error) {
        const messageEl = document.getElementById('signin-message');
        messageEl.textContent = 'Google sign-in failed. Please try again.';
        messageEl.className = 'message-display error';
    }
}

async function handleEmailSignIn() {
    const email = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPassword').value;
    const messageEl = document.getElementById('signin-message');
    
    if (!email || !password) {
        messageEl.textContent = 'Please enter both email and password';
        messageEl.className = 'message-display error';
        return;
    }

    messageEl.textContent = 'Signing you in...';
    messageEl.className = 'message-display info';

    try {
        await auth.signInWithEmailAndPassword(email, password);
        // Let Firebase auth state handle the redirect automatically
        
    } catch (error) {
        if (error.message.includes('user-not-found')) {
            messageEl.textContent = 'No account found. Please create an account first.';
        } else if (error.message.includes('wrong-password')) {
            messageEl.textContent = 'Incorrect password. Please try again.';
        } else if (error.message.includes('invalid-credential')) {
            messageEl.textContent = 'Invalid email or password. Please check and try again.';
        } else if (error.message.includes('too-many-requests')) {
            messageEl.textContent = 'Too many failed attempts. Please wait a few minutes and try again.';
        } else {
            messageEl.textContent = 'Sign-in failed. Please check your credentials and try again.';
        }
        messageEl.className = 'message-display error';
    }
}

window.handleGoogleSignIn = handleGoogleSignIn;
window.handleEmailSignIn = handleEmailSignIn;