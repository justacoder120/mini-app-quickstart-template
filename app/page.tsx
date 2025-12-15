"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { House, Compass, User, Plus, Moon, Sun } from "lucide-react";
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownLink,
  WalletDropdownBasename,
} from "@coinbase/onchainkit/wallet";
import {
  Identity,
  Avatar,
  Name,
  Address,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import { useReadContract, useReadContracts } from "wagmi";
import { HABIT_POOL_ABI } from "./utils/abi";
import { formatUnits } from "viem";

import { CONTRACT_ADDRESS, CHAIN_ID } from "./utils/contracts";

export default function Home() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  // 1. Get total number of pools
  const { data: poolCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: HABIT_POOL_ABI,
    functionName: "poolCount",
    chainId: CHAIN_ID,
  });



  // 2. Prepare hooks to fetch details for all pools
  // Note: For a hackathon, fetching all is fine. For prod, use pagination/subgraph.
  const count = poolCount ? Number(poolCount) : 0;
  const poolIds = Array.from({ length: count }, (_, i) => i);

  const { data: poolsData } = useReadContracts({
    contracts: poolIds.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: HABIT_POOL_ABI,
      functionName: "getPoolDetails",
      args: [BigInt(id)],
      chainId: CHAIN_ID,
    })),
  });

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div
      className={`min-h-screen flex flex-col pb-24 ${
        isDark ? "bg-[#0A0B0D]" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <header
        className={`px-6 py-4 flex items-center justify-between sticky top-0 z-10 ${
          isDark ? "bg-[#0A0B0D]/80" : "bg-gray-50/80"
        } backdrop-blur-md`}
      >
        {/* LOGO FIX: Added shrinking text for mobile */}
        <h1
          className={`font-bold text-lg sm:text-xl truncate max-w-[120px] sm:max-w-none ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          CommitMint
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              isDark
                ? "bg-[#1A1B1F] text-white"
                : "bg-white text-black shadow-sm"
            }`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="flex items-center">
            <Wallet>
              <ConnectWallet
                className={`h-10 px-4 rounded-full font-medium transition-all ${
                  isDark
                    ? "bg-[#1A1B1F] text-white hover:bg-[#2A2B2F]"
                    : "bg-white text-black shadow-sm hover:bg-gray-100"
                }`}
              >
                <Avatar className="h-6 w-6 mr-2" />
                <Name />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownBasename />
                <WalletDropdownLink
                  icon="wallet"
                  href="https://keys.coinbase.com"
                >
                  Wallet
                </WalletDropdownLink>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-6 pt-4 pb-6">
        <div className="bg-gradient-to-br from-[#0052FF] to-[#0041CC] rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
          <p className="text-sm opacity-90 mb-2 font-medium">Platform Stats</p>
          <p className="text-4xl font-bold mb-3">
            {count} Active Pools
          </p>
          <div className="flex gap-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
            <span>🚀 Live on Base Sepolia</span>
          </div>
        </div>
      </div>

      {/* Main Content: POOL LIST */}
      <div className="px-6 flex-1">
        <h2
          className={`font-bold text-lg mb-4 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Active Pools
        </h2>

        <div className="space-y-3">
          {poolsData?.map((result, index) => {
            if (result.status !== "success") return null;
            const pool = result.result as any; 
            // pool structure: [name, contribution, duration, start, participants, settled]

            return (
              <div
                key={index}
                // NAV FIX: Navigate to specific pool
                onClick={() => router.push(`/pool/${index}`)} 
                className={`rounded-2xl p-4 cursor-pointer transition-all border shadow-sm flex items-center justify-between ${
                  isDark
                    ? "bg-[#1A1B1F] border-[#2A2B2F] hover:border-[#0052FF]"
                    : "bg-white border-white hover:border-[#0052FF] hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100/10 flex items-center justify-center text-2xl">
                    🔥
                  </div>
                  <div>
                    <h3
                      className={`font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {pool[0]} {/* Name */}
                    </h3>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {Number(pool[2])} Days • {Number(pool[4])} Joined
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#0052FF] font-bold">
                    ${formatUnits(pool[1], 6)} {/* USDC has 6 decimals */}
                  </p>
                  <p
                    className={`text-[10px] uppercase tracking-wider ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Entry
                  </p>
                </div>
              </div>
            );
          })}
          
          {count === 0 && (
             <div className="text-center py-10 text-gray-500">
                No pools yet. Be the first to create one!
             </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push("/create")}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#0052FF] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-blue-500/40 transition-all z-20"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Bottom Nav */}
      <nav
        className={`fixed bottom-0 left-0 right-0 pb-6 pt-3 ${
          isDark
            ? "bg-[#1A1B1F]/90 border-t border-[#2A2B2F]"
            : "bg-white/90 border-t border-gray-100"
        } backdrop-blur-lg`}
      >
        <div className="flex items-center justify-around px-6">
          <button 
             onClick={() => router.push('/')}
             className="flex flex-col items-center gap-1 text-[#0052FF]">
            <House size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          
          {/* NAV FIX: Discover Tab */}
          <button
            onClick={() => router.push('/discover')}
            className={`flex flex-col items-center gap-1 ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            <Compass size={24} />
            <span className="text-[10px] font-medium">Discover</span>
          </button>
          
          {/* NAV FIX: Profile Tab */}
          <button
            onClick={() => router.push('/profile')}
            className={`flex flex-col items-center gap-1 ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            <User size={24} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}