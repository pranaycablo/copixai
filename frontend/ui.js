// HeroAi Master UI Engine (Production-Ready)
const showToast = (type, title, msg) => {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const container = document.getElementById('toastBox') || document.getElementById('toastStack') || document.getElementById('toastContainer');
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
    setTimeout(() => { if(t.parentElement) t.remove(); }, 5000);
};

const toast = showToast;

const openModal = (id) => { const el = document.getElementById(id); if (el) el.classList.add('active'); };
const closeModal = (id) => { const el = document.getElementById(id); if (el) el.classList.remove('active'); };
const toggleDropdown = (id) => { const el = document.getElementById(id); if (el) el.classList.toggle('open'); };

const storage = {
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch(e) { return null; } },
    remove: (key) => localStorage.removeItem(key),
    clear: () => localStorage.clear()
};

// ── UTILS & SECURITY ──
async function safeFetch(url, options = {}) {
    const token = storage.get('token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(url, { ...options, headers });
        if (res.status === 401) { storage.clear(); window.location.href = 'auth.html'; return null; }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'System Error');
        return data;
    } catch (err) {
        toast('error', 'Sync Failure', err.message);
        return null;
    }
}

function generateUniqId() { return 'hai_' + Math.random().toString(36).substr(2, 9); }

function applyGlobalBranding() {
    const regex = /HeroAi/gi;
    const targets = document.querySelectorAll('h1, h2, h3, h4, p, span, div, a, button, li');
    
    targets.forEach(el => {
        if (el.children.length === 0 && el.textContent.match(regex) && !el.classList.contains('heroai-glow')) {
            const text = el.textContent;
            el.innerHTML = text.replace(regex, (match) => {
                return `<span class="heroai-glow"><span class="h">Hero</span><span class="a">Ai</span></span>`;
            });
        }
    });
}

// ── API CONNECTIVITY LAYER ──
const API = {
    auth: {
        me: async (userId) => safeFetch(`${CONFIG.API_BASE_URL}/auth/me/${userId}`),
        updateProfile: async (data) => safeFetch(`${CONFIG.API_BASE_URL}/auth/update-profile`, { method: 'POST', body: JSON.stringify(data) })
    },
    engine: {
        generate: async (type, title) => safeFetch(`${CONFIG.API_BASE_URL}/engine/generate`, { method: 'POST', body: JSON.stringify({ type, title }) }),
        status: async (taskId) => safeFetch(`${CONFIG.API_BASE_URL}/engine/status/${taskId}`),
        history: async (userId) => safeFetch(`${CONFIG.API_BASE_URL}/engine/history/${userId}`),
        approve: async (taskId) => safeFetch(`${CONFIG.API_BASE_URL}/engine/approve/${taskId}`, { method: 'POST' })
    }
};

class ProductionTracker {
    constructor() {
        this.currentTaskId = null;
        this.pollInterval = null;
        this.statusMap = {
            'QUEUED': 'wf-thinking',
            'THINKING': 'wf-thinking',
            'SCRIPTING': 'wf-script',
            'GATHERING_ASSETS': 'wf-trends',
            'RENDERING': 'wf-render',
            'DISTRIBUTING': 'wf-finalize',
            'POSTED_LIVE': 'wf-finalize',
            'SCHEDULED': 'wf-finalize'
        };
    }

    async startProduction(type = 'VIDEO') {
        const res = await API.engine.generate(type, `Studio Production - ${new Date().toLocaleTimeString()}`);
        if (res && res.taskId) {
            this.currentTaskId = res.taskId;
            toast('success', 'Production Started', 'HeroAi Master Brain is now architecting your content.');
            this.track();
        }
    }

    track() {
        if (this.pollInterval) clearInterval(this.pollInterval);
        this.pollInterval = setInterval(async () => {
            if (!this.currentTaskId) return clearInterval(this.pollInterval);
            
            const job = await API.engine.status(this.currentTaskId);
            if (!job) return;

            this.updateUI(job);

            if (['POSTED_LIVE', 'SCHEDULED', 'FAILED'].includes(job.status)) {
                clearInterval(this.pollInterval);
                const msg = job.status === 'FAILED' ? 'Production encountered an error.' : 'Content is ready and scheduled!';
                toast(job.status === 'FAILED' ? 'error' : 'success', 'Pipeline Update', msg);
            }
        }, 5000);
    }

    updateUI(job) {
        const engineTxt = document.getElementById('engine-txt');
        if (engineTxt) engineTxt.textContent = `${job.status}...`;

        const stepId = this.statusMap[job.status];
        if (stepId) {
            const el = document.getElementById(stepId);
            if (el) {
                const steps = Object.values(this.statusMap);
                const currentIdx = steps.indexOf(stepId);
                steps.forEach((s, idx) => {
                    const stepEl = document.getElementById(s);
                    if (!stepEl) return;
                    if (idx < currentIdx) {
                        stepEl.classList.add('done');
                        const dot = stepEl.querySelector('.dot-blink');
                        if(dot) dot.className = 'dot-blink dot-green';
                    } else if (idx === currentIdx) {
                        stepEl.classList.remove('done');
                        const dot = stepEl.querySelector('.dot-blink');
                        if(dot) dot.className = 'dot-blink dot-red';
                    }
                });
            }
        }
        
        if (job.status === 'SCRIPTING' || job.status === 'RENDERING' || job.status === 'POSTED_LIVE') {
            this.syncPipelineCards(job);
        }

        // Manual Approval Check
        if (job.status === 'SCRIPTING' && job.autoPilot === false) {
            const approveBtn = document.getElementById('approve-script-btn');
            if (approveBtn) approveBtn.style.display = 'block';
            if (engineTxt) engineTxt.textContent = 'Awaiting Script Approval...';
        } else {
            const approveBtn = document.getElementById('approve-script-btn');
            if (approveBtn) approveBtn.style.display = 'none';
        }
    }

    syncPipelineCards(job) {
        const pipeMap = {
            'SCRIPTING': { id: 'pipe-script', val: 'Writing...', dot: 'dot-red' },
            'RENDERING': { id: 'pipe-video', val: 'Rendering 4K...', dot: 'dot-amber' },
            'POSTED_LIVE': { id: 'pipe-video', val: 'Ready & Posted', dot: 'dot-green' }
        };
        const config = pipeMap[job.status];
        if (config) {
            const el = document.getElementById(config.id);
            if (el) el.textContent = config.val;
            const dot = document.getElementById(config.id.replace('pipe', 'dot'));
            if (dot) dot.className = `dot-blink ${config.dot}`;
        }
    }
}

const tracker = new ProductionTracker();

async function approveScript() {
    if (!tracker.currentTaskId) return;
    const res = await API.engine.approve(tracker.currentTaskId);
    if (res) {
        toast('success', 'Script Approved', 'Production is resuming...');
        const btn = document.getElementById('approve-script-btn');
        if (btn) btn.style.display = 'none';
    }
}

function logout() {
    storage.clear();
    toast('info', 'Session Ended', 'You have been securely logged out.');
    setTimeout(() => window.location.href = 'auth.html', 1000);
}

async function fetchGlobalStats() {
    const data = await safeFetch(`${CONFIG.API_BASE_URL}/engine/status/global`);
    if (data) {
        const viewEls = document.querySelectorAll('.stat-val');
        if (viewEls[0]) viewEls[0].innerText = data.totalViews || '1.2M';
        if (viewEls[1]) viewEls[1].innerText = data.avgEngagement || '4.8%';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyGlobalBranding();
    if (document.getElementById('dashRoot')) {
        fetchGlobalStats();
        const user = storage.get('user');
        if (user) {
            API.engine.history(user._id).then(videos => {
                if (videos && videos.length > 0 && ['QUEUED', 'THINKING', 'SCRIPTING', 'RENDERING'].includes(videos[0].status)) {
                    tracker.currentTaskId = videos[0]._id;
                    tracker.track();
                }
            });
        }
    }
});

