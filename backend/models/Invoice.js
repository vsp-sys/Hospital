import mongoose from 'mongoose';

const invoiceServiceSchema = new mongoose.Schema({
  description: String,
  cost: Number
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  date: { type: String },
  services: [invoiceServiceSchema],
  totalAmount: { type: Number },
  status: { type: String, enum: ['Paid', 'Unpaid', 'Pending'], default: 'Pending' }
});

export default mongoose.model('Invoice', invoiceSchema);
