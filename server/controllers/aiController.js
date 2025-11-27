const fs = require('fs');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');

// --- AI Provider Logic (Gemini Only) ---

// Helper: Get all available Gemini keys from .env
const getAvailableProviders = () => {
    const providers = [];

    // 1. Google Gemini Keys
    if (process.env.GEMINI_API_KEY) providers.push({ type: 'gemini', key: process.env.GEMINI_API_KEY });
    let i = 2;
    while (process.env[`GEMINI_API_KEY_${i}`]) {
        providers.push({ type: 'gemini', key: process.env[`GEMINI_API_KEY_${i}`] });
        i++;
    }

    return providers;
};

// Helper: Generate content using a random Gemini key with failover
const generateAIContent = async (prompt, systemInstruction = "You are a helpful AI assistant.") => {
    let providers = getAvailableProviders();
    
    if (providers.length === 0) {
        throw new Error('No Gemini API keys configured.');
    }

    // Shuffle providers to load balance
    providers = providers.sort(() => Math.random() - 0.5);

    let lastError = null;

    for (const provider of providers) {
        try {
            const genAI = new GoogleGenerativeAI(provider.key);
            const model = genAI.getGenerativeModel({ 
                model: 'gemini-2.0-flash',
                systemInstruction: {
                    parts: [{ text: systemInstruction }],
                    role: "model"
                } 
            });
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error(`Gemini Provider failed:`, error.message);
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
// @desc    Upload PDF and extract text
// @route   POST /api/ai/upload
// @access  Private
const uploadPDF = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const dataBuffer = fs.readFileSync(req.file.path);
        
        // Use pdfjs-dist for robust parsing
        // Dynamic import for ES module support in CommonJS
        const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
        
        const loadingTask = getDocument({ 
            data: new Uint8Array(dataBuffer),
            useSystemFonts: true,
            disableFontFace: true
        });
        
        const doc = await loadingTask.promise;
        const numPages = doc.numPages;
        let fullText = '';
        
        // Limit pages to avoid timeout on huge docs (e.g., max 20 pages)
        const maxPages = Math.min(numPages, 20);

        for (let i = 1; i <= maxPages; i++) {
            const page = await doc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        res.json({
            message: 'PDF uploaded and processed',
            filename: req.file.filename,
            textSnippet: fullText.substring(0, 5000), // Increased snippet size
            fullTextLength: fullText.length,
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
        
        // Check if context is actually provided and not just an empty string
        const hasContext = context && context.trim().length > 0;
        
        // Format recent history (last 6 messages = 3 turns)
        let historyContext = "";
        if (chat && chat.messages.length > 0) {
            const recentMessages = chat.messages.slice(-6); 
            historyContext = recentMessages.map(msg => 
                `${msg.role === 'user' ? 'Student' : 'AI Mentor'}: ${msg.content}`
            ).join('\n');
        }

        const systemInstruction = `You are an expert AI study mentor.
        CRITICAL INSTRUCTION: The user has uploaded a document, and its text content is provided to you below as "DOCUMENT CONTENT".
        
        GUIDELINES:
        1. You MUST answer questions based on this "DOCUMENT CONTENT".
        2. Do NOT say "I cannot open files" or "I cannot access PDFs". You HAVE the content right here.
        3. Treat the provided text as the absolute truth for the document.
        4. If the user asks to "summarize the pdf" or "explain this file", use the "DOCUMENT CONTENT" to do so.
        5. FORMATTING RULES:
           - Use **Bold** for key terms and concepts.
           - Use Numbered Lists (1., 2., 3.) strictly when listing items, steps, or generating questions.
           - Use Bullet points for unordered lists.
           - Use ### Headers for sections if the response is long.
        6. If the user asks for questions, ALWAYS number them (e.g., "Question 1:", "Question 2:").
        7. Keep answers concise and helpful.`;
        
        let prompt = "";
        if (hasContext) {
            prompt += `--- BEGIN DOCUMENT CONTENT ---\n${context}\n--- END DOCUMENT CONTENT ---\n\n`;
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
    const { topic, context } = req.body;

    try {
        const systemInstruction = `You are an expert quiz generator. Return ONLY raw JSON.`;
        
        let prompt = `Generate a quiz about "${topic}".`;
        
        if (context && context.trim().length > 0) {
            prompt += `\n\nUse the following DOCUMENT CONTENT as the primary source for the questions:\n\n--- BEGIN DOCUMENT CONTENT ---\n${context}\n--- END DOCUMENT CONTENT ---\n\n`;
        }

        prompt += `
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

