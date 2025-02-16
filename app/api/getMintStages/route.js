import { JsonRpcProvider, Contract, formatEther } from 'ethers';
import { PathzNFTContractAddress, PathzNFTContractAbi } from '../../../lib/contractConfig';

export const runtime = 'nodejs';

/**
 * Constructs an error response.
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code.
 * @returns {Response} - The error response.
 */
function errorResponse(message, statusCode) {
  const body = JSON.stringify({ error: message });
  return new Response(body, {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Handles OPTIONS (preflight) requests.
 */
export async function OPTIONS(request) {
  return new Response(null, { status: 204 });
}

/**
 * Main GET endpoint: calls getMintStage and totalMinted from the NFT contract.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network') || 'mainnet';

    // Use the current timestamp (in seconds)
    const timestampToUse = Math.floor(Date.now() / 1000);
    console.log('Calling getMintStage with timestamp:', timestampToUse);

    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      console.error('Alchemy API key is not configured.');
      return errorResponse('Alchemy API key not configured in environment variables', 500);
    }

    let providerURL;
    if (network === 'mainnet') {
      providerURL = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
    } else if (network === 'sepolia') {
      providerURL = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    } else {
      return errorResponse('Invalid network parameter. Use "mainnet" or "sepolia".', 400);
    }

    const provider = new JsonRpcProvider(providerURL);

    const nftContract = new Contract(
      PathzNFTContractAddress,
      PathzNFTContractAbi,
      provider
    );

    // Call getMintStage with the current timestamp.
    const mintStage = await nftContract.getMintStage(timestampToUse);
    console.log('getMintStage result:', mintStage);

    // Retrieve the total number of minted NFTs.
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
      stageNumber,    // current mint stage number
      totalMintCap,
      maxPerWallet,
      price: priceEth,
      startTimestamp,
      endTimestamp,
      totalMinted,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
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
      price: '0.032',             // Price in ETH as a string
      startTimestamp: 1739215209, // Example startTimestamp
      endTimestamp: 2147483647,   // Example endTimestamp
      totalMinted,
    };

    return new Response(JSON.stringify(fallbackResponseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}