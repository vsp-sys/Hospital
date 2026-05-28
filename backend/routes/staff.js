import express from 'express';
import Staff from '../models/Staff.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all staff members
router.get('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'staff'), async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
