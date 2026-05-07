const axios = require('axios');
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const response = await axios.get(endpoint);
        console.log("Available Models:", JSON.stringify(response.data.models.map(m => m.name)));
    } catch (err) {
        console.error("List Models Failed:", err.response ? JSON.stringify(err.response.data) : err.message);
    }
}

listModels();

