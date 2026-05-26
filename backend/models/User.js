import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'branch_admin', 'doctor', 'staff', 'patient', 'staff_admin'], required: true }
});

export default mongoose.model('User', userSchema);
