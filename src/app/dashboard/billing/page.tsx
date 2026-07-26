"use client";

import { useEffect, useState } from "react";
import { Coins, CheckCircle2, Zap, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Since we can't reliably get the active org ID without the layout context, 
// we will fetch the workspaces and pick the first one, or in a real app, read from context/state.
// For now, we'll fetch the billing status and display plans.

export default function BillingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [billingStatus, setBillingStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null); // plan id
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        // First get workspaces to find an active org
        const wsRes = await fetch("/api/workspace");
        if (wsRes.ok) {
          const { organizations } = await wsRes.json();
          if (organizations && organizations.length > 0) {
            setOrgId(organizations[0].id || organizations[0].orgId);
          }
        }
      } catch (error) {
        console.error("Failed to load orgs", error);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function fetchBilling() {
      if (!orgId) return;
      try {
        const res = await fetch(`/api/billing?orgId=${orgId}`);
        if (res.ok) {
          const data = await res.json();
          setPlans(data.plans || []);
          setBillingStatus(data.billingStatus || null);
        }
      } catch (error) {
        console.error("Failed to fetch billing info", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBilling();
  }, [orgId]);

  const handleSubscribe = async (planId: string) => {
    if (!orgId) return;
    setCheckoutLoading(planId);
    
    try {
      // Simulate dummy checkout delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, planId })
      });
      
      if (res.ok) {
        // Refresh billing status
        const billingRes = await fetch(`/api/billing?orgId=${orgId}`);
        if (billingRes.ok) {
          const data = await billingRes.json();
          setBillingStatus(data.billingStatus);
          alert("Payment Successful! Tokens granted.");
        }
      } else {
        alert("Payment failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Error during checkout.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#E1E0CC] font-sans selection:bg-[#E1E0CC]/30">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#E1E0CC]/50 hover:text-[#E1E0CC] transition-colors mb-12 w-max text-sm uppercase tracking-wider font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="mb-16 md:text-center flex flex-col md:items-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 uppercase drop-shadow-xl">Upgrade Your Plan</h1>
          <p className="text-[#E1E0CC]/70 max-w-2xl text-lg md:text-xl">Scale your content. Automate your brand. Choose the tier that matches your ambition.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {plans.map(plan => {
            const isAutomate = plan.type === "automate_brand";
            const isActive = billingStatus?.subscription?.plan_id === plan.id;
            
            return (
              <div 
                key={plan.id}
                className={`relative p-8 rounded-3xl border transition-all duration-500 hover:-translate-y-2 flex flex-col
                  ${isAutomate 
                    ? 'border-[#DEDBC8]/40 bg-gradient-to-b from-[#DEDBC8]/5 to-black shadow-[0_0_30px_rgba(222,219,200,0.1)]' 
                    : 'border-[#E1E0CC]/10 bg-black hover:border-[#E1E0CC]/30'}
                `}
              >
                {isAutomate && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#DEDBC8] text-black text-[10px] md:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(222,219,200,0.3)]">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4 text-[#E1E0CC]">{plan.name}</h3>
                <div className="flex items-end gap-1.5 mb-8">
                  <span className="text-4xl md:text-5xl font-black text-[#DEDBC8]">,1{plan.price_monthly / 100}</span>
                  <span className="text-[#E1E0CC]/50 text-base md:text-lg mb-1 font-medium">/mo</span>
                </div>
                
                <div className="flex items-center gap-3 mb-8 pb-8 border-b border-[#E1E0CC]/10">
                  <div className="w-10 h-10 rounded-full bg-[#DEDBC8]/10 flex items-center justify-center shrink-0">
                    <Coins className="w-5 h-5 text-[#DEDBC8]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#E1E0CC]/50 uppercase font-bold tracking-widest mb-0.5">Includes</div>
                    <div className="text-sm md:text-base font-bold text-[#E1E0CC]">{plan.token_allowance} Tokens / month</div>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-start gap-3 text-sm md:text-base text-[#E1E0CC]/80">
                    <CheckCircle2 className="w-5 h-5 text-[#DEDBC8] shrink-0 mt-0.5" />
                    <span>{plan.features?.description || "Basic features included"}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm md:text-base text-[#E1E0CC]/80">
                    <CheckCircle2 className="w-5 h-5 text-[#DEDBC8] shrink-0 mt-0.5" />
                    <span>Generate Static Posts</span>
                  </li>
                  {plan.type !== 'free' && (
                    <li className="flex items-start gap-3 text-sm md:text-base text-[#E1E0CC]/80">
                      <CheckCircle2 className="w-5 h-5 text-[#DEDBC8] shrink-0 mt-0.5" />
                      <span>Generate Carousels</span>
                    </li>
                  )}
                  {isAutomate && (
                    <li className="flex items-start gap-3 text-sm md:text-base font-bold text-[#DEDBC8] drop-shadow-sm">
                      <Zap className="w-5 h-5 text-[#DEDBC8] shrink-0 mt-0.5" />
                      <span>End-to-End Brand Automation</span>
                    </li>
                  )}
                </ul>
                
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isActive || checkoutLoading === plan.id}
                  className={`w-full py-4 rounded-full font-black uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2 transition-all duration-300
                    ${isActive 
                      ? 'bg-[#1c1e21] text-[#E1E0CC]/30 border border-[#E1E0CC]/10 cursor-not-allowed' 
                      : isAutomate 
                        ? 'bg-[#DEDBC8] text-black hover:bg-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(222,219,200,0.3)]' 
                        : 'bg-transparent border border-[#E1E0CC]/30 text-[#E1E0CC] hover:bg-[#E1E0CC]/10 hover:border-[#E1E0CC]/50'}`}
                >
                  {checkoutLoading === plan.id ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : isActive ? (
                    'Current Plan'
                  ) : plan.type === 'free' ? (
                    'Get Started'
                  ) : (
                    'Subscribe Now'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
