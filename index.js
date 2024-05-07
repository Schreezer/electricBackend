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
const { writer } = require('repl');

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
    origin: ['http://localhost:8080', 'http://localhost:8090']
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
    console.log("we are connecting");
    socket.on('register', (billId) => {
        console.log(`Registering socket ${socket.id} for bill ${billId}`);
        if (!billSocketIdMap[billId]) {
            billSocketIdMap[billId] = [];
        }
        billSocketIdMap[billId].push(socket.id);

    });


    socket.on('disconnect', () => {
        console.log("we are disconnecting from one of those");
        // Remove the socket ID from the map when the user disconnects
        for (let billId in billSocketIdMap) {
            const index = billSocketIdMap[billId].indexOf(socket.id);
            if (index !== -1) {
                billSocketIdMap[billId].splice(index, 1);
            }
        }
    });

    // socket.on("newComment", async (value) => {
    //     console.log("Adding new comment");
    //     const billId = value.billId;
    //     const comment = value.comment;
    //     const userId = value.userId;
    //     // Do something with billId and comment...
    //     const user = User.findById(userId);
    //     let bill = user.data.id(billId);
    //     if (!user) {
    //         console.log('User not found');
    //         return;
    //     }
    //     // const bill = user.data.id(billId);
    //     if (!bill) {
    //         console.log('Bill not found');
    //         return;
    //     }
    //     bill.comments.push({
    //         text: comment,
    //         writer: userId,
    //         createdAt: Date.now()
    //     });
    //     await user.save();
    //     const socketIds = billSocketIdMap[billId];
    //     if (socketIds) {
    //         socketIds.forEach((socketId) => {
    //             io.to(socketId).emit('commentAdded', { text: comment, writer: userId });
    //         });
    //     }


    // });


    socket.on('newComment', async (value) => {
        console.log("Adding new comment as "+value.comment);
        const userId = value.userId;
        const billId = value.billId;
        const comment = value.comment;
        const writerType = value.writer;
        const socketIds = billSocketIdMap[billId];
        const user = await User.findById(userId);
        console.log("User Id is "+userId);
        console.log("Bill Id is "+billId);
        console.log("Comment is "+comment);
        console.log("Writer is "+writerType);
        if (!user) {
            console.log('User not found');
            return;
        }
        const bill = user.data.id(billId);
        // const bill = user.data.id(billId);
        if (!bill) {
            console.log('Bill not found');
            return;
        }

        bill.comments.push({
            text: comment,
            writer: writerType,
            date: Date.now()
        });

        
        await user.save();
        if (socketIds) {
            socketIds.forEach((socketId) => {
                io.to(socketId).emit('commentAdded', bill.comments );
            });
        }
    });
    socket.on('getComments', async (value) => {
        console.log("getting comments");
        const userId = value.userId;
        const billId = value.billId;
        const socketIds = billSocketIdMap[billId];
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return;
        }

        const bill = user.data.id(billId);
        // const bill = user.data.id(billId);
        if (!bill) {
            console.log('Bill not found');
            return;
        }

        if (socketIds) {
            socketIds.forEach((socketId) => {
                io.to(socketId).emit('comments', { comments: bill.comments, billId, userId });
            });
        }
    });
});

// Start the server listening on port 3000
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});