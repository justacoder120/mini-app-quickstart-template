"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Compass } from "lucide-react";

export default function DiscoverPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
       <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Discover Pools</h1>
      </div>

      <div className="text-center py-20 text-gray-400">
        <Compass size={48} className="mx-auto mb-4 opacity-50" />
        <p>Explore new habits and challenges coming soon.</p>
        <button 
            onClick={() => router.push('/')}
            className="mt-4 text-blue-600 font-bold hover:underline"
        >
            View Active Pools
        </button>
      </div>
    </div>
  );
}