// app/api/openContractEvent/wsManager.js

let connectedClients = [];

/**
 * Add a new WebSocket to our list of active clients
 */
export function addClient(ws) {
  connectedClients.push(ws);
}

/**
 * Remove a WebSocket from our active clients
 */
export function removeClient(ws) {
  connectedClients = connectedClients.filter((s) => s !== ws);
}

/**
 * Broadcast a message (object/string) to all active clients
 */
export function broadcastUpdate(update) {
  const payload = typeof update === 'object' ? JSON.stringify(update) : String(update);

  for (const ws of connectedClients) {
    try {
      ws.send(payload);
    } catch {
      // If sending fails (socket dead?), remove it
      removeClient(ws);
    }
  }
}
