// Import required modules
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const User = require('./models/User');
const userRoute = require('./routes/userRoutes');
const authRoute = require('./routes/authRoute');
const cors = require('cors');
const billSocketIdMap = require('./socketMap.js');
const socketIo = require('socket.io');

// Create an Express app
const app = express();

// Create an HTTP server and attach the Express app to it
const server = http.createServer(app);

// Attach the Socket.IO server to the HTTP server
const io = socketIo(server);

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
    socket.on('register', (billId) => {
        if (!billSocketIdMap[billId]) {
            billSocketIdMap[billId] = [];
        }
        billSocketIdMap[billId].push(socket.id);
    });

    socket.on('disconnect', () => {
        // Remove the socket ID from the map when the user disconnects
        for (let billId in billSocketIdMap) {
            const index = billSocketIdMap[billId].indexOf(socket.id);
            if (index !== -1) {
                billSocketIdMap[billId].splice(index, 1);
            }
        }
    });
});

// Start the server listening on port 3000
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});