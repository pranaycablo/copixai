const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Get all categories and niches
router.get('/all', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Add Category
router.post('/add', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, icon, niches, isMonetizable, isViral } = req.body;
    const newCat = new Category({ name, icon, niches, isMonetizable, isViral });
    await newCat.save();
    res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update Category
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete Category
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;

