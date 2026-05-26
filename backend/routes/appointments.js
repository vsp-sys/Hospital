import express from 'express';
import Appointment from '../models/Appointment.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all appointments (superadmin, branchadmin, doctor, staff)
router.get('/', authenticateToken, authorizeRoles('superadmin', 'branchadmin', 'doctor', 'staff'), async (req, res) => {
  const appointments = await Appointment.find();
  res.json(appointments);
});

// Create appointment (superadmin, branchadmin, staff)
router.post('/', authenticateToken, authorizeRoles('superadmin', 'branchadmin', 'staff'), async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update appointment (superadmin, branchadmin, doctor, staff)
router.put('/:id', authenticateToken, authorizeRoles('superadmin', 'branchadmin', 'doctor', 'staff'), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete appointment (superadmin only)
router.delete('/:id', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
