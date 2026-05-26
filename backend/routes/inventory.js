import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Inventory from '../models/Inventory.js';

const router = express.Router();

// Get all inventory items with optional filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { itemType, branchId, location } = req.query;
    const filter = {};
    
    if (itemType) filter.itemType = itemType;
    if (branchId) filter.branchId = branchId;
    if (location) filter.location = location;
    
    const items = await Inventory.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get inventory item by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create inventory item
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { itemName, itemType, quantity, unit, branchId } = req.body;
    
    if (!itemName || !itemType || quantity === undefined) {
      return res.status(400).json({ message: 'itemName, itemType, and quantity are required' });
    }
    
    const item = new Inventory({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update inventory item
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    Object.assign(item, req.body, { updatedAt: new Date() });
    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete inventory item
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
