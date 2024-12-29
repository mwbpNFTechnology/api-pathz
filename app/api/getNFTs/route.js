// app/api/getNFTs/route.js

import axios from 'axios';
import { JsonRpcProvider, Contract } from 'ethers';

// Only these origins are allowed; all others will be disallowed.
const ALLOWED_ORIGINS = [
  'https://dapp.pathz.xyz',
  'https://stackblitz.com',
  'https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5173--c8c182a3.local-credentialless.webcontainer-api.io',
];

// Optional: Node.js runtime for Next.js
export const runtime = 'nodejs';

/**
 * Sets CORS headers for allowed origins.
 * @param {Response} response - The response object.
 * @param {string} origin - The origin of the request.
 * @returns {Response} - The response with CORS headers set if origin is allowed.
 */
function setCorsHeaders(response, origin) {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Pragma, Cache-Control, Authorization');
  return response;
}

/**
 * Constructs an error response with appropriate CORS headers for allowed origins.
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code.
 * @param {string} origin - The origin of the request.
 * @returns {Response} - The error response.
 */
function errorResponse(message, statusCode, origin) {
  const body = JSON.stringify({ error: message });
  const response = new Response(body, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // If origin is allowed, set the CORS headers
  if (ALLOWED_ORIGINS.includes(origin)) {
    setCorsHeaders(response, origin);
  }

  return response;
}

/**
 * Handles preflight OPTIONS requests. Disallows if origin is not in ALLOWED_ORIGINS.
 */
export async function OPTIONS(request) {
  const origin = request.headers.get('Origin') || '';

  // If the origin is not in ALLOWED_ORIGINS, return 403
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return errorResponse('CORS Error: Origin not allowed', 403, origin);
  }

  // Otherwise, allow the request
  const response = new Response(null, { status: 204 });
  setCorsHeaders(response, origin);
  return response;
}

/**
 * Main GET endpoint: fetches NFTs via Alchemy and calls `getAllPathStories`
 * from your contract if there's at least one NFT with an `edition`.
 */
export async function GET(request) {
  const origin = request.headers.get('Origin') || '';

  // Disallow if not in ALLOWED_ORIGINS
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return errorResponse('CORS Error: Origin not allowed', 403, origin);
  }

  try {
    // 1) Parse query params
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const nftContract = searchParams.get('nftContract');
    const network = searchParams.get('network') || 'mainnet';

    if (!walletAddress) {
      return errorResponse('Missing walletAddress parameter', 400, origin);
    }
    if (!nftContract) {
      return errorResponse('Missing nftContract parameter', 400, origin);
    }

    // 2) Check environment
    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      console.error('Alchemy API key is not configured.');
      return errorResponse('Alchemy API key not configured in environment variables', 500, origin);
    }

    // 3) Determine Alchemy base URL
    let baseURL;
    if (network === 'mainnet') {
      baseURL = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
    } else if (network === 'sepolia') {
      baseURL = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    } else {
      return errorResponse('Invalid network parameter. Use "mainnet" or "sepolia".', 400, origin);
    }

    // 4) Fetch NFTs from Alchemy
    const alchemyResponse = await axios.get(`${baseURL}/getNFTs`, {
      params: {
        owner: walletAddress,
        contractAddresses: [nftContract],
      },
    });

    // 5) Minimal NFT data
    let nftData = (alchemyResponse.data.ownedNfts || []).map((nft) => ({
      metadata: nft.metadata,
      media: nft.media,
    }));

    // 6) Gather the editions
    const pathzIDsParams = nftData
      .map((item) => item?.metadata?.edition)
      .filter(Boolean);

    // Variables for contract data
    let finalDeadlineTimestamp = '';
    let finalActive = false;
    let baseURLValue = '';
    let allPathStoriesDetails = [];

    // 7) If we have at least one NFT, call `getAllPathStories`
    if (pathzIDsParams.length > 0) {
      try {
        // Inline logic for calling the contract (instead of /api/readFunction)
        const networkUrls = {
          mainnet: `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`,
          sepolia: `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`,
        };
        const provider = new JsonRpcProvider(networkUrls[network]);

        // Your contract address and ABI
        const contractAddress = '0x0c85255c89e26FfB69fd01A5E74566a88B7FD85e'; // Replace with your actual contract address
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

        const rawResult = await contract.getAllPathStories(pathzIDsParams);
        const result = cleanBigInt(rawResult);

        // Expect result to be array with at least 5 elements
        if (Array.isArray(result) && result.length >= 5) {
          const newTreePaths = result[0];
          const deadlineTimestamp = result[1];
          const active = result[2];
          baseURLValue = result[3] || '';
          const pathStoriesArr = result[4];

          finalDeadlineTimestamp = Number(deadlineTimestamp);
          finalActive = !!active;

          // Update NFT metadata with the new treePaths
          if (Array.isArray(newTreePaths)) {
            const editionToPathMap = {};
            for (const [editionStr, treePath] of newTreePaths) {
              editionToPathMap[Number(editionStr)] = treePath;
            }

            nftData = nftData.map((nftItem) => {
              const edition = nftItem?.metadata?.edition;
              if (edition && editionToPathMap[edition]) {
                const newPathValue = editionToPathMap[edition];
                if (Array.isArray(nftItem.metadata?.attributes)) {
                  nftItem.metadata.attributes = nftItem.metadata.attributes.map((attr) => {
                    if (attr.trait_type === 'treePath') {
                      return { ...attr, value: newPathValue };
                    }
                    return attr;
                  });
                }
              }
              return nftItem;
            });
          }

          // Build allPathStoriesDetails
          if (Array.isArray(pathStoriesArr)) {
            allPathStoriesDetails = pathStoriesArr.map((ps) => {
              // e.g., ps = [ pathStoryNumber, pathStoryCID, characterTraitsHistoryCID, { resultCIDs, increaseCIDs, decKeys: { key, iv } } ]
              const pathStoryNumber = Number(ps[0]);
              const pathStoryCID = ps[1] || '';
              const characterTraitsHistoryCID = ps[2] || '';
              const encObj = ps[3] || {};

              return {
                pathStoryNumber,
                pathStoryCID,
                characterTraitsHistoryCID,
                pathResultsCID: encObj.resultCIDs || '',
                pathIncreasesCID: encObj.increaseCIDs || '',
                decKey: encObj.decKeys?.key || '',
                decIV: encObj.decKeys?.iv || '',
              };
            });
          }
        }
      } catch (err) {
        console.error('Error calling getAllPathStories:', err);
      }
    }

    // 8) Construct final response
    let pathStoryDetails = null;
    if (allPathStoriesDetails.length > 0) {
      pathStoryDetails = allPathStoriesDetails[allPathStoriesDetails.length - 1];
    }

    const responseBody = {
      nfts: nftData,
      currentPathStory: {
        deadlineTimestamp: finalDeadlineTimestamp,
        active: finalActive,
        baseURL: baseURLValue,
        pathStoryDetails,
      },
      allPathStoriesDetails,
    };

    // 9) Build final response
    const response = new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    setCorsHeaders(response, origin);
    return response;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    if (error.response) {
      console.error('Alchemy API Response:', error.response.data);
    }
    return errorResponse('Internal Server Error', 500, origin);
  }
}

/**
 * Recursively converts BigInt to string in arrays/objects so JSON.stringify won't error out.
 */
function cleanBigInt(value) {
  if (typeof value === 'bigint') {
    return value.toString();
  } else if (Array.isArray(value)) {
    return value.map(cleanBigInt);
  } else if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, cleanBigInt(val)])
    );
  }
  return value;
}
