const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config'); // Store your API key safely here
const { MongoClient } = require('mongodb');

// Load Gemini model
const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// MongoDB URI
const MONGO_URI = config.mongoURI;

// Convert ISO timestamp to IST human-readable
function convertIsoToIst(isoDate) {
  const date = new Date(isoDate);
  date.setHours(date.getHours() + 5);
  date.setMinutes(date.getMinutes() + 30);
  return date.toLocaleString();
}

router.get('/query', async (req, res) => {
  const { node_id, query } = req.query;

  if (!node_id || !query) {
    return res.status(400).json({ error: 'Missing node_id or query' });
  }

  try {
    const client = new MongoClient(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await client.connect();
    const db = client.db('fire_sensor_data');
    const collection = db.collection('readings');

    const readings = await collection.find({ node_id: parseInt(node_id) }).toArray();
    client.close();

    if (!readings.length) {
      return res.status(404).json({ error: 'No data found for given node_id' });
    }

    // Transform & sample data
    const data = readings.map(reading => ({
      timestamp: convertIsoToIst(reading.timestamp),
      battery_voltage: parseFloat(reading.battery_voltage?.$numberDouble || reading.battery_voltage),
      solar: parseFloat(reading.solar?.$numberDouble || reading.solar),
      pressure: parseFloat(reading.pressure?.$numberDouble || reading.pressure)
    }));

    const sampled = data.length > 20
      ? Array.from({ length: 20 }, (_, i) => data[Math.floor(i * data.length / 20)])
      : data;

    const contextData = sampled.map(d =>
      `Timestamp: ${d.timestamp}, Battery Voltage: ${d.battery_voltage}, Solar: ${d.solar}, Pressure: ${d.pressure}`
    ).join('\n');

    const prompt = `${query}. Here is the data:\n\n${contextData}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ response: response.text() });
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

