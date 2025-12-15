"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { HABIT_POOL_ABI, ERC20_ABI } from "../../utils/abi";
import { formatUnits } from "viem";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from "@coinbase/onchainkit/transaction";

import { CONTRACT_ADDRESS, CHAIN_ID, USDC_ADDRESS } from "../../utils/contracts";

export default function PoolDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); // Unrap params in Next.js 15+
  const { address, isConnected } = useAccount();
  const [videoLink, setVideoLink] = useState("");

  const poolId = BigInt(id);

  // 1. Fetch Pool Details
  const { data: poolDetails, refetch: refetchPool } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: HABIT_POOL_ABI,
    functionName: "getPoolDetails",
    args: [poolId],
  });

  // 2. Fetch User Progress (to see if joined)
  const { data: userProgress, refetch: refetchProgress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: HABIT_POOL_ABI,
    functionName: "getUserProgress",
    args: [poolId, address as `0x${string}`],
  });

  // 3. Fetch User Allowance for USDC
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, CONTRACT_ADDRESS],
    query: {
        enabled: !!address,
    }
  });

  // poolDetails format: [name, amount, duration, start, participants, settled]
  const poolName = poolDetails ? (poolDetails as any)[0] : "Loading...";
  const rawStakeAmount = poolDetails ? (poolDetails as any)[1] : BigInt(0);
  const stakeAmount = poolDetails ? formatUnits(rawStakeAmount, 6) : "0";
  // The contract returns [verifiedDays, votesCast, withdrawn]. 
  // If user has joined, the struct would be initialized, but specifically 'hasJoined' check isn't directly exposed 
  // via getUserProgress unless checking non-zero values or using the mapping directly (which we don't have here).
  // However, relying on the fact that if they joined, they likely have a progress entry or we can rely on joinPool to revert if already joined.
  // A better check would be reading 'hasJoined' mapping if exposed or just checking if participation > 0 (if logic supports).
  // For this template, let's assume if they have progress or verify logic, they are joined. 
  // Or since we don't have 'hasJoined' exposed, we rely on the Join button state.
  // Actually, joinPool reverts if joined.
  
  // NOTE: Simple UI check - if allowance is sufficient, show join. 
  // Ideally we would know if they joined to hide the button. 
  // Let's assume userProgress is enough proxy if implemented, otherwise we just show buttons.
  
  const isAllowanceSufficient = allowance ? allowance >= rawStakeAmount : false;


  // Transaction to APPROVE
  const approveCalls = [
    {
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, rawStakeAmount],
    }
  ];

  // Transaction to JOIN
  const joinPoolCalls = [
    {
      address: CONTRACT_ADDRESS,
      abi: HABIT_POOL_ABI,
      functionName: "joinPool",
      args: [poolId],
    },
  ];

  // Transaction to SUBMIT PROOF
  const submitProofCalls = [
    {
      address: CONTRACT_ADDRESS,
      abi: HABIT_POOL_ABI,
      functionName: "submitProof",
      args: [poolId, videoLink],
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-24 text-black">
      {/* Header */}
      <div className="p-6 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold truncate">{poolName}</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Card */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold">Stake</p>
              <p className="text-3xl font-bold text-[#0052FF]">${stakeAmount}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 uppercase font-bold">Pool ID</p>
              <p className="text-xl font-bold">#{id}</p>
            </div>
          </div>
          <div className="flex gap-2 text-sm text-gray-500 bg-white p-3 rounded-lg">
             <Clock size={18} />
             <span>Ends in {(poolDetails as any)?.[2]?.toString() || "?"} Days</span>
          </div>
        </div>

        {/* Action Area */}
        {!isConnected ? (
           <div className="text-center py-10 text-gray-400">Please connect wallet</div>
        ) : (
          <>
            <div className="space-y-4">
               <h3 className="font-bold">Actions</h3>
               
               {/* 
                   Two-Step Join Flow:
                   1. Approve USDC (if allowance < stake)
                   2. Join Pool
               */}
               
               {!isAllowanceSufficient ? (
                 <Transaction
                   chainId={CHAIN_ID}
                   calls={approveCalls}
                   onStatus={(status) => {
                       if (status.statusName === 'success') {
                           // Trigger re-fetch of allowance
                           refetchAllowance();
                       }
                   }}
                 >
                   <TransactionButton className="w-full bg-[#0052FF] text-white font-bold py-3 rounded-xl" text={`Approve $${stakeAmount} USDC`} />
                   <TransactionStatus><TransactionStatusLabel /><TransactionStatusAction /></TransactionStatus>
                 </Transaction>
               ) : (
                 <Transaction
                   chainId={CHAIN_ID}
                   calls={joinPoolCalls}
                   onStatus={(status) => {
                       if (status.statusName === 'success') {
                           refetchProgress();
                           refetchPool();
                       }
                   }}
                 >
                   <TransactionButton className="w-full bg-black text-white font-bold py-3 rounded-xl" text="Join Pool" />
                   <TransactionStatus><TransactionStatusLabel /><TransactionStatusAction /></TransactionStatus>
                 </Transaction>
               )}

               {/* CHECK IN BUTTON */}
               <div className="pt-6 border-t">
                 <h3 className="font-bold mb-2">Daily Check-in</h3>
                 <input 
                    type="text" 
                    placeholder="Paste video/photo URL proof..."
                    className="w-full p-3 border rounded-xl mb-3"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                 />
                 <Transaction
                   chainId={CHAIN_ID}
                   calls={submitProofCalls}
                 >
                   <TransactionButton className="w-full bg-[#0052FF] text-white font-bold py-3 rounded-xl" text="Submit Proof" />
                   <TransactionStatus><TransactionStatusLabel /><TransactionStatusAction /></TransactionStatus>
                 </Transaction>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}