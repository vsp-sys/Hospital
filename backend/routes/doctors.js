import express from 'express';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import StaffAdmin from '../models/StaffAdmin.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all doctors (super_admin, branch_admin, staff)
router.get('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin', 'staff'), async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

// Create doctor (super_admin, branch_admin)
router.post('/', authenticateToken, authorizeRoles('super_admin', 'branch_admin'), async (req, res) => {
  try {
    // Extract user fields from request
    const { name, email, password, branchId, specialty, contact, availability, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields: name, email, password' });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Normalize role (map 'nurse' to 'staff')
    const assignedRole = (role === 'nurse') ? 'staff' : (role || 'doctor');

    // If role provided and is not 'doctor', create a User and associated staff record
    if (assignedRole && assignedRole !== 'doctor') {
      const user = new User({
        name,
        email,
        password, // In production, hash the password!
        role: assignedRole
      });
      await user.save();

      // create Staff or StaffAdmin record if branchId available
      if (assignedRole === 'staff') {
        const staff = new Staff({
          branchId: branchId || '',
          userId: user._id,
          name,
          position: specialty || 'Clinical Staff',
          availability: availability || 'On Duty',
          contact: contact || ''
        });
        await staff.save();
        return res.status(201).json({ user, staff });
      }

      if (assignedRole === 'staff_admin') {
        const admin = new StaffAdmin({
          branchId: branchId || '',
          userId: user._id,
          name,
          title: specialty || 'Staff Administrator',
          contact: contact || '',
          permissions: []
        });
        await admin.save();
        return res.status(201).json({ user, admin });
      }

      // fallback: return created user
      return res.status(201).json({ user });
    }

    // For doctor role: branchId is required
    if (!branchId) {
      return res.status(400).json({ message: 'Missing required field: branchId' });
    }

    // Create user for doctor
    const user = new User({
      name,
      email,
      password, // In production, hash the password!
      role: 'doctor'
    });
    await user.save();

    // Create doctor with reference to user
    const doctor = new Doctor({
      branchId,
      userId: user._id,
      name,
      specialty,
      contact,
      availability
    });
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    console.error('Doctor creation error:', err);
    res.status(400).json({ message: err.message, error: err });
  }
});

// Update doctor (super_admin, branch_admin)
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'branch_admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete doctor (super_admin only)
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
