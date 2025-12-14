"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from "@coinbase/onchainkit/transaction";
import { HABIT_POOL_ABI } from "../utils/abi";
import { useAccount } from "wagmi";

// ✅ FIXED: Your Real Contract Address
const CONTRACT_ADDRESS = "0x2b767c9602Af0C0e12A3fE45f5bFeDBFCB693C4E" as `0x${string}`;

export default function CreatePool() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [name, setName] = useState("");
  const [stake, setStake] = useState("10");

  // Helper to ensure timestamps are fresh
  const getTimestamps = () => {
    const now = Math.floor(Date.now() / 1000);
    return {
        start: BigInt(now + 300), // Start in 5 mins (Safe buffer)
        end: BigInt(now + 300)    // Reg ends same time
    }
  };

  const createPoolCalls = [
    {
      to: CONTRACT_ADDRESS,
      abi: HABIT_POOL_ABI,
      functionName: "createPool",
      args: [
        name || "New Habit",           // Fallback name
        BigInt(Number(stake) * 1000000), // USDC (6 decimals)
        BigInt(30),                    // Duration (30 days)
        getTimestamps().start,         // Start Time
        getTimestamps().end,           // Reg End Time
        BigInt(2),                     // Min Contributors
        1000,                          // Quorum (10%)
        BigInt(1),                     // Min Votes
      ],
    },
  ];

  const handleSuccess = () => {
    console.log("Pool created successfully!");
    // Force a hard refresh to clear cache
    setTimeout(() => {
        window.location.href = "/";
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white p-6 pb-24 text-black">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">New Challenge</h1>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wide">
            Goal Name
          </label>
          <input
            type="text"
            placeholder="e.g. Daily Meditation"
            className="w-full text-2xl font-bold border-b-2 border-gray-200 py-2 focus:border-[#0052FF] outline-none placeholder:text-gray-300 transition-colors"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-4 uppercase tracking-wide">
            Stake Amount
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["10", "50", "100"].map((amt) => (
              <button
                key={amt}
                onClick={() => setStake(amt)}
                className={`py-4 rounded-xl border-2 font-bold text-lg transition-all ${
                  stake === amt
                    ? "border-[#0052FF] bg-[#0052FF] text-white shadow-lg shadow-blue-500/30"
                    : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-6 right-6">
        {isConnected ? (
          <Transaction
            chainId={84532} // Base Sepolia
            calls={createPoolCalls}
            onStatus={(status) => {
              console.log("Tx Status:", status);
              if (status.statusName === "success") {
                handleSuccess();
              }
            }}
          >
            <TransactionButton
              className="w-full bg-[#0052FF] hover:bg-[#0041CC] text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
              text={name ? `Stake $${stake} & Create` : "Enter Name First"}
              disabled={!name} // Prevent empty clicks
            />
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
          </Transaction>
        ) : (
          <button
            disabled
            className="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-2xl"
          >
            Connect Wallet First
          </button>
        )}
      </div>
    </div>
  );
}