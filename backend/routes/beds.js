import express from 'express';
import Bed from '../models/Bed.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all beds (super_admin, branch_admin, staff)
router.get('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'staff'), async (req, res) => {
  const beds = await Bed.find();
  res.json(beds);
});

// Create bed (super_admin, branch_admin)
router.post('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin'), async (req, res) => {
  try {
    const bed = new Bed(req.body);
    await bed.save();
    res.status(201).json(bed);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update bed (super_admin, branch_admin, staff)
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'staff'), async (req, res) => {
  try {
    const bed = await Bed.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bed);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete bed (super_admin only)
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    await Bed.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bed deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
