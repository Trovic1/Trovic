export const LAND_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "tileData",
    stateMutability: "view",
    inputs: [{ name: "tileId", type: "uint256" }],
    outputs: [
      { name: "power", type: "uint64" },
      { name: "productionRate", type: "uint64" },
      { name: "lastClaimedAt", type: "uint64" },
    ],
  },
  {
    type: "function",
    name: "claimResources",
    stateMutability: "nonpayable",
    inputs: [{ name: "tileId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "attack",
    stateMutability: "nonpayable",
    inputs: [
      { name: "attackerTileId", type: "uint256" },
      { name: "defenderTileId", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export const RESOURCE_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
