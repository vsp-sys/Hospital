import express from 'express';
import License from '../models/License.js';

const router = express.Router();

// Get all licenses
router.get('/', async (req, res) => {
  try {
    const licenses = await License.find().sort({ createdAt: -1 });
    // Map _id to id for the frontend
    const formattedLicenses = licenses.map(lic => ({
      ...lic.toObject(),
      id: lic._id.toString()
    }));
    res.status(200).json(formattedLicenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new license
router.post('/', async (req, res) => {
  const license = new License(req.body);
  try {
    const savedLicense = await license.save();
    res.status(201).json({
      ...savedLicense.toObject(),
      id: savedLicense._id.toString()
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a license
router.put('/:id', async (req, res) => {
  try {
    const updatedLicense = await License.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedLicense) return res.status(404).json({ message: 'License not found' });
    res.status(200).json({
      ...updatedLicense.toObject(),
      id: updatedLicense._id.toString()
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a license
router.delete('/:id', async (req, res) => {
  try {
    const deletedLicense = await License.findByIdAndDelete(req.params.id);
    if (!deletedLicense) return res.status(404).json({ message: 'License not found' });
    res.status(200).json({ message: 'License deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
