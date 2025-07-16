const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
app.use(cors());

// Simple health check route
app.get('/', (req, res) => {
  res.send('Hey from server');
});

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO with CORS enabled for all origins
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store clients by ID
const clients = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Register client with a custom ID
  socket.on('register', (id) => {
    clients.set(id, socket);
    console.log(`Registered: ${id}`);
    socket.emit('registered', id);
  });

  // Relay signaling messages
  socket.on('signal', ({ target, signal }) => {
    const targetSocket = clients.get(target);
    if (targetSocket) {
      targetSocket.emit('signal', {
        from: [...clients].find(([_, s]) => s === socket)[0],
        signal
      });
    }
  });

  // Clean up on disconnect
  socket.on('disconnect', () => {
    const clientId = [...clients].find(([_, s]) => s === socket)?.[0];
    if (clientId) {
      clients.delete(clientId);
      console.log(`Disconnected: ${clientId}`);
    }
  });
});

// Use the port provided by Render or default to 8080
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
