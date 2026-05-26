import express from 'express';
import Prescription from '../models/Prescription.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all prescriptions (superadmin, branchadmin, doctor, staff)
router.get('/', authenticateToken, authorizeRoles('superadmin', 'branchadmin', 'doctor', 'staff'), async (req, res) => {
  const prescriptions = await Prescription.find();
  res.json(prescriptions);
});

// Create prescription (doctor only)
router.post('/', authenticateToken, authorizeRoles('doctor'), async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    await prescription.save();
    res.status(201).json(prescription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update prescription (doctor only)
router.put('/:id', authenticateToken, authorizeRoles('doctor'), async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(prescription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete prescription (superadmin only)
router.delete('/:id', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Prescription deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
