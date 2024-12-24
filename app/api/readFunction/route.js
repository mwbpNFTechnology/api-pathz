import { JsonRpcProvider, Contract } from 'ethers';

export const runtime = 'nodejs'; // Ensure Node.js runtime is used

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const functionName = searchParams.get('functionName');
    const network = searchParams.get('network') || 'mainnet';
    const params = searchParams.get('params');

    if (!functionName) {
      return new Response(JSON.stringify({ error: 'Missing functionName parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Alchemy API key missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const networkUrls = {
      mainnet: `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`,
      sepolia: `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`,
    };

    if (!networkUrls[network]) {
      return new Response(
        JSON.stringify({ error: 'Invalid network parameter. Use "mainnet" or "sepolia".' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const provider = new JsonRpcProvider(networkUrls[network]);

    const contractAddress = '0x8795C45c8A195ecbA26EbB2e83cC7279150BA95e'; // Replace with your actual contract address
    const contractAbi = [
      {
        "inputs": [
          { "internalType": "uint256", "name": "_pathStoryDeadlineTimestamp", "type": "uint256" },
          { "internalType": "string", "name": "_pathStoriesCID", "type": "string" },
          { "internalType": "string", "name": "_encPathResultCID", "type": "string" },
          { "internalType": "string", "name": "_encPathIncreaseCID", "type": "string" },
          { "internalType": "string", "name": "_baseURL", "type": "string" },
          { "internalType": "address", "name": "_pathzNFTContractAddress", "type": "address" },
          { "internalType": "address", "name": "_pathzVRFContractAddress", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
          { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "uint16", "name": "pathStoryNumber", "type": "uint16" },
          { "indexed": false, "internalType": "string", "name": "letterChoosed", "type": "string" },
          { "indexed": false, "internalType": "uint16", "name": "pathzID", "type": "uint16" }
        ],
        "name": "PathzChoosed",
        "type": "event"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "", "type": "uint16" },
          { "internalType": "uint16", "name": "", "type": "uint16" }
        ],
        "name": "answeredPathStories",
        "outputs": [
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "", "type": "uint16" },
          { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "answeredPathzIDs",
        "outputs": [
          { "internalType": "uint16", "name": "", "type": "uint16" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "baseURL",
        "outputs": [
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "", "type": "uint16" },
          { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "characterTraitsHistoriesCIDs",
        "outputs": [
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "string", "name": "_treePath", "type": "string" }
        ],
        "name": "checkPathStoryOfTreePath",
        "outputs": [
          { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "", "type": "uint16" }
        ],
        "name": "defaultPathStories",
        "outputs": [
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "", "type": "uint16" },
          { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "encryptionPathStoriesCIDs",
        "outputs": [
          { "internalType": "string", "name": "resultCIDs", "type": "string" },
          { "internalType": "string", "name": "increaseCIDs", "type": "string" },
          {
            "components": [
              { "internalType": "string", "name": "key", "type": "string" },
              { "internalType": "string", "name": "iv", "type": "string" }
            ],
            "internalType": "struct OptimizePathzMultiversePortal.DecryptKeys",
            "name": "decKeys",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "fairyTalePath",
        "outputs": [
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "string", "name": "_key", "type": "string" },
          { "internalType": "string", "name": "_iv", "type": "string" },
          { "internalType": "string", "name": "_characterTraitsHistoryCID", "type": "string" },
          { "internalType": "string", "name": "_whatGet", "type": "string" }
        ],
        "name": "finishPathStory",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16[]", "name": "_pathzIDs", "type": "uint16[]" }
        ],
        "name": "getAllPathStories",
        "outputs": [
          {
            "components": [
              { "internalType": "uint16", "name": "id", "type": "uint16" },
              { "internalType": "string", "name": "treePath", "type": "string" }
            ],
            "internalType": "struct OptimizePathzMultiversePortal.PathzID[]",
            "name": "",
            "type": "tuple[]"
          },
          { "internalType": "uint256", "name": "", "type": "uint256" },
          { "internalType": "bool", "name": "", "type": "bool" },
          { "internalType": "string", "name": "", "type": "string" },
          {
            "components": [
              { "internalType": "uint16", "name": "pathStoryNumber", "type": "uint16" },
              { "internalType": "string", "name": "pathStoryCID", "type": "string" },
              { "internalType": "string", "name": "characterTraitsHistoryCID", "type": "string" },
              {
                "components": [
                  { "internalType": "string", "name": "resultCIDs", "type": "string" },
                  { "internalType": "string", "name": "increaseCIDs", "type": "string" },
                  {
                    "components": [
                      { "internalType": "string", "name": "key", "type": "string" },
                      { "internalType": "string", "name": "iv", "type": "string" }
                    ],
                    "internalType": "struct OptimizePathzMultiversePortal.DecryptKeys",
                    "name": "decKeys",
                    "type": "tuple"
                  }
                ],
                "internalType": "struct OptimizePathzMultiversePortal.EncryptionPathStoryCIDs",
                "name": "encryptionPathStoryCIDs",
                "type": "tuple"
              }
            ],
            "internalType": "struct OptimizePathzMultiversePortal.AllVars[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "_pathStoryNumber", "type": "uint16" }
        ],
        "name": "getLastCharacterTraitsHistoryCID",
        "outputs": [
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "_pathStoryNumber", "type": "uint16" }
        ],
        "name": "getLastEncryptionPathStoryCIDs",
        "outputs": [
          {
            "components": [
              { "internalType": "string", "name": "resultCIDs", "type": "string" },
              { "internalType": "string", "name": "increaseCIDs", "type": "string" },
              {
                "components": [
                  { "internalType": "string", "name": "key", "type": "string" },
                  { "internalType": "string", "name": "iv", "type": "string" }
                ],
                "internalType": "struct OptimizePathzMultiversePortal.DecryptKeys",
                "name": "decKeys",
                "type": "tuple"
              }
            ],
            "internalType": "struct OptimizePathzMultiversePortal.EncryptionPathStoryCIDs",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "_pathStoryNumber", "type": "uint16" }
        ],
        "name": "getLastPathStoryCID",
        "outputs": [
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "_pathzID", "type": "uint16" }
        ],
        "name": "getOwnerOfPathz",
        "outputs": [
          { "internalType": "address", "name": "", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint256", "name": "_pathzID", "type": "uint256" }
        ],
        "name": "getTreePathForPathzID",
        "outputs": [
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16[]", "name": "_pathzIDs", "type": "uint16[]" }
        ],
        "name": "getTreePathsForPathzIDs",
        "outputs": [
          {
            "components": [
              { "internalType": "uint16", "name": "id", "type": "uint16" },
              { "internalType": "string", "name": "treePath", "type": "string" }
            ],
            "internalType": "struct OptimizePathzMultiversePortal.PathzID[]",
            "name": "pathzData",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "string", "name": "choosedLetter", "type": "string" }
        ],
        "name": "isValidLetter",
        "outputs": [
          { "internalType": "bool", "name": "", "type": "bool" },
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "string", "name": "treePath", "type": "string" }
        ],
        "name": "isValidTreePath",
        "outputs": [
          { "internalType": "bool", "name": "", "type": "bool" },
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          { "internalType": "address", "name": "", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "", "type": "uint16" },
          { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "pathStoriesCIDs",
        "outputs": [
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pathStoryDeadlineTimestamp",
        "outputs": [
          { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pathStoryNumber",
        "outputs": [
          { "internalType": "uint16", "name": "", "type": "uint16" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pathStoryStart",
        "outputs": [
          { "internalType": "bool", "name": "", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "string", "name": "choosedLetter", "type": "string" },
          { "internalType": "uint16", "name": "_pathzID", "type": "uint16" }
        ],
        "name": "pathzChoosePath",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pathzNFTContract",
        "outputs": [
          { "internalType": "contract Pathz", "name": "", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pathzVRFContract",
        "outputs": [
          { "internalType": "contract PathzVRF", "name": "", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "bool", "name": "_redeemRandomNumbers", "type": "bool" }
        ],
        "name": "pausePathStory",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "resumePathStory",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "_pathStoryNumber", "type": "uint16" },
          { "internalType": "uint256", "name": "_pathStoryDeadlineTimestamp", "type": "uint256" },
          { "internalType": "string", "name": "_pathStoriesCID", "type": "string" },
          { "internalType": "string", "name": "_encPathResultCID", "type": "string" },
          { "internalType": "string", "name": "_encPathIncreaseCID", "type": "string" }
        ],
        "name": "startNewPathStory",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "newOwner", "type": "address" }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "", "type": "uint16" }
        ],
        "name": "treePathSurprises",
        "outputs": [
          { "internalType": "uint16", "name": "pathzID", "type": "uint16" },
          { "internalType": "string", "name": "pathTree", "type": "string" },
          { "internalType": "uint256", "name": "totalAnsweredPathz", "type": "uint256" },
          { "internalType": "uint256", "name": "randomNumber", "type": "uint256" },
          { "internalType": "string", "name": "whatGet", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "_pathStoryNumber", "type": "uint16" },
          { "internalType": "string", "name": "_characterTraitsHistoryCID", "type": "string" }
        ],
        "name": "updateCharacterTraitsHistoryCID",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "_pathzNFTContractAddress", "type": "address" },
          { "internalType": "address", "name": "_pathzVRFContract", "type": "address" }
        ],
        "name": "updateContracts",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "_pathStoryNumber", "type": "uint16" },
          {
            "components": [
              { "internalType": "string", "name": "resultCIDs", "type": "string" },
              { "internalType": "string", "name": "increaseCIDs", "type": "string" },
              {
                "components": [
                  { "internalType": "string", "name": "key", "type": "string" },
                  { "internalType": "string", "name": "iv", "type": "string" }
                ],
                "internalType": "struct OptimizePathzMultiversePortal.DecryptKeys",
                "name": "decKeys",
                "type": "tuple"
              }
            ],
            "internalType": "struct OptimizePathzMultiversePortal.EncryptionPathStoryCIDs",
            "name": "_newEncPathStory",
            "type": "tuple"
          }
        ],
        "name": "updateEncryptionPathStoryCIDs",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "_pathStoryNumber", "type": "uint16" },
          { "internalType": "string", "name": "_newPathStoryCID", "type": "string" }
        ],
        "name": "updatePathStoryCID",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint256", "name": "_pathStoryDeadlineTimestamp", "type": "uint256" }
        ],
        "name": "updatePathStoryDeadlineTimestamp",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];       // Your contract ABI here

    const contract = new Contract(contractAddress, contractAbi, provider);
    let result;
    if (params) {
      const parsedParams = JSON.parse(params);
      result = await contract[functionName](...parsedParams);
    } else {
      result = await contract[functionName]();
    }

    return new Response(
      JSON.stringify({ result: cleanBigInt(result) }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error calling smart contract function', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to handle BigInt serialization
function cleanBigInt(value) {
  if (typeof value === 'bigint') {
    return value.toString(); // Convert BigInt to string
  } else if (Array.isArray(value)) {
    return value.map(cleanBigInt); // Recursively handle arrays
  } else if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, cleanBigInt(val)])
    ); // Recursively handle objects
  }
  return value; // Return other types as is
}
