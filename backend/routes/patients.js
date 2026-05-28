import express from 'express';
import Patient from '../models/Patient.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all patients (super_admin, branch_admin, staff, doctor)
router.get('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'staff', 'doctor'), async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

// Create patient (super_admin, branch_admin, staff)
router.post('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'staff'), async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update patient (super_admin, branch_admin, staff)
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'staff'), async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete patient (super_admin only)
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
