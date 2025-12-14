"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Users, Clock, Settings } from "lucide-react";
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

  // Core Fields
  const [name, setName] = useState("");
  const [stake, setStake] = useState("10");
  const [duration, setDuration] = useState("30");
  const [minParticipants, setMinParticipants] = useState("2");

  // Date Fields (Defaults to starting tomorrow)
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 1);
  defaultStart.setMinutes(0, 0, 0); // Round to hour
  const [startTime, setStartTime] = useState(defaultStart.toISOString().slice(0, 16));

  // Advanced Fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [quorum, setQuorum] = useState("50"); // 50%
  const [minVotes, setMinVotes] = useState("1");

  // Helper: Get Unix Timestamp
  const getUnixTime = (dateString: string) => Math.floor(new Date(dateString).getTime() / 1000);

  const createPoolCalls = [
    {
      to: CONTRACT_ADDRESS as `0x${string}`,
      abi: HABIT_POOL_ABI,
      functionName: "createPool",
      args: [
        name,
        BigInt(Number(stake) * 1_000_000), // USDC (6 decimals)
        BigInt(duration),
        BigInt(getUnixTime(startTime)),
        BigInt(getUnixTime(startTime)), // Registration ends exactly when it starts
        BigInt(minParticipants),
        Number(quorum) * 100, // Convert % to BPS (e.g. 50% -> 5000)
        BigInt(minVotes),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-32 text-gray-900">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">New Challenge</h1>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-lg mx-auto">
        
        {/* 1. Goal Name */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
            Habit Name
          </label>
          <input
            type="text"
            placeholder="e.g. Morning Run 🏃"
            className="w-full text-xl font-bold border-b-2 border-gray-200 py-2 focus:border-[#0052FF] outline-none placeholder:text-gray-300 transition-colors bg-transparent"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </section>

        {/* 2. Stake Amount */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide">
            Stake Amount (USDC)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["10", "50", "100"].map((amt) => (
              <button
                key={amt}
                onClick={() => setStake(amt)}
                className={`py-3 rounded-xl border-2 font-bold text-lg transition-all ${
                  stake === amt
                    ? "border-[#0052FF] bg-[#0052FF] text-white shadow-lg shadow-blue-500/30"
                    : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </section>

        {/* 3. Duration & Participants */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-2 uppercase">
              <Calendar size={14} /> Duration (Days)
            </label>
            <input
              type="number"
              className="w-full text-2xl font-bold outline-none bg-transparent"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-2 uppercase">
              <Users size={14} /> Min People
            </label>
            <input
              type="number"
              className="w-full text-2xl font-bold outline-none bg-transparent"
              value={minParticipants}
              onChange={(e) => setMinParticipants(e.target.value)}
            />
          </div>
        </section>

        {/* 4. Start Time */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-3 uppercase">
             <Clock size={14} /> Start Date & Time
          </label>
          <input
            type="datetime-local"
            className="w-full bg-gray-50 p-3 rounded-xl text-lg font-medium outline-none"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-2">
            Registration closes when the challenge starts.
          </p>
        </section>

        {/* 5. Advanced Settings Toggle */}
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-500 font-medium hover:text-[#0052FF] transition-colors"
        >
          <Settings size={16} /> 
          {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
        </button>

        {/* Advanced Settings Area */}
        {showAdvanced && (
          <section className="bg-gray-100 p-5 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Voting Quorum (%)
              </label>
              <input
                type="number"
                value={quorum}
                onChange={(e) => setQuorum(e.target.value)}
                className="w-full bg-white p-2 rounded-lg"
                placeholder="50"
              />
              <p className="text-[10px] text-gray-400 mt-1">Percentage of pool that must vote for a day to verify.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Min Votes Required per User
              </label>
              <input
                type="number"
                value={minVotes}
                onChange={(e) => setMinVotes(e.target.value)}
                className="w-full bg-white p-2 rounded-lg"
                placeholder="1"
              />
              <p className="text-[10px] text-gray-400 mt-1">Users must cast this many votes to qualify for prizes.</p>
            </div>
          </section>
        )}

      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 pb-8">
        <div className="max-w-lg mx-auto">
          {isConnected ? (
            <Transaction
              chainId={84532} // Base Sepolia
              calls={createPoolCalls}
              onStatus={(status) => {
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
              className="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-2xl cursor-not-allowed"
            >
              Connect Wallet First
            </button>
          )}
        </div>
      </div>
    </div>
  );
}