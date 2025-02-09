// app/api/getMintStage/route.js

import { JsonRpcProvider, Contract, formatEther, isAddress } from 'ethers';
import { PathzNFTContractAddress, PathzNFTContractAbi } from '../../../lib/contractConfig';

export const runtime = 'nodejs';

function setCorsHeaders(response, origin) {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Pragma, Cache-Control');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

function errorResponse(message, statusCode, origin) {
  const body = JSON.stringify({ error: message });
  const response = new Response(body, {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
  setCorsHeaders(response, origin);
  return response;
}

export async function OPTIONS(request) {
  const origin = request.headers.get('Origin') || '';
  const response = new Response(null, { status: 204 });
  setCorsHeaders(response, origin);
  return response;
}

export async function GET(request) {
  const origin = request.headers.get('Origin') || '';

  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get('network') || 'mainnet';
    const walletAddress = searchParams.get('walletAddress'); // optional query parameter

    
    // Use the current timestamp (in seconds) from Date instead of a query parameter.
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

    // Also retrieve the totalMinted number.
    const mintedResult = await nftContract.totalMinted();
    const totalMinted = Number(mintedResult);

    // Process the returned mint stage struct.
    const totalMintCap = Number(mintStage.totalMintCap);
    const maxPerWallet = Number(mintStage.maxPerWallet);
    const priceWei = mintStage.price.toString();
    const priceEth = formatEther(priceWei);
    const startTimestamp = Number(mintStage.startTimestamp);
    const endTimestamp = Number(mintStage.endTimestamp);

    // If walletAddress is provided, validate it and get the balance.
    let walletPathzBalance;
    if (walletAddress) {
      if (!isAddress(walletAddress)) {
        return errorResponse('Invalid wallet address provided.', 400, origin);
      }
      const balanceBN = await nftContract.balanceOf(walletAddress);
      walletPathzBalance = Number(balanceBN);
      console.log("walletPathzBalance: ", walletPathzBalance);
    }



    const responseBody = {
      totalMintCap,
      maxPerWallet,
      price: priceEth,
      startTimestamp,
      endTimestamp,
      totalMinted,
      ...(walletAddress ? { walletPathzBalance } : {})
    };


    const response = new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    setCorsHeaders(response, origin);
    return response;
  } catch (error) {
    console.error('Error in getMintStage:', error);
    return errorResponse('Internal Server Error - The contract call reverted. Check that the provided timestamp is valid.', 500, origin);
  }
}