"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Trophy, Vote } from "lucide-react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { HABIT_POOL_ABI } from "../utils/abi";
import { Identity, Avatar, Name, Address } from "@coinbase/onchainkit/identity";

const CONTRACT_ADDRESS = "0x06879e7d3271659D1C50428998F7ef07ad525BF4";

export default function ProfilePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  // Fetch stats for a specific pool (e.g., Pool ID 0 for MVP)
  // In a real app, you'd loop through all pools the user joined
  const { data: userProgress } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: HABIT_POOL_ABI,
    functionName: "getUserProgress",
    args: [BigInt(0), address as `0x${string}`], // Hardcoded Pool 0 for demo
    query: {
        enabled: !!address
    }
  });

  // userProgress returns: [verifiedDays, votesCast, withdrawn]

  if (!isConnected) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <p>Please connect your wallet to view your profile.</p>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">My Profile</h1>
        </div>

        {/* Identity Card */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <User size={32} />
            </div>
            <div>
                <Identity schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9">
                    <Name className="font-bold text-lg" />
                    <Address className="text-gray-500 text-sm" />
                </Identity>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-blue-500 mb-2"><Trophy size={24} /></div>
            <p className="text-sm text-gray-500">Verified Days</p>
            <p className="text-2xl font-bold">
                {userProgress ? userProgress[0].toString() : "0"}
            </p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-purple-500 mb-2"><Vote size={24} /></div>
            <p className="text-sm text-gray-500">Votes Cast</p>
            <p className="text-2xl font-bold">
                {userProgress ? userProgress[1].toString() : "0"}
            </p>
        </div>
      </div>

      <div className="px-6">
        <h2 className="font-bold text-lg mb-4">Activity History</h2>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-400 py-10">
            No recent history found.
        </div>
      </div>
    </div>
  );
}