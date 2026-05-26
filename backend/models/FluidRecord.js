import mongoose from 'mongoose';

const fluidRecordSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  fluidType: { type: String, enum: ['intake', 'output'], required: true },
  amount: { type: Number, required: true }, // in mL
  source: { type: String }, // e.g., IV, oral, urine, catheter
  time: { type: Date, default: Date.now },
  recordedBy: { type: String, required: true },
  notes: { type: String }
});

export default mongoose.model('FluidRecord', fluidRecordSchema);
