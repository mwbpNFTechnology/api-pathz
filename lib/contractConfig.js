export const multiversePortalContractAddress = '0xe4d66ce3E77de53241e2877DFd4a94533ED4d65d';

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
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "string", "name": "_treePath", "type": "string" }],
      "name": "checkPathStoryOfTreePath",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
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
      "inputs": [{ "internalType": "uint16[]", "name": "_pathzIDs", "type": "uint16[]" }],
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
      "inputs": [{ "internalType": "uint16", "name": "_pathStoryNumber", "type": "uint16" }],
      "name": "getLastCharacterTraitsHistoryCID",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint16", "name": "_pathStoryNumber", "type": "uint16" }],
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
      "inputs": [{ "internalType": "uint16", "name": "_pathzID", "type": "uint16" }],
      "name": "getOwnerOfPathz",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint16[]", "name": "_pathzIDs", "type": "uint16[]" }],
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
      "inputs": [{ "internalType": "string", "name": "choosedLetter", "type": "string" }],
      "name": "isValidLetter",
      "outputs": [
        { "internalType": "bool", "name": "", "type": "bool" },
        { "internalType": "string", "name": "", "type": "string" }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "string", "name": "treePath", "type": "string" }],
      "name": "isValidTreePath",
      "outputs": [
        { "internalType": "bool", "name": "", "type": "bool" },
        { "internalType": "string", "name": "", "type": "string" }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "string", "name": "choosedLetter", "type": "string" }],
      "name": "pathzChoosePath",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "bool", "name": "_redeemRandomNumbers", "type": "bool" }],
      "name": "pausePathStory",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  
  export const PathzNFTContractAddress = '0xAafeEbcF06A5FeD8a95Da6c478E560A418390a6d';

  export const PathzNFTContractAbi = [
    {
        "inputs": [
          { "internalType": "string", "name": "baseURI_", "type": "string" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "CreatorTokenBase__InvalidTransferValidatorContract",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ShouldNotMintToBurnAddress",
        "type": "error"
      },
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
        "inputs": [],
        "name": "CREATOR_RESERVE",
        "outputs": [
          { "internalType": "uint8", "name": "", "type": "uint8" }
        ],
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
        "outputs": [
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          { "internalType": "string", "name": "", "type": "string" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pathzMultiversePortalContractAddress",
        "outputs": [
          { "internalType": "address", "name": "", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint16", "name": "s", "type": "uint16" },
          { "internalType": "uint16", "name": "z", "type": "uint16" }
        ],
        "name": "setAnsweredPathStory",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    