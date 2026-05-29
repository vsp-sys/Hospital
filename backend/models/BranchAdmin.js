import mongoose from 'mongoose';

const branchAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  branchId: { type: String, required: true },
  branchName: { type: String, required: true },
  role: { type: String, enum: ['branchadmin'], default: 'branchadmin' },
  status: { type: String, enum: ['Active', 'Inactive', 'Pending'], default: 'Active' },
  subscriptionActive: { type: Boolean, default: false },
  permissions: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('BranchAdmin', branchAdminSchema);
