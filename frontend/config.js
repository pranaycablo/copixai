const CONFIG = {
    // Dynamically detect if running on Render or Local
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000/api' 
        : '/api',
    isProduction: window.location.hostname !== 'localhost',
    GOOGLE_CLIENT_ID: "845214569524-j9p1l6e5k8a2b3c4d5e6f7g8h9i0j1k2.apps.googleusercontent.com" // Update with real ID
};
