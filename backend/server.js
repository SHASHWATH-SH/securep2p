// minimal-signaling-server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map();

wss.on('connection', (ws) => {
  const id = Math.random().toString(36).substring(2, 9);
  clients.set(id, ws);
  ws.send(JSON.stringify({ type: 'id', id }));

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.to && clients.has(data.to)) {
        clients.get(data.to).send(JSON.stringify({ ...data, from: id }));
      }
    } catch (e) {
      console.error("Invalid message:", e);
    }
  });

  ws.on('close', () => {
    clients.delete(id);
  });
});
server.listen(8080, '0.0.0.0', () => {
  console.log('HTTPS/WSS signaling server running on port 8080');
});

console.log("Signaling server running on ws://localhost:8080");
