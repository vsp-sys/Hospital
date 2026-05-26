import express from 'express';
import Invoice from '../models/Invoice.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all invoices (superadmin, branchadmin, staff)
router.get('/', authenticateToken, authorizeRoles('superadmin', 'branchadmin', 'staff'), async (req, res) => {
  const invoices = await Invoice.find();
  res.json(invoices);
});

// Create invoice (superadmin, branchadmin, staff)
router.post('/', authenticateToken, authorizeRoles('superadmin', 'branchadmin', 'staff'), async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update invoice (superadmin, branchadmin, staff)
router.put('/:id', authenticateToken, authorizeRoles('superadmin', 'branchadmin', 'staff'), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete invoice (superadmin only)
router.delete('/:id', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
