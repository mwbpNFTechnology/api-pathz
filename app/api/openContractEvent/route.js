// app/api/openContractEvent/route.js

let connectedClients = []; // holds references to all active WebSocket connections

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
    
    let baseURL;
    if (network === 'mainnet') {
        baseURL = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
    } else if (network === 'sepolia') {
        baseURL = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    } else {
        return new Response(JSON.stringify({ error: 'Invalid network' }), { status: 400 });
    }

  // 1. Check if this is a WebSocket upgrade request:
  const upgradeHeader = request.headers.get("upgrade") || "";
  if (upgradeHeader.toLowerCase() === "websocket") {
    // Perform the WebSocket handshake
    const [clientSocket, serverSocket] = Object.values(new WebSocketPair());
    serverSocket.accept(); 

    // Keep track of this new connection
    connectedClients.push(serverSocket);

    // Optional: handle messages *from* the client
    serverSocket.onmessage = (event) => {
      console.log("Client says:", event.data);
      // You could do something with this message, if desired
    };

    // On close or error, remove from our client list
    serverSocket.onclose = () => removeSocket(serverSocket);
    serverSocket.onerror = () => removeSocket(serverSocket);

    // Return a 101 "Switching Protocols" response to finalize the WS handshake
    return new Response(null, {
      status: 101,
      webSocket: clientSocket,
      headers: corsHeaders(),
    });
  }

  // 2. If it's NOT a websocket upgrade, it's just an HTTP GET
  //    Return simple JSON with open CORS
  const data = { message: "Hello from openContractEvent. Connect via WebSocket to get real-time updates." };
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

/**
 * Handle OPTIONS requests (CORS preflight)
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(),
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Pragma, Cache-Control",
    },
  });
}

/**
 * Helper: standard CORS headers for "allow all".
 */
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
  };
}

/**
 * Removes a closed/error socket from the connectedClients list
 */
function removeSocket(socket) {
  connectedClients = connectedClients.filter((s) => s !== socket);
}

/**
 * Broadcast a message (object/string) to all connected WebSocket clients
 */
export function broadcastUpdate(update) {
  const payload = typeof update === "object" ? JSON.stringify(update) : String(update);

  for (const ws of connectedClients) {
    try {
      ws.send(payload);
    } catch (err) {
      // If sending fails (socket dead?), remove it
      removeSocket(ws);
    }
  }
}
