import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  name: { type: String, required: true },
  specialty: { type: String },
  rating: { type: Number, default: 0 },
  availability: { type: String, enum: ['On Duty', 'Off Duty', 'Emergency'], default: 'On Duty' },
  contact: { type: String },
  earnings: { type: Number, default: 0 }
});

export default mongoose.model('Doctor', doctorSchema);
