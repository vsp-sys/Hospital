import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import otpGenerator from 'otp-generator';
import User from '../models/User.js';
import OTP from '../models/OTP.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Email transporter configuration
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  // Check if credentials are configured
  if (!emailUser || !emailPass) {
    console.warn('⚠️  Email credentials not configured. OTP emails will not be sent.');
    console.warn('   Set EMAIL_USER and EMAIL_PASS in .env file.');
    return null;
  }
  
  // Configure for Gmail (most common)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'Hospital Management System - Login Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
          <h2 style="color: #1e293b; margin-bottom: 16px;">Two-Factor Authentication</h2>
          <p style="color: #475569; font-size: 16px;">You're attempting to log in to the Hospital Management System.</p>
          <p style="color: #475569; font-size: 16px;">Use the following verification code to complete your login:</p>
          <div style="background-color: #e0f2fe; border: 2px solid #0284c7; padding: 16px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; color: #0c4a6e; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code is valid for 5 minutes only.</p>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this code, please ignore this email or contact support.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login - Step 1: Validate credentials and send OTP
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    // Check if password is hashed (starts with $2) or plaintext
    let match = false;
    if (user.password.startsWith('$2')) {
      // It's a bcrypt hash
      match = await bcrypt.compare(password, user.password);
    } else {
      // It's plaintext - do direct comparison
      match = password === user.password;
    }
    
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    });

    // Delete any existing OTP for this user
    await OTP.deleteMany({ userId: user._id });

    // Save OTP to database
    const otpRecord = new OTP({
      email: user.email,
      otp,
      userId: user._id
    });
    await otpRecord.save();

    // Send OTP via email
    const emailSent = await sendOTPEmail(user.email, otp);
    if (!emailSent) {
      console.error('Failed to send OTP email');
      // Still allow login for testing purposes if email fails
    }

    // Return success with message to check email
    res.json({ 
      message: 'Credentials verified. OTP sent to your email.',
      requires2FA: true,
      tempToken: jwt.sign({ id: user._id, step: '2fa_pending' }, JWT_SECRET, { expiresIn: '5m' })
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP - Step 2: Complete login after OTP verification
router.post('/verify-otp', async (req, res) => {
  const { otp, tempToken } = req.body;
  
  try {
    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ message: 'Session expired. Please login again.' });
    }

    if (decoded.step !== '2fa_pending') {
      return res.status(400).json({ message: 'Invalid session state' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      userId: decoded.id,
      otp,
      purpose: 'login'
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Get user details
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Check if branch admin needs subscription
    let requiresSubscription = false;
    if (user.role === 'branch_admin') {
      // Check if subscription is active and not expired
      const isExpired = user.subscriptionExpiresAt && new Date() > user.subscriptionExpiresAt;
      requiresSubscription = !user.subscriptionActive || isExpired;
    }

    // Generate final JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        requiresSubscription,
        hospitalName: user.hospitalName,
        branchName: user.branchName
      },
      message: 'Login successful'
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  const { tempToken } = req.body;
  
  try {
    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ message: 'Session expired. Please login again.' });
    }

    if (decoded.step !== '2fa_pending') {
      return res.status(400).json({ message: 'Invalid session state' });
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    });

    // Delete old OTP
    await OTP.deleteMany({ userId: user._id });

    // Save new OTP
    const otpRecord = new OTP({
      email: user.email,
      otp,
      userId: user._id
    });
    await otpRecord.save();

    // Send new OTP via email
    const emailSent = await sendOTPEmail(user.email, otp);
    if (!emailSent) {
      console.error('Failed to send OTP email');
    }

    res.json({ message: 'New OTP sent to your email' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;