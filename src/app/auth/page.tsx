"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, AlertCircle, ArrowLeft, Mail, Sparkles } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.push("/dashboard");
        }
      });
    });
  }, [router]);

  const handleOAuthSignIn = async (provider: "google" | "linkedin_oidc") => {
    setSocialLoading(provider);
    setError(null);
    setSuccess(null);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("not enabled") || msg.includes("Unsupported provider") || err.code === "validation_failed") {
        const providerName = provider === "google" ? "Google" : "LinkedIn";
        setError(`${providerName} auth is not enabled in your Supabase project yet.`);
      } else {
        setError(msg || `Failed to sign in with ${provider}.`);
      }
      setSocialLoading(null);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      setSuccess("Magic link sent! Check your email inbox to sign in instantly.");
    } catch (err: any) {
      setError(err.message || "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (useMagicLink) return handleMagicLink(e);

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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        if (data?.user && !data?.session) {
          setSuccess("Account created! Check your email for confirmation link.");
        } else {
          router.push("/dashboard");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-[#101010] rounded-2xl border border-[#E1E0CC]/10 p-8 w-full max-w-md shadow-2xl">
        
        {/* Back link */}
        <a 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-[#E1E0CC]/60 hover:text-[#E1E0CC] transition-colors mb-6 group font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </a>

        {/* Logo */}
        <div className="text-[#E1E0CC] font-bold text-xl text-center mb-6 tracking-tight">
          AUTOMARC
        </div>
        
        {/* Heading & Subtext */}
        <h1 className="text-[#E1E0CC] text-2xl font-medium text-center tracking-tight">
          {isSignUp ? "Create an account" : "Welcome back"}
        </h1>
        <p className="text-[#E1E0CC]/60 text-sm text-center mb-6 font-light">
          {isSignUp 
            ? "Enter your details to register a new workspace." 
            : "Sign in to manage your active marketing DNA."}
        </p>

        {/* OAuth Buttons */}
        <div className="flex flex-col gap-2.5 mb-6">
          <button
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            disabled={loading || socialLoading !== null}
            className="bg-[#212121] border border-[#E1E0CC]/10 text-[#E1E0CC] rounded-xl py-3 w-full flex items-center justify-center gap-2 hover:bg-[#212121]/80 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {socialLoading === "google" ? (
              <span className="animate-spin rounded-full border-2 border-[#E1E0CC]/20 border-t-[#E1E0CC] w-4 h-4" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.0 10.04.0 12s.46 3.8 1.27 5.42l4.01-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthSignIn("linkedin_oidc")}
            disabled={loading || socialLoading !== null}
            className="bg-[#212121] border border-[#E1E0CC]/10 text-[#E1E0CC] rounded-xl py-3 w-full flex items-center justify-center gap-2 hover:bg-[#212121]/80 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {socialLoading === "linkedin_oidc" ? (
              <span className="animate-spin rounded-full border-2 border-[#E1E0CC]/20 border-t-[#E1E0CC] w-4 h-4" />
            ) : (
              <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            )}
            <span>Continue with LinkedIn</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-[#E1E0CC]/10 w-full" />
          <span className="bg-[#101010] px-3 text-[10px] font-mono text-[#E1E0CC]/40 uppercase tracking-widest absolute">
            Or email
          </span>
        </div>

        {/* Mode Switch: Password vs Magic Link */}
        {!isSignUp && (
          <div className="flex bg-[#212121] p-1 rounded-full mb-4 border border-[#E1E0CC]/10">
            <button
              type="button"
              onClick={() => setUseMagicLink(false)}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !useMagicLink ? "bg-[#DEDBC8] text-black" : "text-[#E1E0CC]/60 hover:text-[#E1E0CC]"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setUseMagicLink(true)}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                useMagicLink ? "bg-[#DEDBC8] text-black" : "text-[#E1E0CC]/60 hover:text-[#E1E0CC]"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Magic Link
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          
          {isSignUp && (
            <div className="flex flex-col gap-1">
              <label className="text-[#E1E0CC]/70 text-xs mb-1 block font-medium">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="bg-[#212121] border border-[#E1E0CC]/20 rounded-xl text-[#E1E0CC] placeholder:text-[#E1E0CC]/30 p-3 w-full text-sm focus:border-[#E1E0CC]/50 outline-none"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[#E1E0CC]/70 text-xs mb-1 block font-medium">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="bg-[#212121] border border-[#E1E0CC]/20 rounded-xl text-[#E1E0CC] placeholder:text-[#E1E0CC]/30 p-3 w-full text-sm focus:border-[#E1E0CC]/50 outline-none"
            />
          </div>

          {!useMagicLink && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[#E1E0CC]/70 text-xs mb-1 block font-medium">Password</label>
                {!isSignUp && (
                  <a href="#" className="text-[#DEDBC8] hover:text-[#E1E0CC] text-xs underline-offset-2 hover:underline">Forgot?</a>
                )}
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-[#212121] border border-[#E1E0CC]/20 rounded-xl text-[#E1E0CC] placeholder:text-[#E1E0CC]/30 p-3 w-full text-sm focus:border-[#E1E0CC]/50 outline-none"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 bg-[#E1E0CC]/10/10 border border-[#E1E0CC]/20/20 rounded-xl p-3 text-xs text-[#E1E0CC]/70">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 bg-[#E1E0CC]/10/10 border border-[#E1E0CC]/20/20 rounded-xl p-3 text-xs text-[#E1E0CC]/70">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#DEDBC8] text-black rounded-full py-3 w-full font-medium hover:bg-[#E1E0CC] transition-colors text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full border-2 border-black/20 border-t-black w-4 h-4" />
                Please wait...
              </>
            ) : useMagicLink ? (
              <>
                <Mail className="w-4 h-4" />
                Send Magic Link
              </>
            ) : (
              <>
                {isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-xs text-[#E1E0CC]/60 mt-6">
          {isSignUp ? "Already registered? " : "New workspace? "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setUseMagicLink(false);
              setError(null);
              setSuccess(null);
            }}
            disabled={loading}
            className="text-[#DEDBC8] hover:text-[#E1E0CC] font-medium underline-offset-2 hover:underline cursor-pointer"
          >
            {isSignUp ? "Sign In" : "Register"}
          </button>
        </p>

      </div>
    </div>
  );
}
