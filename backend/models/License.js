import mongoose from 'mongoose';

const licenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  duration: { type: String, required: true, default: 'month' }
}, { timestamps: true });

// Check if model already exists to avoid OverwriteModelError
const License = mongoose.models.License || mongoose.model('License', licenseSchema);

export default License;
