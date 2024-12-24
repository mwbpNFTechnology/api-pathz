// app/api/getNFTs/route.js

import axios from 'axios';

// Adjust this as needed for your domain
const ALLOWED_ORIGIN = 'https://dapp.pathz.xyz';

export async function OPTIONS(_) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Pragma, Cache-Control, Authorization',
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
      return errorResponse(
        'Alchemy API key not configured in environment variables',
        500
      );
    }

    // ==== 1) Determine Alchemy base URL based on network ====
    let baseURL;
    if (network === 'mainnet') {
      baseURL = `https://eth-mainnet.alchemyapi.io/v2/${apiKey}`;
    } else if (network === 'sepolia') {
      baseURL = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
    } else {
      return errorResponse(
        'Invalid network parameter. Use "mainnet" or "sepolia".',
        400
      );
    }

    // ==== 2) Fetch NFTs from Alchemy ====
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

    // Gather the editions (pathzIDs)
    const pathzIDsParams = nftData
      .map((item) => item?.metadata?.edition)
      .filter(Boolean);

    // We'll store these after reading from the contract
    let finalDeadlineTimestamp = 0; // as an integer
    let finalActive = false;
    let allPathStory = [];

    // ==== 3) If we have at least one NFT, call readFunction => getAllPathStories ====
    if (pathzIDsParams.length > 0) {
      try {
        // Build URL to call your readFunction
        const readFunctionURL = new URL(request.url);
        readFunctionURL.pathname = '/api/readFunction';
        readFunctionURL.searchParams.set('functionName', 'getAllPathStories');
        readFunctionURL.searchParams.set('network', network);
        // The function expects one param: uint16[], so pass [pathzIDsParams]
        readFunctionURL.searchParams.set(
          'params',
          JSON.stringify([pathzIDsParams])
        );

        const readResp = await fetch(readFunctionURL, { method: 'GET' });
        const readJson = await readResp.json();

        // readJson.result => Array(1)
        //  - readJson.result[0] => Array(5)
        //    [ newTreePaths, "1735386332", false, baseURL, pathStoriesArr ]
        if (
          Array.isArray(readJson.result) &&
          readJson.result.length > 0 &&
          Array.isArray(readJson.result[0]) &&
          readJson.result[0].length >= 5
        ) {
          const dataArr = readJson.result[0];

          // Destructure fields
          const newTreePaths = dataArr[0];               // e.g. [ ["1","x-z-X"], ["2","x-Y-z"] ]
          const deadlineTsStr = dataArr[1];              // "1735386332"
          const active = dataArr[2];                     // e.g. false
          // dataArr[3] => baseURL (unused here if not needed)
          const pathStoriesArr = dataArr[4];             // array of path stories

          // Convert the deadline to integer
          finalDeadlineTimestamp = Number(deadlineTsStr);
          // Convert active to boolean
          finalActive = !!active;

          // === 3a) Update NFT treePath according to newTreePaths
          if (Array.isArray(newTreePaths)) {
            const editionToPathMap = {};
            for (const [editionStr, treePath] of newTreePaths) {
              editionToPathMap[Number(editionStr)] = treePath;
            }

            nftData = nftData.map((nftItem) => {
              const edition = nftItem?.metadata?.edition;
              if (edition && editionToPathMap[edition]) {
                const newPathValue = editionToPathMap[edition];

                // Replace the treePath attribute
                if (Array.isArray(nftItem.metadata?.attributes)) {
                  nftItem.metadata.attributes = nftItem.metadata.attributes.map(
                    (attr) => {
                      if (attr.trait_type === 'treePath') {
                        return { ...attr, value: newPathValue };
                      }
                      return attr;
                    }
                  );
                }
              }
              return nftItem;
            });
          }

          // === 3b) Build allPathStory from pathStoriesArr
          if (Array.isArray(pathStoriesArr)) {
            allPathStory = pathStoriesArr.map((ps) => {
              // Each ps might look like:
              // [
              //   "1",
              //   "QmcDAAcMbvdnoLqT6xcByWq44FUV49ZDoPG89VV7STL6xz",
              //   "history123",
              //   [
              //     "QmU3yZrUqMtZrkLiUYFBtg3WdG9LmqNXVxn9LkLXqJHtga",
              //     "QmWe8Wwmk5JuuoHu31tevFNgty5Si9U4FvEAW3e1zipz8j",
              //     ["key123","iv123"]
              //   ]
              // ]
              const pathStoryNumber = Number(ps[0] || 0);
              const pathStoryCID = ps[1] || '';
              const characterTraitsHistoryCID = ps[2] || '';

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

    // ==== 4) Construct final response ====
    const responseBody = {
      nfts: nftData,
      currentPathStory: {
        deadlineTimestamp: finalDeadlineTimestamp, // now an integer
        active: finalActive,
      },
      allPathStory,
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

// Helper for consistent error responses
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
