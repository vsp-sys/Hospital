import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'branch_admin', 'doctor', 'staff', 'patient', 'staff_admin'], required: true },
  subscriptionActive: { type: Boolean, default: false },
  subscriptionPlan: { type: String, default: 'basic' },
  subscriptionPaidAt: { type: Date },
  subscriptionExpiresAt: { type: Date },
  hospitalName: { type: String },
  branchName: { type: String },
  branchId: { type: String },
  hospitalAddress: { type: String },
  phone: { type: String }
});

export default mongoose.model('User', userSchema);
