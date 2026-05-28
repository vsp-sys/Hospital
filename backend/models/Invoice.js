import mongoose from 'mongoose';

const invoiceServiceSchema = new mongoose.Schema({
  description: String,
  cost: Number
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String },
  branchId: { type: String, required: true },
  date: { type: String },
  services: [invoiceServiceSchema],
  totalAmount: { type: Number },
  status: { type: String, enum: ['Paid', 'Unpaid', 'Pending'], default: 'Pending' }
});

export default mongoose.model('Invoice', invoiceSchema);
