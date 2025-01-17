export const multiversePortalContractAddress = '0x9017B2224597bA0A71F08f685fD4D17A9ec92Fdd'; // 0xe4d66ce3E77de53241e2877DFd4a94533ED4d65d

export const multiversePortalContractAbi = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "_pathStoryDeadlineTimestamp", "type": "uint256" },
      { "internalType": "string", "name": "_pathStoriesCID", "type": "string" },
      { "internalType": "string", "name": "_encResultAndIncreaseCID", "type": "string" },
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
      { "internalType": "uint16", "name": "", "type": "uint16" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "encryptionPathStoriesCIDs",
    "outputs": [
      { "internalType": "string", "name": "resultAndIncreaseCID", "type": "string" },
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
              {
                "internalType": "string",
                "name": "resultAndIncreaseCID",
                "type": "string"
              },
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
          { "internalType": "string", "name": "resultAndIncreaseCID", "type": "string" },
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
    "name": "pathStoryNumber",
    "outputs": [
      { "internalType": "uint16", "name": "", "type": "uint16" }
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
      { "internalType": "string", "name": "_encResultAndIncreaseCID", "type": "string" }
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
          { "internalType": "string", "name": "resultAndIncreaseCID", "type": "string" },
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
];


export const PathzNFTContractAddress = '0xac29fAE73352891bF5d0E05053D072f4c8E4461b';

export const PathzNFTContractAbi = [
  {
    "inputs": [
      { "internalType": "string", "name": "_baseURI", "type": "string" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  { "inputs": [], "name": "CreatorTokenBase__InvalidTransferValidatorContract", "type": "error" },
  { "inputs": [], "name": "ShouldNotMintToBurnAddress", "type": "error" },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "approved", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "operator", "type": "address" },
      { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "bool", "name": "autoApproved", "type": "bool" }
    ],
    "name": "AutomaticApprovalOfTransferValidatorSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "receiver", "type": "address" },
      { "indexed": false, "internalType": "uint96", "name": "feeNumerator", "type": "uint96" }
    ],
    "name": "DefaultRoyaltySet",
    "type": "event"
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
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "receiver", "type": "address" },
      { "indexed": false, "internalType": "uint96", "name": "feeNumerator", "type": "uint96" }
    ],
    "name": "TokenRoyaltySet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "oldValidator", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "newValidator", "type": "address" }
    ],
    "name": "TransferValidatorUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_TRANSFER_VALIDATOR",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "autoApproveTransfersFromValidator",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllSurprises",
    "outputs": [
      {
        "components": [
          { "internalType": "uint16", "name": "pathzID", "type": "uint16" },
          { "internalType": "string", "name": "pathTree", "type": "string" },
          { "internalType": "uint256", "name": "totalAnsweredPathz", "type": "uint256" },
          { "internalType": "uint256", "name": "randomNumber", "type": "uint256" },
          { "internalType": "string", "name": "whatGet", "type": "string" },
          { "internalType": "uint16[]", "name": "answeredPathzIDs", "type": "uint16[]" }
        ],
        "internalType": "struct Pathz.Surprise[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint16", "name": "s", "type": "uint16" },
      { "internalType": "uint16", "name": "z", "type": "uint16" }
    ],
    "name": "getAnsweredPathStory",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint16", "name": "s", "type": "uint16" }],
    "name": "getAnsweredPathzIDs",
    "outputs": [{ "internalType": "uint16[]", "name": "", "type": "uint16[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getApproved",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint16", "name": "s", "type": "uint16" }],
    "name": "getDefaultPathStory",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFairyTalePath",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "timestamp", "type": "uint256" }],
    "name": "getMintStage",
    "outputs": [
      {
        "components": [
          { "internalType": "uint16", "name": "qtyMint", "type": "uint16" },
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "internalType": "struct Pathz.MintStage",
        "name": "stage",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTransferValidationFunction",
    "outputs": [
      { "internalType": "bytes4", "name": "functionSignature", "type": "bytes4" },
      { "internalType": "bool", "name": "isViewFunction", "type": "bool" }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTransferValidator",
    "outputs": [
      { "internalType": "address", "name": "validator", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "z", "type": "uint256" }],
    "name": "getTreePathForPathzID",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "operator", "type": "address" }
    ],
    "name": "isApprovedForAll",
    "outputs": [{ "internalType": "bool", "name": "isApproved", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "payable", "type": "function" },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pathStoryNumber",
    "outputs": [{ "internalType": "uint16", "name": "", "type": "uint16" }],
    "stateMutability": "view",
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
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "salePrice", "type": "uint256" }
    ],
    "name": "royaltyInfo",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint16", "name": "s", "type": "uint16" },
      { "internalType": "uint16", "name": "z", "type": "uint16" },
      { "internalType": "string", "name": "l", "type": "string" }
    ],
    "name": "setAnsweredPathStory",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "operator", "type": "address" },
      { "internalType": "bool", "name": "approved", "type": "bool" }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bool", "name": "autoApprove", "type": "bool" }],
    "name": "setAutomaticApprovalOfTransfersFromValidator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_u", "type": "string" }],
    "name": "setBaseURI",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint16", "name": "_s", "type": "uint16" },
      { "internalType": "string", "name": "_d", "type": "string" },
      { "internalType": "string", "name": "_p", "type": "string" }
    ],
    "name": "setDefaultAndFairyTalePath",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_r", "type": "address" },
      { "internalType": "uint96", "name": "_f", "type": "uint96" }
    ],
    "name": "setDefaultRoyalty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint16", "name": "_n", "type": "uint16" }],
    "name": "setPathStoryNumber",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_c", "type": "address" }],
    "name": "setPathzMultiversePortalContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint16", "name": "s", "type": "uint16" },
      { "internalType": "uint16", "name": "z", "type": "uint16" },
      { "internalType": "string", "name": "p", "type": "string" },
      { "internalType": "uint256", "name": "tot", "type": "uint256" },
      { "internalType": "uint256", "name": "r", "type": "uint256" },
      { "internalType": "string", "name": "w", "type": "string" },
      { "internalType": "uint16[]", "name": "arr", "type": "uint16[]" }
    ],
    "name": "setSurprise",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "transferValidator_", "type": "address" }
    ],
    "name": "setTransferValidator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes4", "name": "_i", "type": "bytes4" }],
    "name": "supportsInterface",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalMinted",
    "outputs": [{ "internalType": "uint16", "name": "", "type": "uint16" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];
