// server/scripts/populateLogs.js
const mongoose = require('mongoose');
const config = require('../config');
const Logs = require('../models/Logs');

// Connect to MongoDB
mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// Function to generate a random number between min and max (inclusive)
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to generate random timestamp between 18 March 2025 5pm to 6pm
const getRandomTimestamp = () => {
    // Start time: 18 March 2025 5pm
    const startTime = new Date('2025-03-18T17:00:00');
    // End time: 18 March 2025 6pm
    const endTime = new Date('2025-03-18T18:00:00');
    
    // Random time between start and end
    const randomTime = new Date(
        startTime.getTime() + 
        Math.random() * (endTime.getTime() - startTime.getTime())
    );
    
    return randomTime;
};

// Number of log entries to create
const numberOfEntries = 100;

const populateLogs = async () => {
    try {
        // Clear existing logs
        await Logs.deleteMany({});
        console.log('Existing logs cleared');
        
        // Array to hold our log entries
        const logsToInsert = [];
        
        // Generate random log entries
        for (let i = 0; i < numberOfEntries; i++) {
            logsToInsert.push({
                nodeId: getRandomInt(1, 2),
                fireStatus: getRandomInt(0, 1),
                timestamp: getRandomTimestamp()
            });
        }
        
        // Sort by timestamp (optional, but useful)
        logsToInsert.sort((a, b) => a.timestamp - b.timestamp);
        
        // Insert all logs
        await Logs.insertMany(logsToInsert);
        console.log(`${numberOfEntries} log entries added successfully`);
        
        // Disconnect from MongoDB
        mongoose.disconnect();
    } catch (err) {
        console.error('Error populating logs:', err);
        mongoose.disconnect();
    }
};

// Run the population function
populateLogs();
