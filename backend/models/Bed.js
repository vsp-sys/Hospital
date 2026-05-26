import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema({
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  wardName: { type: String },
  bedNumber: { type: String },
  status: { type: String, enum: ['Occupied', 'Sanitation', 'Available'], default: 'Available' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  patientName: { type: String }
});

export default mongoose.model('Bed', bedSchema);
