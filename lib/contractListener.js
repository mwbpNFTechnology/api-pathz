// /lib/contractListener.js

import { ethers } from 'ethers';
// Import the broadcastUpdate function from your new openContractEvent route
import { broadcastUpdate } from '@/app/api/openContractEvent/route';
import { 
    multiversePortalContractAddress, 
    multiversePortalContractAbi, 
  } from './lib/contractConfig'; 

// 1) Grab your Alchemy API key
const apiKey = process.env.ALCHEMY_API_KEY;
if (!apiKey) {
  console.error('ALCHEMY_API_KEY missing in environment variables!');
  // If you want to fail hard, you can throw an error instead:
  // throw new Error('ALCHEMY_API_KEY missing in environment variables');
}

// 2) Decide which network to use (from environment, or default to 'sepolia')
const network = process.env.ALCHEMY_NETWORK || 'sepolia';

// 3) Build Alchemy RPC URL based on the chosen network
let baseURL;
if (network === 'mainnet') {
  baseURL = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
} else if (network === 'sepolia') {
  baseURL = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
} else {
  throw new Error('Invalid network. Must be "mainnet" or "sepolia".');
}

// 4) Create an Ethers.js provider using the chosen Alchemy URL
const provider = new ethers.providers.JsonRpcProvider(baseURL);

// 5) Your contract address & ABI
const contractAddress = multiversePortalContractAddress;
const contractABI = multiversePortalContractAbi;

// 6) Instantiate the contract
const myContract = new ethers.Contract(contractAddress, contractABI, provider);

// 7) Listen for contract events
// Example: PathzChoosed event
myContract.on('PathzChoosed', (pathStoryNumber, letter, pathzId, event) => {
  console.log('Received PathzChoosed event:', {
    pathStoryNumber,
    letter,
    pathzId,
    blockNumber: event.blockNumber,
  });

  // 8) Broadcast the update to all connected WebSocket clients
  broadcastUpdate({
    type: 'PathzChoosed',
    pathStoryNumber,
    letter,
    pathzId,
    blockNumber: event.blockNumber,
  });
});

// 9) Optionally export things, if needed
export { provider, myContract };
