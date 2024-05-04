// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const userRoute = require('./routes/userRoutes');
const authRoute = require('./routes/authRoute');
const cors = require('cors');
const userSocketIdMap = require('./socketMap.js');
const socketIo = require('socket.io');
// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for a specific origin (replace with actual Flutter app origin)
app.use(cors({
    origin: 'http://localhost:8080'
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

// Define routes for users and authentication
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));

// Define a basic route for the root endpoint
app.get("/", (req, res) => {
    res.send("Hello from Node API Server Updated");
});

io.on('connection', (socket) => {
    socket.on('register', (userId) => {
        userSocketIdMap[userId] = socket.id;
    });

    socket.on('disconnect', () => {
        // Remove the socket ID from the map when the user disconnects
        for (let userId in userSocketIdMap) {
            if (userSocketIdMap[userId] === socket.id) {
                delete userSocketIdMap[userId];
                break;
            }
        }
    });
});

// Start the server listening on port 3000
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});