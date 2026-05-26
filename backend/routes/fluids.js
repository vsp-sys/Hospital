import express from 'express';
import FluidRecord from '../models/FluidRecord.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all fluid records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const fluids = await FluidRecord.find();
    res.json(fluids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get fluid records for a patient
router.get('/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const fluids = await FluidRecord.find({ patientId: req.params.patientId });
    res.json(fluids);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create fluid record (doctor, staff)
router.post('/', authenticateToken, authorizeRoles('doctor', 'staff'), async (req, res) => {
  try {
    const fluidRecord = new FluidRecord({
      ...req.body,
      recordedBy: req.user.id
    });
    await fluidRecord.save();
    res.status(201).json(fluidRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update fluid record (doctor, staff)
router.put('/:id', authenticateToken, authorizeRoles('doctor', 'staff'), async (req, res) => {
  try {
    const fluidRecord = await FluidRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fluidRecord) return res.status(404).json({ message: 'Fluid record not found' });
    res.json(fluidRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete fluid record (superadmin)
router.delete('/:id', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const fluidRecord = await FluidRecord.findByIdAndDelete(req.params.id);
    if (!fluidRecord) return res.status(404).json({ message: 'Fluid record not found' });
    res.json({ message: 'Fluid record deleted', fluidRecord });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
