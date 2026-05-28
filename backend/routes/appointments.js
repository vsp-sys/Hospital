import express from 'express';
import Appointment from '../models/Appointment.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all appointments (super_admin, branch_admin, doctor, staff)
router.get('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'doctor', 'staff'), async (req, res) => {
  const appointments = await Appointment.find();
  res.json(appointments);
});

// Create appointment (super_admin, branch_admin, staff)
router.post('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'staff'), async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update appointment (super_admin, branch_admin, doctor, staff)
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'doctor', 'staff'), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete appointment (super_admin only)
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
