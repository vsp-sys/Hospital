import express from 'express';
import Bed from '../models/Bed.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all beds (superadmin, branchadmin, staff)
router.get('/', authenticateToken, authorizeRoles('superadmin', 'branchadmin', 'staff'), async (req, res) => {
  const beds = await Bed.find();
  res.json(beds);
});

// Create bed (superadmin, branchadmin)
router.post('/', authenticateToken, authorizeRoles('superadmin', 'branchadmin'), async (req, res) => {
  try {
    const bed = new Bed(req.body);
    await bed.save();
    res.status(201).json(bed);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update bed (superadmin, branchadmin, staff)
router.put('/:id', authenticateToken, authorizeRoles('superadmin', 'branchadmin', 'staff'), async (req, res) => {
  try {
    const bed = await Bed.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bed);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete bed (superadmin only)
router.delete('/:id', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    await Bed.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bed deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
