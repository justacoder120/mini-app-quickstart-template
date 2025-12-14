export const HABIT_POOL_ABI = [
  {
    inputs: [
      { name: "_name", type: "string" },
      { name: "_contributionAmount", type: "uint256" },
      { name: "_durationInDays", type: "uint256" },
      { name: "_startTime", type: "uint256" },
      { name: "_registrationEndTime", type: "uint256" },
      { name: "_minContributors", type: "uint256" },
      { name: "_quorumBps", type: "uint16" },
      { name: "_minVotesRequired", type: "uint256" }
    ],
    name: "createPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_poolId", type: "uint256" }],
    name: "joinPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_poolId", type: "uint256" }, { name: "_videoHash", type: "string" }],
    name: "submitProof",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "_poolId", type: "uint256" },
      { name: "_day", type: "uint256" },
      { name: "_targetUser", type: "address" },
      { name: "_approve", type: "bool" }
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_poolId", type: "uint256" }],
    name: "getPoolState",
    outputs: [
      { name: "settled", type: "bool" },
      { name: "canceled", type: "bool" },
      { name: "refundState", type: "bool" },
      { name: "rewardPerWinner", type: "uint256" },
      { name: "participants", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
   {
    inputs: [],
    name: "poolCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;