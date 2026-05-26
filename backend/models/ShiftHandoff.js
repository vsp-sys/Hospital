import mongoose from 'mongoose';

const shiftHandoffSchema = new mongoose.Schema({
  fromStaffId: { type: String, required: true },
  toStaffId: { type: String, required: true },
  shift: { type: String, enum: ['morning', 'afternoon', 'night'], required: true },
  date: { type: Date, default: Date.now },
  handoffTime: { type: Date, default: Date.now },
  patientUpdates: { type: String }, // summary of patient updates
  criticalNotes: { type: String }, // critical information to pass on
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  completedAt: { type: Date }
});

export default mongoose.model('ShiftHandoff', shiftHandoffSchema);
