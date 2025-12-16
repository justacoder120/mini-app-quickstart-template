"use client";
import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, CheckCircle, XCircle, Clock, Trophy, ShieldCheck, Activity } from "lucide-react";
import { useAccount, useReadContract, useReadContracts, useWriteContract } from "wagmi";
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
  const { id } = use(params);
  const { address, isConnected } = useAccount();
  const [videoLink, setVideoLink] = useState("");

  const poolId = BigInt(id);

  // 1. Fetch Pool Details
  const { data: poolDetails, error: poolError, refetch: refetchPool } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: HABIT_POOL_ABI,
    functionName: "getPoolDetails",
    args: [poolId],
    chainId: CHAIN_ID,
  });

  if (poolError) {
      console.error("Error fetching pool details:", poolError);
  }

  // 2. Fetch User Progress (to see if joined)
  const { data: userProgress, error: progressError, isLoading: progressLoading, refetch: refetchProgress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: HABIT_POOL_ABI,
    functionName: "getUserProgress",
    args: [poolId, address as `0x${string}`],
    chainId: CHAIN_ID,
  });

  if (progressError) {
    console.error("Error fetching user progress (Likely ABI mismatch if contract not redeployed):", progressError);
  }

  // 3. Fetch User Allowance for USDC
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, CONTRACT_ADDRESS],
    chainId: CHAIN_ID,
    query: {
        enabled: !!address,
    }
  });
  
  // 4. Fetch Participants (for voting)
  const { data: participants } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: HABIT_POOL_ABI,
    functionName: "getParticipants",
    args: [poolId],
    chainId: CHAIN_ID,
  });

  // Calculate Current Day (Simple approximation based on start time)
  // detailed logic would match contract _currentDay
  const startTime = poolDetails ? Number((poolDetails as any)[3]) : 0;
  const currentTime = Math.floor(Date.now() / 1000);
  const currentDay = startTime > 0 && currentTime >= startTime 
    ? Math.floor((currentTime - startTime) / 86400) 
    : 0;

  // 5. Fetch Submissions for ALL participants for the Current Day
  const { data: submissions } = useReadContracts({
    contracts: participants?.map((participant) => ({
        address: CONTRACT_ADDRESS,
        abi: HABIT_POOL_ABI,
        functionName: "getSubmission",
        args: [poolId, BigInt(currentDay), participant],
        chainId: CHAIN_ID, 
    })) || [],
    query: {
        enabled: !!participants && participants.length > 0,
    }
  });

  // Data Parsing
  // poolDetails format: [name, amount, duration, start, participants, settled]
  const poolName = poolDetails ? (poolDetails as any)[0] : "Loading...";
  const rawStakeAmount = poolDetails ? (poolDetails as any)[1] : BigInt(0);
  const stakeAmount = poolDetails ? formatUnits(rawStakeAmount, 6) : "0";
  const durationDays = poolDetails ? Number((poolDetails as any)[2]) : 0;
  const participantsCount = poolDetails ? Number((poolDetails as any)[4]) : 0;

  // userProgress format: [verifiedDays, votesCast, withdrawn, hasJoined]
  console.log("DEBUG: userProgress raw:", userProgress);
  let hasJoined = false;
  if (userProgress) {
      if (Array.isArray(userProgress)) {
          hasJoined = userProgress[3];
      } else {
          // It might be an object if strict mode/abitype is enabled
          hasJoined = (userProgress as any).hasJoined;
      }
  }
  console.log("DEBUG: hasJoined value:", hasJoined);
  
  const isAllowanceSufficient = allowance ? allowance >= rawStakeAmount : false;


  // Construct Batch Calls for Joining
  const joinCalls = useMemo(() => {
    const calls: any[] = [];
    
    // 1. Add Approval if needed
    if (!isAllowanceSufficient && rawStakeAmount > BigInt(0)) {
        calls.push({
            address: USDC_ADDRESS,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACT_ADDRESS, rawStakeAmount],
        });
    }

    // 2. Add Join Call
    calls.push({
      address: CONTRACT_ADDRESS,
      abi: HABIT_POOL_ABI,
      functionName: "joinPool",
      args: [poolId],
    });

    return calls;
  }, [isAllowanceSufficient, rawStakeAmount, poolId]);

  // Submit Proof Call
  const submitProofCalls = [
    {
      address: CONTRACT_ADDRESS,
      abi: HABIT_POOL_ABI,
      functionName: "submitProof",
      args: [poolId, videoLink],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 font-sans">
      {/* Immersive Header */}
      <div className="relative bg-[#0A0B0D] text-white pt-8 pb-12 rounded-b-[2.5rem] shadow-2xl overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

         <div className="relative z-10 px-6">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all">
                <ArrowLeft size={20} />
                </button>
                <div className="text-sm font-medium opacity-60 uppercase tracking-widest">Pool Details</div>
            </div>

            <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0052FF] to-[#0041CC] rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg shadow-blue-500/20">
                    🔥
                </div>
                <h1 className="text-3xl font-bold mb-2">{poolName}</h1>
                <div className="flex items-center gap-2 mb-6">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold border border-white/5 flex items-center gap-1">
                        <User size={12}/> {participantsCount} Participants
                    </span>
                    <span className="px-3 py-1 bg-[#0052FF]/20 text-[#0052FF] rounded-full text-xs font-bold border border-[#0052FF]/20">
                        Active
                    </span>
                </div>
            </div>
         </div>
      </div>

      <div className="px-6 -mt-8 relative z-20 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Stake Amount</p>
                <p className="text-2xl font-black text-[#0052FF]">${stakeAmount}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Duration</p>
                <p className="text-2xl font-black">{durationDays} Days</p>
            </div>
        </div>

        {/* Action Area */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
           {!isConnected ? (
              <div className="text-center py-8">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <User size={32} />
                 </div>
                 <p className="text-gray-500 mb-4">Connect wallet to join this challenge</p>
              </div>
           ) : (
              <>
                 {/* Loading/Error States */}
                 {progressLoading && (
                     <div className="text-center py-8 text-gray-400 animate-pulse">
                         Checking status...
                     </div>
                 )}
                 
                 {progressError && (
                     <div className="text-center py-4 text-red-500 bg-red-50 rounded-xl mb-4 border border-red-100 px-4">
                         <p className="font-bold text-sm">Error checking join status.</p>
                         <p className="text-xs mt-1 opacity-80 mb-2">Make sure you are on Base Sepolia and the contract is deployed.</p>
                         <p className="text-[10px] font-mono bg-red-100 p-2 rounded text-left overflow-auto max-h-20">
                            {progressError.message || JSON.stringify(progressError)}
                         </p>
                     </div>
                 )}

                 {!progressLoading && !hasJoined && !progressError && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                           <ShieldCheck className="text-[#0052FF] flex-shrink-0" size={24} />
                           <div>
                              <h3 className="font-bold text-[#0052FF] text-sm mb-1">Join Challenge</h3>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                 Commit ${stakeAmount} USDC to join. If you verify your habit daily, you'll earn your stake back + rewards!
                              </p>
                           </div>
                        </div>

                        <Transaction
                            chainId={CHAIN_ID}
                            calls={joinCalls}
                            onStatus={(status) => {
                                if (status.statusName === 'success') {
                                    refetchAllowance();
                                    refetchProgress();
                                    refetchPool();
                                }
                            }}
                        >
                            <TransactionButton 
                                className="w-full bg-[#0052FF] hover:bg-[#0041CC] text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-blue-500/20 transition-all" 
                                text={isAllowanceSufficient ? "Join Pool Now" : "Approve & Join Pool"} 
                            />
                            <TransactionStatus>
                                <TransactionStatusLabel />
                                <TransactionStatusAction />
                            </TransactionStatus>
                        </Transaction>
                    </div>
                 )}

                  {!progressLoading && hasJoined && (
                    <div className="space-y-8">
                        {/* Daily Check-in Section */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                           <h3 className="font-bold mb-3 flex items-center gap-2 text-lg">
                              <Activity size={20} className="text-[#0052FF]" />
                              Daily Check-in
                           </h3>
                           <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Paste video/photo URL proof..."
                                    className="w-full p-4 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] transition-all bg-gray-50"
                                    value={videoLink}
                                    onChange={(e) => setVideoLink(e.target.value)}
                                />
                           </div>
                           <Transaction
                              chainId={CHAIN_ID}
                              calls={submitProofCalls}
                           >
                              <TransactionButton 
                                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-all" 
                                  text="Submit Proof" 
                              />
                              <TransactionStatus>
                                  <TransactionStatusLabel />
                                  <TransactionStatusAction />
                              </TransactionStatus>
                           </Transaction>
                        </div>

                        {/* Voting Section */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                                <ShieldCheck size={20} className="text-purple-600" />
                                Community Voting (Day {currentDay + 1})
                            </h3>
                            
                            {submissions && participants && participants.length > 0 ? (
                                <div className="space-y-4">
                                    {participants.map((participant, idx) => {
                                        if (participant === address) return null; // Don't vote on self
                                        
                                        const submissionResult = submissions[idx];
                                        const submission = submissionResult.status === "success" ? (submissionResult.result as any) : null;
                                        // submission struct: [videoHash, timestamp, yesVotes, noVotes, isVerified]
                                        const videoHash = submission ? submission[0] : "";
                                        const isVerified = submission ? submission[4] : false;

                                        if (!videoHash) return null; // Skip if no submission

                                        return (
                                            <div key={participant} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-100 text-gray-500">
                                                        {participant.slice(0, 6)}...{participant.slice(-4)}
                                                    </span>
                                                    {isVerified && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Verified</span>}
                                                </div>
                                                <a href={videoHash} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline mb-3 block truncate">
                                                    📹 View Proof
                                                </a>
                                                
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Transaction
                                                        chainId={CHAIN_ID}
                                                        calls={[{
                                                            address: CONTRACT_ADDRESS,
                                                            abi: HABIT_POOL_ABI,
                                                            functionName: "vote",
                                                            args: [poolId, BigInt(currentDay), participant, true]
                                                        }]}
                                                    >
                                                        <TransactionButton className="w-full py-2 bg-green-100 text-green-700 hover:bg-green-200 font-bold rounded-lg text-sm" text="👍 Approve" />
                                                    </Transaction>

                                                    <Transaction
                                                        chainId={CHAIN_ID}
                                                        calls={[{
                                                            address: CONTRACT_ADDRESS,
                                                            abi: HABIT_POOL_ABI,
                                                            functionName: "vote",
                                                            args: [poolId, BigInt(currentDay), participant, false]
                                                        }]}
                                                    >
                                                        <TransactionButton className="w-full py-2 bg-red-100 text-red-700 hover:bg-red-200 font-bold rounded-lg text-sm" text="👎 Reject" />
                                                    </Transaction>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(!submissions.some((s: any) => s.result && s.result[0])) && (
                                        <p className="text-center text-gray-500 text-sm italic py-4">No submissions to vote on yet today.</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 text-sm">Loading participants...</p>
                            )}
                        </div>

                        {/* Admin / Settlement Zone */}
                        <div className="bg-gray-900 p-5 rounded-2xl text-white shadow-lg">
                             <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
                                <Trophy size={20} className="text-yellow-400" />
                                Pool Status
                            </h3>
                            
                            {(poolDetails as any)?.[5] ? ( // isSettled
                                <div className="space-y-3">
                                    <div className="p-3 bg-white/10 rounded-xl text-center">
                                        <p className="text-yellow-400 font-bold uppercase tracking-widest text-xs mb-1">Status</p>
                                        <p className="text-xl font-bold">Settled</p>
                                    </div>
                                    <Transaction
                                        chainId={CHAIN_ID}
                                        calls={[{
                                            address: CONTRACT_ADDRESS,
                                            abi: HABIT_POOL_ABI,
                                            functionName: "withdrawReward",
                                            args: [poolId]
                                        }]}
                                    >
                                        <TransactionButton className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl" text="Claim Funds" />
                                        <TransactionStatus>
                                            <TransactionStatusLabel />
                                            <TransactionStatusAction />
                                        </TransactionStatus>
                                    </Transaction>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                   <div className="flex justify-between items-center text-sm mb-2 opacity-80">
                                      <span>Time Remaining</span>
                                      <span>{Math.max(0, durationDays - currentDay)} Days</span>
                                   </div>
                                   {/* Show Settle button if duration passed */}
                                   {(currentDay >= durationDays) && (
                                       <Transaction
                                            chainId={CHAIN_ID}
                                            calls={[{
                                                address: CONTRACT_ADDRESS,
                                                abi: HABIT_POOL_ABI,
                                                functionName: "processPoolResults",
                                                args: [poolId]
                                            }]}
                                       >
                                            <TransactionButton className="w-full py-3 bg-white text-black hover:bg-gray-200 font-bold rounded-xl" text="Settle Pool" />
                                       </Transaction>
                                   )}
                                </div>
                            )}
                        </div>
                    </div>
                  )}
              </>
           )}
        </div>
      </div>
    </div>
  );
}