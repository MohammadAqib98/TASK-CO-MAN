const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

const app = express();

// Configure Middleware
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the TASK-CO-MAN API!',
    status: 'healthy',
    documentation: 'Use the REST endpoints at /api/auth, /api/projects, /api/tasks, and /api/users'
  });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Serve static React files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));

  // Catch-all route to serve index.html for React Router
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next(); // Pass through API routes so they return proper JSON 404s
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Centralized 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  // Mongoose duplicate key error (e.g. non-unique email)
  if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      message: `Duplicate field error: A user with this ${key} already exists.`
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: 'Validation failed',
      errors: messages
    });
  }

  // Mongoose cast errors (invalid ObjectId structure in request URL parameters)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid format for field: ${err.path}. Double check resource IDs.`
    });
  }

  // Default server error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'An unexpected internal server error occurred',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Connect Database & Start Server
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/taskmanager';

console.log('Connecting to database...');
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`Accepting requests from client origin: ${clientUrl}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failure:', err.message);
    process.exit(1);
  });
