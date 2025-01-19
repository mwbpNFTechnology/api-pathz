// app/api/openContractEvent/route.js

// Tell Next.js we want Node.js runtime:
export const config = { runtime: 'nodejs' };

import { addClient, removeClient } from './wsManager'; 
// ^ Note: We do *not* import broadcastUpdate here unless the route needs it

/**
 * Handle all requests to /api/openContractEvent
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const network = searchParams.get('network') || 'sepolia';

  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ALCHEMY_API_KEY missing' }), { status: 500 });
  }

  // Validate network param
  if (network !== 'mainnet' && network !== 'sepolia') {
    return new Response(JSON.stringify({ error: 'Invalid network' }), { status: 400 });
  }

  // 1. Check if this is a WebSocket upgrade
  const upgradeHeader = request.headers.get('upgrade') || '';
  if (upgradeHeader.toLowerCase() === 'websocket') {
    const [clientSocket, serverSocket] = Object.values(new WebSocketPair());
    serverSocket.accept();

    // 2. Add to active connections
    addClient(serverSocket);

    // 3. Handle messages/close/error
    serverSocket.onmessage = (event) => {
      console.log('Client says:', event.data);
    };
    serverSocket.onclose = () => removeClient(serverSocket);
    serverSocket.onerror = () => removeClient(serverSocket);

    // 4. Return a 101 Switching Protocols response for the handshake
    return new Response(null, {
      status: 101,
      webSocket: clientSocket,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }

  // If not a WebSocket request, return JSON
  const data = { message: 'Hello from openContractEvent. Connect via WebSocket for real-time updates.' };
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

// If you need OPTIONS:
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Pragma, Cache-Control',
    },
  });
}
