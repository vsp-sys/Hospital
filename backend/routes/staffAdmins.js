import express from 'express';
import StaffAdmin from '../models/StaffAdmin.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all staff admins
router.get('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin'), async (req, res) => {
  try {
    const admins = await StaffAdmin.find();
    res.json(admins);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
