// server/routes/logs.js
const express = require('express');
const router = express.Router();
const Logs = require('../models/Logs');

// Get all logs
router.get('/', async (req, res) => {
    try {
        const logs = await Logs.find().sort({ timestamp: 1 });
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get logs by nodeId
router.get('/node/:nodeId', async (req, res) => {
    try {
        const logs = await Logs.find({ nodeId: req.params.nodeId }).sort({ timestamp: 1 });
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get logs by fireStatus
router.get('/status/:fireStatus', async (req, res) => {
    try {
        const logs = await Logs.find({ fireStatus: req.params.fireStatus }).sort({ timestamp: 1 });
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
