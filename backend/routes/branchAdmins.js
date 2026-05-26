import express from 'express';
import BranchAdmin from '../models/BranchAdmin.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all branch admins
router.get('/', authenticateToken, async (req, res) => {
  try {
    const admins = await BranchAdmin.find();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get branch admin by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const admin = await BranchAdmin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Branch admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get admins for a specific branch
router.get('/branch/:branchId', authenticateToken, async (req, res) => {
  try {
    const admins = await BranchAdmin.find({ branchId: req.params.branchId });
    res.json(admins);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create branch admin (superadmin only)
router.post('/', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const admin = new BranchAdmin(req.body);
    await admin.save();
    res.status(201).json(admin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update branch admin (superadmin, self)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const admin = await BranchAdmin.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!admin) return res.status(404).json({ message: 'Branch admin not found' });
    res.json(admin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Toggle admin status (superadmin)
router.patch('/:id/toggle-status', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const admin = await BranchAdmin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Branch admin not found' });
    admin.status = admin.status === 'Active' ? 'Inactive' : 'Active';
    admin.updatedAt = new Date();
    await admin.save();
    res.json(admin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete branch admin (superadmin only)
router.delete('/:id', authenticateToken, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const admin = await BranchAdmin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Branch admin not found' });
    res.json({ message: 'Branch admin deleted', admin });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
