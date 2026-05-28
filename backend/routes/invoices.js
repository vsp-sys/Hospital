import express from 'express';
import Invoice from '../models/Invoice.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all invoices (super_admin, branch_admin, staff)
router.get('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'staff'), async (req, res) => {
  const invoices = await Invoice.find();
  res.json(invoices);
});

// Create invoice (super_admin, branch_admin, staff)
router.post('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'staff'), async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update invoice (super_admin, branch_admin, staff)
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'staff'), async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete invoice (super_admin only)
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
