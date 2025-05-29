const express = require('express');
const cors = require('cors');
const { passport } = require('./config/passport');
const authRoutes = require('./routes/auth');
// ... existing imports ...

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
// ... existing routes ...

// ... rest of the file ... 