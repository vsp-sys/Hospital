import mongoose from 'mongoose';

const medicineLineSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  duration: String,
  instructions: String
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String },
  doctorId: { type: String, required: true },
  doctorName: { type: String },
  date: { type: String },
  diagnosis: { type: String },
  medicines: [medicineLineSchema]
});

export default mongoose.model('Prescription', prescriptionSchema);
