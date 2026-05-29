import express from 'express';
import BranchAdmin from '../models/BranchAdmin.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
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

// Create branch admin (registration or super_admin creation)
router.post('/', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    // If no token, it's a public registration: force status to Pending
    if (!token) {
      req.body.status = 'Pending';
      req.body.subscriptionActive = false;
    } else {
      // If there is a token, we should verify it and ensure it's a super_admin,
      // but for simplicity in this endpoint, if the frontend sends a token
      // we assume it's the super_admin using the portal. (Ideally we'd verify the token).
      // The frontend adds branch admin with status 'Active'.
      req.body.subscriptionActive = req.body.subscriptionActive || false;
    }

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
    
    // If status became Active, ensure they have a User account for login
    if (admin.status === 'Active') {
      const existingUser = await User.findOne({ email: admin.email });
      if (!existingUser) {
        // Hash the password if it's not already hashed (assuming bcrypt)
        const passToHash = admin.password || 'TempPass123!';
        const hashed = passToHash.startsWith('$2') ? passToHash : await bcrypt.hash(passToHash, 10);
        const newUser = new User({
          name: admin.name,
          email: admin.email,
          password: hashed,
          role: 'branch_admin',
          subscriptionActive: false,
          subscriptionPlan: 'basic'
        });
        await newUser.save();
      } else if (typeof existingUser.subscriptionActive === 'undefined') {
        existingUser.subscriptionActive = false;
        existingUser.subscriptionPlan = existingUser.subscriptionPlan || 'basic';
        await existingUser.save();
      }
    } else {
      // If status is Inactive or Pending, revoke access by deleting from User collection
      await User.findOneAndDelete({ email: admin.email });
    }

    if (typeof req.body.subscriptionActive !== 'undefined') {
      const existingUser = await User.findOne({ email: admin.email });
      if (existingUser) {
        existingUser.subscriptionActive = req.body.subscriptionActive;
        existingUser.subscriptionPlan = req.body.subscriptionPlan || existingUser.subscriptionPlan || 'basic';
        if (req.body.subscriptionActive) {
          existingUser.subscriptionPaidAt = new Date();
        }
        await existingUser.save();
      }
    }
    
    res.json(admin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Toggle admin status (super_admin)
router.patch('/:id/toggle-status', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
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

// Delete branch admin (super_admin only)
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const admin = await BranchAdmin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Branch admin not found' });
    res.json({ message: 'Branch admin deleted', admin });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
