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

// ⚠️ REPLACE WITH YOUR ADDRESS
const CONTRACT_ADDRESS = "0x0f916eD1e51b8952263a8A310797715fF7Fb85C5";

export default function CreatePool() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [name, setName] = useState("");
  const [stake, setStake] = useState("10");

  const createPoolCalls = [
    {
      to: CONTRACT_ADDRESS as `0x${string}`,
      abi: HABIT_POOL_ABI,
      functionName: "createPool",
      args: [
        name,
        BigInt(Number(stake) * 1000000), // Convert to USDC decimals (6)
        BigInt(30), // Duration
        BigInt(Math.floor(Date.now() / 1000) + 60), // Start in 1 min
        BigInt(Math.floor(Date.now() / 1000) + 60), // Reg ends in 1 min
        BigInt(2), // Min contributors
        1000, // Quorum
        BigInt(1), // Min votes
      ],
    },
  ];

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
              console.log("Status:", status); // Optional: helpful for debugging
              // FIX: Use 'statusName' instead of 'status' and check for 'success' (lowercase)
              if (status.statusName === "success") {
                setTimeout(() => router.push("/"), 2000);
              }
            }}
          >
            <TransactionButton
              className="w-full bg-[#0052FF] hover:bg-[#0041CC] text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
              text={`Stake $${stake} & Create`}
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
