import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden relative transition-colors duration-300 pt-10">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {/* Navbar */}
            {/* <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-600">
                    LMS Platform
                </div>
                <div className="space-x-4">
                    <Link to="/login" className="px-6 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-white transition-colors duration-300 font-medium">
                        Login
                    </Link>
                    <Link to="/register" className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 shadow-lg shadow-blue-500/30">
                        Get Started
                    </Link>
                </div>
            </nav> */}

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[90vh] text-center px-4">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-gray-900 dark:text-white">
                    <span className="block mb-2">Unlock Your Potential</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-500 dark:to-pink-500 animate-gradient-x">
                        With AI-Powered Learning
                    </span>
                </h1>
                <p className="max-w-2xl text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
                    Experience the future of education. Our platform adapts to your learning style, providing personalized paths, instant quizzes, and real-time feedback powered by advanced artificial intelligence.
                </p>
                
                <div className="flex flex-col md:flex-row gap-6">
                    <Link to="/register" className="group relative px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-full overflow-hidden transition-transform hover:scale-105 shadow-xl">
                        <span className="relative z-10">Start Learning Now</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </Link>
                    <button className="px-8 py-4 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 backdrop-blur-sm font-medium">
                        View Demo
                    </button>
                </div>

                {/* Floating Cards / Features */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        { title: 'AI Tutor', desc: '24/7 personalized assistance to answer your doubts instantly.', color: 'from-blue-500 to-cyan-500', icon: '🤖' },
                        { title: 'Smart Analytics', desc: 'Track your progress in real-time with detailed insights.', color: 'from-purple-500 to-pink-500', icon: '📊' },
                        { title: 'Adaptive Path', desc: 'Curriculum that evolves with you as you learn.', color: 'from-orange-500 to-red-500', icon: '🎯' },
                    ].map((feature, index) => (
                        <div key={index} className="p-8 rounded-3xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-gray-500 transition-all duration-300 hover:-translate-y-2 shadow-lg">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 flex items-center justify-center shadow-lg text-2xl`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* How It Works Section */}
            <section className="py-24 relative z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Simple steps to master any subject.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { step: '01', title: 'Sign Up', desc: 'Create your free account in seconds.' },
                            { step: '02', title: 'Choose Topic', desc: 'Select from a wide range of subjects.' },
                            { step: '03', title: 'Learn with AI', desc: 'Get personalized tutoring and materials.' },
                            { step: '04', title: 'Test & Track', desc: 'Take quizzes and monitor your growth.' },
                        ].map((item, index) => (
                            <div key={index} className="relative group">
                                <div className="text-6xl font-bold text-gray-200 dark:text-gray-800 absolute -top-6 -left-4 z-0 group-hover:text-blue-100 dark:group-hover:text-blue-900/30 transition-colors duration-300">{item.step}</div>
                                <div className="relative z-10 p-6">
                                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{item.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Learners Say</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Join thousands of satisfied students.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: 'Alex Johnson', role: 'Computer Science Student', text: "The AI tutor helped me understand complex algorithms in minutes. It's like having a professor available 24/7." },
                            { name: 'Sarah Williams', role: 'Lifelong Learner', text: "I love the quiz generator! It instantly creates practice tests for whatever I'm reading. Highly recommended." },
                            { name: 'Michael Chen', role: 'High School Student', text: "This platform completely changed how I study. My grades have improved significantly since I started using it." },
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                        {testimonial.name[0]}
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 mix-blend-overlay"></div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">Ready to Transform Your Learning?</h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto relative z-10">Join today and get unlimited access to AI-powered tools and personalized courses.</p>
                        <Link to="/register" className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg relative z-10">
                            Get Started for Free
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
