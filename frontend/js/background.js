// js/background.js - Network background animation

function createNetworkBackground() {
    const bg = document.getElementById('networkBg');
    if (!bg) return;
    
    const nodes = [];
    const nodeCount = 30;

    for (let i = 0; i < nodeCount; i++) {
        const node = document.createElement('div');
        node.className = 'network-node';
        node.style.left = Math.random() * 100 + '%';
        node.style.top = Math.random() * 100 + '%';
        node.style.animationDelay = Math.random() * 3 + 's';
        bg.appendChild(node);
        nodes.push({
            element: node,
            x: parseFloat(node.style.left),
            y: parseFloat(node.style.top)
        });
    }

    // Create lines between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 25) {
                const line = document.createElement('div');
                line.className = 'network-line';
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                line.style.width = distance + '%';
                line.style.left = nodes[i].x + '%';
                line.style.top = nodes[i].y + '%';
                line.style.transform = `rotate(${angle}deg)`;
                bg.appendChild(line);
            }
        }
    }
}

window.createNetworkBackground = createNetworkBackground;