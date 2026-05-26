import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  registeredDate: { type: String },
  status: { type: String, enum: ['Inpatient', 'Discharged', 'Outpatient'], default: 'Inpatient' },
  assignedDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
});

export default mongoose.model('Patient', patientSchema);
