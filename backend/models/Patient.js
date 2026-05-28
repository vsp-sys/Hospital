import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  branchId: { type: String, required: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  registeredDate: { type: String },
  status: { type: String, enum: ['Inpatient', 'Discharged', 'Outpatient'], default: 'Inpatient' },
  assignedDoctorId: { type: String }
});

export default mongoose.model('Patient', patientSchema);
