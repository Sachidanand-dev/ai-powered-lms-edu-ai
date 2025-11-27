const fs = require('fs');
const pdfParse = require('pdf-extraction');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');
const OpenAI = require('openai');

// --- Unified AI Provider Logic ---

// Helper: Get all available providers from .env
const getAvailableProviders = () => {
    const providers = [];

    // 1. Google Gemini Keys
    if (process.env.GEMINI_API_KEY) providers.push({ type: 'gemini', key: process.env.GEMINI_API_KEY });
    let i = 2;
    while (process.env[`GEMINI_API_KEY_${i}`]) {
        providers.push({ type: 'gemini', key: process.env[`GEMINI_API_KEY_${i}`] });
        i++;
    }

    // 2. xAI Grok Keys
    if (process.env.GROK_API_KEY) providers.push({ type: 'grok', key: process.env.GROK_API_KEY });
    // Add support for multiple Grok keys if needed in future
    
    return providers;
};

// Helper: Generate content using a random provider with failover
const generateAIContent = async (prompt, systemInstruction = "You are a helpful AI assistant.") => {
    let providers = getAvailableProviders();
    
    if (providers.length === 0) {
        throw new Error('No AI API keys configured (Gemini or Grok).');
    }

    // Shuffle providers to load balance
    providers = providers.sort(() => Math.random() - 0.5);

    let lastError = null;

    for (const provider of providers) {
        try {
            // console.log(`Attempting with provider: ${provider.type}...`); // Debug log
            
            if (provider.type === 'gemini') {
                const genAI = new GoogleGenerativeAI(provider.key);
                const model = genAI.getGenerativeModel({ 
                    model: 'gemini-2.5-flash',
                    systemInstruction: {
                        parts: [{ text: systemInstruction }],
                        role: "model"
                    } 
                });
                
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();

            } else if (provider.type === 'grok') {
                const openai = new OpenAI({
                    apiKey: provider.key,
                    baseURL: 'https://api.x.ai/v1',
                });

                const completion = await openai.chat.completions.create({
                    model: "grok-beta",
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: prompt }
                    ],
                });

                return completion.choices[0].message.content;
            }

        } catch (error) {
            console.error(`Provider ${provider.type} failed:`, error.message);
            lastError = error;
            // Continue to next provider
        }
    }

    throw lastError || new Error('All AI providers failed.');
};

// --- Controllers ---

// @desc    Upload PDF and extract text
// @route   POST /api/ai/upload
// @access  Private
const uploadPDF = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);

        res.json({
            message: 'PDF uploaded and processed',
            filename: req.file.filename,
            textSnippet: data.text.substring(0, 2000),
            fullTextLength: data.text.length,
        });
    } catch (error) {
        console.error('PDF Parsing Error:', error);
        res.status(500).json({ 
            message: 'Error processing PDF. The file might be corrupted or incompatible.',
            details: error.message
        });
    }
};

// @desc    Chat with AI (Study Buddy)
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
    const { message, context } = req.body;
    const userId = req.user._id;

    try {
        // Fetch existing chat history for context
        let chat = await Chat.findOne({ user: userId });
        
        // Format recent history (last 6 messages = 3 turns)
        let historyContext = "";
        if (chat && chat.messages.length > 0) {
            const recentMessages = chat.messages.slice(-6); 
            historyContext = recentMessages.map(msg => 
                `${msg.role === 'user' ? 'Student' : 'AI Mentor'}: ${msg.content}`
            ).join('\n');
        }

        const systemInstruction = `You are a helpful and concise AI study mentor.
        1. If CONTEXT is provided below, answer based on that context.
        2. If NO CONTEXT is provided, answer the user's question using your general knowledge. Do NOT mention "context" or "document" unless the user asks about it.
        3. Never say "I cannot access external files". The text provided in CONTEXT is the file content.
        4. Keep answers short and direct.
        5. If the topic is suitable for a quiz, end with: "Would you like to take a quiz on this topic?"`;
        
        let prompt = "";
        if (hasContext) {
            prompt += `CONTEXT FROM UPLOADED DOCUMENT:\n${context}\n\n`;
        }
        
        if (historyContext) {
            prompt += `PREVIOUS CONVERSATION:\n${historyContext}\n\n`;
        }

        prompt += `USER QUESTION: ${message}`;
            
        console.log(`AI Request - Context: ${hasContext}, History: ${!!historyContext}, Message: ${message}`);

        const reply = await generateAIContent(prompt, systemInstruction);

        // Save to DB
        if (!chat) {
            chat = await Chat.create({ user: userId, messages: [] });
        }

        chat.messages.push({ role: 'user', content: message });
        chat.messages.push({ role: 'model', content: reply });
        await chat.save();

        res.json({ reply });

    } catch (error) {
        console.error('AI Service Error:', error.message);
        res.status(500).json({ 
            message: 'AI Service Error', 
            details: error.message 
        });
    }
};

// @desc    Get Chat History
// @route   GET /api/ai/chat-history
// @access  Private
const getChatHistory = async (req, res) => {
    try {
        const chat = await Chat.findOne({ user: req.user._id });
        res.json(chat ? chat.messages : []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
};

// @desc    Generate Quiz
// @route   POST /api/ai/quiz
// @access  Private
const generateQuiz = async (req, res) => {
    const { topic } = req.body;

    try {
        const systemInstruction = `You are an expert quiz generator. Return ONLY raw JSON.`;
        
        const prompt = `
        Generate a quiz about "${topic}".
        Create 10 multiple choice questions.
        Return the response ONLY as a valid JSON array with this structure:
        [
            {
                "question": "Question text",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0 // Index of correct option (0-3)
            }
        ]
        Do not include any markdown formatting (like \`\`\`json). Just the raw JSON array.
        `;

        let text = await generateAIContent(prompt, systemInstruction);
        
        // Clean up markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const quiz = JSON.parse(text);

        res.json({ quiz });

    } catch (error) {
        console.error('Quiz Generation Error:', error.message);
        
        // Fallback mock quiz if API fails completely
        const mockQuiz = [
            {
                question: `(Fallback) What is the main concept of ${topic}?`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 0,
            },
        ];
        res.json({ quiz: mockQuiz });
    }
};
// @desc    Clear Chat History
// @route   DELETE /api/ai/chat-history
// @access  Private
const clearChatHistory = async (req, res) => {
    try {
        await Chat.findOneAndDelete({ user: req.user._id });
        res.json({ message: 'Chat history cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error clearing chat history' });
    }
};

module.exports = { uploadPDF, chatWithAI, generateQuiz, getChatHistory, clearChatHistory };

