// app/api/getNFTs/route.js

import axios from 'axios';

const ALLOWED_ORIGIN = 'https://dapp.pathz.xyz';

export async function OPTIONS(_) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Pragma, Cache-Control, Authorization',
    },
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const nftContract = searchParams.get('nftContract');
    const network = searchParams.get('network') || 'mainnet';

    if (!walletAddress) {
      return errorResponse('Missing walletAddress parameter', 400);
    }
    if (!nftContract) {
      return errorResponse('Missing nftContract parameter', 400);
    }

    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      return errorResponse('Alchemy API key not configured in environment variables', 500);
    }

    // Determine Alchemy base URL
    let baseURL;
    if (network === 'mainnet') {
      baseURL = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
    } else if (network === 'sepolia') {
      baseURL = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    } else {
      return errorResponse('Invalid network parameter. Use "mainnet" or "sepolia".', 400);
    }

    // 1) Fetch NFTs from Alchemy
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

    // Gather the editions
    const pathzIDsParams = nftData
      .map((item) => item?.metadata?.edition)
      .filter(Boolean);

    // We'll store contract data here:
    let finalDeadlineTimestamp = '';
    let finalActive = false;
    let baseURLValue = '';
    // Renaming "allPathStories" to "allPathStoriesDetails"
    let allPathStoriesDetails = [];

    // 2) If we have at least one NFT, call getAllPathStories
    if (pathzIDsParams.length > 0) {
      try {
        // Build readFunction URL
        const readFunctionURL = new URL(request.url);
        readFunctionURL.pathname = '/api/readFunction';
        readFunctionURL.searchParams.set('functionName', 'getAllPathStories');
        readFunctionURL.searchParams.set('network', network);
        // The function expects a single param: uint16[], so pass [ pathzIDsParams ]
        readFunctionURL.searchParams.set('params', JSON.stringify([pathzIDsParams]));

        // Call readFunction
        const readResp = await fetch(readFunctionURL, { method: 'GET' });
        const readJson = await readResp.json();

        /**
         * Example shape:
         * readJson.result = [
         *   [ ["1", "x-z-X"], ["2", "x-Y-z"] ],
         *   "1735386332",
         *   false,
         *   "https://someURL",
         *   [ [ "1", "Qm...", "history123", [ "cid1", "cid2", [ "key", "iv" ] ] ],
         *     [ "2", "PSCID2", "history999", [ "encPRCID2", "encPICID2", [ "key999", "iv999" ] ] ]
         *   ]
         * ];
         */
        if (Array.isArray(readJson.result) && readJson.result.length >= 5) {
          // Index 0 => newTreePaths
          const newTreePaths = readJson.result[0];      
          // Index 1 => deadlineTimestamp
          const deadlineTimestamp = readJson.result[1]; 
          // Index 2 => active
          const active = readJson.result[2];            
          // Index 3 => baseURL
          baseURLValue = readJson.result[3] || '';
          // Index 4 => pathStoriesArr
          const pathStoriesArr = readJson.result[4];    

          // Save finalDeadlineTimestamp, finalActive
          finalDeadlineTimestamp = Number(deadlineTimestamp);
          finalActive = !!active;

          // 2a) Update NFT treePath
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

          // 2b) Build allPathStoriesDetails array
          if (Array.isArray(pathStoriesArr)) {
            allPathStoriesDetails = pathStoriesArr.map((ps) => {
              // Example "ps" shape:
              // [
              //   "1",
              //   "QmcDAAcMbvdnoLqT6xcByWq44FUV49ZDoPG89VV7STL6xz",
              //   "history123",
              //   [
              //     "QmU3yZrUqMtZrkLiUYFBtg3WdG9LmqNXVxn9LkLXqJHtga",
              //     "QmWe8Wwmk5JuuoHu31tevFNgty5Si9U4FvEAW3e1zipz8j",
              //     ["key123", "iv123"]
              //   ]
              // ]
              const pathStoryNumber = ps[0] ? Number(ps[0]) : null;
              const pathStoryCID = ps[1] || '';
              const characterTraitsHistoryCID = ps[2] || '';

              // encArr => e.g. [ "cid1", "cid2", [ "key", "iv" ] ]
              const encArr = Array.isArray(ps[3]) ? ps[3] : [];
              const pathResultsCID = encArr[0] || '';
              const pathIncreasesCID = encArr[1] || '';
              const decData = Array.isArray(encArr[2]) ? encArr[2] : [];
              const decKey = decData[0] || '';
              const decIV = decData[1] || '';

              return {
                pathStoryNumber,
                pathStoryCID,
                characterTraitsHistoryCID,
                pathResultsCID,
                pathIncreasesCID,
                decKey,
                decIV,
              };
            });
          }
        }
      } catch (err) {
        console.error('Error calling readFunction:', err);
      }
    }

    // 3) Construct final response
    // We'll grab the last element of allPathStoriesDetails as "pathStoryDetails".
    let pathStoryDetails = null;
    if (allPathStoriesDetails.length > 0) {
      pathStoryDetails = allPathStoriesDetails[allPathStoriesDetails.length - 1];
    }

    const responseBody = {
      nfts: nftData,
      currectPathStory: {
        deadlineTimestamp: finalDeadlineTimestamp, // e.g. "1735386332"
        active: finalActive,                      // e.g. false
        baseURL: baseURLValue,                    // e.g. "https://someURL"
        pathStoryDetails,                         // e.g. last element from allPathStoriesDetails
      },
      allPathStoriesDetails, // Renamed from "allPathStories"
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      },
    });
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    if (error.response) {
      console.error('Alchemy API Response:', error.response.data);
    }
    return errorResponse('Internal Server Error', 500, error.message);
  }
}

function errorResponse(message, statusCode, details) {
  const body = details ? { error: message, details } : { error: message };
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    },
  });
}