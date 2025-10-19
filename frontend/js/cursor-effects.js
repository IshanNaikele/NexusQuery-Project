// js/cursor-effects.js - Cursor particle effect system

let cursorFXEnabled = false;
const colors = ['#00d9ff', '#7b2ff7', '#ff00ff', '#00ff88', '#ffaa00'];
let lastX = 0;
let lastY = 0;
let lastParticleTime = 0;
const particleDelay = 50;

function createParticle(x, y) {
    if (!cursorFXEnabled) return;

    const particle = document.createElement('div');
    particle.className = 'cursor-particle';
    
    const size = Math.random() * 25 + 15;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.background = `radial-gradient(circle, ${color}, transparent)`;
    particle.style.boxShadow = `0 0 30px ${color}`;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 1000);
}

document.addEventListener('mousemove', (e) => {
    if (cursorFXEnabled) {
        const now = Date.now();
        if (now - lastParticleTime > particleDelay) {
            createParticle(e.clientX, e.clientY);
            lastParticleTime = now;
        }
    }
    
    lastX = e.clientX;
    lastY = e.clientY;
});

function setupCursorEffects() {
    const toggleBtn = document.getElementById('cursorToggle');
    const toggleText = document.getElementById('toggleText');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            cursorFXEnabled = !cursorFXEnabled;
            toggleText.textContent = cursorFXEnabled ? 'Cursor FX On' : 'Cursor FX Off';
            toggleBtn.style.background = cursorFXEnabled ? 
                'linear-gradient(90deg, rgba(0, 217, 255, 0.3), rgba(123, 47, 247, 0.3))' : 
                'rgba(255, 255, 255, 0.1)';
        });
    }

    setInterval(() => {
        if (cursorFXEnabled && lastX && lastY) {
            if (Math.random() > 0.5) {
                const offsetX = (Math.random() - 0.5) * 50;
                const offsetY = (Math.random() - 0.5) * 50;
                createParticle(lastX + offsetX, lastY + offsetY);
            }
        }
    }, 30);
}

window.setupCursorEffects = setupCursorEffects;