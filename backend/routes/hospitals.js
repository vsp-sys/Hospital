import express from 'express';
import Hospital from '../models/Hospital.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all hospitals (superadmin only)
router.get('/', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  const hospitals = await Hospital.find();
  res.json(hospitals);
});

// Create hospital (superadmin only)
router.post('/', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json(hospital);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update hospital (superadmin only)
router.put('/:id', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(hospital);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete hospital (superadmin only)
router.delete('/:id', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hospital deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
