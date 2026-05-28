import express from 'express';
import Branch from '../models/Branch.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all branches (super_admin, branch_admin)
router.get('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin'), async (req, res) => {
  const branches = await Branch.find();
  res.json(branches);
});

// Create branch (super_admin, branch_admin)
router.post('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin'), async (req, res) => {
  try {
    const branch = new Branch(req.body);
    await branch.save();
    res.status(201).json(branch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update branch (super_admin, branch_admin)
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'branch_admin'), async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(branch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete branch (super_admin only)
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    await Branch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Branch deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
