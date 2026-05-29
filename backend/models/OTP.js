import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  purpose: { type: String, enum: ['login'], default: 'login' },
  createdAt: { type: Date, default: Date.now, expires: 300 } // Auto-expire after 5 minutes
});

export default mongoose.model('OTP', otpSchema);