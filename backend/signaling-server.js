// const fs = require('fs');
// const path = require('path');
// const https = require('https');
// const express = require('express');
// const cors = require('cors');
// const { Server } = require('socket.io');

// const app = express();
// app.use(cors());

// const server = https.createServer({
//   key: fs.readFileSync(path.join(__dirname, 'key.pem')),
//   cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
// }, app);

// const io = new Server(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST']
//   }
// });

// const clients = new Map(); // id -> socket

// io.on('connection', (socket) => {
//   let clientId = null;

//   socket.on('register', (data) => {
//     clientId = data.id;
//     clients.set(clientId, socket);
//     console.log(`Client registered: ${clientId}`);
//     socket.emit('registered', { id: clientId });
//   });

//   socket.on('signal', (data) => {
//     const targetSocket = clients.get(data.target);
//     if (targetSocket) {
//       targetSocket.emit('signal', {
//         from: clientId,
//         signal: data.signal
//       });
//     }
//   });

//   socket.on('disconnect', () => {
//     if (clientId) {
//       clients.delete(clientId);
//       console.log(`Client disconnected: ${clientId}`);
//     }
//   });
// });

// server.listen(8080, () => {
//   console.log('Signaling server running on https://172.17.3.195:8080');
// });
// signaling-server.js
// const fs = require('fs');
// const path = require('path');
// const https = require('https');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hey from server');
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const clients = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('register', (id) => {
    clients.set(id, socket);
    console.log(`Registered: ${id}`);
    socket.emit('registered',id);
  });

  socket.on('signal', ({ target, signal }) => {
    const targetSocket = clients.get(target);
    if (targetSocket) {
      targetSocket.emit('signal', {
        from: [...clients].find(([_, s]) => s === socket)[0],
        signal
      });
    }
  });

  socket.on('disconnect', () => {
    const clientId = [...clients].find(([_, s]) => s === socket)?.[0];
    if (clientId) {
      clients.delete(clientId);
      console.log(`Disconnected: ${clientId}`);
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
