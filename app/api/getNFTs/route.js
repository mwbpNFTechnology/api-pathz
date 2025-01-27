// app/api/getNFTs/route.js

import axios from 'axios';
import { JsonRpcProvider, Contract } from 'ethers';
import { 
  multiversePortalContractAddress, 
  multiversePortalContractAbi, 
  PathzNFTContractAddress, 
  PathzNFTContractAbi 
} from '../../../lib/contractConfig'; 

// Optional: Node.js runtime for Next.js
export const runtime = 'nodejs';

/**
 * Sets CORS headers for the given response and origin.
 * @param {Response} response - The response object.
 * @param {string} origin - The origin of the request.
 * @returns {Response} - The response with CORS headers set.
 */
function setCorsHeaders(response, origin) {
  // Echo back the origin for CORS
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
  const response = new Response(null, { status: 204 });
  setCorsHeaders(response, origin);
  return response;
}

/**
 * Main GET endpoint: fetches NFTs via Alchemy and then calls contract methods
 *   - getAllPathStories
 *   - getAllSurprises (from PathzNFTContractAddress)
 *   - getTreePathsForPathzIDs (from MultiversePortalContractAddress)
 */
export async function GET(request) {
  const origin = request.headers.get('Origin') || '';

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

    // Initialize provider outside the conditional block to reuse it later
    const networkUrls = {
      mainnet: `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`,
      sepolia: `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`,
    };
    const provider = new JsonRpcProvider(networkUrls[network]);

    if (pathzIDsParams.length > 0) {
      try {
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
        allSurprises = cleanBigInt(rawSurprises).map((surprise) => ({
          wonPathzID: Number(surprise[0]), // Convert to number
          wonTreePath: surprise[1],
          totalAnsweredPathz: Number(surprise[2]), // Convert to number
          randomNumber: surprise[3].toString(), // Convert BigInt to string to preserve large value
          whatGet: surprise[4],
          answeredPathzIDs: surprise[5].map(id => Number(id)), // Convert each ID to number
        }));

        // **New Additions Start Here**

        // 3. Check the last surprise's answeredPathzIDs and call getTreePathsForPathzIDs
        if (allSurprises.length > 0) {
          const lastSurprise = allSurprises[allSurprises.length - 1];
          const wonPathzID = lastSurprise.wonPathzID; // Retrieve wonPathzID
          const wonTreePath = lastSurprise.wonTreePath.toLowerCase(); // Normalize for comparison

          if (lastSurprise.answeredPathzIDs && lastSurprise.answeredPathzIDs.length > 0) {
            const pathzIDs = lastSurprise.answeredPathzIDs;

            // Instantiate the MultiversePortal contract
            const multiversePortalContract = new Contract(
              multiversePortalContractAddress,
              multiversePortalContractAbi,
              provider
            );

            try {
              // Call the getTreePathsForPathzIDs function
              const treePaths = await multiversePortalContract.getTreePathsForPathzIDs(pathzIDs);
              
              // Clean the BigInts
              const cleanedTreePaths = cleanBigInt(treePaths); // Assuming it returns array of arrays like [ [ '2', 'x-y' ], ... ]

              // **Filter out tree paths with pathzID === 1 and pathzID === wonPathzID**
              const filteredTreePaths = cleanedTreePaths.filter(path => {
                const pathID = Number(path[0]); // Assuming path is an array like [ '2', 'x-y' ]
                return pathID !== 1 && pathID !== wonPathzID;
              });

              // **Filter tree paths where treePath matches wonTreePath (case-insensitive)**
              const matchingTreePaths = filteredTreePaths.filter(path => {
                const treePath = path[1].toLowerCase();
                return treePath === wonTreePath;
              });

              // **Extract only the pathzIDs that match wonTreePath**
              const pathzIDsTreePathWon = matchingTreePaths.map(path => Number(path[0]));

              // **Add the pathzIDsTreePathWon to the lastSurprise object**
              lastSurprise.pathzIDsTreePathWon = pathzIDsTreePathWon;

              // Log the matching tree paths
              console.log('Matching Tree Paths for Pathz IDs:', matchingTreePaths);
            } catch (contractError) {
              console.error('Error calling getTreePathsForPathzIDs:', contractError);
            }
          } else {
            console.log('No answeredPathzIDs found in the last surprise.');
          }
        } else {
          console.log('No surprises found.');
        }

        // **New Additions End Here**

      } catch (err) {
        console.error('Error fetching data:', err);
        // Optionally, you can return an error response here
        return errorResponse('Error fetching contract data', 500, origin);
      }
    }

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
        allPathStoriesDetails,
      },
      allSurprises,
      // Remove filteredTreePaths from the response
      // filteredTreePaths, 
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
