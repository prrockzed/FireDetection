// server/config.js
require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGO_URI,
    geminiApiKey: process.env.GEMINI_API_KEY,
    jwtSecret: process.env.JWT_SECRET
};
