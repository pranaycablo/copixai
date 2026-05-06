// Core UI helper functions for Landing Page
function showToast(type, title, msg) {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const container = document.getElementById('toastContainer') || document.getElementById('toastBox');
    if (!container) return;
    
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `
        <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-msg">${msg}</div>
        </div>
        <div class="toast-close" onclick="this.parentElement.remove()">×</div>
    `;
    container.appendChild(t);
    setTimeout(() => t.remove(), 5000);
}

function applyGlobalBranding() {
    const regex = /HeroAi/gi;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    let node;
    while(node = walker.nextNode()) {
        const parent = node.parentElement;
        if (parent && !['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'TITLE'].includes(parent.tagName) && !parent.closest('.heroai-glow')) {
            if (node.textContent.match(regex)) {
                nodes.push(node);
            }
        }
    }
    nodes.forEach(node => {
        const parent = node.parentNode;
        if (!parent) return;
        const text = node.textContent;
        const fragment = document.createDocumentFragment();
        let lastIdx = 0;
        text.replace(regex, (match, offset) => {
            fragment.appendChild(document.createTextNode(text.substring(lastIdx, offset)));
            const span = document.createElement('span');
            span.className = 'heroai-glow';
            span.innerHTML = '<span class="h">Hero</span><span class="a">Ai</span>';
            fragment.appendChild(span);
            lastIdx = offset + match.length;
        });
        fragment.appendChild(document.createTextNode(text.substring(lastIdx)));
        parent.replaceChild(fragment, node);
    });
}

// Minimal theme check for landing page
function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') document.body.classList.add('light-mode');
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    applyGlobalBranding();
    
    // Redirect if already logged in (Only on Landing Page)
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                const role = user.profile.role;
                if (!user.isSetupComplete) {
                    window.location.href = 'setup.html';
                } else if (role === 'AGENCY') {
                    window.location.href = 'dashboard-agency.html';
                } else if (role === 'BUSINESS') {
                    window.location.href = 'dashboard-business.html';
                } else if (user.subscription.planId === 'creator' || user.subscription.planId === 'pro') {
                    window.location.href = 'dashboard-pro.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } catch (e) {}
        }
    }
});
