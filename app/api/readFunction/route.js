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

    const contractAddress = '0x27ab6df7da6b51cd73fc2943444b5a3923227de2'; // Replace with your actual contract address
    const contractAbi = [
        {"inputs":[{"internalType":"address","name":"_pathzNFTContractAddress","type":"address"},{"internalType":"uint256","name":"_pathStoryDeadlineTimeStamp","type":"uint256"},{"internalType":"string","name":"_pathStoriesCID","type":"string"},{"internalType":"string","name":"_encPathResultCID","type":"string"},{"internalType":"string","name":"_encPathIncreaseCID","type":"string"},{"internalType":"string","name":"_baseURL","type":"string"},{"internalType":"address","name":"_qrngContractAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
        {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"pathStoryNumber","type":"uint256"},{"components":[{"internalType":"string","name":"encdIncreaseCID","type":"string"},{"internalType":"string","name":"encedResultCID","type":"string"},{"components":[{"internalType":"string","name":"key","type":"string"},{"internalType":"string","name":"iv","type":"string"}],"internalType":"struct PathzUniverse.DecryptKeys","name":"decKey","type":"tuple"}],"indexed":false,"internalType":"struct PathzUniverse.DecryptedCID","name":"decryptedCID","type":"tuple"},{"indexed":false,"internalType":"string","name":"pathStoryCID","type":"string"},{"indexed":false,"internalType":"string","name":"characterTraitsHistory","type":"string"},{"indexed":false,"internalType":"string","name":"fairyTalePath","type":"string"},{"components":[{"internalType":"uint256","name":"pathzID","type":"uint256"},{"internalType":"string","name":"pathTree","type":"string"},{"internalType":"uint256","name":"totalAnswredPathz","type":"uint256"},{"internalType":"uint256","name":"randomNumber","type":"uint256"},{"internalType":"string","name":"whatGet","type":"string"}],"indexed":false,"internalType":"struct PathzUniverse.Surprise","name":"suprise","type":"tuple"}],"name":"FinishUpdated","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"pathStoryNumber","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"pathStoryDeadlineTimeStamp","type":"uint256"},{"indexed":false,"internalType":"string","name":"pathStoryCID","type":"string"}],"name":"PathStoryUpdated","type":"event"},
        {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"pathStoryNumber","type":"uint256"},{"indexed":false,"internalType":"string","name":"letterChoosed","type":"string"},{"indexed":false,"internalType":"uint256","name":"pathzID","type":"uint256"}],"name":"PathzChoosed","type":"event"},
        {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"answeredPathStories","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"answeredPathzIDs","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"baseURL","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"characterTraitsHistoryCIDs","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"string","name":"_treePath","type":"string"}],"name":"checkPathStoryOfTreePath","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"decCIDs","outputs":[{"internalType":"string","name":"encdIncreaseCID","type":"string"},{"internalType":"string","name":"encedResultCID","type":"string"},{"components":[{"internalType":"string","name":"key","type":"string"},{"internalType":"string","name":"iv","type":"string"}],"internalType":"struct PathzUniverse.DecryptKeys","name":"decKey","type":"tuple"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"defultPathStories","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"encPathIncreasesCIDs","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"encPathResultsCIDs","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"fairyTalePath","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"string","name":"_key","type":"string"},{"internalType":"string","name":"_iv","type":"string"},{"internalType":"string","name":"_characterTraitsHistory","type":"string"},{"internalType":"string","name":"_whatGet","type":"string"}],"name":"finishPathStory","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"getAllPathStories","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"string","name":"","type":"string"},{"components":[{"internalType":"uint256","name":"pathStoryNumber","type":"uint256"},{"internalType":"string","name":"pathStoryCID","type":"string"},{"internalType":"string","name":"characterTraitsHistoryCID","type":"string"},{"components":[{"internalType":"string","name":"encdIncreaseCID","type":"string"},{"internalType":"string","name":"encedResultCID","type":"string"},{"components":[{"internalType":"string","name":"key","type":"string"},{"internalType":"string","name":"iv","type":"string"}],"internalType":"struct PathzUniverse.DecryptKeys","name":"decKey","type":"tuple"}],"internalType":"struct PathzUniverse.DecryptedCID","name":"decryptedCID","type":"tuple"}],"internalType":"struct PathzUniverse.AllVars[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathStoryNumber","type":"uint256"}],"name":"getLastCharacterTraitsHistoryCID","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathStoryNumber","type":"uint256"}],"name":"getLastDecryptedCID","outputs":[{"components":[{"internalType":"string","name":"encdIncreaseCID","type":"string"},{"internalType":"string","name":"encedResultCID","type":"string"},{"components":[{"internalType":"string","name":"key","type":"string"},{"internalType":"string","name":"iv","type":"string"}],"internalType":"struct PathzUniverse.DecryptKeys","name":"decKey","type":"tuple"}],"internalType":"struct PathzUniverse.DecryptedCID","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathStoryNumber","type":"uint256"}],"name":"getLastEncPathIncreaseCID","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathStoryNumber","type":"uint256"}],"name":"getLastEncPathResultCID","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathStoryNumber","type":"uint256"}],"name":"getLastPathStoryCID","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathzID","type":"uint256"}],"name":"getOwnerOfPathz","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathzID","type":"uint256"}],"name":"getTreePathForPathzID","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"string","name":"choosedLetter","type":"string"}],"name":"isValidLetter","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},
        {"inputs":[{"internalType":"string","name":"treePath","type":"string"}],"name":"isValidTreePath","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},
        {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"pathStoriesCIDs","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"pathStoryDeadlineTimeStamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"pathStoryNumber","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"pathStoryStart","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"string","name":"choosedLetter","type":"string"},{"internalType":"uint256","name":"_pathzID","type":"uint256"}],"name":"pathzChoosePath","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"pathzNFTContract","outputs":[{"internalType":"contract PathzTest","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"bool","name":"_redeemRandomNumbers","type":"bool"}],"name":"pausePathStory","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"qrngContract","outputs":[{"internalType":"contract QRNGPathz","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"resumePathStory","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[],"name":"sizeRandomNumberArray","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathStoryNumber","type":"uint256"},{"internalType":"uint256","name":"_pathStoryDeadlineTimeStamp","type":"uint256"},{"internalType":"string","name":"_pathStoriesCID","type":"string"},{"internalType":"string","name":"_encPathResultCID","type":"string"},{"internalType":"string","name":"_encPathIncreaseCID","type":"string"}],"name":"startNewPathStory","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"treePathSurprises","outputs":[{"internalType":"uint256","name":"pathzID","type":"uint256"},{"internalType":"string","name":"pathTree","type":"string"},{"internalType":"uint256","name":"totalAnswredPathz","type":"uint256"},{"internalType":"uint256","name":"randomNumber","type":"uint256"},{"internalType":"string","name":"whatGet","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathStoryNumber","type":"uint256"},{"internalType":"string","name":"_characterTraitsHistoryCID","type":"string"}],"name":"updateCharacterTraitsHistoryCID","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_pathzNFTContractAddress","type":"address"},{"internalType":"address","name":"_qrngContractAddress","type":"address"}],"name":"updateContracts","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathStoryNumber","type":"uint256"},{"internalType":"string","name":"_key","type":"string"},{"internalType":"string","name":"_iv","type":"string"}],"name":"updateEncKey","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathStoryNumber","type":"uint256"},{"internalType":"string","name":"_newEncIncreaseCID","type":"string"}],"name":"updateEncPathIncreasesCID","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathStoryNumber","type":"uint256"},{"internalType":"string","name":"_newEncResultCID","type":"string"}],"name":"updateEncPathResultsCID","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathStoryNumber","type":"uint256"},{"internalType":"string","name":"_newPathStoryCID","type":"string"}],"name":"updatePathStoryCID","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_pathStoryDeadlineTimeStamp","type":"uint256"}],"name":"updatePathStoryDeadlineTimeStamp","outputs":[],"stateMutability":"nonpayable","type":"function"}
      ];   // Your contract ABI here

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
