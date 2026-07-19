"use client";

import { useState } from "react";
import { Loader2, ArrowRight, Check, AlertCircle } from "lucide-react";

export default function AuthPage() {
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

        // Auto login attempt right after signup
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signInError && signInData.session) {
          setSuccess("Account created and logged in successfully!");
          window.location.href = "/dashboard";
        } else if (data.session) {
          setSuccess("Account created successfully!");
          window.location.href = "/dashboard";
        } else {
          setSuccess("Account created! Verification email sent if required.");
        }
      } else {
        // Login flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        setSuccess("Signed in successfully!");
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col lg:flex-row font-sans selection:bg-gray-100">
      
      {/* ── Left Side: Monochromatic Visual Panel ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative overflow-hidden bg-gray-50 border-r border-gray-150">
        
        {/* Subtle grid backdrop */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #000000 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />
        
        {/* Top Logo */}
        <div className="flex items-center gap-3 z-10">
          <span className="font-bold tracking-[0.25em] text-xs text-gray-900 uppercase">AUTOMARC</span>
        </div>

        {/* Mid Quote */}
        <div className="max-w-[440px] z-10 my-auto flex flex-col gap-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
            AUTOMARC AUTOMATION
          </span>
          <h2 className="text-4xl font-medium tracking-tight leading-[1.1] text-gray-900">
            Where vision meets autonomous brand design.
          </h2>
          <p className="text-gray-500 font-light text-sm leading-relaxed">
            Sign in to access your dashboard, edit your copywriting assets, launch new marketing strategies, and preview your media streams.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider z-10 flex gap-6">
          <span>© 2026 AUTOMARC INC.</span>
          <a href="#" className="hover:text-black transition-colors">Privacy</a>
          <a href="#" className="hover:text-black transition-colors">Terms</a>
        </div>
      </div>

      {/* ── Right Side: Pure White Form Box ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-16 bg-white relative">
        
        {/* Mobile Logo display */}
        <div className="lg:hidden flex flex-col items-center gap-2 mb-12">
          <span className="font-bold tracking-[0.25em] text-xs text-gray-900 uppercase">AUTOMARC</span>
        </div>

        <div className="w-full max-w-[340px] flex flex-col">
          
          {/* Header */}
          <div className="mb-8 flex flex-col gap-2">
            <h1 className="text-2xl font-medium tracking-tight text-gray-900">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-gray-400 text-xs">
              {isSignUp 
                ? "Enter your details to register a new workspace." 
                : "Sign in to manage your active marketing DNA."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="bg-white border border-gray-200 focus:border-gray-900 outline-none rounded-full px-4 py-3 text-xs transition-all text-gray-900 placeholder-gray-300"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-white border border-gray-200 focus:border-gray-900 outline-none rounded-full px-4 py-3 text-xs transition-all text-gray-900 placeholder-gray-300"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                {!isSignUp && (
                  <a href="#" className="text-[9px] font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">Forgot?</a>
                )}
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-white border border-gray-200 focus:border-gray-900 outline-none rounded-full px-4 py-3 text-xs transition-all text-gray-900 placeholder-gray-300"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-150 rounded-2xl p-3 text-xs text-red-500 animate-fade-up">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-150 rounded-2xl p-3 text-xs text-green-500 animate-fade-up">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-gray-800 text-white rounded-full py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all mt-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-xs text-gray-400 mt-6 uppercase tracking-wider">
            {isSignUp ? "Already registered? " : "New workspace? "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              disabled={loading}
              className="text-gray-900 hover:opacity-70 font-bold transition-opacity"
            >
              {isSignUp ? "Sign In" : "Register"}
            </button>
          </p>

        </div>
      </div>

    </div>
  );
}
