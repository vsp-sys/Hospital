import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get Razorpay instance (lazy initialization to ensure env vars are loaded)
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_API_KEY;
  const keySecret = process.env.RAZORPAY_API_SECRET;
  
  console.log('Razorpay config check:', {
    keyIdLength: keyId ? keyId.length : 0,
    keyIdPrefix: keyId ? keyId.substring(0, 10) : 'none',
    keySecretLength: keySecret ? keySecret.length : 0,
    keySecretPrefix: keySecret ? keySecret.substring(0, 5) + '...' : 'none'
  });
  
  if (!keyId || !keySecret) {
    throw new Error('Razorpay API credentials not configured. Please set RAZORPAY_API_KEY and RAZORPAY_API_SECRET in .env file.');
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

// Create Razorpay order
router.post('/create-order', authenticateToken, authorizeRoles('branch_admin'), async (req, res) => {
  try {
    console.log('Create order request received:', { 
      userId: req.user.id, 
      userRole: req.user.role,
      body: req.body 
    });

    const { amount, planName } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Convert amount to paise (Razorpay uses paise)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user.id,
        planName: planName || 'subscription'
      }
    };

    console.log('Creating Razorpay order with options:', { ...options, amount: amountInPaise });

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);

    console.log('Razorpay order created:', order.id);

    res.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_API_KEY
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    res.status(500).json({ 
      message: 'Failed to create payment order', 
      error: error.message,
      details: error.toString()
    });
  }
});

// Verify Razorpay payment
router.post('/verify-payment', authenticateToken, authorizeRoles('branch_admin'), async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planName,
      amount
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update user subscription
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set subscription details
    user.subscriptionActive = true;
    user.subscriptionPlan = planName || 'basic';
    user.subscriptionPaidAt = new Date();
    
    // Set expiry to 1 month from now (for monthly subscription)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    user.subscriptionExpiresAt = expiryDate;

    await user.save();

    res.json({
      message: 'Payment verified and subscription activated',
      subscription: {
        active: user.subscriptionActive,
        plan: user.subscriptionPlan,
        paidAt: user.subscriptionPaidAt,
        expiresAt: user.subscriptionExpiresAt
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// Check subscription status
router.get('/subscription-status', authenticateToken, authorizeRoles('branch_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if subscription has expired
    let subscriptionActive = user.subscriptionActive;
    if (user.subscriptionExpiresAt && new Date() > user.subscriptionExpiresAt) {
      subscriptionActive = false;
      // Update the user's subscription status
      user.subscriptionActive = false;
      await user.save();
    }

    res.json({
      subscriptionActive,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionPaidAt: user.subscriptionPaidAt,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      requiresSubscription: user.role === 'branch_admin' && !subscriptionActive
    });
  } catch (error) {
    console.error('Subscription status check error:', error);
    res.status(500).json({ message: 'Failed to check subscription status', error: error.message });
  }
});

export default router;