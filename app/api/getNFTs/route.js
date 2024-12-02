// app/api/getNfts/route.js

import axios from 'axios';

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
        { status: 400 }
      );
    }

    if (!nftContract) {
      return new Response(
        JSON.stringify({ error: 'Missing nftContract parameter' }),
        { status: 400 }
      );
    }

    // Get the Alchemy API key from environment variables
    const apiKey = process.env.ALCHEMY_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'Alchemy API key not configured in environment variables',
        }),
        { status: 500 }
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
        { status: 400 }
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

    // Extract NFT data
    const nftData = response.data.ownedNfts.map((nft) => {
      return {
        contractAddress: nft.contract.address,
        tokenId: nft.id.tokenId,
        title: nft.title,
        description: nft.description,
        metadata: nft.metadata,
        media: nft.media,
      };
    });

    // Return the result
    return new Response(
      JSON.stringify({
        totalCount: response.data.totalCount,
        nfts: nftData,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
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
      { status: 500 }
    );
  }
}
