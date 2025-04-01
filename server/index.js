// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});

// MongoDB connection string from config
const MONGO_URI = config.mongoURI;

app.use(express.json());
app.use(cors());

// Keep your existing mongoose connection for auth
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected with Mongoose'))
    .catch(err => console.error(err));

// Add the MongoDB client connection for the logs API to match Python client
let database;
async function connectToDatabase() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log("Connected to MongoDB with MongoClient");
    return client.db("fire_sensor_data");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return null;
  }
}

// Initialize database connection
(async () => {
  database = await connectToDatabase();
})();

// Keep your existing auth routes
app.use('/api/auth', authRoutes);

// Direct implementation of logs endpoint to match Python data structure
app.get('/api/logs', async (req, res) => {
  try {
    if (!database) {
      return res.status(500).json({ error: "Database connection not established" });
    }
    
    // Access the same collection as the Python code
    const collection = database.collection("readings");
    
    // Get readings for all nodes with the matching data structure
    const readings = await collection
      .find({
        // Match documents with the structure used in Python
        // You can adjust the query if needed
      })
      .sort({ timestamp: -1 })
      .limit(100)  // Adjust limit as needed
      .toArray();
      
    res.json(readings);
    
    // Optional: Emit data via websocket for real-time updates
    io.emit('sensor_data', readings);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// Add endpoint to receive new sensor readings if needed
app.post('/api/logs', async (req, res) => {
  try {
    if (!database) {
      return res.status(500).json({ error: "Database connection not established" });
    }
    
    const collection = database.collection("readings");
    const sensorData = req.body;
    
    // Validate data structure to match Python
    if (!sensorData.node_id || 
        sensorData.sensor1 === undefined || 
        sensorData.sensor2 === undefined || 
        sensorData.analog_sensor === undefined) {
      return res.status(400).json({ error: "Invalid sensor data format" });
    }
    
    // Add timestamp if not provided
    if (!sensorData.timestamp) {
      sensorData.timestamp = new Date();
    }
    
    await collection.insertOne(sensorData);
    
    // Emit new data via websocket
    io.emit('new_sensor_data', sensorData);
    
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error saving sensor data:", error);
    res.status(500).json({ error: "Failed to save sensor data" });
  }
});

// Serve static files from the React app
app.use(express.static('client/build'));

const chatbotRoute = require('./routes/chatbot');
app.use('/api/chatbot', chatbotRoute);

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A client connected');
    socket.on('disconnect', () => {
        console.log('A client disconnected');
    });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
