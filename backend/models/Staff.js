import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  branchId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  position: { type: String },
  availability: { type: String, enum: ['On Duty', 'Off Duty', 'Emergency'], default: 'On Duty' },
  contact: { type: String }
});

export default mongoose.model('Staff', staffSchema);
