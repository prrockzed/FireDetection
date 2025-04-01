// server/models/Logs.js
const mongoose = require('mongoose');

const LogsSchema = new mongoose.Schema({
    nodeId: {
        type: Number,
        required: true,
        enum: [1, 2]  // Restricting values to only 1 or 2
    },
    fireStatus: {
        type: Number,
        required: true,
        enum: [0, 1]  // Restricting values to only 0 or 1
    },
    timestamp: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Logs', LogsSchema);
