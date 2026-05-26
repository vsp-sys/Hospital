import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  itemType: { type: String, required: true }, // e.g., medication, supplies, equipment
  quantity: { type: Number, required: true },
  unit: { type: String }, // e.g., pcs, boxes, bottles
  minThreshold: { type: Number },
  maxThreshold: { type: Number },
  location: { type: String }, // storage location
  branchId: { type: String },
  expiryDate: { type: Date },
  supplierName: { type: String },
  cost: { type: Number },
  lastRestockedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Inventory', inventorySchema);
