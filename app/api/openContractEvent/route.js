let connectedClients = []; // holds references to all active WebSocket connections

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const network = searchParams.get('network') || 'sepolia';

  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ALCHEMY_API_KEY missing' }), { status: 500 });
  }

  // Validate network parameter
  if (network !== 'mainnet' && network !== 'sepolia') {
    return new Response(JSON.stringify({ error: 'Invalid network' }), { status: 400 });
  }

  const upgradeHeader = request.headers.get("upgrade") || "";
  if (upgradeHeader.toLowerCase() === "websocket") {
    const [clientSocket, serverSocket] = Object.values(new WebSocketPair());
    serverSocket.accept(); 
    connectedClients.push(serverSocket);

    serverSocket.onmessage = (event) => {
      console.log("Client says:", event.data);
    };
    serverSocket.onclose = () => removeSocket(serverSocket);
    serverSocket.onerror = () => removeSocket(serverSocket);

    return new Response(null, {
      status: 101,
      webSocket: clientSocket,
      headers: corsHeaders(),
    });
  }

  const data = { message: "Hello from openContractEvent. Connect via WebSocket to get real-time updates." };
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

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

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": "true",
  };
}

function removeSocket(socket) {
  connectedClients = connectedClients.filter((s) => s !== socket);
}

export function broadcastUpdate(update) {
  const payload = typeof update === "object" ? JSON.stringify(update) : String(update);

  for (const ws of connectedClients) {
    try {
      ws.send(payload);
    } catch (_err) {  // renamed err to _err
      console.error('WebSocket send error:', _err);
      removeSocket(ws);
    }
  }
}
