import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const QuizGenerator = () => {
    const { user } = useAuth();
    const [topic, setTopic] = useState('');
    const [quiz, setQuiz] = useState([]);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    // Check for topic in URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlTopic = params.get('topic');
        if (urlTopic) {
            setTopic(urlTopic);
            // Optional: Auto-generate if topic is present
            // handleGenerate(urlTopic); // Need to refactor handleGenerate to accept arg or use effect
        }
    }, []);

    // Effect to trigger generation if topic is set from URL (optional, but good UX)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlTopic = params.get('topic');
        if (urlTopic && topic === urlTopic && quiz.length === 0 && !loading) {
            handleGenerate(urlTopic);
        }
    }, [topic]);

    const handleGenerate = async (overrideTopic) => {
        const searchTopic = overrideTopic || topic;
        if (!searchTopic || (typeof searchTopic === 'string' && !searchTopic.trim())) return;
        
        setLoading(true);
        setQuiz([]);
        setShowResults(false);
        setAnswers({});

        try {
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };
            const { data } = await axios.post(
                'http://localhost:5000/api/ai/quiz',
                { topic: searchTopic.trim() },
                config
            );
            setQuiz(data.quiz || []);
        } catch (error) {
            console.error(error);
            alert('Error generating quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionIndex, optionIndex) => {
        if (showResults) return;
        setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
    };

    const calculateScore = () => {
        let score = 0;
        quiz.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) score++;
        });
        return score;
    };

    const getOptionLabel = (index) => String.fromCharCode(65 + index); // A, B, C, D...

    const score = showResults ? calculateScore() : 0;
    const totalQuestions = quiz.length || 0;
    const scorePercent =
        totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    return (
        <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold text-orange-600 shadow-sm dark:border-orange-700/60 dark:bg-slate-900/80 dark:text-orange-300">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>AI-Powered Practice</span>
                        </div>
                        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 dark:from-orange-300 dark:via-red-400 dark:to-rose-400">
                            AI Quiz Generator
                        </h1>
                        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
                            Type any topic and get instant MCQ practice. Great for last-minute revision,
                            self-testing, and making your weak topics strong.
                        </p>
                    </div>

                    {totalQuestions > 0 && (
                        <div className="flex flex-col items-end gap-2 text-right">
                            <div className="rounded-xl bg-white/80 px-4 py-2 text-xs shadow-md border border-orange-100 dark:bg-slate-900/80 dark:border-slate-700">
                                <p className="font-semibold text-slate-700 dark:text-slate-200">
                                    Topic: <span className="text-orange-600 dark:text-orange-300">{topic}</span>
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {totalQuestions} question{totalQuestions > 1 ? 's' : ''} generated
                                </p>
                            </div>
                        </div>
                    )}
                </header>

                {/* Input Section */}
                <section className="mb-8 rounded-2xl border border-orange-100 bg-white/90 p-6 shadow-lg shadow-orange-100/80 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/40">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Topic for quiz
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g. React Hooks, Operating Systems Deadlocks, Chemical Equilibrium"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder-slate-500"
                            />
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Tip: Be specific for better questions. For example, &quot;Binary Search in DSA&quot; or
                                &quot;Indian National Movement 1919–1947&quot;.
                            </p>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !topic.trim()}
                            className="mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-400/40 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 transition-all sm:mt-6"
                        >
                            {loading ? (
                                <>
                                    <span className="mr-2 h-4 w-4 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <span>Generate Quiz</span>
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* Quiz & Results Section */}
                {quiz.length > 0 && (
                    <section className="space-y-6 mb-10">
                        {quiz.map((q, qIndex) => {
                            const userSelection = answers[qIndex];
                            const isCorrect = userSelection === q.correctAnswer;

                            return (
                                <div
                                    key={qIndex}
                                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-md shadow-slate-200/80 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-black/40"
                                >
                                    {/* subtle accent */}
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 via-red-500 to-rose-500" />

                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                                Question {qIndex + 1}{' '}
                                                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                                    / {totalQuestions}
                                                </span>
                                            </p>
                                            <h3 className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">
                                                {q.question}
                                            </h3>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 text-[11px]">
                                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                MCQ • Single correct
                                            </span>
                                            {showResults && (
                                                <span
                                                    className={`rounded-full px-3 py-1 font-semibold ${
                                                        isCorrect
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/60'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/25 dark:text-rose-300 dark:border-rose-700/60'
                                                    }`}
                                                >
                                                    {isCorrect ? 'Correct' : 'Incorrect'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {q.options.map((option, oIndex) => {
                                            const isUserChoice = userSelection === oIndex;
                                            const isRightOption = oIndex === q.correctAnswer;

                                            let stateClasses = '';
                                            if (showResults) {
                                                if (isRightOption) {
                                                    stateClasses =
                                                        'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-800 dark:text-emerald-200';
                                                } else if (isUserChoice && !isRightOption) {
                                                    stateClasses =
                                                        'bg-rose-50 dark:bg-rose-900/20 border-rose-400 text-rose-800 dark:text-rose-200';
                                                } else {
                                                    stateClasses =
                                                        'bg-slate-50/80 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300';
                                                }
                                            } else if (isUserChoice) {
                                                stateClasses =
                                                    'bg-orange-50 dark:bg-orange-900/30 border-orange-400 text-orange-800 dark:text-orange-200';
                                            } else {
                                                stateClasses =
                                                    'bg-slate-50/80 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200';
                                            }

                                            return (
                                                <button
                                                    key={oIndex}
                                                    type="button"
                                                    onClick={() =>
                                                        handleOptionSelect(qIndex, oIndex)
                                                    }
                                                    className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-all duration-150 flex items-center gap-3 ${stateClasses}`}
                                                >
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
                                                        {getOptionLabel(oIndex)}
                                                    </span>
                                                    <span className="flex-1">{option}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Submit / Results */}
                        {!showResults ? (
                            <button
                                onClick={async () => {
                                    setShowResults(true);
                                    const finalScore = calculateScore();
                                    try {
                                        const config = {
                                            headers: { Authorization: `Bearer ${user?.token}` },
                                        };
                                        await axios.post(
                                            'http://localhost:5000/api/quiz/save',
                                            {
                                                topic,
                                                score: finalScore,
                                                totalQuestions: quiz.length,
                                            },
                                            config
                                        );
                                    } catch (error) {
                                        console.error('Error saving quiz result:', error);
                                    }
                                }}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 text-white text-sm font-semibold shadow-lg shadow-emerald-400/40 hover:shadow-xl hover:brightness-110 transition-all"
                            >
                                Submit Answers & View Score
                            </button>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
                                {/* Result card */}
                                <div className="p-6 rounded-2xl border border-slate-200 bg-white/95 shadow-lg dark:border-slate-800 dark:bg-slate-900/95">
                                    <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-50">
                                        Quiz Complete 🎉
                                    </h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                        You scored{' '}
                                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-lg">
                                            {score}
                                        </span>{' '}
                                        out of{' '}
                                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                                            {totalQuestions}
                                        </span>
                                        .
                                    </p>

                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs mb-1 text-slate-500 dark:text-slate-400">
                                            <span>Score</span>
                                            <span>{scorePercent}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 transition-all"
                                                style={{ width: `${scorePercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Try again with a different topic or regenerate the quiz to keep
                                        practicing until you consistently hit above 80%.
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowResults(false);
                                                setAnswers({});
                                            }}
                                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                        >
                                            Review & change answers
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleGenerate}
                                            className="rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/40"
                                        >
                                            Generate new quiz on same topic
                                        </button>
                                    </div>
                                </div>

                                {/* Side tips */}
                                <div className="p-5 rounded-2xl border border-dashed border-amber-200 bg-amber-50/80 text-xs text-amber-900 shadow-sm dark:border-amber-700/70 dark:bg-amber-900/20 dark:text-amber-100">
                                    <h3 className="mb-2 text-sm font-semibold flex items-center gap-2">
                                        Study tip
                                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-amber-800 dark:text-amber-100">
                                            ✦
                                        </span>
                                    </h3>
                                    <ul className="space-y-1.5 list-disc list-inside">
                                        <li>
                                            After checking the answers, ask your AI Study Buddy to explain
                                            the questions you got wrong.
                                        </li>
                                        <li>
                                            Convert difficult questions into short notes or flashcards for
                                            revision.
                                        </li>
                                        <li>
                                            Regenerate quizzes on the same topic until you can score above
                                            90% consistently.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};

export default QuizGenerator;
