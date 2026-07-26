"use client";

import { useEffect, useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import Link from "next/link";

interface TokenCounterProps {
  orgId: string;
}

export default function TokenCounter({ orgId }: TokenCounterProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    
    async function fetchTokens() {
      try {
        const res = await fetch(`/api/billing?orgId=${orgId}`);
        if (res.ok) {
          const data = await res.json();
          setBalance(data.billingStatus?.wallet?.balance || 0);
        }
      } catch (error) {
        console.error("Failed to fetch token balance", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTokens();
    
    // Set up polling to keep it updated when generating
    const interval = setInterval(fetchTokens, 15000);
    return () => clearInterval(interval);
  }, [orgId]);

  return (
    <Link href="/dashboard/billing">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1c1e21] border border-[#E1E0CC]/10 hover:border-[#E1E0CC]/30 transition-all cursor-pointer rounded-lg shadow-none">
        <Coins className="w-4 h-4 text-[#E1E0CC]" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[#828282] leading-none tracking-[0.1em] mb-0.5">Tokens</span>
          <span className="text-xs font-bold text-[#ffffff] leading-none">
            {loading ? <Loader2 className="w-3 h-3 animate-spin text-[#828282]" /> : balance?.toLocaleString() ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
