import express from 'express';
import ShiftHandoff from '../models/ShiftHandoff.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all shift handoffs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const handoffs = await ShiftHandoff.find();
    res.json(handoffs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get pending handoffs
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const handoffs = await ShiftHandoff.find({ status: 'pending' });
    res.json(handoffs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create shift handoff (staff, doctor)
router.post('/', authenticateToken, authorizeRoles('staff', 'doctor'), async (req, res) => {
  try {
    const handoff = new ShiftHandoff({
      ...req.body,
      fromStaffId: req.user.id
    });
    await handoff.save();
    res.status(201).json(handoff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update handoff
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const handoff = await ShiftHandoff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!handoff) return res.status(404).json({ message: 'Handoff not found' });
    res.json(handoff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Complete handoff (acknowledge/accept)
router.patch('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const handoff = await ShiftHandoff.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );
    if (!handoff) return res.status(404).json({ message: 'Handoff not found' });
    res.json(handoff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete handoff (superadmin)
router.delete('/:id', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const handoff = await ShiftHandoff.findByIdAndDelete(req.params.id);
    if (!handoff) return res.status(404).json({ message: 'Handoff not found' });
    res.json({ message: 'Handoff deleted', handoff });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
