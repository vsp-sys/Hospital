import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// Get all audit logs with optional filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userType, action, affectedEntity, status, startDate, endDate } = req.query;
    const filter = {};
    
    if (userType) filter.userType = userType;
    if (action) filter.action = action;
    if (affectedEntity) filter.affectedEntity = affectedEntity;
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const logs = await AuditLog.find(filter).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get audit log by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Audit log not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create audit log
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userType, action, affectedEntity, affectedEntityId } = req.body;
    
    if (!userType || !action) {
      return res.status(400).json({ message: 'userType and action are required' });
    }
    
    const log = new AuditLog({
      ...req.body,
      timestamp: new Date(),
      status: req.body.status || 'success'
    });
    
    const savedLog = await log.save();
    res.status(201).json(savedLog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update audit log
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Audit log not found' });
    
    Object.assign(log, req.body);
    const updatedLog = await log.save();
    res.json(updatedLog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete audit log
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const log = await AuditLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: 'Audit log not found' });
    res.json({ message: 'Audit log deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
