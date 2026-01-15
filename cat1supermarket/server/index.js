require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { initializeDatabase } = require('./database');

// Import routes
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const salesRoutes = require('./routes/sales');
const mpesaRoutes = require('./routes/mpesa');

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server and Socket.io instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io available to routes
app.set('io', io);

// Serve static files from client build
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/mpesa', mpesaRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join room based on user role
  socket.on('join-admin', () => {
    socket.join('admin-room');
    console.log(`${socket.id} joined admin room`);
  });
  
  socket.on('join-customer', () => {
    socket.join('customer-room');
    console.log(`${socket.id} joined customer room`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve React app for all other routes (SPA support)
app.get('*', (req, res) => {
  // If client build exists, serve it
  const clientIndexPath = path.join(__dirname, '../client/dist/index.html');
  if (require('fs').existsSync(clientIndexPath)) {
    res.sendFile(clientIndexPath);
  } else {
    res.json({ 
      message: 'Supermarket API Server Running',
      status: 'ok',
      endpoints: {
        auth: '/api/auth',
        inventory: '/api/inventory',
        sales: '/api/sales',
        mpesa: '/api/mpesa'
      },
      note: 'React client not built yet. Run "npm run build" in client directory.'
    });
  }
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();

    // Initialize counties after database is ready
    const { initializeCounties } = require('./database');
    initializeCounties();

    server.listen(PORT, () => {
      console.log(`============================================`);
      console.log(`  🏪 Supermarket Server Running`);
      console.log(`============================================`);
      console.log(`  API:    http://localhost:${PORT}/api`);
      console.log(`  Health: http://localhost:${PORT}/api/health`);
      console.log(`  WebSocket: ws://localhost:${PORT}`);
      console.log(`============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

