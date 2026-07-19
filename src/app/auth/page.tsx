"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Check, AlertCircle } from "lucide-react";
import Logo from "@/components/Logo";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const { supabase } = await import("@/lib/supabase");

      if (isSignUp) {
        // Sign up flow
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          // Instantly logged in
          setSuccess("Account created successfully!");
          router.push("/onboarding");
          router.refresh();
        } else {
          setSuccess("Verification email sent! Please check your inbox.");
        }
      } else {
        // Login flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        setSuccess("Signed in successfully!");
        
        // Check if user already has brand DNA
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: dna } = await supabase
            .from("brand_dna")
            .select("id")
            .limit(1);

          if (dna && dna.length > 0) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col lg:flex-row font-sans">
      
      {/* ── Left Side: Brand Visual Panel ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900/50 via-gray-950 to-[#090D16] border-r border-gray-800/40">
        
        {/* Subtle grid backdrop */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />
        
        {/* Top Logo */}
        <div className="flex items-center gap-3">
          <Logo className="w-6 h-6 text-white" />
          <span className="font-bold tracking-tight text-[16px]">Automarc</span>
        </div>

        {/* Mid Quote */}
        <div className="max-w-[480px] z-10">
          <h2 className="text-[32px] font-bold tracking-tight leading-tight bg-gradient-to-br from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-6">
            The next generation autonomous marketing operating system.
          </h2>
          <p className="text-gray-400 text-[15px] leading-relaxed">
            Automarc ingests your brand values, builds a tailor-made 30-day marketing roadmap, design systems, post templates, and carousels on autopilot.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-xs text-gray-500 z-10 flex gap-6">
          <span>© 2026 Automarc Inc.</span>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>

      {/* ── Right Side: Auth Form Box ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-24 bg-[#090D16] relative">
        
        {/* Mobile Logo display */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <Logo className="w-6 h-6 text-white" />
          <span className="font-bold tracking-tight text-[16px]">Automarc</span>
        </div>

        <div className="w-full max-w-[380px] flex flex-col">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              {isSignUp ? "Create an account" : "Sign in to Automarc"}
            </h1>
            <p className="text-gray-400 text-sm">
              {isSignUp 
                ? "Get started with your 14-day free trial." 
                : "Enter your credentials to access your dashboard."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="bg-gray-900/60 border border-gray-800 focus:border-brand-primary/60 outline-none rounded-lg px-3.5 py-2.5 text-sm transition-colors text-white placeholder-gray-600"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-gray-900/60 border border-gray-800 focus:border-brand-primary/60 outline-none rounded-lg px-3.5 py-2.5 text-sm transition-colors text-white placeholder-gray-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                {!isSignUp && (
                  <a href="#" className="text-xs text-brand-primary hover:underline">Forgot password?</a>
                )}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-gray-900/60 border border-gray-800 focus:border-brand-primary/60 outline-none rounded-lg px-3.5 py-2.5 text-sm transition-colors text-white placeholder-gray-600"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-950/40 border border-red-900/50 rounded-lg p-3 text-xs text-red-400 animate-fade-up">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/50 rounded-lg p-3 text-xs text-emerald-400 animate-fade-up">
                <Check className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-150 text-gray-950 font-semibold text-sm rounded-lg py-2.5 transition-all mt-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {isSignUp ? "Get Started" : "Continue"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {isSignUp ? "Already have an account? " : "New to Automarc? "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              disabled={loading}
              className="text-white hover:underline font-medium"
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </button>
          </p>

        </div>
      </div>

    </div>
  );
}
