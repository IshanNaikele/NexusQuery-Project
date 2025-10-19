async function handleEmailSignUp() {
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const messageEl = document.getElementById('signup-message');
    
    if (!email || !password || password.length < 6) {
        messageEl.textContent = 'Please enter a valid email and password (minimum 6 characters)';
        messageEl.className = 'message-display error';
        return;
    }

    messageEl.textContent = 'Creating your account...';
    messageEl.className = 'message-display info';

    try {
        const result = await callBackend('/auth/signup', 'POST', { email, password });
        
        messageEl.textContent = 'Account created successfully! Redirecting to sign in...';
        messageEl.className = 'message-display success';
        
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';

        await auth.signOut(); 
        
        setTimeout(() => {
            showPage('signin');
            const signinMsg = document.getElementById('signin-message');
            signinMsg.textContent = 'Account created! Please sign in with your email and password.';
            signinMsg.className = 'message-display success';
            setTimeout(() => {
                signinMsg.textContent = '';
                signinMsg.className = 'message-display';
            }, 5000);
        }, 3000);
        
    } catch (error) {
        if (error.message.includes('email-already-in-use')) {
            messageEl.textContent = 'This email is already registered. Please sign in instead.';
        } else if (error.message.includes('invalid-email')) {
            messageEl.textContent = 'Please enter a valid email address.';
        } else if (error.message.includes('weak-password')) {
            messageEl.textContent = 'Password is too weak. Please use at least 6 characters.';
        } else {
            messageEl.textContent = 'Failed to create account. Please try again.';
        }
        messageEl.className = 'message-display error';
    }
}

async function handleSendVerificationEmail() {
    const email = document.getElementById('verifyEmail').value.trim();
    const messageEl = document.getElementById('signup-message');
    
    if (!email) {
        messageEl.textContent = 'Please enter your email address';
        messageEl.className = 'message-display error';
        return;
    }

    messageEl.textContent = 'Sending verification email...';
    messageEl.className = 'message-display info';

    try {
        await callBackend('/auth/send-verification-email', 'POST', { email });
        messageEl.textContent = 'Verification email sent! Please check your inbox.';
        messageEl.className = 'message-display success';
    } catch (error) {
        messageEl.textContent = 'Failed to send verification email. Please try again.';
        messageEl.className = 'message-display error';
    }
}

window.handleEmailSignUp = handleEmailSignUp;
window.handleSendVerificationEmail = handleSendVerificationEmail;