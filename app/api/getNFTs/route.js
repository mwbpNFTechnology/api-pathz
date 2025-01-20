// app/api/getNFTs/route.js

import axios from 'axios';
import { JsonRpcProvider, Contract } from 'ethers';
import { 
  multiversePortalContractAddress, 
  multiversePortalContractAbi, 
  PathzNFTContractAddress, 
  PathzNFTContractAbi 
} from '../../../lib/contractConfig'; 

// Only these origins are allowed; all others will be disallowed.
const ALLOWED_ORIGINS = [
  'https://dapp.pathz.xyz',
  'https://stackblitz.com',
  'https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5173--c8c182a3.local-credentialless.webcontainer-api.io',
  'https://cors-proxy-production.stackblitz.workers.dev',
  'https://cors-proxy-production.stackblitz.workers.dev'
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
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers', 
    'Content-Type, Authorization, Pragma, Cache-Control'
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true'); 
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
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return errorResponse('CORS Error: Origin not allowed', 403, origin);
  }
  const response = new Response(null, { status: 204 });
  setCorsHeaders(response, origin);
  return response;
}

/**
 * Main GET endpoint: fetches NFTs via Alchemy and then calls contract methods
 *   - getAllPathStories
 *   - getAllSurprises (from PathzNFTContractAddress)
 */
export async function GET(request) {
  const origin = request.headers.get('Origin') || '';

  if (!ALLOWED_ORIGINS.includes(origin)) {
    return errorResponse('CORS Error: Origin not allowed', 403, origin);
  }

  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const network = searchParams.get('network') || 'mainnet';

    if (!walletAddress) {
      return errorResponse('Missing walletAddress parameter', 400, origin);
    }

    // Your NFT contract
    const nftContract = PathzNFTContractAddress;

    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      console.error('Alchemy API key is not configured.');
      return errorResponse('Alchemy API key not configured in environment variables', 500, origin);
    }

    let baseURL;
    if (network === 'mainnet') {
      baseURL = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
    } else if (network === 'sepolia') {
      baseURL = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    } else {
      return errorResponse('Invalid network parameter. Use "mainnet" or "sepolia".', 400, origin);
    }

    // Fetch NFTs for the owner from Alchemy
    const alchemyResponse = await axios.get(`${baseURL}/getNFTs`, {
      params: {
        owner: walletAddress,
        contractAddresses: [nftContract],
      },
    });

    // Minimal NFT data
    let nftData = (alchemyResponse.data.ownedNfts || []).map((nft) => ({
      metadata: nft.metadata,
      media: nft.media,
    }));

    // Collect the "edition" numbers for each minted NFT
    const pathzIDsParams = nftData
      .map((item) => item?.metadata?.edition)
      .filter(Boolean);

    let finalDeadlineTimestamp = '';
    let finalActive = false;
    let baseURLValue = '';
    let allPathStoriesDetails = [];
    let allSurprises = [];

    if (pathzIDsParams.length > 0) {
      try {
        const networkUrls = {
          mainnet: `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`,
          sepolia: `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`,
        };
        const provider = new JsonRpcProvider(networkUrls[network]);

        // 1. Grab story data from MultiversePortal
        const portalContract = new Contract(
          multiversePortalContractAddress,
          multiversePortalContractAbi,
          provider
        );

        const rawResult = await portalContract.getAllPathStories(pathzIDsParams);
        const result = cleanBigInt(rawResult);

        if (Array.isArray(result) && result.length >= 5) {
          const newTreePaths = result[0];
          const deadlineTimestamp = result[1];
          const active = result[2];
          baseURLValue = result[3] || '';
          const pathStoriesArr = result[4];

          finalDeadlineTimestamp = Number(deadlineTimestamp);
          finalActive = !!active;

          // Update the NFT's "treePath" attribute if the contract says there's a new path
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

          // Build out the array of pathStory objects
          if (Array.isArray(pathStoriesArr)) {
            allPathStoriesDetails = pathStoriesArr.map((ps) => {
              const pathStoryNumber = Number(ps[0]);
              const pathStoryCID = ps[1] || "";
              const characterTraitsHistoryCID = ps[2] || "";
              const encObj = ps[3] || [];
              const [encPathResultAndIncreaseCIDValue, decKeysArr] = encObj;
              const [theKey, theIV] = Array.isArray(decKeysArr) ? decKeysArr : ["", ""];

              return {
                pathStoryNumber,
                pathStoryCID,
                characterTraitsHistoryCID,
                encPathResultAndIncreaseCID: encPathResultAndIncreaseCIDValue || "",
                decKey: theKey || "",
                decIV: theIV || "",
              };
            });
          }
        }

        // 2. Grab the 'allSurprises' from PathzNFT contract
        const nftContractInstance = new Contract(
          PathzNFTContractAddress,
          PathzNFTContractAbi,
          provider
        );
        const rawSurprises = await nftContractInstance.getAllSurprises();
        allSurprises = cleanBigInt(rawSurprises);

      } catch (err) {
        console.error('Error fetching data:', err);
      }
    }

    /**
     * If you'd like to replicate the previous router’s logic of adding 
     * "pathStoryDetails" within "currentPathStory", you can pick whichever 
     * story object you want as `pathStoryDetails`. 
     * 
     * Here, we take the last element in `allPathStoriesDetails` if it exists:
     */
    let pathStoryDetails = null;
    if (allPathStoriesDetails.length > 0) {
      pathStoryDetails = allPathStoriesDetails[allPathStoriesDetails.length - 1];
    }

    // Build the final response body
    const responseBody = {
      nfts: nftData,
      currentPathStory: {
        deadlineTimestamp: finalDeadlineTimestamp,
        active: finalActive,
        baseURL: baseURLValue,
        // Insert the new "pathStoryDetails" property:
        pathStoryDetails,
        // Keep the array of all stories as well:
        allPathStoriesDetails,
      },
      // Surprises remain separate
      allSurprises,
    };

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
 * Utility function to safely convert BigInts to strings.
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
