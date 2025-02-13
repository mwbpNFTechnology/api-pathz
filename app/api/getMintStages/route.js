import { JsonRpcProvider, Contract, formatEther } from 'ethers';
import { PathzNFTContractAddress, PathzNFTContractAbi } from '../../../lib/contractConfig';

export const runtime = 'nodejs';

/**
 * Checks if the given origin is allowed.
 * Allows domains and subdomains of "pathz.xyz" and "mwbp.io".
 *
 * @param {string} origin - The Origin header from the request.
 * @returns {boolean} - True if the origin is allowed.
 */
function isAllowedOrigin(origin) {
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    return (
      hostname === 'pathz.xyz' ||
      hostname.endsWith('.pathz.xyz') ||
      hostname === 'mwbp.io' ||
      hostname.endsWith('.mwbp.io')
    );
  } catch {
    return false;
  }
}

/**
 * Sets CORS headers for the given response and origin.
 *
 * @param {Response} response - The response object.
 * @param {string} origin - The origin of the request.
 * @returns {Response} - The response with CORS headers set.
 */
function setCorsHeaders(response, origin) {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Pragma, Cache-Control'
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

/**
 * Constructs an error response with appropriate CORS headers.
 *
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code.
 * @param {string} origin - The origin of the request.
 * @returns {Response} - The error response.
 */
function errorResponse(message, statusCode, origin) {
  const body = JSON.stringify({ error: message });
  const response = new Response(body, {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
  setCorsHeaders(response, origin);
  return response;
}

/**
 * Handles preflight OPTIONS requests for CORS.
 */
export async function OPTIONS(request) {
  const origin = request.headers.get('Origin') || '';
  if (!isAllowedOrigin(origin)) {
    return errorResponse('Unauthorized origin', 403, origin);
  }
  const response = new Response(null, { status: 204 });
  setCorsHeaders(response, origin);
  return response;
}

/**
 * Main GET endpoint: calls getMintStage and totalMinted from the NFT contract.
 */
export async function GET(request) {
  const origin = request.headers.get('Origin') || '';
  if (!isAllowedOrigin(origin)) {
    return errorResponse('Unauthorized origin', 403, origin);
  }

  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network') || 'mainnet';

    // Use the current timestamp (in seconds)
    const timestampToUse = Math.floor(Date.now() / 1000);
    console.log("Calling getMintStage with timestamp:", timestampToUse);

    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      console.error('Alchemy API key is not configured.');
      return errorResponse('Alchemy API key not configured in environment variables', 500, origin);
    }

    let providerURL;
    if (network === 'mainnet') {
      providerURL = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
    } else if (network === 'sepolia') {
      providerURL = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    } else {
      return errorResponse('Invalid network parameter. Use "mainnet" or "sepolia".', 400, origin);
    }

    const provider = new JsonRpcProvider(providerURL);

    const nftContract = new Contract(
      PathzNFTContractAddress,
      PathzNFTContractAbi,
      provider
    );

    // Call getMintStage with the current timestamp.
    const mintStage = await nftContract.getMintStage(timestampToUse);
    console.log("getMintStage result:", mintStage);

    // Retrieve the totalMinted number.
    const mintedResult = await nftContract.totalMinted();
    const totalMinted = Number(mintedResult);

    // Process the returned mint stage struct.
    const stageNumber = Number(mintStage.stageNumber);
    const totalMintCap = Number(mintStage.totalMintCap);
    const maxPerWallet = Number(mintStage.maxPerWallet);
    const priceWei = mintStage.price.toString();
    const priceEth = formatEther(priceWei);
    const startTimestamp = Number(mintStage.startTimestamp);
    const endTimestamp = Number(mintStage.endTimestamp);

    const responseBody = {
      stageNumber,    // current stage number
      totalMintCap,
      maxPerWallet,
      price: priceEth,
      startTimestamp,
      endTimestamp,
      totalMinted
    };

    const response = new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    setCorsHeaders(response, origin);
    return response;
  } catch (error) {
    console.error('Error in getMintStage:', error);
    // Attempt to retrieve totalMinted for the fallback response.
    let totalMinted = 0;
    try {
      const { searchParams } = new URL(request.url);
      const network = searchParams.get('network') || 'mainnet';
      const apiKey = process.env.ALCHEMY_API_KEY;
      let providerURL;
      if (network === 'mainnet') {
        providerURL = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
      } else if (network === 'sepolia') {
        providerURL = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
      }
      const provider = new JsonRpcProvider(providerURL);
      const nftContract = new Contract(
        PathzNFTContractAddress,
        PathzNFTContractAbi,
        provider
      );
      const mintedResult = await nftContract.totalMinted();
      totalMinted = Number(mintedResult);
    } catch (innerError) {
      console.error('Error fetching totalMinted:', innerError);
    }

    // Fallback response: Return Public Sale (Mint Stage 4) details.
    const fallbackResponseBody = {
      stageNumber: 4,
      totalMintCap: 3200,         // Assuming MAX_SUPPLY is 3200
      maxPerWallet: 1,            // Adjust if needed
      price: "0.032",             // Price in ETH as a string
      startTimestamp: 1739215209, // Example startTimestamp
      endTimestamp: 2147483647,   // Example endTimestamp
      totalMinted
    };

    const fallbackResponse = new Response(JSON.stringify(fallbackResponseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    setCorsHeaders(fallbackResponse, origin);
    return fallbackResponse;
  }
}
