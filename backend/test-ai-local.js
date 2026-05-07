const axios = require('axios');
require('dotenv').config();

async function testAi() {
    const apiKey = process.env.GEMINI_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    console.log("Testing Gemini API...");
    
    try {
        const response = await axios.post(endpoint, {
            contents: [{ parts: [{ text: "Say 'HeroAi is Active'" }] }]
        });
        console.log("AI Response:", response.data.candidates[0].content.parts[0].text);
    } catch (err) {
        console.error("AI Test Failed:", err.response ? JSON.stringify(err.response.data) : err.message);
    }
}

testAi();

