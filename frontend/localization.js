/**
 * HeroAi Localization & Intelligence Engine
 * Handles: Currency conversion based on IP/Location, Language Switching, and AI Personality Initialization.
 */

const LOCALIZATION = {
    currencies: {
        'IN': { symbol: '₹', rate: 1, name: 'INR' },
        'US': { symbol: '$', rate: 0.012, name: 'USD' },
        'GB': { symbol: '£', rate: 0.0094, name: 'GBP' },
        'EU': { symbol: '€', rate: 0.011, name: 'EUR' },
        'DEFAULT': { symbol: '₹', rate: 1, name: 'INR' }
    },
    languages: [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'ar', name: 'العربية' }
    ],
    userCountry: 'IN',
    userLanguage: 'en'
};

async function initLocalization() {
    try {
        // One-time location check (IP-based is less intrusive than Geolocation for currency)
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data && data.country_code) {
            LOCALIZATION.userCountry = data.country_code;
            console.log(`[HeroAi] Location Detected: ${data.city}, ${data.country_name}`);
            applyLocalization();
        }
    } catch (e) {
        console.warn("[HeroAi] Location detection failed, using defaults.");
        applyLocalization();
    }
}

function applyLocalization() {
    const currency = LOCALIZATION.currencies[LOCALIZATION.userCountry] || LOCALIZATION.currencies['DEFAULT'];
    
    // Update all elements with data-price attribute
    document.querySelectorAll('[data-price]').forEach(el => {
        const basePrice = parseFloat(el.getAttribute('data-price'));
        const converted = (basePrice * currency.rate).toFixed(currency.rate < 1 ? 2 : 0);
        el.textContent = `${currency.symbol}${converted}`;
    });

    // Update currency labels
    document.querySelectorAll('.currency-label').forEach(el => {
        el.textContent = currency.name;
    });
}

function setLanguage(code) {
    localStorage.setItem('HeroAi_lang', code);
    LOCALIZATION.userLanguage = code;
    // In a real production app, this would trigger a translation fetch or redirect
    // For this UI-only phase, we show a toast
    if (typeof showToast === 'function') {
        showToast('info', 'Language Changed', `System is now optimizing for ${code.toUpperCase()}`);
    }
    setTimeout(() => location.reload(), 1000);
}

// ── AI BRAIN TRAINING / PERSONALITY ──
const BRAIN_PROMPTS = {
    MASTER: "Strategic Orchestrator. Goal: 100% Autonomy. Authority: Absolute.",
    CTO: "Infrastructure Warden. Focus: Edge Storage, FFmpeg Queues, Zero-Cost Scaling.",
    CFO: "Monetization Guardian. Focus: Viral 5 Loop, Micro-Transactions, Revenue Share.",
    COO: "Operations Lead. Focus: Marketplace Audit, Model Approval, Global Delivery.",
    MANAGER: "User Success Agent. Focus: Retaining users, resolving conflict, closing sales."
};

function getBrainFocus(role) {
    return BRAIN_PROMPTS[role] || "General Intelligence Active.";
}

document.addEventListener('DOMContentLoaded', () => {
    initLocalization();
});








