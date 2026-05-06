const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const User = require('../models/User');

// Add a new client (Business) for an Agency
router.post('/add', async (req, res) => {
  const { agencyId, businessName, niche, location, language, limits } = req.body;
  try {
    // Check agency limits
    const agency = await User.findById(agencyId);
    if (!agency || agency.profile.role !== 'AGENCY') {
      return res.status(403).json({ error: 'Only agencies can add clients.' });
    }

    const newClient = new Client({
      agencyId,
      businessName,
      niche,
      location,
      language,
      limits
    });

    await newClient.save();
    res.status(201).json(newClient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all clients for an Agency
router.get('/my-clients/:agencyId', async (req, res) => {
  try {
    const clients = await Client.find({ agencyId: req.params.agencyId });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update client settings
router.post('/update/:clientId', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.clientId, req.body, { new: true });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
