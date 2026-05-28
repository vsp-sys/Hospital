import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema({
  branchId: { type: String, required: true },
  wardName: { type: String },
  bedNumber: { type: String },
  status: { type: String, enum: ['Occupied', 'Sanitation', 'Available'], default: 'Available' },
  patientId: { type: String },
  patientName: { type: String }
});

export default mongoose.model('Bed', bedSchema);
