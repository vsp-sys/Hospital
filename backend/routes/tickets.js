import express from 'express';
import Ticket from '../models/Ticket.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all tickets (superadmin, staff)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single ticket
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Create ticket (any authenticated user)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const ticket = new Ticket({
      ...req.body,
      createdBy: req.user.id
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update ticket (superadmin, staff)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Resolve ticket (super_admin)
router.patch('/:id/resolve', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date(), updatedAt: new Date() },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete ticket (super_admin only)
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ message: 'Ticket deleted', ticket });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
