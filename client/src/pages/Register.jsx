import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  
  // OTP State for 6 boxes
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const otpInputRefs = useRef([]);

  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (fieldErrors[e.target.id]) {
      setFieldErrors({ ...fieldErrors, [e.target.id]: undefined });
    }
  };

  const validateStep1 = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) errors.email = 'Invalid email';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone Number is required';
    if (!formData.password.trim()) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Min 6 characters required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validateStep1()) return;

    setIsLoading(true);
    try {
        const result = await register(
            formData.firstName.trim(),
            formData.lastName.trim(),
            formData.email.trim(),
            formData.password,
            formData.phoneNumber.trim()
        );

        if (result.success) {
            setStep(2);
        } else {
            setFormError(result.message || 'Registration failed');
        }
    } catch (err) {
        setFormError('Something went wrong');
        console.log(err)
    } finally {
        setIsLoading(false);
    }
  };

  // Handle OTP Input Change
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  // Handle Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
        if (otp[index] === "" && index > 0) {
            otpInputRefs.current[index - 1].focus();
        }
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
        setFormError('Please enter the 6-digit OTP');
        return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp(formData.email.trim(), otpValue);

      if (result.success) {
        if (result.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/student', { replace: true });
        }
      } else {
        setFormError(result.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error(err);
      setFormError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (step === 2) {
        otpInputRefs.current[0]?.focus();
    }
  }, [step]);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden transition-colors duration-300">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-lg px-8 py-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700 z-10">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 mb-2">
            Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
            {step === 1 ? 'Join us and start your learning journey' : 'Verify your email'}
            </p>
        </div>

        {formError && (
          <div className="mb-6 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex items-center">
             <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {formError}
          </div>
        )}

        {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                        <input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${fieldErrors.firstName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        {fieldErrors.firstName && <p className="mt-1 text-xs text-red-500">{fieldErrors.firstName}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            placeholder="Doe"
                            className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${fieldErrors.lastName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                        {fieldErrors.lastName && <p className="mt-1 text-xs text-red-500">{fieldErrors.lastName}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${fieldErrors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                    <input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${fieldErrors.phoneNumber ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                    {fieldErrors.phoneNumber && <p className="mt-1 text-xs text-red-500">{fieldErrors.phoneNumber}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${fieldErrors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-4 text-white font-bold bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                >
                    {isLoading ? 'Sending OTP...' : 'Continue'}
                </button>
            </form>
        ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">Enter 6-digit OTP</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 text-center">
                        (Hackathon Mode: Enter <b>123456</b>)
                    </p>
                    <div className="flex justify-center gap-2 mb-6">
                        {otp.map((data, index) => {
                            return (
                                <input
                                    className="w-12 h-12 text-center text-xl font-bold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    type="text"
                                    name="otp"
                                    maxLength="1"
                                    key={index}
                                    value={data}
                                    ref={el => otpInputRefs.current[index] = el}
                                    onChange={e => handleOtpChange(e.target, index)}
                                    onKeyDown={e => handleKeyDown(e, index)}
                                    onFocus={e => e.target.select()}
                                />
                            );
                        })}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-4 text-white font-bold bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
                >
                    {isLoading ? 'Verifying...' : 'Verify & Register'}
                </button>

                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    Back to details
                </button>
            </form>
        )}

        <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                to="/login"
                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
                >
                Login
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
