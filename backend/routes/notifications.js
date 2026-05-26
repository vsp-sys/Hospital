import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all notifications with optional filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { targetRole, urgency, read, relatedEntityId } = req.query;
    const filter = {};
    
    if (targetRole) filter.targetRole = targetRole;
    if (urgency) filter.urgency = urgency;
    if (read !== undefined) filter.read = read === 'true';
    if (relatedEntityId) filter.relatedEntityId = relatedEntityId;
    
    const notifications = await Notification.find(filter).sort({ timestamp: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get notification by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create notification
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, message, targetRole, urgency, relatedEntityId, relatedEntityType } = req.body;
    
    if (!title || !message || !targetRole) {
      return res.status(400).json({ message: 'title, message, and targetRole are required' });
    }
    
    const notification = new Notification({
      ...req.body,
      timestamp: new Date(),
      read: false,
      readBy: []
    });
    
    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update notification
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    Object.assign(notification, req.body);
    const updatedNotification = await notification.save();
    res.json(updatedNotification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    notification.read = true;
    if (userId && !notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
    }
    
    const updatedNotification = await notification.save();
    res.json(updatedNotification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
