import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String },
  doctorId: { type: String, required: true },
  doctorName: { type: String },
  branchId: { type: String, required: true },
  date: { type: String },
  timeSlot: { type: String },
  type: { type: String, enum: ['In-Person', 'Telemedicine'], default: 'In-Person' },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }
});

export default mongoose.model('Appointment', appointmentSchema);
