import mongoose from 'mongoose';

const staffAdminSchema = new mongoose.Schema({
  branchId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  title: { type: String },
  contact: { type: String },
  permissions: { type: [String], default: [] }
});

export default mongoose.model('StaffAdmin', staffAdminSchema);
