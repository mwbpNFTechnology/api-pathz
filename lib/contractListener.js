// /lib/contractListener.js

import { ethers } from 'ethers';
// Import broadcastUpdate from the shared wsManager, *not* from the route
import { broadcastUpdate } from '@/app/api/openContractEvent/wsManager'; 

import { multiversePortalContractAddress, multiversePortalContractAbi } from './lib/contractConfig'; 

const apiKey = process.env.ALCHEMY_API_KEY;
if (!apiKey) {
  console.error('ALCHEMY_API_KEY missing in environment variables!');
  // throw new Error('ALCHEMY_API_KEY missing');
}

const network = process.env.ALCHEMY_NETWORK || 'sepolia';

let baseURL;
if (network === 'mainnet') {
  baseURL = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
} else if (network === 'sepolia') {
  baseURL = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
} else {
  throw new Error('Invalid network. Must be mainnet or sepolia.');
}

const provider = new ethers.providers.JsonRpcProvider(baseURL);
const contractAddress = multiversePortalContractAddress;
const contractABI = multiversePortalContractAbi;

const myContract = new ethers.Contract(contractAddress, contractABI, provider);

// Listen for an event and broadcast
myContract.on('PathzChoosed', (pathStoryNumber, letter, pathzId, event) => {
  console.log('Received PathzChoosed event:', {
    pathStoryNumber,
    letter,
    pathzId,
    blockNumber: event.blockNumber,
  });

  broadcastUpdate({
    type: 'PathzChoosed',
    pathStoryNumber,
    letter,
    pathzId,
    blockNumber: event.blockNumber,
  });
});

export { provider, myContract };