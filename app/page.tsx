"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { House, Compass, User, Plus, Moon, Sun, TrendingUp, Users, Clock } from "lucide-react";
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
      className={`min-h-screen flex flex-col pb-24 transition-colors duration-300 ${
        isDark ? "bg-[#0A0B0D] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <header
        className={`px-6 py-4 flex items-center justify-between sticky top-0 z-20 ${
          isDark ? "bg-[#0A0B0D]/80" : "bg-gray-50/80"
        } backdrop-blur-md border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-[#0052FF] rounded-lg flex items-center justify-center text-white font-bold">
             C
           </div>
           <h1 className="font-bold text-xl tracking-tight">CommitMint</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full transition-all ${
              isDark
                ? "bg-[#1A1B1F] text-gray-300 hover:text-white"
                : "bg-white text-gray-600 hover:text-black shadow-sm"
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="flex items-center">
            <Wallet>
              <ConnectWallet
                className={`h-10 px-4 rounded-full font-medium transition-all text-sm ${
                  isDark
                    ? "bg-[#1A1B1F] text-white hover:bg-[#2A2B2F]"
                    : "bg-white text-black shadow-sm hover:bg-gray-100"
                }`}
              >
                <Avatar className="h-5 w-5 mr-2" />
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
      <div className="px-6 py-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0052FF] via-[#0041CC] to-[#002880] rounded-[2rem] p-8 text-white shadow-xl shadow-blue-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-80">
               <TrendingUp size={16} />
               <span className="text-xs font-bold uppercase tracking-wider">Platform Stats</span>
            </div>
            <h2 className="text-5xl font-extrabold mb-4 tracking-tight">
              {count} <span className="text-3xl font-medium opacity-80">Active Pools</span>
            </h2>
            <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 transition-colors w-fit px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                    <span>🚀 Live on Base Sepolia</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors w-fit px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                    <Users size={12} /> <span>Join a community</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: POOL GRID */}
      <div className="px-6 flex-1 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-xl">Explore Pools</h2>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                Recent First
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {poolsData?.map((result, index) => {
            if (result.status !== "success") return null;
            const pool = result.result as any; 
            // pool structure: [name, contribution, duration, start, participants, settled]
            const name = pool[0];
            const contribution = formatUnits(pool[1], 6);
            const duration = Number(pool[2]);
            const joined = Number(pool[4]); // participants count

            return (
              <div
                key={index}
                onClick={() => router.push(`/pool/${index}`)} 
                className={`group relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all border ${
                  isDark
                    ? "bg-[#1A1B1F] border-[#2A2B2F] hover:border-[#0052FF]/50"
                    : "bg-white border-gray-100 hover:border-[#0052FF]/30 hover:shadow-lg hover:shadow-blue-500/5"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                        🔥
                    </div>
                    <div className="bg-[#0052FF]/10 text-[#0052FF] text-xs font-bold px-2.5 py-1 rounded-lg">
                        ${contribution} USDC
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-1 line-clamp-1">{name}</h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        <span>{duration} Days</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Users size={16} />
                        <span>{joined} Joined</span>
                    </div>
                </div>
              </div>
            );
          })}
          
          {count === 0 && (
             <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                    📭
                </div>
                <h3 className="font-bold text-lg mb-2">No pools found</h3>
                <p className="text-gray-500 text-sm">Be the first to create a commitment pool!</p>
             </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push("/create")}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#0052FF] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-110 hover:bg-[#0041CC] transition-all z-20"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Bottom Nav */}
      <nav
        className={`fixed bottom-0 left-0 right-0 pb-6 pt-3 px-6 z-30 ${
          isDark
            ? "bg-[#1A1B1F]/90 border-t border-[#2A2B2F]"
            : "bg-white/90 border-t border-gray-100"
        } backdrop-blur-lg`}
      >
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <button 
             onClick={() => router.push('/')}
             className="flex flex-col items-center gap-1 text-[#0052FF] transition-colors">
            <House size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          
          <button
            onClick={() => router.push('/discover')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Compass size={24} />
            <span className="text-[10px] font-medium">Discover</span>
          </button>
          
          <button
            onClick={() => router.push('/profile')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
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