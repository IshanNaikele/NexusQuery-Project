// js/animations.js - Initialize all animations and effects

function initializeAnimations() {
    if (typeof createNetworkBackground === 'function') {
        createNetworkBackground();
    }
    
    if (typeof setupCursorEffects === 'function') {
        setupCursorEffects();
    }
}

document.addEventListener('DOMContentLoaded', initializeAnimations);

function scrollToForm() {
    const rightSection = document.querySelector('.right-section');
    if (rightSection) {
        rightSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

window.scrollToForm = scrollToForm;