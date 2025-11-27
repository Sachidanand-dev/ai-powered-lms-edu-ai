import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        if (result.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/student', { replace: true });
        }
      } else {
        setFormError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden transition-colors duration-300">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md px-8 py-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 z-10">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 mb-2">
            Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
            Login to access your personalized learning space
            </p>
        </div>

        {formError && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm ${
                fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700'
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
                <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                Password
                </label>
                <a href="#" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">Forgot Password?</a>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm ${
                fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700'
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-4 text-white font-bold bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
          >
            {isLoading ? (
                <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                </span>
            ) : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                to="/register"
                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
                >
                Create new account
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
