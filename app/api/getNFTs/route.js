// app/api/getNFTs/route.js

import axios from 'axios';

// Define allowed origins
const ALLOWED_ORIGIN = 'https://dapp.pathz.xyz';

// Handle preflight OPTIONS requests
export async function OPTIONS(_request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(request) {
  try {
    // Parse query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const nftContract = searchParams.get('nftContract');
    const network = searchParams.get('network') || 'mainnet';

    // Validate required parameters
    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing walletAddress parameter' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          },
        }
      );
    }

    if (!nftContract) {
      return new Response(
        JSON.stringify({ error: 'Missing nftContract parameter' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          },
        }
      );
    }

    // Get the Alchemy API key from environment variables
    const apiKey = process.env.ALCHEMY_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'Alchemy API key not configured in environment variables',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          },
        }
      );
    }

    // Define base URL based on network
    let baseURL;
    if (network === 'mainnet') {
      baseURL = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
    } else if (network === 'sepolia') {
      baseURL = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    } else {
      return new Response(
        JSON.stringify({
          error: 'Invalid network parameter. Use "mainnet" or "sepolia".',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          },
        }
      );
    }

    // Set up options for the Axios request
    const options = {
      method: 'GET',
      url: `${baseURL}/getNFTs/`,
      params: {
        owner: walletAddress,
        contractAddresses: [nftContract],
      },
    };

    // Make the API request to Alchemy
    const response = await axios.request(options);

    // Extract only metadata and media from each NFT
    const nftData = response.data.ownedNfts.map((nft) => ({
      metadata: nft.metadata,
      media: nft.media,
    }));

    // Return the simplified result with CORS headers
    return new Response(
      JSON.stringify({
        nfts: nftData,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        },
      }
    );
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        },
      }
    );
  }
}
