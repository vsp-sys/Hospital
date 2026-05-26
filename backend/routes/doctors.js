import express from 'express';
import Doctor from '../models/Doctor.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all doctors (superadmin, branchadmin, staff)
router.get('/', authenticateToken, authorizeRoles('superadmin', 'branchadmin', 'staff'), async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

// Create doctor (superadmin, branchadmin)
router.post('/', authenticateToken, authorizeRoles('superadmin', 'branchadmin'), async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update doctor (superadmin, branchadmin)
router.put('/:id', authenticateToken, authorizeRoles('superadmin', 'branchadmin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete doctor (superadmin only)
router.delete('/:id', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
