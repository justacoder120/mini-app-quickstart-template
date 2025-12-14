"use client";
import { useEffect } from "react";
import Image from "next/image";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import { House, Compass, User, Plus, Moon, Sun } from 'lucide-react';
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownLink,
  WalletDropdownBasename,
  WalletDropdownFundLink
} from '@coinbase/onchainkit/wallet';
import {
  Identity,
  Avatar,
  Name,
  Address,
  EthBalance
} from '@coinbase/onchainkit/identity';

interface DashboardProps {
  onCreatePool: () => void;
  onViewPool: (poolId: number) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}
const mockPools = [
  {
    id: 1,
    icon: '🏃‍♂️',
    title: '6AM Run Club',
    day: 4,
    totalDays: 30,
    staked: 50,
    progress: 13
  },
  {
    id: 2,
    icon: '🧘‍♀️',
    title: 'Daily Meditation',
    day: 12,
    totalDays: 30,
    staked: 100,
    progress: 40
  },
  {
    id: 3,
    icon: '📚',
    title: 'Read 30 Minutes',
    day: 8,
    totalDays: 21,
    staked: 25,
    progress: 38
  },
  {
    id: 4,
    icon: '💧',
    title: 'Drink 8 Glasses Water',
    day: 15,
    totalDays: 30,
    staked: 50,
    progress: 50
  }
];


export default function Home({ onCreatePool, onViewPool, isDark, onToggleTheme }: DashboardProps) {
  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <h1 className={isDark ? 'text-white' : 'text-black'}>HabitPool</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-full ${
              isDark ? 'bg-[#1A1B1F] text-white' : 'bg-[#F5F7F9] text-black'
            }`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isDark ? 'bg-[#1A1B1F]' : 'bg-[#F5F7F9]'
          }`}>
            <Wallet>
              <ConnectWallet className={`hover:bg-[#0052FF] border ${
              isDark ? 'bg-[#1A1B1F] text-white' : 'bg-[#F5F7F9] text-black'
            }`}>
              <Avatar className="h-6 w-6 " />
              <Name />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className={`px-4 pt-3 pb-2 ${
              isDark ? 'text-black' : 'text-white'
              }`} hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address className="text-gray-500" />
                <EthBalance />
              </Identity>
              <WalletDropdownBasename />
              <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
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
        <div className="bg-gradient-to-br from-[#0052FF] to-[#0041CC] rounded-3xl p-6 text-white">
          <p className="text-sm opacity-90 mb-2">Your Total Stake</p>
          <p className="text-4xl mb-3">$0 USDC</p>
          <p className="text-sm opacity-90">Potential Winnings: <span className="text-[#00C805]">+$0</span></p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 flex-1">
        <h2 className={isDark ? 'text-white mb-4' : 'text-black mb-4'}>Your Active Pools</h2>
        
        <div className="space-y-3">
          {mockPools.map((pool) => (
            <div
              key={pool.id}
              onClick={() => onViewPool(pool.id)}
              className={`rounded-2xl p-4 cursor-pointer transition-colors shadow-sm ${
                isDark 
                  ? 'bg-[#1A1B1F] border border-[#2A2B2F] hover:border-[#0052FF]'
                  : 'bg-white border border-[#E8EAED] hover:border-[#0052FF]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{pool.icon}</div>
                  <div>
                    <h3 className={isDark ? 'text-white mb-1' : 'text-black mb-1'}>
                      {pool.title}
                    </h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                      isDark ? 'bg-[#2A2B2F] text-[#B0B5BD]' : 'bg-[#F5F7F9] text-[#5D6778]'
                    }`}>
                      Day {pool.day}/{pool.totalDays}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#0052FF]">${pool.staked}</p>
                  <p className={`text-xs ${isDark ? 'text-[#B0B5BD]' : 'text-[#5D6778]'}`}>
                    Staked
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                isDark ? 'bg-[#2A2B2F]' : 'bg-[#F5F7F9]'
              }`}>
                <div 
                  className="h-full bg-[#0052FF] rounded-full transition-all"
                  style={{ width: `${pool.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={onCreatePool}
        className="fixed bottom-24 right-6 w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        <Plus className="text-white" size={28} />
      </button>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 ${
        isDark ? 'bg-[#1A1B1F] border-t border-[#2A2B2F]' : 'bg-white border-t border-[#E8EAED]'
      }`}>
        <div className="max-w-[393px] mx-auto flex items-center justify-around px-6 py-3">
          <button className="flex flex-col items-center gap-1 text-[#0052FF]">
            <House size={24} />
            <span className="text-xs">Home</span>
          </button>
          <button className={`flex flex-col items-center gap-1 ${
            isDark ? 'text-[#B0B5BD]' : 'text-[#5D6778]'
          }`}>
            <Compass size={24} />
            <span className="text-xs">Discover</span>
          </button>
          <button className={`flex flex-col items-center gap-1 ${
            isDark ? 'text-[#B0B5BD]' : 'text-[#5D6778]'
          }`}>
            <User size={24} />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}