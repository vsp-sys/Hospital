import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  tier: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  branchesCount: { type: Number, default: 0 },
  contactEmail: { type: String },
  joinedDate: { type: String }
});

export default mongoose.model('Hospital', hospitalSchema);
