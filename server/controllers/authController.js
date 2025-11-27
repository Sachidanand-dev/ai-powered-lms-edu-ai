const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email address' });
        }

        // Streak Logic
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        let streak = user.streak || 0;
        let lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;

        if (lastLogin) {
            const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
            const diffTime = Math.abs(today - lastLoginDay);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day
                streak += 1;
            } else if (diffDays > 1) {
                // Missed a day (or more)
                streak = Math.max(0, streak - 1); // "streak minuses one" as requested
            }
            // If diffDays === 0 (same day), do nothing
        } else {
            // First login ever (or since feature added)
            streak = 1;
        }

        user.streak = streak;
        user.lastLoginDate = now;
        await user.save();

        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            streak: user.streak,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    let user = await User.findOne({ email });

    const role = email === process.env.ADMIN_EMAIL ? 'admin' : 'student';
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = '123456'; // Dummy OTP for Hackathon
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (user) {
        if (user.isVerified) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        // User exists but not verified, update details and new OTP
        user.firstName = firstName;
        user.lastName = lastName;
        user.password = password; // Will be hashed by pre-save hook
        user.phoneNumber = phoneNumber;
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();
    } else {
        // Create new user
        user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            role,
            otp,
            otpExpires,
            isVerified: false,
        });
    }

    if (user) {
        try {
            // await sendEmail({
            //     email: user.email,
            //     subject: 'Your Verification Code',
            //     message: `Your verification code is ${otp}. It expires in 10 minutes.`,
            // });

            res.status(201).json({
                message: 'Registration successful. Please verify your email.',
                email: user.email,
            });
        } catch (error) {
            console.error(error);
            // Optional: delete user if email fails? Or just let them resend?
            // For now, we'll keep the user but they can't login.
            res.status(500).json({ message: 'Error sending email: ' + error.message });
        }
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
        return res.status(400).json({ message: 'User already verified' });
    }

    console.log('Verifying OTP for:', email);
    console.log('Received OTP:', otp);
    console.log('Stored OTP:', user.otp);
    console.log('Expires:', user.otpExpires);
    console.log('Now:', Date.now());

    if (user.otp === otp && user.otpExpires > Date.now()) {
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        
        // Initialize streak
        user.streak = 1;
        user.lastLoginDate = Date.now();
        
        await user.save();

        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            streak: user.streak,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid or expired OTP' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role,
            streak: updatedUser.streak,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = { authUser, registerUser, verifyOtp, updateUserProfile };
