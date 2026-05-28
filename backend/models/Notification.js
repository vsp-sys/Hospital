import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetRole: { type: String, required: true }, // 'all', 'superadmin', 'branchadmin', 'doctor', 'staff', 'patient'
  urgency: { type: String, enum: ['Info', 'Warning', 'Alert', 'Critical', 'Urgent'], default: 'Info' },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  readBy: [{ type: String }], // list of user IDs who read it
  relatedEntityId: { type: String }, // link to patient, appointment, etc.
  relatedEntityType: { type: String }, // 'patient', 'appointment', 'prescription', etc.
  actionUrl: { type: String } // link to take action on this notification
});

export default mongoose.model('Notification', notificationSchema);
