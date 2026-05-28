import express from 'express';
import User from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get users, optionally filter by role via ?role=
router.get('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'staff'), async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter);
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
