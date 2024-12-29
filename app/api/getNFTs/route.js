// app/api/getNFTs/route.js

import axios from 'axios';

// Define allowed origins
const ALLOWED_ORIGINS = [
  'https://dapp.pathz.xyz',
  'https://stackblitz.com',
  'https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5173--c8c182a3.local-credentialless.webcontainer-api.io',
];

export async function OPTIONS(request) {
  const origin = request.headers.get('Origin');
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Pragma, Cache-Control, Authorization',
    },
  });
}

export async function GET(request) {
  try {
    const origin = request.headers.get('Origin');
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const nftContract = searchParams.get('nftContract');
    const network = searchParams.get('network') || 'mainnet';

    if (!walletAddress) {
      return errorResponse('Missing walletAddress parameter', 400, allowedOrigin);
    }
    if (!nftContract) {
      return errorResponse('Missing nftContract parameter', 400, allowedOrigin);
    }

    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      return errorResponse('Alchemy API key not configured in environment variables', 500, allowedOrigin);
    }

    // Determine Alchemy base URL
    let baseURL;
    if (network === 'mainnet') {
      baseURL = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
    } else if (network === 'sepolia') {
      baseURL = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    } else {
      return errorResponse('Invalid network parameter. Use "mainnet" or "sepolia".', 400, allowedOrigin);
    }

    // 1) Fetch NFTs from Alchemy
    const alchemyResponse = await axios.get(`${baseURL}/getNFTs`, {
      params: {
        owner: walletAddress,
        contractAddresses: [nftContract],
      },
    });

    // Minimal NFT data processing
    let nftData = (alchemyResponse.data.ownedNfts || []).map((nft) => ({
      metadata: nft.metadata,
      media: nft.media,
    }));

    // Your existing logic here...
    // (Assuming you have the rest of your logic to process NFT data)

    const responseBody = {
      nfts: nftData,
      // other response fields...
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
      },
    });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    if (error.response) {
      console.error('Alchemy API Response:', error.response.data);
    }
    const origin = request.headers.get('Origin');
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return errorResponse('Internal Server Error', 500, allowedOrigin, error.message);
  }
}

function errorResponse(message, statusCode, allowedOrigin, details) {
  const body = details ? { error: message, details } : { error: message };
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin,
    },
  });
}
