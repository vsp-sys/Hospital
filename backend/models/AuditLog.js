import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userType: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String },
  affectedEntity: { type: String }, // e.g., 'Patient', 'Appointment', 'Prescription'
  affectedEntityId: { type: String },
  changes: { type: Object }, // track what changed
  status: { type: String, enum: ['success', 'failure'], default: 'success' }
});

export default mongoose.model('AuditLog', auditLogSchema);
