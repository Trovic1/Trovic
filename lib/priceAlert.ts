import { avalancheFuji } from "viem/chains";

export const priceAlertAbi = [
  {
    type: "event",
    name: "AlertCreated",
    inputs: [
      { indexed: true, name: "alertId", type: "uint256" },
      { indexed: true, name: "owner", type: "address" },
      { indexed: false, name: "symbol", type: "string" },
      { indexed: false, name: "targetPriceUsd", type: "uint256" },
      { indexed: false, name: "isAbove", type: "bool" }
    ]
  },
  {
    type: "event",
    name: "AlertDeactivated",
    inputs: [
      { indexed: true, name: "alertId", type: "uint256" },
      { indexed: true, name: "owner", type: "address" }
    ]
  },
  {
    type: "function",
    name: "createAlert",
    stateMutability: "nonpayable",
    inputs: [
      { name: "symbol", type: "string" },
      { name: "targetPriceUsd", type: "uint256" },
      { name: "isAbove", type: "bool" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "deactivateAlert",
    stateMutability: "nonpayable",
    inputs: [{ name: "alertId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "getAlertsByOwner",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "owner", type: "address" },
          { name: "symbol", type: "string" },
          { name: "targetPriceUsd", type: "uint256" },
          { name: "isAbove", type: "bool" },
          { name: "createdAt", type: "uint256" },
          { name: "active", type: "bool" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "alerts",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "owner", type: "address" },
      { name: "symbol", type: "string" },
      { name: "targetPriceUsd", type: "uint256" },
      { name: "isAbove", type: "bool" },
      { name: "createdAt", type: "uint256" },
      { name: "active", type: "bool" }
    ]
  }
] as const;

export const defaultChain = avalancheFuji;
