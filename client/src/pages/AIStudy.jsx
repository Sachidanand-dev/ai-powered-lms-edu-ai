import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AIStudy = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [context, setContext] = useState('');
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                };
                const { data } = await axios.get('http://localhost:5000/api/ai/chat-history', config);
                
                const formattedHistory = data.map(msg => ({
                    type: msg.role === 'model' ? 'ai' : msg.role, // 'user' stays 'user'
                    text: msg.content
                }));
                setChatHistory(formattedHistory);
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        };

        if (user) {
            fetchHistory();
        }
    }, [user]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        setFile(selected);
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('pdf', file);

        setUploading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user?.token}`,
                },
            };

            const { data } = await axios.post(
                'http://localhost:5000/api/ai/upload',
                formData,
                config
            );

            setContext(data.textSnippet);
            setChatHistory((prev) => [
                ...prev,
                {
                    type: 'system',
                    text: `📄 "${file.name}" uploaded successfully. You can now ask questions about this PDF.`,
                },
            ]);
        } catch (error) {
            console.error(error);
            alert('Error uploading file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const userMsg = message.trim();
        setMessage('');
        setChatHistory((prev) => [...prev, { type: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            };
            const { data } = await axios.post(
                'http://localhost:5000/api/ai/chat',
                { message: userMsg, context },
                config
            );
            setChatHistory((prev) => [...prev, { type: 'ai', text: data.reply }]);
        } catch (error) {
            console.error(error);
            setChatHistory((prev) => [
                ...prev,
                {
                    type: 'system',
                    text: '⚠️ Something went wrong while getting a response. Please try again.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickPrompt = (prompt) => {
        setMessage(prompt);
    };

    const handleGenerateQuiz = () => {
        // Use the last user message or a default topic
        const lastUserMsg = chatHistory.slice().reverse().find(msg => msg.type === 'user');
        const topic = lastUserMsg ? lastUserMsg.text : 'General Knowledge';
        // Navigate to quiz page with topic state
        // Assuming we can pass state via navigation or query param. 
        // For now, let's use a query param or just navigate and let user know.
        // Actually, the QuizGenerator page might expect state. Let's check or just send them to /quiz.
        // Better: Navigate to /quiz with state
        window.location.href = `/quiz?topic=${encodeURIComponent(topic)}`;
    };

    const handleClearChat = async () => {
        if (!confirm('Are you sure you want to clear your chat history?')) return;
        
        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            await axios.delete('http://localhost:5000/api/ai/chat-history', config);
            setChatHistory([]);
        } catch (error) {
            console.error('Error clearing chat:', error);
            alert('Failed to clear chat history');
        }
    };

    return (
        <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                            <span>AI-Powered Study Companion</span>
                        </div>
                        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                            AI Study Buddy
                        </h1>
                        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
                            Upload your notes or books as PDF and chat with an AI mentor for summaries,
                            explanations, and exam-focused guidance.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                         <button
                            onClick={handleClearChat}
                            className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 underline"
                        >
                            Clear Chat History
                        </button>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Online • Ready to help you study</span>
                        </div>
                    </div>
                </header>

                {/* Layout */}
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
                    {/* Upload Section */}
                    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/40">
                        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-purple-500/20 blur-2xl" />
                        <div className="relative">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                                1. Upload Study Material
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Supported: PDF files. Try adding your class notes, books, or handouts.
                            </p>

                            <div className="mt-5 space-y-4">
                                <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80 px-4 py-8 text-center text-slate-500 hover:border-blue-500 hover:bg-blue-50/70 hover:text-blue-600 transition-all dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:border-blue-400 dark:hover:bg-slate-800/80 dark:hover:text-blue-300 cursor-pointer">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 dark:bg-blue-500/15">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5M12 4v10m0-10-3.5 3.5M12 4l3.5 3.5"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">
                                                Click to browse or drop your PDF here
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                Max ~10 MB • One file at a time
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>

                                {/* Selected file info */}
                                {file && (
                                    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                        <div className="flex flex-1 items-center gap-2 truncate">
                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/10 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                                PDF
                                            </span>
                                            <span className="truncate">{file.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFile(null)}
                                            className="ml-3 text-xs text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={handleUpload}
                                    disabled={uploading || !file}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                                >
                                    {uploading ? (
                                        <>
                                            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
                                            <span>Uploading & Analyzing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Upload & Analyze</span>
                                        </>
                                    )}
                                </button>

                                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                                    Tip: Once uploaded, ask things like{' '}
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        “Summarize chapter 2”{' '}
                                    </span>
                                    or{' '}
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                        “Create 5 MCQs from this topic”.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Chat Section */}
                    <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/40">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/80">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                                    2. Chat with AI Mentor
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Ask doubts, request summaries, generate questions, or plan your revision.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleGenerateQuiz}
                                    className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-200 transition-colors dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                                >
                                    <span>⚡ Generate Quiz</span>
                                </button>
                                <div className="hidden sm:flex flex-col items-end text-[11px] text-slate-500 dark:text-slate-400">
                                    <span>Study Mode</span>
                                    <span className="text-[10px] uppercase tracking-wide">
                                        PDF-aware chat
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-4 py-5 dark:bg-slate-950/40">
                            {/* Empty state */}
                            {chatHistory.length === 0 && !loading && (
                                <div className="mx-auto max-w-sm rounded-xl border border-dashed border-slate-300 bg-white/80 p-4 text-center text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-400">
                                    <p className="font-medium text-slate-600 dark:text-slate-200 mb-1">
                                        No messages yet
                                    </p>
                                    <p>
                                        Upload a PDF and start by asking
                                        <br />
                                        <span className="italic">
                                            “What are the key points of this chapter?”
                                        </span>
                                        .
                                    </p>
                                </div>
                            )}

                            {/* Messages */}
                            {chatHistory.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${
                                        msg.type === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    <div
                                        className={`flex max-w-[80%] items-start gap-2 ${
                                            msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                                        }`}
                                    >
                                        {/* Avatar */}
                                        {msg.type !== 'system' && (
                                            <div
                                                className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-semibold shadow-sm ${
                                                    msg.type === 'user'
                                                        ? 'border-blue-200 bg-blue-600 text-white dark:border-blue-500/60 dark:bg-blue-500'
                                                        : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                                                }`}
                                            >
                                                {msg.type === 'user' ? 'You' : 'AI'}
                                            </div>
                                        )}

                                        {/* Bubble */}
                                        <div
                                            className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                                msg.type === 'user'
                                                    ? 'bg-blue-600 text-white rounded-tr-none dark:bg-blue-500'
                                                    : msg.type === 'system'
                                                    ? 'bg-amber-50 text-amber-800 border border-amber-100 text-xs dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700/60'
                                                    : 'bg-white text-slate-900 rounded-tl-none border border-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:border-slate-700'
                                            }`}
                                        >
                                            {msg.text}
                                            {/* Show "Generate Quiz" button if AI suggests it */}
                                            {msg.type === 'ai' && msg.text.includes("Would you like to take a quiz") && (
                                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                    <button 
                                                        onClick={handleGenerateQuiz}
                                                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                    >
                                                        <span>📝 Yes, generate a quiz on this!</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Loading bubble */}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-75" />
                                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick prompts + Input */}
                        <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-3 space-y-3 dark:border-slate-800 dark:bg-slate-900/80">
                            {/* Quick prompts */}
                            <div className="flex flex-wrap gap-2 text-[11px]">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuickPrompt('Summarize this PDF in simple points.')
                                    }
                                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/70 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300 dark:hover:bg-slate-800"
                                >
                                    Summarize chapter
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuickPrompt('Create 5 important exam questions from this PDF.')
                                    }
                                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/70 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300 dark:hover:bg-slate-800"
                                >
                                    Generate questions
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuickPrompt('Explain the main concepts as if I am a beginner.')
                                    }
                                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/70 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300 dark:hover:bg-slate-800"
                                >
                                    Explain like I&apos;m 15
                                </button>
                            </div>

                            {/* Input row */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Ask a question about your document..."
                                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder-slate-500"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={loading || !message.trim()}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/40 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                                >
                                    <span>Send</span>
                                    {/* Paper plane icon */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 12h.01M5.5 12.5 4 20l8-3.5m5.5-10-13 5.5L11 14l4 4.5 5.5-13Z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AIStudy;




// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import axios from 'axios';

// const AIStudy = () => {
//     const { user } = useAuth();
//     const [file, setFile] = useState(null);
//     const [uploading, setUploading] = useState(false);
//     const [context, setContext] = useState('');
//     const [message, setMessage] = useState('');
//     const [chatHistory, setChatHistory] = useState([]);
//     const [loading, setLoading] = useState(false);

//     const handleFileChange = (e) => {
//         setFile(e.target.files[0]);
//     };

//     const handleUpload = async () => {
//         if (!file) return;

//         const formData = new FormData();
//         formData.append('pdf', file);

//         setUploading(true);
//         try {
//             const config = {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                     Authorization: `Bearer ${user.token}`,
//                 },
//             };
//             const { data } = await axios.post('http://localhost:5000/api/ai/upload', formData, config);
//             setContext(data.textSnippet); // Store context for chat
//             setChatHistory(prev => [...prev, { type: 'system', text: `PDF Uploaded: ${file.name}. You can now ask questions about it.` }]);
//             setUploading(false);
//         } catch (error) {
//             console.error(error);
//             setUploading(false);
//             alert('Error uploading file');
//         }
//     };

//     const handleSendMessage = async () => {
//         if (!message) return;

//         const userMsg = message;
//         setMessage('');
//         setChatHistory(prev => [...prev, { type: 'user', text: userMsg }]);
//         setLoading(true);

//         try {
//             const config = {
//                 headers: {
//                     Authorization: `Bearer ${user.token}`,
//                 },
//             };
//             const { data } = await axios.post('http://localhost:5000/api/ai/chat', { message: userMsg, context }, config);
//             setChatHistory(prev => [...prev, { type: 'ai', text: data.reply }]);
//             setLoading(false);
//         } catch (error) {
//             console.error(error);
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8 transition-colors duration-300">
//             <div className="max-w-4xl mx-auto">
//                 <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-600">AI Study Buddy</h1>

//                 {/* Upload Section */}
//                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8 shadow-lg">
//                     <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">1. Upload Study Material (PDF)</h2>
//                     <div className="flex items-center space-x-4">
//                         <input type="file" accept=".pdf" onChange={handleFileChange} className="text-gray-500 dark:text-gray-400" />
//                         <button
//                             onClick={handleUpload}
//                             disabled={uploading || !file}
//                             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
//                         >
//                             {uploading ? 'Uploading...' : 'Upload & Analyze'}
//                         </button>
//                     </div>
//                 </div>

//                 {/* Chat Section */}
//                 <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[600px] shadow-xl">
//                     <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
//                         <h2 className="text-xl font-bold text-gray-900 dark:text-white">2. Chat with AI Mentor</h2>
//                     </div>
                    
//                     <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
//                         {chatHistory.map((msg, index) => (
//                             <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
//                                 <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
//                                     msg.type === 'user' 
//                                         ? 'bg-blue-600 text-white rounded-tr-none' 
//                                         : msg.type === 'system'
//                                             ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm'
//                                             : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none border border-gray-200 dark:border-gray-600'
//                                 }`}>
//                                     {msg.text}
//                                 </div>
//                             </div>
//                         ))}
//                         {loading && (
//                             <div className="flex justify-start">
//                                 <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl rounded-tl-none animate-pulse border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400">
//                                     Thinking...
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
//                         <div className="flex space-x-4">
//                             <input
//                                 type="text"
//                                 value={message}
//                                 onChange={(e) => setMessage(e.target.value)}
//                                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//                                 placeholder="Ask a question about your document..."
//                                 className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500"
//                             />
//                             <button
//                                 onClick={handleSendMessage}
//                                 disabled={loading}
//                                 className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-bold shadow-md"
//                             >
//                                 Send
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AIStudy;
