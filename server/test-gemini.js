const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const testGemini = async () => {
    console.log('--- Starting Gemini Test (gemini-pro) ---');
    const key = process.env.GEMINI_API_KEY;
    
    if (!key) {
        console.error('CRITICAL: No API Key found.');
        return;
    }

    const genAI = new GoogleGenerativeAI(key);
    const modelName = 'gemini-pro'; 

    console.log(`Attempting with model: ${modelName}`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const prompt = 'Say hello';
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log('SUCCESS:', response.text());
    } catch (error) {
        console.error('FAILED:');
        console.error(error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('StatusText:', error.response.statusText);
        }
    }
    console.log('--- End Gemini Test ---');
};

testGemini();
