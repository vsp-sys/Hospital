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

// Update branch admin subscription status
router.put('/:id/subscription', authenticateToken, authorizeRoles('super_admin', 'branch_admin'), async (req, res) => {
  try {
    if (req.user.role === 'branch_admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Branch admins may only update their own subscription.' });
    }

    const { subscriptionActive, subscriptionPlan } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof subscriptionActive !== 'undefined') {
      user.subscriptionActive = subscriptionActive;
      if (subscriptionActive) {
        user.subscriptionPaidAt = new Date();
      }
    }

    if (subscriptionPlan) {
      user.subscriptionPlan = subscriptionPlan;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
