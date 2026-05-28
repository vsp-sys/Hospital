import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  hospitalId: { type: String, required: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  bedsTotal: { type: Number, default: 0 },
  bedsOccupied: { type: Number, default: 0 },
  bedsAvailable: { type: Number, default: 0 },
  staffCount: { type: Number, default: 0 },
  activeDoctorsCount: { type: Number, default: 0 }
});

export default mongoose.model('Branch', branchSchema);
