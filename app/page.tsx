"use client";
import { useState } from "react";
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
import { useReadContract } from "wagmi";
import { HABIT_POOL_ABI } from "./utils/abi";

// ⚠️ REPLACE THIS WITH YOUR NEW BASE SEPOLIA ADDRESS
const CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";

export default function Home() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  // Read total pools from contract
  const { data: poolCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: HABIT_POOL_ABI,
    functionName: "poolCount",
  });

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div
      className={`min-h-screen flex flex-col pb-20 ${
        isDark ? "bg-[#0A0B0D]" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <header
        className={`px-6 py-4 flex items-center justify-between sticky top-0 z-10 ${
          isDark ? "bg-[#0A0B0D]/80" : "bg-gray-50/80"
        } backdrop-blur-md`}
      >
        <h1
          className={`font-bold text-xl ${
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
            {poolCount ? poolCount.toString() : "0"} Active Pools
          </p>
          <div className="flex gap-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
            <span>🚀 Live on Base Sepolia</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 flex-1">
        <h2
          className={`font-bold text-lg mb-4 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Recommended Pools
        </h2>

        {/* Mock Data for visual - You would fetch this from subgraph in production */}
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
          <button className="flex flex-col items-center gap-1 text-[#0052FF]">
            <House size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button
            className={`flex flex-col items-center gap-1 ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            <Compass size={24} />
            <span className="text-[10px] font-medium">Discover</span>
          </button>
          <button
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
