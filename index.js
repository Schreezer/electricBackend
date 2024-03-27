const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const app = express();
const userRoute = require('./routes/userRoutes');
const authRoute = require('./routes/authRoute');
const cors = require('cors');

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:50760' // Replace with your Flutter app's origin
  }));
// ... your database connection logic with Mongoose
// connect to MongoDB
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

// ... your routes, middleware, and authentication logic
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);

app.use(express.urlencoded({extended: false}));

app.get("/", (req, res) => {
    res.send("Hello from Node API Server Updated");
  });
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});

